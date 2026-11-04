import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  DrawerTrigger,
  InlineDrawer,
  OverlayDrawer,
} from "./Drawer";

function Demo(props: Partial<React.ComponentProps<typeof DrawerSurface>>) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Bộ lọc</Button>
      </DrawerTrigger>
      <DrawerSurface {...props}>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <DrawerClose asChild>
                <Button aria-label="Đóng" />
              </DrawerClose>
            }
          >
            Lọc kết quả
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>Nội dung</DrawerBody>
        <DrawerFooter>
          <Button>Áp dụng</Button>
        </DrawerFooter>
      </DrawerSurface>
    </Drawer>
  );
}

const openButton = () => screen.getByRole("button", { name: "Bộ lọc" });
// Radix chỉ bắt pointerdown bên ngoài sau một nhịp setTimeout kể từ lúc mở.
const tick = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe("Drawer (overlay)", () => {
  it("mở bằng trigger: dialog có tên từ tiêu đề; mặc định ở cuối, cỡ small", async () => {
    const user = userEvent.setup();
    render(<Demo className="shadow-28" />);
    await user.click(openButton());
    const dialog = await screen.findByRole("dialog", { name: "Lọc kết quả" });
    expect(dialog).toHaveClass("inset-e-0", "w-80", "shadow-28");
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(screen.getByText("Nội dung")).toHaveClass("overflow-y-auto");
    expect(screen.getByRole("button", { name: "Áp dụng" }).parentElement).toHaveClass("pb-6");
  });

  it("Escape / nút đóng trong action đóng drawer, focus về trigger", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(openButton());
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(openButton()).toHaveFocus();
    await user.click(openButton());
    await user.click(await screen.findByRole("button", { name: "Đóng" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("position / size: bottom dùng chiều cao, start ở đầu dòng; material glass", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo position="bottom" size="medium" material="glass" />);
    await user.click(openButton());
    expect(await screen.findByRole("dialog")).toHaveClass("bottom-0", "h-148", "glass");
    unmount();
    render(<Demo position="start" size="full" />);
    await user.click(openButton());
    expect(await screen.findByRole("dialog")).toHaveClass("inset-s-0", "w-screen");
  });

  it("alert: role alertdialog, không đóng bằng Escape hay bấm ngoài", async () => {
    // Modal Radix đặt pointer-events: none lên <body> → bỏ kiểm tra pointer-events của user-event để bấm ra ngoài.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onEscapeKeyDown = vi.fn();
    const onPointerDownOutside = vi.fn();
    render(<Demo modalType="alert" onEscapeKeyDown={onEscapeKeyDown} onPointerDownOutside={onPointerDownOutside} />);
    await user.click(openButton());
    const alert = await screen.findByRole("alertdialog");
    await tick();
    await user.keyboard("{Escape}");
    await user.click(document.body);
    expect(alert).toBeInTheDocument();
    expect(onEscapeKeyDown).toHaveBeenCalled();
    expect(onPointerDownOutside).toHaveBeenCalled();
  });

  it("modal: bấm ra ngoài đóng drawer", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<Demo />);
    await user.click(openButton());
    await screen.findByRole("dialog");
    await tick();
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("OverlayDrawer", () => {
  it("open / onOpenChange; ref tới bề mặt; dir + theme của provider lồng", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const ref = { current: null as HTMLDivElement | null };
    render(
      <YugenProvider dir="rtl" theme="dark">
        <OverlayDrawer ref={ref} open onOpenChange={onOpenChange} position="start">
          <DrawerHeaderTitle>Menu</DrawerHeaderTitle>
        </OverlayDrawer>
      </YugenProvider>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveAttribute("dir", "rtl");
    expect(dialog).toHaveAttribute("data-theme", "dark");
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("InlineDrawer", () => {
  it("không phải dialog; tiêu đề là h2; đóng thì rộng 0 + invisible", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { rerender } = render(
      <InlineDrawer ref={ref} open separator data-testid="drawer">
        <DrawerHeaderTitle>Chi tiết</DrawerHeaderTitle>
      </InlineDrawer>,
    );
    const drawer = screen.getByTestId("drawer");
    expect(ref.current).toBe(drawer);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Chi tiết" })).toBeInTheDocument();
    expect(drawer).toHaveAttribute("data-state", "open");
    expect(drawer).toHaveClass("w-80", "border-e");
    rerender(
      <InlineDrawer data-testid="drawer" position="end" separator>
        <DrawerHeaderTitle>Chi tiết</DrawerHeaderTitle>
      </InlineDrawer>,
    );
    expect(drawer).toHaveAttribute("data-state", "closed");
    expect(drawer).toHaveClass("w-0", "invisible", "border-s", "justify-end");
  });

  it("position bottom: theo chiều cao", () => {
    const { rerender } = render(<InlineDrawer data-testid="drawer" position="bottom" size="large" open />);
    expect(screen.getByTestId("drawer")).toHaveClass("h-235");
    rerender(<InlineDrawer data-testid="drawer" position="bottom" size="large" />);
    expect(screen.getByTestId("drawer")).toHaveClass("h-0");
  });
});
