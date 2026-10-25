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
import { PAGE_BY_ID, PAGES, isPageId, type PageId } from "./pages";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export interface AppShellProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
  /**
   * Nhúng trong một trang khác (ví dụ khung preview): cao theo khối cha thay vì cả màn hình, không có landmark <main>,
   * không bắt phím tắt toàn cục và link không đổi URL.
   */
  embedded?: boolean;
}

const USER = { name: "Trần Đạt", email: "dat@sakura.studio" };

function seedNotifications(now: number): NotificationItem[] {
  return [
    { id: "1", title: "Trần Lan đã nhắc bạn", body: "Xem giúp số liệu tháng 10 trước buổi họp nhé.", author: "Trần Lan", time: now - 5 * 60_000 },
    { id: "2", title: "Đơn #1042 đã thanh toán", body: "2.450.000 ₫ qua chuyển khoản.", intent: "success", time: now - 2 * 3_600_000 },
    { id: "3", title: "Dung lượng sắp đầy", body: "Đã dùng 68% bộ nhớ của nhóm.", intent: "warning", time: now - 26 * 3_600_000, read: true },
  ];
}

function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background text-subtitle2 font-semibold text-foreground-on-brand">
      桜
    </span>
  );
}

function SidebarContent({ page, onSelect, embedded }: { page: PageId; onSelect: (page: PageId) => void; embedded?: boolean }) {
  const item = (p: (typeof PAGES)[number]) => (
    <NavItem key={p.id} value={p.id} icon={p.icon} href={embedded ? undefined : `#/${p.id}`}>
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate">{p.label}</span>
        {p.badge ? <CounterBadge count={p.badge} size="small" className="ms-auto" /> : null}
      </span>
    </NavItem>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <Nav selectedValue={page} onNavItemSelect={(v) => isPageId(v) && onSelect(v)} aria-label="Điều hướng chính">
          <NavSectionHeader>Không gian làm việc</NavSectionHeader>
          {PAGES.filter((p) => p.section === "workspace").map(item)}
          <NavSectionHeader>Quản lý</NavSectionHeader>
          {PAGES.filter((p) => p.section === "manage").map(item)}
        </Nav>
      </div>
      <div className="flex flex-col gap-2 border-t border-stroke-2 p-4">
        <div className="flex items-baseline justify-between text-caption1">
          <span className="font-semibold text-foreground-1">Dung lượng</span>
          <span className="text-foreground-3 tabular-nums">6,8 / 10 GB</span>
        </div>
        <ProgressBar value={0.68} aria-label="Dung lượng đã dùng" />
        <Button
          size="small"
          className="mt-1 self-start"
          onClick={() => toast({ intent: "info", title: "Nâng cấp gói", body: "Nối nút này với trang thanh toán của bạn." })}
        >
          Nâng cấp lên Business
        </Button>
      </div>
    </div>
  );
}

function ThemeMenu({ appearance, onChange }: { appearance: Appearance; onChange: (patch: Partial<Appearance>) => void }) {
  const icon =
    appearance.theme === "dark" ? <WeatherMoon20Regular /> : appearance.theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label="Giao diện" />
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-52">
        <MenuGroupHeader>Chế độ</MenuGroupHeader>
        <MenuRadioGroup value={appearance.theme} onValueChange={(v) => onChange({ theme: v as YugenTheme })}>
          {THEMES.map((t) => (
            <MenuItemRadio key={t.value} value={t.value}>
              {t.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
        <MenuDivider />
        <MenuGroupHeader>Thương hiệu</MenuGroupHeader>
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

function UserMenu({ onNavigate, onOpenPalette }: { onNavigate: (page: PageId) => void; onOpenPalette: () => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        {/* Tên đọc từ nội dung ("Tài khoản: " + nhãn của Avatar) — aria-label riêng sẽ lệch với chữ cái tắt đang hiện. */}
        <button type="button" className="rounded-circular">
          <span className="sr-only">Tài khoản: </span>
          <Avatar name={USER.name} size={32} color="brand" />
        </button>
      </MenuTrigger>
      <MenuPopover align="end" className="min-w-60">
        <Persona name={USER.name} secondaryText={USER.email} size="medium" avatar={{ color: "brand" }} className="px-2 py-2" />
        <MenuDivider />
        <MenuItem icon={<Person20Regular />} onSelect={() => onNavigate("team")}>
          Hồ sơ & đội ngũ
        </MenuItem>
        <MenuItem icon={<Settings20Regular />} onSelect={() => onNavigate("settings")}>
          Cài đặt
        </MenuItem>
        <MenuItem icon={<Keyboard20Regular />} secondaryContent="Ctrl K" onSelect={onOpenPalette}>
          Bảng lệnh
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={<SignOut20Regular />}
          onSelect={() => toast({ intent: "info", title: "Đăng xuất", body: "Nối mục này với hệ thống đăng nhập của bạn." })}
        >
          Đăng xuất
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}

/** Khung ứng dụng: sidebar (Drawer trên màn hẹp), thanh trên cùng, bảng lệnh và nội dung trang. */
export function AppShell({ page, onNavigate, appearance, onAppearanceChange, embedded = false }: AppShellProps) {
  const [navOpen, setNavOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const notifications = useNotifications(() => seedNotifications(Date.now()));
  const current = PAGE_BY_ID[page];
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
            <p className="truncate text-body1 font-semibold">Sakura Studio</p>
            <p className="truncate text-caption1 text-foreground-3">Gói Pro</p>
          </div>
        </div>
        <SidebarContent page={page} onSelect={navigate} embedded={embedded} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 bg-background-1 px-4">
          <Button appearance="subtle" icon={<Navigation20Regular />} aria-label="Mở điều hướng" className="@4xl:hidden" onClick={() => setNavOpen(true)} />
          <Breadcrumb
            aria-label="Vị trí"
            className="hidden min-w-0 @xl:flex"
            items={[{ label: "Sakura Studio", onClick: () => navigate("overview") }, { label: current.label }]}
          />
          <div className="ms-auto flex items-center gap-1">
            <Button
              appearance="subtle"
              icon={<Search20Regular />}
              aria-label="Tìm kiếm (Ctrl K)"
              className="@2xl:hidden"
              onClick={() => setPaletteOpen(true)}
            />
            <Button
              icon={<Search20Regular />}
              className="hidden w-56 justify-start text-foreground-3 @2xl:inline-flex"
              onClick={() => setPaletteOpen(true)}
            >
              <span className="flex-1 text-start">Tìm kiếm…</span>
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
            <ThemeMenu appearance={appearance} onChange={onAppearanceChange} />
            <NotificationCenter {...notifications.bind} />
            <UserMenu onNavigate={navigate} onOpenPalette={() => setPaletteOpen(true)} />
          </div>
        </header>

        <Content ref={contentRef} aria-label={embedded ? current.title : undefined} className="@container min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 @3xl:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <Heading className="font-display text-title2 font-semibold">{current.title}</Heading>
                <p className="mt-1 text-body1 text-foreground-3">{current.description}</p>
              </div>
              {current.actions}
            </div>
            <React.Suspense
              fallback={
                <div className="grid items-start gap-4 @3xl:grid-cols-2">
                  <SkeletonCard media={false} lines={4} actions={0} />
                  <SkeletonCard media={false} lines={4} actions={0} />
                </div>
              }
            >
              {current.content}
            </React.Suspense>
          </div>
        </Content>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen}>
        <DrawerSurface position="start" size="small" aria-describedby={undefined} className="flex flex-col p-0">
          <DrawerHeader className="flex-row items-center gap-2 border-b border-stroke-2 px-4 py-3">
            <Logo />
            <DrawerHeaderTitle>Sakura Studio</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody className="min-h-0 flex-1 p-0">
            <SidebarContent page={page} onSelect={navigate} embedded={embedded} />
          </DrawerBody>
        </DrawerSurface>
      </Drawer>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={navigate}
        onThemeChange={(theme) => onAppearanceChange({ theme })}
        onBrandChange={(brand) => onAppearanceChange({ brand })}
      />
    </div>
  );
}
