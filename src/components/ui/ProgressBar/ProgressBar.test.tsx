import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

const fill = () => screen.getByRole("progressbar").firstElementChild as HTMLElement;

describe("ProgressBar", () => {
  it("role progressbar với aria-value* (mặc định max = 1); độ rộng theo phần trăm; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<ProgressBar ref={ref} value={0.25} aria-label="Tải lên" className="w-40" />);
    const bar = screen.getByRole("progressbar", { name: "Tải lên" });
    expect(ref.current).toBe(bar);
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "1");
    expect(bar).toHaveAttribute("aria-valuenow", "0.25");
    expect(bar).toHaveClass("w-40", "h-0.5", "rounded-circular");
    expect(fill().style.width).toBe("25%");
  });

  it("kẹp giá trị trong [0, max]; max ≤ 0 coi như 1", () => {
    const { rerender } = render(<ProgressBar value={150} max={100} aria-label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(fill().style.width).toBe("100%");
    rerender(<ProgressBar value={-5} max={100} aria-label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    rerender(<ProgressBar value={0.5} max={0} aria-label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "1");
  });

  it("indeterminate khi không có value (hoặc NaN): không có aria-value*, thanh chạy", () => {
    const { rerender } = render(<ProgressBar aria-label="Đang tải" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-valuemax");
    expect(fill()).toHaveClass("animate-indeterminate-slide", "w-1/3");
    expect(fill().style.width).toBe("");
    rerender(<ProgressBar value={Number.NaN} aria-label="Đang tải" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("label / description nối qua aria-labelledby / aria-describedby; id riêng", () => {
    const { container } = render(
      <ProgressBar id="upload" value={3} max={10} label="Tải tệp" description="3 / 10 tệp" rootClassName="max-w-80" />,
    );
    const bar = screen.getByRole("progressbar", { name: "Tải tệp" });
    expect(bar).toHaveAttribute("id", "upload");
    expect(bar).toHaveAccessibleDescription("3 / 10 tệp");
    expect(container.firstElementChild).toHaveClass("max-w-80");
  });

  it("thickness / shape / color", () => {
    render(<ProgressBar value={0.5} thickness="large" shape="square" color="error" aria-label="x" />);
    expect(screen.getByRole("progressbar")).toHaveClass("h-1", "rounded-none");
    expect(fill()).toHaveClass("bg-danger-background-3", "rounded-none");
  });
});
