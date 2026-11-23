import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
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
    // Tên link là tiêu đề; mô tả đọc qua aria-describedby.
    const link = screen.getByRole("link", { name: "Details" });
    expect(link).toHaveAttribute("href", "/details");
    expect(link).toHaveAccessibleDescription("Open the report");
    expect(screen.getByRole("heading", { name: "Details" })).toContainElement(link);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("keeps actions of a link card outside the link, above its click area", () => {
    render(
      <BentoGridItem href="/plans" target="_blank" rel="noreferrer" title="Plans" action={<button type="button">Compare</button>} data-testid="card" />,
    );
    const card = screen.getByTestId("card");
    const link = screen.getByRole("link", { name: "Plans" });
    const button = screen.getByRole("button", { name: "Compare" });
    expect(card.tagName).toBe("ARTICLE");
    expect(link).not.toContainElement(button);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(button.parentElement).toHaveClass("relative", "z-10");
    expect(card.className).toContain("has-[[data-bento-link]:focus-visible]:outline-2");
  });

  it("warns and renders no link when a link card has no title", () => {
    const warnings = watchDeprecations();
    render(<BentoGridItem href="/x" description="No title" data-testid="card" />);
    expect(within(screen.getByTestId("card")).queryByRole("link")).toBeNull();
    expect(warnings("BentoGridItem.href")).toBe(1);
  });

  it("forwards the item ref and supports a fixed column count", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <BentoGrid columns={3} gap="large" data-testid="grid">
        <BentoGridItem ref={ref} titleAs="div" title="Plain" />
      </BentoGrid>,
    );
    expect(screen.getByTestId("grid")).toHaveAttribute("data-bento-columns", "3");
    expect(screen.getByTestId("grid")).toHaveClass("grid-cols-3", "gap-6");
    expect(ref.current?.tagName).toBe("ARTICLE");
    expect(screen.queryByRole("heading")).toBeNull();
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
    expect(screen.getByRole("heading")).toHaveClass("wrap-break-word");
    expect(screen.getByText(/A long description/)).toHaveClass("wrap-break-word");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("can follow its container's width instead of the viewport", () => {
    render(
      <BentoGrid breakpoints="container" columns={{ base: 1, sm: 2, lg: 4 }} data-testid="grid">
        <BentoGridItem colSpan={{ base: 1, lg: 2 }} title="Wide" data-testid="item" />
      </BentoGrid>,
    );
    const grid = screen.getByTestId("grid");
    expect(grid.parentElement).toHaveClass("@container");
    expect(grid).toHaveAttribute("data-bento-breakpoints", "container");
    expect(grid).toHaveClass("grid-cols-1", "@2xl:grid-cols-2", "@5xl:grid-cols-4");
    expect(screen.getByTestId("item")).toHaveClass("col-span-1", "@5xl:col-span-2");
    expect(grid).not.toHaveClass("sm:grid-cols-2");
  });
});

describe("BentoGrid accessibility contract (#435)", () => {
  it("keeps DOM order whatever the spans, with logical properties for RTL", () => {
    render(
      <div dir="rtl">
        <BentoGrid columns={{ base: 1, lg: 3 }}>
          <BentoGridItem title="First" colSpan={{ base: 1, lg: 2 }} rowSpan={{ lg: 2 }} />
          <BentoGridItem title="Second" />
          <BentoGridItem title="Third" />
        </BentoGrid>
      </div>,
    );
    expect(screen.getAllByRole("heading").map((h) => h.textContent)).toEqual(["First", "Second", "Third"]);
    // Không đảo thứ tự bằng order-*; chỉ span thay đổi bố cục.
    for (const article of screen.getAllByRole("article")) expect(article.className).not.toMatch(/order-/);
  });

  it("keeps buttons and nested content reachable, and every card focusable once", () => {
    render(
      <BentoGrid>
        <BentoGridItem href="/a" title="Link card" description="Goes to A" action={<button type="button">Pin</button>}>
          <p>Nested text</p>
        </BentoGridItem>
        <BentoGridItem title="Plain" action={<button type="button">Open</button>} />
      </BentoGrid>,
    );
    const focusables = screen.getAllByRole("link").concat(screen.getAllByRole("button"));
    expect(focusables.map((el) => el.textContent)).toEqual(["Link card", "Pin", "Open"]);
    for (const el of focusables) expect(el).not.toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Nested text")).toBeInTheDocument();
  });

  it("hides decorative icons and keeps media alt text as given", () => {
    render(<BentoGridItem title="Stats" icon={<svg data-testid="icon" />} media={<img src="/m.png" alt="Weekly chart" />} />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Weekly chart" })).toBeInTheDocument();
  });

  it("respects reduced motion and forced colors on link cards", () => {
    render(<BentoGridItem href="/x" title="Motion" data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("motion-reduce:transition-none");
    expect(card.className).toContain("forced-colors:has-[[data-bento-link]:focus-visible]:outline-[Highlight]");
  });
});

