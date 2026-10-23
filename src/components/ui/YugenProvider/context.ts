import * as React from "react";

/** Context của YugenProvider — tách riêng để component dùng được mà không import vòng. */
export type YugenTheme = "light" | "dark" | "high-contrast";
export type YugenBrand = "sakura" | "web" | "teams" | (string & {});
export type YugenDir = "ltr" | "rtl";

/**
 * Chuỗi giao diện có sẵn của mọi component (nhãn nút, aria-label, thông báo cho trình đọc màn hình…), theo namespace của
 * từng component. Interface rỗng ở đây; mỗi component tự thêm namespace của mình trong `<Component>/messages.ts`
 * (`declare module "../YugenProvider/context"`), nên chỉ những component có trong dự án mới có mặt trong kiểu.
 */
export interface YugenMessages {}

/** Ghi đè một phần: chỉ những chuỗi cần đổi, theo namespace (vd. `{ toast: { close: "Close" } }`). */
export type YugenMessagesInput = { [K in keyof YugenMessages]?: Partial<YugenMessages[K]> };

export interface YugenContextValue {
  theme: YugenTheme;
  brand: YugenBrand;
  dir: YugenDir;
  /** Locale cho Intl (ngày, giờ, số) của component — mặc định "vi-VN". */
  locale: string;
}

const DEFAULT_VALUE: YugenContextValue = { theme: "light", brand: "sakura", dir: "ltr", locale: "vi-VN" };
export const YugenContext = React.createContext<(YugenContextValue & { scoped: boolean; messages?: YugenMessagesInput }) | null>(null);

/** Đọc theme / brand / hướng chữ / locale của YugenProvider gần nhất. */
export function useYugen(): YugenContextValue {
  return React.useContext(YugenContext) ?? DEFAULT_VALUE;
}

/**
 * Chuỗi giao diện của một component: mặc định (tiếng Việt) của component, ghi đè bằng `messages` của YugenProvider gần
 * nhất. Prop nhãn riêng của component (vd. `dismissLabel`) vẫn ưu tiên hơn cả hai.
 */
export function useYugenMessages<K extends keyof YugenMessages>(namespace: K, defaults: YugenMessages[K]): YugenMessages[K] {
  const override = React.useContext(YugenContext)?.messages?.[namespace];
  return React.useMemo(() => (override ? (Object.assign({}, defaults, override) as YugenMessages[K]) : defaults), [defaults, override]);
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
