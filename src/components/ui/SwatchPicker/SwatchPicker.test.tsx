import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { ColorSwatch, EmptySwatch, ImageSwatch, SwatchPicker, swatchPickerMessagesVi } from "./SwatchPicker";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

// Điều hướng mũi tên (useArrowNavigationGroup) bỏ qua phần tử không có layout — jsdom luôn trả getClientRects() rỗng.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue({ length: 1 } as DOMRectList);
});

function Demo(props: React.ComponentProps<typeof SwatchPicker>) {
  return (
    <SwatchPicker aria-label="Màu chữ" {...props}>
      <ColorSwatch value="red" color="#d13438" aria-label="Đỏ" />
      <ColorSwatch value="green" color="#107c10" />
      <ColorSwatch value="blue" color="#0078d4" aria-label="Xanh dương" disabled />
      <ImageSwatch value="wood" src="/wood.png" aria-label="Gỗ" />
    </SwatchPicker>
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("SwatchPicker", () => {
  it("radiogroup / radio; aria-label mặc định là value; ref + className gộp", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Demo ref={ref} className="max-w-60" />);
    const group = screen.getByRole("radiogroup", { name: "Màu chữ" });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass("max-w-60", "flex", "gap-1");
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(radio("green")).toBeInTheDocument();
    expect(radio("Xanh dương")).toBeDisabled();
  });

  it("ColorSwatch tô màu nền; ImageSwatch dùng ảnh nền", () => {
    render(<Demo />);
    expect((radio("Đỏ").firstElementChild as HTMLElement).style.backgroundColor).toBe("rgb(209, 52, 56)");
    expect((radio("Gỗ").firstElementChild as HTMLElement).style.backgroundImage).toContain("/wood.png");
  });

  it("uncontrolled: bấm chọn, aria-checked + data-selected; bấm lại ô đang chọn vẫn gọi onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Demo defaultSelectedValue="red" onSelectionChange={onSelectionChange} />);
    expect(radio("Đỏ")).toHaveAttribute("aria-checked", "true");
    expect(radio("Đỏ")).toHaveAttribute("data-selected", "true");
    await user.click(radio("green"));
    expect(radio("green")).toHaveAttribute("aria-checked", "true");
    expect(radio("Đỏ")).toHaveAttribute("aria-checked", "false");
    expect(onSelectionChange).toHaveBeenLastCalledWith("green");
    await user.click(radio("green"));
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("controlled: chỉ đổi theo selectedValue", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const { rerender } = render(<Demo selectedValue="red" onSelectionChange={onSelectionChange} />);
    await user.click(radio("Gỗ"));
    expect(onSelectionChange).toHaveBeenCalledWith("wood");
    expect(radio("Đỏ")).toHaveAttribute("aria-checked", "true");
    rerender(<Demo selectedValue="wood" onSelectionChange={onSelectionChange} />);
    expect(radio("Gỗ")).toHaveAttribute("aria-checked", "true");
  });

  it("onClick gọi preventDefault thì không chọn", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <SwatchPicker onSelectionChange={onSelectionChange}>
        <ColorSwatch value="red" color="red" onClick={(e) => e.preventDefault()} />
      </SwatchPicker>,
    );
    await user.click(radio("red"));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("roving tabindex: Tab vào ô đang chọn; ←/→ đi vòng, bỏ qua ô disabled", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Demo defaultSelectedValue="green" onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} />
        <button>Sau</button>
      </>,
    );
    expect(radio("green")).toHaveAttribute("tabindex", "0");
    expect(radio("Đỏ")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(radio("green")).toHaveFocus();
    expect(onFocus).toHaveBeenCalled();
    await user.keyboard("{ArrowRight}");
    expect(radio("Gỗ")).toHaveFocus();
    expect(onKeyDown).toHaveBeenCalled();
    await user.keyboard("{ArrowRight}");
    expect(radio("Đỏ")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(radio("Gỗ")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Sau" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalled();
  });

  it("layout grid + columnCount: lưới inline-grid với số cột; spacing small", () => {
    render(<Demo layout="grid" columnCount={2} spacing="small" style={{ padding: 4 }} />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveClass("inline-grid", "gap-0.5");
    expect(group.style.gridTemplateColumns).toBe("repeat(2, max-content)");
    expect(group.style.padding).toBe("4px");
  });

  it("size / shape áp lên mọi ô", () => {
    render(<Demo size="large" shape="circular" />);
    expect(radio("Đỏ")).toHaveClass("size-8", "rounded-circular");
  });

  it("EmptySwatch: không phải radio, nhãn tiếng Anh mặc định, tiếng Việt qua swatchPickerMessagesVi", () => {
    const { unmount } = renderBare(
      <SwatchPicker>
        <EmptySwatch />
      </SwatchPicker>,
    );
    expect(screen.getByRole("button", { name: "Empty swatch" })).toHaveClass("border-dashed");
    unmount();
    renderBare(
      <YugenProvider messages={{ swatchPicker: swatchPickerMessagesVi }}>
        <SwatchPicker>
          <EmptySwatch />
          <EmptySwatch aria-label="Thêm màu" />
        </SwatchPicker>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Ô trống" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm màu" })).toBeInTheDocument();
  });
});
