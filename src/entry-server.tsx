/**
 * Entry cho prerender (Node): `vite build --ssr src/entry-server.tsx` rồi scripts/prerender.mjs gọi `render()` cho mọi
 * route và ghi ra `<đường dẫn>.html`. Cần React 19 (bản Node của `renderToReadableStream`); docs luôn chạy trên 19.
 */
import { renderToReadableStream } from "react-dom/server";
import App, { preloadRoute } from "./App";
import { CONCEPT_BY_SLUG, CONCEPTS } from "./docs/concepts";
import { FOUNDATIONS } from "./docs/foundations";
import { localeValue, type LocaleValue } from "./docs/i18n";
import { COMPONENT_META_BY_SLUG, COMPONENTS_META } from "./docs/registry";
import { hrefOf, pathOf, type Route } from "./docs/router";
import { documentHead, routeMeta } from "./docs/seo";

export const ROUTES: Route[] = [
  { kind: "home" },
  { kind: "blocks" },
  { kind: "templates" },
  { kind: "theme-designer" },
  { kind: "news" },
  { kind: "community" },
  ...CONCEPTS.map((c): Route => ({ kind: "concept", slug: c.meta.slug })),
  ...FOUNDATIONS.map((f): Route => ({ kind: "foundation", slug: f.slug })),
  ...COMPONENTS_META.map((c): Route => ({ kind: "component", slug: c.slug })),
];

/**
 * File nguồn chính của mỗi trang (tính từ gốc repo) — scripts/prerender.mjs lấy ngày commit gần nhất làm `lastmod` của
 * sitemap. Đường dẫn không tồn tại được bỏ qua.
 */
export function sourcesOf(route: Route): string[] {
  switch (route.kind) {
    case "home":
      return ["src/docs/pages/HomePage.tsx", "src/docs/pages/HomeShowcase.tsx", "src/docs/pages/HomeComponents.tsx"];
    case "blocks":
      return ["src/docs/pages/BlocksPage.tsx", "src/docs/block-library"];
    case "templates":
      return ["src/docs/pages/TemplatesPage.tsx", "src/docs/template-library"];
    case "theme-designer":
      return ["src/docs/pages/ThemeDesignerPage.tsx"];
    case "news":
      return ["src/docs/news.ts"];
    case "community":
      return ["src/docs/pages/CommunityPage.tsx", "src/docs/roadmap.ts"];
    case "concept":
      return [`src/docs/concepts/${route.slug}.tsx`, `src/docs/concepts/en/${route.slug}.tsx`];
    case "foundation":
      return ["src/docs/pages/FoundationsPage.tsx", { color: "src/docs/pages/ColorPage.tsx", motion: "src/docs/pages/MotionPage.tsx" }[route.slug] ?? ""];
    case "component": {
      const meta = COMPONENT_META_BY_SLUG[route.slug];
      return meta ? [`src/docs/registry/${meta.file}`, `src/components/ui/${meta.name}`] : [];
    }
  }
}

/** Nội dung ảnh chia sẻ (scripts/og-pages.mjs): nhóm trang, tiêu đề, mô tả. */
function cardOf(route: Route, l: LocaleValue) {
  const { title = "Yugen UI", description } = routeMeta(route, l);
  let section = "";
  if (route.kind === "component") {
    const meta = COMPONENT_META_BY_SLUG[route.slug];
    section = meta ? `${l.t("nav.components")} · ${l.category(meta.category)}` : l.t("nav.components");
  } else if (route.kind === "concept") {
    const meta = CONCEPT_BY_SLUG[route.slug]?.meta;
    section = meta ? `${l.t("nav.concepts")} · ${l.group(meta.group)}` : l.t("nav.concepts");
  } else if (route.kind === "foundation") {
    section = l.t("nav.foundations");
  }
  return { section, title, description };
}

export interface RenderedPage {
  /** Đường dẫn sau BASE: "" (trang chủ), "components/button"… */
  path: string;
  html: string;
  head: ReturnType<typeof documentHead>;
  card: ReturnType<typeof cardOf>;
}

export async function render(route: Route): Promise<RenderedPage> {
  // Nạp trước như main.tsx: không Suspense nào treo thì React ghi nội dung tại chỗ. Phần nào còn treo (demo nạp lười lồng
  // bên trong) vẫn đúng, nhưng React ghi nó ở cuối trang kèm script $RC đổi chỗ.
  await preloadRoute(route, "vi");
  const errors: unknown[] = [];
  const stream = await renderToReadableStream(<App path={hrefOf(route)} />, {
    onError: (error) => void errors.push(error),
    // Mặc định React tách Suspense có nội dung lớn ra cuối trang (stream sớm phần khung); HTML tĩnh thì không cần.
    progressiveChunkSize: Number.POSITIVE_INFINITY,
  });
  await stream.allReady;
  // Lỗi trong một Suspense không làm render dừng (React để client render lại phần đó) — với docs thì coi là lỗi build.
  if (errors.length > 0) throw errors[0];
  const html = await new Response(stream).text();
  const l = localeValue("vi");
  return { path: pathOf(route), html, head: documentHead(route, l), card: cardOf(route, l) };
}
