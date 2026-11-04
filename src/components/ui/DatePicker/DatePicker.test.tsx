import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { watchDeprecations } from "@/test/deprecation";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  DEFAULT_RANGE_PRESETS,
  DatePicker,
  DateRangePicker,
  datePickerMessagesEn,
  dateRangePickerMessagesEn,
  formatDateVi,
} from "./DatePicker";

const date = new Date(2024, 2, 5);

describe("DatePicker messages", () => {
  it("mặc định tiếng Việt, ngày dd/MM/yyyy", () => {
    render(
      <>
        <DatePicker aria-label="Ngày" />
        <DatePicker aria-label="Ngày sinh" defaultValue={date} />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Ngày" })).toHaveTextContent("Chọn ngày…");
    expect(screen.getByRole("combobox", { name: "Ngày sinh" })).toHaveTextContent("05/03/2024");
  });

  it("định dạng theo locale của provider và dùng chuỗi tiếng Anh", () => {
    render(
      <YugenProvider locale="en-US" messages={{ datePicker: datePickerMessagesEn }}>
        <DatePicker aria-label="Date" />
        <DatePicker aria-label="Birthday" defaultValue={date} clearable />
      </YugenProvider>,
    );
    expect(screen.getByRole("combobox", { name: "Date" })).toHaveTextContent("Select a date…");
    expect(screen.getByRole("combobox", { name: "Birthday" })).toHaveTextContent("03/05/2024");
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("nhãn của DEFAULT_RANGE_PRESETS theo messages.dateRangePicker", async () => {
    render(
      <YugenProvider messages={{ dateRangePicker: dateRangePickerMessagesEn }}>
        <DateRangePicker aria-label="Range" presets={[...DEFAULT_RANGE_PRESETS, { label: "Riêng", range: () => ({ from: date, to: date }) }]} />
      </YugenProvider>,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Range" }));
    expect(screen.getByRole("group", { name: "Date range presets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last 7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Riêng" })).toBeInTheDocument();
  });
});

describe("DatePicker onValueChange", () => {
  const clear = () => userEvent.click(screen.getByRole("button", { name: "Xoá giá trị" }));

  it("báo null khi xoá", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Ngày" defaultValue={date} clearable onValueChange={onValueChange} />);
    await clear();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("onSelectDate (tên cũ) vẫn chạy, nhận undefined và cảnh báo một lần", async () => {
    const warnings = watchDeprecations();
    const onSelectDate = vi.fn();
    const { rerender } = render(<DatePicker aria-label="Ngày" defaultValue={date} clearable onSelectDate={onSelectDate} />);
    rerender(<DatePicker aria-label="Ngày" defaultValue={date} clearable onSelectDate={onSelectDate} />);
    await clear();
    expect(onSelectDate).toHaveBeenLastCalledWith(undefined);
    expect(warnings("DatePicker.onSelectDate")).toBe(1);
  });

  it("onValueChange thắng khi truyền cả hai", async () => {
    watchDeprecations();
    const onValueChange = vi.fn();
    const onSelectDate = vi.fn();
    render(<DatePicker aria-label="Ngày" defaultValue={date} clearable onValueChange={onValueChange} onSelectDate={onSelectDate} />);
    await clear();
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onSelectDate).not.toHaveBeenCalled();
  });
});

describe("DateRangePicker onValueChange", () => {
  const range = { from: date, to: new Date(2024, 2, 9) };
  const clear = () => userEvent.click(screen.getByRole("button", { name: "Xoá giá trị" }));

  it("báo null khi xoá", async () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker aria-label="Khoảng" defaultValue={range} clearable onValueChange={onValueChange} />);
    await clear();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("onSelectRange (tên cũ) vẫn chạy và cảnh báo một lần", async () => {
    const warnings = watchDeprecations();
    const onSelectRange = vi.fn();
    const { rerender } = render(<DateRangePicker aria-label="Khoảng" defaultValue={range} clearable onSelectRange={onSelectRange} />);
    rerender(<DateRangePicker aria-label="Khoảng" defaultValue={range} clearable onSelectRange={onSelectRange} />);
    await clear();
    expect(onSelectRange).toHaveBeenLastCalledWith(undefined);
    expect(warnings("DateRangePicker.onSelectRange")).toBe(1);
  });

  it("onValueChange thắng khi truyền cả hai", async () => {
    watchDeprecations();
    const onValueChange = vi.fn();
    const onSelectRange = vi.fn();
    render(
      <DateRangePicker aria-label="Khoảng" defaultValue={range} clearable onValueChange={onValueChange} onSelectRange={onSelectRange} />,
    );
    await clear();
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onSelectRange).not.toHaveBeenCalled();
  });
});

describe("formatDateVi (lỗi thời)", () => {
  it("vẫn định dạng dd/MM/yyyy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    expect(formatDateVi(date)).toBe("05/03/2024");
    expect(formatDateVi(date)).toBe("05/03/2024");
    expect(warnings("formatDateVi")).toBe(1);
  });
});
