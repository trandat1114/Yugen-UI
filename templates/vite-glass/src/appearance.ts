import type * as React from "react";
import type { YugenBrand, YugenTheme } from "yugen-ui";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
  /** glass: translucent bars and menus · solid: the same shapes, opaque (what Reduce transparency shows). */
  material: "glass" | "solid";
  /** Controls over photos: clear (dark, see-through, white text) or regular (follows the theme). */
  overMedia: "clear" | "regular";
}

export const DEFAULT_APPEARANCE: Appearance = { theme: "light", brand: "sakura", material: "glass", overMedia: "clear" };

export const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];
export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

/**
 * "Solid": the tokens Yugen UI switches to when the user turns on Reduce transparency. Set on the app root, so every
 * glass surface inside turns opaque without changing a single component.
 */
export const SOLID_MATERIAL = {
  "--glassFilter": "none",
  "--glassEdgeFilter": "none",
  "--colorGlassBackground": "var(--colorGlassBackgroundSolid)",
  "--colorGlassClearBackground": "var(--colorGlassClearBackgroundSolid)",
  "--colorGlassTinted": "var(--colorBrandBackground)",
} as React.CSSProperties;
