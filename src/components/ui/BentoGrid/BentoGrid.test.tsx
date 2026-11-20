import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BentoGrid, BentoGridItem } from "./BentoGrid";

describe("BentoGrid", () => {
  it("renders responsive CSS-first columns and spans without layout measurement", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <BentoGrid ref={ref} columns={{ base: 1, sm: 2, lg: 4 }} data-testid="grid">
        <BentoGridItem colSpan={{ base: 1, lg: 2 }} rowSpan={{ base: 1, lg: 2 }} title="Overview" data-testid="item">
          Summary
        </BentoGridItem>
      </BentoGrid>,
    );
    const grid = screen.getByTestId("grid");
    const item = screen.getByTestId("item");
    expect(ref.current).toBe(grid);
    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4");
    expect(item).toHaveClass("col-span-1", "lg:col-span-2", "row-span-1", "lg:row-span-2");
    expect(item).toHaveAttribute("data-bento-item");
    expect(item).not.toHaveAttribute("data-bento-measured");
  });

  it("renders semantic link cards and keeps action content opt-in", () => {
    render(
      <BentoGrid columns={2}>
        <BentoGridItem href="/details" title="Details" description="Open the report" header={<div data-testid="header">Header</div>} media={<img src="/cover.svg" alt="" />} />
        <BentoGridItem title="Actions" action={<button type="button">Save</button>} />
      </BentoGrid>,
    );
    expect(screen.getByRole("link", { name: /Details Open the report/i })).toHaveAttribute("href", "/details");
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("keeps image slots contained and wraps long copy instead of clipping it", () => {
    const { container } = render(
      <BentoGrid>
        <BentoGridItem
          title="A long bento title that still needs to wrap"
          description="A long description stays readable inside a narrow responsive cell."
          header={<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="" />}
        />
      </BentoGrid>,
    );
    expect(screen.getByRole("heading")).toHaveClass("break-words");
    expect(screen.getByText(/A long description/)).toHaveClass("break-words");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
