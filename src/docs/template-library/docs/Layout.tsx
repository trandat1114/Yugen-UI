import * as React from "react";
import { Accessibility20Regular, Navigation20Regular, Search20Regular, WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  Kbd,
  KbdGroup,
  Menu,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  Nav,
  NavItem,
  NavSectionHeader,
  SkeletonText,
  type YugenTheme,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Content } from "./content/types";
import { pageMeta, type DocPage as Page, type PageKind } from "./docs";
import { HomePage, NotFound, routeOf } from "./HomePage";
import { docsFor, loadPage, SiteContext, useSite } from "./pages";
import { Link, useRouter } from "./router";
import type { SearchEntry } from "./search";

// A page (Markdown renderer, code blocks) and the search palette are their own chunks: the first load is the frame, the
// sidebar and the home page.
const loadDocPage = () => import("./DocPage");
const DocPage = React.lazy(loadDocPage);
const loadSearch = () => import("./SearchPalette");
const SearchPalette = React.lazy(loadSearch);

const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];
const BASE = import.meta.env.BASE_URL;

export function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background text-subtitle2 font-semibold text-foreground-on-brand">
      桜
    </span>
  );
}

function ThemeMenu({ theme, onChange }: { theme: YugenTheme; onChange: (theme: YugenTheme) => void }) {
  const { t } = useSite();
  const icon = theme === "dark" ? <WeatherMoon20Regular /> : theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.appearance} />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuRadioGroup value={theme} onValueChange={(v) => onChange(v as YugenTheme)}>
          {THEMES.map((value) => (
            <MenuItemRadio key={value} value={value}>
              {t.themes[value]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

/** Sections and pages from the Markdown folders, in front matter order. */
function Sidebar({ current, onNavigate }: { current?: string; onNavigate?: () => void }) {
  const { t, docs } = useSite();
  return (
    <Nav selectedValue={current} aria-label={t.nav.label} density="small" className="px-3 pt-3 pb-6">
      {docs.sections.map((section) => (
        <React.Fragment key={section.slug}>
          <NavSectionHeader>{section.title}</NavSectionHeader>
          {section.pages.map((page) => (
            <NavItem key={page.key} value={page.key} asChild>
              <Link to={routeOf(page)} onClick={onNavigate}>
                <span className="min-w-0 flex-1 truncate">{page.title}</span>
              </Link>
            </NavItem>
          ))}
        </React.Fragment>
      ))}
    </Nav>
  );
}

export interface LayoutProps {
  t: Content;
  theme: YugenTheme;
  onThemeChange: (theme: YugenTheme) => void;
  /** Embedded in another page (preview): no landmarks, headings start at h2, no global shortcut, no <head> changes. */
  embedded: boolean;
}

/**
 * Site frame: top bar, sidebar (a Drawer below 896px), the page and a footer. The window scrolls, so the sidebar and the
 * table of contents are sticky; embedded, the content column scrolls inside the frame. Breakpoints are container queries.
 */
export function Layout({ t, theme, onThemeChange, embedded }: LayoutProps) {
  const { route, navigate } = useRouter();
  const docs = docsFor(t.lang);
  const site = React.useMemo(() => ({ t, docs }), [t, docs]);
  const mainRef = React.useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  // The palette chunk loads on first use (or when the pointer reaches the search button).
  const [searchUsed, setSearchUsed] = React.useState(false);
  const page: Page | undefined = route.name === "page" ? docs.byKey[`${route.section}/${route.page}`] : undefined;
  // Start loading the text with the page chunk, not after it.
  const text = page ? loadPage(t.lang, page) : undefined;
  const Header = embedded ? "div" : "header";
  const Main = embedded ? "div" : "main";
  const Footer = embedded ? "div" : "footer";
  const headingLevel = embedded ? "h2" : "h1";
  const [mac] = React.useState(() => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent));

  const openSearch = React.useCallback(() => {
    setSearchUsed(true);
    setSearchOpen(true);
  }, []);

  React.useEffect(() => {
    if (embedded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchUsed(true);
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [embedded]);

  // Fetch the page chunk while the browser is idle, so the first click on a page does not wait for it.
  React.useEffect(() => {
    const preload = () => void loadDocPage();
    const id = window.requestIdleCallback?.(preload) ?? window.setTimeout(preload, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);

  // A new page starts at the top; a link to a heading is scrolled by the page once its text is there.
  React.useEffect(() => {
    if (route.name === "page" && route.hash) return;
    if (embedded) mainRef.current?.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0 });
  }, [route, embedded]);

  React.useEffect(() => {
    if (embedded) return;
    const kind: PageKind = page ? { kind: "page", page } : route.name === "home" ? { kind: "home" } : { kind: "notFound" };
    const { title, description } = pageMeta(kind, t);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [page, route.name, embedded, t]);

  const onSearchSelect = (entry: SearchEntry) => {
    setNavOpen(false);
    navigate({ ...routeOf(entry.page), ...(entry.hash && { hash: entry.hash }) });
  };

  return (
    <SiteContext.Provider value={site}>
      <div className={cn("@container/docs flex flex-col bg-background-1 text-foreground-1", embedded ? "h-full" : "min-h-dvh")}>
        {!embedded && (
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:inset-s-3 focus:top-3 focus:z-30 focus:rounded-medium focus:bg-background-1 focus:px-3 focus:py-2 focus:shadow-8"
          >
            {t.skipToContent}
          </a>
        )}
        <Header className={cn("z-20 shrink-0 border-b border-stroke-2 bg-background-1", !embedded && "sticky top-0")}>
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
            <Button appearance="subtle" icon={<Navigation20Regular />} aria-label={t.nav.open} className="@4xl/docs:hidden" onClick={() => setNavOpen(true)} />
            <Link to={{ name: "home" }} className="flex min-w-0 items-center gap-2 rounded-medium font-display text-subtitle2 font-semibold text-foreground-1">
              <Logo />
              <span className="truncate">{t.site.title}</span>
            </Link>
            <div className="ms-auto flex items-center gap-1">
              <Button
                appearance="subtle"
                icon={<Search20Regular />}
                aria-label={t.search.button}
                className="@2xl/docs:hidden"
                onClick={openSearch}
                onPointerEnter={() => void loadSearch()}
              />
              <Button
                icon={<Search20Regular />}
                className="hidden w-60 justify-start text-foreground-3 @2xl/docs:inline-flex"
                onClick={openSearch}
                onPointerEnter={() => void loadSearch()}
                onFocus={() => void loadSearch()}
              >
                <span className="flex-1 text-start">{t.search.button}</span>
                {!embedded && (
                  <KbdGroup>
                    <Kbd>{mac ? "⌘" : "Ctrl"}</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                )}
              </Button>
              <ThemeMenu theme={theme} onChange={onThemeChange} />
            </div>
          </div>
        </Header>

        <div className={cn("mx-auto flex w-full max-w-7xl flex-1", embedded && "min-h-0")}>
          <div
            className={cn(
              "hidden w-64 shrink-0 overflow-y-auto border-e border-stroke-2 @4xl/docs:block",
              !embedded && "sticky top-14 h-[calc(100dvh-3.5rem)] self-start",
            )}
          >
            <Sidebar current={page?.key} />
          </div>

          <Main
            ref={mainRef}
            id={embedded ? undefined : "content"}
            tabIndex={embedded ? undefined : -1}
            aria-label={embedded ? t.site.title : undefined}
            className={cn("flex min-w-0 flex-1 flex-col outline-none", embedded && "overflow-y-auto")}
          >
            <div className="flex-1 px-4 py-8 @3xl/docs:px-10">
              {route.name === "home" && <HomePage headingLevel={headingLevel} />}
              {route.name === "page" &&
                (page && text ? (
                  <React.Suspense fallback={<SkeletonText lines={8} className="max-w-3xl" />}>
                    <DocPage key={page.key} page={page} text={text} target={route} headingLevel={headingLevel} scrollRoot={embedded ? mainRef : undefined} />
                  </React.Suspense>
                ) : (
                  <NotFound headingLevel={headingLevel} />
                ))}
              {route.name === "notFound" && <NotFound headingLevel={headingLevel} />}
            </div>
            <Footer className="border-t border-stroke-2">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 text-caption1 text-foreground-3 @3xl/docs:px-10">
                <span>
                  © {new Date().getFullYear()} {t.site.product} · {t.footer.builtWith}{" "}
                  <a className="text-link underline hover:text-link-hover" href="https://trandat1114.github.io/Yugen-UI/" target="_blank" rel="noreferrer">
                    Yugen UI
                  </a>
                </span>
                {/* Generated at build time: not there in the embedded preview. */}
                {embedded ? (
                  <span>Sitemap</span>
                ) : (
                  <a className="text-link underline hover:text-link-hover" href={`${BASE}sitemap.xml`}>
                    Sitemap
                  </a>
                )}
              </div>
            </Footer>
          </Main>
        </div>

        <Drawer open={navOpen} onOpenChange={setNavOpen}>
          <DrawerSurface position="start" size="small" aria-describedby={undefined} className="flex flex-col p-0">
            <DrawerHeader className="flex-row items-center gap-2 border-b border-stroke-2 px-4 py-3">
              <Logo />
              <DrawerHeaderTitle>{t.site.title}</DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody className="min-h-0 flex-1 p-0">
              <Sidebar current={page?.key} onNavigate={() => setNavOpen(false)} />
            </DrawerBody>
          </DrawerSurface>
        </Drawer>

        {searchUsed && (
          <React.Suspense fallback={null}>
            <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} onSelect={onSearchSelect} />
          </React.Suspense>
        )}
      </div>
    </SiteContext.Provider>
  );
}
