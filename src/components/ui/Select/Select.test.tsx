import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

function Demo(props: React.ComponentProps<typeof Select>) {
  return (
    <Select aria-label="Thành phố" {...props}>
      <option value="hn">Hà Nội</option>
      <option value="hcm">TP. Hồ Chí Minh</option>
    </Select>
  );
}

describe("Select", () => {
  it("thẻ select gốc có tên; ref tới select; className lên khung, selectClassName lên select", () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(<Demo ref={ref} className="w-60" selectClassName="font-semibold" />);
    const select = screen.getByRole("combobox", { name: "Thành phố" });
    expect(ref.current).toBe(select);
    expect(select).toHaveClass("font-semibold", "pe-9");
    expect(select.parentElement).toHaveClass("w-60", "h-8");
    // Mũi tên chỉ để trang trí.
    expect(select.nextElementSibling).toHaveAttribute("aria-hidden", "true");
  });

  it("chọn giá trị: uncontrolled + onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Demo defaultValue="hn" onChange={onChange} />);
    await user.selectOptions(screen.getByRole("combobox"), "hcm");
    expect(screen.getByRole("combobox")).toHaveValue("hcm");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("disabled / aria-invalid gắn data-* lên khung; size + appearance", () => {
    render(<Demo disabled aria-invalid size="large" appearance="underline" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    const root = select.parentElement!;
    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveClass("h-10", "rounded-none");
    expect(select).toHaveClass("pe-11");
  });

  it("size small", () => {
    render(<Demo size="small" />);
    expect(screen.getByRole("combobox").parentElement).toHaveClass("h-6");
  });
});
