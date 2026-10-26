import * as React from "react";
import {
  BookOpen20Filled,
  BookOpen20Regular,
  Map20Filled,
  Map20Regular,
  Search20Regular,
  Settings20Filled,
  Settings20Regular,
} from "@fluentui/react-icons";
import {
  Nav,
  NavItem,
  PageProgressFallback,
  SkeletonText,
  Toolbar,
  ToolbarButton,
  useScrollMinimize,
} from "yugen-ui";
import { cn } from "yugen-ui";
import { SOLID_MATERIAL, type Appearance } from "./appearance";
import type { Content } from "./content/types";
import { Logo } from "./Photo";
import { Link, useRouter, type Route } from "./router";
import { SearchDialog } from "./SearchDialog";

// Each page is its own chunk.
const HomePage = React.lazy(() => import("./HomePage"));
const TripPage = React.lazy(() => import("./TripPage"));
const ExplorePage = React.lazy(() => import("./ExplorePage"));
const SettingsPage = React.lazy(() => import("./SettingsPage"));
const NotFoundPage = React.lazy(() => import("./NotFoundPage"));

/** What every page gets. */
export interface PageProps {
  t: Content;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /** Embedded in another page (preview): headings start at h2, nothing is saved. */
  embedded: boolean;
}

export interface LayoutProps extends PageProps {}

type Section = "home" | "explore" | "settings";

const SECTIONS: { section: Section; route: Route; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
  { section: "home", route: { name: "home" }, icon: <BookOpen20Regular />, activeIcon: <BookOpen20Filled /> },
  { section: "explore", route: { name: "explore" }, icon: <Map20Regular />, activeIcon: <Map20Filled /> },
  { section: "settings", route: { name: "settings" }, icon: <Settings20Regular />, activeIcon: <Settings20Filled /> },
];

function sectionOf(route: Route): Section | undefined {
  if (route.name === "home" || route.name === "trip") return "home";
  if (route.name === "explore" || route.name === "settings") return route.name;
  return undefined;
}

function PageFallback({ embedded }: { embedded: boolean }) {
  const skeleton = (
    <div className="mx-auto w-full max-w-3xl p-6 pt-24">
      <SkeletonText lines={4} />
    </div>
  );
  return embedded ? skeleton : <PageProgressFallback>{skeleton}</PageProgressFallback>;
}

/**
 * App frame. Content scrolls in one container; the navigation floats above it in glass: a sidebar (icon rail on medium
 * widths) from 768px, a header and a bottom tab bar below. Breakpoints are container queries, so the app also adapts to
 * the frame it is embedded in.
 */
export function Layout({ t, appearance, onAppearanceChange, embedded }: LayoutProps) {
  const { route } = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const minimized = useScrollMinimize({ target: scrollRef });
  const [searchOpen, setSearchOpen] = React.useState(false);
  const section = sectionOf(route);
  // Trip and Explore have their own bars over the photo.
  const header = route.name !== "trip" && route.name !== "explore";
  const labels: Record<Section, string> = { home: t.nav.home, explore: t.nav.explore, settings: t.nav.settings };

  // A new page starts at the top.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [route]);

  React.useEffect(() => {
    if (embedded) return;
    const page =
      route.name === "trip" ? t.trips[route.id]?.title : route.name === "notFound" ? t.notFound.title : section ? labels[section] : undefined;
    document.title = page && route.name !== "home" ? t.pageTitle(page) : t.appName;
  });

  const pageProps: PageProps = { t, appearance, onAppearanceChange, embedded };
  const page =
    route.name === "home" ? (
      <HomePage {...pageProps} />
    ) : route.name === "trip" ? (
      <TripPage {...pageProps} id={route.id} />
    ) : route.name === "explore" ? (
      <ExplorePage {...pageProps} />
    ) : route.name === "settings" ? (
      <SettingsPage {...pageProps} />
    ) : (
      <NotFoundPage {...pageProps} />
    );
  // Embedded: no landmarks that would clash with the host page's own <main> and <header>.
  const Main = embedded ? "div" : "main";
  const Header = embedded ? "div" : "header";

  return (
    <div
      style={appearance.material === "solid" ? SOLID_MATERIAL : undefined}
      className={cn("@container/app relative isolate overflow-hidden bg-shell text-foreground-1", embedded ? "h-full" : "h-dvh")}
    >
      <Main ref={scrollRef} className="h-full overflow-y-auto">
        <React.Suspense fallback={<PageFallback embedded={embedded} />}>{page}</React.Suspense>
      </Main>

      {/* Sidebar: from 768px, an icon rail until 1024px. Floats over the photos (background extension). */}
      <div className="absolute inset-y-3 inset-s-3 z-20 hidden @3xl/app:flex">
        <Nav
          material="glass"
          aria-label={t.nav.label}
          selectedValue={section}
          className="w-16 overflow-y-auto @5xl/app:w-60"
        >
          <div className="flex items-center gap-2 px-2 pt-1 pb-3">
            <Logo />
            <span className="truncate font-display text-subtitle2 font-semibold @3xl/app:sr-only @5xl/app:not-sr-only">
              {t.appName}
            </span>
          </div>
          {SECTIONS.map((item) => (
            <NavItem key={item.section} value={item.section} asChild>
              <Link to={item.route}>
                {section === item.section ? item.activeIcon : item.icon}
                <span className="min-w-0 flex-1 truncate @3xl/app:sr-only @5xl/app:not-sr-only">{labels[item.section]}</span>
              </Link>
            </NavItem>
          ))}
          <NavItem value="search" asChild onClick={(e) => e.preventDefault()}>
            <button type="button" onClick={() => setSearchOpen(true)}>
              <Search20Regular />
              <span className="min-w-0 flex-1 truncate @3xl/app:sr-only @5xl/app:not-sr-only">{t.nav.search}</span>
            </button>
          </NavItem>
        </Nav>
      </div>

      {/* Narrow screens: header with the scroll edge, and a tab bar that shrinks while scrolling down. */}
      {header && (
        <Header className="scroll-edge absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-3 @3xl/app:hidden">
          <Toolbar material="glass" aria-label={t.appName}>
            <Link to={{ name: "home" }} className="flex items-center gap-2 rounded-circular pe-2" data-toolbar-item="">
              <Logo />
              <span className="font-display text-body1 font-semibold">{t.appName}</span>
            </Link>
            <ToolbarButton icon={<Search20Regular />} aria-label={t.nav.search} onClick={() => setSearchOpen(true)} />
          </Toolbar>
        </Header>
      )}
      <div className="scroll-edge-above absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3 @3xl/app:hidden">
        <nav
          aria-label={t.nav.label}
          data-minimized={minimized || undefined}
          className="group/tabbar glass flex items-center gap-0.5 rounded-circular border border-transparent p-1 shadow-16"
        >
          {SECTIONS.map((item) => {
            const current = section === item.section;
            return (
              <Link
                key={item.section}
                to={item.route}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-circular px-3 py-1.5 text-body1 text-foreground-2 hover:bg-subtle-hover active:bg-subtle-pressed",
                  "[&_svg]:size-5 [&_svg]:shrink-0",
                  current && "bg-(--glass-selected) font-semibold text-foreground-1 [&_svg]:text-brand-foreground-1",
                )}
              >
                {current ? item.activeIcon : item.icon}
                {/* Shrunk while scrolling down: icons only; the names come back on keyboard focus. */}
                <span className={cn(minimized && "sr-only group-focus-within/tabbar:not-sr-only")}>{labels[item.section]}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t.nav.search}
            className="flex size-9 items-center justify-center rounded-circular text-foreground-2 hover:bg-subtle-hover active:bg-subtle-pressed [&_svg]:size-5"
          >
            <Search20Regular />
          </button>
        </nav>
      </div>

      <SearchDialog t={t} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
