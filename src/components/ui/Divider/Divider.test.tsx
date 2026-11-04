import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import { Divider } from "./Divider";

describe("Divider orientation", () => {
  it("mặc định ngang; orientation=\"vertical\" là đường kẻ dọc", () => {
    render(
      <>
        <Divider data-testid="h" />
        <Divider data-testid="v" orientation="vertical" />
      </>,
    );
    expect(screen.getByTestId("h")).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByTestId("v")).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByTestId("v")).toHaveClass("flex-col");
  });

  it("vertical (tên cũ) vẫn chạy và cảnh báo một lần; orientation thắng", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Divider data-testid="d" vertical />);
    rerender(<Divider data-testid="d" vertical />);
    expect(screen.getByTestId("d")).toHaveAttribute("aria-orientation", "vertical");
    expect(warnings("Divider.vertical")).toBe(1);
    rerender(<Divider data-testid="d" vertical orientation="horizontal" />);
    expect(screen.getByTestId("d")).toHaveAttribute("aria-orientation", "horizontal");
  });
});
