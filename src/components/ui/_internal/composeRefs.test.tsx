import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useComposedRefs } from "./composeRefs";
import { Toolbar, ToolbarButton } from "../Toolbar/Toolbar";

function Box({ refs }: { refs: (React.Ref<HTMLDivElement> | undefined)[] }) {
  return <div ref={useComposedRefs(...refs)} />;
}

describe("useComposedRefs", () => {
  it("gán node cho mọi ref; khi gỡ: object ref về null, callback ref không có cleanup nhận null", () => {
    const object = React.createRef<HTMLDivElement>();
    const calls: (HTMLDivElement | null)[] = [];
    const callback = (node: HTMLDivElement | null) => {
      calls.push(node);
    };
    const { unmount } = render(<Box refs={[object, callback, undefined]} />);
    expect(object.current?.tagName).toBe("DIV");
    expect(calls).toEqual([object.current]);
    unmount();
    expect(object.current).toBeNull();
    expect(calls.at(-1)).toBeNull();
  });

  it("callback ref trả cleanup (React 19) → gọi cleanup, không gọi lại với null", () => {
    const cleanup = vi.fn();
    const calls: (HTMLDivElement | null)[] = [];
    const callback = (node: HTMLDivElement | null) => {
      calls.push(node);
      return cleanup;
    };
    const { unmount } = render(<Box refs={[callback]} />);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(1);
  });

  it("component có ref riêng (Toolbar) vẫn gọi cleanup của ref người dùng", () => {
    const cleanup = vi.fn();
    const ref = (node: HTMLDivElement | null) => {
      expect(node?.getAttribute("role")).toBe("toolbar");
      return cleanup;
    };
    const { unmount } = render(
      <Toolbar ref={ref} aria-label="Định dạng">
        <ToolbarButton>B</ToolbarButton>
      </Toolbar>,
    );
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
