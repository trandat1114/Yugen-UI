import {
  ChevronDown16Regular,
  Navigation20Regular,
  TextDirectionHorizontalLeft20Regular,
  TextDirectionHorizontalRight20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
  Accessibility20Regular,
  Megaphone20Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import {
  Button,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  SimpleTooltip,
  Kbd,
  KbdGroup,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Appearance } from "@/hooks/useAppearance";
import { YugenMark } from "../YugenMark";
import { useHasUnseenNews } from "../useNews";

const THEME_OPTIONS = [
  { group: "Yugen (Sakura)", items: [{ value: "sakura:light", label: "Yugen Light" }, { value: "sakura:dark", label: "Yugen Dark" }] },
  { group: "Web (Fluent Blue)", items: [{ value: "web:light", label: "Web Light" }, { value: "web:dark", label: "Web Dark" }] },
  { group: "Teams", items: [{ value: "teams:light", label: "Teams Light" }, { value: "teams:dark", label: "Teams Dark" }] },
] as const;

function themeLabel(a: Appearance) {
  if (a.theme === "high-contrast") return "Tương phản cao";
  const brand = a.brand === "sakura" ? "Yugen" : a.brand === "web" ? "Web" : "Teams";
  return `${brand} ${a.theme === "dark" ? "Dark" : "Light"}`;
}

export function TopBar({
  appearance,
  onChange,
  onOpenNav,
  onOpenPalette,
}: {
  appearance: Appearance;
  onChange: (patch: Partial<Appearance>) => void;
  onOpenNav: () => void;
  onOpenPalette: () => void;
}) {
  const value = appearance.theme === "high-contrast" ? "high-contrast" : `${appearance.brand}:${appearance.theme}`;
  const isDark = appearance.theme !== "light";
  const hasUnseen = useHasUnseenNews();

  return (
    <header className="sticky top-0 z-30 flex h-18.5 items-center gap-M bg-shell/85 px-L backdrop-blur-md md:px-12">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Mở menu"
        className="inline-flex size-8 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover lg:hidden"
      >
        <Navigation20Regular />
      </button>
      <a href="#/" className="flex items-center gap-S lg:hidden">
        <YugenMark size={24} />
        <span className="text-subtitle2 font-semibold">Yugen UI</span>
      </a>

      <button
        type="button"
        onClick={onOpenPalette}
        className="ms-auto inline-flex h-8 min-w-0 items-center gap-S rounded-medium border border-stroke-2 bg-background-1 ps-S pe-XS text-body1 text-foreground-3 transition-colors duration-faster hover:border-stroke-1-hover hover:text-foreground-1 lg:ms-0 lg:w-72"
      >
        <Search20Regular className="shrink-0" />
        <span className="hidden flex-1 truncate text-start sm:inline">Tìm nhanh…</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <div className="ms-auto flex items-center gap-S">
        <Button asChild appearance="subtle" className="relative hidden gap-XS px-S font-normal md:inline-flex">
          <a href="#/news">
            <Megaphone20Regular />
            Có gì mới
            {hasUnseen && (
              <span className="absolute top-1 inset-e-1 size-2 rounded-circular bg-brand-background ring-2 ring-shell">
                <span className="sr-only">Có cập nhật chưa xem</span>
              </span>
            )}
          </a>
        </Button>
        <SimpleTooltip content={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}>
          <Button
            appearance="subtle"
            aria-label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}
            icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
            onClick={() => onChange({ theme: isDark ? "light" : "dark" })}
          />
        </SimpleTooltip>

        <Menu>
          <MenuTrigger asChild>
            <Button appearance="subtle" className="gap-XS px-S font-normal">
              <span className="hidden text-foreground-3 sm:inline">Theme:</span>
              <span className="font-semibold">{themeLabel(appearance)}</span>
              <ChevronDown16Regular className="text-foreground-3" />
            </Button>
          </MenuTrigger>
          <MenuPopover align="end" className="min-w-56">
            <MenuRadioGroup
              value={value}
              onValueChange={(v) => {
                if (v === "high-contrast") return onChange({ theme: "high-contrast" });
                const [brand, theme] = v.split(":") as [Appearance["brand"], "light" | "dark"];
                onChange({ brand, theme });
              }}
            >
              {THEME_OPTIONS.map((g, i) => (
                <div key={g.group}>
                  {i > 0 && <MenuDivider />}
                  <MenuGroupHeader>{g.group}</MenuGroupHeader>
                  {g.items.map((item) => (
                    <MenuItemRadio
                      key={item.value}
                      value={item.value}
                      icon={<span data-brand={item.value.split(":")[0]} className="size-3 shrink-0 rounded-circular bg-brand-background" />}
                    >
                      {item.label}
                    </MenuItemRadio>
                  ))}
                </div>
              ))}
              <MenuDivider />
              <MenuItemRadio value="high-contrast" icon={<Accessibility20Regular />}>
                Tương phản cao
              </MenuItemRadio>
            </MenuRadioGroup>
          </MenuPopover>
        </Menu>

        <div role="radiogroup" aria-label="Hướng chữ" className="hidden items-center rounded-medium bg-background-4 p-XXS sm:inline-flex">
          {(["ltr", "rtl"] as const).map((d) => (
            <SimpleTooltip key={d} content={d === "ltr" ? "Trái sang phải (LTR)" : "Phải sang trái (RTL)"}>
              <button
                type="button"
                role="radio"
                aria-checked={appearance.dir === d}
                onClick={() => onChange({ dir: d })}
                className={cn(
                  "inline-flex h-7 items-center gap-XS rounded-small px-S text-caption1 font-semibold transition-colors duration-faster",
                  appearance.dir === d ? "bg-background-1 text-foreground-1 shadow-2" : "text-foreground-3 hover:text-foreground-1",
                )}
              >
                {d === "ltr" ? <TextDirectionHorizontalLeft20Regular className="size-4" /> : <TextDirectionHorizontalRight20Regular className="size-4" />}
                {d.toUpperCase()}
              </button>
            </SimpleTooltip>
          ))}
        </div>
      </div>
    </header>
  );
}
