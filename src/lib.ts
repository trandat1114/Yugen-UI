/**
 * Yugen UI — npm entry (built with `vite.lib.config.ts`). Library code only; the docs site starts at `src/main.tsx`.
 */
// ".js" explicit: the barrel is inlined into dist/lib.js, so tsc-alias cannot add the extension for the .d.ts.
export * from "./components/ui/index.js";
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
