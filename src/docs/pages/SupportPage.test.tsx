import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parsePath } from "../router";
import { SUPPORT, supportEnabled } from "../support";
import { SupportPage } from "./SupportPage";

describe("support page (#183)", () => {
  it("stays unpublished without a link: /support is a 404", () => {
    expect(SUPPORT.links).toEqual([]);
    expect(supportEnabled()).toBe(false);
    expect(parsePath("/support")).toEqual({ kind: "not-found", path: "support" });
  });

  it("needs an https link", () => {
    expect(supportEnabled({ links: [{ label: "X", href: "http://example.com" }], message: null, supporters: [] })).toBe(false);
    expect(supportEnabled({ links: [{ label: "X", href: "https://example.com" }], message: null, supporters: [] })).toBe(true);
  });

  it("renders external links and supporters", () => {
    render(
      <SupportPage
        support={{
          links: [{ label: "Ko-fi", href: "https://ko-fi.com/example", note: { en: "One-time", vi: "Một lần" } }],
          message: null,
          supporters: [{ name: "Alex" }],
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /Ko-fi/ });
    expect(link).toHaveAttribute("href", "https://ko-fi.com/example");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });
});
