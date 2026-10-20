import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../Field/Field";
import {
  TimePicker,
  formatTime,
  getDefaultHourCycle,
  getTimeBoundsError,
  getTimesInRange,
  parseTimeString,
  type TimePickerProps,
} from "./TimePicker";

const anchor = new Date(2026, 9, 20);
const hm = (d: Date | null) => (d ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}` : null);

describe("parseTimeString", () => {
  it.each([
    ["9", "9:00"],
    ["09", "9:00"],
    ["9:30", "9:30"],
    ["09.30", "9:30"],
    ["930", "9:30"],
    ["0930", "9:30"],
    ["2115", "21:15"],
    ["21:15", "21:15"],
    ["9h30", "9:30"],
    ["9h", "9:00"],
    ["9 giờ 30", "9:30"],
    ["9 30", "9:30"],
    ["9:30 PM", "21:30"],
    ["9pm", "21:00"],
    ["12 am", "0:00"],
    ["12:15 PM", "12:15"],
    ["9:30 CH", "21:30"],
    ["9:30 sa", "9:30"],
    ["7 tối", "19:00"],
    ["0:00", "0:00"],
  ])("%s → %s", (text, expected) => {
    expect(hm(parseTimeString(text, { dateAnchor: anchor }))).toBe(expected);
  });

  it.each(["", "abc", "24:00", "9:3", "9:75", "13 pm", "0 am", "12345", "9::30"])("không hợp lệ: %j", (text) => {
    expect(parseTimeString(text, { dateAnchor: anchor })).toBeNull();
  });

  it("gắn vào ngày của dateAnchor, giây theo chuỗi", () => {
    const d = parseTimeString("9:30:15", { dateAnchor: anchor })!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getSeconds()]).toEqual([2026, 9, 20, 15]);
  });
});

describe("formatTime / getDefaultHourCycle", () => {
  it("h23 có số 0 đầu; h12 dùng nhãn buổi theo locale", () => {
    expect(formatTime(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
    expect(formatTime(new Date(2026, 0, 1, 21, 30), { showSeconds: true })).toBe("21:30:00");
    expect(formatTime(new Date(2026, 0, 1, 21, 30), { hourCycle: "h12", locale: "en-US" })).toBe("9:30 PM");
    expect(formatTime(new Date(2026, 0, 1, 0, 15), { hourCycle: "h12", locale: "en-US" })).toBe("12:15 AM");
    expect(formatTime(new Date(2026, 0, 1, 14, 0), { hourCycle: "h12", locale: "vi-VN" })).toBe("2:00 CH");
  });

  it("vi-VN mặc định 24 giờ, en-US 12 giờ", () => {
    expect(getDefaultHourCycle("vi-VN")).toBe("h23");
    expect(getDefaultHourCycle("en-US")).toBe("h12");
    expect(getDefaultHourCycle("không-phải-locale")).toBe("h23");
  });
});

describe("getTimesInRange / getTimeBoundsError", () => {
  it("bước 30 phút cả ngày = 48 mốc; endHour không gồm", () => {
    const all = getTimesInRange({ dateAnchor: anchor });
    expect(all).toHaveLength(48);
    expect(hm(all[0])).toBe("0:00");
    expect(hm(all[47])).toBe("23:30");
    const work = getTimesInRange({ startHour: 8, endHour: 18, increment: 15, dateAnchor: anchor });
    expect(work).toHaveLength(40);
    expect(hm(work[work.length - 1])).toBe("17:45");
  });

  it("lọc theo minTime / maxTime (gồm)", () => {
    const list = getTimesInRange({ minTime: new Date(2000, 0, 1, 13, 30), maxTime: new Date(2000, 0, 1, 15, 0), dateAnchor: anchor });
    expect(list.map(hm)).toEqual(["13:30", "14:00", "14:30", "15:00"]);
  });

  it("phân loại lỗi ngoài khoảng", () => {
    const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m);
    expect(getTimeBoundsError(at(7), { startHour: 8, endHour: 18 })).toBe("out-of-start-bound");
    expect(getTimeBoundsError(at(18), { startHour: 8, endHour: 18 })).toBe("out-of-end-bound");
    expect(getTimeBoundsError(at(17, 59), { startHour: 8, endHour: 18 })).toBeUndefined();
    expect(getTimeBoundsError(at(13), { minTime: at(13, 30) })).toBe("out-of-start-bound");
    expect(getTimeBoundsError(at(17, 1), { maxTime: at(17) })).toBe("out-of-end-bound");
  });
});

/* ------------------------------------------------------------------ Component */

function setup(props: Partial<TimePickerProps> = {}) {
  const user = userEvent.setup();
  const onTimeChange = vi.fn();
  render(
    <Field label="Giờ họp">
      <TimePicker dateAnchor={anchor} onTimeChange={onTimeChange} {...props} />
    </Field>,
  );
  const input = screen.getByRole("combobox", { name: "Giờ họp" });
  const active = () => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? document.getElementById(id)?.textContent : null;
  };
  const last = () => onTimeChange.mock.calls.at(-1)?.[1];
  return { user, input, onTimeChange, active, last };
}

describe("TimePicker", () => {
  it("ArrowDown mở listbox (có tên), mũi tên di chuyển, Escape đóng", async () => {
    const { user, input, active } = setup();
    expect(input).toHaveAttribute("aria-expanded", "false");
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Giờ họp" });
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option")).toHaveLength(48);
    expect(active()).toBe("00:00");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("01:00");
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("00:30");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("gõ '930' + Enter → 09:30 (định dạng lại), onTimeChange đúng ngày", async () => {
    const { user, input, last } = setup();
    await user.click(input);
    await user.keyboard("930");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("09:30");
    expect(hm(last().selectedTime)).toBe("9:30");
    expect(last().selectedTime.getDate()).toBe(20);
    expect(last().selectedTimeText).toBe("09:30");
    expect(last().errorType).toBeUndefined();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("gõ dở '9:3' nhảy tới 09:30, Enter chọn option đang highlight", async () => {
    const { user, input, active, last } = setup();
    await user.click(input);
    await user.keyboard("9:3");
    expect(active()).toBe("09:30");
    await user.keyboard("{Enter}");
    expect(hm(last().selectedTime)).toBe("9:30");
  });

  it("giờ lẻ hợp lệ được chấp nhận; option được đánh dấu khi khớp", async () => {
    const { user, input, last } = setup();
    await user.click(input);
    await user.keyboard("21:15{Enter}");
    expect(input).toHaveValue("21:15");
    expect(hm(last().selectedTime)).toBe("21:15");
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "08:00" }));
    expect(hm(last().selectedTime)).toBe("8:00");
    await user.click(input);
    expect(screen.getByRole("option", { name: "08:00" })).toHaveAttribute("aria-selected", "true");
  });

  it("chữ không hợp lệ khi rời ô → errorType invalid-input, giữ nguyên chữ", async () => {
    const { user, input, last } = setup();
    await user.click(input);
    await user.keyboard("abc");
    await user.tab();
    expect(last()).toEqual({ selectedTime: null, selectedTimeText: "abc", errorType: "invalid-input" });
    expect(input).toHaveValue("abc");
  });

  it("ngoài khoảng startHour / endHour báo out-of-start-bound / out-of-end-bound", async () => {
    const { user, input, last } = setup({ startHour: 8, endHour: 18 });
    await user.click(input);
    await user.keyboard("7{Enter}");
    expect(last()).toMatchObject({ selectedTime: null, errorType: "out-of-start-bound" });
    await user.clear(input);
    await user.keyboard("18:00{Enter}");
    expect(last()).toMatchObject({ selectedTime: null, errorType: "out-of-end-bound" });
  });

  it("controlled + Field: aria-invalid, giá trị ngoài cập nhật hiển thị", () => {
    const { rerender } = render(
      <Field label="Giờ" validationState="error" validationMessage="Bắt buộc">
        <TimePicker value={null} />
      </Field>,
    );
    const input = screen.getByRole("combobox", { name: "Giờ" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Bắt buộc");
    rerender(
      <Field label="Giờ">
        <TimePicker value={new Date(2026, 0, 1, 14, 45)} hourCycle="h12" locale="en-US" />
      </Field>,
    );
    expect(input).toHaveValue("2:45 PM");
  });
});
