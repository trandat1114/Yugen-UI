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
  Rocket20Regular,
  PaintBrush20Regular,
  Translate20Regular,
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
import { useLocale } from "../i18n";
import { docsPath, navigate } from "../router";

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
  const { t, locale, category, group, foundation, component, concept } = useLocale();

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

  const go = (path: string) => {
    onOpenChange(false);
    navigate(docsPath(path));
  };
  const act = (patch: Partial<Appearance>) => {
    onOpenChange(false);
    onAppearanceChange(patch);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t("palette.title")}>
      <CommandInput placeholder={t("palette.placeholder")} />
      <CommandList className="max-h-[min(60vh,440px)]">
        <CommandEmpty>{t("palette.empty")}</CommandEmpty>

        <CommandGroup heading={t("palette.pages")}>
          <CommandItem icon={<Home20Regular />} onSelect={() => go("/")}>
            {t("nav.overview")}
          </CommandItem>
          <CommandItem icon={<Rocket20Regular />} onSelect={() => go("/templates")} keywords={["template", "starter", "mẫu"]}>
            Templates
          </CommandItem>
          <CommandItem icon={<Grid20Regular />} onSelect={() => go("/blocks")}>
            Blocks
          </CommandItem>
          <CommandItem icon={<PaintBrush20Regular />} onSelect={() => go("/theme-designer")}>
            Theme Designer
          </CommandItem>
          <CommandItem icon={<Megaphone20Regular />} onSelect={() => go("/news")} keywords={["changelog", "news", "cập nhật"]}>
            {t("nav.news")}
          </CommandItem>
          <CommandItem icon={<People20Regular />} onSelect={() => go("/community")} keywords={["community", "đóng góp"]}>
            {t("nav.community")}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading={t("palette.appearance")}>
          <CommandItem icon={<WeatherMoon20Regular />} onSelect={() => act({ theme: appearance.theme === "dark" ? "light" : "dark" })}>
            {appearance.theme === "dark" ? t("topbar.toLight") : t("topbar.toDark")}
          </CommandItem>
          <CommandItem icon={<Accessibility20Regular />} onSelect={() => act({ theme: appearance.theme === "high-contrast" ? "light" : "high-contrast" })}>
            {appearance.theme === "high-contrast" ? t("palette.hcOff") : t("palette.hcOn")}
          </CommandItem>
          <CommandItem icon={<ArrowSwap20Regular />} onSelect={() => act({ dir: appearance.dir === "rtl" ? "ltr" : "rtl" })}>
            {appearance.dir === "rtl" ? t("palette.toLtr") : t("palette.toRtl")}
          </CommandItem>
          <CommandItem
            icon={<Translate20Regular />}
            onSelect={() => act({ lang: locale === "en" ? "vi" : "en" })}
            keywords={["language", "ngôn ngữ", "english", "tiếng việt", "lang"]}
          >
            {t("palette.switchLang")}
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

        <CommandGroup heading={t("nav.foundations")}>
          {FOUNDATIONS.map((f) => (
            <CommandItem key={f.slug} icon={<Color20Regular />} onSelect={() => go(`/foundations/${f.slug}`)} keywords={[f.name]}>
              {foundation(f)}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading={t("nav.concepts")}>
          {CONCEPTS.map((c) => (
            <CommandItem
              key={c.meta.slug}
              icon={<Book20Regular />}
              onSelect={() => go(`/concepts/${c.meta.slug}`)}
              keywords={[c.meta.title, c.meta.group, group(c.meta.group)]}
            >
              {concept(c.meta).title}
              <CommandShortcut>{group(c.meta.group)}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {COMPONENTS_BY_CATEGORY.map((g) => (
          <CommandGroup key={g.category} heading={category(g.category)}>
            {g.items.map((c) => (
              <CommandItem
                key={c.slug}
                icon={g.category === "Yugen Labs" ? <PuzzlePiece20Regular /> : <Document20Regular />}
                onSelect={() => go(`/components/${c.slug}`)}
                keywords={[c.slug, g.category, category(g.category)]}
              >
                {component(c).name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
