/**
 * Yugen UI — npm entry (built with `vite.lib.config.ts`). Library code only; the docs site starts at `src/main.tsx`.
 */
export * from "./components/ui/index";
export { cn } from "./lib/cn";
export {
  RAMP_STEPS,
  isHexColor,
  hexToOklch,
  oklchToHex,
  relativeLuminance,
  contrastRatio,
  generateBrandRamp,
  adjustKeyForContrast,
  hueDistance,
  rampToCss,
  rampToStyle,
  type Oklch,
  type RampOptions,
} from "./lib/brandRamp";
export { BRAND_ALIAS_STEPS, rampToDesignTokens, rampToTokensStudio } from "./lib/tokenExport";
