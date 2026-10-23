import { cn } from "@/lib/cn";
import { DocSection, OnThisPage, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { COLOR_SECTIONS, ColorPage } from "./ColorPage";
import { MOTION_SECTIONS, MotionPage } from "./MotionPage";
import { useLocale } from "../i18n";


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

function TypographyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Typography"
        lead="Segoe UI Variable là typeface đặc trưng của Fluent. Type ramp cố định giúp phân cấp thông tin rõ ràng và nhất quán."
      >
        Luôn dùng một style trong ramp — không tự đặt font-size / line-height. Weight chỉ dùng Regular (400) và Semibold (600).
      </PageHeader>
      <DocSection id="ramp" title="Type ramp">
        <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
          {TYPE_RAMP.map((t) => (
            <div key={t.name} className="flex flex-col gap-1 border-b border-stroke-3 px-4 py-3 last:border-b-0 md:flex-row md:items-baseline md:gap-5">
              <div className="w-44 shrink-0">
                <p className="text-body1 font-semibold">{t.name}</p>
                <p className="font-mono text-caption1 text-foreground-3">{t.meta}</p>
                <p className="font-mono text-caption1 text-brand-foreground-1">{t.utility}</p>
              </div>
              <p className={cn("min-w-0 truncate font-display text-foreground-1", t.cls)}>Thiết kế trôi chảy</p>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="usage" title="Sử dụng">
        <CodeBlock
          code={`<h1 className="text-large-title font-semibold">Tiêu đề trang</h1>
<h2 className="text-title3 font-semibold">Tiêu đề section</h2>
<p className="text-body1 text-foreground-2">Nội dung thân bài.</p>
<span className="text-caption1 text-foreground-3">Cập nhật 5 phút trước</span>`}
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
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Spacing"
        lead="Mọi khoảng cách dựa trên lưới 4px (với hai bậc nudge 6px và 10px để căn chỉnh tinh)."
      />
      <DocSection id="scale" title="Thang spacing" description="Thang số của Tailwind, trùng ramp spacing của Fluent. Dùng với p-*, m-*, gap-*, space-*, inset-*.">
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
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Bo góc"
        lead="Bo góc tăng theo kích thước bề mặt: control nhỏ dùng Medium (4px), Card dùng Medium–Large, Dialog dùng XLarge (8px)."
      />
      <DocSection id="scale" title="Thang bo góc">
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
  ["shadow2", "shadow-2", "Card ở trạng thái nghỉ, list item được chọn"],
  ["shadow4", "shadow-4", "Card (mặc định), thanh lệnh"],
  ["shadow8", "shadow-8", "Card hover, tooltip"],
  ["shadow16", "shadow-16", "Menu, popover, dropdown"],
  ["shadow28", "shadow-28", "Panel trượt, teaching popover"],
  ["shadow64", "shadow-64", "Dialog, cửa sổ modal"],
] as const;

function ElevationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Elevation"
        lead="Elevation dùng bóng 2 lớp (key + ambient) để biểu thị độ cao tương đối và tạo phân cấp giữa các bề mặt."
      />
      <DocSection id="ramp" title="Shadow ramp">
        <div className="grid gap-5 rounded-3xlarge bg-background-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {SHADOWS.map(([token, utility, usage]) => (
            <div key={token} className={cn("rounded-xlarge bg-background-1 p-4", utility)}>
              <p className="font-mono text-[13px] font-semibold">{token}</p>
              <p className="font-mono text-caption1 text-brand-foreground-1">{utility}</p>
              <p className="mt-2 text-body1 text-foreground-2">{usage}</p>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  );
}

const SECTIONS: Record<string, { id: string; label: string }[]> = {
  color: COLOR_SECTIONS,
  typography: [
    { id: "ramp", label: "Type ramp" },
    { id: "usage", label: "Sử dụng" },
  ],
  spacing: [{ id: "scale", label: "Thang spacing" }],
  radius: [{ id: "scale", label: "Thang bo góc" }],
  elevation: [{ id: "ramp", label: "Shadow ramp" }],
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
      <OnThisPage key={`toc-${slug}`} items={slug === "motion" ? MOTION_SECTIONS[locale] : (SECTIONS[slug] ?? [])} />
    </div>
  );
}
