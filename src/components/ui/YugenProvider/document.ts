/**
 * Attribute của <html> cho SSR (#348), không dùng React: Server Component (Next.js App Router layout) gọi được. Bản build
 * không gắn "use client" cho file này (`SERVER_SAFE` trong vite.lib.config.ts); đừng import React hay component vào đây.
 */
import type { YugenBrand, YugenDensity, YugenDir, YugenScrollLock, YugenTheme } from "./context";

export interface YugenHtmlAttributesOptions {
  /** Default `"light"`. */
  theme?: YugenTheme;
  /** Default `"sakura"`. */
  brand?: YugenBrand;
  /** Default `"ltr"`. */
  dir?: YugenDir;
  /** Written as `data-density` when given. */
  density?: YugenDensity;
  /** Written as `data-yugen-scroll-lock` when given. */
  scrollLock?: YugenScrollLock;
}

export interface YugenHtmlAttributes {
  "data-theme": YugenTheme;
  "data-brand": YugenBrand;
  dir: YugenDir;
  "data-density"?: YugenDensity;
  "data-yugen-scroll-lock"?: YugenScrollLock;
}

/**
 * The attributes `<YugenProvider applyToDocument>` writes to `<html>`, for the server to render them in the first HTML:
 * `<html lang="en" {...yugenHtmlAttributes({ theme, brand })}>`. Same defaults as YugenProvider. Plain function, no
 * React: it can be called in a Server Component.
 */
export function yugenHtmlAttributes({
  theme = "light",
  brand = "sakura",
  dir = "ltr",
  density,
  scrollLock,
}: YugenHtmlAttributesOptions = {}): YugenHtmlAttributes {
  const attributes: YugenHtmlAttributes = { "data-theme": theme, "data-brand": brand, dir };
  if (density) attributes["data-density"] = density;
  if (scrollLock) attributes["data-yugen-scroll-lock"] = scrollLock;
  return attributes;
}

export interface YugenThemeScriptOptions {
  /**
   * localStorage key of the saved choice. The value is a theme name (`"dark"`), or JSON with `theme` and optionally
   * `brand` and `dir` (`{"theme":"dark","brand":"web"}`). Default `"yugen-ui-theme"`.
   */
  storageKey?: string;
  /**
   * Theme when nothing valid is saved. `"system"` (default): `"dark"` when the OS prefers a dark color scheme, otherwise
   * `"light"`.
   */
  defaultTheme?: YugenTheme | "system";
  /** With `defaultTheme: "system"`: use `"high-contrast"` when the OS asks for more contrast (`prefers-contrast: more`). Default `true`. */
  highContrast?: boolean;
}

/**
 * Source of a small inline script for `<head>` that sets `data-theme` (and a saved `data-brand` / `dir`) on `<html>`
 * before the first paint, so server-rendered or prerendered pages don't flash the light theme:
 * `<script dangerouslySetInnerHTML={{ __html: yugenThemeScript({ storageKey: "my-app-theme" }) }} />`.
 * Read the attribute back on the client to initialise the `theme` you pass to YugenProvider.
 */
export function yugenThemeScript({ storageKey = "yugen-ui-theme", defaultTheme = "system", highContrast = true }: YugenThemeScriptOptions = {}): string {
  // JSON.stringify cho chuỗi JS hợp lệ; "<" thoát để giá trị không đóng được thẻ <script>.
  const literal = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
  const fallback =
    defaultTheme === "system"
      ? `${highContrast ? 'm("(prefers-contrast: more)")?"high-contrast":' : ""}m("(prefers-color-scheme: dark)")?"dark":"light"`
      : literal(defaultTheme);
  return (
    "(function(){try{var r=document.documentElement,v,t,b,d;" +
    `try{v=window.localStorage.getItem(${literal(storageKey)})}catch(e){}` +
    'if(v&&v.charAt(0)==="{"){try{v=JSON.parse(v);t=v.theme;b=v.brand;d=v.dir}catch(e){}}else t=v;' +
    "var m=function(q){return !!window.matchMedia&&window.matchMedia(q).matches};" +
    `if(t!=="light"&&t!=="dark"&&t!=="high-contrast")t=${fallback};` +
    'r.setAttribute("data-theme",t);' +
    'if(typeof b==="string"&&b)r.setAttribute("data-brand",b);' +
    'if(d==="ltr"||d==="rtl")r.setAttribute("dir",d)' +
    "}catch(e){}})();"
  );
}
