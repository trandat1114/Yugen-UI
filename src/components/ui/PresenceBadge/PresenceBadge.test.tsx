import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { PresenceBadge, presenceBadgeMessagesVi, type PresenceBadgeStatus } from "./PresenceBadge";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("PresenceBadge", () => {
  it("role img, mặc định available / medium; ref + className gộp; icon aria-hidden", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<PresenceBadge ref={ref} className="absolute" />);
    const badge = screen.getByRole("img", { name: "Có mặt" });
    expect(ref.current).toBe(badge);
    expect(badge).toHaveClass("absolute", "size-4", "text-success-foreground-1");
    expect(badge.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("nhãn theo trạng thái: tiếng Anh mặc định, tiếng Việt qua presenceBadgeMessagesVi", () => {
    const statuses: PresenceBadgeStatus[] = ["available", "away", "busy", "do-not-disturb", "offline", "out-of-office", "blocked", "unknown"];
    const { unmount } = renderBare(
      <>
        {statuses.map((status) => (
          <PresenceBadge key={status} status={status} />
        ))}
      </>,
    );
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual([
      "Available",
      "Away",
      "Busy",
      "Do not disturb",
      "Offline",
      "Out of office",
      "Blocked",
      "Unknown",
    ]);
    unmount();
    renderBare(
      <YugenProvider messages={{ presenceBadge: presenceBadgeMessagesVi }}>
        <PresenceBadge status="do-not-disturb" />
      </YugenProvider>,
    );
    expect(screen.getByRole("img", { name: "Không làm phiền" })).toBeInTheDocument();
  });

  it("outOfOffice: nối trạng thái phụ vào nhãn, đổi icon viền và màu tím", () => {
    const { container, rerender } = render(<PresenceBadge status="away" />);
    const filled = container.querySelector("svg")?.innerHTML;
    expect(screen.getByRole("img")).toHaveClass("text-marigold-active");
    rerender(<PresenceBadge status="away" outOfOffice />);
    expect(screen.getByRole("img", { name: "Vắng mặt, không ở văn phòng" })).toHaveClass("text-lavender-fg");
    expect(container.querySelector("svg")?.innerHTML).not.toBe(filled);
    // Trạng thái out-of-office không lặp lại phần phụ.
    rerender(<PresenceBadge status="out-of-office" outOfOffice />);
    expect(screen.getByRole("img", { name: "Không ở văn phòng" })).toBeInTheDocument();
  });

  it("màu: bận / chặn → danger; offline → foreground-3, offline + outOfOffice → tím", () => {
    render(
      <>
        <PresenceBadge status="busy" data-testid="busy" />
        <PresenceBadge status="blocked" data-testid="blocked" />
        <PresenceBadge status="offline" data-testid="offline" />
        <PresenceBadge status="offline" outOfOffice data-testid="offline-oof" />
        <PresenceBadge status="unknown" data-testid="unknown" />
        <PresenceBadge status="available" outOfOffice data-testid="available-oof" />
        <PresenceBadge status="busy" outOfOffice data-testid="busy-oof" />
        <PresenceBadge status="do-not-disturb" outOfOffice data-testid="dnd-oof" />
      </>,
    );
    expect(screen.getByTestId("busy")).toHaveClass("text-danger-foreground-1");
    expect(screen.getByTestId("blocked")).toHaveClass("text-danger-foreground-1");
    expect(screen.getByTestId("offline")).toHaveClass("text-foreground-3");
    expect(screen.getByTestId("offline-oof")).toHaveClass("text-lavender-fg");
    expect(screen.getByTestId("unknown")).toHaveClass("text-foreground-3");
    expect(screen.getByTestId("available-oof")).toHaveClass("text-success-foreground-1");
    expect(screen.getByTestId("busy-oof")).toHaveAttribute("aria-label", "Bận, không ở văn phòng");
    expect(screen.getByTestId("dnd-oof")).toHaveClass("text-danger-foreground-1");
  });

  it("size chọn kích thước + bộ icon; ring; label ghi đè", () => {
    render(
      <>
        <PresenceBadge size="tiny" data-testid="tiny" />
        <PresenceBadge size="extra-large" ring data-testid="xl" />
        <PresenceBadge label="Đang họp" status="busy" />
      </>,
    );
    expect(screen.getByTestId("tiny")).toHaveClass("size-1.5");
    expect(screen.getByTestId("tiny").querySelector("svg")).toHaveAttribute("width", "12");
    expect(screen.getByTestId("xl")).toHaveClass("size-7", "ring-2");
    expect(screen.getByTestId("xl").querySelector("svg")).toHaveAttribute("width", "20");
    expect(screen.getByRole("img", { name: "Đang họp" })).toBeInTheDocument();
  });
});
