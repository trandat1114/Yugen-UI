import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Popover, PopoverClose, PopoverSurface, PopoverTrigger } from "./Popover";

function Demo(props: Partial<React.ComponentProps<typeof PopoverSurface>> & { onOpenChange?: (open: boolean) => void }) {
  const { onOpenChange, ...surface } = props;
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button>Chia sẻ</Button>
      </PopoverTrigger>
      <PopoverSurface aria-label="Chia sẻ tệp" {...surface}>
        <p>Gửi liên kết</p>
        <PopoverClose asChild>
          <Button>Xong</Button>
        </PopoverClose>
      </PopoverSurface>
    </Popover>
  );
}

const trigger = () => screen.getByRole("button", { name: "Chia sẻ" });

describe("Popover", () => {
  it("bấm trigger mở bề mặt (aria-expanded, aria-controls); className gộp; padding medium", async () => {
    const user = userEvent.setup();
    render(<Demo className="w-72" />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger());
    const surface = await screen.findByRole("dialog", { name: "Chia sẻ tệp" });
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", surface.id);
    expect(surface).toHaveClass("w-72", "p-4", "shadow-16");
  });

  it("Escape đóng và trả focus; PopoverClose đóng; onOpenChange báo trạng thái", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Xong" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("size / appearance / withArrow", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo size="small" appearance="brand" withArrow />);
    await user.click(trigger());
    const surface = await screen.findByRole("dialog");
    expect(surface).toHaveClass("p-2", "bg-brand-background");
    expect(surface.querySelector("svg")).toHaveClass("fill-brand-background");
    unmount();
    render(<Demo size="large" appearance="inverted" withArrow />);
    await user.click(trigger());
    const inverted = await screen.findByRole("dialog");
    expect(inverted).toHaveClass("p-5", "bg-background-inverted");
    expect(inverted.querySelector("svg")).toHaveClass("fill-background-inverted");
  });

  it("material glass: class glass + morph; onAnimationStart của người dùng vẫn chạy", async () => {
    const user = userEvent.setup();
    const onAnimationStart = vi.fn();
    render(<Demo material="glass" withArrow onAnimationStart={onAnimationStart} />);
    await user.click(trigger());
    const surface = await screen.findByRole("dialog");
    expect(surface).toHaveClass("glass");
    expect(surface.className).toContain("animate-morph-in");
    expect(surface.querySelector("svg")).toHaveClass("fill-(--glass-tint)");
    // jsdom không có AnimationEvent: React nghe sự kiện có tiền tố webkit.
    fireEvent(surface, Object.assign(new Event("webkitAnimationStart", { bubbles: true }), { animationName: "morph-in" }));
    expect(onAnimationStart).toHaveBeenCalled();
  });

  it("ref tới bề mặt; dir + theme của provider lồng", async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <YugenProvider dir="rtl" theme="dark">
        <Popover open>
          <PopoverTrigger>Mở</PopoverTrigger>
          <PopoverSurface ref={ref} aria-label="Bề mặt" />
        </Popover>
      </YugenProvider>,
    );
    const surface = await screen.findByRole("dialog", { name: "Bề mặt" });
    expect(ref.current).toBe(surface);
    expect(surface).toHaveAttribute("dir", "rtl");
    expect(surface).toHaveAttribute("data-theme", "dark");
  });
});
