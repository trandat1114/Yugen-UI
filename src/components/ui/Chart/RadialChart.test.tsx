import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadialChart } from "./RadialChart";

describe("RadialChart", () => {
  it("renders a single radial value without loading a chart library", () => {
    render(
      <RadialChart data={[{ label: "Progress", value: 72 }]} maxValue={100} />,
    );
    expect(
      screen.getByRole("img", { name: /Biểu đồ vòng cung: 72 trên 100/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("renders stacked segments and their legend", () => {
    render(
      <RadialChart
        stacked
        data={[
          { label: "Done", value: 4 },
          { label: "Remaining", value: 6 },
        ]}
      />,
    );
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Remaining")).toBeInTheDocument();
  });

  it("keeps partial arcs visible at the SVG boundary", () => {
    const { container } = render(
      <RadialChart
        data={[{ label: "SLA", value: 86 }]}
        maxValue={100}
        endAngle={270}
      />,
    );

    expect(container.querySelector('svg[role="img"]')).toHaveClass("overflow-visible");
  });
});
