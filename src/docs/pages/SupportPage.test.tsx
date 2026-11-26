import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parsePath } from "../router";
import { SUPPORT, supportEnabled } from "../support";
import { SupportPage } from "./SupportPage";

describe("support page (#183)", () => {
  it("publishes VietQR and GitHub Sponsors", () => {
    expect(SUPPORT.links).toEqual([
      expect.objectContaining({ label: "GitHub Sponsors", href: "https://github.com/sponsors/trandat1114" }),
    ]);
    expect(SUPPORT.qr?.src).toBe("support/vietqr.png");
    expect(supportEnabled()).toBe(true);
    expect(parsePath("/support")).toEqual({ kind: "support" });
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
          qr: { src: "support/vietqr.png", alt: { en: "VietQR", vi: "VietQR" } },
          message: null,
          supporters: [{ name: "Alex" }],
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /Ko-fi/ });
    expect(link).toHaveAttribute("href", "https://ko-fi.com/example");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("img", { name: "VietQR" })).toHaveAttribute("src", "/support/vietqr.png");
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });
});
