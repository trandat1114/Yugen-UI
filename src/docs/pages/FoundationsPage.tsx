import { cn } from "@/lib/cn";
import { DocSection, OnThisPage, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { COLOR_SECTIONS, ColorPage } from "./ColorPage";
import { MOTION_SECTIONS, MotionPage } from "./MotionPage";
import { useLocale, type Locale } from "../i18n";


/* ------------------------------------------------------------- helpers */

const TYPE_RAMP = [
  { name: "Display", cls: "text-display font-semibold", meta: "68 / 92 · Semibold", utility: "text-display" },
  { name: "Large title", cls: "text-large-title font-semibold", meta: "40 / 52 · Semibold", utility: "text-large-title" },
  { name: "Title 1", cls: "text-title1 font-semibold", meta: "32 / 40 · Semibold", utility: "text-title1" },
  { name: "Title 2", cls: "text-title2 font-semibold", meta: "28 / 36 · Semibold", utility: "text-title2" },
  { name: "Title 3", cls: "text-title3 font-semibold", meta: "24 / 32 · Semibold", utility: "text-title3" },
  { name: "Subtitle 1", cls: "text-subtitle1 font-semibold", meta: "20 / 28 · Semibold", utility: "text-subtitle1" },
  { name: "Subtitle 2", cls: "text-subtitle2 font-semibold", meta: "16 / 22 · Semibold", utility: "text-subtitle2" },
  { name: "Body 2", cls: "text-body2", meta: "16 / 22 · Regular", utility: "text-body2" },
  { name: "Body 1", cls: "text-body1", meta: "14 / 20 · Regular", utility: "text-body1" },
  { name: "Body 1 Strong", cls: "text-body1 font-semibold", meta: "14 / 20 · Semibold", utility: "text-body1 font-semibold" },
  { name: "Caption 1", cls: "text-caption1", meta: "12 / 16 · Regular", utility: "text-caption1" },
  { name: "Caption 2", cls: "text-caption2", meta: "10 / 14 · Regular", utility: "text-caption2" },
];

/** Chọn chuỗi theo ngôn ngữ: `t("tiếng Việt", "English")`. */
function useT() {
  const { locale } = useLocale();
  return (vi: string, en: string) => (locale === "en" ? en : vi);
}

function TypographyPage() {
  const t = useT();
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Typography"
        lead={t(
          "Segoe UI Variable là typeface đặc trưng của Fluent. Type ramp cố định giúp phân cấp thông tin rõ ràng và nhất quán.",
          "Segoe UI Variable is the Fluent typeface. A fixed type ramp keeps the text hierarchy clear and consistent.",
        )}
      >
        {t(
          "Luôn dùng một style trong ramp — không tự đặt font-size / line-height. Weight chỉ dùng Regular (400) và Semibold (600).",
          "Always use a style from the ramp; don't set font-size or line-height yourself. Use only Regular (400) and Semibold (600).",
        )}
      </PageHeader>
      <DocSection id="ramp" title="Type ramp">
        <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
          {TYPE_RAMP.map((r) => (
            <div key={r.name} className="flex flex-col gap-1 border-b border-stroke-3 px-4 py-3 last:border-b-0 md:flex-row md:items-baseline md:gap-5">
              <div className="w-44 shrink-0">
                <p className="text-body1 font-semibold">{r.name}</p>
                <p className="font-mono text-caption1 text-foreground-3">{r.meta}</p>
                <p className="font-mono text-caption1 text-brand-foreground-1">{r.utility}</p>
              </div>
              <p className={cn("min-w-0 truncate font-display text-foreground-1", r.cls)}>{t("Thiết kế trôi chảy", "Design that flows")}</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="usage" title={t("Sử dụng", "Usage")}>
        <CodeBlock
          code={t(
            `<h1 className="text-large-title font-semibold">Tiêu đề trang</h1>
<h2 className="text-title3 font-semibold">Tiêu đề section</h2>
<p className="text-body1 text-foreground-2">Nội dung thân bài.</p>
<span className="text-caption1 text-foreground-3">Cập nhật 5 phút trước</span>`,
            `<h1 className="text-large-title font-semibold">Page title</h1>
<h2 className="text-title3 font-semibold">Section title</h2>
<p className="text-body1 text-foreground-2">Body text.</p>
<span className="text-caption1 text-foreground-3">Updated 5 minutes ago</span>`,
          )}
        />
      </DocSection>
    </>
  );
}

const SPACING = [
  ["XXS", "0.5", 2],
  ["XS", "1", 4],
  ["SNudge", "1.5", 6],
  ["S", "2", 8],
  ["MNudge", "2.5", 10],
  ["M", "3", 12],
  ["L", "4", 16],
  ["XL", "5", 20],
  ["XXL", "6", 24],
  ["XXXL", "8", 32],
] as const;

function SpacingPage() {
  const t = useT();
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Spacing"
        lead={t(
          "Mọi khoảng cách dựa trên lưới 4px (với hai bậc nudge 6px và 10px để căn chỉnh tinh).",
          "All spacing sits on a 4px grid, with two nudge steps (6px and 10px) for fine alignment.",
        )}
      />
      <DocSection
        id="scale"
        title={t("Thang spacing", "Spacing scale")}
        description={t(
          "Thang số của Tailwind, trùng ramp spacing của Fluent. Dùng với p-*, m-*, gap-*, space-*, inset-*.",
          "Tailwind's numeric scale, which matches the Fluent spacing ramp. Use it with p-*, m-*, gap-*, space-*, inset-*.",
        )}
      >
        <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
          {SPACING.map(([name, step, px]) => (
            <div key={step} className="flex items-center gap-4 border-b border-stroke-3 px-4 py-2 last:border-b-0">
              <span className="w-40 font-mono text-[13px] font-semibold">spacing{name}</span>
              <span className="w-24 font-mono text-caption1 text-brand-foreground-1">p-{step}</span>
              <span className="w-12 font-mono text-caption1 text-foreground-3">{px}px</span>
              <span className="h-4 rounded-small bg-brand-background" style={{ width: px * 4 }} />
            </div>
          ))}
        </div>
      </DocSection>
    </>
  );
}

const RADII = [
  ["Small", "small", 2],
  ["Medium", "medium", 4],
  ["Large", "large", 6],
  ["XLarge", "xlarge", 8],
  ["2XLarge", "2xlarge", 12],
  ["3XLarge", "3xlarge", 16],
  ["Circular", "circular", "∞"],
] as const;

const RADIUS_CLASS: Record<string, string> = {
  small: "rounded-small",
  medium: "rounded-medium",
  large: "rounded-large",
  xlarge: "rounded-xlarge",
  "2xlarge": "rounded-2xlarge",
  "3xlarge": "rounded-3xlarge",
  circular: "rounded-circular",
};

function RadiusPage() {
  const t = useT();
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title={t("Bo góc", "Corner radius")}
        lead={t(
          "Bo góc tăng theo kích thước bề mặt: control nhỏ và Card dùng Medium (4px), Dialog dùng XLarge (8px).",
          "Radius grows with the size of the surface: small controls and Card use Medium (4px), Dialog uses XLarge (8px).",
        )}
      />
      <DocSection id="scale" title={t("Thang bo góc", "Radius scale")}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {RADII.map(([name, key, px]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className={cn("size-20 border-2 border-brand-stroke bg-brand-background-2", RADIUS_CLASS[key])} />
              <p className="text-body1 font-semibold">{name}</p>
              <p className="font-mono text-caption1 text-foreground-3">
                rounded-{key} · {px}
                {typeof px === "number" && "px"}
              </p>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  );
}

const SHADOWS = [
  ["shadow2", "shadow-2", { vi: "Phần tử nổi nhẹ trong nội dung: bong bóng tin nhắn, khối code", en: "Slightly raised elements in content: message bubbles, code blocks" }],
  ["shadow4", "shadow-4", { vi: "Card (mặc định), thanh lệnh", en: "Card (default), command bar" }],
  ["shadow8", "shadow-8", { vi: "Card hover, tooltip", en: "Card on hover, tooltip" }],
  ["shadow16", "shadow-16", { vi: "Menu, popover, dropdown", en: "Menu, popover, dropdown" }],
  ["shadow28", "shadow-28", { vi: "Panel trượt, teaching popover", en: "Sliding panel, teaching popover" }],
  ["shadow64", "shadow-64", { vi: "Dialog, cửa sổ modal", en: "Dialog, modal window" }],
] as const;

function ElevationPage() {
  const { locale } = useLocale();
  const t = useT();
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Elevation"
        lead={t(
          "Elevation dùng bóng 2 lớp (key + ambient) để biểu thị độ cao tương đối và tạo phân cấp giữa các bề mặt.",
          "Elevation uses two-layer shadows (key + ambient) to show the relative height of surfaces and the hierarchy between them.",
        )}
      />
      <DocSection id="ramp" title="Shadow ramp">
        <div className="grid gap-5 rounded-3xlarge bg-background-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {SHADOWS.map(([token, utility, usage]) => (
            <div key={token} className={cn("rounded-xlarge bg-background-1 p-4", utility)}>
              <p className="font-mono text-[13px] font-semibold">{token}</p>
              <p className="font-mono text-caption1 text-brand-foreground-1">{utility}</p>
              <p className="mt-2 text-body1 text-foreground-2">{usage[locale]}</p>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  );
}

const SECTIONS: Record<string, Record<Locale, { id: string; label: string }[]>> = {
  color: COLOR_SECTIONS,
  typography: {
    vi: [
      { id: "ramp", label: "Type ramp" },
      { id: "usage", label: "Sử dụng" },
    ],
    en: [
      { id: "ramp", label: "Type ramp" },
      { id: "usage", label: "Usage" },
    ],
  },
  spacing: { vi: [{ id: "scale", label: "Thang spacing" }], en: [{ id: "scale", label: "Spacing scale" }] },
  radius: { vi: [{ id: "scale", label: "Thang bo góc" }], en: [{ id: "scale", label: "Radius scale" }] },
  elevation: { vi: [{ id: "ramp", label: "Shadow ramp" }], en: [{ id: "ramp", label: "Shadow ramp" }] },
  motion: MOTION_SECTIONS,
};

export function FoundationsPage({ slug, theme }: { slug: string; theme: string }) {
  const { locale } = useLocale();
  const page =
    slug === "color" ? (
      <ColorPage theme={theme} />
    ) : slug === "typography" ? (
      <TypographyPage />
    ) : slug === "spacing" ? (
      <SpacingPage />
    ) : slug === "radius" ? (
      <RadiusPage />
    ) : slug === "elevation" ? (
      <ElevationPage />
    ) : (
      <MotionPage />
    );

  return (
    <div className="flex gap-8">
      <article key={slug} className="min-w-0 flex-1">
        {page}
      </article>
      <OnThisPage key={`toc-${slug}`} items={SECTIONS[slug]?.[locale] ?? []} />
    </div>
  );
}
