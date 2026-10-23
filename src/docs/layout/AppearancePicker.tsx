import type { ReactNode } from "react";
import {
  Accessibility16Regular,
  TextDirectionHorizontalLeft16Regular,
  TextDirectionHorizontalRight16Regular,
  WeatherMoon16Regular,
  WeatherSunny16Regular,
} from "@fluentui/react-icons";
import { ToggleGroup, ToggleGroupItem, type YugenDir, type YugenTheme } from "@/components/ui";
import type { AppBrand } from "@/hooks/useAppearance";
import { useLocale } from "../i18n";

export interface AppearanceValue {
  theme: YugenTheme;
  brand: AppBrand;
  dir?: YugenDir;
}

const BRANDS: { value: AppBrand; label: string }[] = [
  { value: "sakura", label: "Yugen" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

export const BRAND_LABEL: Record<AppBrand, string> = { sakura: "Yugen", web: "Web", teams: "Teams" };

/** Chấm màu brand — `data-brand` đổi token nên chấm luôn đúng màu của brand đó, bất kể brand đang dùng. */
export function BrandDot({ brand, className = "size-3" }: { brand: AppBrand; className?: string }) {
  return <span data-brand={brand} className={`${className} shrink-0 rounded-circular bg-brand-background`} />;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption1 font-semibold text-foreground-3">{label}</span>
      {children}
    </div>
  );
}

const ITEM = "flex-auto gap-1 whitespace-nowrap";

/**
 * Chọn giao diện: chế độ (sáng / tối / tương phản cao) và brand tách riêng; hướng chữ chỉ hiện khi có `dir`.
 * Dùng chung cho thanh trên và khung demo của trang component.
 */
export function AppearancePicker({ value, onChange }: { value: AppearanceValue; onChange: (patch: Partial<AppearanceValue>) => void }) {
  const { t } = useLocale();
  // ToggleGroup type="single" trả "" khi bấm lại mục đang chọn → bỏ qua để luôn có một giá trị.
  const pick =
    <K extends keyof AppearanceValue>(key: K) =>
    (v: string) =>
      v && onChange({ [key]: v } as Partial<AppearanceValue>);

  return (
    <div className="flex w-80 max-w-full flex-col gap-4">
      <Section label={t("appearance.mode")}>
        <ToggleGroup type="single" size="small" value={value.theme} onValueChange={pick("theme")} aria-label={t("appearance.mode")} className="w-full">
          <ToggleGroupItem value="light" icon={<WeatherSunny16Regular />} className={ITEM}>
            {t("appearance.light")}
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" icon={<WeatherMoon16Regular />} className={ITEM}>
            {t("appearance.dark")}
          </ToggleGroupItem>
          <ToggleGroupItem value="high-contrast" icon={<Accessibility16Regular />} className={ITEM}>
            {t("theme.highContrast")}
          </ToggleGroupItem>
        </ToggleGroup>
      </Section>

      <Section label={t("appearance.brand")}>
        <ToggleGroup
          type="single"
          size="small"
          value={value.brand}
          onValueChange={pick("brand")}
          disabled={value.theme === "high-contrast"}
          aria-label={t("appearance.brand")}
          className="w-full"
        >
          {BRANDS.map((b) => (
            <ToggleGroupItem key={b.value} value={b.value} icon={<BrandDot brand={b.value} />} className={ITEM}>
              {b.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Section>

      {value.dir && (
        <Section label={t("topbar.dir")}>
          <ToggleGroup type="single" size="small" value={value.dir} onValueChange={pick("dir")} aria-label={t("topbar.dir")} className="w-full">
            <ToggleGroupItem value="ltr" icon={<TextDirectionHorizontalLeft16Regular />} aria-label={t("topbar.ltr")} className={ITEM}>
              LTR
            </ToggleGroupItem>
            <ToggleGroupItem value="rtl" icon={<TextDirectionHorizontalRight16Regular />} aria-label={t("topbar.rtl")} className={ITEM}>
              RTL
            </ToggleGroupItem>
          </ToggleGroup>
        </Section>
      )}
    </div>
  );
}
