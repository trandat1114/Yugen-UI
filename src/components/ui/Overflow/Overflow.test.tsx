import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import {
  Overflow,
  OverflowDivider,
  OverflowItem,
  computeOverflow,
  getOverflowGroups,
  useOverflowItems,
  useOverflowMenu,
  type OverflowProps,
} from "./Overflow";

const items = (sizes: number[], priorities: number[] = []) =>
  sizes.map((size, i) => ({ id: `i${i}`, size, priority: priorities[i] ?? 0 }));

describe("computeOverflow", () => {
  it("vừa đủ chỗ → không ẩn gì, không cần menu", () => {
    expect(computeOverflow({ available: 300, items: items([100, 100, 100]), menuSize: 40 })).toEqual({
      visibleIds: ["i0", "i1", "i2"],
      hiddenIds: [],
    });
  });

  it("thiếu chỗ → chừa chỗ cho menu, ẩn từ cuối", () => {
    const r = computeOverflow({ available: 300, items: items([100, 100, 100, 100]), menuSize: 40 });
    expect(r.visibleIds).toEqual(["i0", "i1"]);
    expect(r.hiddenIds).toEqual(["i2", "i3"]);
  });

  it("overflowDirection=start ẩn từ đầu", () => {
    const r = computeOverflow({ available: 300, items: items([100, 100, 100, 100]), menuSize: 40, overflowDirection: "start" });
    expect(r.hiddenIds).toEqual(["i0", "i1"]);
  });

  it("priority cao ở lại; dừng ở item đầu tiên không vừa (không chen item ưu tiên thấp)", () => {
    const r = computeOverflow({ available: 260, items: items([100, 150, 50, 50], [0, 2, 1, 0]), menuSize: 40 });
    // i1 (2) → i2 (1) → i0 (0) không vừa → dừng; i3 nhỏ cũng không được chen vào.
    expect(r.visibleIds).toEqual(["i1", "i2"]);
    expect(r.hiddenIds).toEqual(["i0", "i3"]);
  });

  it("gap, phần tử cố định và padding được tính", () => {
    const base = { items: items([50, 50, 50]), menuSize: 20 };
    expect(computeOverflow({ ...base, available: 150 }).hiddenIds).toEqual([]);
    // 3 × 50 + 2 × 8 gap = 166 > 150 → 2 item + menu + 2 gap = 136.
    expect(computeOverflow({ ...base, available: 150, gap: 8 }).hiddenIds).toEqual(["i2"]);
    expect(computeOverflow({ ...base, available: 180, fixedSize: 40, fixedCount: 1 }).hiddenIds).toEqual(["i2"]);
    expect(computeOverflow({ ...base, available: 160, padding: 20 }).hiddenIds).toEqual(["i2"]);
  });

  it("minimumVisible giữ item dù không vừa", () => {
    const r = computeOverflow({ available: 50, items: items([100, 100, 100]), menuSize: 40, minimumVisible: 1 });
    expect(r.visibleIds).toEqual(["i0"]);
    expect(computeOverflow({ available: 10, items: items([100, 100]), minimumVisible: 5 }).hiddenIds).toEqual([]);
  });

  it("divider của nhóm chỉ tính khi nhóm còn item hiển thị", () => {
    const r = computeOverflow({
      available: 230,
      items: [
        { id: "a", size: 100, groupId: "g1" },
        { id: "b", size: 100, groupId: "g2" },
      ],
      dividers: [
        { groupId: "g1", size: 20 },
        { groupId: "g2", size: 20 },
      ],
      menuSize: 30,
    });
    // a + divider g1 + menu = 150; thêm b + divider g2 = 270 > 230.
    expect(r.hiddenIds).toEqual(["b"]);
    expect(getOverflowGroups([{ id: "a", groupId: "g1" }, { id: "b", groupId: "g2" }], r.hiddenIds)).toEqual({
      g1: "visible",
      g2: "hidden",
    });
  });
});

/* ------------------------------------------------------------------ Component (đo giả lập) */

const resizeCallbacks: (() => void)[] = [];

beforeEach(() => {
  resizeCallbacks.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeCallbacks.push(() => cb([], this as unknown as ResizeObserver));
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  // jsdom không có layout: độ rộng lấy từ data-w.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const w = Number(this.dataset.w ?? 0);
    return { width: w, height: 20, top: 0, left: 0, right: w, bottom: 20, x: 0, y: 0, toJSON() {} } as DOMRect;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function MoreButton() {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hidden = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <button ref={ref} data-w="40" aria-label={`Thêm ${overflowCount} mục`} data-hidden={hidden.join(",")}>
      …
    </button>
  );
}

function Bar({ width = 300, priorities = [] as number[], ...props }: { width?: number; priorities?: number[] } & Partial<OverflowProps>) {
  return (
    <Overflow {...props}>
      <div data-testid="bar" data-w={width}>
        {["Mới", "Lưu", "Cắt", "Dán", "In"].map((label, i) => (
          <OverflowItem key={label} id={label} priority={priorities[i]}>
            <button data-w="100">{label}</button>
          </OverflowItem>
        ))}
        <MoreButton />
      </div>
    </Overflow>
  );
}

describe("Overflow", () => {
  it("container nhận class đo + ẩn item không vừa (hidden, data-overflowing, data-disabled)", () => {
    render(<Bar />);
    const bar = screen.getByTestId("bar");
    expect(bar).toHaveAttribute("data-overflow-container");
    expect(bar.className).toContain("overflow-hidden");
    expect(bar.className).toContain("min-w-0");

    const more = screen.getByRole("button", { name: "Thêm 3 mục" });
    expect(more).toHaveAttribute("data-hidden", "Cắt,Dán,In");
    expect(screen.getByRole("button", { name: "Mới" })).not.toHaveAttribute("hidden");
    const hidden = screen.getByText("In");
    expect(hidden).toHaveAttribute("hidden");
    expect(hidden).toHaveAttribute("data-overflowing");
    expect(hidden).toHaveAttribute("data-disabled");
    // Phần tử ẩn ra khỏi cây trợ năng → không có role button.
    expect(screen.queryByRole("button", { name: "In" })).not.toBeInTheDocument();
  });

  it("ResizeObserver báo đổi kích thước → tính lại (mở rộng thì hiện lại, menu biến mất)", () => {
    const onOverflowChange = vi.fn();
    render(<Bar onOverflowChange={onOverflowChange} />);
    expect(screen.getByRole("button", { name: "Thêm 3 mục" })).toBeInTheDocument();

    screen.getByTestId("bar").dataset.w = "600";
    act(() => resizeCallbacks.forEach((cb) => cb()));
    expect(screen.queryByRole("button", { name: /Thêm/ })).not.toBeInTheDocument();
    expect(screen.getByText("In")).not.toHaveAttribute("hidden");
    expect(onOverflowChange).toHaveBeenLastCalledWith({ hiddenIds: [], visibleIds: ["Mới", "Lưu", "Cắt", "Dán", "In"] });

    screen.getByTestId("bar").dataset.w = "230";
    act(() => resizeCallbacks.forEach((cb) => cb()));
    expect(screen.getByRole("button", { name: "Thêm 4 mục" })).toBeInTheDocument();
  });

  it("priority giữ item quan trọng; minimumVisible", () => {
    const { unmount } = render(<Bar priorities={[0, 0, 0, 0, 5]} />);
    expect(screen.getByText("In")).not.toHaveAttribute("hidden");
    expect(screen.getByRole("button", { name: "Thêm 3 mục" })).toHaveAttribute("data-hidden", "Lưu,Cắt,Dán");
    unmount();

    render(<Bar width={60} minimumVisible={2} />);
    expect(screen.getByRole("button", { name: "Thêm 3 mục" })).toBeInTheDocument();
  });

  it("OverflowDivider ẩn khi cả nhóm bị ẩn (child không cần chuyển tiếp ref)", () => {
    function Divider(props: React.HTMLAttributes<HTMLSpanElement>) {
      return <span data-w="10" {...props} />;
    }
    render(
      <Overflow>
        <div data-w="250">
          <OverflowItem id="a" groupId="a">
            <button data-w="100">A</button>
          </OverflowItem>
          <OverflowDivider groupId="a">
            <Divider data-testid="div-a" />
          </OverflowDivider>
          <OverflowItem id="b" groupId="b">
            <button data-w="100">B</button>
          </OverflowItem>
          <OverflowDivider groupId="b">
            <Divider data-testid="div-b" />
          </OverflowDivider>
          <OverflowItem id="c" groupId="c">
            <button data-w="100">C</button>
          </OverflowItem>
          <MoreButton />
        </div>
      </Overflow>,
    );
    // A + div + B + div + menu = 260 > 250 → chỉ còn A.
    expect(screen.getByRole("button", { name: "Thêm 2 mục" })).toBeInTheDocument();
    expect(screen.getByTestId("div-a")).not.toHaveAttribute("hidden");
    expect(screen.getByTestId("div-b")).toHaveAttribute("hidden");
  });

  it("render đầu / ngoài trình duyệt: mọi item hiển thị (OverflowItem ngoài Overflow vẫn render bình thường)", () => {
    render(
      <OverflowItem id="x">
        <button>X</button>
      </OverflowItem>,
    );
    expect(screen.getByRole("button", { name: "X" })).not.toHaveAttribute("hidden");
  });
});
