import type { ReactNode } from "react";
import {
  Accessibility20Regular,
  ArrowDownload20Regular,
  Color20Regular,
  PersonAdd20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  type YugenBrand,
  type YugenTheme,
} from "yugen-ui";
import type { Content } from "./content/types";
import { exportReport, PAGES, type PageId } from "./pages";

/** Nhãn lấy từ `t.themes`. */
export const THEMES: { value: YugenTheme; icon: ReactNode }[] = [
  { value: "light", icon: <WeatherSunny20Regular /> },
  { value: "dark", icon: <WeatherMoon20Regular /> },
  { value: "high-contrast", icon: <Accessibility20Regular /> },
];

export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

export interface CommandPaletteProps {
  t: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: PageId) => void;
  onThemeChange: (theme: YugenTheme) => void;
  onBrandChange: (brand: YugenBrand) => void;
}

/** Bảng lệnh Ctrl/⌘ K: chuyển trang, đổi giao diện, hành động nhanh. */
export function CommandPalette({ t, open, onOpenChange, onNavigate, onThemeChange, onBrandChange }: CommandPaletteProps) {
  const run = (action: () => void) => () => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t.palette.title}>
      <CommandInput placeholder={t.palette.placeholder} />
      <CommandList>
        <CommandEmpty>{t.palette.empty}</CommandEmpty>
        <CommandGroup heading={t.palette.pages}>
          {PAGES.map((p) => (
            <CommandItem key={p.id} icon={p.icon} keywords={[p.id]} onSelect={run(() => onNavigate(p.id))}>
              {t.pages[p.id].label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.palette.actions}>
          <CommandItem icon={<PersonAdd20Regular />} onSelect={run(() => onNavigate("team"))}>
            {t.palette.invite}
          </CommandItem>
          <CommandItem icon={<ArrowDownload20Regular />} onSelect={run(() => exportReport(t))}>
            {t.exportReport.label}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.palette.appearance}>
          {THEMES.map((theme) => (
            <CommandItem key={theme.value} icon={theme.icon} keywords={["theme", theme.value]} onSelect={run(() => onThemeChange(theme.value))}>
              {t.palette.mode(t.themes[theme.value])}
            </CommandItem>
          ))}
          {BRANDS.map((b) => (
            <CommandItem key={b.value} icon={<Color20Regular />} keywords={["brand"]} onSelect={run(() => onBrandChange(b.value))}>
              {t.palette.brand(b.label)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
