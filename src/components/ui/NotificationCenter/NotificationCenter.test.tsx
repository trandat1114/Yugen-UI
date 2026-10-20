import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NotificationCenter,
  formatNotificationDay,
  formatRelativeTime,
  useNotifications,
  type NotificationItem,
} from "./NotificationCenter";

const NOW = new Date(2026, 9, 21, 15, 0).getTime();
const ITEMS: NotificationItem[] = [
  { id: "1", title: "Lan nhắc bạn", body: "Xem giúp bản thiết kế.", author: "Trần Lan", time: NOW - 5 * 60_000 },
  { id: "2", title: "Bản build xong", intent: "success", time: NOW - 3 * 3_600_000 },
  { id: "3", title: "Họp tuần", time: NOW - 26 * 3_600_000, read: true },
];

function Demo() {
  const store = useNotifications(ITEMS);
  return <NotificationCenter {...store.bind} now={NOW} mode="popover" />;
}

describe("NotificationCenter", () => {
  it("thời gian tương đối và nhãn ngày", () => {
    expect(formatRelativeTime(NOW - 20_000, NOW)).toBe("Vừa xong");
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe("5 phút trước");
    expect(formatRelativeTime(NOW - 3 * 3_600_000, NOW)).toBe("3 giờ trước");
    expect(formatNotificationDay(NOW - 3 * 3_600_000, NOW)).toBe("Hôm nay");
    expect(formatNotificationDay(NOW - 26 * 3_600_000, NOW)).toBe("Hôm qua");
  });

  it("đếm chưa đọc trên nút, nhóm theo ngày, đánh dấu đã đọc / tất cả, lọc", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const bell = screen.getByRole("button", { name: "Thông báo, 2 chưa đọc" });
    await user.click(bell);
    const panel = await screen.findByRole("dialog", { name: "Thông báo" });
    expect(within(panel).getByRole("heading", { name: "Hôm nay" })).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "Hôm qua" })).toBeInTheDocument();
    expect(within(panel).getByText("5 phút trước")).toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: "Đánh dấu đã đọc: Lan nhắc bạn" }));
    expect(screen.getByRole("button", { name: "Thông báo, 1 chưa đọc" })).toBeInTheDocument();

    await user.click(within(panel).getByRole("tab", { name: /Chưa đọc/ }));
    const unreadPanel = within(panel).getByRole("tabpanel");
    expect(within(unreadPanel).getByText("Bản build xong")).toBeInTheDocument();
    expect(within(unreadPanel).queryByText("Lan nhắc bạn")).toBeNull();

    await user.click(within(panel).getByRole("button", { name: "Đánh dấu tất cả đã đọc" }));
    expect(screen.getByRole("button", { name: "Thông báo" })).toBeInTheDocument();
    expect(within(panel).getByText("Bạn đã đọc hết")).toBeInTheDocument();
  });

  it("bỏ thông báo", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: /Thông báo/ }));
    const panel = await screen.findByRole("dialog");
    await user.click(within(panel).getByRole("button", { name: "Bỏ thông báo: Họp tuần" }));
    expect(within(panel).queryByText("Họp tuần")).toBeNull();
    expect(within(panel).queryByRole("heading", { name: "Hôm qua" })).toBeNull();
  });
});
