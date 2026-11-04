import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useArrowNavigationGroup, useFocusableGroup, type UseArrowNavigationGroupOptions, type UseFocusableGroupOptions } from "./FocusManagement";

// jsdom không có layout: getClientRects() rỗng → mọi phần tử bị coi là ẩn. Giả lập "đang hiển thị" trừ phần tử có `hidden`;
// vị trí lưới đọc từ data-row / data-col (ô 10×10).
beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
    return { length: this.closest("[hidden]") ? 0 : 1 } as DOMRectList;
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const top = Number(this.getAttribute("data-row") ?? 0) * 10;
    const left = Number(this.getAttribute("data-col") ?? 0) * 10;
    return { top, left, bottom: top + 10, right: left + 10, width: 10, height: 10, x: left, y: top, toJSON() {} } as DOMRect;
  });
});

function Group({ children, ...options }: UseArrowNavigationGroupOptions & { children: React.ReactNode }) {
  return (
    <div aria-label="Nhóm" {...useArrowNavigationGroup<HTMLDivElement>(options)}>
      {children}
    </div>
  );
}

function Abc(options: UseArrowNavigationGroupOptions) {
  return (
    <>
      <button>Trước</button>
      <Group {...options}>
        <button>A</button>
        <button>B</button>
        <button>C</button>
      </Group>
      <button>Sau</button>
    </>
  );
}

const btn = (name: string) => screen.getByRole("button", { name });

describe("useArrowNavigationGroup", () => {
  it("roving tabindex: chỉ mục đầu nằm trong thứ tự Tab, Tab vào/ra nhóm một lần", async () => {
    const user = userEvent.setup();
    render(<Abc axis="horizontal" />);
    expect(btn("A")).toHaveAttribute("tabindex", "0");
    expect(btn("B")).toHaveAttribute("tabindex", "-1");
    expect(btn("C")).toHaveAttribute("tabindex", "-1");
    btn("Trước").focus();
    await user.tab();
    expect(btn("A")).toHaveFocus();
    await user.tab();
    expect(btn("Sau")).toHaveFocus();
  });

  it("horizontal: ←/→ đi theo thứ tự, ↑/↓ bỏ qua, Home/End tới đầu/cuối, không vòng khi circular=false", async () => {
    const user = userEvent.setup();
    render(<Abc axis="horizontal" />);
    btn("A").focus();
    await user.keyboard("{ArrowRight}");
    expect(btn("B")).toHaveFocus();
    expect(btn("B")).toHaveAttribute("tabindex", "0");
    expect(btn("A")).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowDown}");
    expect(btn("B")).toHaveFocus();
    await user.keyboard("{End}");
    expect(btn("C")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("C")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(btn("A")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(btn("A")).toHaveFocus();
  });

  it("circular: đi quá cuối quay về đầu và ngược lại", async () => {
    const user = userEvent.setup();
    render(<Abc axis="horizontal" circular />);
    btn("C").focus();
    await user.keyboard("{ArrowRight}");
    expect(btn("A")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(btn("C")).toHaveFocus();
  });

  it("vertical (mặc định): ↑/↓ đi theo thứ tự, ←/→ bỏ qua", async () => {
    const user = userEvent.setup();
    render(<Abc />);
    btn("A").focus();
    await user.keyboard("{ArrowRight}");
    expect(btn("A")).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(btn("C")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(btn("B")).toHaveFocus();
  });

  it("RTL: ← tiến tới mục sau, → lùi về mục trước", async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <Abc axis="both" />
      </DirectionProvider>,
    );
    btn("A").focus();
    await user.keyboard("{ArrowLeft}");
    expect(btn("B")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("A")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(btn("B")).toHaveFocus();
  });

  it("grid: ↑/↓ chọn ô ở hàng trên/dưới gần nhất theo chiều ngang, circular quay về hàng đầu", async () => {
    const user = userEvent.setup();
    render(
      <Group axis="grid" circular>
        {[0, 1].flatMap((row) =>
          [0, 1, 2].map((col) => (
            <button key={`${row}${col}`} data-row={row} data-col={col}>
              {`${row}-${col}`}
            </button>
          )),
        )}
      </Group>,
    );
    btn("0-1").focus();
    await user.keyboard("{ArrowDown}");
    expect(btn("1-1")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("1-2")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(btn("0-2")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(btn("1-2")).toHaveFocus();
  });

  it("grid không circular: dừng ở hàng cuối", async () => {
    const user = userEvent.setup();
    render(
      <Group axis="grid">
        <button data-row={0}>Trên</button>
        <button data-row={1}>Dưới</button>
      </Group>,
    );
    btn("Dưới").focus();
    await user.keyboard("{ArrowDown}");
    expect(btn("Dưới")).toHaveFocus();
  });

  it("Tab vào nhóm ưu tiên mục đang chọn (aria-checked / aria-selected)", () => {
    render(
      <Group axis="horizontal">
        <button>A</button>
        <button aria-checked="true" role="radio">
          B
        </button>
      </Group>,
    );
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("tabindex", "0");
    expect(btn("A")).toHaveAttribute("tabindex", "-1");
  });

  it("bỏ qua phần tử ẩn, aria-hidden và phần tử thuộc vùng con lồng bên trong", async () => {
    const user = userEvent.setup();
    render(
      <Group axis="horizontal">
        <button>A</button>
        <button hidden>Ẩn</button>
        <div aria-hidden="true">
          <button tabIndex={-1}>Bị ẩn</button>
        </div>
        <Group axis="horizontal">
          <button>Con</button>
        </Group>
        <button>B</button>
      </Group>,
    );
    btn("A").focus();
    await user.keyboard("{ArrowRight}");
    expect(btn("B")).toHaveFocus();
    // Vùng con quản lý tabindex riêng.
    expect(btn("Con")).toHaveAttribute("tabindex", "0");
  });

  it("không bắt phím mũi tên trong ô nhập văn bản", async () => {
    const user = userEvent.setup();
    render(
      <Group axis="horizontal">
        <input aria-label="Tên" defaultValue="ab" />
        <button>B</button>
      </Group>,
    );
    const input = screen.getByRole("textbox", { name: "Tên" });
    input.focus();
    await user.keyboard("{ArrowRight}");
    expect(input).toHaveFocus();
  });

  it("memorizeCurrent: Tab quay lại nhóm focus mục gần nhất; mặc định trở về mục đầu", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Abc axis="horizontal" memorizeCurrent />);
    btn("A").focus();
    await user.keyboard("{ArrowRight}");
    await user.tab();
    expect(btn("Sau")).toHaveFocus();
    await user.tab({ shift: true });
    expect(btn("B")).toHaveFocus();
    unmount();

    render(<Abc axis="horizontal" />);
    btn("A").focus();
    await user.keyboard("{ArrowRight}");
    await user.tab();
    await user.tab({ shift: true });
    expect(btn("A")).toHaveFocus();
  });

  it("tabbable: không đổi tabindex, mọi mục vẫn Tab tới được", async () => {
    const user = userEvent.setup();
    render(<Abc axis="horizontal" tabbable />);
    expect(btn("B")).not.toHaveAttribute("tabindex");
    btn("A").focus();
    await user.tab();
    expect(btn("B")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("C")).toHaveFocus();
  });

  it("cập nhật tabindex khi mục mới được thêm vào", async () => {
    const { rerender } = render(
      <Group axis="horizontal">
        <></>
      </Group>,
    );
    rerender(
      <Group axis="horizontal">
        <button>Mới</button>
        <button>Mới 2</button>
      </Group>,
    );
    await vi.waitFor(() => expect(btn("Mới")).toHaveAttribute("tabindex", "0"));
    expect(btn("Mới 2")).toHaveAttribute("tabindex", "-1");
  });

  it("role được gắn lên phần tử chứa", () => {
    render(
      <Group role="toolbar">
        <button>A</button>
      </Group>,
    );
    expect(screen.getByRole("toolbar", { name: "Nhóm" })).toHaveAttribute("data-focus-scope", "arrow");
  });
});

function Card({ tabBehavior }: UseFocusableGroupOptions) {
  return (
    <>
      <button>Trước</button>
      <div aria-label="Thẻ" role="group" {...useFocusableGroup<HTMLDivElement>({ tabBehavior })}>
        <button>Thích</button>
        <a href="#chia-se" tabIndex={0}>
          Chia sẻ
        </a>
      </div>
      <button>Sau</button>
    </>
  );
}

const card = () => screen.getByRole("group", { name: "Thẻ" });

describe("useFocusableGroup", () => {
  it("limited: thẻ là một điểm dừng Tab, phần tử bên trong bị loại khỏi thứ tự Tab", async () => {
    const user = userEvent.setup();
    render(<Card />);
    expect(card()).toHaveAttribute("tabindex", "0");
    expect(btn("Thích")).toHaveAttribute("tabindex", "-1");
    btn("Trước").focus();
    await user.tab();
    expect(card()).toHaveFocus();
    await user.tab();
    expect(btn("Sau")).toHaveFocus();
  });

  it("Enter vào nhóm (khôi phục tabindex gốc), Esc trở lại thẻ", async () => {
    const user = userEvent.setup();
    render(<Card />);
    card().focus();
    await user.keyboard("{Enter}");
    expect(btn("Thích")).toHaveFocus();
    expect(btn("Thích")).not.toHaveAttribute("tabindex");
    expect(screen.getByRole("link", { name: "Chia sẻ" })).toHaveAttribute("tabindex", "0");
    await user.tab();
    expect(screen.getByRole("link", { name: "Chia sẻ" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(card()).toHaveFocus();
    expect(btn("Thích")).toHaveAttribute("tabindex", "-1");
  });

  it("phím khác Enter trên thẻ không vào nhóm", async () => {
    const user = userEvent.setup();
    render(<Card />);
    card().focus();
    await user.keyboard("{ArrowDown}");
    expect(card()).toHaveFocus();
  });

  it("rời nhóm bằng Tab: phần tử bên trong lại bị loại khỏi thứ tự Tab", async () => {
    const user = userEvent.setup();
    render(<Card />);
    card().focus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.tab();
    expect(btn("Sau")).toHaveFocus();
    expect(btn("Thích")).toHaveAttribute("tabindex", "-1");
  });

  it("limited-trap-focus: Tab / Shift+Tab xoay vòng bên trong", async () => {
    const user = userEvent.setup();
    render(<Card tabBehavior="limited-trap-focus" />);
    card().focus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.tab();
    expect(btn("Thích")).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("link", { name: "Chia sẻ" })).toHaveFocus();
  });

  it("unlimited: Tab đi xuyên qua các phần tử bên trong", async () => {
    const user = userEvent.setup();
    render(<Card tabBehavior="unlimited" />);
    expect(btn("Thích")).not.toHaveAttribute("tabindex");
    card().focus();
    await user.tab();
    expect(btn("Thích")).toHaveFocus();
  });
});
