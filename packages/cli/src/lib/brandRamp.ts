/**
 * Sinh brand ramp 16 bậc (brand10 → brand160) kiểu Fluent từ một màu key.
 * Thuật toán: giữ đường cong lightness/chroma OKLCH của ramp Communication Blue (Fluent),
 * thay hue bằng hue của màu key, đặt key ở bậc 80.
 */

const REFERENCE = [
  "#061724", "#082338", "#0a2e4a", "#0c3b5e", "#0e4775", "#0f548c", "#115ea3", "#0f6cbd",
  "#2886de", "#479ef5", "#62abf5", "#77b7f7", "#96c6fa", "#b4d6fa", "#cfe4fa", "#ebf3fc",
];
export const RAMP_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160] as const;

type Rgb = [number, number, number];
export type Oklch = [l: number, c: number, h: number];

export function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

const hexToRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb;
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToLinearRgb([L, C, H]: Oklch): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH → HEX, giảm chroma dần cho tới khi nằm trong gamut sRGB. */
export function oklchToHex([L, C, H]: Oklch): string {
  let chroma = C;
  let rgb = oklchToLinearRgb([L, chroma, H]);
  while (rgb.some((c) => c < -0.0005 || c > 1.0005) && chroma > 0) {
    chroma = Math.max(0, chroma - 0.002);
    rgb = oklchToLinearRgb([L, chroma, H]);
  }
  return (
    "#" +
    rgb
      .map((c) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.max(0, c)))) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const REF = REFERENCE.map(hexToOklch);
const [REF_KEY_L, REF_KEY_C] = REF[7];

export interface RampOptions {
  /** Hệ số độ rực (chroma), 1 = như ramp tham chiếu. */
  vibrancy?: number;
  /** Độ xoắn hue (°) — bậc tối lệch về một phía, bậc sáng lệch về phía ngược lại. */
  hueTorsion?: number;
}

export function generateBrandRamp(keyHex: string, { vibrancy = 1, hueTorsion = 0 }: RampOptions = {}): string[] {
  const [L, C, H] = hexToOklch(keyHex);
  return REF.map(([refL, refC], i) => {
    if (i === 7 && vibrancy === 1) return keyHex.toLowerCase();
    // Giữ đường cong lightness tham chiếu, dời theo độ sáng của key và nhạt dần về hai đầu.
    const t = i < 7 ? i / 7 : (15 - i) / 8;
    const lightness = refL + (L - REF_KEY_L) * t;
    const chroma = refC * (C / REF_KEY_C) * vibrancy;
    const hue = (H + hueTorsion * ((i - 7) / 8) + 360) % 360;
    return oklchToHex([lightness, chroma, hue]);
  });
}

/** Làm tối dần key (giữ hue) tới khi chữ trắng trên nền key đạt `target`. */
export function adjustKeyForContrast(keyHex: string, target = 4.5): string {
  let [L, C, H] = hexToOklch(keyHex);
  let hex = keyHex;
  for (let i = 0; i < 60 && contrastRatio(hex, "#ffffff") < target; i++) {
    L -= 0.01;
    hex = oklchToHex([L, C, H]);
  }
  return hex;
}

/** Khoảng cách hue (°) giữa hai màu. */
export function hueDistance(a: string, b: string) {
  const d = Math.abs(hexToOklch(a)[2] - hexToOklch(b)[2]) % 360;
  return d > 180 ? 360 - d : d;
}

export function rampToCss(name: string, ramp: string[]) {
  const lines = ramp.map((hex, i) => `  --brand-${RAMP_STEPS[i]}: ${hex};`).join("\n");
  return `[data-brand="${name}"] {\n${lines}\n}`;
}

export function rampToStyle(ramp: string[]): Record<string, string> {
  return Object.fromEntries(ramp.map((hex, i) => [`--brand-${RAMP_STEPS[i]}`, hex]));
}
