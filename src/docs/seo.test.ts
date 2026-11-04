import { describe, expect, it } from "vitest";
import { localeValue } from "./i18n";
import { documentHead, fallbackOf, resolveRoute } from "./seo";
import { suggestionsFor } from "./pages/NotFoundPage";

// Hiện mọi trang đều có bản tiếng Anh; quy tắc cho trang chưa dịch (concept mới chưa có en/<slug>.tsx) vẫn cần đúng.
describe("seo: trang chưa dịch", () => {
  it("bản tiếng Anh của trang chưa dịch trỏ canonical về bản tiếng Việt (/vi/), không có hreflang", () => {
    const route = { kind: "concept", slug: "__chua-dich__" } as const;
    expect(fallbackOf(route)).toBe("page");
    const head = documentHead(route, localeValue("en"));
    expect(head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/vi/concepts/__chua-dich__");
    expect(head.alternates).toEqual([]);
  });

  it("các trang song ngữ trong trang không bị đánh dấu chưa dịch", () => {
    for (const route of [
      { kind: "home" },
      { kind: "blocks" },
      { kind: "templates" },
      { kind: "theme-designer" },
      { kind: "typeset" },
      { kind: "community" },
      { kind: "contributors" },
      { kind: "news" },
      { kind: "foundation", slug: "color" },
      { kind: "foundation", slug: "motion" },
      { kind: "component", slug: "button" },
      { kind: "concept", slug: "cli" },
    ] as const)
      expect(fallbackOf(route), JSON.stringify(route)).toBeNull();
  });
});

describe("seo: trang 404 (#238)", () => {
  it("slug không tồn tại thành trang 404, cùng đường dẫn", () => {
    expect(resolveRoute({ kind: "component", slug: "button" })).toEqual({ kind: "component", slug: "button" });
    expect(resolveRoute({ kind: "component", slug: "buton" })).toEqual({ kind: "not-found", path: "components/buton" });
    expect(resolveRoute({ kind: "concept", slug: "nope" })).toEqual({ kind: "not-found", path: "concepts/nope" });
    expect(resolveRoute({ kind: "foundation", slug: "nope" })).toEqual({ kind: "not-found", path: "foundations/nope" });
  });

  it("tiêu đề, noindex, không hreflang", () => {
    const head = documentHead({ kind: "not-found", path: "nope" }, localeValue("vi"));
    expect(head.title).toBe("Không tìm thấy trang · Yugen UI");
    expect(head.noindex).toBe(true);
    expect(head.alternates).toEqual([]);
  });

  it("gợi ý trang có slug gần giống", () => {
    const candidates = ["button", "buttongroup", "badge", "combobox"].map((slug) => ({ slug, path: `/components/${slug}`, name: slug }));
    expect(suggestionsFor("components/buton", candidates).map((c) => c.slug)).toEqual(["button"]);
    expect(suggestionsFor("components/combo", candidates).map((c) => c.slug)).toEqual(["combobox"]);
    expect(suggestionsFor("xy", candidates)).toEqual([]);
    expect(suggestionsFor("components/zzzzzz", candidates)).toEqual([]);
  });
});
