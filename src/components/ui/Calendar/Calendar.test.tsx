import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Calendar, calendarMessagesEn } from "./Calendar";

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
});
