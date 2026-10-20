import { RAMP_STEPS } from "./brandRamp";

/**
 * Xuất brand ramp sang định dạng token cho công cụ thiết kế:
 *   - W3C Design Tokens (DTCG, `$value` / `$type`) — Style Dictionary 4, Figma Variables import, Penpot…
 *   - Tokens Studio for Figma (`value` / `type`, bộ "global" + "light" + "dark").
 * Ngoài 16 bậc ramp còn kèm alias brand theo đúng bảng bậc của Yugen (Design.md §4.3), tham chiếu tới ramp.
 */

/** Bậc ramp cho alias brand: [light, dark]. */
export const BRAND_ALIAS_STEPS = {
  colorBrandForeground1: [80, 100],
  colorBrandForeground2: [70, 120],
  colorBrandForegroundLink: [70, 100],
  colorBrandBackground: [80, 70],
  colorBrandBackgroundHover: [70, 80],
  colorBrandBackgroundPressed: [40, 40],
  colorBrandBackground2: [160, 20],
  colorBrandBackground2Hover: [150, 30],
  colorBrandBackground2Pressed: [130, 10],
  colorCompoundBrandStroke: [80, 100],
  colorBrandStroke2: [140, 50],
} as const satisfies Record<string, readonly [number, number]>;

type Mode = "light" | "dark";

function checkRamp(ramp: readonly string[]) {
  if (ramp.length !== RAMP_STEPS.length) throw new Error(`Ramp cần ${RAMP_STEPS.length} bậc, nhận ${ramp.length}.`);
}

function aliases(mode: Mode, ref: (step: number) => string) {
  const i = mode === "light" ? 0 : 1;
  return Object.fromEntries(Object.entries(BRAND_ALIAS_STEPS).map(([alias, steps]) => [alias, ref(steps[i])])) as Record<
    keyof typeof BRAND_ALIAS_STEPS,
    string
  >;
}

/** W3C Design Tokens Format (DTCG). */
export function rampToDesignTokens(name: string, ramp: readonly string[]) {
  checkRamp(ramp);
  const color = (value: string) => ({ $type: "color", $value: value });
  const ref = (step: number) => `{brand.${name}.${step}}`;
  const alias = (mode: Mode) =>
    Object.fromEntries(Object.entries(aliases(mode, ref)).map(([k, v]) => [k, color(v)]));
  return {
    $description: `Yugen UI brand "${name}" — 16-step ramp and brand aliases`,
    brand: { [name]: Object.fromEntries(RAMP_STEPS.map((step, i) => [String(step), color(ramp[i].toLowerCase())])) },
    light: alias("light"),
    dark: alias("dark"),
  };
}

/** Tokens Studio for Figma (định dạng nhiều bộ: global / light / dark). */
export function rampToTokensStudio(name: string, ramp: readonly string[]) {
  checkRamp(ramp);
  const color = (value: string) => ({ value, type: "color" });
  const ref = (step: number) => `{brand.${name}.${step}}`;
  const alias = (mode: Mode) =>
    Object.fromEntries(Object.entries(aliases(mode, ref)).map(([k, v]) => [k, color(v)]));
  return {
    global: { brand: { [name]: Object.fromEntries(RAMP_STEPS.map((step, i) => [String(step), color(ramp[i].toLowerCase())])) } },
    light: alias("light"),
    dark: alias("dark"),
    $themes: [],
    $metadata: { tokenSetOrder: ["global", "light", "dark"] },
  };
}
