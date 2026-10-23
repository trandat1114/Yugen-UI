// @vitest-environment node
/**
 * Prerender docs (src/entry-server.tsx) trên Node: mỗi loại trang render được mà không cần window / document, nội dung nằm
 * tại chỗ (không có Suspense treo phải đổi chỗ bằng script) và head đúng trang. Bản build chạy đủ mọi route (scripts/prerender.mjs).
 */
import { version } from "react";
import { describe, expect, it } from "vitest";
import { render, ROUTES } from "../entry-server";
import type { Route } from "../docs/router";

const SAMPLES: [Route, string][] = [
  [{ kind: "home" }, "Yugen UI"],
  [{ kind: "component", slug: "button" }, "Button"],
  [{ kind: "concept", slug: "cli" }, "@yugen-ui/cli"],
  [{ kind: "foundation", slug: "color" }, "Màu sắc"],
  [{ kind: "templates" }, "Templates"],
];

// Job CI "React 18" chạy lại toàn bộ test với React 18 — prerender docs chỉ dùng React 19.
describe.skipIf(!version.startsWith("19."))("prerender docs", () => {
  it("danh sách route gồm mọi component, khái niệm và nền tảng", () => {
    const kinds = new Set(ROUTES.map((r) => r.kind));
    expect(kinds).toEqual(new Set(["home", "blocks", "templates", "theme-designer", "news", "community", "concept", "foundation", "component"]));
    expect(ROUTES.filter((r) => r.kind === "component").length).toBeGreaterThan(100);
  });

  it.each(SAMPLES)("%o", async (route, h1) => {
    const page = await render(route);
    expect(page.html).toContain(`>${h1}</h1>`);
    expect(page.html).not.toContain('<template id="B:');
    expect(page.head.canonical).toBe(`https://trandat1114.github.io/Yugen-UI/${page.path}`);
    if (route.kind !== "home") expect(page.head.title).toMatch(/ · Yugen UI$/);
  });
});
