import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { MonthPicker, YearPicker } from "./MonthPicker";
import { DateTimePicker } from "./DateTimePicker";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

describe("MonthPicker", () => {
  it("hiển thị theo locale, chọn tháng bằng chuột", async () => {
    const onValueChange = vi.fn();
    render(<MonthPicker aria-label="Expiry" defaultValue={new Date(2026, 10, 1)} onValueChange={onValueChange} />, { wrapper: english });
    const trigger = screen.getByRole("combobox", { name: "Expiry" });
    expect(trigger).toHaveTextContent("November 2026");
    await userEvent.click(trigger);
    const grid = screen.getByRole("grid", { name: "2026" });
    expect(grid).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "Nov" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("gridcell", { name: "Nov" })).toHaveFocus();
    await userEvent.click(screen.getByRole("gridcell", { name: "Mar" }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
    expect(trigger).toHaveTextContent("March 2026");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("bàn phím: mũi tên, PageUp đổi năm, Enter chọn", async () => {
    const onValueChange = vi.fn();
    render(<MonthPicker aria-label="Month" defaultValue={new Date(2026, 0, 1)} onValueChange={onValueChange} />, { wrapper: english });
    await userEvent.click(screen.getByRole("combobox", { name: "Month" }));
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("grid", { name: "2025" })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "Dec" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{PageDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 1));
  });

  it("minDate / maxDate: tháng ngoài khoảng không chọn được, nút năm bị khoá", async () => {
    const onValueChange = vi.fn();
    render(
      <MonthPicker aria-label="Month" defaultValue={new Date(2026, 5, 1)} minDate={new Date(2026, 3, 10)} maxDate={new Date(2026, 8, 1)} onValueChange={onValueChange} />,
      { wrapper: english },
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Month" }));
    const march = screen.getByRole("gridcell", { name: "Mar" });
    expect(march).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(march);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("gridcell", { name: "Apr" })).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("button", { name: "Previous year" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next year" })).toBeDisabled();
  });

  it("clearable báo null; chuỗi tiếng Việt", async () => {
    const onValueChange = vi.fn();
    render(<MonthPicker aria-label="Tháng" defaultValue={new Date(2026, 0, 1)} clearable onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Xoá giá trị" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("combobox", { name: "Tháng" })).toHaveTextContent("Chọn tháng…");
  });
});

describe("YearPicker", () => {
  it("lưới 12 năm, PageUp sang 12 năm trước", async () => {
    const onValueChange = vi.fn();
    render(<YearPicker aria-label="Year" defaultValue={new Date(2026, 0, 1)} onValueChange={onValueChange} />, { wrapper: english });
    const trigger = screen.getByRole("combobox", { name: "Year" });
    expect(trigger).toHaveTextContent("2026");
    await userEvent.click(trigger);
    expect(screen.getByRole("grid", { name: "2016 – 2027" })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(12);
    await userEvent.keyboard("{PageUp}");
    expect(screen.getByRole("grid", { name: "2004 – 2015" })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "2014" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Later years" }));
    await userEvent.click(screen.getByRole("gridcell", { name: "2020" }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2020, 0, 1));
  });
});

describe("DateTimePicker", () => {
  it("chọn ngày giữ giờ, đổi giờ giữ ngày", async () => {
    const onValueChange = vi.fn();
    render(<DateTimePicker aria-label="Start" defaultValue={new Date(2026, 10, 5, 14, 30)} onValueChange={onValueChange} />, { wrapper: english });
    const trigger = screen.getByRole("combobox", { name: "Start" });
    expect(trigger).toHaveTextContent("11/05/2026 2:30 PM");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: /November 12/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 10, 12, 14, 30));
    const time = screen.getByRole("combobox", { name: "Time" });
    await userEvent.clear(time);
    await userEvent.type(time, "9:15 AM{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 10, 12, 9, 15));
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(trigger).toHaveTextContent("11/12/2026 9:15 AM");
  });

  it("giờ chọn trước khi có ngày được dùng khi chọn ngày", async () => {
    const onValueChange = vi.fn();
    render(<DateTimePicker aria-label="Start" hourCycle="h23" onValueChange={onValueChange} />, { wrapper: english });
    await userEvent.click(screen.getByRole("combobox", { name: "Start" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Time" }), "18:00{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    const day = screen.getAllByRole("button").find((b) => b.textContent === "15")!;
    await userEvent.click(day);
    const value = onValueChange.mock.calls.at(-1)![0] as Date;
    expect([value.getDate(), value.getHours(), value.getMinutes()]).toEqual([15, 18, 0]);
  });
});
