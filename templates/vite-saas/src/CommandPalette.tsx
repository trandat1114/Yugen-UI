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
  toast,
  type YugenBrand,
  type YugenTheme,
} from "yugen-ui";
import { PAGES, type PageId } from "./pages";

export const THEMES: { value: YugenTheme; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Sáng", icon: <WeatherSunny20Regular /> },
  { value: "dark", label: "Tối", icon: <WeatherMoon20Regular /> },
  { value: "high-contrast", label: "Tương phản cao", icon: <Accessibility20Regular /> },
];

export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: PageId) => void;
  onThemeChange: (theme: YugenTheme) => void;
  onBrandChange: (brand: YugenBrand) => void;
}

/** Bảng lệnh Ctrl/⌘ K: chuyển trang, đổi giao diện, hành động nhanh. */
export function CommandPalette({ open, onOpenChange, onNavigate, onThemeChange, onBrandChange }: CommandPaletteProps) {
  const run = (action: () => void) => () => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Bảng lệnh">
      <CommandInput placeholder="Tìm trang, lệnh…" />
      <CommandList>
        <CommandEmpty>Không có kết quả.</CommandEmpty>
        <CommandGroup heading="Trang">
          {PAGES.map((p) => (
            <CommandItem key={p.id} icon={p.icon} keywords={[p.id]} onSelect={run(() => onNavigate(p.id))}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Hành động">
          <CommandItem icon={<PersonAdd20Regular />} onSelect={run(() => onNavigate("team"))}>
            Mời thành viên
          </CommandItem>
          <CommandItem
            icon={<ArrowDownload20Regular />}
            onSelect={run(() => toast({ intent: "success", title: "Đã xuất báo cáo", body: "Tệp CSV đang được tải xuống." }))}
          >
            Xuất báo cáo
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Giao diện">
          {THEMES.map((t) => (
            <CommandItem key={t.value} icon={t.icon} keywords={["theme", t.value]} onSelect={run(() => onThemeChange(t.value))}>
              Chế độ {t.label.toLowerCase()}
            </CommandItem>
          ))}
          {BRANDS.map((b) => (
            <CommandItem key={b.value} icon={<Color20Regular />} keywords={["brand"]} onSelect={run(() => onBrandChange(b.value))}>
              Thương hiệu {b.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
