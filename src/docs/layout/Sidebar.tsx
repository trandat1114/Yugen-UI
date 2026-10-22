import * as React from "react";
import { flushSync } from "react-dom";
import { useDirection } from "@radix-ui/react-direction";
import {
  Accessibility20Regular,
  Apps20Regular,
  ArrowSwap20Regular,
  Beaker20Regular,
  BookOpen16Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
  Code20Regular,
  Color20Regular,
  Dismiss20Regular,
  PanelLeftContract20Regular,
  PanelLeftExpand20Regular,
  Rocket20Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import { Popover, PopoverSurface, PopoverTrigger, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { useMediaQuery } from "@/components/ui/Sheet/useMediaQuery";
import { cn } from "@/lib/cn";
import { YugenMark } from "../YugenMark";
import { COMPONENTS_BY_CATEGORY } from "../registry";
import { CONCEPTS_BY_GROUP } from "../concepts";
import { SITE } from "../site";
import { FOUNDATIONS } from "../foundations";
import type { Route } from "../router";
import { AuthorLink } from "../AuthorLink";
import { useLocale } from "../i18n";
import { VersionMenu } from "./VersionMenu";
import { SIDEBAR_DEFAULT, SIDEBAR_MAX, SIDEBAR_MIN, SIDEBAR_STEP, setSidebarLayout, useSidebarLayout } from "./sidebarLayout";

const SIDEBAR_ID = "docs-sidebar";

/** Nút thu gọn và nút mở rộng nằm ở hai bố cục khác nhau: sau khi đổi, focus sang nút của bố cục mới thay vì rơi về body. */
function setCollapsed(collapsed: boolean) {
  // flushSync: đổi bố cục và focus ngay trong sự kiện; requestAnimationFrame có thể chạy sau thao tác kế tiếp và cướp focus.
  flushSync(() => setSidebarLayout({ collapsed }));
  document.querySelector<HTMLElement>(`#${SIDEBAR_ID} [data-sidebar-toggle]`)?.focus();
}

const RAIL_ICON: Record<string, React.ReactNode> = {
  "Nhà phát triển": <Code20Regular />,
  "Khả năng tiếp cận": <Accessibility20Regular />,
  "Yugen Labs": <Beaker20Regular />,
  "Chuyển đổi": <ArrowSwap20Regular />,
};

interface NavItem {
  label: string;
  href: string;
  active: boolean;
  badge?: string;
}

function NavGroup({
  title,
  items,
  forceOpen,
  defaultOpen = true,
  count,
}: {
  title: string;
  items: NavItem[];
  forceOpen: boolean;
  defaultOpen?: boolean;
  count?: number;
}) {
  const hasActive = items.some((i) => i.active);
  const [open, setOpen] = React.useState(defaultOpen || hasActive);
  const expanded = forceOpen || open;

  React.useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-stroke-2 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
        className="flex h-9 w-full items-center gap-2 rounded-xlarge px-2 text-body1 font-semibold text-foreground-1 hover:bg-subtle-hover"
      >
        <ChevronRight16Regular
          className={cn("shrink-0 transition-transform duration-normal ease-easy-ease", expanded && "rotate-90")}
        />
        <span className="flex-1 text-start">{title}</span>
        {count !== undefined && <span className="text-caption1 font-normal text-foreground-3">{count}</span>}
      </button>
      {expanded && (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-xlarge ps-9 pe-2 text-body1 transition-colors duration-faster",
                  item.active
                    ? "bg-brand-background-2-hover text-brand-foreground-2"
                    : "text-foreground-2 hover:bg-brand-background-2 hover:text-brand-foreground-2",
                )}
              >
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="rounded-circular bg-brand-background px-1.5 text-caption2 font-semibold text-foreground-on-brand">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Thanh chia ở mép sidebar (từ lg): kéo đổi độ rộng, mũi tên ±16px, Home / End về giới hạn, Enter thu về rail, nhấp đúp
 * về mặc định. Không dùng ResizablePanelGroup: nhóm panel bắt nội dung cuộn trong panel, còn docs cuộn cả trang (mục
 * lục, thanh trên dính, khôi phục vị trí cuộn). Bàn phím theo cùng mẫu với ResizableHandle (WAI-ARIA Window Splitter).
 */
function SidebarResizer({ width }: { width: number }) {
  const { t } = useLocale();
  const dir = useDirection();

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const root = document.documentElement;
    handle.setPointerCapture(event.pointerId);
    root.setAttribute("data-docs-resizing", "");
    // Theo độ dịch của con trỏ (không theo vị trí tuyệt đối): chỗ nắm trên thanh chia không làm độ rộng nhảy.
    const move = (e: PointerEvent) =>
      setSidebarLayout({ width: width + (dir === "rtl" ? startX - e.clientX : e.clientX - startX) }, { persist: false });
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      root.removeAttribute("data-docs-resizing");
      setSidebarLayout({});
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const grow = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const shrink = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const next: Record<string, number> = {
      [grow]: width + SIDEBAR_STEP,
      [shrink]: width - SIDEBAR_STEP,
      Home: SIDEBAR_MIN,
      End: SIDEBAR_MAX,
    };
    if (event.key === "Enter") {
      event.preventDefault();
      setCollapsed(true);
    } else if (event.key in next) {
      event.preventDefault();
      setSidebarLayout({ width: next[event.key] });
    }
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={t("sidebar.resize")}
      aria-controls={SIDEBAR_ID}
      aria-valuenow={width}
      aria-valuemin={SIDEBAR_MIN}
      aria-valuemax={SIDEBAR_MAX}
      aria-valuetext={`${width}px`}
      aria-keyshortcuts="Enter"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setSidebarLayout({ width: SIDEBAR_DEFAULT })}
      className="group/resize absolute inset-y-0 -inset-e-1 z-10 hidden w-2 cursor-col-resize touch-none justify-center lg:flex"
    >
      <span
        className={cn(
          "h-full w-0.5 transition-colors duration-faster ease-easy-ease",
          "group-hover/resize:bg-brand-stroke group-focus-visible/resize:bg-brand-stroke in-data-docs-resizing:bg-brand-stroke",
        )}
      />
    </div>
  );
}

function CollapseToggle({ collapsed }: { collapsed: boolean }) {
  const { t } = useLocale();
  const Icon = collapsed ? PanelLeftExpand20Regular : PanelLeftContract20Regular;
  return (
    <button
      type="button"
      data-sidebar-toggle=""
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
      aria-expanded={!collapsed}
      aria-controls={SIDEBAR_ID}
      className="hidden size-8 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover lg:inline-flex"
    >
      <Icon className="rtl:-scale-x-100" />
    </button>
  );
}

interface RailSection {
  title?: string;
  items: NavItem[];
}

const railItemClass = (active: boolean) =>
  cn(
    "transition-colors duration-faster",
    active ? "bg-brand-background-2-hover text-brand-foreground-2" : "text-foreground-2 hover:bg-brand-background-2 hover:text-brand-foreground-2",
  );

/** Một icon của rail: tooltip mang tên nhóm; nhấp / Enter mở flyout liệt kê các trang của nhóm. */
function RailGroup({ label, icon, sections }: { label: string; icon: React.ReactNode; sections: RailSection[] }) {
  const [open, setOpen] = React.useState(false);
  const side = useDirection() === "rtl" ? "left" : "right";
  const active = sections.some((s) => s.items.some((i) => i.active));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={label}
              className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge", railItemClass(active))}
            >
              {icon}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side={side}>{label}</TooltipContent>
      </Tooltip>
      <PopoverSurface side={side} align="start" size="small" aria-label={label} className="max-h-[min(70vh,36rem)] w-64 overflow-y-auto">
        <p className="px-2 pt-1 pb-2 text-caption1 font-semibold text-foreground-3">{label}</p>
        {sections.map((section, i) => (
          <div key={section.title ?? i} className={cn(i > 0 && "mt-2 border-t border-stroke-3 pt-2")}>
            {section.title && <p className="px-2 pb-1 text-caption2 font-semibold text-foreground-3">{section.title}</p>}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn("flex h-8 items-center rounded-medium px-2 text-body1", railItemClass(item.active))}
                  >
                    <span className="truncate">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </PopoverSurface>
    </Popover>
  );
}

export function Sidebar({
  route,
  open,
  onClose,
  onOpenPalette,
}: {
  route: Route;
  open: boolean;
  onClose: () => void;
  onOpenPalette: () => void;
}) {
  const layout = useSidebarLayout();
  // Dưới lg sidebar là drawer: luôn hiện đầy đủ, kể cả khi đã thu về rail trên màn lớn.
  const rail = useMediaQuery("(min-width: 64rem)") && layout.collapsed;
  const railSide = useDirection() === "rtl" ? "left" : "right";
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { t, category, group: groupLabel, foundation, component, concept } = useLocale();

  const openSearch = React.useCallback(() => {
    setSearching(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const q = query.trim().toLowerCase();
  const match = (label: string) => !q || label.toLowerCase().includes(q);

  const conceptItems = (group: string): NavItem[] =>
    (CONCEPTS_BY_GROUP.find((g) => g.group === group)?.items ?? [])
      .map((c) => ({ c, title: concept(c.meta).title }))
      .filter(({ title }) => match(title))
      .map(({ c, title }) => ({
        label: title,
        href: `#/concepts/${c.meta.slug}`,
        active: route.kind === "concept" && route.slug === c.meta.slug,
      }));

  const start: NavItem[] = [
    { label: t("nav.overview"), href: "#/", active: route.kind === "home" },
    ...conceptItems("Bắt đầu"),
    { label: "Templates", href: "#/templates", active: route.kind === "templates" },
    { label: "Blocks", href: "#/blocks", active: route.kind === "blocks" },
    { label: "Theme Designer", href: "#/theme-designer", active: route.kind === "theme-designer" },
    { label: t("nav.news"), href: "#/news", active: route.kind === "news", badge: `v${SITE.version}` },
    { label: t("nav.community"), href: "#/community", active: route.kind === "community" },
  ].filter((i) => match(i.label));
  const conceptGroups = (["Nhà phát triển", "Khả năng tiếp cận", "Yugen Labs", "Chuyển đổi"] as const).map((group) => ({
    group,
    items: conceptItems(group),
  }));
  const foundations: NavItem[] = FOUNDATIONS.map((f) => ({
    label: foundation(f),
    href: `#/foundations/${f.slug}`,
    active: route.kind === "foundation" && route.slug === f.slug,
  })).filter((i) => match(i.label));
  const groups = COMPONENTS_BY_CATEGORY.map((g) => ({
    category: g.category,
    total: g.items.length,
    items: g.items
      .map((c) => ({ slug: c.slug, name: component(c).name }))
      .filter((c) => match(c.name))
      .map((c) => ({
        label: c.name,
        href: `#/components/${c.slug}`,
        active: route.kind === "component" && route.slug === c.slug,
      })),
  }));
  const empty =
    start.length +
      foundations.length +
      groups.reduce((n, g) => n + g.items.length, 0) +
      conceptGroups.reduce((n, g) => n + g.items.length, 0) ===
    0;

  const closeSearch = () => {
    setQuery("");
    setSearching(false);
  };

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn("fixed inset-0 z-40 bg-overlay lg:hidden", open ? "animate-fade-in" : "hidden")}
      />
      <aside
        id={SIDEBAR_ID}
        className={cn(
          "fixed inset-y-0 inset-s-0 z-50 flex w-80 max-w-[85vw] flex-col border-e border-stroke-2 bg-shell-nav",
          "lg:w-(--docs-sidebar-width) lg:max-w-none",
          "transition-[translate,width] duration-normal ease-decelerate-mid in-data-docs-resizing:transition-none motion-reduce:transition-none",
          open ? "translate-x-0 shadow-28" : "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        {rail ? (
          <>
            <div className="flex h-18.5 shrink-0 items-center justify-center border-b border-stroke-2">
              <a href="#/" aria-label="Yugen UI" className="rounded-medium">
                <YugenMark size={28} />
              </a>
            </div>
            <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("sidebar.search")}
                    aria-keyshortcuts="Control+K"
                    onClick={onOpenPalette}
                    className="mb-1 inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge text-foreground-2 hover:bg-subtle-hover"
                  >
                    <Search20Regular />
                  </button>
                </TooltipTrigger>
                <TooltipContent side={railSide}>{t("sidebar.search")}</TooltipContent>
              </Tooltip>
              <RailGroup label={groupLabel("Bắt đầu")} icon={<Rocket20Regular />} sections={[{ items: start }]} />
              {conceptGroups.map((g) => (
                <RailGroup
                  key={g.group}
                  label={g.group === "Yugen Labs" ? t("nav.labsConcepts") : groupLabel(g.group)}
                  icon={RAIL_ICON[g.group]}
                  sections={[{ items: g.items }]}
                />
              ))}
              <RailGroup label={t("nav.foundations")} icon={<Color20Regular />} sections={[{ items: foundations }]} />
              <RailGroup
                label={t("nav.components")}
                icon={<Apps20Regular />}
                sections={groups.map((g) => ({ title: category(g.category), items: g.items }))}
              />
            </nav>
            <div className="flex shrink-0 justify-center border-t border-stroke-2 py-2">
              <CollapseToggle collapsed />
            </div>
          </>
        ) : (
          <>
            <div className="flex h-18.5 shrink-0 items-center gap-2 border-b border-stroke-2 px-5">
              <a href="#/" className="flex items-center gap-2 rounded-medium">
                <YugenMark size={28} />
                <span className="text-subtitle2 font-semibold">Yugen UI</span>
              </a>
              <div className="ms-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={openSearch}
                  className="inline-flex h-6 items-center gap-1 rounded-medium bg-background-4 ps-2 pe-0.5 text-caption2 text-foreground-3 hover:bg-background-5"
                >
                  {t("sidebar.search")}
                  <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-small border border-stroke-1 bg-background-1 px-0.5 font-mono text-[10px] text-foreground-2">
                    /
                  </kbd>
                </button>
                <button
                  type="button"
                  aria-label={t("sidebar.search")}
                  onClick={openSearch}
                  className="inline-flex size-8 items-center justify-center rounded-medium text-foreground-1 hover:bg-subtle-hover"
                >
                  <Search20Regular />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("sidebar.close")}
                  className="inline-flex size-8 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover lg:hidden"
                >
                  <Dismiss20Regular />
                </button>
                <CollapseToggle collapsed={false} />
              </div>
            </div>

            {searching && (
              <div className="flex animate-fade-in items-center gap-2 border-b border-stroke-2 px-5 py-2">
                <Search20Regular className="shrink-0 text-foreground-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  placeholder={t("sidebar.placeholder")}
                  aria-label={t("sidebar.search")}
                  className="h-8 min-w-0 flex-1 bg-transparent text-body1 outline-none placeholder:text-foreground-4"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label={t("sidebar.closeSearch")}
                  className="inline-flex size-6 items-center justify-center rounded-medium text-foreground-3 hover:bg-subtle-hover"
                >
                  <Dismiss20Regular className="size-4" />
                </button>
              </div>
            )}

            <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <NavGroup title={groupLabel("Bắt đầu")} items={start} forceOpen={!!q} />
              {conceptGroups.map((g) => (
                <NavGroup
                  key={g.group}
                  // Nhóm khái niệm Labs trùng tên nhóm component "Yugen Labs" bên dưới → đặt tên riêng cho dễ phân biệt.
                  title={g.group === "Yugen Labs" ? t("nav.labsConcepts") : groupLabel(g.group)}
                  items={g.items}
                  forceOpen={!!q}
                  defaultOpen={false}
                />
              ))}
              <NavGroup title={t("nav.foundations")} items={foundations} forceOpen={!!q} defaultOpen={false} />

              <div className="py-2">
                <div className="flex h-9 items-center gap-2 rounded-xlarge border border-brand-stroke px-3 text-body1 text-brand-foreground-2">
                  <BookOpen16Regular className="shrink-0" />
                  <span className="flex-1">React · Tailwind</span>
                  <ChevronDown16Regular className="shrink-0" />
                </div>
              </div>

              {groups.map((g) => (
                <NavGroup key={g.category} title={category(g.category)} items={g.items} count={g.total} forceOpen={!!q} defaultOpen={false} />
              ))}
              {empty && <p className="px-2 py-4 text-body1 text-foreground-3">{t("sidebar.noResults", { query })}</p>}

              <div className="px-2 pt-4 text-caption1 text-foreground-3">
                <p>
                  <span className="font-semibold text-foreground-1">Yugen UI</span> · {t("credit.by")}{" "}
                  <AuthorLink className="text-brand-foreground-2" />
                </p>
                <p className="mt-0.5">
                  {t("credit.rules")} <span className="font-mono text-foreground-2">Design.md</span>
                </p>
                {/* Thanh trên chỉ có menu phiên bản từ lg — màn nhỏ đặt ở đây. */}
                <div className="mt-2 -ms-2 lg:hidden">
                  <VersionMenu />
                </div>
              </div>
            </nav>
            <SidebarResizer width={layout.width} />
          </>
        )}
      </aside>
    </>
  );
}
