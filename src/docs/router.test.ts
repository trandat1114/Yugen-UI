import { describe, expect, it } from "vitest";
import { docsPath, hrefOf, legacyHashTarget, parseHash, parsePath, pathOf, type Route } from "./router";

// Vitest chạy với BASE_URL "/" — bản build trên GitHub Pages chỉ khác tiền tố.
const ROUTES: Route[] = [
  { kind: "home" },
  { kind: "blocks" },
  { kind: "templates" },
  { kind: "theme-designer" },
  { kind: "news" },
  { kind: "community" },
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

  it("đường dẫn lạ về trang chủ", () => {
    for (const path of ["/concepts", "/components/button/extra", "/nope", "/blocks/x"]) {
      expect(parsePath(path)).toEqual({ kind: "home" });
    }
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

  it("docsPath thêm BASE", () => {
    expect(docsPath("/concepts/cli")).toBe("/concepts/cli");
    expect(docsPath("/")).toBe("/");
  });
});
