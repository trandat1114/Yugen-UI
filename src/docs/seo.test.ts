import { describe, expect, it } from "vitest";
import { localeValue } from "./i18n";
import { documentHead, fallbackOf } from "./seo";

// Hiện mọi trang đều có bản tiếng Anh; quy tắc cho trang chưa dịch (concept mới chưa có en/<slug>.tsx) vẫn cần đúng.
describe("seo: trang chưa dịch", () => {
  it("bản /en/ của trang chưa dịch trỏ canonical về bản tiếng Việt, không có hreflang", () => {
    const route = { kind: "concept", slug: "__chua-dich__" } as const;
    expect(fallbackOf(route)).toBe("page");
    const head = documentHead(route, localeValue("en"));
    expect(head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/concepts/__chua-dich__");
    expect(head.alternates).toEqual([]);
  });

  it("các trang song ngữ trong trang không bị đánh dấu chưa dịch", () => {
    for (const route of [
      { kind: "home" },
      { kind: "blocks" },
      { kind: "templates" },
      { kind: "theme-designer" },
      { kind: "community" },
      { kind: "foundation", slug: "color" },
      { kind: "foundation", slug: "motion" },
      { kind: "component", slug: "button" },
      { kind: "concept", slug: "cli" },
    ] as const)
      expect(fallbackOf(route), JSON.stringify(route)).toBeNull();
    expect(fallbackOf({ kind: "news" })).toBe("partial");
  });
});
