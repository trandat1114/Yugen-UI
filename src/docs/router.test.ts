import { describe, expect, it } from "vitest";
import { docsLinkTarget, docsPath, hrefOf, legacyHashTarget, localePathOf, parseHash, parseLocation, parsePath, pathOf, type Route } from "./router";

// Vitest chạy với BASE_URL "/" — bản build trên GitHub Pages chỉ khác tiền tố.
const ROUTES: Route[] = [
  { kind: "home" },
  { kind: "blocks" },
  { kind: "templates" },
  { kind: "theme-designer" },
  { kind: "typeset" },
  { kind: "news" },
  { kind: "community" },
  { kind: "contributors" },
  { kind: "concept", slug: "cli" },
  { kind: "foundation", slug: "color" },
  { kind: "component", slug: "button" },
];

describe("router (URL theo đường dẫn)", () => {
  it.each(ROUTES.map((r) => [hrefOf(r), r] as const))("%s ⇄ route", (href, route) => {
    expect(parsePath(href)).toEqual(route);
  });

  it("đường dẫn của route không có / đầu", () => {
    expect(pathOf({ kind: "home" })).toBe("");
    expect(pathOf({ kind: "component", slug: "button" })).toBe("components/button");
  });

  it("đường dẫn lạ là trang 404, giữ đường dẫn để đổi ngôn ngữ (#238)", () => {
    for (const path of ["/concepts", "/components/button/extra", "/nope", "/blocks/x"]) {
      expect(parsePath(path)).toEqual({ kind: "not-found", path: path.slice(1) });
    }
    expect(parseLocation("/vi/nope")).toEqual({ route: { kind: "not-found", path: "nope" }, lang: "vi" });
    expect(hrefOf({ kind: "not-found", path: "nope" }, "vi")).toBe("/vi/nope");
    expect(hrefOf({ kind: "not-found", path: "nope" }, "en")).toBe("/nope");
  });

  it("link #/… cũ", () => {
    expect(parseHash("#/concepts/cli")).toEqual({ kind: "concept", slug: "cli" });
    expect(parseHash("#/")).toEqual({ kind: "home" });
    expect(legacyHashTarget({ hash: "#/news", search: "?lang=en" })).toBe("/news?lang=en");
    expect(legacyHashTarget({ hash: "#/", search: "" })).toBe("/");
    // #mục trong trang không phải link cũ.
    expect(legacyHashTarget({ hash: "#install", search: "" })).toBeNull();
    expect(legacyHashTarget({ hash: "", search: "" })).toBeNull();
  });

  it("docsPath thêm BASE (và vi/ khi xem tiếng Việt)", () => {
    expect(docsPath("/concepts/cli")).toBe("/concepts/cli");
    expect(docsPath("/")).toBe("/");
    expect(docsPath("/concepts/cli", "vi")).toBe("/vi/concepts/cli");
    expect(docsPath("/", "vi")).toBe("/vi/");
    expect(docsPath("/concepts/cli", "en")).toBe("/concepts/cli");
  });

  it("tiếng Anh ở gốc, tiếng Việt dưới /vi/ (#277)", () => {
    expect(parseLocation("/components/button")).toEqual({ route: { kind: "component", slug: "button" }, lang: "en" });
    expect(parseLocation("/vi/components/button")).toEqual({ route: { kind: "component", slug: "button" }, lang: "vi" });
    expect(parseLocation("/vi/")).toEqual({ route: { kind: "home" }, lang: "vi" });
    expect(parseLocation("/vi")).toEqual({ route: { kind: "home" }, lang: "vi" });
    // "video" không phải tiền tố ngôn ngữ.
    expect(parseLocation("/video")).toEqual({ route: { kind: "not-found", path: "video" }, lang: "en" });
    for (const lang of ["en", "vi"] as const) {
      for (const route of ROUTES) expect(parseLocation(hrefOf(route, lang))).toEqual({ route, lang });
    }
    expect(localePathOf({ kind: "news" }, "vi")).toBe("vi/news");
    expect(localePathOf({ kind: "news" }, "en")).toBe("news");
    expect(hrefOf({ kind: "home" })).toBe("/");
  });

  it("URL /en/… của docs ≤ 0.13: trang tiếng Anh, đánh dấu legacy để đổi sang URL chuẩn", () => {
    expect(parseLocation("/en/components/button")).toEqual({ route: { kind: "component", slug: "button" }, lang: "en", legacy: true });
    expect(parseLocation("/en/")).toEqual({ route: { kind: "home" }, lang: "en", legacy: true });
    expect(parseLocation("/en")).toEqual({ route: { kind: "home" }, lang: "en", legacy: true });
    // "english" không phải tiền tố cũ.
    expect(parseLocation("/english")).toEqual({ route: { kind: "not-found", path: "english" }, lang: "en" });
  });
});

describe("docsLinkTarget (nạp trước theo ý định, #305)", () => {
  it("link tới trang docs → route + ngôn ngữ", () => {
    expect(docsLinkTarget("/components/button")).toEqual({ route: { kind: "component", slug: "button" }, lang: "en" });
    expect(docsLinkTarget("/vi/concepts/cli")).toEqual({ route: { kind: "concept", slug: "cli" }, lang: "vi" });
    expect(docsLinkTarget("/")).toEqual({ route: { kind: "home" }, lang: "en" });
  });

  it("link ngoài, file và bản docs khác (next/, vX.Y/) → null", () => {
    for (const href of ["https://github.com/trandat1114/Yugen-UI", "/next/components/button", "/v0.13/", "/og.jpg", "/r/button.json"]) {
      expect(docsLinkTarget(href), href).toBeNull();
    }
  });
});
