import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { ErrorBoundary, PageProgress, PageProgressFallback, YugenProvider } from "@/components/ui";
import { useAppearance, type Appearance } from "@/hooks/useAppearance";
import { docsPath, hrefOf, localePathOf, navigate, useDocsLocation } from "@/docs/router";
import { Sidebar } from "@/docs/layout/Sidebar";
import { AppearancePicker, TopBar } from "@/docs/layout/TopBar";
import { dismissLanguageSuggestion, LanguageSuggestion } from "@/docs/layout/LanguageSuggestion";
import { YugenMark } from "@/docs/YugenMark";
import { AuthorLink } from "@/docs/AuthorLink";
import { CONCEPT_BY_SLUG, CONCEPT_EN_PAGES } from "@/docs/concepts";
import { loadLocale, LocaleProvider, useLocale, type Locale } from "@/docs/i18n";
import { FallbackNotice } from "@/docs/i18n/FallbackNotice";
import { DocumentMeta, fallbackOf, resolveRoute } from "@/docs/seo";
import { lazyPage } from "@/docs/lazyPage";
import { preloadComponentDoc, retryComponentDoc } from "@/docs/registry";
import { preloadNews } from "@/docs/news";
import { installIntentPrefetch } from "@/docs/prefetch";
import { SITE } from "@/docs/site";
import type { Route } from "@/docs/router";

// Mọi trang nạp lười theo route: phần dùng chung (khung, sidebar) không kéo theo component riêng của từng trang. Trang chủ
// cũng vậy — showcase của nó dùng lịch, biểu đồ, NotificationCenter…, không nên tải ở mọi trang.
const HomePage = lazyPage(() => import("@/docs/pages/HomePage").then((m) => m.HomePage));
const ComponentPage = lazyPage(() => import("@/docs/pages/ComponentPage").then((m) => m.ComponentPage));
const ConceptPage = lazyPage(() => import("@/docs/pages/ConceptPage").then((m) => m.ConceptPage));
// Bảng lệnh (cmdk, mọi mục điều hướng) chỉ cần khi mở: nạp lúc trình duyệt rảnh sau lần render đầu, nên lần mở đầu vẫn tức thì.
const DocsCommandPalette = lazyPage(() => import("@/docs/layout/DocsCommandPalette").then((m) => m.DocsCommandPalette));
const FoundationsPage = lazyPage(() => import("@/docs/pages/FoundationsPage").then((m) => m.FoundationsPage));
const BlocksPage = lazyPage(() => import("@/docs/pages/BlocksPage").then((m) => m.BlocksPage));
// Preview của template cũng nạp cùng trang: HTML prerender có sẵn preview, thay bằng khung chờ sẽ nháy.
const TemplatesPage = lazyPage(() => import("@/docs/pages/TemplatesPage").then((m) => m.Preview.preload().then(() => m.TemplatesPage)));
const ThemeDesignerPage = lazyPage(() => import("@/docs/pages/ThemeDesignerPage").then((m) => m.ThemeDesignerPage));
const TypesetPage = lazyPage(() => import("@/docs/pages/TypesetPage").then((m) => m.TypesetPage));
const NewsPage = lazyPage(() => import("@/docs/pages/NewsPage").then((m) => m.NewsPage));
const CommunityPage = lazyPage(() => import("@/docs/pages/CommunityPage").then((m) => m.CommunityPage));
const ContributorsPage = lazyPage(() => import("@/docs/pages/ContributorsPage").then((m) => m.ContributorsPage));
const NotFoundPage = lazyPage(() => import("@/docs/pages/NotFoundPage").then((m) => m.NotFoundPage));

const PAGES = {
  home: HomePage,
  component: ComponentPage,
  concept: ConceptPage,
  foundation: FoundationsPage,
  blocks: BlocksPage,
  templates: TemplatesPage,
  "theme-designer": ThemeDesignerPage,
  typeset: TypesetPage,
  news: NewsPage,
  community: CommunityPage,
  contributors: ContributorsPage,
  "not-found": NotFoundPage,
} as const;

const pageOf = (route: Route) => PAGES[route.kind];
const conceptPageOf = (slug: string, lang: Locale) => (lang === "en" && CONCEPT_EN_PAGES[slug]) || CONCEPT_BY_SLUG[slug]?.Page;

/**
 * Nạp trước mọi phần nạp lười mà route cần (trang, nội dung khái niệm, demo, gói ngôn ngữ). main.tsx chờ hàm này rồi
 * mới render, nên HTML prerender được thay bằng trang hoàn chỉnh trong một lần. Lỗi mạng bỏ qua: trang tự nạp lại khi render.
 */
export async function preloadRoute(parsed: Route, lang: Locale) {
  const route = resolveRoute(parsed);
  const tasks: Promise<unknown>[] = [loadLocale(lang), pageOf(route).preload()];
  if (route.kind === "concept") {
    const page = conceptPageOf(route.slug, lang);
    if (page) tasks.push(page.preload());
  }
  if (route.kind === "component") {
    const { slug } = route;
    // Bảng Messages (danh sách namespace, export của thư viện) chỉ trang component cần: không nằm trong chunk chính (#307).
    tasks.push(preloadComponentDoc(slug, lang), import("@/docs/componentMessages").then((m) => m.preloadComponentMessages(slug)));
  }
  // Block tiếng Việt là chunk riêng (trang tiếng Anh không tải): nạp cùng trang để HTML prerender và lần render đầu đã là tiếng Việt.
  if (route.kind === "blocks" && lang === "vi") tasks.push(import("@/docs/pages/BlocksPage").then((m) => m.preloadBlocksVi()));
  if (route.kind === "news") tasks.push(preloadNews(lang));
  await Promise.allSettled(tasks);
}

/**
 * Nạp trước trang người dùng sắp mở (trỏ / focus / chạm vào link, #305): chunk của trang, nội dung khái niệm, demo, gói
 * ngôn ngữ. Khác `preloadRoute`: lỗi mạng không được giữ lại, lần mở thật tự nạp lại.
 */
export function prefetchRoute({ route: parsed, lang }: { route: Route; lang: Locale }) {
  const route = resolveRoute(parsed);
  void loadLocale(lang).catch(() => {});
  pageOf(route).prefetch();
  if (route.kind === "concept") conceptPageOf(route.slug, lang)?.prefetch();
  if (route.kind === "component") {
    const { slug } = route;
    void preloadComponentDoc(slug, lang).then(() => retryComponentDoc(slug, lang));
    import("@/docs/componentMessages").then(
      (m) => m.messageNamespacesFor(slug).length > 0 && m.MessagesTable.prefetch(),
      () => {},
    );
  }
}


const FOOTER_LINKS = [
  { label: "GitHub", href: SITE.links.repository },
  { label: "npm", href: SITE.links.npm },
  { key: "footer.discussions", href: SITE.links.discussions },
  { key: "footer.report", href: `${SITE.links.issues}/new/choose` },
] as const;

function Footer() {
  const { t } = useLocale();
  return (
    <footer className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-stroke-2 px-4 py-5 text-caption1 text-foreground-3 md:px-12">
      <span className="flex items-center gap-2">
        <YugenMark size={18} />
        <span>
          <span className="font-semibold text-foreground-1">Yugen UI</span> © {new Date().getFullYear()} · {t("credit.by")}{" "}
          <AuthorLink className="text-foreground-1" />
        </span>
      </span>
      <nav aria-label={t("footer.links")} className="flex flex-wrap items-center gap-4">
        <a href={docsPath("/contributors")} className="hover:text-foreground-1 hover:underline">
          {t("nav.contributors")}
        </a>
        {FOOTER_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="hover:text-foreground-1 hover:underline">
            {"label" in link ? link.label : t(link.key)}
          </a>
        ))}
      </nav>
    </footer>
  );
}

/** `path`: prerender ở Node (scripts/prerender.mjs) truyền đường dẫn thay cho `window.location`. */
export default function App({ path }: { path?: string }) {
  const location = useDocsLocation(path);
  const { lang } = location;
  // Slug không tồn tại (component, khái niệm, nền tảng) cũng là trang 404 (#238).
  const route = resolveRoute(location.route);
  const { theme, brand, dir, lang: savedLang, update } = useAppearance();
  const fallback = fallbackOf(route);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Giữ bảng lệnh trong cây sau lần mở đầu (animation đóng, giữ trạng thái).
  const [paletteMounted, setPaletteMounted] = useState(false);
  if (paletteOpen && !paletteMounted) setPaletteMounted(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    const idle = window.requestIdleCallback?.(() => {
      DocsCommandPalette.prefetch();
      AppearancePicker.prefetch();
    });
    const uninstall = installIntentPrefetch(prefetchRoute);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      uninstall();
    };
  }, []);

  useEffect(() => setNavOpen(false), [route]);
  // Ngôn ngữ theo URL (/en/…). Lưu làm lựa chọn: lần sau mở link tiếng Việt, main.tsx chuyển sang bản tiếng Anh.
  useEffect(() => {
    if (savedLang !== lang) update({ lang });
  }, [lang, savedLang, update]);
  // Đổi ngôn ngữ = sang URL của trang này ở ngôn ngữ kia; theme / brand / hướng chữ đổi tại chỗ.
  const change = useCallback(
    ({ lang: nextLang, ...rest }: Partial<Appearance>) => {
      if (nextLang && nextLang !== lang) {
        // Đã tự chọn ngôn ngữ: không gợi ý tiếng Việt nữa (#277).
        dismissLanguageSuggestion();
        navigate(hrefOf(route, nextLang) + window.location.search);
      }
      if (Object.keys(rest).length > 0) update(rest);
    },
    [lang, route, update],
  );
  // Script trong index.html ẩn HTML prerender khi nó không khớp với trang sẽ hiện (tiếng Anh, RTL, link #/… cũ): hiện lại ở
  // đây. data-docs-ready: React đã thay HTML prerender (e2e chờ dấu này trước khi đo).
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-pending");
    root.setAttribute("data-docs-ready", "");
  }, []);

  // Khoá dùng để trang đọc lại giá trị token khi theme / brand đổi.
  const tokenKey = `${theme}-${brand}`;

  return (
    <LocaleProvider locale={lang}>
      <DocsProvider theme={theme} brand={brand} dir={dir}>
        <DocumentMeta route={route} />
        <PageProgress />
        <Sidebar route={route} open={navOpen} onClose={() => setNavOpen(false)} onOpenPalette={() => setPaletteOpen(true)} />
        <div className="min-h-dvh transition-[padding] duration-normal ease-decelerate-mid in-data-docs-resizing:transition-none motion-reduce:transition-none lg:ps-(--docs-sidebar-width)">
          <TopBar
            appearance={{ theme, brand, dir, lang }}
            onChange={change}
            onOpenNav={() => setNavOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          {paletteMounted && (
            <Suspense fallback={null}>
              <DocsCommandPalette
                open={paletteOpen}
                onOpenChange={setPaletteOpen}
                appearance={{ theme, brand, dir, lang }}
                onAppearanceChange={change}
              />
            </Suspense>
          )}
          <main className="mx-auto max-w-7xl px-4 md:px-12">
            <LanguageSuggestion onChoose={() => change({ lang: "vi" })} />
            {fallback && <FallbackNotice />}
            {/* Lỗi nạp file sau khi deploy (tab cũ) hoặc lỗi render: trang trạng thái thay vì trang trắng; đổi trang thì thử lại. */}
            <ErrorBoundary resetKeys={[localePathOf(route, lang)]}>
            <Suspense fallback={<PageProgressFallback />}>
              {route.kind === "home" && <HomePage />}
              {route.kind === "blocks" && <BlocksPage />}
              {route.kind === "templates" && <TemplatesPage />}
              {route.kind === "theme-designer" && <ThemeDesignerPage />}
              {route.kind === "typeset" && <TypesetPage />}
              {route.kind === "news" && <NewsPage />}
              {route.kind === "community" && <CommunityPage />}
              {route.kind === "contributors" && <ContributorsPage />}
              {route.kind === "concept" && <ConceptPage slug={route.slug} />}
              {route.kind === "foundation" && <FoundationsPage slug={route.slug} theme={tokenKey} />}
              {route.kind === "component" && <ComponentPage slug={route.slug} theme={theme} brand={brand} />}
              {route.kind === "not-found" && <NotFoundPage path={route.path} onSearch={() => setPaletteOpen(true)} />}
            </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </DocsProvider>
    </LocaleProvider>
  );
}

/** YugenProvider gốc của docs, nằm trong LocaleProvider: demo ở trang /en/ có chuỗi có sẵn và định dạng Intl tiếng Anh. */
function DocsProvider({ children, ...appearance }: Pick<Appearance, "theme" | "brand" | "dir"> & { children: ReactNode }) {
  const { ui, locale } = useLocale();
  return (
    <YugenProvider applyToDocument withToaster {...appearance} messages={ui} locale={locale === "en" ? "en-US" : "vi-VN"}>
      {children}
    </YugenProvider>
  );
}
