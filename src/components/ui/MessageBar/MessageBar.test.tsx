import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { MessageBar, messageBarMessagesVi } from "./MessageBar";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("MessageBar", () => {
  it("info / success là status; warning / error là alert", () => {
    render(
      <>
        <MessageBar>Thông tin</MessageBar>
        <MessageBar intent="success">Đã lưu</MessageBar>
        <MessageBar intent="warning">Sắp hết dung lượng</MessageBar>
        <MessageBar intent="error">Lỗi mạng</MessageBar>
      </>,
    );
    expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual(["Thông tin", "Đã lưu"]);
    expect(screen.getAllByRole("alert").map((el) => el.textContent)).toEqual(["Sắp hết dung lượng", "Lỗi mạng"]);
    expect(screen.getAllByRole("alert")[0]).toHaveClass("bg-warning-background-1");
    expect(screen.getAllByRole("alert")[1]).toHaveClass("bg-danger-background-1");
  });

  it("title + actions một dòng; className gộp", () => {
    render(
      <MessageBar title="Cập nhật" actions={<button>Tải lại</button>} className="mb-2">
        Có phiên bản mới
      </MessageBar>,
    );
    const bar = screen.getByRole("status");
    expect(bar).toHaveClass("mb-2", "bg-background-3");
    expect(screen.getByText("Cập nhật")).toHaveClass("font-semibold");
    // singleline: hành động nằm ngoài khối chữ.
    expect(screen.getByRole("button", { name: "Tải lại" }).parentElement?.parentElement).toBe(bar);
  });

  it("multiline: hành động xuống dưới nội dung", () => {
    render(
      <MessageBar layout="multiline" actions={<button>Xem</button>}>
        Nội dung dài
      </MessageBar>,
    );
    const actions = screen.getByRole("button", { name: "Xem" }).parentElement!;
    expect(actions).toHaveClass("mt-2");
    expect(actions.parentElement).toHaveClass("flex-col");
  });

  it("onDismiss: nút đóng gọi callback; không có onDismiss thì không có nút", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(<MessageBar onDismiss={onDismiss}>Đã gửi</MessageBar>);
    await user.click(screen.getByRole("button", { name: "Đóng thông báo" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    rerender(<MessageBar>Đã gửi</MessageBar>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("nhãn nút đóng: tiếng Anh mặc định, tiếng Việt qua messageBarMessagesVi", () => {
    const { unmount } = renderBare(<MessageBar onDismiss={() => {}}>x</MessageBar>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ messageBar: messageBarMessagesVi }}>
        <MessageBar onDismiss={() => {}}>x</MessageBar>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Đóng thông báo" })).toBeInTheDocument();
  });
});
