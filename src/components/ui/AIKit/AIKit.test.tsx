import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { markdownToPlainText, parseMarkdown, sanitizeHref, type MdBlock, type MdInline } from "./markdown";
import { StreamingMarkdown } from "./StreamingMarkdown";
import { PromptInput, formatFileSize, validateFiles } from "./PromptInput";
import { formatReasoningDuration } from "./Reasoning";
import { promptInputMessagesEn } from "./messages";
import { YugenProvider } from "../YugenProvider/YugenProvider";

const blocks = (text: string, streaming = false) => parseMarkdown(text, { streaming }).children;
const first = <T extends MdBlock["type"]>(text: string, type: T, streaming = false) => {
  const b = blocks(text, streaming)[0];
  expect(b.type).toBe(type);
  return b as Extract<MdBlock, { type: T }>;
};

describe("parseMarkdown", () => {
  it("đoạn văn, heading, nhấn mạnh, code inline", () => {
    const [h, p] = blocks("## Tiêu đề\n\nChữ **đậm**, *nghiêng*, ~~gạch~~ và `code`.");
    expect(h).toMatchObject({ type: "heading", level: 2 });
    expect(p.type).toBe("paragraph");
    const kids = (p as Extract<MdBlock, { type: "paragraph" }>).children.map((n) => n.type);
    expect(kids).toEqual(["text", "strong", "text", "emphasis", "text", "delete", "text", "inlineCode", "text"]);
  });

  it("dấu _ giữa từ (snake_case) không thành nghiêng", () => {
    const p = first("biến snake_case_name", "paragraph");
    expect(p.children).toEqual([{ type: "text", text: "biến snake_case_name" }]);
  });

  it("nhấn mạnh lồng nhau", () => {
    const p = first("**đậm *nghiêng* tiếp**", "paragraph");
    const strong = p.children[0] as Extract<MdInline, { type: "strong" }>;
    expect(strong.type).toBe("strong");
    expect(strong.children.map((n) => n.type)).toEqual(["text", "emphasis", "text"]);
  });

  it("fence chưa đóng khi stream → khối code đang viết; dấu fence dở dang bị ẩn", () => {
    const code = first("```ts\nconst a = 1;\n``", "code", true);
    expect(code).toMatchObject({ lang: "ts", text: "const a = 1;", closed: false });
    expect(blocks("Xem nè\n``", true)).toHaveLength(1);
    expect(first("```ts\nconst a = 1;\n```", "code")).toMatchObject({ closed: true });
  });

  it("dấu nhấn mạnh / link chưa đóng khi stream không lộ ký hiệu thô", () => {
    const p = first("Chữ **đậm dở", "paragraph", true);
    expect(p.children[1]).toEqual({ type: "strong", children: [{ type: "text", text: "đậm dở" }] });
    const link = first("Xem [tài liệu](https://exa", "paragraph", true);
    expect(link.children).toEqual([{ type: "text", text: "Xem tài liệu" }]);
    // Không stream: giữ nguyên ký tự.
    expect(first("Chữ **đậm dở", "paragraph").children).toEqual([{ type: "text", text: "Chữ **đậm dở" }]);
  });

  it("chỉ cho link http / https / mailto", () => {
    expect(sanitizeHref("https://yugen.dev")).toBe("https://yugen.dev");
    expect(sanitizeHref("mailto:a@b.vn")).toBe("mailto:a@b.vn");
    expect(sanitizeHref("javascript:alert(1)")).toBeNull();
    expect(sanitizeHref("JaVa\tScRiPt:alert(1)")).toBeNull();
    expect(sanitizeHref("data:text/html,x")).toBeNull();
    expect(sanitizeHref("//evil.com")).toBeNull();
    const p = first("[bấm](javascript:alert(1)) và [ok](https://yugen.dev)", "paragraph");
    expect(p.children[0]).toEqual({ type: "text", text: "bấm và " });
    expect(p.children[1]).toMatchObject({ type: "link", href: "https://yugen.dev" });
  });

  it("bảng GFM có căn lề; bảng đang stream chỉ có hàng tiêu đề", () => {
    const t = first("| Tên | Giá |\n| :-- | --: |\n| Trà | 20 |\n| Cà phê | 25 |", "table");
    expect(t.align).toEqual(["start", "end"]);
    expect(t.head).toHaveLength(2);
    expect(t.rows).toHaveLength(2);
    expect(t.rows[1][0]).toEqual([{ type: "text", text: "Cà phê" }]);
    expect(first("| Tên | Giá |", "table", true).rows).toHaveLength(0);
    expect(first("| Tên | Giá |", "paragraph").type).toBe("paragraph");
  });

  it("danh sách lồng nhau, có số, việc cần làm", () => {
    const list = first("1. Một\n   - con A\n   - con B\n2. Hai", "list");
    expect(list).toMatchObject({ ordered: true, start: 1, tight: true });
    expect(list.items).toHaveLength(2);
    const nested = list.items[0].children[1];
    expect(nested).toMatchObject({ type: "list", ordered: false });
    expect((nested as Extract<MdBlock, { type: "list" }>).items).toHaveLength(2);
    // LLM hay thụt 2 dấu cách dưới "1." — vẫn là danh sách con.
    expect(first("1. Một\n  - con", "list").items[0].children[1]).toMatchObject({ type: "list" });
    const tasks = first("- [x] Xong\n- [ ] Chưa", "list");
    expect(tasks.items.map((i) => i.checked)).toEqual([true, false]);
  });

  it("blockquote, đường kẻ, chú thích nguồn", () => {
    expect(first("> trích dẫn\n> tiếp", "blockquote").children[0].type).toBe("paragraph");
    expect(first("---", "thematicBreak").type).toBe("thematicBreak");
    const p = first("Theo báo cáo[1] và [^2].", "paragraph");
    expect(p.children.filter((n) => n.type === "citation")).toEqual([
      { type: "citation", index: 1, label: "[1]" },
      { type: "citation", index: 2, label: "[^2]" },
    ]);
  });

  it("markdownToPlainText bỏ ký hiệu", () => {
    expect(markdownToPlainText("# Chào\n\n**Đậm** và [link](https://a.vn)")).toBe("Chào\nĐậm và link");
  });
});

describe("StreamingMarkdown", () => {
  it("render an toàn: link ngoài mở tab mới, heading lệch cấp, không có h1", () => {
    render(<StreamingMarkdown>{"# Tiêu đề\n\n[Yugen](https://yugen.dev) <script>alert(1)</script>"}</StreamingMarkdown>);
    expect(screen.getByRole("heading", { level: 3, name: "Tiêu đề" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    const link = screen.getByRole("link", { name: /Yugen/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link).toHaveTextContent("(mở tab mới)");
    expect(document.querySelector("script")).toBeNull();
  });

  it("aria-busy + con trỏ khi stream, khối cũ không render lại", () => {
    const { container, rerender } = render(<StreamingMarkdown streaming>{"Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba"}</StreamingMarkdown>);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("[data-streaming-caret]")).not.toBeNull();
    const p1 = container.querySelector("p");
    rerender(<StreamingMarkdown streaming>{"Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba dài thêm"}</StreamingMarkdown>);
    expect(container.querySelector("p")).toBe(p1);
    rerender(<StreamingMarkdown>{"Đoạn một.\n\nĐoạn hai.\n\nĐoạn ba dài thêm."}</StreamingMarkdown>);
    expect(root).not.toHaveAttribute("aria-busy");
    expect(container.querySelector("[data-streaming-caret]")).toBeNull();
  });
});

describe("PromptInput", () => {
  it("Enter gửi, Shift+Enter xuống dòng, không gửi khi đang ghép chữ IME", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const box = screen.getByRole("textbox", { name: "Nhập yêu cầu" });
    await user.type(box, "Xin chào{Shift>}{Enter}{/Shift}bạn");
    expect(box).toHaveValue("Xin chào\nbạn");
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.compositionStart(box);
    fireEvent.keyDown(box, { key: "Enter" });
    fireEvent.compositionEnd(box);
    fireEvent.keyDown(box, { key: "Enter", keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith({ text: "Xin chào\nbạn", files: [] });
    expect(box).toHaveValue("");
  });

  it("đang stream: nút Dừng thay nút Gửi, Enter không gửi", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    render(<PromptInput streaming onStop={onStop} onSubmit={onSubmit} defaultValue="tiếp" />);
    await user.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Dừng phản hồi" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("kiểm tra tệp: định dạng, dung lượng, số lượng, trùng", () => {
    const pdf = new File(["x".repeat(10)], "a.pdf", { type: "application/pdf" });
    const exe = new File(["x"], "b.exe", { type: "application/x-msdownload" });
    const big = new File(["x".repeat(2048)], "c.png", { type: "image/png" });
    const png = new File(["x"], "d.png", { type: "image/png" });
    const { accepted, rejected } = validateFiles([pdf, exe, big, png, pdf], {
      accept: ".pdf,image/*",
      maxSize: 1024,
      maxFiles: 1,
    });
    expect(accepted).toEqual([pdf]);
    expect(rejected.map((r) => r.reason)).toEqual(["type", "size", "count", "duplicate"]);
    expect(rejected[1].message).toContain("1 KB");
    expect(formatFileSize(1536)).toBe("1,5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
  });

  it("đính kèm qua input: chip có tên + dung lượng, lỗi hiện inline, gỡ được", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} accept=".txt" maxSize={100} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, [new File(["xin chào"], "ghi-chu.txt", { type: "text/plain" }), new File(["x"], "anh.gif", { type: "image/gif" })]);
    expect(screen.getByRole("list", { name: "Tệp đính kèm" })).toHaveTextContent("ghi-chu.txt");
    expect(screen.getByRole("alert")).toHaveTextContent("“anh.gif” không đúng định dạng cho phép.");
    // Chỉ có tệp vẫn gửi được.
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(onSubmit.mock.calls[0][0].files).toHaveLength(1);
    expect(screen.queryByRole("list", { name: "Tệp đính kèm" })).toBeNull();
  });
});

describe("Reasoning", () => {
  it("định dạng thời lượng theo giây", () => {
    expect(formatReasoningDuration(400)).toBe("1s");
    expect(formatReasoningDuration(12_300)).toBe("12s");
    expect(formatReasoningDuration(65_000)).toBe("1m 05s");
  });
});

describe("AIKit messages", () => {
  it("PromptInput: messages tiếng Anh", () => {
    render(
      <YugenProvider messages={{ promptInput: promptInputMessagesEn }} locale="en-US">
        <PromptInput onSubmit={() => {}} />
      </YugenProvider>,
    );
    expect(screen.getByRole("textbox", { name: "Enter a prompt" })).toHaveAttribute("placeholder", "Ask anything…");
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Attach files" })).toBeInTheDocument();
  });

  it("formatFileSize theo locale", () => {
    expect(formatFileSize(1536, "en-US")).toBe("1.5 KB");
    expect(formatFileSize(1536)).toBe("1,5 KB");
  });
});
