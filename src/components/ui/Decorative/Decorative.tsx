import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Thành phần trang trí (gradient, minh hoạ). Chỉ dùng cho hero / marketing / empty state / onboarding —
 * KHÔNG dùng trong control chức năng (xem Design.md §4.5).
 */
export type GradientName = "sakura" | "dusk" | "sunset" | "aurora" | "brand";

const TEXT_GRADIENT: Record<GradientName, string> = {
  sakura: "text-gradient-sakura",
  dusk: "text-gradient-dusk",
  sunset: "text-gradient-sunset",
  aurora: "text-gradient-aurora",
  brand: "text-gradient-brand",
};

const STOPS: Record<GradientName, [string, string, string]> = {
  sakura: ["var(--colorGradientSakura1)", "var(--colorGradientSakura2)", "var(--colorGradientSakura3)"],
  dusk: ["var(--colorGradientDusk1)", "var(--colorGradientDusk2)", "var(--colorGradientDusk3)"],
  sunset: ["var(--colorGradientSunset1)", "var(--colorGradientSunset2)", "var(--colorGradientSunset3)"],
  aurora: ["var(--colorGradientAurora1)", "var(--colorGradientAurora2)", "var(--colorGradientAurora3)"],
  brand: ["var(--brand-50)", "var(--brand-80)", "var(--brand-90)"],
};

/* ------------------------------------------------------------------ GradientText */
export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: GradientName;
}

/** Chữ gradient. Chỉ dùng cho chữ ≥ 28px (title2 trở lên). */
export function GradientText({ gradient = "sakura", className, ...props }: GradientTextProps) {
  return (
    <span
      className={cn("box-decoration-clone pb-[0.08em]", TEXT_GRADIENT[gradient], className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ WavyUnderline */
function wavePath(width: number, period: number, amp: number, mid: number) {
  let d = `M0 ${mid} Q${period / 4} ${mid - amp} ${period / 2} ${mid}`;
  for (let x = period; x <= width; x += period / 2) d += ` T${x} ${mid}`;
  return d;
}
const WAVE = wavePath(800, 100, 9, 12);

export interface WavyUnderlineProps {
  gradient?: GradientName;
  /** Sóng chạy liên tục (tự tắt khi người dùng bật prefers-reduced-motion). */
  animated?: boolean;
  /** Độ dày nét theo px. */
  thickness?: number;
  className?: string;
}

/** Gạch chân lượn sóng gradient — đặt ngay dưới GradientText. */
export function WavyUnderline({ gradient = "sakura", animated = true, thickness = 5, className }: WavyUnderlineProps) {
  const id = React.useId().replace(/:/g, "");
  const [a, b, c] = STOPS[gradient];
  return (
    <svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden className={cn("block h-4 w-full overflow-hidden", className)}>
      <defs>
        <linearGradient id={`${id}w`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="0">
          <stop offset="0" style={{ stopColor: a }} />
          <stop offset="0.35" style={{ stopColor: b }} />
          <stop offset="0.62" style={{ stopColor: c }} />
          <stop offset="1" style={{ stopColor: a }} />
        </linearGradient>
      </defs>
      <g className={animated ? "animate-[wave-flow_5s_linear_infinite] motion-reduce:animate-none" : undefined}>
        <path
          d={WAVE}
          fill="none"
          stroke={`url(#${id}w)`}
          strokeWidth={thickness}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ BloomArt */
const PETALS = [-168, -146, -124, -102, -80, -58, -36, -14];

/** Minh hoạ "bloom" theo ramp brand hiện tại (đổi data-brand là đổi màu hoa). */
export function BloomArt({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden className={cn("block size-full", className)}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-150)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-130)" }} />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--brand-20)" }} />
          <stop offset="0.45" style={{ stopColor: "var(--brand-60)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-100)" }} />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}core`}>
          <stop offset="0" style={{ stopColor: "var(--brand-10)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-10)" }} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}bg)`} />
      <g transform="translate(330 360)">
        {PETALS.map((angle, i) => (
          <g key={angle} transform={`rotate(${angle})`} opacity={0.82 + (i % 2) * 0.18}>
            <path d="M0 0 C70 -82 250 -96 330 -8 C250 46 90 52 0 0Z" fill={`url(#${id}p)`} />
            <path d="M20 -8 C110 -70 240 -74 312 -10" fill="none" stroke={`url(#${id}h)`} strokeWidth="3" />
          </g>
        ))}
        <circle r="110" fill={`url(#${id}core)`} opacity="0.7" />
      </g>
    </svg>
  );
}
