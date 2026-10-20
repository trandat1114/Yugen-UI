import * as React from "react";

/** Context của YugenProvider — tách riêng để component dùng được mà không import vòng. */
export type YugenTheme = "light" | "dark" | "high-contrast";
export type YugenBrand = "sakura" | "web" | "teams" | (string & {});
export type YugenDir = "ltr" | "rtl";

export interface YugenContextValue {
  theme: YugenTheme;
  brand: YugenBrand;
  dir: YugenDir;
}

const DEFAULT_VALUE: YugenContextValue = { theme: "light", brand: "sakura", dir: "ltr" };
export const YugenContext = React.createContext<(YugenContextValue & { scoped: boolean }) | null>(null);

/** Đọc theme / brand / hướng chữ của YugenProvider gần nhất. */
export function useYugen(): YugenContextValue {
  return React.useContext(YugenContext) ?? DEFAULT_VALUE;
}

/**
 * Thuộc tính cho bề mặt render qua portal (Popover, Menu, Tooltip, Dialog…): portal nằm ở <body> nên
 * không kế thừa theme của YugenProvider lồng — gắn lại data-theme / data-brand / dir lên chính bề mặt.
 * Với provider gốc (applyToDocument) hoặc khi không có provider: trả về {} (đã kế thừa từ <html>).
 */
export function usePortalThemeProps(): { "data-theme"?: YugenTheme; "data-brand"?: string; dir?: YugenDir } {
  const ctx = React.useContext(YugenContext);
  if (!ctx || !ctx.scoped) return {};
  return { "data-theme": ctx.theme, "data-brand": ctx.brand, dir: ctx.dir };
}
