import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Trace, TraceStep, formatTraceDuration } from "./Trace";

describe("formatTraceDuration", () => {
  it("dưới 1 giây → ms làm tròn", () => {
    expect(formatTraceDuration(0)).toBe("0ms");
    expect(formatTraceDuration(320)).toBe("320ms");
    expect(formatTraceDuration(12.4)).toBe("12ms");
    expect(formatTraceDuration(999.4)).toBe("999ms");
  });

  it("dưới 1 phút → giây, 1 chữ số thập phân", () => {
    expect(formatTraceDuration(1000)).toBe("1.0s");
    expect(formatTraceDuration(4200)).toBe("4.2s");
    expect(formatTraceDuration(59_900)).toBe("59.9s");
  });

  it("từ 1 phút → Xm YYs (giây đệm 2 chữ số, làm tròn xuống)", () => {
    expect(formatTraceDuration(60_000)).toBe("1m 00s");
    expect(formatTraceDuration(125_000)).toBe("2m 05s");
    expect(formatTraceDuration(125_900)).toBe("2m 05s");
    expect(formatTraceDuration(3_600_000)).toBe("60m 00s");
  });

  it("ranh giới làm tròn không sinh '1000ms' hay '60.0s'", () => {
    expect(formatTraceDuration(999.6)).toBe("1.0s");
    expect(formatTraceDuration(59_960)).toBe("1m 00s");
  });

  it("âm, NaN, vô cực → chuỗi rỗng", () => {
    expect(formatTraceDuration(-1)).toBe("");
    expect(formatTraceDuration(Number.NaN)).toBe("");
    expect(formatTraceDuration(Number.POSITIVE_INFINITY)).toBe("");
  });
});

describe("Trace", () => {
  const T = Date.UTC(2026, 9, 20, 8, 0, 0);

  it("tổng kết trạng thái + đồng hồ trực tiếp cho bước đang chạy", () => {
    vi.useFakeTimers({ now: T });
    render(
      <Trace title="Agent: tóm tắt hợp đồng" startedAt={T - 65_000}>
        <TraceStep status="success" title="Đọc tệp" duration={320} />
        <TraceStep status="running" title="Tóm tắt" startedAt={T - 4200} />
        <TraceStep status="pending" title="Gửi email" />
      </Trace>,
    );

    expect(screen.getByRole("region", { name: "Agent: tóm tắt hợp đồng" })).toBeInTheDocument();
    expect(screen.getByText(/Đang chạy · 1\/3 bước/)).toBeInTheDocument();
    expect(screen.getByText("320ms")).toBeInTheDocument();
    // Trạng thái luôn có chữ (sr-only), không chỉ màu.
    expect(screen.getByText(", Hoàn tất")).toBeInTheDocument();
    expect(screen.getByText(", Đang chạy")).toBeInTheDocument();

    // Đồng hồ đã chạy sau khi mount.
    expect(screen.getByText("4.2s")).toBeInTheDocument();
    expect(screen.getByText("1m 05s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("5.2s")).toBeInTheDocument();
    expect(screen.getByText("1m 06s")).toBeInTheDocument();
  });

  it("trạng thái tổng suy ra từ các bước", () => {
    const { rerender } = render(
      <Trace title="CI">
        <TraceStep status="success" title="Build" />
        <TraceStep status="error" title="Test" />
      </Trace>,
    );
    expect(screen.getByText(/Lỗi · 2\/2 bước/)).toBeInTheDocument();

    rerender(
      <Trace title="CI">
        <TraceStep status="success" title="Build" />
        <TraceStep status="skipped" title="Test" />
      </Trace>,
    );
    expect(screen.getByText(/Hoàn tất · 2\/2 bước/)).toBeInTheDocument();
  });

  it("bước có details: mặc định mở khi lỗi, bấm để thu gọn; 'Thu gọn tất cả'", () => {
    render(
      <Trace title="Pipeline">
        <TraceStep status="error" title="Test" details={<p>stack trace</p>} />
        <TraceStep status="success" title="Build" details={<p>log build</p>} />
      </Trace>,
    );
    const errorToggle = screen.getByRole("button", { name: /Test/ });
    const okToggle = screen.getByRole("button", { name: /Build/ });
    expect(errorToggle).toHaveAttribute("aria-expanded", "true");
    expect(okToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("log build")).not.toBeVisible();

    fireEvent.click(okToggle);
    expect(okToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("log build")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Thu gọn tất cả" }));
    expect(errorToggle).toHaveAttribute("aria-expanded", "false");
    expect(okToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Mở rộng tất cả" }));
    expect(errorToggle).toHaveAttribute("aria-expanded", "true");
    expect(okToggle).toHaveAttribute("aria-expanded", "true");
  });

  it("đổi trạng thái bước → thông báo qua live region (gộp cùng nhịp)", () => {
    vi.useFakeTimers({ now: T });
    const { rerender } = render(
      <Trace title="Agent">
        <TraceStep status="pending" title="Tìm kiếm" />
        <TraceStep status="pending" title="Trả lời" />
      </Trace>,
    );
    rerender(
      <Trace title="Agent">
        <TraceStep status="success" title="Tìm kiếm" />
        <TraceStep status="running" title="Trả lời" />
      </Trace>,
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Tìm kiếm: Hoàn tất. Trả lời: Đang chạy");
  });

  it("announceChanges=false → không thông báo", () => {
    vi.useFakeTimers({ now: T });
    const { rerender } = render(
      <Trace title="Agent" announceChanges={false}>
        <TraceStep status="pending" title="Tìm kiếm" />
      </Trace>,
    );
    rerender(
      <Trace title="Agent" announceChanges={false}>
        <TraceStep status="success" title="Tìm kiếm" />
      </Trace>,
    );
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
