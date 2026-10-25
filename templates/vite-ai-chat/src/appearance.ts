import type { YugenBrand, YugenTheme } from "yugen-ui";

export interface Appearance {
  theme: YugenTheme;
  brand: YugenBrand;
}

export const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];
export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];
