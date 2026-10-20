import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { captureConsole } from "@/test/consoleCapture";
import { renderOnServer } from "@/test/serverRender";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelGroupProps } from "./Resizable";

const KEY = "react-resizable-panels:bo-cuc";

function Layout(props: Partial<ResizablePanelGroupProps>) {
  return (
    <ResizablePanelGroup orientation="horizontal" persistKey="bo-cuc" {...props}>
      <ResizablePanel id="a" defaultSize="40%">
        A
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="b" defaultSize="60%">
        B
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/** Hệ số giãn của panel (thư viện đặt kích thước % qua style.flexGrow). */
function grow(container: ParentNode, id: string) {
  const panel = container.querySelector<HTMLElement>(`[data-panel][id="${id}"]`);
  if (!panel) throw new Error(`Không thấy panel ${id}`);
  return Number(panel.style.flexGrow);
}

describe("ResizablePanelGroup persistKey", () => {
  it("render thuần client: khôi phục bố cục đã lưu ngay từ lần mount đầu", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ a: 25, b: 75 }));
    const setLayout = vi.fn();
    const { container } = render(
      <Layout groupRef={(handle) => {
        if (handle) vi.spyOn(handle, "setLayout").mockImplementation(setLayout);
      }} />,
    );
    expect(grow(container, "a")).toBe(25);
    expect(grow(container, "b")).toBe(75);
    // Không qua hydration → không cần áp lại bằng API mệnh lệnh.
    expect(setLayout).not.toHaveBeenCalled();
  });

  it("SSR + hydration: HTML server không phụ thuộc localStorage, không lệch hydration, bố cục đã lưu được áp sau đó", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ a: 25, b: 75 }));
    const html = renderOnServer(<Layout />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    // Server không đọc được localStorage → không có 25 / 75 trong HTML.
    expect(grow(container, "a")).not.toBe(25);

    const onRecoverableError = vi.fn();
    const capture = captureConsole();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <Layout />, { onRecoverableError });
      });
    } finally {
      capture.restore();
    }
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(capture.errors.filter((m) => /did not match|hydrat/i.test(m))).toEqual([]);

    expect(grow(container, "a")).toBe(25);
    expect(grow(container, "b")).toBe(75);
    // Bố cục mặc định lúc hydration không ghi đè bố cục đã lưu.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "{}")).toEqual({ a: 25, b: 75 });

    act(() => root?.unmount());
    container.remove();
  });

  it("defaultLayout truyền vào thắng bố cục đã lưu", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ a: 25, b: 75 }));
    const { container } = render(<Layout defaultLayout={{ a: 70, b: 30 }} />);
    expect(grow(container, "a")).toBe(70);
  });

  it("groupRef của người dùng vẫn nhận API mệnh lệnh", () => {
    const handles: (GroupImperativeHandle | null)[] = [];
    render(
      <Layout
        groupRef={(handle) => {
          handles.push(handle);
        }}
      />,
    );
    expect(typeof handles[0]?.setLayout).toBe("function");
    expect(typeof handles[0]?.getLayout).toBe("function");
  });
});
