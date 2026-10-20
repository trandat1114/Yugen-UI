import * as React from "react";
import {
  Accessibility20Regular,
  ArrowSwap20Regular,
  Book20Regular,
  Color20Regular,
  Document20Regular,
  Home20Regular,
  Megaphone20Regular,
  People20Regular,
  PuzzlePiece20Regular,
  WeatherMoon20Regular,
  Grid20Regular,
  PaintBrush20Regular,
} from "@fluentui/react-icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui";
import type { Appearance } from "@/hooks/useAppearance";
import { CONCEPTS } from "../concepts";
import { FOUNDATIONS } from "../foundations";
import { COMPONENTS_BY_CATEGORY } from "../registry";

/** Bảng lệnh của trang docs: Ctrl/⌘ + K để nhảy tới mọi trang hoặc đổi giao diện. */
export function DocsCommandPalette({
  open,
  onOpenChange,
  appearance,
  onAppearanceChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appearance: Appearance;
  onAppearanceChange: (patch: Partial<Appearance>) => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    window.location.hash = href.replace(/^#/, "");
  };
  const act = (patch: Partial<Appearance>) => {
    onOpenChange(false);
    onAppearanceChange(patch);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Tìm nhanh trong Yugen UI">
      <CommandInput placeholder="Tìm trang, component, khái niệm hoặc lệnh…" />
      <CommandList className="max-h-[min(60vh,440px)]">
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

        <CommandGroup heading="Trang">
          <CommandItem icon={<Home20Regular />} onSelect={() => go("#/")}>
            Tổng quan
          </CommandItem>
          <CommandItem icon={<Grid20Regular />} onSelect={() => go("#/blocks")}>
            Blocks
          </CommandItem>
          <CommandItem icon={<PaintBrush20Regular />} onSelect={() => go("#/theme-designer")}>
            Theme Designer
          </CommandItem>
          <CommandItem icon={<Megaphone20Regular />} onSelect={() => go("#/news")} keywords={["changelog", "news", "cập nhật"]}>
            Có gì mới
          </CommandItem>
          <CommandItem icon={<People20Regular />} onSelect={() => go("#/community")} keywords={["community", "đóng góp"]}>
            Cộng đồng
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Giao diện">
          <CommandItem icon={<WeatherMoon20Regular />} onSelect={() => act({ theme: appearance.theme === "dark" ? "light" : "dark" })}>
            {appearance.theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
          </CommandItem>
          <CommandItem icon={<Accessibility20Regular />} onSelect={() => act({ theme: appearance.theme === "high-contrast" ? "light" : "high-contrast" })}>
            {appearance.theme === "high-contrast" ? "Tắt tương phản cao" : "Bật tương phản cao"}
          </CommandItem>
          <CommandItem icon={<ArrowSwap20Regular />} onSelect={() => act({ dir: appearance.dir === "rtl" ? "ltr" : "rtl" })}>
            {appearance.dir === "rtl" ? "Chuyển sang LTR" : "Chuyển sang RTL"}
          </CommandItem>
          {(["sakura", "web", "teams"] as const)
            .filter((b) => b !== appearance.brand)
            .map((b) => (
              <CommandItem key={b} icon={<Color20Regular />} onSelect={() => act({ brand: b })} keywords={["brand", "màu"]}>
                Brand: {b === "sakura" ? "Sakura" : b === "web" ? "Fluent Blue" : "Teams"}
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ngôn ngữ thiết kế">
          {FOUNDATIONS.map((f) => (
            <CommandItem key={f.slug} icon={<Color20Regular />} onSelect={() => go(`#/foundations/${f.slug}`)}>
              {f.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Khái niệm">
          {CONCEPTS.map((c) => (
            <CommandItem key={c.meta.slug} icon={<Book20Regular />} onSelect={() => go(`#/concepts/${c.meta.slug}`)} keywords={[c.meta.group]}>
              {c.meta.title}
              <CommandShortcut>{c.meta.group}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {COMPONENTS_BY_CATEGORY.map((group) => (
          <CommandGroup key={group.category} heading={group.category}>
            {group.items.map((c) => (
              <CommandItem
                key={c.slug}
                icon={group.category === "Yugen Labs" ? <PuzzlePiece20Regular /> : <Document20Regular />}
                onSelect={() => go(`#/components/${c.slug}`)}
                keywords={[c.slug, group.category]}
              >
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
