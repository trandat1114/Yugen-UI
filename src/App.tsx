import { lazy, Suspense, useEffect, useState } from "react";
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

// Trang ít dùng / nặng nạp lười theo route.
const FoundationsPage = lazy(() => import("@/docs/pages/FoundationsPage").then((m) => ({ default: m.FoundationsPage })));
const BlocksPage = lazy(() => import("@/docs/pages/BlocksPage").then((m) => ({ default: m.BlocksPage })));
const ThemeDesignerPage = lazy(() => import("@/docs/pages/ThemeDesignerPage").then((m) => ({ default: m.ThemeDesignerPage })));
const NewsPage = lazy(() => import("@/docs/pages/NewsPage").then((m) => ({ default: m.NewsPage })));
const CommunityPage = lazy(() => import("@/docs/pages/CommunityPage").then((m) => ({ default: m.CommunityPage })));

export default function App() {
  const route = useRoute();
  const { theme, brand, dir, update } = useAppearance();
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => setNavOpen(false), [route]);

  // Khoá dùng để trang đọc lại giá trị token khi theme / brand đổi.
  const tokenKey = `${theme}-${brand}`;

  return (
    <YugenProvider applyToDocument withToaster theme={theme} brand={brand} dir={dir}>
      <PageProgress />
      <Sidebar route={route} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="min-h-dvh lg:ps-80">
        <TopBar
          appearance={{ theme, brand, dir }}
          onChange={update}
          onOpenNav={() => setNavOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <DocsCommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          appearance={{ theme, brand, dir }}
          onAppearanceChange={update}
        />
        <main className="mx-auto max-w-7xl px-L md:px-12">
          <Suspense fallback={<PageProgressFallback />}>
            {route.kind === "home" && <HomePage />}
            {route.kind === "blocks" && <BlocksPage />}
            {route.kind === "theme-designer" && <ThemeDesignerPage />}
            {route.kind === "news" && <NewsPage />}
            {route.kind === "community" && <CommunityPage />}
            {route.kind === "concept" && <ConceptPage slug={route.slug} />}
            {route.kind === "foundation" && <FoundationsPage slug={route.slug} theme={tokenKey} />}
            {route.kind === "component" && <ComponentPage slug={route.slug} theme={theme} brand={brand} />}
          </Suspense>
        </main>
        <footer className="mx-auto mt-XXXL flex max-w-7xl flex-wrap items-center justify-between gap-M border-t border-stroke-2 px-L py-XL text-caption1 text-foreground-3 md:px-12">
          <span className="flex items-center gap-S">
            <YugenMark size={18} />
            <span>
              <span className="font-semibold text-foreground-1">Yugen UI</span> © {new Date().getFullYear()} · tạo bởi{" "}
              <span className="font-semibold text-foreground-1">trandat1114</span>
            </span>
          </span>
          <span>
            Lấy cảm hứng từ Microsoft Fluent 2 · Không phải sản phẩm chính thức của Microsoft · React + Tailwind CSS v4
          </span>
        </footer>
      </div>
    </YugenProvider>
  );
}
