import { afterEach, describe, expect, it, vi as vitest } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { resetDeprecationWarnings } from "@/lib/deprecate";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { vi } from "react-day-picker/locale/vi";
import { Calendar, calendarMessagesEn, type CalendarProps, type DateRange } from "./Calendar";

const month = new Date(2026, 9, 1);

describe("Calendar messages", () => {
  it("mặc định locale tiếng Việt, tuần bắt đầu từ Thứ Hai", () => {
    const { container } = render(<Calendar defaultMonth={month} />);
    expect(screen.getByRole("button", { name: "Đến tháng trước" })).toBeInTheDocument();
    expect(container.querySelector("th")).toHaveTextContent("T2");
  });

  it("calendarMessagesEn đổi sang locale tiếng Anh (tuần bắt đầu Chủ nhật)", () => {
    const { container } = render(
      <YugenProvider messages={{ calendar: calendarMessagesEn }}>
        <Calendar defaultMonth={month} />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Go to the Previous Month" })).toBeInTheDocument();
    expect(container.querySelector("th")).toHaveAttribute("aria-label", "Sunday");
  });

  it("nhãn ô ngày chứa đúng số hiện trên ô (en-US không dùng số thứ tự)", () => {
    render(
      <YugenProvider messages={{ calendar: calendarMessagesEn }}>
        <Calendar mode="single" defaultMonth={month} />
      </YugenProvider>,
    );
    const day = screen.getByRole("button", { name: /October 1, 2026/ });
    expect(day).toHaveTextContent("1");
    expect(day.getAttribute("aria-label")).not.toMatch(/1st/);
  });

  it("prop locale vẫn ưu tiên hơn calendarMessagesEn", () => {
    const { container } = render(
      <YugenProvider messages={{ calendar: calendarMessagesEn }}>
        <Calendar defaultMonth={month} locale={vi} />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Đến tháng trước" })).toBeInTheDocument();
    expect(container.querySelector("th")).toHaveTextContent("T2");
  });
});

describe("Calendar props (#371)", () => {
  afterEach(() => {
    vitest.restoreAllMocks();
    resetDeprecationWarnings();
  });

  it("selects with Yugen's own types", () => {
    const picked: (DateRange | undefined)[] = [];
    render(<Calendar mode="range" defaultMonth={month} onSelect={(range) => picked.push(range)} />);
    fireEvent.click(screen.getByText("12"));
    expect(picked.at(-1)?.from?.getDate()).toBe(12);
  });

  it("react-day-picker props still work until 1.0, with a deprecation warning once", () => {
    const warn = vitest.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Calendar defaultMonth={month} formatters={{ formatCaption: () => "Caption" }} />);
    expect(screen.getByText("Caption")).toBeInTheDocument();
    rerender(<Calendar defaultMonth={month} formatters={{ formatCaption: () => "Caption" }} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"Calendar.formatters" is deprecated and will be removed in v1.0.0');
  });

  it("no warning for Calendar's own props", () => {
    const warn = vitest.spyOn(console, "warn").mockImplementation(() => {});
    render(<Calendar mode="single" defaultMonth={month} disabled={{ dayOfWeek: [0] }} modifiers={{ booked: [month] }} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("CalendarProps names no react-day-picker prop", () => {
    // @ts-expect-error classNames belongs to react-day-picker, not CalendarProps
    const props: CalendarProps = { classNames: { day: "x" } };
    expect(props).toBeDefined();
  });
});
