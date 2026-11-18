import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Field } from "../Field/Field";
import { Input } from "../Input/Input";
import { Radio, RadioGroup } from "../RadioGroup/RadioGroup";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { Form, FormErrorSummary, type FormAction, type FormErrors } from "./Form";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function SignUp({ action, errors, validate }: { action?: FormAction; errors?: FormErrors; validate?: (data: FormData) => FormErrors }) {
  return (
    <Form action={action} errors={errors} validate={validate} aria-label="Đăng ký">
      <FormErrorSummary />
      <Field label="Họ tên" required>
        <Input name="name" />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" />
      </Field>
      <Field label="Mật khẩu" hint="Ít nhất 8 ký tự.">
        <Input name="password" type="password" minLength={8} />
      </Field>
      <Button type="submit">Tạo tài khoản</Button>
    </Form>
  );
}

const input = (name: RegExp) => screen.getByRole("textbox", { name });
const password = () => document.querySelector<HTMLInputElement>('input[name="password"]')!;

describe("Form", () => {
  it("kiểm tra ràng buộc trước action: lỗi theo name trong Field, focus ô lỗi đầu tiên, action không chạy", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<SignUp action={action} />);
    await user.type(input(/Email/), "khong-phai-email");
    await user.type(password(), "ngan");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(action).not.toHaveBeenCalled();
    const name = input(/Họ tên/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Hãy điền mục này.");
    expect(input(/Email/)).toHaveAccessibleDescription("Nhập địa chỉ email, ví dụ ten@example.com.");
    expect(password()).toHaveAccessibleDescription("Nhập ít nhất 8 ký tự (hiện có 4). Ít nhất 8 ký tự.");
    await waitFor(() => expect(name).toHaveFocus());
    // Trình duyệt không tự hiện bong bóng lỗi.
    expect(screen.getByRole("form", { name: "Đăng ký" })).toHaveAttribute("novalidate");
  });

  it("FormErrorSummary: tiêu đề, nhãn + lỗi theo thứ tự form, link focus control, đọc cho trình đọc màn hình", async () => {
    const user = userEvent.setup();
    render(<SignUp action={vi.fn()} />);
    expect(screen.queryByRole("group", { name: /lỗi/ })).not.toBeInTheDocument();
    await user.type(input(/Email/), "x");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    const summary = screen.getByRole("group", { name: "Có 2 lỗi cần sửa" });
    const links = Array.from(summary.querySelectorAll("a"));
    expect(links.map((a) => a.textContent)).toEqual(["Họ tên: Hãy điền mục này.", "Email: Nhập địa chỉ email, ví dụ ten@example.com."]);
    expect(links[1]).toHaveAttribute("href", `#${input(/Email/).id}`);
    await user.click(links[1]);
    expect(input(/Email/)).toHaveFocus();
    const live = document.querySelector('[data-yugen-live-region="polite"]');
    await waitFor(() => expect(live).toHaveTextContent("Có 2 lỗi cần sửa. Họ tên: Hãy điền mục này. Email: Nhập địa chỉ email"));
  });

  it("sau lần gửi đầu, sửa ô nào kiểm tra lại ô đó khi gõ", async () => {
    const user = userEvent.setup();
    render(<SignUp action={vi.fn()} />);
    const name = input(/Họ tên/);
    // Chưa gửi: gõ rồi xoá không báo lỗi.
    await user.type(name, "a");
    await user.clear(name);
    expect(name).not.toHaveAttribute("aria-invalid");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(name).toHaveAttribute("aria-invalid", "true");
    await user.type(name, "An");
    expect(name).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("group", { name: /lỗi/ })).not.toBeInTheDocument();
  });

  it("lỗi action trả về hiện theo name, giữ giá trị đã nhập, nút gửi loading trong lúc chờ", async () => {
    const user = userEvent.setup();
    const reply = deferred<{ errors: FormErrors }>();
    const action = vi.fn<FormAction>(() => reply.promise);
    render(<SignUp action={action} />);
    await user.type(input(/Họ tên/), "An");
    await user.type(input(/Email/), "an@example.com");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(action).toHaveBeenCalledTimes(1);
    expect(action.mock.calls[0][0].get("email")).toBe("an@example.com");
    const submit = screen.getByRole("button", { name: "Tạo tài khoản" });
    await waitFor(() => expect(submit).toHaveAttribute("aria-busy", "true"));
    await act(async () => reply.resolve({ errors: { email: ["Email đã có tài khoản.", "bỏ qua"], form: "Thử lại sau." } }));

    await waitFor(() => expect(input(/Email/)).toHaveAccessibleDescription("Email đã có tài khoản."));
    expect(submit).not.toHaveAttribute("aria-busy");
    // React đặt lại form sau action; có lỗi thì Form giữ chữ người dùng đã nhập.
    expect(input(/Email/)).toHaveValue("an@example.com");
    expect(input(/Họ tên/)).toHaveValue("An");
    await waitFor(() => expect(input(/Email/)).toHaveFocus());
    // Lỗi không gắn với control: trong tóm tắt, không có link.
    const summary = screen.getByRole("group", { name: "Có 2 lỗi cần sửa" });
    expect(summary.querySelectorAll("a")).toHaveLength(1);
    expect(summary).toHaveTextContent("Thử lại sau.");
    // Lỗi cũ của action ẩn khi người dùng sửa ô đó.
    await user.type(input(/Email/), "m");
    expect(input(/Email/)).not.toHaveAttribute("aria-invalid");
  });

  it("action không lỗi: React đặt lại form như bình thường", async () => {
    const user = userEvent.setup();
    const action = vi.fn<FormAction>(async () => {});
    render(<SignUp action={action} />);
    await user.type(input(/Họ tên/), "An");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    await waitFor(() => expect(action).toHaveBeenCalled());
    await waitFor(() => expect(input(/Họ tên/)).toHaveValue(""));
    expect(screen.queryByRole("group", { name: /lỗi/ })).not.toBeInTheDocument();
  });

  it("prop errors (useActionState): hiện theo name, ẩn khi control đổi, hiện lại khi lỗi mới về", async () => {
    const user = userEvent.setup();
    function WithState() {
      const [state, formAction] = React.useActionState(
        async (_prev: { errors?: FormErrors }, formData: FormData): Promise<{ errors?: FormErrors }> => ({
          errors: { name: `"${formData.get("name")}" đã có.` },
        }),
        {},
      );
      return (
        <Form action={formAction} errors={state.errors}>
          <Field label="Tên">
            <Input name="name" />
          </Field>
          <Button type="submit">Lưu</Button>
        </Form>
      );
    }
    render(<WithState />);
    const name = input(/Tên/);
    await user.type(name, "a");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(name).toHaveAccessibleDescription('"a" đã có.'));
    expect(name).toHaveValue("a");
    await user.type(name, "b");
    expect(name).not.toHaveAttribute("aria-invalid");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(name).toHaveAccessibleDescription('"ab" đã có.'));
  });

  it("validate: lỗi riêng thắng thông báo ràng buộc, kiểm tra chéo giữa các ô", async () => {
    const user = userEvent.setup();
    const validate = (data: FormData) => ({
      name: data.get("name") ? null : "Nhập tên của bạn.",
      password: data.get("password") === "12345678" ? "Mật khẩu quá dễ đoán." : null,
    });
    render(<SignUp action={vi.fn()} validate={validate} />);
    await user.type(password(), "12345678");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(input(/Họ tên/)).toHaveAccessibleDescription("Nhập tên của bạn.");
    expect(password()).toHaveAccessibleDescription("Mật khẩu quá dễ đoán. Ít nhất 8 ký tự.");
  });

  it("thông báo cho từng ràng buộc: maxLength, min / max, url, pattern, step, setCustomValidity", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field label="Mã">
          <Input name="code" maxLength={3} defaultValue="abcd" />
        </Field>
        <Field label="Số lượng">
          <Input name="qty" type="number" min={1} max={5} step={1} />
        </Field>
        <Field label="Trang web">
          <Input name="site" type="url" />
        </Field>
        <Field label="Mã bưu chính">
          <Input name="zip" pattern="[0-9]{5}" />
        </Field>
        <Field label="Biệt danh">
          <Input name="nick" ref={(el) => el?.setCustomValidity("Biệt danh đã có.")} />
        </Field>
        <Button type="submit">Gửi</Button>
      </Form>,
    );
    const qty = screen.getByRole("spinbutton", { name: "Số lượng" });
    await user.type(qty, "9");
    await user.type(input(/Trang web/), "khong-phai-url");
    await user.type(input(/Mã bưu chính/), "12");
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(input(/^Mã$/)).toHaveAccessibleDescription("Nhập tối đa 3 ký tự (hiện có 4).");
    expect(qty).toHaveAccessibleDescription("Nhập giá trị không quá 5.");
    expect(input(/Trang web/)).toHaveAccessibleDescription("Nhập địa chỉ URL, ví dụ https://example.com.");
    expect(input(/Mã bưu chính/)).toHaveAccessibleDescription("Nhập đúng định dạng được yêu cầu.");
    expect(input(/Biệt danh/)).toHaveAccessibleDescription("Biệt danh đã có.");
    await user.clear(qty);
    await user.type(qty, "0");
    expect(qty).toHaveAccessibleDescription("Nhập giá trị từ 1 trở lên.");
    await user.clear(qty);
    await user.type(qty, "1.5");
    expect(qty).toHaveAccessibleDescription("Giá trị không hợp lệ.");
  });

  it("nút reset của người dùng xoá lỗi", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field label="Tên" required>
          <Input name="name" />
        </Field>
        <Button type="submit">Lưu</Button>
        <Button type="reset">Nhập lại</Button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(input(/Tên/)).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button", { name: "Nhập lại" }));
    expect(input(/Tên/)).not.toHaveAttribute("aria-invalid");
  });

  it("Field không label (Checkbox tự có nhãn): tóm tắt lấy nhãn của control; Field có validationState riêng thì giữ", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <FormErrorSummary title="Kiểm tra lại" />
        <Field>
          <Checkbox name="terms" required label="Tôi đồng ý điều khoản" />
        </Field>
        <Field label="Mã" validationState="warning" validationMessage="Tuỳ chọn">
          <Input name="code" required />
        </Field>
        <Button type="submit">Gửi</Button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = screen.getByRole("group", { name: "Kiểm tra lại" });
    await waitFor(() =>
      expect(Array.from(summary.querySelectorAll("li"), (li) => li.textContent)).toEqual([
        "Tôi đồng ý điều khoản: Hãy đánh dấu ô này để tiếp tục.",
        "Mã: Hãy điền mục này.",
      ]),
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: /Mã/ })).not.toHaveAttribute("aria-invalid");
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByRole("textbox", { name: /Mã/ }), "1");
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Field name: đọc lỗi của control render-prop và truyền name xuống control", async () => {
    const user = userEvent.setup();
    render(
      <Form errors={{ plan: "Chọn một gói." }}>
        <Field label="Gói" name="plan">
          {(props) => <input {...props} />}
        </Field>
      </Form>,
    );
    const plan = screen.getByRole("textbox", { name: "Gói" });
    expect(plan).toHaveAttribute("name", "plan");
    expect(plan).toHaveAccessibleDescription("Chọn một gói.");
    await user.type(plan, "pro");
    expect(plan).not.toHaveAttribute("aria-invalid");
  });

  it("nhóm radio: Field quanh RadioGroup focus radio đầu tiên; radio không có Field: link tới radio, nhãn từ <label>", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <FormErrorSummary />
        <Field label="Gói" required>
          <RadioGroup name="plan">
            <Radio value="free" label="Miễn phí" />
            <Radio value="pro" label="Pro" />
          </RadioGroup>
        </Field>
        <label>
          <input type="radio" name="color" value="red" required /> Đỏ
        </label>
        <label>
          <input type="radio" name="color" value="blue" /> Xanh
        </label>
        <Button type="submit">Gửi</Button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(screen.getByRole("radio", { name: "Miễn phí" })).toHaveFocus());
    const summary = screen.getByRole("group", { name: "Có 2 lỗi cần sửa" });
    await waitFor(() =>
      expect(Array.from(summary.querySelectorAll("li"), (li) => li.textContent)).toEqual(["Gói: Hãy chọn một mục.", "Đỏ: Hãy chọn một mục."]),
    );
    await user.click(screen.getByRole("radio", { name: "Xanh" }));
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.queryByRole("group", { name: /lỗi/ })).not.toBeInTheDocument();
  });

  it("hai Field cùng name: gỡ Field cũ không xoá đăng ký của Field mới", async () => {
    const user = userEvent.setup();
    function Swap({ second }: { second: boolean }) {
      return (
        <Form errors={{ code: "Mã sai." }}>
          <FormErrorSummary />
          {!second && (
            <Field label="Mã cũ">
              <Input name="code" />
            </Field>
          )}
          <Field label="Mã mới">
            <Input name="code" />
          </Field>
        </Form>
      );
    }
    const { rerender } = render(<Swap second={false} />);
    rerender(<Swap second />);
    const link = await screen.findByRole("link", { name: "Mã mới: Mã sai." });
    await user.click(link);
    expect(screen.getByRole("textbox", { name: /Mã mới/ })).toHaveFocus();
  });

  it("chuỗi mặc định tiếng Anh; không axe vi phạm khi đang báo lỗi", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <YugenProvider messages={messagesEn} locale="en-US">
        <SignUp action={vi.fn()} />
      </YugenProvider>,
    );
    fireEvent.change(password(), { target: { value: "abc" } });
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(screen.getByRole("group", { name: "There are 2 problems" })).toBeInTheDocument();
    expect(password()).toHaveAccessibleDescription("Use at least 8 characters (now 3). Ít nhất 8 ký tự.");
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
