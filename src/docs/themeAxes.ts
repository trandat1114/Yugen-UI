import tokensCss from "@/styles/tokens.css?raw";
import { contrastRatio, hexToOklch, oklchToHex } from "@/lib/brandRamp";

/**
 * Các trục của Theme Designer ngoài màu brand (#44): bo góc, mật độ, chữ, màu trung tính, độ nổi, chuyển động.
 * Mỗi trục là vài bậc có tên, mỗi bậc đổi cả ramp token cùng lúc (không có slider cho từng token). Đầu ra là biến CSS
 * cùng tên alias với yugen-ui/theme.css; high contrast luôn giữ nguyên. Giá trị gốc đọc thẳng từ tokens.css.
 */

export type RadiusStep = "none" | "small" | "medium" | "large" | "full";
export type DensityStep = "compact" | "default" | "comfortable";
export type BaseSize = 14 | 15 | 16;
export type NeutralTone = "pure" | "warm" | "cool" | "brand";
export type ElevationStep = "flat" | "subtle" | "default";
export type MotionStep = "reduced" | "default" | "expressive";

export interface ThemeAxes {
  radius: RadiusStep;
  density: DensityStep;
  /** id trong FONTS, hoặc "custom" (dùng customFont). */
  font: string;
  customFont: string;
  baseSize: BaseSize;
  neutrals: NeutralTone;
  elevation: ElevationStep;
  motion: MotionStep;
}

export const DEFAULT_AXES: ThemeAxes = {
  radius: "medium",
  density: "default",
  font: "segoe",
  customFont: "",
  baseSize: 14,
  neutrals: "pure",
  elevation: "default",
  motion: "default",
};

export const RADIUS_FACTOR: Record<RadiusStep, number> = { none: 0, small: 0.5, medium: 1, large: 1.5, full: 2.5 };
export const DENSITY_FACTOR: Record<DensityStep, number> = { compact: 0.9375, default: 1, comfortable: 1.125 };
export const ELEVATION_FACTOR: Record<ElevationStep, number> = { flat: 0.5, subtle: 0.7, default: 1 };
export const MOTION_FACTOR: Record<MotionStep, number> = { reduced: 0.75, default: 1, expressive: 1.25 };
/** Không token thời lượng nào vượt mốc này sau khi nhân hệ số. */
export const MOTION_CAP_MS = 500;

const FALLBACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

export interface FontOption {
  id: string;
  label: string;
  /** null = giữ font của Yugen (Segoe UI Variable). */
  stack: string | null;
  /** Tham số `family` của Google Fonts — chỉ để trang docs nạp font khi xem trước. */
  google?: string;
}

export const FONTS: FontOption[] = [
  { id: "segoe", label: "Segoe UI", stack: null },
  { id: "system", label: "System UI", stack: FALLBACK },
  { id: "inter", label: "Inter", stack: `"Inter", ${FALLBACK}`, google: "Inter:wght@400;600" },
  { id: "plex", label: "IBM Plex Sans", stack: `"IBM Plex Sans", ${FALLBACK}`, google: "IBM+Plex+Sans:wght@400;600" },
  { id: "noto", label: "Noto Sans", stack: `"Noto Sans", ${FALLBACK}`, google: "Noto+Sans:wght@400;600" },
  { id: "source", label: "Source Sans 3", stack: `"Source Sans 3", ${FALLBACK}`, google: "Source+Sans+3:wght@400;600" },
];

/** Tên font tự nhập: chỉ giữ chữ, số, khoảng trắng và gạch ngang (không thoát được khỏi khai báo CSS). */
export const sanitizeFontName = (name: string) => name.replace(/[^\p{L}\p{N} -]/gu, "").trim().slice(0, 60);

export function fontStack(axes: Pick<ThemeAxes, "font" | "customFont">): string | null {
  if (axes.font === "custom") {
    const name = sanitizeFontName(axes.customFont);
    return name ? `"${name}", ${FALLBACK}` : null;
  }
  return FONTS.find((f) => f.id === axes.font)?.stack ?? null;
}

const NEUTRAL_HUE: Record<Exclude<NeutralTone, "pure" | "brand">, number> = { warm: 75, cool: 250 };
/** Chroma OKLCH của sắc pha vào xám: đủ thấy, không thành màu. */
const NEUTRAL_CHROMA = 0.012;

/* ------------------------------------------------------------------ đọc tokens.css */

type Block = Map<string, string>;

function declarations(body: string): Block {
  const map: Block = new Map();
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

/** Khối khai báo đầu tiên có selector khớp (selector là đoạn ngay trước `{`). */
function block(selector: RegExp): Block {
  for (const m of tokensCss.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (selector.test(m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim())) return declarations(m[2]);
  }
  return new Map();
}

const ROOT = block(/^:root$/);
const LIGHT = block(/^:root,\s*\[data-theme="light"\]$/);
const DARK = block(/^\[data-theme="dark"\]$/);

const px = (name: string) => parseFloat(ROOT.get(name) ?? "0");
const GREYS = [...ROOT].filter(([k, v]) => /^grey-\d+$/.test(k) && /^#[0-9a-f]{6}$/i.test(v));
const RADII = ["borderRadiusSmall", "borderRadiusMedium", "borderRadiusLarge", "borderRadiusXLarge", "borderRadius2XLarge", "borderRadius3XLarge", "borderRadius4XLarge"];
const SPACINGS = [...ROOT.keys()].filter((k) => /^spacing(Horizontal|Vertical)?[A-Z]/.test(k) && ROOT.get(k)!.endsWith("px"));
const TYPE = [...ROOT.keys()].filter((k) => /^(fontSize|lineHeight)(Base|Hero)\d+$/.test(k));
const DURATIONS = [...ROOT.keys()].filter((k) => /^duration[A-Z]/.test(k));
const SHADOWS = (theme: Block) => [...theme].filter(([k]) => /^shadow\d+(Brand)?$/.test(k));

/* ------------------------------------------------------------------ tính biến */

const round = (n: number, step = 1) => Math.round(n / step) * step;
const fmt = (n: number) => `${Number(n.toFixed(4))}`;

/** Biến không phụ thuộc theme: bo góc, spacing, chữ, thời lượng. Chỉ trả biến khác mặc định. */
export function sharedVars(axes: ThemeAxes): Record<string, string> {
  const vars: Record<string, string> = {};
  const r = RADIUS_FACTOR[axes.radius];
  if (r !== 1) for (const name of RADII) vars[`--${name}`] = `${round(px(name) * r)}px`;

  const d = DENSITY_FACTOR[axes.density];
  if (d !== 1) {
    // Tailwind: mọi p-*, gap-*, h-*, size-* = calc(var(--spacing) * n).
    vars["--spacing"] = `${fmt(0.25 * d)}rem`;
    for (const name of SPACINGS) vars[`--${name}`] = `${fmt(px(name) * d)}px`;
  }

  const ratio = axes.baseSize / 14;
  if (ratio !== 1) {
    for (const name of TYPE) {
      // Cỡ chữ làm tròn tới 0.5px, line height tới số chẵn: ramp giữ nhịp 4px của lưới.
      vars[`--${name}`] = name.startsWith("fontSize") ? `${round(px(name) * ratio, 0.5)}px` : `${round(px(name) * ratio, 2)}px`;
    }
  }

  const stack = fontStack(axes);
  if (stack) {
    vars["--fontFamilyBase"] = stack;
    vars["--fontFamilyDisplay"] = stack;
  }

  const m = MOTION_FACTOR[axes.motion];
  if (m !== 1) for (const name of DURATIONS) vars[`--${name}`] = `${Math.min(MOTION_CAP_MS, round(px(name) * m))}ms`;
  return vars;
}

function tintGrey(hex: string, hue: number) {
  const [L] = hexToOklch(hex);
  // Gần trắng / đen thì pha ít hơn để nền 1 và chữ 1 vẫn gần trung tính.
  const chroma = NEUTRAL_CHROMA * Math.min(1, 4 * L * (1 - L));
  return oklchToHex([L, chroma, hue]);
}

export function neutralHue(tone: NeutralTone, brandHex: string): number | null {
  if (tone === "pure") return null;
  return tone === "brand" ? hexToOklch(brandHex)[2] : NEUTRAL_HUE[tone];
}

/** Biến theo theme (light / dark): xám pha sắc và bóng đổ. High contrast không có biến nào. */
export function themeVars(axes: ThemeAxes, theme: "light" | "dark", brandHex: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const hue = neutralHue(axes.neutrals, brandHex);
  if (hue !== null) for (const [name, hex] of GREYS) vars[`--${name}`] = tintGrey(hex, hue);

  const e = ELEVATION_FACTOR[axes.elevation];
  if (e !== 1) {
    for (const [name, value] of SHADOWS(theme === "light" ? LIGHT : DARK)) {
      const level = parseInt(name.slice("shadow".length), 10);
      // Flat: bỏ bóng của control và card (2–8), giữ một nửa cho bề mặt nổi (16–64) để Menu / Dialog vẫn tách nền.
      vars[`--${name}`] =
        axes.elevation === "flat" && level < 16
          ? "none"
          : value.replace(/\/\s*([\d.]+)\)/g, (_, a: string) => `/ ${fmt(parseFloat(a) * e)})`);
    }
  }
  return vars;
}

/** Màu thật của một token neutral sau khi pha sắc (giải var(--grey-N) / var(--white)). */
function resolve(theme: Block, name: string, greys: Record<string, string>): string | null {
  const value = theme.get(name);
  const ref = value?.match(/^var\(--([\w-]+)\)$/)?.[1];
  const hex = ref ? (greys[`--${ref}`] ?? ROOT.get(ref)) : value;
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : null;
}

export interface NeutralCheck {
  theme: "light" | "dark";
  pair: string;
  ratio: number;
}

const PAIRS: [string, string][] = [
  ["colorNeutralForeground1", "colorNeutralBackground1"],
  ["colorNeutralForeground2", "colorNeutralBackground1"],
  ["colorNeutralForeground3", "colorNeutralBackground1"],
  ["colorNeutralForeground3", "colorNeutralBackground3"],
  ["colorNeutralForeground2", "colorNeutralBackground4"],
];

/** Tương phản của các cặp chữ / nền chính sau khi pha sắc, cho light và dark. */
export function neutralChecks(axes: ThemeAxes, brandHex: string): NeutralCheck[] {
  return (["light", "dark"] as const).flatMap((theme) => {
    const block = theme === "light" ? LIGHT : DARK;
    const greys = themeVars(axes, theme, brandHex);
    return PAIRS.flatMap(([fg, bg]) => {
      const a = resolve(block, fg, greys);
      const b = resolve(block, bg, greys);
      return a && b ? [{ theme, pair: `${fg.replace("colorNeutral", "")} / ${bg.replace("colorNeutral", "")}`, ratio: contrastRatio(a, b) }] : [];
    });
  });
}

/** Control nhỏ nhất của thư viện (size small, h-6) ở mật độ đã chọn, tính bằng px. */
export const smallestTarget = (density: DensityStep) => 24 * DENSITY_FACTOR[density];

/* ------------------------------------------------------------------ xuất & URL */

const lines = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

/**
 * Khối CSS dán sau `@import "yugen-ui/theme.css"`. `scope` là selector của brand (`[data-brand="acme"]`, hoặc `:root`
 * khi docs áp thử cho cả trang); `brand` là các biến --brand-* của ramp.
 */
export function axesToCss(scope: string, axes: ThemeAxes, brandHex: string, brand: Record<string, string>): string {
  const out = [`${scope} {\n${lines({ ...brand, ...sharedVars(axes) })}\n}`];
  for (const theme of ["light", "dark"] as const) {
    const vars = themeVars(axes, theme, brandHex);
    if (Object.keys(vars).length) out.push(`${scope}[data-theme="${theme}"] {\n${lines(vars)}\n}`);
  }
  const font = FONTS.find((f) => f.id === axes.font);
  if (font?.google || axes.font === "custom") {
    const family = axes.font === "custom" ? sanitizeFontName(axes.customFont) : font!.label;
    out.unshift(`/* Font "${family}" không đi kèm: nạp nó trong app (vd. @fontsource, Google Fonts) trước khi dùng theme này. */`);
  }
  return out.join("\n\n");
}

const PARAM = {
  radius: "td-radius",
  density: "td-density",
  font: "td-font",
  customFont: "td-font-name",
  baseSize: "td-size",
  neutrals: "td-neutrals",
  elevation: "td-elevation",
  motion: "td-motion",
} as const satisfies Record<keyof ThemeAxes, string>;

const ALLOWED: { [K in keyof ThemeAxes]?: readonly ThemeAxes[K][] } = {
  radius: ["none", "small", "medium", "large", "full"],
  density: ["compact", "default", "comfortable"],
  baseSize: [14, 15, 16],
  neutrals: ["pure", "warm", "cool", "brand"],
  elevation: ["flat", "subtle", "default"],
  motion: ["reduced", "default", "expressive"],
};

/** Chỉ ghi trục khác mặc định để link ngắn. */
export function axesToParams(axes: ThemeAxes, params = new URLSearchParams()): URLSearchParams {
  for (const key of Object.keys(PARAM) as (keyof ThemeAxes)[]) {
    if (key === "customFont" && axes.font !== "custom") continue;
    if (axes[key] !== DEFAULT_AXES[key]) params.set(PARAM[key], String(axes[key]));
  }
  return params;
}

/** Đọc từ query string; giá trị lạ bị bỏ qua và giữ mặc định. */
export function paramsToAxes(params: URLSearchParams): ThemeAxes {
  const axes: ThemeAxes = { ...DEFAULT_AXES };
  for (const key of Object.keys(ALLOWED) as (keyof typeof ALLOWED)[]) {
    const raw = params.get(PARAM[key]);
    const value = key === "baseSize" ? Number(raw) : raw;
    if ((ALLOWED[key] as readonly unknown[]).includes(value)) (axes as unknown as Record<string, unknown>)[key] = value;
  }
  const font = params.get(PARAM.font);
  if (font && (font === "custom" || FONTS.some((f) => f.id === font))) axes.font = font;
  axes.customFont = sanitizeFontName(params.get(PARAM.customFont) ?? "");
  return axes;
}
