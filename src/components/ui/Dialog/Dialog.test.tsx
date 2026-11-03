import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  dialogMessagesVi,
} from "./Dialog";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Demo({
  surface,
  title,
  onOpenChange,
}: {
  surface?: Partial<React.ComponentProps<typeof DialogSurface>>;
  title?: Partial<React.ComponentProps<typeof DialogTitle>>;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Xoá tệp</Button>
      </DialogTrigger>
      <DialogSurface {...surface}>
        <DialogTitle {...title}>Xoá tệp?</DialogTitle>
        <DialogContent className="max-h-40">
          <DialogDescription>Không thể hoàn tác.</DialogDescription>
        </DialogContent>
        <DialogActions data-testid="actions">
          <DialogClose asChild>
            <Button>Huỷ</Button>
          </DialogClose>
          <Button appearance="primary">Xoá</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

const openButton = () => screen.getByRole("button", { name: "Xoá tệp" });
// Radix chỉ bắt pointerdown bên ngoài sau một nhịp setTimeout kể từ lúc mở.
const tick = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe("Dialog", () => {
  it("mở bằng trigger: role dialog, tên từ DialogTitle, mô tả từ DialogDescription", async () => {
    const user = userEvent.setup();
    render(<Demo surface={{ className: "max-w-96" }} />);
    await user.click(openButton());
    const dialog = await screen.findByRole("dialog", { name: "Xoá tệp?" });
    expect(dialog).toHaveAccessibleDescription("Không thể hoàn tác.");
    expect(dialog).toHaveClass("max-w-96", "rounded-xlarge");
    expect(screen.getByText("Không thể hoàn tác.").parentElement).toHaveClass("max-h-40", "overflow-y-auto");
    expect(screen.getByTestId("actions")).toHaveClass("justify-end");
  });

  it("Escape đóng và trả focus về trigger; onOpenChange báo trạng thái", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    await user.click(openButton());
    await screen.findByRole("dialog");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(openButton()).toHaveFocus();
  });

  it("nút X (DialogTitle) và DialogClose đóng hộp thoại", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(openButton());
    await user.click(await screen.findByRole("button", { name: "Đóng" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(openButton());
    await user.click(await screen.findByRole("button", { name: "Huỷ" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("action={null} ẩn nút X; action tuỳ chọn thay chỗ", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo title={{ action: null }} />);
    await user.click(openButton());
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Đóng" })).not.toBeInTheDocument();
    unmount();
    render(<Demo title={{ action: <button>Trợ giúp</button> }} />);
    await user.click(openButton());
    expect(await screen.findByRole("button", { name: "Trợ giúp" })).toBeInTheDocument();
  });

  it("modal: bấm ra ngoài đóng; alert: role alertdialog, không đóng bằng Escape hay bấm ngoài", async () => {
    // Modal Radix đặt pointer-events: none lên <body> → bỏ kiểm tra pointer-events của user-event để bấm ra ngoài.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onPointerDownOutside = vi.fn();
    const onEscapeKeyDown = vi.fn();
    const { unmount } = render(<Demo />);
    await user.click(openButton());
    await screen.findByRole("dialog");
    await tick();
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    unmount();

    render(<Demo surface={{ modalType: "alert", onPointerDownOutside, onEscapeKeyDown }} />);
    await user.click(openButton());
    const alert = await screen.findByRole("alertdialog", { name: "Xoá tệp?" });
    await tick();
    await user.keyboard("{Escape}");
    await user.click(document.body);
    expect(alert).toBeInTheDocument();
    expect(onEscapeKeyDown).toHaveBeenCalled();
    expect(onPointerDownOutside).toHaveBeenCalled();
  });

  it("material glass gắn class; ref tới bề mặt; dir + theme của provider lồng", async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <YugenProvider dir="rtl" theme="dark">
        <Dialog open>
          <DialogSurface ref={ref} material="glass" aria-describedby={undefined}>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogSurface>
        </Dialog>
      </YugenProvider>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveClass("glass");
    expect(dialog).toHaveAttribute("dir", "rtl");
    expect(dialog).toHaveAttribute("data-theme", "dark");
  });

  it("nhãn nút X: tiếng Anh mặc định, tiếng Việt qua dialogMessagesVi", () => {
    const content = (
      <Dialog open>
        <DialogSurface aria-describedby={undefined}>
          <DialogTitle>Tiêu đề</DialogTitle>
        </DialogSurface>
      </Dialog>
    );
    const { unmount } = renderBare(content);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    unmount();
    renderBare(<YugenProvider messages={{ dialog: dialogMessagesVi }}>{content}</YugenProvider>);
    expect(screen.getByRole("button", { name: "Đóng" })).toBeInTheDocument();
  });
});
