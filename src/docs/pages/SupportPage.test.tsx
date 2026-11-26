import { render, screen, within } from "@testing-library/react";
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

  it("shows GitHub Sponsors as a channel beside VietQR, not again in the link list", () => {
    render(<SupportPage />);
    const card = document.getElementById("github-sponsors")!;
    expect(card.querySelectorAll("ol > li")).toHaveLength(3);
    const link = within(card).getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/sponsors/trandat1114");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(document.getElementById("links")).toBeNull();
  });

  it("reads both channels, then the optional VietQR form", () => {
    const { container } = render(<SupportPage />);
    expect(container.querySelectorAll("#vietqr ol > li")).toHaveLength(3);
    // Same aspect ratio as public/support/vietqr.png (360 × 458): nothing shifts while it loads.
    const qr = screen.getByRole("img", { name: /VietQR/ });
    expect(qr).toHaveAttribute("width", "360");
    expect(qr).toHaveAttribute("height", "458");
    // The availability note is a neutral status, not a warning alert.
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/VietQR/);
    // DOM order = reading order on narrow screens.
    const order = [...container.querySelectorAll("#vietqr ol, img:not([alt='']), #github-sponsors, #acknowledgement form")].map((el) => el.tagName);
    expect(order).toEqual(["OL", "IMG", "SECTION", "FORM"]);
  });
});
