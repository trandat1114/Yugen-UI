import * as React from "react";
import {
  Accessibility20Regular,
  Keyboard20Regular,
  Navigation20Regular,
  Person20Regular,
  Search20Regular,
  Settings20Regular,
  SignOut20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  CounterBadge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  Kbd,
  KbdGroup,
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
  NotificationCenter,
  Persona,
  ProgressBar,
  SkeletonCard,
  toast,
  useNotifications,
  type NotificationItem,
  type YugenBrand,
  type YugenTheme,
} from "@/components/ui";
import { BRANDS, CommandPalette, THEMES } from "./CommandPalette";
import defaultContent from "./content";
import type { Content } from "./content/types";
import { PAGE_BY_ID, PAGES, type PageId } from "./pages";
import { isPlainClick, pathOf } from "./routes";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export interface AppShellProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /** Chữ và dữ liệu mẫu; mặc định theo ngôn ngữ chọn trong `content/index.ts`. */
  content?: Content;
  /**
   * Nhúng trong một trang khác (ví dụ khung preview): cao theo khối cha thay vì cả màn hình, không có landmark <main>,
   * không bắt phím tắt toàn cục và link không đổi URL.
   */
  embedded?: boolean;
}

function seedNotifications(t: Content, now: number): NotificationItem[] {
  return t.notifications.map(({ minutesAgo, ...n }) => ({ ...n, time: now - minutesAgo * 60_000 }));
}

function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background text-subtitle2 font-semibold text-foreground-on-brand">
      桜
    </span>
  );
}

function SidebarContent({ t, page, onSelect, embedded }: { t: Content; page: PageId; onSelect: (page: PageId) => void; embedded?: boolean }) {
  const item = (p: (typeof PAGES)[number]) => (
    <NavItem
      key={p.id}
      value={p.id}
      icon={p.icon}
      href={embedded ? undefined : pathOf(p.id)}
      // Click thường: đổi trang ngay trong app (không tải lại); Ctrl / ⌘ + click vẫn mở tab mới với đường dẫn thật.
      onClick={(e) => {
        if (embedded || isPlainClick(e)) {
          e.preventDefault();
          onSelect(p.id);
        }
      }}
    >
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate">{t.pages[p.id].label}</span>
        {p.badge ? <CounterBadge count={p.badge} size="small" className="ms-auto" /> : null}
      </span>
    </NavItem>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <Nav selectedValue={page} aria-label={t.shell.nav}>
          <NavSectionHeader>{t.shell.workspace}</NavSectionHeader>
          {PAGES.filter((p) => p.section === "workspace").map(item)}
          <NavSectionHeader>{t.shell.manage}</NavSectionHeader>
          {PAGES.filter((p) => p.section === "manage").map(item)}
        </Nav>
      </div>
      <div className="flex flex-col gap-2 border-t border-stroke-2 p-4">
        <div className="flex items-baseline justify-between text-caption1">
          <span className="font-semibold text-foreground-1">{t.shell.storage}</span>
          <span className="text-foreground-3 tabular-nums">{t.shell.storageUsed}</span>
        </div>
        <ProgressBar value={0.68} aria-label={t.shell.storageLabel} />
        <Button size="small" className="mt-1 self-start" onClick={() => toast({ intent: "info", ...t.shell.upgradeToast })}>
          {t.shell.upgrade}
        </Button>
      </div>
    </div>
  );
}

function ThemeMenu({ t, appearance, onChange }: { t: Content; appearance: Appearance; onChange: (patch: Partial<Appearance>) => void }) {
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label={t.shell.appearance} />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>{t.shell.mode}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => onChange({ theme: v as YugenTheme })}>
          {THEMES.map((theme) => (
            <MenuItemRadio key={theme.value} value={theme.value}>
              {t.themes[theme.value]}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>{t.shell.brand}</MenuGroupHeader>
        <MenuRadioGroup value={appearance.brand} onValueChange={(v) => onChange({ brand: v })}>
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

function UserMenu({ t, onNavigate, onOpenPalette }: { t: Content; onNavigate: (page: PageId) => void; onOpenPalette: () => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        {/* Tên đọc từ nội dung ("Tài khoản: " + nhãn của Avatar) — aria-label riêng sẽ lệch với chữ cái tắt đang hiện. */}
        <button type="button" className="rounded-circular">
          <span className="sr-only">{t.shell.account}</span>
          <Avatar name={t.user.name} size={32} color="brand" />
        </button>
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-60">
        <Persona name={t.user.name} secondaryText={t.user.email} size="medium" avatar={{ color: "brand" }} className="px-2 py-2" />
        <MenuDivider />
        <MenuItem icon={<Person20Regular />} onSelect={() => onNavigate("team")}>
          {t.shell.profile}
        </MenuItem>
        <MenuItem icon={<Settings20Regular />} onSelect={() => onNavigate("settings")}>
          {t.shell.settings}
        </MenuItem>
        <MenuItem icon={<Keyboard20Regular />} secondaryContent="Ctrl K" onSelect={onOpenPalette}>
          {t.shell.palette}
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={<SignOut20Regular />} onSelect={() => toast({ intent: "info", ...t.shell.signOutToast })}>
          {t.shell.signOut}
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

/** Khung ứng dụng: sidebar (Drawer trên màn hẹp), thanh trên cùng, bảng lệnh và nội dung trang. */
export function AppShell({ page, onNavigate, appearance, onAppearanceChange, content: t = defaultContent, embedded = false }: AppShellProps) {
  const [navOpen, setNavOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const notifications = useNotifications(() => seedNotifications(t, Date.now()));
  const current = PAGE_BY_ID[page];
  const text = t.pages[page];
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (embedded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [embedded]);

  // Đổi trang: cuộn nội dung về đầu.
  React.useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [page]);

  const navigate = (next: PageId) => {
    setNavOpen(false);
    onNavigate(next);
  };

  const Content = embedded ? "div" : "main";
  const Heading = embedded ? "h2" : "h1";

  return (
    <div className={`@container flex bg-background-2 text-foreground-1 ${embedded ? "h-full" : "h-dvh"}`}>
      <div className="hidden w-64 shrink-0 flex-col border-e border-stroke-2 bg-background-1 @4xl:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 px-4">
          <Logo />
          <div className="min-w-0">
            <p className="truncate text-body1 font-semibold">{t.appName}</p>
            <p className="truncate text-caption1 text-foreground-3">{t.plan}</p>
          </div>
        </div>
        <SidebarContent t={t} page={page} onSelect={navigate} embedded={embedded} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 bg-background-1 px-4">
          <Button appearance="subtle" icon={<Navigation20Regular />} aria-label={t.shell.openNav} className="@4xl:hidden" onClick={() => setNavOpen(true)} />
          <Breadcrumb
            aria-label={t.shell.breadcrumb}
            className="hidden min-w-0 @xl:flex"
            items={[{ label: t.appName, onClick: () => navigate("overview") }, { label: text.label }]}
          />
          <div className="ms-auto flex items-center gap-1">
            <Button
              appearance="subtle"
              icon={<Search20Regular />}
              aria-label={t.shell.searchLabel}
              className="@2xl:hidden"
              onClick={() => setPaletteOpen(true)}
            />
            <Button
              icon={<Search20Regular />}
              className="hidden w-56 justify-start text-foreground-3 @2xl:inline-flex"
              onClick={() => setPaletteOpen(true)}
            >
              <span className="flex-1 text-start">{t.shell.search}</span>
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
            <ThemeMenu t={t} appearance={appearance} onChange={onAppearanceChange} />
            <NotificationCenter {...notifications.bind} />
            <UserMenu t={t} onNavigate={navigate} onOpenPalette={() => setPaletteOpen(true)} />
          </div>
        </header>

        <Content ref={contentRef} aria-label={embedded ? text.title : undefined} className="@container min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 @3xl:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <Heading className="font-display text-title2 font-semibold">{text.title}</Heading>
                <p className="mt-1 text-body1 text-foreground-3">{text.description}</p>
              </div>
              {current.actions?.(t)}
            </div>
            <React.Suspense
              fallback={
                <div className="grid items-start gap-4 @3xl:grid-cols-2">
                  <SkeletonCard media={false} lines={4} actions={0} />
                  <SkeletonCard media={false} lines={4} actions={0} />
                </div>
              }
            >
              <current.Page t={t} />
            </React.Suspense>
          </div>
        </Content>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen}>
        <DrawerSurface position="start" size="small" aria-describedby={undefined} className="flex flex-col p-0">
          <DrawerHeader className="flex-row items-center gap-2 border-b border-stroke-2 px-4 py-3">
            <Logo />
            <DrawerHeaderTitle>{t.appName}</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody className="min-h-0 flex-1 p-0">
            <SidebarContent t={t} page={page} onSelect={navigate} embedded={embedded} />
          </DrawerBody>
        </DrawerSurface>
      </Drawer>

      <CommandPalette
        t={t}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={navigate}
        onThemeChange={(theme) => onAppearanceChange({ theme })}
        onBrandChange={(brand) => onAppearanceChange({ brand })}
      />
    </div>
  );
}
