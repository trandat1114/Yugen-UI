import { useEffect } from "react";
import { CONCEPT_BY_SLUG } from "./concepts";
import { FOUNDATIONS } from "./foundations";
import { useLocale, type LocaleValue } from "./i18n";
import { COMPONENT_META_BY_SLUG, COMPONENTS_META } from "./registry";
import type { Route } from "./router";
import { SITE } from "./site";

/**
 * Tiêu đề tab, <meta name="description"> và og:* theo trang đang xem. Crawler chỉ đọc HTML tĩnh vẫn thấy giá trị mặc định
 * trong index.html — URL theo đường dẫn và prerender từng trang nằm trong ROADMAP (mục SEO).
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
    en: ["Theme Designer", "Generate a 16-step brand ramp from one colour, preview it on real components in light / dark and export CSS, JSON or Tokens Studio."],
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

function setContent(selector: string, value: string) {
  document.head.querySelector(selector)?.setAttribute("content", value);
}

function useDocumentMeta(route: Route) {
  const l = useLocale();
  useEffect(() => {
    const { title, description } = routeMeta(route, l);
    document.title = title ? `${title} · ${SITE.name}` : `${SITE.name} — React + Tailwind CSS v4`;
    setContent('meta[name="description"]', description);
    setContent('meta[property="og:title"]', document.title);
    setContent('meta[property="og:description"]', description);
  }, [route, l]);
}

/** Đặt trong LocaleProvider (cần ngôn ngữ hiện tại). */
export function DocumentMeta({ route }: { route: Route }) {
  useDocumentMeta(route);
  return null;
}
