import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import {
  TeachingPopover,
  TeachingPopoverFooter,
  TeachingPopoverHeader,
  TeachingPopoverSurface,
  TeachingPopoverTrigger,
} from "./TeachingPopover";

function Demo(props: React.ComponentProps<typeof TeachingPopoverFooter>) {
  return (
    <TeachingPopover open>
      <TeachingPopoverSurface aria-label="Mẹo">
        <TeachingPopoverFooter data-testid="footer" {...props} />
      </TeachingPopoverSurface>
    </TeachingPopover>
  );
}

describe("TeachingPopoverFooter orientation", () => {
  it("mặc định ngang; orientation=\"vertical\" xếp hai nút chồng nhau", () => {
    const { rerender } = render(<Demo primary="Mở" secondary="Để sau" />);
    expect(screen.getByTestId("footer")).not.toHaveClass("flex-col");
    rerender(<Demo primary="Mở" secondary="Để sau" orientation="vertical" />);
    expect(screen.getByTestId("footer")).toHaveClass("flex-col");
  });

  it("layout (tên cũ) vẫn chạy và cảnh báo một lần; orientation thắng", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo primary="Mở" layout="vertical" />);
    rerender(<Demo primary="Mở" layout="vertical" />);
    expect(screen.getByTestId("footer")).toHaveClass("flex-col");
    expect(warnings("TeachingPopoverFooter.layout")).toBe(1);
    rerender(<Demo primary="Mở" layout="vertical" orientation="horizontal" />);
    expect(screen.getByTestId("footer")).not.toHaveClass("flex-col");
  });
});

describe("TeachingPopover focus", () => {
  afterEach(() => vi.unstubAllGlobals());

  const scrim = () => document.querySelector<HTMLElement>("[data-teaching-popover-scrim]");

  it("spotlight dims the viewport while the default stays unchanged", () => {
    const { rerender } = render(
      <TeachingPopover open>
        <TeachingPopoverSurface aria-label="Tip">Content</TeachingPopoverSurface>
      </TeachingPopover>,
    );
    expect(scrim()).not.toBeInTheDocument();

    rerender(
      <TeachingPopover open focus="spotlight">
        <TeachingPopoverSurface aria-label="Tip">Content</TeachingPopoverSurface>
      </TeachingPopover>,
    );
    expect(scrim()).toHaveAttribute("aria-hidden", "true");
    expect(scrim()).toHaveClass("fixed", "inset-0", "z-40");
    // Không có trigger: phủ tối cả màn hình.
    expect(scrim()?.firstElementChild).toHaveClass("bg-overlay");
  });

  it("leaves the trigger lit, follows it when the page scrolls, and blocks the rest of the page", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    let top = 100;
    render(
      <>
        <button type="button">Outside</button>
        <TeachingPopover focus="spotlight">
          <TeachingPopoverTrigger>New filters</TeachingPopoverTrigger>
          <TeachingPopoverSurface aria-label="Tip">
            <TeachingPopoverHeader>Filters</TeachingPopoverHeader>
          </TeachingPopoverSurface>
        </TeachingPopover>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "New filters" });
    vi.spyOn(trigger, "getBoundingClientRect").mockImplementation(
      () => ({ top, left: 40, width: 120, height: 32, right: 160, bottom: top + 32, x: 40, y: top, toJSON: () => ({}) }) as DOMRect,
    );
    fireEvent.click(trigger);

    const cutout = () => scrim()?.firstElementChild as HTMLElement;
    expect(cutout().style.top).toBe("96px");
    expect(cutout().style.left).toBe("36px");
    expect(cutout().style.width).toBe("128px");
    expect(cutout().style.height).toBe("40px");
    // Modal: phần còn lại của trang bị ẩn khỏi trình đọc màn hình và không Tab tới được.
    expect(screen.queryByRole("button", { name: "Outside" })).not.toBeInTheDocument();

    top = 20;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    expect(frames).toHaveLength(1);
    act(() => frames.splice(0).forEach((cb) => cb(0)));
    expect(cutout().style.top).toBe("16px");
  });

  it("closes with Escape, removes the scrim and returns focus to the trigger", async () => {
    render(
      <TeachingPopover focus="spotlight">
        <TeachingPopoverTrigger>Tips</TeachingPopoverTrigger>
        <TeachingPopoverSurface aria-label="Tip">
          <TeachingPopoverHeader>Tip</TeachingPopoverHeader>
        </TeachingPopoverSurface>
      </TeachingPopover>,
    );
    const trigger = screen.getByRole("button", { name: "Tips" });
    fireEvent.click(trigger);
    expect(scrim()).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(scrim()).not.toBeInTheDocument();
    // FocusScope của Radix trả focus sau một tick.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("forwards the trigger ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <TeachingPopover>
        <TeachingPopoverTrigger ref={ref}>Tips</TeachingPopoverTrigger>
      </TeachingPopover>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Tips" }));
  });
});
