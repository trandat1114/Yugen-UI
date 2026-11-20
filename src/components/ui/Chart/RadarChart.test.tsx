import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadarChart } from "./RadarChart";

const data = [
  { axis: "Speed", alpha: 86, beta: 72 },
  { axis: "Quality", alpha: 78, beta: 88 },
  { axis: "Support", alpha: 92, beta: null },
];

describe("RadarChart", () => {
  it("exposes keyboard axes and an equivalent focused tooltip", () => {
    render(
      <RadarChart
        data={data}
        index="axis"
        series={[
          { key: "alpha", label: "Alpha" },
          { key: "beta", label: "Beta" },
        ]}
      />,
    );

    const speed = screen.getByRole("img", { name: /Speed:/ });
    expect(speed).toHaveAttribute("tabindex", "0");

    fireEvent.focus(speed);

    expect(screen.getAllByText("Speed").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(1);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("toggles a series without removing its accessible table column", () => {
    render(
      <RadarChart
        data={data}
        index="axis"
        series={[
          { key: "alpha", label: "Alpha" },
          { key: "beta", label: "Beta" },
        ]}
      />,
    );

    const beta = screen.getByRole("button", { name: /Beta/ });
    expect(beta).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(beta);

    expect(beta).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /Bảng dữ liệu|Data table/ })).toBeInTheDocument();
  });
});
