import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Radio, RadioGroup, type RadioGroupProps } from "./RadioGroup";

function Demo(props: RadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <RadioGroup aria-label="Cỡ áo" {...props}>
      <Radio value="s" label="Nhỏ" />
      <Radio value="m" label="Vừa" />
      <Radio value="l" label="Lớn" disabled />
      <Radio value="xl" label="Rất lớn" />
    </RadioGroup>
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("RadioGroup", () => {
  it("radiogroup / radio có nhãn; ref + className; mặc định xếp dọc", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Demo ref={ref} className="gap-2" />);
    const group = screen.getByRole("radiogroup", { name: "Cỡ áo" });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass("flex-col", "gap-2");
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(radio("Lớn")).toBeDisabled();
  });

  it("uncontrolled: bấm nhãn chọn, onValueChange báo giá trị", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo defaultValue="s" onValueChange={onValueChange} />);
    expect(radio("Nhỏ")).toBeChecked();
    await user.click(screen.getByText("Vừa"));
    expect(radio("Vừa")).toBeChecked();
    expect(radio("Nhỏ")).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("m");
  });

  it("Tab vào mục đang chọn; mũi tên đi qua các mục, bỏ qua mục disabled; Space chọn", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="m" />);
    await user.tab();
    expect(radio("Vừa")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(radio("Rất lớn")).toHaveFocus();
    await user.keyboard(" ");
    expect(radio("Rất lớn")).toBeChecked();
    await user.keyboard("{ArrowUp}");
    expect(radio("Vừa")).toHaveFocus();
  });

  it("controlled: chỉ đổi theo value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Demo value="s" onValueChange={onValueChange} />);
    await user.click(radio("Vừa"));
    expect(onValueChange).toHaveBeenCalledWith("m");
    expect(radio("Nhỏ")).toBeChecked();
    rerender(<Demo value="m" onValueChange={onValueChange} />);
    expect(radio("Vừa")).toBeChecked();
  });

  it("layout horizontal / horizontal-stacked; id riêng của Radio", () => {
    const { rerender } = render(<Demo layout="horizontal" />);
    expect(screen.getByRole("radiogroup")).toHaveClass("flex-row");
    rerender(
      <RadioGroup layout="horizontal-stacked">
        <Radio value="a" id="opt-a" label="A" className="w-16" />
      </RadioGroup>,
    );
    expect(radio("A")).toHaveAttribute("id", "opt-a");
    expect(radio("A").parentElement).toHaveClass("flex-col", "w-16");
    expect(screen.getByText("A")).toHaveClass("text-center");
  });
});
