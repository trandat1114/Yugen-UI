import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import { TeachingPopover, TeachingPopoverFooter, TeachingPopoverSurface } from "./TeachingPopover";

function Demo(props: React.ComponentProps<typeof TeachingPopoverFooter>) {
  return (
    <TeachingPopover open>
      <TeachingPopoverSurface aria-label="Mẹo">
        <TeachingPopoverFooter data-testid="footer" {...props} />
      </TeachingPopoverSurface>
    </TeachingPopover>
  );
}

describe("TeachingPopoverFooter orientation", () => {
  it("mặc định ngang; orientation=\"vertical\" xếp hai nút chồng nhau", () => {
    const { rerender } = render(<Demo primary="Mở" secondary="Để sau" />);
    expect(screen.getByTestId("footer")).not.toHaveClass("flex-col");
    rerender(<Demo primary="Mở" secondary="Để sau" orientation="vertical" />);
    expect(screen.getByTestId("footer")).toHaveClass("flex-col");
  });

  it("layout (tên cũ) vẫn chạy và cảnh báo một lần; orientation thắng", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo primary="Mở" layout="vertical" />);
    rerender(<Demo primary="Mở" layout="vertical" />);
    expect(screen.getByTestId("footer")).toHaveClass("flex-col");
    expect(warnings("TeachingPopoverFooter.layout")).toBe(1);
    rerender(<Demo primary="Mở" layout="vertical" orientation="horizontal" />);
    expect(screen.getByTestId("footer")).not.toHaveClass("flex-col");
  });
});
