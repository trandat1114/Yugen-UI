import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { sonnerMessagesEn } from "./messages";
import { Sonner, sonner } from "./Sonner";

/** Store toàn cục → mỗi test dùng sonnerId riêng để không thấy toast của test khác. */
let seq = 0;
const nextId = () => `test-${++seq}`;
const toasts = () => Array.from(document.querySelectorAll<HTMLLIElement>("li[data-type]")).filter((li) => li.dataset.state === "open");
const byTitle = (title: string) => toasts().find((li) => within(li).queryByText(title));

describe("Sonner", () => {
  it("shows a toast with title, description and the icon of its type", () => {
    const id = nextId();
    render(<Sonner sonnerId={id} />);
    act(() => {
      sonner.success("Đã lưu", { description: "Kế hoạch Q4", sonnerId: id });
    });
    const toast = byTitle("Đã lưu");
    expect(toast).toBeDefined();
    expect(toast).toHaveAttribute("data-type", "success");
    expect(within(toast!).getByText("Kế hoạch Q4")).toBeInTheDocument();
    expect(toast!.querySelector("svg")).not.toBeNull();
  });

  it("stacks newest first and hides toasts beyond visibleToasts", () => {
    const id = nextId();
    render(<Sonner sonnerId={id} visibleToasts={2} />);
    act(() => {
      for (const title of ["Một", "Hai", "Ba"]) sonner(title, { sonnerId: id });
    });
    expect(byTitle("Ba")).toHaveAttribute("data-front", "true");
    expect(byTitle("Ba")).toHaveAttribute("data-index", "0");
    expect(byTitle("Hai")).toHaveAttribute("data-index", "1");
    expect(byTitle("Một")).toHaveAttribute("data-visible", "false");
    expect(byTitle("Hai")).toHaveAttribute("data-expanded", "false");
  });

  it("expands while a toast has focus or the pointer is over the region", () => {
    const id = nextId();
    render(<Sonner sonnerId={id} closeButton />);
    act(() => {
      sonner("Một", { sonnerId: id });
      sonner("Hai", { sonnerId: id });
    });
    const close = within(byTitle("Một")!).getByRole("button", { name: "Đóng thông báo" });
    act(() => close.focus());
    expect(byTitle("Một")).toHaveAttribute("data-expanded", "true");
    act(() => close.blur());
    expect(byTitle("Một")).toHaveAttribute("data-expanded", "false");
    const list = byTitle("Một")!.closest("ol")!;
    fireEvent.pointerEnter(list, { pointerType: "mouse" });
    expect(byTitle("Hai")).toHaveAttribute("data-expanded", "true");
    fireEvent.pointerLeave(list, { pointerType: "mouse" });
    expect(byTitle("Hai")).toHaveAttribute("data-expanded", "false");
  });

  it("expand keeps the list open", () => {
    const id = nextId();
    render(<Sonner sonnerId={id} expand />);
    act(() => {
      sonner("Một", { sonnerId: id });
    });
    expect(byTitle("Một")).toHaveAttribute("data-expanded", "true");
  });

  it("replaces a toast in place when the id is reused", () => {
    const id = nextId();
    render(<Sonner sonnerId={id} />);
    act(() => {
      sonner.loading("Đang tải lên", { id: "upload", sonnerId: id });
    });
    expect(byTitle("Đang tải lên")).toHaveAttribute("data-type", "loading");
    act(() => {
      sonner.success("Đã tải lên", { id: "upload", sonnerId: id });
    });
    expect(toasts().filter((li) => within(li).queryByText(/tải lên/))).toHaveLength(1);
    expect(byTitle("Đã tải lên")).toHaveAttribute("data-type", "success");
  });

  it("follows a promise from loading to success", async () => {
    const id = nextId();
    render(<Sonner sonnerId={id} />);
    let resolve!: (value: number) => void;
    act(() => {
      sonner.promise(new Promise<number>((r) => (resolve = r)), {
        loading: "Đang lưu…",
        success: (n) => `Đã lưu ${n} mục`,
        error: "Không lưu được",
        sonnerId: id,
      });
    });
    expect(byTitle("Đang lưu…")).toHaveAttribute("data-type", "loading");
    await act(async () => resolve(3));
    expect(byTitle("Đã lưu 3 mục")).toHaveAttribute("data-type", "success");
    expect(byTitle("Đang lưu…")).toBeUndefined();
  });

  it("turns a rejected promise into an error", async () => {
    const id = nextId();
    render(<Sonner sonnerId={id} />);
    let reject!: (reason: Error) => void;
    act(() => {
      sonner.promise(() => new Promise((_, r) => (reject = r)), {
        loading: "Đang gửi…",
        success: "Đã gửi",
        error: (e) => (e as Error).message,
        sonnerId: id,
      });
    });
    await act(async () => reject(new Error("Mất kết nối")));
    expect(byTitle("Mất kết nối")).toHaveAttribute("data-type", "error");
  });

  it("closes on action click unless the handler prevents it", async () => {
    const user = userEvent.setup();
    const id = nextId();
    const onDismiss = vi.fn();
    const onUndo = vi.fn();
    render(<Sonner sonnerId={id} />);
    act(() => {
      sonner("Đã xoá", { sonnerId: id, onDismiss, action: { label: "Hoàn tác", onClick: onUndo } });
      sonner("Đã chuyển", { sonnerId: id, action: { label: "Xem", onClick: (e) => e.preventDefault() } });
    });
    await user.click(within(byTitle("Đã chuyển")!).getByRole("button", { name: "Xem" }));
    expect(byTitle("Đã chuyển")).toBeDefined();
    await user.click(within(byTitle("Đã xoá")!).getByRole("button", { name: "Hoàn tác" }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
    await waitFor(() => expect(byTitle("Đã xoá")).toBeUndefined());
  });

  it("calls onAutoClose when the timer runs out, onDismiss for the close button", async () => {
    const user = userEvent.setup();
    const id = nextId();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    render(<Sonner sonnerId={id} closeButton />);
    act(() => {
      sonner("Tự đóng", { sonnerId: id, duration: 50, onAutoClose, onDismiss });
      sonner("Đóng tay", { sonnerId: id, duration: Infinity, onAutoClose, onDismiss });
    });
    await waitFor(() => expect(onAutoClose).toHaveBeenCalledOnce());
    expect(onDismiss).not.toHaveBeenCalled();
    await user.click(within(byTitle("Đóng tay")!).getByRole("button", { name: "Đóng thông báo" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onAutoClose).toHaveBeenCalledOnce();
  });

  it("dismisses by id and keeps toasts of other regions apart", () => {
    const id = nextId();
    const other = nextId();
    render(<Sonner sonnerId={id} />);
    let first = "";
    act(() => {
      first = sonner("Ở đây", { sonnerId: id });
      sonner("Ở chỗ khác", { sonnerId: other });
    });
    expect(byTitle("Ở chỗ khác")).toBeUndefined();
    act(() => sonner.dismiss(first));
    expect(byTitle("Ở đây")).toBeUndefined();
  });

  it("reads its strings from YugenProvider", () => {
    const id = nextId();
    render(
      <YugenProvider messages={{ sonner: sonnerMessagesEn }}>
        <Sonner sonnerId={id} closeButton />
      </YugenProvider>,
    );
    act(() => {
      sonner.error("Upload failed", { sonnerId: id });
    });
    expect(within(byTitle("Upload failed")!).getByRole("button", { name: "Dismiss notification" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Notifications/ })).toBeInTheDocument();
  });
});
