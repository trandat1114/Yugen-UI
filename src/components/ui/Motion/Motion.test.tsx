import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { setMediaQueries } from "@/test/matchMedia";
import { Blur, Collapse, Fade, Rotate, Scale, Slide, Stagger } from "./Motion";

// Test không nạp CSS: đặt token thời lượng lên <html> để Motion đọc được (slow viết theo giây để thử cả hai đơn vị).
beforeAll(() => {
  const root = document.documentElement.style;
  root.setProperty("--durationFaster", "100ms");
  root.setProperty("--durationNormal", "200ms");
  root.setProperty("--durationSlow", "0.3s");
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
});

/** Tiến đồng hồ từng 10 ms: mỗi bước một act() để React chạy effect (hẹn khung hình / hẹn giờ mới) như ngoài đời. */
async function advance(ms: number) {
  for (let t = 0; t < ms; t += 10) await act(() => vi.advanceTimersByTimeAsync(Math.min(10, ms - t)));
}
const box = () => screen.getByTestId("box");

describe("Fade / usePresence", () => {
  it("visible từ đầu: entered, style đích; ref + className + style lên phần tử con", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Fade visible ref={ref} className="rounded-medium" style={{ color: "red" }}>
        <div data-testid="box" />
      </Fade>,
    );
    expect(ref.current).toBe(box());
    expect(box()).toHaveAttribute("data-motion", "entered");
    expect(box()).toHaveClass("transition-opacity", "opacity-100", "duration-normal", "ease-decelerate-mid", "rounded-medium");
    expect(box().style.color).toBe("red");
  });

  it("ẩn từ đầu: exited + invisible; unmountOnExit thì không render", () => {
    const { unmount } = render(
      <Fade visible={false}>
        <div data-testid="box" />
      </Fade>,
    );
    expect(box()).toHaveAttribute("data-motion", "exited");
    expect(box()).toHaveClass("opacity-0", "invisible");
    unmount();
    render(
      <Fade visible={false} unmountOnExit>
        <div data-testid="box" />
      </Fade>,
    );
    expect(screen.queryByTestId("box")).not.toBeInTheDocument();
  });

  it("vào: exited → (2 khung hình) entering → entered sau duration; ra: exiting → exited sau exitDuration", async () => {
    const onMotionFinish = vi.fn();
    const ui = (visible: boolean) => (
      <Fade visible={visible} exitDuration="slow" onMotionFinish={onMotionFinish}>
        <div data-testid="box" />
      </Fade>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    expect(box()).toHaveAttribute("data-motion", "exited");
    await advance(40);
    expect(box()).toHaveAttribute("data-motion", "entering");
    expect(box()).toHaveClass("opacity-100");
    await advance(200);
    expect(box()).toHaveAttribute("data-motion", "entered");
    expect(onMotionFinish).toHaveBeenLastCalledWith("enter");

    rerender(ui(false));
    expect(box()).toHaveAttribute("data-motion", "exiting");
    expect(box()).toHaveClass("pointer-events-none", "opacity-0", "duration-slow", "ease-accelerate-mid");
    await advance(250);
    expect(box()).toHaveAttribute("data-motion", "exiting");
    await advance(50);
    expect(box()).toHaveAttribute("data-motion", "exited");
    expect(onMotionFinish).toHaveBeenLastCalledWith("exit");
  });

  it("hiện lại khi đang thoát: vào ngay, không chờ khung hình", async () => {
    const ui = (visible: boolean) => (
      <Fade visible={visible}>
        <div data-testid="box" />
      </Fade>
    );
    const { rerender } = render(ui(true));
    rerender(ui(false));
    expect(box()).toHaveAttribute("data-motion", "exiting");
    rerender(ui(true));
    expect(box()).toHaveAttribute("data-motion", "entering");
    await advance(200);
    expect(box()).toHaveAttribute("data-motion", "entered");
  });

  it("unmountOnExit: gắn phần tử khi hiện, gỡ sau khi thoát xong", async () => {
    const ui = (visible: boolean) => (
      <Fade visible={visible} unmountOnExit>
        <div data-testid="box" />
      </Fade>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    expect(box()).toHaveAttribute("data-motion", "exited");
    await advance(250);
    expect(box()).toHaveAttribute("data-motion", "entered");
    rerender(ui(false));
    await advance(200);
    expect(screen.queryByTestId("box")).not.toBeInTheDocument();
  });

  it("appear: chạy chuyển động vào ngay lần render đầu", async () => {
    render(
      <Fade visible appear>
        <div data-testid="box" />
      </Fade>,
    );
    expect(box()).toHaveAttribute("data-motion", "exited");
    await advance(250);
    expect(box()).toHaveAttribute("data-motion", "entered");
  });

  it("prefers-reduced-motion: nhảy thẳng tới trạng thái cuối", () => {
    setMediaQueries({ "prefers-reduced-motion": true });
    const onMotionFinish = vi.fn();
    const ui = (visible: boolean) => (
      <Fade visible={visible} onMotionFinish={onMotionFinish}>
        <div data-testid="box" />
      </Fade>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    expect(box()).toHaveAttribute("data-motion", "entered");
    rerender(ui(false));
    expect(box()).toHaveAttribute("data-motion", "exited");
    expect(onMotionFinish.mock.calls).toEqual([["enter"], ["exit"]]);
  });

  it("thời lượng không có token (0 ms): không chờ", () => {
    const ui = (visible: boolean) => (
      <Fade visible={visible} duration="gentle">
        <div data-testid="box" />
      </Fade>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    expect(box()).toHaveAttribute("data-motion", "entered");
  });
});

describe("Scale / Slide / Blur / Rotate", () => {
  it("style xuất phát theo từng kiểu; animateOpacity=false bỏ mờ", () => {
    render(
      <>
        <Scale visible={false}>
          <div data-testid="scale" />
        </Scale>
        <Slide visible={false} from="start" animateOpacity={false}>
          <div data-testid="slide" />
        </Slide>
        <Slide visible={false} from="top">
          <div data-testid="slide-top" />
        </Slide>
        <Blur visible={false}>
          <div data-testid="blur" />
        </Blur>
        <Rotate visible={false} animateOpacity={false}>
          <div data-testid="rotate" />
        </Rotate>
      </>,
    );
    expect(screen.getByTestId("scale")).toHaveClass("scale-90", "opacity-0");
    expect(screen.getByTestId("slide")).toHaveClass("-translate-x-5", "rtl:translate-x-5");
    expect(screen.getByTestId("slide")).not.toHaveClass("opacity-0");
    expect(screen.getByTestId("slide-top")).toHaveClass("-translate-y-5", "opacity-0");
    expect(screen.getByTestId("blur")).toHaveClass("blur-md", "opacity-0");
    expect(screen.getByTestId("rotate")).toHaveClass("-rotate-90");
    expect(screen.getByTestId("rotate")).not.toHaveClass("opacity-0");
  });

  it("style đích khi hiện", () => {
    render(
      <>
        <Scale visible>
          <div data-testid="scale" />
        </Scale>
        <Slide visible>
          <div data-testid="slide" />
        </Slide>
        <Rotate visible>
          <div data-testid="rotate" />
        </Rotate>
      </>,
    );
    expect(screen.getByTestId("scale")).toHaveClass("scale-100", "opacity-100");
    expect(screen.getByTestId("slide")).toHaveClass("translate-y-0", "opacity-100");
    expect(screen.getByTestId("rotate")).toHaveClass("rotate-0");
  });
});

describe("Collapse", () => {
  it("dọc: grid-rows 0fr → 1fr, lớp trong overflow-hidden cho tới khi entered; ngang dùng grid-cols", async () => {
    const ref = { current: null as HTMLDivElement | null };
    const ui = (visible: boolean) => (
      <Collapse visible={visible} ref={ref} data-testid="box" className="w-full">
        Nội dung
      </Collapse>
    );
    const { rerender, unmount } = render(ui(false));
    expect(ref.current).toBe(box());
    expect(box()).toHaveClass("grid", "grid-rows-[0fr]", "opacity-0", "w-full");
    expect(screen.getByText("Nội dung")).toHaveClass("min-h-0", "overflow-hidden");
    rerender(ui(true));
    await advance(250);
    expect(box()).toHaveClass("grid-rows-[1fr]", "opacity-100");
    expect(screen.getByText("Nội dung")).not.toHaveClass("overflow-hidden");
    unmount();

    render(
      <Collapse visible={false} orientation="horizontal" animateOpacity={false} data-testid="box">
        Ngang
      </Collapse>,
    );
    expect(box()).toHaveClass("inline-grid", "grid-cols-[0fr]");
    expect(box()).not.toHaveClass("opacity-0");
    expect(screen.getByText("Ngang")).toHaveClass("min-w-0");
  });

  it("unmountOnExit: không render khi ẩn", () => {
    render(
      <Collapse visible={false} unmountOnExit data-testid="box">
        Nội dung
      </Collapse>,
    );
    expect(screen.queryByTestId("box")).not.toBeInTheDocument();
  });
});

describe("Stagger", () => {
  function List({ visible, appear }: { visible: boolean; appear?: boolean }) {
    return (
      <Stagger visible={visible} appear={appear}>
        <div data-testid="a" />
        <Scale visible={false}>
          <div data-testid="b" />
        </Scale>
        <div data-testid="c" />
      </Stagger>
    );
  }
  const state = () => ["a", "b", "c"].map((id) => screen.getByTestId(id).getAttribute("data-motion"));

  it("visible từ đầu: mọi phần tử đã hiện; phần tử thường được bọc Fade, Scale được điều khiển visible", () => {
    render(<List visible />);
    expect(state()).toEqual(["entered", "entered", "entered"]);
    expect(screen.getByTestId("a")).toHaveClass("transition-opacity");
    expect(screen.getByTestId("b")).toHaveClass("scale-100");
  });

  it("hiện lần lượt theo itemDelay; ẩn theo thứ tự ngược lại", async () => {
    const { rerender } = render(<List visible={false} />);
    expect(state()).toEqual(["exited", "exited", "exited"]);
    rerender(<List visible />);
    await advance(50);
    expect(state()[0]).not.toBe("exited");
    expect(state().slice(1)).toEqual(["exited", "exited"]);
    await advance(100);
    expect(state()[1]).not.toBe("exited");
    expect(state()[2]).toBe("exited");
    await advance(400);
    expect(state()).toEqual(["entered", "entered", "entered"]);

    rerender(<List visible={false} />);
    await advance(50);
    expect(state()[2]).not.toBe("entered");
    expect(state()[0]).toBe("entered");
    await advance(600);
    expect(state()).toEqual(["exited", "exited", "exited"]);
  });

  it("prefers-reduced-motion: hiện tất cả cùng lúc", () => {
    setMediaQueries({ "prefers-reduced-motion": true });
    const { rerender } = render(<List visible={false} />);
    rerender(<List visible />);
    expect(state()).toEqual(["entered", "entered", "entered"]);
  });
});
