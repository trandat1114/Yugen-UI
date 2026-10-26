import type { YugenBrand, YugenTheme } from "@/components/ui";

/** Cookies read by the server (app/layout.tsx) so the first HTML already has the right data-theme: no flash. */
export const THEME_COOKIE = "yugen-theme";
export const BRAND_COOKIE = "yugen-brand";

export const THEMES: YugenTheme[] = ["light", "dark", "high-contrast"];
export const BRANDS: { value: YugenBrand; label: string }[] = [
  { value: "sakura", label: "Sakura" },
  { value: "web", label: "Web" },
  { value: "teams", label: "Teams" },
];

export const isTheme = (value: string | undefined): value is YugenTheme => THEMES.includes(value as YugenTheme);
export const isBrand = (value: string | undefined): value is YugenBrand => BRANDS.some((b) => b.value === value);

/** One year, the whole site, sent with normal navigations only. */
export function saveCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * First visit (no cookie yet): pick light or dark from the OS before the first paint. Runs only then; afterwards the
 * server renders the saved theme.
 */
export const SYSTEM_THEME_SCRIPT =
  '(function(){try{var d=matchMedia("(prefers-color-scheme: dark)").matches;' +
  'document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();';
