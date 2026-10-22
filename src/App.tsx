import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { PageProgress, PageProgressFallback, YugenProvider } from "@/components/ui";
import { useAppearance } from "@/hooks/useAppearance";
import { useRoute } from "@/docs/router";
import { Sidebar } from "@/docs/layout/Sidebar";
import { TopBar } from "@/docs/layout/TopBar";
import { DocsCommandPalette } from "@/docs/layout/DocsCommandPalette";
import { HomePage } from "@/docs/pages/HomePage";
import { ComponentPage } from "@/docs/pages/ComponentPage";
import { ConceptPage } from "@/docs/pages/ConceptPage";
import { YugenMark } from "@/docs/YugenMark";
import { AuthorLink } from "@/docs/AuthorLink";
import { CONCEPT_EN_PAGES } from "@/docs/concepts";
import { LocaleProvider, useLocale } from "@/docs/i18n";
import { FallbackNotice } from "@/docs/i18n/FallbackNotice";
import { DocumentMeta } from "@/docs/seo";
import { SITE } from "@/docs/site";
import type { Route } from "@/docs/router";

// Trang ít dùng / nặng nạp lười theo route.
const FoundationsPage = lazy(() => import("@/docs/pages/FoundationsPage").then((m) => ({ default: m.FoundationsPage })));
const BlocksPage = lazy(() => import("@/docs/pages/BlocksPage").then((m) => ({ default: m.BlocksPage })));
const TemplatesPage = lazy(() => import("@/docs/pages/TemplatesPage").then((m) => ({ default: m.TemplatesPage })));
const ThemeDesignerPage = lazy(() => import("@/docs/pages/ThemeDesignerPage").then((m) => ({ default: m.ThemeDesignerPage })));
const NewsPage = lazy(() => import("@/docs/pages/NewsPage").then((m) => ({ default: m.NewsPage })));
const CommunityPage = lazy(() => import("@/docs/pages/CommunityPage").then((m) => ({ default: m.CommunityPage })));

/** Chế độ tiếng Anh: route nào còn hiện nội dung tiếng Việt (toàn trang hoặc một phần). */
function fallbackOf(route: Route): "page" | "partial" | null {
  if (route.kind === "home" || route.kind === "community" || route.kind === "templates") return null;
  if (route.kind === "news") return "partial";
  if (route.kind === "concept") return CONCEPT_EN_PAGES[route.slug] ? null : "page";
  return "page";
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

export default function App() {
  const route = useRoute();
  const { theme, brand, dir, lang, update } = useAppearance();
  const fallback = fallbackOf(route);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => setNavOpen(false), [route]);

  // Khoá dùng để trang đọc lại giá trị token khi theme / brand đổi.
  const tokenKey = `${theme}-${brand}`;

  return (
    <YugenProvider applyToDocument withToaster theme={theme} brand={brand} dir={dir}>
      <LocaleProvider locale={lang}>
        <DocumentMeta route={route} />
        <PageProgress />
        <Sidebar route={route} open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="min-h-dvh lg:ps-80">
          <TopBar
            appearance={{ theme, brand, dir, lang }}
            onChange={update}
            onOpenNav={() => setNavOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <DocsCommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            appearance={{ theme, brand, dir, lang }}
            onAppearanceChange={update}
          />
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
              {route.kind === "foundation" && (
                <VietnameseContent>
                  <FoundationsPage slug={route.slug} theme={tokenKey} />
                </VietnameseContent>
              )}
              {route.kind === "component" && <ComponentPage slug={route.slug} theme={theme} brand={brand} />}
            </Suspense>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </YugenProvider>
  );
}
