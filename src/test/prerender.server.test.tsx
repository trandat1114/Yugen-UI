// @vitest-environment node
/**
 * Prerender docs (src/entry-server.tsx) trên Node: mỗi loại trang render được mà không cần window / document, nội dung nằm
 * tại chỗ (không có Suspense treo phải đổi chỗ bằng script) và head đúng trang. Bản build chạy đủ mọi route (scripts/prerender.mjs).
 */
import { describe, expect, it } from "vitest";
import { render, ROUTES } from "../entry-server";
import type { Route } from "../docs/router";

const SAMPLES: [Route, string][] = [
  [{ kind: "home" }, "Yugen UI"],
  [{ kind: "component", slug: "button" }, "Button"],
  [{ kind: "concept", slug: "cli" }, "@yugen-ui/cli"],
  [{ kind: "foundation", slug: "color" }, "Color"],
  [{ kind: "templates" }, "Templates"],
];

describe("prerender docs", () => {
  it("danh sách route gồm mọi component, khái niệm và nền tảng", () => {
    const kinds = new Set(ROUTES.map((r) => r.kind));
    expect(kinds).toEqual(new Set(["home", "blocks", "templates", "theme-designer", "typeset", "news", "community", "contributors", "concept", "foundation", "component"]));
    expect(ROUTES.filter((r) => r.kind === "component").length).toBeGreaterThan(100);
  });

  it.each(SAMPLES)("%o", async (route, h1) => {
    const page = await render(route);
    expect(page.html).toContain(`>${h1}</h1>`);
    expect(page.html).not.toContain('<template id="B:');
    expect(page.head.canonical).toBe(`https://trandat1114.github.io/Yugen-UI/${page.path}`);
    if (route.kind !== "home") expect(page.head.title).toMatch(/ · Yugen UI$/);
    // Ảnh chia sẻ: og/<đường dẫn>.jpg (scripts/og-pages.mjs), trang chủ dùng og.jpg.
    expect(page.head.image).toBe(page.path ? `og/${page.path}.jpg` : "og.jpg");
    expect(page.card.title).toBe(h1);
    // Trang Templates render mọi bản xem trước template: quá 5 s khi cả bộ test chạy song song.
  }, 15_000);

  it("tiếng Anh ở gốc, tiếng Việt dưới /vi/: link nội bộ giữ ngôn ngữ, hreflang (#123, #277)", async () => {
    const cli = await render({ kind: "concept", slug: "cli" }, "en");
    expect(cli.path).toBe("concepts/cli");
    expect(cli.html).toContain('href="/concepts/shadcn-registry"');
    expect(cli.html).not.toContain('href="/vi/concepts/shadcn-registry"');
    expect(cli.head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/concepts/cli");
    expect(cli.head.alternates).toEqual([
      { hreflang: "en", href: "https://trandat1114.github.io/Yugen-UI/concepts/cli" },
      { hreflang: "vi", href: "https://trandat1114.github.io/Yugen-UI/vi/concepts/cli" },
      { hreflang: "x-default", href: "https://trandat1114.github.io/Yugen-UI/concepts/cli" },
    ]);
    expect(cli.head.image).toBe("og/concepts/cli.jpg");
    expect(cli.card.section).toMatch(/^Concepts · /);
    const cliVi = await render({ kind: "concept", slug: "cli" }, "vi");
    expect(cliVi.path).toBe("vi/concepts/cli");
    expect(cliVi.html).toContain('href="/vi/concepts/shadcn-registry"');
    expect(cliVi.head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/vi/concepts/cli");
    expect(cliVi.head.image).toBe("og/vi/concepts/cli.jpg");

    // Foundations viết song ngữ trong trang (#138): canonical riêng, nội dung tiếng Anh.
    const color = await render({ kind: "foundation", slug: "color" }, "en");
    expect(color.head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/foundations/color");
    expect(color.head.alternates.map((a) => a.hreflang)).toEqual(["en", "vi", "x-default"]);
    const main = color.html.slice(color.html.indexOf("<main"), color.html.indexOf("</main>"));
    expect(main).not.toMatch(/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/);

    // Button đã dịch: canonical riêng, hreflang, mô tả tiếng Anh; demo giữ tiếng Việt và mang lang="vi".
    const button = await render({ kind: "component", slug: "button" }, "en");
    expect(button.head.canonical).toBe("https://trandat1114.github.io/Yugen-UI/components/button");
    expect(button.head.alternates.map((a) => a.hreflang)).toEqual(["en", "vi", "x-default"]);
    expect(button.html).toContain('lang="vi"');
    // Render tiếng Việt xong không làm lệch link của trang tiếng Anh kế tiếp.
    expect((await render({ kind: "concept", slug: "cli" })).html).toContain('href="/concepts/shadcn-registry"');
  });

  it("demo và block tiếng Việt có sẵn trong HTML prerender của /vi/, bản tiếng Anh giữ nguyên (#300)", async () => {
    const vi = await render({ kind: "component", slug: "button" }, "vi");
    expect(vi.html).toContain("Lưu thay đổi");
    expect(vi.html).not.toContain("Save changes");
    expect((await render({ kind: "component", slug: "button" }, "en")).html).toContain("Save changes");

    const blocksVi = await render({ kind: "blocks" }, "vi");
    expect(blocksVi.html).toContain("Chào mừng trở lại");
    expect(blocksVi.html).not.toContain("Welcome back");
    expect((await render({ kind: "blocks" }, "en")).html).toContain("Welcome back");
  }, 30_000);

  it("nhóm trang trên ảnh chia sẻ", async () => {
    expect((await render({ kind: "component", slug: "button" }, "vi")).card.section).toBe("Component · Hành động");
    expect((await render({ kind: "concept", slug: "component-labelling" }, "vi")).card.section).toBe("Khái niệm · Khả năng tiếp cận");
    expect((await render({ kind: "news" })).card.section).toBe("");
  });
});
