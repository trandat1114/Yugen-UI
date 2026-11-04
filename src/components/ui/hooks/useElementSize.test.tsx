import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useElementSize, type UseElementSizeOptions } from "./useElementSize";

type Callback = (entries: Partial<ResizeObserverEntry>[]) => void;
const instances: { callback: Callback; observed: [Element, ResizeObserverOptions | undefined][]; disconnect: ReturnType<typeof vi.fn> }[] = [];

function stubObserver() {
  instances.length = 0;
  class Stub {
    observed: [Element, ResizeObserverOptions | undefined][] = [];
    disconnect = vi.fn();
    constructor(public callback: Callback) {
      instances.push(this);
    }
    observe(el: Element, options?: ResizeObserverOptions) {
      this.observed.push([el, options]);
    }
    unobserve() {}
  }
  vi.stubGlobal("ResizeObserver", Stub);
}
afterEach(() => vi.unstubAllGlobals());

function Probe(options: UseElementSizeOptions) {
  const { ref, width, height } = useElementSize<HTMLDivElement>(options);
  return (
    <div ref={ref} data-testid="box">
      {width}×{height}
    </div>
  );
}

const resize = (inlineSize: number, blockSize: number) =>
  act(() => instances[0].callback([{ target: screen.getByTestId("box"), contentBoxSize: [{ inlineSize, blockSize }] as never }]));

describe("useElementSize", () => {
  it("bắt đầu 0×0 rồi cập nhật theo ResizeObserver", () => {
    stubObserver();
    render(<Probe />);
    expect(screen.getByTestId("box")).toHaveTextContent("0×0");
    resize(320, 120);
    expect(screen.getByTestId("box")).toHaveTextContent("320×120");
  });

  it("đo lần đầu ngay khi gắn (trước ResizeObserver), trừ padding với content-box", () => {
    stubObserver();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 300, height: 100 } as DOMRect);
    function Padded() {
      const { ref, width, height } = useElementSize<HTMLDivElement>();
      return (
        <div ref={ref} data-testid="padded" style={{ padding: "10px" }}>
          {width}×{height}
        </div>
      );
    }
    render(<Padded />);
    expect(screen.getByTestId("padded")).toHaveTextContent("280×80");
  });

  it("lệch dưới nửa pixel không render lại", () => {
    stubObserver();
    render(<Probe />);
    resize(320, 120);
    const text = screen.getByTestId("box").firstChild;
    resize(320.2, 120.3);
    expect(screen.getByTestId("box")).toHaveTextContent("320×120");
    expect(screen.getByTestId("box").firstChild).toBe(text);
  });

  it("một observer cho mỗi phần tử, đúng box; ngắt khi unmount", () => {
    stubObserver();
    const { rerender, unmount } = render(<Probe box="border-box" />);
    rerender(<Probe box="border-box" />);
    expect(instances).toHaveLength(1);
    expect(instances[0].observed).toEqual([[screen.getByTestId("box"), { box: "border-box" }]]);
    unmount();
    expect(instances[0].disconnect).toHaveBeenCalled();
  });

  it("enabled: false — một lần render, không đo, không observer, 0×0; bật lại thì đo, tắt thì ngắt", () => {
    stubObserver();
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 300, height: 100 } as DOMRect);
    let renders = 0;
    function Counted(options: UseElementSizeOptions) {
      renders++;
      return <Probe {...options} />;
    }
    const { rerender } = render(<Counted enabled={false} />);
    expect(renders).toBe(1);
    expect(rect).not.toHaveBeenCalled();
    expect(instances).toHaveLength(0);
    expect(screen.getByTestId("box")).toHaveTextContent("0×0");

    rerender(<Counted enabled />);
    expect(screen.getByTestId("box")).toHaveTextContent("300×100");
    expect(instances).toHaveLength(1);

    rerender(<Counted enabled={false} />);
    expect(instances[0].disconnect).toHaveBeenCalled();
    expect(screen.getByTestId("box")).toHaveTextContent("0×0");
  });

  it("không có ResizeObserver: vẫn có số đo lần đầu, không lỗi", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    render(<Probe />);
    expect(screen.getByTestId("box")).toHaveTextContent("0×0");
  });
});
