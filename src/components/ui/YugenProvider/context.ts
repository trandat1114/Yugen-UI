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

export interface YugenContextValue {
  theme: YugenTheme;
  brand: YugenBrand;
  dir: YugenDir;
  /** Locale cho Intl (ngày, giờ, số) của component — mặc định "en-US". */
  locale: string;
  /** Mật độ của YugenProvider gần nhất — mặc định "default". */
  density: YugenDensity;
}

type YugenContextInternal = Omit<YugenContextValue, "density"> & {
  density?: YugenDensity;
  scoped: boolean;
  messages?: YugenMessagesInput;
  defaults?: YugenDefaultsInput;
  /** Mật độ do một provider trong chuỗi đặt rõ ràng: bề mặt portal của provider lồng ghi lại thành data-density. */
  densityAttr?: YugenDensity;
};

const DEFAULT_VALUE: YugenContextValue = { theme: "light", brand: "sakura", dir: "ltr", locale: "en-US", density: "default" };
export const YugenContext = React.createContext<YugenContextInternal | null>(null);

/** Đọc theme / brand / hướng chữ / locale / mật độ của YugenProvider gần nhất. */
export function useYugen(): YugenContextValue {
  const ctx = React.useContext(YugenContext);
  if (!ctx) return DEFAULT_VALUE;
  return ctx.density ? (ctx as YugenContextValue) : { ...ctx, density: "default" };
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
  const ctx = React.useContext(YugenContext);
  if (!ctx || !ctx.scoped) return {};
  const props: ReturnType<typeof usePortalThemeProps> = { "data-theme": ctx.theme, "data-brand": ctx.brand, dir: ctx.dir };
  if (ctx.densityAttr) props["data-density"] = ctx.densityAttr;
  return props;
}
