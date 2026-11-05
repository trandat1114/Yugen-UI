import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckmarkCircle16Filled, DismissCircle16Filled, Warning16Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { DocSection } from "../blocks";
import type { Locale } from "../i18n";

/** Chữ hiển thị theo ngôn ngữ: tiếng Việt mặc định, tiếng Anh khi locale = "en". CSS / JSON xuất ra không đổi theo ngôn ngữ. */
export const translator = (locale: Locale) => (vi: string, en: string) => (locale === "en" ? en : vi);

export type PreviewTheme = "light" | "dark" | "high-contrast";
export const PREVIEW_LABEL: Record<PreviewTheme, string> = { light: "Light", dark: "Dark", "high-contrast": "High contrast" };

/* ------------------------------------------------------------------ kiểm tra */

export type CheckStatus = "ok" | "warn" | "fail";

export interface CheckItem {
  label: string;
  value: string;
  status: CheckStatus;
}

export const checkStatus = (ok: boolean, warn = false): CheckStatus => (ok ? "ok" : warn ? "warn" : "fail");

const STATUS_CLASS: Record<CheckStatus, string> = {
  ok: "text-success-foreground-1",
  warn: "text-warning-foreground-1",
  fail: "text-danger-foreground-1",
};

export function StatusIcon({ status }: { status: CheckStatus }) {
  return status === "ok" ? <CheckmarkCircle16Filled /> : status === "warn" ? <Warning16Filled /> : <DismissCircle16Filled />;
}

/** Danh sách kiểm tra của một section, đặt ngay dưới bản xem trước của chính nó; `children`: cảnh báo / nút sửa. */
export function Checks({ title, items, children }: { title: string; items: CheckItem[]; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 px-4 pt-3 pb-4">
      <p className="text-body1 font-semibold">{title}</p>
      <ul>
        {items.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-3 border-t border-stroke-3 py-2 first:border-t-0">
            <span className="text-body1">{c.label}</span>
            <span className={cn("inline-flex shrink-0 items-center gap-1 text-caption1 font-semibold tabular-nums", STATUS_CLASS[c.status])}>
              <StatusIcon status={c.status} />
              {c.value}
            </span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ lựa chọn dạng ô có hình */

export interface TileOption<T extends string> {
  value: T;
  label: string;
  /** Hình minh hoạ tác dụng của bậc (bo góc, khoảng cách, cỡ chữ…). Chỉ để nhìn: nhãn là tên của radio. */
  visual: React.ReactNode;
}

/** Một trục: radiogroup gồm các ô (hình + nhãn), mũi tên để chuyển bậc; `note` giải thích vì sao chỉ có vài bậc. */
export function OptionTiles<T extends string>({
  label,
  note,
  value,
  options,
  onChange,
}: {
  label: string;
  note?: React.ReactNode;
  value: T;
  options: TileOption<T>[];
  onChange: (value: T) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <p id={id} className="text-body1 font-semibold">
        {label}
      </p>
      <RadioGroupPrimitive.Root
        aria-labelledby={id}
        value={value}
        onValueChange={(v) => onChange(v as T)}
        className="grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-1.5"
      >
        {options.map((o) => (
          <RadioGroupPrimitive.Item
            key={o.value}
            value={o.value}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-large border border-stroke-1 bg-background-1 px-1 pt-1.5 pb-1 text-caption1 text-foreground-2",
              "transition-colors duration-faster hover:border-stroke-1-hover hover:bg-background-1-hover",
              "data-[state=checked]:border-brand-stroke data-[state=checked]:bg-brand-background-2 data-[state=checked]:text-foreground-1 data-[state=checked]:ring-1 data-[state=checked]:ring-brand-stroke",
            )}
          >
            <span aria-hidden className="flex h-9 w-full items-center justify-center">
              {o.visual}
            </span>
            <span className="max-w-full text-center leading-tight">{o.label}</span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      {note && <p className="text-caption1 text-foreground-3">{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ bản xem trước */

/**
 * Một khung theme lồng: data-theme + data-brand trên cùng phần tử để alias token được khai báo lại với ramp mới.
 * font-sans: font-family của <html> chỉ được kế thừa dạng giá trị đã tính, nên phải đặt lại để biến font mới có hiệu lực.
 */
export function Pane({
  theme,
  style,
  label,
  dir,
  className,
  children,
}: {
  theme: PreviewTheme;
  style: React.CSSProperties;
  label?: string;
  dir?: "ltr" | "rtl";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme={theme}
      data-brand="custom"
      dir={dir}
      style={style}
      className={cn("flex min-w-0 flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-2 p-4 font-sans", className)}
    >
      {label && <span className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{label}</span>}
      {children}
    </div>
  );
}

/** Light và Dark cạnh nhau (xếp chồng khi vùng xem trước hẹp): cho các trục đổi theo theme (màu, nền, bóng, glass). */
export function LightDark({ style, children }: { style: (theme: PreviewTheme) => React.CSSProperties; children: (theme: PreviewTheme) => React.ReactNode }) {
  return (
    <div className="@container">
      <div className="grid gap-3 @lg:grid-cols-2">
        {(["light", "dark"] as const).map((theme) => (
          <Pane key={theme} theme={theme} style={style(theme)} label={PREVIEW_LABEL[theme]}>
            {children(theme)}
          </Pane>
        ))}
      </div>
    </div>
  );
}

/** Section của designer: điều khiển bên trái, bản xem trước + kiểm tra của chính nó bên phải (xếp chồng khi hẹp). */
export function DesignerSection({
  id,
  title,
  description,
  controls,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DocSection id={id} title={title} description={description}>
      <div className="@container">
        <div className="grid gap-6 @3xl:grid-cols-[18rem_minmax(0,1fr)] @3xl:gap-8">
          <div className="flex min-w-0 flex-col gap-5">{controls}</div>
          <div className="flex min-w-0 flex-col gap-4">{children}</div>
        </div>
      </div>
    </DocSection>
  );
}

/* ------------------------------------------------------------------ hình của các ô lựa chọn */

/** Góc bo của một khung: bán kính phóng to để thấy khác biệt giữa các bậc. */
export const RadiusVisual = ({ radius }: { radius: number }) => (
  <span className="size-7 translate-x-1 translate-y-1 border-s-2 border-t-2 border-foreground-2" style={{ borderStartStartRadius: radius }} />
);

/** Ba vạch cách nhau theo mật độ. */
export const DensityVisual = ({ gap }: { gap: number }) => (
  <span className="flex w-7 flex-col" style={{ gap }}>
    {[0, 1, 2].map((i) => (
      <span key={i} className="h-1 rounded-circular bg-foreground-3" />
    ))}
  </span>
);

export const SwatchStrip = ({ colors }: { colors: string[] }) => (
  <span className="flex h-6 w-full max-w-10 overflow-hidden rounded-small border border-stroke-2">
    {colors.map((c, i) => (
      <span key={i} className="flex-1" style={{ background: c }} />
    ))}
  </span>
);

/** Thẻ nhỏ với bóng theo bậc độ nổi (0 = phẳng). */
export const ElevationVisual = ({ strength }: { strength: number }) => (
  <span
    className="h-5 w-7 rounded-small border border-stroke-2 bg-background-1"
    style={{ boxShadow: strength ? `0 ${2 * strength}px ${6 * strength}px rgb(0 0 0 / ${0.3 * strength})` : "none" }}
  />
);

/** Sọc màu phía sau một dải glass: thấy được độ mờ và độ đục của bậc. */
export const GlassVisual = ({ blur, alpha }: { blur: number; alpha: number }) => (
  <span
    className="relative h-7 w-full max-w-12 overflow-hidden rounded-small"
    style={{ background: "repeating-linear-gradient(90deg, #c2347a 0 5px, #0f6cbd 5px 10px, #f7b733 10px 15px)" }}
  >
    <span
      className="absolute inset-x-1 bottom-1 h-3 rounded-small"
      style={{ backdropFilter: `blur(${blur / 6}px)`, WebkitBackdropFilter: `blur(${blur / 6}px)`, background: `rgb(255 255 255 / ${alpha})` }}
    />
  </span>
);

/** Nửa trái màu glass ở light, nửa phải ở dark. */
export const TintVisual = ({ light, dark }: { light: string; dark: string }) => (
  <span className="flex h-6 w-9 overflow-hidden rounded-small border border-stroke-2">
    <span className="flex-1" style={{ background: light }} />
    <span className="flex-1" style={{ background: dark }} />
  </span>
);
