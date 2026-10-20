import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox, normalizeSearchText, type ComboboxProps } from "./Combobox";

const CITIES = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", { value: "Cần Thơ", disabled: true }];

function setup(props: Partial<ComboboxProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <>
      <label htmlFor="city">Thành phố</label>
      <Combobox id="city" options={CITIES} placeholder="Chọn thành phố" onValueChange={onValueChange} {...(props as object)} />
    </>,
  );
  const input = screen.getByRole("combobox", { name: "Thành phố" });
  const optionNames = () => screen.queryAllByRole("option").map((o) => o.textContent);
  const active = () => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? document.getElementById(id)?.textContent : null;
  };
  return { user, input, onValueChange, optionNames, active };
}

describe("normalizeSearchText", () => {
  it("bỏ dấu tiếng Việt, đ → d, chữ thường, cắt khoảng trắng", () => {
    expect(normalizeSearchText("  Đà Nẵng ")).toBe("da nang");
    expect(normalizeSearchText("HỒ CHÍ MINH")).toBe("ho chi minh");
    expect(normalizeSearchText("Huế")).toBe("hue");
  });
});

describe("Combobox", () => {
  it("ARIA ban đầu: combobox đóng, không có listbox", () => {
    const { input } = setup();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ArrowDown mở danh sách, highlight mục đầu; mũi tên di chuyển (bỏ qua disabled, vòng quanh)", async () => {
    const { user, input, optionNames, active } = setup();
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    expect(optionNames()).toEqual(["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", "Cần Thơ"]);
    await waitFor(() => expect(active()).toBe("Hà Nội"));

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Hồ Chí Minh");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Huế");
    // Cần Thơ disabled → vòng về đầu.
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Hà Nội");
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("Huế");
  });

  it("gõ để lọc (không dấu khớp có dấu), Enter chọn mục đang highlight", async () => {
    const { user, input, optionNames, active, onValueChange } = setup();
    await user.click(input);
    await user.keyboard("da");
    expect(optionNames()).toEqual(["Đà Nẵng"]);
    expect(active()).toBe("Đà Nẵng");

    await user.clear(input);
    await user.keyboard("h");
    expect(optionNames()).toEqual(["Hà Nội", "Hồ Chí Minh", "Huế", "Cần Thơ"]);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("Hồ Chí Minh");
    expect(input).toHaveValue("Hồ Chí Minh");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });

  it("không có kết quả → thông báo trống", async () => {
    const { user, input, optionNames } = setup();
    await user.click(input);
    await user.keyboard("xyz");
    expect(optionNames()).toEqual([]);
    expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
  });

  it("Escape đóng danh sách, trả lại nhãn đã chọn (bỏ chữ đang gõ)", async () => {
    const { user, input, onValueChange } = setup({ defaultValue: "Huế" });
    expect(input).toHaveValue("Huế");
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}ha");
    expect(input).toHaveValue("ha");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Huế");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("mở lại → highlight mục đang chọn", async () => {
    const { user, input, active } = setup({ defaultValue: "Đà Nẵng" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(active()).toBe("Đà Nẵng"));
    expect(screen.getByRole("option", { name: "Đà Nẵng" })).toHaveAttribute("aria-selected", "true");
  });

  it("click option chọn giá trị", async () => {
    const { user, input, onValueChange } = setup();
    await user.click(screen.getByRole("button", { name: "Mở danh sách" }));
    await user.click(await screen.findByRole("option", { name: "Huế" }));
    expect(onValueChange).toHaveBeenLastCalledWith("Huế");
    expect(input).toHaveValue("Huế");
  });

  it("freeform: Enter giữ chữ tự gõ không khớp option", async () => {
    const { user, input, onValueChange } = setup({ freeform: true });
    await user.click(input);
    await user.keyboard("Vũng Tàu");
    expect(screen.getByText("Nhấn Enter để dùng “Vũng Tàu”")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("Vũng Tàu");
    expect(input).toHaveValue("Vũng Tàu");
  });

  it("multiselect: Enter bật/tắt từng mục, danh sách vẫn mở", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Thành phố" multiselect options={CITIES} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Thành phố" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội"]);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội", "Hồ Chí Minh"]);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Hồ Chí Minh" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["Hà Nội"]);
  });

  it("disabled: không mở được", async () => {
    const { user, input } = setup({ disabled: true });
    expect(input).toBeDisabled();
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
