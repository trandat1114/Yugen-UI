import {
  Accessibility20Regular,
  LocalLanguage20Regular,
  Megaphone20Regular,
  Navigation20Regular,
  Search20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from "@fluentui/react-icons";
import { Button, Popover, PopoverSurface, PopoverTrigger, SimpleTooltip, Kbd, KbdGroup } from "@/components/ui";
import type { Appearance } from "@/hooks/useAppearance";
import { YugenMark } from "../YugenMark";
import { useHasUnseenNews } from "../useNews";
import { useLocale, type Locale } from "../i18n";
import { VersionMenu } from "./VersionMenu";
import { AppearancePicker } from "./AppearancePicker";

const LANGS: Record<Locale, { short: string; label: string }> = {
  vi: { short: "VI", label: "Tiếng Việt" },
  en: { short: "EN", label: "English" },
};

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
  const hasUnseen = useHasUnseenNews();
  const { t } = useLocale();
  // Chỉ có 2 ngôn ngữ → nút ghi ngôn ngữ sẽ chuyển sang, bấm là đổi.
  const nextLang: Locale = appearance.lang === "vi" ? "en" : "vi";
  const ModeIcon = appearance.theme === "high-contrast" ? Accessibility20Regular : appearance.theme === "dark" ? WeatherMoon20Regular : WeatherSunny20Regular;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-S bg-shell/85 px-M backdrop-blur-md sm:px-L lg:h-18.5 lg:gap-M lg:px-12">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t("topbar.openNav")}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover lg:hidden"
      >
        <Navigation20Regular />
      </button>
      <a href="#/" className="flex shrink-0 items-center gap-S whitespace-nowrap lg:hidden">
        <YugenMark size={24} />
        <span className="text-subtitle2 font-semibold">Yugen UI</span>
      </a>

      <button
        type="button"
        onClick={onOpenPalette}
        className="ms-auto inline-flex size-8 shrink-0 items-center justify-center gap-S rounded-medium text-body1 text-foreground-3 transition-colors duration-faster hover:text-foreground-1 sm:ms-L sm:h-8 sm:w-auto sm:flex-1 sm:justify-start sm:border sm:border-stroke-2 sm:bg-background-1 sm:ps-S sm:pe-XS sm:hover:border-stroke-1-hover md:max-w-72 lg:ms-0 lg:w-72 lg:flex-none"
      >
        <Search20Regular className="shrink-0" />
        <span className="flex-1 truncate text-start max-sm:sr-only">{t("topbar.search")}</span>
        <KbdGroup className="hidden shrink-0 lg:inline-flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <div className="flex shrink-0 items-center gap-XS sm:ms-auto">
        <div className="hidden lg:block">
          <VersionMenu />
        </div>
        <SimpleTooltip content={t("nav.news")}>
          <Button asChild appearance="subtle" iconOnly className="relative hidden sm:inline-flex" aria-label={t("nav.news")}>
            <a href="#/news">
              <Megaphone20Regular />
              {hasUnseen && (
                <span className="absolute top-1 inset-e-1 size-2 rounded-circular bg-brand-background ring-2 ring-shell">
                  <span className="sr-only">{t("topbar.unseen")}</span>
                </span>
              )}
            </a>
          </Button>
        </SimpleTooltip>

        <SimpleTooltip content={<span lang={nextLang}>{LANGS[nextLang].label}</span>}>
          <Button
            appearance="subtle"
            lang={nextLang}
            onClick={() => onChange({ lang: nextLang })}
            className="gap-XS px-XS text-caption1 font-semibold"
          >
            <LocalLanguage20Regular />
            {LANGS[nextLang].short}
            <span className="sr-only">{LANGS[nextLang].label}</span>
          </Button>
        </SimpleTooltip>

        <Popover>
          <SimpleTooltip content={t("appearance.title")}>
            <PopoverTrigger asChild>
              <Button appearance="subtle" aria-label={t("appearance.title")} icon={<ModeIcon />} />
            </PopoverTrigger>
          </SimpleTooltip>
          <PopoverSurface align="end" aria-label={t("appearance.title")}>
            <AppearancePicker value={appearance} onChange={onChange} />
          </PopoverSurface>
        </Popover>
      </div>
    </header>
  );
}
