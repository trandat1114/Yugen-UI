import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useIntersection, type UseIntersectionOptions } from "./useIntersection";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const instances: { callback: Callback; options?: IntersectionObserverInit; observed: Element[]; disconnect: ReturnType<typeof vi.fn> }[] = [];

function stubObserver() {
  instances.length = 0;
  class Stub {
    observed: Element[] = [];
    disconnect = vi.fn();
    constructor(
      public callback: Callback,
      public options?: IntersectionObserverInit,
    ) {
      instances.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve() {}
  }
  vi.stubGlobal("IntersectionObserver", Stub);
}
afterEach(() => vi.unstubAllGlobals());

function Probe(options: UseIntersectionOptions) {
  const { ref, isIntersecting, entry } = useIntersection<HTMLDivElement>(options);
  return (
    <div ref={ref} data-ratio={entry?.intersectionRatio ?? ""}>
      {isIntersecting ? "thấy" : "ẩn"}
    </div>
  );
}

describe("useIntersection", () => {
  it("theo dõi trạng thái giao nhau và trả entry mới nhất", () => {
    stubObserver();
    render(<Probe />);
    expect(screen.getByText("ẩn")).toBeInTheDocument();
    act(() => instances[0].callback([{ isIntersecting: true, intersectionRatio: 0.5 }]));
    expect(screen.getByText("thấy")).toHaveAttribute("data-ratio", "0.5");
    act(() =>
      instances[0].callback([
        { isIntersecting: true, intersectionRatio: 1 },
        { isIntersecting: false, intersectionRatio: 0 },
      ]),
    );
    expect(screen.getByText("ẩn")).toBeInTheDocument();
  });

  it("once: ngắt theo dõi và giữ true sau lần thấy đầu tiên", () => {
    stubObserver();
    render(<Probe once />);
    act(() => instances[0].callback([{ isIntersecting: true }]));
    expect(instances[0].disconnect).toHaveBeenCalled();
    expect(screen.getByText("thấy")).toBeInTheDocument();
  });

  it("đổi option thì theo dõi lại; threshold mảng mới cùng giá trị thì không", () => {
    stubObserver();
    const { rerender } = render(<Probe rootMargin="0px" threshold={[0, 0.5]} />);
    rerender(<Probe rootMargin="0px" threshold={[0, 0.5]} />);
    expect(instances).toHaveLength(1);
    rerender(<Probe rootMargin="200px" threshold={[0, 0.5]} />);
    expect(instances).toHaveLength(2);
    expect(instances[0].disconnect).toHaveBeenCalled();
    expect(instances[1].options).toMatchObject({ rootMargin: "200px", threshold: [0, 0.5] });
    expect(instances[1].observed).toHaveLength(1);
  });

  it("ngắt theo dõi khi unmount", () => {
    stubObserver();
    const { unmount } = render(<Probe />);
    unmount();
    expect(instances[0].disconnect).toHaveBeenCalled();
  });

  it("không có IntersectionObserver: false, không lỗi", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe />);
    expect(screen.getByText("ẩn")).toBeInTheDocument();
  });
});
