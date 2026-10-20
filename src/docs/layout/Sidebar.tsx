import * as React from "react";
import {
  BookOpen16Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
  Dismiss20Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { YugenMark } from "../YugenMark";
import { COMPONENTS_BY_CATEGORY } from "../registry";
import { CONCEPTS_BY_GROUP } from "../concepts";
import { SITE } from "../site";
import { FOUNDATIONS } from "../foundations";
import type { Route } from "../router";
import { AuthorLink } from "../AuthorLink";
import { useLocale } from "../i18n";

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
    <div className="border-b border-stroke-2 py-S">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
        className="flex h-9 w-full items-center gap-S rounded-xlarge px-S text-body1 font-semibold text-foreground-1 hover:bg-subtle-hover"
      >
        <ChevronRight16Regular
          className={cn("shrink-0 transition-transform duration-normal ease-easy-ease", expanded && "rotate-90")}
        />
        <span className="flex-1 text-start">{title}</span>
        {count !== undefined && <span className="text-caption1 font-normal text-foreground-3">{count}</span>}
      </button>
      {expanded && (
        <ul className="mt-XXS flex flex-col gap-XXS">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-S rounded-xlarge ps-9 pe-S text-body1 transition-colors duration-faster",
                  item.active
                    ? "bg-brand-background-2-hover text-brand-foreground-2"
                    : "text-foreground-2 hover:bg-brand-background-2 hover:text-brand-foreground-2",
                )}
              >
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="rounded-circular bg-brand-background px-SNudge text-caption2 font-semibold text-foreground-on-brand">
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

export function Sidebar({ route, open, onClose }: { route: Route; open: boolean; onClose: () => void }) {
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
        className={cn(
          "fixed inset-y-0 inset-s-0 z-50 flex w-80 max-w-[85vw] flex-col border-e border-stroke-2 bg-shell-nav",
          "transition-transform duration-normal ease-decelerate-mid",
          open ? "translate-x-0 shadow-28" : "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <div className="flex h-18.5 shrink-0 items-center gap-S border-b border-stroke-2 px-XL">
          <a href="#/" className="flex items-center gap-S rounded-medium">
            <YugenMark size={28} />
            <span className="text-subtitle2 font-semibold">Yugen UI</span>
          </a>
          <div className="ms-auto flex items-center gap-XS">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-6 items-center gap-XS rounded-medium bg-background-4 ps-S pe-XXS text-caption2 text-foreground-3 hover:bg-background-5"
            >
              {t("sidebar.search")}
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-small border border-stroke-1 bg-background-1 px-XXS font-mono text-[10px] text-foreground-2">
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
          </div>
        </div>

        {searching && (
          <div className="flex animate-fade-in items-center gap-S border-b border-stroke-2 px-XL py-S">
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

        <nav className="min-h-0 flex-1 overflow-y-auto px-XL pb-XL">
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

          <div className="py-S">
            <div className="flex h-9 items-center gap-S rounded-xlarge border border-brand-stroke px-M text-body1 text-brand-foreground-2">
              <BookOpen16Regular className="shrink-0" />
              <span className="flex-1">React · Tailwind</span>
              <ChevronDown16Regular className="shrink-0" />
            </div>
          </div>

          {groups.map((g) => (
            <NavGroup key={g.category} title={category(g.category)} items={g.items} count={g.total} forceOpen={!!q} defaultOpen={false} />
          ))}
          {empty && <p className="px-S py-L text-body1 text-foreground-3">{t("sidebar.noResults", { query })}</p>}

          <div className="px-S pt-L text-caption1 text-foreground-3">
            <p>
              <span className="font-semibold text-foreground-1">Yugen UI</span> · {t("credit.by")}{" "}
              <AuthorLink className="text-brand-foreground-2" />
            </p>
            <p className="mt-XXS">{t("credit.inspired")}</p>
            <p className="mt-XXS">
              {t("credit.rules")} <span className="font-mono text-foreground-2">Design.md</span>
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}
