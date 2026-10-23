import { useEffect } from "react";
import { CONCEPT_BY_SLUG, CONCEPT_EN_PAGES } from "./concepts";
import { FOUNDATIONS } from "./foundations";
import { useLocale, type LocaleValue } from "./i18n";
import { COMPONENT_META_BY_SLUG, COMPONENTS_META, isTranslated } from "./registry";
import { localePathOf, pathOf, type Route } from "./router";
import { SITE } from "./site";

/**
 * Tiêu đề tab, <meta name="description">, canonical và og:* theo trang. Bản build ghi sẵn vào HTML prerender của từng
 * trang (scripts/prerender.mjs); khi chuyển trang trong trình duyệt, DocumentMeta cập nhật lại.
 */
const PAGES: Record<"blocks" | "templates" | "theme-designer" | "community", Record<"vi" | "en", [string, string]>> = {
  blocks: {
    vi: ["Blocks", "Cụm giao diện ghép sẵn từ component Yugen UI — đăng nhập, cài đặt, thống kê, danh sách — copy nguyên khối vào dự án."],
    en: ["Blocks", "Ready-made UI sections built from Yugen UI components — sign-in, settings, stats, lists — copy whole blocks into your project."],
  },
  templates: {
    vi: ["Templates", "Ứng dụng dựng sẵn bằng Yugen UI: SaaS, blog Markdown, dashboard, chat AI — một lệnh là có dự án chạy được."],
    en: ["Templates", "Ready-made apps built with Yugen UI: SaaS, Markdown blog, dashboard, AI chat — one command gives you a running project."],
  },
  "theme-designer": {
    vi: ["Theme Designer", "Tạo brand ramp 16 bậc từ một màu, xem trước trên component thật ở sáng / tối và xuất CSS, JSON, Tokens Studio."],
    en: ["Theme Designer", "Generate a 16-step brand ramp from one color, preview it on real components in light / dark and export CSS, JSON or Tokens Studio."],
  },
  community: {
    vi: ["Cộng đồng", "Đóng góp cho Yugen UI: báo lỗi, gửi block, dịch tài liệu, lộ trình phát triển."],
    en: ["Community", "Contribute to Yugen UI: report bugs, share blocks, translate the docs, follow the roadmap."],
  },
};

export function routeMeta(route: Route, l: LocaleValue): { title?: string; description: string } {
  const home = l.t("home.intro", { count: COMPONENTS_META.length });
  switch (route.kind) {
    case "concept": {
      const c = CONCEPT_BY_SLUG[route.slug];
      if (!c) return { description: home };
      const meta = l.concept(c.meta);
      return { title: meta.title, description: meta.lead };
    }
    case "component": {
      const m = COMPONENT_META_BY_SLUG[route.slug];
      if (!m) return { description: home };
      const { name, lead } = l.component(m);
      return { title: name, description: lead };
    }
    case "foundation": {
      const f = FOUNDATIONS.find((x) => x.slug === route.slug);
      return { title: f ? l.foundation(f) : l.t("nav.foundations"), description: l.t("home.cardFoundations") };
    }
    case "news":
      return { title: l.t("nav.news"), description: l.t("news.lead") };
    case "blocks":
    case "templates":
    case "theme-designer":
    case "community": {
      const [title, description] = PAGES[route.kind][l.locale];
      return { title, description };
    }
    default:
      return { description: home };
  }
}

/** Chế độ tiếng Anh: route nào còn hiện nội dung tiếng Việt (toàn trang hoặc một phần). */
export function fallbackOf(route: Route): "page" | "partial" | null {
  if (route.kind === "home" || route.kind === "community" || route.kind === "templates") return null;
  if (route.kind === "news") return "partial";
  if (route.kind === "concept") return CONCEPT_EN_PAGES[route.slug] ? null : "page";
  // Foundations › Motion viết song ngữ ngay trong trang (#45).
  if (route.kind === "foundation" && route.slug === "motion") return null;
  // Trang component đã dịch: phần chữ tiếng Anh, demo (nội dung mẫu) giữ tiếng Việt và được đánh dấu lang="vi".
  if (route.kind === "component" && isTranslated(route.slug)) return null;
  return "page";
}

export interface DocumentHead {
  title: string;
  description: string;
  canonical: string;
  /** hreflang → URL; rỗng khi trang chưa có bản tiếng Anh (bản /en/ trỏ canonical về bản tiếng Việt). */
  alternates: { hreflang: string; href: string }[];
  /** Ảnh chia sẻ, tính từ gốc site: og/<đường dẫn>.jpg (scripts/og-pages.mjs), trang chủ og.jpg. */
  image: string;
}

/**
 * `<title>`, mô tả, URL chuẩn, hreflang và ảnh chia sẻ của một trang theo ngôn ngữ đang hiển thị — dùng chung cho prerender
 * (scripts/prerender.mjs) và lúc chuyển trang.
 */
export function documentHead(route: Route, l: LocaleValue): DocumentHead {
  const { title, description } = routeMeta(route, l);
  const path = pathOf(route);
  const translated = fallbackOf(route) !== "page";
  // Trang chưa dịch: bản /en/ chỉ khác khung giao diện, nội dung là bản tiếng Việt → canonical về bản tiếng Việt.
  const own = translated ? localePathOf(route, l.locale) : path;
  return {
    title: title ? `${title} · ${SITE.name}` : `${SITE.name} — React + Tailwind CSS v4`,
    description,
    canonical: SITE.url + own,
    alternates: translated
      ? [
          { hreflang: "vi", href: SITE.url + path },
          { hreflang: "en", href: SITE.url + localePathOf(route, "en") },
          { hreflang: "x-default", href: SITE.url + path },
        ]
      : [],
    image: path ? `og/${own}.jpg` : "og.jpg",
  };
}

function setAttr(selector: string, name: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(name, value);
}

function setAlternates(alternates: DocumentHead["alternates"]) {
  document.head.querySelectorAll("link[rel=alternate][hreflang]").forEach((link) => link.remove());
  // Đặt ngay sau canonical, đúng thứ tự như HTML prerender.
  let anchor = document.head.querySelector('link[rel="canonical"]');
  for (const { hreflang, href } of alternates) {
    const link = Object.assign(document.createElement("link"), { rel: "alternate", hreflang, href });
    if (anchor) anchor.after(link);
    else document.head.append(link);
    anchor = link;
  }
}

function useDocumentMeta(route: Route) {
  const l = useLocale();
  useEffect(() => {
    const { title, description, canonical, alternates, image } = documentHead(route, l);
    document.title = title;
    setAttr('meta[name="description"]', "content", description);
    setAttr('link[rel="canonical"]', "href", canonical);
    setAlternates(alternates);
    setAttr('meta[property="og:title"]', "content", title);
    setAttr('meta[property="og:description"]', "content", description);
    setAttr('meta[property="og:url"]', "content", canonical);
    setAttr('meta[property="og:image"]', "content", SITE.url + image);
  }, [route, l]);
}

/** Đặt trong LocaleProvider (cần ngôn ngữ hiện tại). */
export function DocumentMeta({ route }: { route: Route }) {
  useDocumentMeta(route);
  return null;
}
