import * as React from "react";
import {
  Accessibility20Regular,
  Board20Regular,
  Money20Regular,
  People20Regular,
  Settings20Regular,
  SignOut20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Avatar,
  Button,
  DateRangePicker,
  DEFAULT_RANGE_PRESETS,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  Nav,
  NavItem,
  NavSectionHeader,
  PageProgressFallback,
  Persona,
  SearchBox,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  Skeleton,
  SkeletonItem,
  toast,
  useMediaQuery,
  type DateRange as PickerRange,
  type DateRangePreset,
  type YugenTheme,
} from "yugen-ui";
import { createMockApi, DEFAULT_MOCK_OPTIONS, type MockOptions } from "./api";
import type { Content } from "./content/types";
import { BRANDS, DashboardContext, THEMES, useDashboard, type Appearance, type DashboardValue } from "./context";
import { lastDays, lastMonths, type DateRange } from "./dates";
import { Link, useRouter, type PageId } from "./router";

/** Each page is its own chunk; hovering or focusing its nav item starts the download. */
const loaders = {
  overview: () => import("./pages/Overview"),
  revenue: () => import("./pages/Revenue"),
  customers: () => import("./pages/Customers"),
  settings: () => import("./pages/Settings"),
} satisfies Record<PageId, () => Promise<{ default: React.ComponentType }>>;

const PAGES: Record<PageId, React.LazyExoticComponent<React.ComponentType>> = {
  overview: React.lazy(loaders.overview),
  revenue: React.lazy(loaders.revenue),
  customers: React.lazy(loaders.customers),
  settings: React.lazy(loaders.settings),
};

const ICONS: Record<PageId, React.ReactNode> = {
  overview: <Board20Regular />,
  revenue: <Money20Regular />,
  customers: <People20Regular />,
  settings: <Settings20Regular />,
};

export interface DashboardProps {
  content: Content;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /**
   * Embedded in another page (the docs preview): fills its container, no <main> landmark or skip link, page titles start
   * at h2 and the document title is left alone. Pair it with `MemoryRouter` so the URL does not change either.
   */
  embedded?: boolean;
}

function Logo() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background text-subtitle2 font-semibold text-foreground-on-brand"
    >
      桜
    </span>
  );
}

/** Collapses to icons on wide screens and opens as a Drawer on narrow ones (following a link closes it). */
function AppSidebar() {
  const { content: t } = useDashboard();
  const { route } = useRouter();
  const item = (id: PageId) => (
    <NavItem key={id} value={id} asChild tooltip={t.pages[id].label}>
      <Link to={id} onPointerEnter={() => void loaders[id]()} onFocus={() => void loaders[id]()}>
        {ICONS[id]}
        <span className="min-w-0 flex-1 truncate">{t.pages[id].label}</span>
      </Link>
    </NavItem>
  );
  return (
    <Sidebar defaultWidth={240} label={t.appName}>
      <SidebarHeader>
        <Logo />
        <div className="min-w-0 in-data-rail:hidden">
          <p className="truncate text-body1 font-semibold">{t.appName}</p>
          <p className="truncate text-caption1 text-foreground-3">{t.storeName}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Nav selectedValue={route === "notFound" ? undefined : route} aria-label={t.nav.label}>
          <NavSectionHeader>{t.nav.reports}</NavSectionHeader>
          {(["overview", "revenue", "customers"] as const).map(item)}
          <NavSectionHeader>{t.nav.workspace}</NavSectionHeader>
          {item("settings")}
        </Nav>
      </SidebarContent>
    </Sidebar>
  );
}

function ThemeMenu() {
  const { content: t, appearance, setAppearance } = useDashboard();
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.nav.appearance} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>{t.nav.mode}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => setAppearance({ theme: v as YugenTheme })}>
          {THEMES.map((theme) => (
            <MenuItemRadio key={theme} value={theme}>
              {t.themes[theme]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>{t.nav.brand}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => setAppearance({ brand: v })}>
          {BRANDS.map((b) => (
            <MenuItemRadio key={b.value} value={b.value}>
              {b.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

function UserMenu() {
  const { content: t } = useDashboard();
  const { navigate } = useRouter();
  return (
    <Menu>
      <MenuTrigger asChild>
        {/* The name comes from the content ("Account: " + the Avatar's label), so it matches the initials on screen. */}
        <button type="button" className="rounded-circular">
          <span className="sr-only">{t.nav.account}: </span>
          <Avatar name={t.user.name} size={32} color="brand" />
        </button>
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-60">
        <Persona name={t.user.name} secondaryText={t.user.email} size="medium" avatar={{ color: "brand" }} className="px-2 py-2" />
        <MenuDivider />
        <MenuItem icon={<Settings20Regular />} onSelect={() => navigate("settings")}>
          {t.pages.settings.label}
        </MenuItem>
        <MenuItem icon={<SignOut20Regular />} onSelect={() => toast({ intent: "info", title: t.nav.signOut, body: t.nav.signOutBody })}>
          {t.nav.signOut}
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

/** The one date range of the app. Every card and chart reloads when it changes. */
function RangePicker() {
  const { content: t, range, setRange } = useDashboard();
  // The calendar shows the first click of a new range before the second one completes it.
  const [draft, setDraft] = React.useState<PickerRange | undefined>(range);
  const twoMonths = useMediaQuery("(min-width: 768px)");
  const presets = React.useMemo<DateRangePreset[]>(
    () => [
      ...DEFAULT_RANGE_PRESETS.slice(0, 3),
      { label: t.range.last90Days, range: () => lastDays(90) },
      ...DEFAULT_RANGE_PRESETS.slice(3),
      { label: t.range.last12Months, range: () => lastMonths(12) },
    ],
    [t],
  );
  return (
    <DateRangePicker
      aria-label={t.range.label}
      className="w-full @lg:w-64"
      value={draft}
      onSelectRange={(next) => {
        setDraft(next);
        if (next?.from && next.to) setRange({ from: next.from, to: next.to });
      }}
      presets={presets}
      maxDate={new Date()}
      numberOfMonths={twoMonths ? 2 : 1}
    />
  );
}

function PageSkeleton() {
  return (
    <Skeleton className="gap-4">
      <div className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonItem key={i} size={96} />
        ))}
      </div>
      <SkeletonItem className="h-80" />
    </Skeleton>
  );
}

function NotFound() {
  const { content: t } = useDashboard();
  return (
    <div>
      <Button asChild appearance="primary">
        <Link to="overview">{t.notFound.back}</Link>
      </Button>
    </div>
  );
}

/** App shell: sidebar (a Drawer on narrow screens), top bar with search and appearance menu, page header with the date range. */
export function Dashboard({ content: t, appearance, onAppearanceChange, embedded = false }: DashboardProps) {
  const { route, navigate } = useRouter();
  const [range, setRange] = React.useState<DateRange>(() => lastDays(30));
  const [query, setQuery] = React.useState("");
  const [mock, setMock] = React.useState<MockOptions>(DEFAULT_MOCK_OPTIONS);
  const scrollRef = React.useRef<HTMLElement>(null);
  const api = React.useMemo(() => createMockApi(t.mock, mock), [t.mock, mock]);

  const value = React.useMemo<DashboardValue>(
    () => ({
      content: t,
      api,
      range,
      setRange,
      query,
      setQuery,
      mock,
      setMock: (patch) => setMock((m) => ({ ...m, ...patch })),
      appearance,
      setAppearance: onAppearanceChange,
      headingLevel: embedded ? 2 : 1,
    }),
    [t, api, range, query, mock, appearance, onAppearanceChange, embedded],
  );

  const page = route === "notFound" ? null : route;
  const meta = page ? t.pages[page] : t.notFound;

  // New page: back to the top; the tab title and meta description follow the page.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (embedded) return;
    document.title = `${meta.title} · ${t.appName}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  }, [embedded, meta, t.appName]);

  const Main = embedded ? "div" : "main";
  const Heading = embedded ? "h2" : "h1";
  const Page = page ? PAGES[page] : null;

  return (
    <DashboardContext.Provider value={value}>
      <AppShell
        // Embedded: fills the preview, no global shortcut or skip link, sidebar state not saved.
        className={embedded ? "h-full" : undefined}
        persistKey={embedded ? undefined : "dashboard-sidebar"}
        shortcut={embedded ? false : undefined}
        skipLink={!embedded}
      >
        <AppSidebar />

        <AppShellHeader>
          <SidebarTrigger />
          <form
            role="search"
            className="min-w-0 flex-1 @lg:max-w-80"
            onSubmit={(e) => {
              e.preventDefault();
              if (route !== "customers") navigate("customers");
            }}
          >
            <SearchBox aria-label={t.search.label} placeholder={t.search.placeholder} value={query} onValueChange={setQuery} />
          </form>
          <div className="ms-auto flex shrink-0 items-center gap-1">
            <ThemeMenu />
            <UserMenu />
          </div>
        </AppShellHeader>

        <AppShellMain asChild ref={scrollRef} className="@container">
          <Main aria-label={embedded ? t.appName : undefined}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 @3xl:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <Heading className="font-display text-title2 font-semibold">{meta.title}</Heading>
                  <p className="mt-1 text-body1 text-foreground-3">{meta.description}</p>
                </div>
                {page && page !== "settings" && <RangePicker />}
              </div>
              {Page ? (
                <React.Suspense
                  fallback={
                    embedded ? (
                      <PageSkeleton />
                    ) : (
                      <PageProgressFallback>
                        <PageSkeleton />
                      </PageProgressFallback>
                    )
                  }
                >
                  <Page />
                </React.Suspense>
              ) : (
                <NotFound />
              )}
            </div>
          </Main>
        </AppShellMain>
      </AppShell>
    </DashboardContext.Provider>
  );
}
