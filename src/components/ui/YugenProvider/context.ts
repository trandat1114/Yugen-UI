import * as React from "react";

/** Context của YugenProvider — tách riêng để component dùng được mà không import vòng. */
export type YugenTheme = "light" | "dark" | "high-contrast";
export type YugenBrand = "sakura" | "web" | "teams" | (string & {});
export type YugenDir = "ltr" | "rtl";
/**
 * Mật độ giao diện (#171). `compact`: control mặc định size small, spacing nhân 0.9375; `comfortable`: spacing nhân 1.125;
 * `default`: như hiện tại. Spacing đổi qua CSS (`data-density`), size mặc định qua `useComponentDefaults`.
 */
export type YugenDensity = "compact" | "default" | "comfortable";
/** Thanh cuộn của trang khi Menu, ContextMenu, Dropdown khoá cuộn (#243). */
export type YugenScrollLock = "hide-scrollbar" | "keep-scrollbar";

/**
 * Chuỗi giao diện có sẵn của mọi component (nhãn nút, aria-label, thông báo cho trình đọc màn hình…), theo namespace của
 * từng component. Interface rỗng ở đây; mỗi component tự thêm namespace của mình trong `<Component>/messages.ts`
 * (`declare module "../YugenProvider/context"`), nên chỉ những component có trong dự án mới có mặt trong kiểu.
 */
export interface YugenMessages {}

/** Ghi đè một phần: chỉ những chuỗi cần đổi, theo namespace (vd. `{ toast: { close: "Close" } }`). */
export type YugenMessagesInput = { [K in keyof YugenMessages]?: Partial<YugenMessages[K]> };

/**
 * Props mặc định theo component, đặt bằng `YugenProvider defaults` (#171). Interface rỗng ở đây; mỗi component tự thêm
 * mục của mình trong file của nó (`declare module "../YugenProvider/context"`), như `YugenMessages`.
 */
export interface YugenComponentDefaults {}

/** Props mặc định theo tên component, vd. `{ Button: { size: "small" }, Input: { appearance: "filled-darker" } }`. */
export type YugenDefaultsInput = { [K in keyof YugenComponentDefaults]?: Partial<YugenComponentDefaults[K]> };

/** Theme, brand and text direction of the nearest YugenProvider (`useYugenTheme()`). */
export interface YugenThemeValue {
  theme: YugenTheme;
  brand: YugenBrand;
  dir: YugenDir;
}

export interface YugenContextValue extends YugenThemeValue {
  /** Locale cho Intl (ngày, giờ, số) của component — mặc định "en-US". */
  locale: string;
  /** Mật độ của YugenProvider gần nhất — mặc định "default". */
  density: YugenDensity;
}

/**
 * Hai context (#347): theme đổi thì chỉ phần đọc theme render lại (bề mặt portal, Chart, CodeBlock), không phải mọi
 * control đọc `defaults` / `messages`. Đổi theme chỉ cần CSS (`data-theme`), nên control thường không đăng ký theme.
 */
type YugenThemeInternal = YugenThemeValue & {
  scoped: boolean;
  /** Mật độ do một provider trong chuỗi đặt rõ ràng: bề mặt portal của provider lồng ghi lại thành data-density. */
  densityAttr?: YugenDensity;
};

type YugenContextInternal = {
  locale: string;
  density?: YugenDensity;
  messages?: YugenMessagesInput;
  defaults?: YugenDefaultsInput;
};

const DEFAULT_THEME: YugenThemeValue = { theme: "light", brand: "sakura", dir: "ltr" };
const DEFAULT_VALUE: YugenContextValue = { ...DEFAULT_THEME, locale: "en-US", density: "default" };
/** Locale, density, messages, defaults. */
export const YugenContext = React.createContext<YugenContextInternal | null>(null);
/** Theme, brand, dir, scoped, density attribute. */
export const YugenThemeContext = React.createContext<YugenThemeInternal | null>(null);

/**
 * Đọc theme / brand / hướng chữ / locale / mật độ của YugenProvider gần nhất. Đăng ký cả hai context: component chỉ cần
 * theme hoặc locale thì dùng `useYugenTheme()` / `useYugenLocale()` để không render lại khi phần kia đổi.
 */
export function useYugen(): YugenContextValue {
  const theme = React.useContext(YugenThemeContext);
  const config = React.useContext(YugenContext);
  return React.useMemo(() => {
    if (!theme && !config) return DEFAULT_VALUE;
    const { theme: t, brand, dir } = theme ?? DEFAULT_THEME;
    return { theme: t, brand, dir, locale: config?.locale ?? "en-US", density: config?.density ?? "default" };
  }, [theme, config]);
}

/**
 * Theme, brand and text direction of the nearest YugenProvider. Unlike `useYugen()`, it does not re-render when the
 * locale, messages or defaults change. Without a provider: `{ theme: "light", brand: "sakura", dir: "ltr" }`.
 */
export function useYugenTheme(): YugenThemeValue {
  const ctx = React.useContext(YugenThemeContext);
  return React.useMemo(() => (ctx ? { theme: ctx.theme, brand: ctx.brand, dir: ctx.dir } : DEFAULT_THEME), [ctx]);
}

/**
 * Intl locale of the nearest YugenProvider (`"en-US"` without one). Unlike `useYugen()`, it does not re-render when the
 * theme, brand or text direction change.
 */
export function useYugenLocale(): string {
  return React.useContext(YugenContext)?.locale ?? "en-US";
}

/**
 * Chuỗi giao diện của một component: mặc định (tiếng Anh) của component, ghi đè bằng `messages` của YugenProvider gần
 * nhất. Prop nhãn riêng của component (vd. `dismissLabel`) vẫn ưu tiên hơn cả hai.
 */
export function useYugenMessages<K extends keyof YugenMessages>(namespace: K, defaults: YugenMessages[K]): YugenMessages[K] {
  const override = React.useContext(YugenContext)?.messages?.[namespace];
  return React.useMemo(() => (override ? (Object.assign({}, defaults, override) as YugenMessages[K]) : defaults), [defaults, override]);
}

/** Mặc định của control ở mật độ compact: size small (prop size của instance hoặc `defaults` vẫn thắng). */
export const COMPACT_SIZE = { size: "small" } as const;

/**
 * Props của component sau khi điền mặc định (#171). Thứ tự ưu tiên: prop của instance → `defaults[name]` của YugenProvider
 * gần nhất (provider lồng gộp với provider ngoài) → `compact` khi `density="compact"` → mặc định của chính component.
 * Một lần đọc context; không có provider hoặc không có mặc định nào thì trả lại đúng object `props`.
 */
export function useComponentDefaults<K extends keyof YugenComponentDefaults, P extends object>(
  name: K,
  props: P,
  compact?: Partial<P>,
): P {
  const ctx = React.useContext(YugenContext);
  if (!ctx) return props;
  const own = ctx.defaults?.[name] as Partial<P> | undefined;
  const dense = ctx.density === "compact" ? compact : undefined;
  if (!own && !dense) return props;
  let out: Record<string, unknown> | undefined;
  for (const layer of [own, dense]) {
    if (!layer) continue;
    for (const key in layer) {
      const value = (layer as Record<string, unknown>)[key];
      if (value === undefined || (out ?? (props as Record<string, unknown>))[key] !== undefined) continue;
      out ??= { ...props } as Record<string, unknown>;
      out[key] = value;
    }
  }
  return (out as P | undefined) ?? props;
}

/**
 * Thuộc tính cho bề mặt render qua portal (Popover, Menu, Tooltip, Dialog…): portal nằm ở <body> nên
 * không kế thừa theme của YugenProvider lồng — gắn lại data-theme / data-brand / dir (và data-density nếu provider đặt)
 * lên chính bề mặt. Với provider gốc (applyToDocument) hoặc khi không có provider: trả về {} (đã kế thừa từ <html>).
 */
export function usePortalThemeProps(): { "data-theme"?: YugenTheme; "data-brand"?: string; dir?: YugenDir; "data-density"?: YugenDensity } {
  const ctx = React.useContext(YugenThemeContext);
  if (!ctx || !ctx.scoped) return {};
  const props: ReturnType<typeof usePortalThemeProps> = { "data-theme": ctx.theme, "data-brand": ctx.brand, dir: ctx.dir };
  if (ctx.densityAttr) props["data-density"] = ctx.densityAttr;
  return props;
}
