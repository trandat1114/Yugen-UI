import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Questionnaire,
  formatQuestionAnswer,
  validateQuestion,
  type Question,
  type QuestionnaireAnswers,
  questionnaireMessagesEn,
} from "./Questionnaire";
import { YugenProvider } from "../YugenProvider/YugenProvider";

/* ================================================================ validateQuestion */

const single: Question = {
  id: "fw",
  type: "single",
  title: "Framework",
  required: true,
  options: [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
  ],
};
const multiple: Question = {
  id: "features",
  type: "multiple",
  title: "Tính năng",
  required: true,
  min: 2,
  max: 3,
  options: ["a", "b", "c", "d"].map((v) => ({ value: v, label: v.toUpperCase() })),
};
const rating: Question = { id: "score", type: "rating", title: "Điểm", required: true };
const scale: Question = { id: "nps", type: "scale", title: "NPS", required: true };
const text: Question = { id: "name", type: "text", title: "Tên", required: true };
const longText: Question = { id: "note", type: "longText", title: "Ghi chú", required: true };
const yesNo: Question = { id: "ok", type: "yesNo", title: "Đồng ý?", required: true };

describe("validateQuestion", () => {
  it.each<[string, Question, string]>([
    ["single", single, "Vui lòng chọn một câu trả lời."],
    ["multiple", multiple, "Vui lòng chọn một câu trả lời."],
    ["yesNo", yesNo, "Vui lòng chọn một câu trả lời."],
    ["rating", rating, "Vui lòng chọn một mức điểm."],
    ["scale", scale, "Vui lòng chọn một mức điểm."],
    ["text", text, "Vui lòng nhập câu trả lời."],
    ["longText", longText, "Vui lòng nhập câu trả lời."],
  ])("required + chưa trả lời (%s)", (_type, question, message) => {
    expect(validateQuestion(question, {})).toBe(message);
  });

  it("chuỗi chỉ có khoảng trắng và mảng rỗng tính là chưa trả lời", () => {
    expect(validateQuestion(text, { name: "   " })).toBe("Vui lòng nhập câu trả lời.");
    expect(validateQuestion(longText, { note: "\n\t" })).toBe("Vui lòng nhập câu trả lời.");
    expect(validateQuestion(multiple, { features: [] })).toBe("Vui lòng chọn một câu trả lời.");
  });

  it("0 và false là câu trả lời hợp lệ (không phải rỗng)", () => {
    expect(validateQuestion(scale, { nps: 0 })).toBeUndefined();
    expect(validateQuestion(yesNo, { ok: false })).toBeUndefined();
  });

  it("không required + chưa trả lời → hợp lệ (kể cả có min)", () => {
    const optional = { ...multiple, required: false };
    expect(validateQuestion(optional, {})).toBeUndefined();
    expect(validateQuestion(optional, { features: [] })).toBeUndefined();
    expect(validateQuestion({ ...text, required: false }, { name: "" })).toBeUndefined();
  });

  it("multiple: min / max", () => {
    expect(validateQuestion(multiple, { features: ["a"] })).toBe("Chọn ít nhất 2 mục.");
    expect(validateQuestion(multiple, { features: ["a", "b"] })).toBeUndefined();
    expect(validateQuestion(multiple, { features: ["a", "b", "c"] })).toBeUndefined();
    expect(validateQuestion(multiple, { features: ["a", "b", "c", "d"] })).toBe("Chọn tối đa 3 mục.");
    // Câu không required nhưng đã trả lời vẫn phải đạt min.
    expect(validateQuestion({ ...multiple, required: false }, { features: ["a"] })).toBe("Chọn ít nhất 2 mục.");
  });

  it("validate tuỳ chỉnh chỉ chạy khi đã có câu trả lời, nhận value + toàn bộ answers", () => {
    const validate = vi.fn((value: string, answers: QuestionnaireAnswers) =>
      value.includes("@") ? null : `Email "${value}" không hợp lệ (${String(answers.fw)})`,
    );
    const email: Question = { id: "email", type: "text", title: "Email", validate };
    expect(validateQuestion(email, {})).toBeUndefined();
    expect(validate).not.toHaveBeenCalled();

    expect(validateQuestion(email, { email: "abc", fw: "react" })).toBe('Email "abc" không hợp lệ (react)');
    expect(validate).toHaveBeenLastCalledWith("abc", { email: "abc", fw: "react" });
    // null → undefined.
    expect(validateQuestion(email, { email: "a@b.c" })).toBeUndefined();
  });

  it("validate chạy sau min/max (lỗi min được ưu tiên)", () => {
    const validate = vi.fn(() => "lỗi tuỳ chỉnh");
    const q: Question = { ...multiple, validate };
    expect(validateQuestion(q, { features: ["a"] })).toBe("Chọn ít nhất 2 mục.");
    expect(validate).not.toHaveBeenCalled();
    expect(validateQuestion(q, { features: ["a", "b"] })).toBe("lỗi tuỳ chỉnh");
  });
});

describe("formatQuestionAnswer", () => {
  it("chưa trả lời", () => {
    expect(formatQuestionAnswer(text, undefined)).toBe("Chưa trả lời");
    expect(formatQuestionAnswer(text, "  ")).toBe("Chưa trả lời");
    expect(formatQuestionAnswer(multiple, [])).toBe("Chưa trả lời");
  });

  it("single / multiple dùng nhãn, giữ value khi không tìm thấy option", () => {
    expect(formatQuestionAnswer(single, "vue")).toBe("Vue");
    expect(formatQuestionAnswer(single, "svelte")).toBe("svelte");
    expect(formatQuestionAnswer(multiple, ["a", "c", "z"])).toBe("A, C, z");
  });

  it("rating / scale theo max", () => {
    expect(formatQuestionAnswer(rating, 4)).toBe("4/5 sao");
    expect(formatQuestionAnswer({ ...rating, max: 10 }, 7)).toBe("7/10 sao");
    expect(formatQuestionAnswer(scale, 0)).toBe("0/10");
    expect(formatQuestionAnswer({ ...scale, max: 5 }, 3)).toBe("3/5");
  });

  it("yesNo dùng nhãn tuỳ chỉnh nếu có", () => {
    expect(formatQuestionAnswer(yesNo, true)).toBe("Có");
    expect(formatQuestionAnswer(yesNo, false)).toBe("Không");
    const custom: Question = { ...yesNo, yesLabel: "Đồng ý", noLabel: "Từ chối" };
    expect(formatQuestionAnswer(custom, true)).toBe("Đồng ý");
    expect(formatQuestionAnswer(custom, false)).toBe("Từ chối");
  });

  it("text / longText giữ nguyên", () => {
    expect(formatQuestionAnswer(text, "Đạt")).toBe("Đạt");
    expect(formatQuestionAnswer(longText, "dòng 1\ndòng 2")).toBe("dòng 1\ndòng 2");
  });
});

/* ================================================================ Tương tác (stepper) */

const SURVEY: Question[] = [
  {
    id: "fw",
    type: "single",
    title: "Bạn dùng framework nào?",
    required: true,
    options: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
    ],
  },
  {
    id: "features",
    type: "multiple",
    title: "Tính năng cần nhất",
    max: 2,
    options: [
      { value: "a", label: "Theme" },
      { value: "b", label: "RTL" },
      { value: "c", label: "Chart" },
    ],
  },
  { id: "score", type: "rating", title: "Chấm điểm", required: true },
  { id: "refer", type: "yesNo", title: "Giới thiệu cho bạn bè?" },
  {
    id: "email",
    type: "text",
    title: "Email",
    required: true,
    validate: (v) => (v.includes("@") ? null : "Email không hợp lệ."),
  },
];

const progressText = () => screen.getByText(/^(Câu \d+\/\d+|Xem lại)$/, { selector: "span" }).textContent;

describe("Questionnaire — stepper + bàn phím", () => {
  it("required chặn qua câu; phím số chọn; Enter tiếp; xem lại; gửi đúng payload", { timeout: 15_000 }, async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Questionnaire title="Khảo sát" questions={SURVEY} onSubmit={onSubmit} />);

    expect(progressText()).toBe("Câu 1/5");

    // Chưa chọn → báo lỗi, không qua câu, focus vào control.
    await user.click(screen.getByRole("button", { name: "Tiếp" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng chọn một câu trả lời.");
    expect(progressText()).toBe("Câu 1/5");
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
    expect(document.activeElement).toHaveAttribute("role", "radio");

    // Phím số 2 → Vue; lỗi tự hết.
    await user.keyboard("2");
    expect(screen.getByRole("radio", { name: /Vue/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Enter → câu 2, focus chuyển vào câu mới.
    await user.keyboard("{Enter}");
    expect(progressText()).toBe("Câu 2/5");
    await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "checkbox"));

    // Multiple, max 2: 1 và 3 chọn được, 2 bị chặn.
    await user.keyboard("13");
    expect(screen.getByRole("checkbox", { name: /Theme/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /Chart/ })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("2");
    expect(screen.getByRole("checkbox", { name: /RTL/ })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /RTL/ })).toBeDisabled();
    expect(screen.getByText("Đã chọn 2/2")).toBeInTheDocument();
    // Bấm lại phím 3 → bỏ chọn.
    await user.keyboard("3");
    expect(screen.getByRole("checkbox", { name: /Chart/ })).toHaveAttribute("aria-checked", "false");
    await user.keyboard("3");
    await user.keyboard("{Enter}");

    // Rating: phím 4.
    expect(progressText()).toBe("Câu 3/5");
    await waitFor(() => expect(document.activeElement?.tagName).toBe("INPUT"));
    await user.keyboard("4");
    expect(screen.getByRole("radio", { name: "4 sao" })).toBeChecked();
    // Phím ngoài thang (9) bị bỏ qua.
    await user.keyboard("9");
    expect(screen.getByRole("radio", { name: "4 sao" })).toBeChecked();
    await user.keyboard("{Enter}");

    // Yes/No: phím Y.
    expect(progressText()).toBe("Câu 4/5");
    await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "radio"));
    await user.keyboard("y");
    expect(screen.getByRole("radio", { name: /Có/ })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");

    // Text: phím số / chữ gõ vào ô (không bị bắt), Enter chạy validate tuỳ chỉnh.
    expect(progressText()).toBe("Câu 5/5");
    const input = await screen.findByRole("textbox");
    await waitFor(() => expect(input).toHaveFocus());
    await user.keyboard("an1y");
    expect(input).toHaveValue("an1y");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Email không hợp lệ.");
    expect(progressText()).toBe("Câu 5/5");
    await user.keyboard("@yugen.dev{Enter}");

    // Bước xem lại.
    expect(progressText()).toBe("Xem lại");
    const heading = screen.getByRole("heading", { name: "Xem lại câu trả lời" });
    await waitFor(() => expect(heading).toHaveFocus());
    const list = screen.getAllByRole("term")[0].closest("dl") as HTMLElement;
    const review = within(list);
    expect(review.getByText("Vue")).toBeInTheDocument();
    expect(review.getByText("Theme, Chart")).toBeInTheDocument();
    expect(review.getByText("4/5 sao")).toBeInTheDocument();
    expect(review.getByText("Có")).toBeInTheDocument();
    expect(review.getByText("an1y@yugen.dev")).toBeInTheDocument();
    // Enter ở bước xem lại không gửi.
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      fw: "vue",
      features: ["a", "c"],
      score: 4,
      refer: true,
      email: "an1y@yugen.dev",
    });
    expect(await screen.findByText("Cảm ơn bạn!")).toBeInTheDocument();
  });

  it("nút Sửa ở bước xem lại quay về đúng câu", async () => {
    const user = userEvent.setup();
    render(
      <Questionnaire
        questions={SURVEY}
        defaultValue={{ fw: "react", score: 5, email: "a@b.c" }}
      />,
    );
    // Câu không required có thể bỏ qua bằng Enter (focus vào control trước).
    await user.click(screen.getByRole("radio", { name: /React/ }));
    for (let i = 0; i < 5; i++) await user.click(screen.getByRole("button", { name: /^(Tiếp|Xem lại)$/ }));
    expect(progressText()).toBe("Xem lại");
    expect(screen.getAllByText("Chưa trả lời")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Sửa câu 3: Chấm điểm" }));
    expect(progressText()).toBe("Câu 3/5");
    expect(screen.getByRole("radio", { name: "5 sao" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(progressText()).toBe("Câu 2/5");
  });

  it("onSubmit lỗi → báo lỗi, ở lại bước xem lại", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("500"));
    render(
      <Questionnaire
        questions={[{ id: "q", type: "yesNo", title: "OK?" }]}
        defaultValue={{ q: false }}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Xem lại" }));
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không gửi được câu trả lời. Vui lòng thử lại.");
    expect(progressText()).toBe("Xem lại");
  });

  it("review=false: Enter ở câu cuối gửi luôn, không qua bước xem lại", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Questionnaire
        review={false}
        questions={[{ id: "q", type: "scale", title: "NPS", required: true, min: 0, max: 10 }]}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "0" }));
    await user.keyboard("7");
    expect(screen.getByRole("radio", { name: "7" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith({ q: 7 });
    expect(await screen.findByText("Cảm ơn bạn!")).toBeInTheDocument();
  });

  it("controlled: onChange nhận answers + id câu", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Questionnaire questions={SURVEY.slice(0, 1)} value={{}} onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /Svelte/ }));
    expect(onChange).toHaveBeenLastCalledWith({ fw: "svelte" }, "fw");
    // Controlled, cha không cập nhật value → không đổi.
    expect(screen.getByRole("radio", { name: /Svelte/ })).toHaveAttribute("aria-checked", "false");
  });
});

describe("Questionnaire — chế độ list", () => {
  it("hiện mọi câu; bấm Xem lại khi thiếu → báo lỗi từng câu", async () => {
    const user = userEvent.setup();
    render(<Questionnaire mode="list" questions={SURVEY.slice(0, 3)} />);
    expect(screen.getByText("1. Bạn dùng framework nào?")).toBeInTheDocument();
    expect(screen.getByText("3. Chấm điểm")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xem lại" }));
    expect(await screen.findByText("Vui lòng chọn một câu trả lời.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn một mức điểm.")).toBeInTheDocument();
    expect(screen.queryByText("Xem lại câu trả lời")).not.toBeInTheDocument();
  });
});

describe("Questionnaire messages", () => {
  it("helper nhận messages; component dùng messages.questionnaire", () => {
    const q = { id: "name", type: "text", title: "Name", required: true } as const;
    expect(validateQuestion(q, {}, questionnaireMessagesEn)).toBe("Enter an answer.");
    expect(formatQuestionAnswer({ id: "ok", type: "yesNo", title: "OK" }, true, questionnaireMessagesEn)).toBe("Yes");
    render(
      <YugenProvider messages={{ questionnaire: questionnaireMessagesEn }}>
        <Questionnaire questions={[q]} />
      </YugenProvider>,
    );
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });
});
