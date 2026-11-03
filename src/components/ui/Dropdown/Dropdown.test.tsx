import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../Field/Field";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Dropdown, DropdownDivider, DropdownGroup, DropdownOption, type DropdownProps } from "./Dropdown";

function Demo(props: Partial<DropdownProps> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <Dropdown aria-label="Màu" placeholder="Chọn màu" {...props}>
      <DropdownGroup label="Ấm">
        <DropdownOption value="red" media={<svg data-testid="media" />}>
          Đỏ
        </DropdownOption>
        <DropdownOption value="orange" disabled>
          Cam
        </DropdownOption>
      </DropdownGroup>
      <DropdownDivider />
      <DropdownGroup label="Lạnh">
        <DropdownOption value="blue">Xanh dương</DropdownOption>
      </DropdownGroup>
    </Dropdown>
  );
}

const trigger = () => screen.getByRole("combobox", { name: "Màu" });

describe("Dropdown", () => {
  it("trigger role combobox hiện placeholder; ref + className", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Demo ref={ref} className="w-48" />);
    expect(ref.current).toBe(trigger());
    expect(trigger()).toHaveTextContent("Chọn màu");
    expect(trigger()).toHaveAttribute("data-placeholder");
    expect(trigger()).toHaveClass("w-48", "h-8");
  });

  it("mở bằng bàn phím, listbox có nhóm; chọn option cập nhật trigger và báo onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} listboxClassName="max-w-80" />);
    trigger().focus();
    await user.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveClass("max-w-80", "shadow-16");
    expect(screen.getByRole("group", { name: "Ấm" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cam" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("media")).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Xanh dương" }));
    expect(onValueChange).toHaveBeenCalledWith("blue");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent("Xanh dương");
    expect(trigger()).not.toHaveAttribute("data-placeholder");
  });

  it("option đang chọn có aria-selected; controlled value", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Demo value="red" />);
    expect(trigger()).toHaveTextContent("Đỏ");
    rerender(<Demo value="blue" />);
    expect(trigger()).toHaveTextContent("Xanh dương");
    await user.click(trigger());
    expect(await screen.findByRole("option", { name: "Xanh dương" })).toHaveAttribute("aria-selected", "true");
  });

  it("disabled / aria-invalid gắn data-*; size large", () => {
    render(<Demo disabled aria-invalid size="large" />);
    expect(trigger()).toBeDisabled();
    expect(trigger()).toHaveAttribute("data-disabled", "true");
    expect(trigger()).toHaveAttribute("aria-invalid", "true");
    expect(trigger()).toHaveAttribute("data-invalid", "true");
    expect(trigger()).toHaveClass("h-10");
  });

  it("trong Field: nhãn và mô tả nối vào trigger", () => {
    render(
      <Field label="Quốc gia" hint="Nơi giao hàng">
        <Dropdown placeholder="Chọn">
          <DropdownOption value="vn">Việt Nam</DropdownOption>
        </Dropdown>
      </Field>,
    );
    const combobox = screen.getByRole("combobox", { name: "Quốc gia" });
    expect(combobox).toHaveAccessibleDescription("Nơi giao hàng");
  });

  it("listbox portal nhận theme của provider lồng", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider theme="dark">
        <Demo size="small" />
      </YugenProvider>,
    );
    expect(trigger()).toHaveClass("h-6");
    await user.click(trigger());
    expect(await screen.findByRole("listbox")).toHaveAttribute("data-theme", "dark");
  });
});
