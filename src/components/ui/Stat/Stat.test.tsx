import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { StatTile } from "../Chart/Sparkline";
import { Stat } from "./Stat";
import { statMessagesEn } from "./messages";
import { watchDeprecations } from "@/test/deprecation";

describe("Stat", () => {
  it("formats the value and delta with the locale and names the direction", () => {
    render(<Stat label="Doanh thu" value={128400} delta={0.124} deltaLabel="so với tháng trước" locale="en-US" />);
    expect(screen.getByText("128.4K")).toBeInTheDocument();
    expect(screen.getByText("+12.4%")).toBeInTheDocument();
    expect(screen.getByText("Tăng")).toHaveClass("sr-only");
  });

  it("colors the delta by goodDirection", () => {
    render(<Stat label="Tỉ lệ rời bỏ" value="2,1%" delta={-0.003} goodDirection="down" />);
    expect(screen.getByText("Giảm").parentElement).toHaveClass("text-success-foreground-1");
  });

  it("renders the chart slot and reads strings from YugenProvider", () => {
    render(
      <YugenProvider messages={{ stat: statMessagesEn }}>
        <Stat label="Orders" value={42} delta={0} chart={<span data-testid="chart" />} />
      </YugenProvider>,
    );
    expect(screen.getByTestId("chart")).toBeInTheDocument();
    expect(screen.getByText("No change")).toBeInTheDocument();
  });

  it("keeps StatTile working on top of Stat", () => {
    render(<StatTile label="Phiên" value={5} delta={0.1} trend={[1, 2, 3]} />);
    expect(screen.getByText("Phiên")).toBeInTheDocument();
    expect(screen.getByText("Tăng")).toBeInTheDocument();
  });
});

describe("Stat size", () => {
  it("extra-large là cỡ 68px; hero (giá trị cũ) vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    render(
      <>
        <Stat label="Mới" value="1" size="extra-large" />
        <Stat label="Cũ" value="2" size="hero" />
        <StatTile label="Cũ 2" value="3" size="hero" />
      </>,
    );
    for (const v of ["1", "2", "3"]) expect(screen.getByText(v).parentElement).toHaveClass("text-display");
    expect(warnings('Stat.size="hero"')).toBe(1);
  });
});
