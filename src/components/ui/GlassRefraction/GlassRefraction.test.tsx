import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { setMediaQueries } from "@/test/matchMedia";
import { GlassRefraction, startGlassRefraction, supportsGlassRefraction } from "./GlassRefraction";

/*
 * Lens (bản đồ khúc xạ) và CSS đã có test ở src/test/glass-refraction.test.ts. Ở đây giả lập Chromium (userAgentData +
 * CSS.supports), canvas và ResizeObserver để chạy bộ theo dõi: gắn / gỡ --glass-lens và <filter> dùng chung.
 */

function fakeChromium() {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: { brands: [{ brand: "Chromium" }] } });
  vi.stubGlobal("CSS", { ...globalThis.CSS, supports: () => true });
  vi.stubGlobal(
    "ImageData",
    class {
      constructor(
        public data: Uint8ClampedArray,
        public width: number,
        public height: number,
      ) {}
    },
  );
  // ResizeObserver giả: báo kích thước ngay khi bắt đầu theo dõi.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ putImageData() {} } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AA==");
  // Kích thước đọc từ data-w / data-h (mặc định 200×40).
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return Number(this.dataset.w ?? 200);
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return Number(this.dataset.h ?? 40);
  });
}

const settle = () => act(() => vi.advanceTimersByTimeAsync(200));
const lens = (el: Element | null) => (el as HTMLElement | null)?.style.getPropertyValue("--glass-lens") ?? "";
const filters = () => document.querySelectorAll("body > svg filter");

afterEach(() => {
  delete (navigator as { userAgentData?: unknown }).userAgentData;
  vi.unstubAllGlobals();
});

describe("GlassRefraction ngoài Chromium", () => {
  it("jsdom: không hỗ trợ, không thêm gì vào trang", () => {
    expect(supportsGlassRefraction()).toBe(false);
    const { container, unmount } = render(
      <>
        <GlassRefraction />
        <div className="glass" />
      </>,
    );
    expect(document.querySelector("body > svg")).toBeNull();
    expect(container.querySelector("[data-glass-lens]")).toBeNull();
    unmount();
  });
});

describe("GlassRefraction (Chromium giả lập)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fakeChromium();
  });

  it("gắn --glass-lens + data-glass-lens; bề mặt cùng kích thước dùng chung một <filter>", async () => {
    expect(supportsGlassRefraction()).toBe(true);
    const { container, unmount } = render(
      <>
        <GlassRefraction />
        <div className="glass" data-testid="a" />
        <div className="glass-clear" data-testid="b" />
        <div className="glass-tinted" data-w={120} data-testid="c" />
      </>,
    );
    await settle();
    const [a, b, c] = ["a", "b", "c"].map((id) => container.querySelector(`[data-testid="${id}"]`));
    expect(a).toHaveAttribute("data-glass-lens");
    expect(lens(a)).toMatch(/^url\(#yugen-lens-\d+\)$/);
    expect(lens(b)).toBe(lens(a));
    expect(lens(c)).not.toBe(lens(a));
    expect(filters()).toHaveLength(2);
    const svg = document.querySelector("body > svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.querySelector("feDisplacementMap")).not.toBeNull();
    unmount();
    // Gỡ component gốc: dừng theo dõi, dọn filter và biến CSS.
    expect(document.querySelector("body > svg")).toBeNull();
    expect(lens(a)).toBe("");
  });

  it("bỏ qua glass lồng trong glass, bề mặt quá lớn và bề mặt rộng 0", async () => {
    const { container, unmount } = render(
      <>
        <GlassRefraction />
        <div className="glass" data-testid="outer">
          <div className="glass" data-testid="inner" />
        </div>
        <div className="glass" data-w={2000} data-h={1000} data-testid="huge" />
        <div className="glass" data-w={0} data-testid="empty" />
      </>,
    );
    await settle();
    const get = (id: string) => container.querySelector(`[data-testid="${id}"]`);
    expect(get("outer")).toHaveAttribute("data-glass-lens");
    expect(get("inner")).not.toHaveAttribute("data-glass-lens");
    expect(get("huge")).not.toHaveAttribute("data-glass-lens");
    expect(get("empty")).not.toHaveAttribute("data-glass-lens");
    unmount();
  });

  it("theo dõi thêm / bớt phần tử và đổi class", async () => {
    function Page({ show, glass }: { show: boolean; glass: boolean }) {
      return (
        <>
          <GlassRefraction />
          <div className={glass ? "glass" : "plain"} data-testid="toggle" />
          {show && <div className="glass" data-w={90} data-testid="late" />}
        </>
      );
    }
    const { container, rerender, unmount } = render(<Page show={false} glass={false} />);
    await settle();
    const toggle = container.querySelector('[data-testid="toggle"]');
    expect(toggle).not.toHaveAttribute("data-glass-lens");
    expect(filters()).toHaveLength(0);

    rerender(<Page show glass />);
    await settle();
    expect(toggle).toHaveAttribute("data-glass-lens");
    expect(container.querySelector('[data-testid="late"]')).toHaveAttribute("data-glass-lens");
    expect(filters()).toHaveLength(2);

    // Bỏ class → gỡ lens; gỡ phần tử → filter không còn ai dùng thì bị xoá.
    rerender(<Page show={false} glass={false} />);
    await settle();
    expect(toggle).not.toHaveAttribute("data-glass-lens");
    expect(lens(toggle)).toBe("");
    expect(filters()).toHaveLength(0);
    unmount();
  });

  it("nhiều lần gọi dùng chung một bộ theo dõi; hàm dừng gọi lại không sao", () => {
    const stopA = startGlassRefraction();
    const stopB = startGlassRefraction();
    expect(document.querySelectorAll("body > svg")).toHaveLength(1);
    stopA();
    stopA();
    expect(document.querySelectorAll("body > svg")).toHaveLength(1);
    stopB();
    expect(document.querySelector("body > svg")).toBeNull();
  });

  it("giảm trong suốt / tăng tương phản / màu cưỡng bức: không chạy", () => {
    setMediaQueries({ "prefers-reduced-transparency": true });
    const stop = startGlassRefraction();
    expect(document.querySelector("body > svg")).toBeNull();
    stop();
  });

  it("canvas không có 2D context: giữ glass thường", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    const { container, unmount } = render(
      <>
        <GlassRefraction />
        <div className="glass" data-testid="a" />
      </>,
    );
    await settle();
    expect(container.querySelector('[data-testid="a"]')).not.toHaveAttribute("data-glass-lens");
    expect(filters()).toHaveLength(0);
    unmount();
  });
});
