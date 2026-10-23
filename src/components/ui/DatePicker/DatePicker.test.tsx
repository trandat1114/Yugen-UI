import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  DEFAULT_RANGE_PRESETS,
  DatePicker,
  DateRangePicker,
  datePickerMessagesEn,
  dateRangePickerMessagesEn,
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
