import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { PageProgress, PageProgressFallback, YugenProvider } from "@/components/ui";
import { useAppearance, type Appearance } from "@/hooks/useAppearance";
import { hrefOf, navigate, useDocsLocation } from "@/docs/router";
import { Sidebar } from "@/docs/layout/Sidebar";
import { TopBar } from "@/docs/layout/TopBar";
import { YugenMark } from "@/docs/YugenMark";
import { AuthorLink } from "@/docs/AuthorLink";
import { CONCEPT_BY_SLUG, CONCEPT_EN_PAGES } from "@/docs/concepts";
import { loadEnglish, LocaleProvider, useLocale, type Locale } from "@/docs/i18n";
import { FallbackNotice } from "@/docs/i18n/FallbackNotice";
import { DocumentMeta, fallbackOf } from "@/docs/seo";
import { lazyPage } from "@/docs/lazyPage";
import { preloadComponentDoc } from "@/docs/registry";
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
const NewsPage = lazyPage(() => import("@/docs/pages/NewsPage").then((m) => m.NewsPage));
const CommunityPage = lazyPage(() => import("@/docs/pages/CommunityPage").then((m) => m.CommunityPage));

/**
 * Nạp trước mọi phần nạp lười mà route cần (trang, nội dung khái niệm, demo, gói tiếng Anh). main.tsx chờ hàm này rồi
 * mới render, nên HTML prerender được thay bằng trang hoàn chỉnh trong một lần. Lỗi mạng bỏ qua: trang tự nạp lại khi render.
 */
export async function preloadRoute(route: Route, lang: Locale) {
  const pages = {
    home: HomePage,
    component: ComponentPage,
    concept: ConceptPage,
    foundation: FoundationsPage,
    blocks: BlocksPage,
    templates: TemplatesPage,
    "theme-designer": ThemeDesignerPage,
    news: NewsPage,
    community: CommunityPage,
  } as const;
  const tasks: Promise<unknown>[] = [];
  if (lang === "en") tasks.push(loadEnglish());
  if (route.kind in pages) tasks.push(pages[route.kind as keyof typeof pages].preload());
  if (route.kind === "concept") {
    const page = (lang === "en" && CONCEPT_EN_PAGES[route.slug]) || CONCEPT_BY_SLUG[route.slug]?.Page;
    if (page) tasks.push(page.preload());
  }
  if (route.kind === "component") tasks.push(preloadComponentDoc(route.slug));
  await Promise.allSettled(tasks);
}

/** Trang không có bản dịch nào (nội dung tiếng Việt) — đánh dấu lang="vi" cho trình đọc màn hình khi giao diện là tiếng Anh. */
function VietnameseContent({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return locale === "en" ? (
    <div lang="vi" className="contents">
      {children}
    </div>
  ) : (
    children
  );
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
  const { route, lang } = useDocsLocation(path);
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
    const idle = window.requestIdleCallback?.(() => void DocsCommandPalette.preload());
    return () => {
      window.removeEventListener("keydown", onKey);
      if (idle !== undefined) window.cancelIdleCallback(idle);
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
      if (nextLang && nextLang !== lang) navigate(hrefOf(route, nextLang) + window.location.search);
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
    <YugenProvider applyToDocument withToaster theme={theme} brand={brand} dir={dir}>
      <LocaleProvider locale={lang}>
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
            {fallback && <FallbackNotice partial={fallback === "partial"} />}
            <Suspense fallback={<PageProgressFallback />}>
              {route.kind === "home" && <HomePage />}
              {route.kind === "blocks" && (
                <VietnameseContent>
                  <BlocksPage />
                </VietnameseContent>
              )}
              {route.kind === "templates" && <TemplatesPage />}
              {route.kind === "theme-designer" && (
                <VietnameseContent>
                  <ThemeDesignerPage />
                </VietnameseContent>
              )}
              {route.kind === "news" && <NewsPage />}
              {route.kind === "community" && <CommunityPage />}
              {route.kind === "concept" && <ConceptPage slug={route.slug} />}
              {route.kind === "foundation" &&
                (route.slug === "motion" ? (
                  <FoundationsPage slug={route.slug} theme={tokenKey} />
                ) : (
                  <VietnameseContent>
                    <FoundationsPage slug={route.slug} theme={tokenKey} />
                  </VietnameseContent>
                ))}
              {route.kind === "component" && <ComponentPage slug={route.slug} theme={theme} brand={brand} />}
            </Suspense>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </YugenProvider>
  );
}
