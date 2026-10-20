import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../Field/Field";
import { createFileEntry, FileUpload, isFileAccepted, type FileUploadEntry } from "./FileUpload";

const pdf = (name = "hop-dong.pdf", bytes = 2048) => new File(["x".repeat(bytes)], name, { type: "application/pdf" });
const png = (name = "anh.png", bytes = 10) => new File(["x".repeat(bytes)], name, { type: "image/png" });
const setup = () => userEvent.setup({ applyAccept: false });

afterEach(() => vi.restoreAllMocks());

describe("isFileAccepted", () => {
  it("khớp đuôi, nhóm MIME và MIME đầy đủ", () => {
    expect(isFileAccepted(png(), "image/*")).toBe(true);
    expect(isFileAccepted(pdf(), ".pdf")).toBe(true);
    expect(isFileAccepted(pdf(), "image/png,image/jpeg")).toBe(false);
    expect(isFileAccepted(pdf())).toBe(true);
  });
});

describe("FileUpload", () => {
  it("dùng input file thật, ẩn trực quan, liên kết nhãn / hint của Field", () => {
    render(
      <Field label="Hồ sơ" hint="Gửi bản scan" required>
        <FileUpload accept=".pdf" maxSize={1024 * 1024} />
      </Field>,
    );
    const input = screen.getByLabelText(/Hồ sơ/);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveClass("sr-only");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription(/Gửi bản scan/);
    expect(input).toHaveAccessibleDescription(/PDF · tối đa 1 MB mỗi tệp/);
  });

  it("chọn tệp → hiện trong danh sách, gọi onFilesChange kèm added", async () => {
    const user = setup();
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Tài liệu" multiple onFilesChange={onFilesChange} />);
    await user.upload(screen.getByLabelText("Tài liệu"), [pdf()]);
    const list = screen.getByRole("list", { name: "Tệp đã chọn" });
    expect(within(list).getByText("hop-dong.pdf")).toHaveAttribute("title", "hop-dong.pdf");
    expect(within(list).getByText("2 KB")).toBeInTheDocument();
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0][1].added[0].name).toBe("hop-dong.pdf");
  });

  it("từ chối sai định dạng / quá dung lượng / quá số lượng với thông báo tiếng Việt", async () => {
    const user = setup();
    const onReject = vi.fn();
    render(<FileUpload aria-label="Ảnh" accept="image/*" multiple maxFiles={1} maxSize={100} onReject={onReject} />);
    const input = screen.getByLabelText("Ảnh");
    await user.upload(input, [pdf("a.pdf"), png("lon.png", 500), png("b.png"), png("c.png")]);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent('"a.pdf" không đúng định dạng (chỉ nhận ảnh).');
    expect(alert).toHaveTextContent('"lon.png" vượt quá dung lượng tối đa 100 B.');
    expect(alert).toHaveTextContent('Chỉ được chọn tối đa 1 tệp — đã bỏ qua "c.png".');
    expect(onReject.mock.calls[0][0].map((r: { code: string }) => r.code)).toEqual(["file-invalid-type", "file-too-large", "too-many-files"]);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("b.png")).toBeInTheDocument();
  });

  it("một tệp (mặc định) → tệp mới thay tệp cũ", async () => {
    const user = setup();
    render(<FileUpload aria-label="Tệp" />);
    const input = screen.getByLabelText("Tệp");
    await user.upload(input, pdf("cu.pdf"));
    await user.upload(input, pdf("moi.pdf"));
    expect(screen.queryByText("cu.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("moi.pdf")).toBeInTheDocument();
  });

  it("nút xoá icon-only có aria-label, xoá xong trả focus về vùng thả", async () => {
    const user = setup();
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Tệp" multiple defaultFiles={[createFileEntry(pdf("x.pdf"))]} onFilesChange={onFilesChange} />);
    await user.click(screen.getByRole("button", { name: "Xoá tệp x.pdf" }));
    expect(screen.queryByText("x.pdf")).not.toBeInTheDocument();
    expect(onFilesChange.mock.calls[0][1].removed[0].name).toBe("x.pdf");
    expect(screen.getByLabelText("Tệp")).toHaveFocus();
  });

  it("bàn phím: Tab tới vùng thả, Enter / Space mở hộp thoại chọn tệp", async () => {
    const user = setup();
    render(<FileUpload aria-label="Tệp" />);
    const input = screen.getByLabelText("Tệp") as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(click).toHaveBeenCalledTimes(2);
  });

  it("kéo thả: hiện trạng thái kéo vào, thả thì thêm tệp", () => {
    render(<FileUpload aria-label="Tệp" multiple />);
    const zone = screen.getByLabelText("Tệp").closest("label")!;
    const dataTransfer = { files: [pdf("keo.pdf")], types: ["Files"], dropEffect: "none" };
    fireEvent.dragEnter(zone, { dataTransfer });
    expect(zone).toHaveAttribute("data-dragging");
    expect(zone).toHaveTextContent("Thả tệp để tải lên");
    fireEvent.drop(zone, { dataTransfer });
    expect(zone).not.toHaveAttribute("data-dragging");
    expect(screen.getByText("keo.pdf")).toBeInTheDocument();
  });

  it("điều khiển: tiến trình dùng ProgressBar, lỗi có nút Thử lại", async () => {
    const user = setup();
    const onRetry = vi.fn();
    const files: FileUploadEntry[] = [
      { id: "1", name: "dang-tai.pdf", size: 100, status: "uploading", progress: 0.45 },
      { id: "2", name: "loi.pdf", size: 100, status: "error", error: "Mất kết nối" },
    ];
    render(<FileUpload aria-label="Tệp" multiple files={files} onRetry={onRetry} />);
    expect(screen.getByRole("progressbar", { name: "Tiến trình tải lên dang-tai.pdf" })).toHaveAttribute("aria-valuenow", "0.45");
    expect(screen.getByText("Đang tải lên… 45%")).toBeInTheDocument();
    expect(screen.getByText("Mất kết nối")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại tải lên loi.pdf" }));
    expect(onRetry).toHaveBeenCalledWith(files[1]);
  });

  it("thumbnail ảnh tạo bằng createObjectURL và thu hồi khi gỡ", () => {
    const create = vi.fn(() => "blob:anh");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const { container, unmount } = render(<FileUpload aria-label="Ảnh" defaultFiles={[createFileEntry(png())]} />);
    expect(container.querySelector("img")).toHaveAttribute("src", "blob:anh");
    act(() => unmount());
    expect(revoke).toHaveBeenCalledWith("blob:anh");
  });

  it("disabled: không nhận tệp kéo thả", () => {
    render(<FileUpload aria-label="Tệp" disabled />);
    const input = screen.getByLabelText("Tệp");
    expect(input).toBeDisabled();
    fireEvent.drop(input.closest("label")!, { dataTransfer: { files: [pdf()], types: ["Files"] } });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
