import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { warnDeprecated } from "@/lib/deprecate";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { yugenHtmlAttributes } from "./document";

/** YugenProvider — tương đương FluentProvider: áp theme, brand, hướng chữ cho một cây component. */
import {
  YugenContext,
  YugenThemeContext,
  type YugenBrand,
  type YugenDefaultsInput,
  type YugenDensity,
  type YugenDir,
  type YugenMessagesInput,
  type YugenScrollLock,
  type YugenTheme,
} from "./context";

export {
  useYugen,
  useYugenTheme,
  useYugenLocale,
  useYugenMessages,
  usePortalThemeProps,
  type YugenTheme,
  type YugenBrand,
  type YugenDir,
  type YugenDensity,
  type YugenScrollLock,
  type YugenThemeValue,
  type YugenContextValue,
  type YugenMessages,
  type YugenMessagesInput,
  type YugenComponentDefaults,
  type YugenDefaultsInput,
} from "./context";

/**
 * Toaster của `withToaster` nạp lúc cần (#346): app không bật thì không tải `@radix-ui/react-toast`. Store của toast ở cấp
 * module, nên toast gọi trước khi chunk nạp xong vẫn hiện khi Toaster mount. Chunk không tải được (mất mạng, tab mở từ
 * trước một lần deploy): chỉ thiếu Toaster, lỗi không lan lên làm sập cả cây dưới provider gốc.
 */
const LazyToaster = /* @__PURE__ */ React.lazy(() =>
  import("../Toast/Toast").then(
    (m): { default: React.ComponentType<{ position: "bottom-end" }> } => ({ default: m.Toaster }),
    (error: unknown) => {
      console.error("[yugen-ui] YugenProvider withToaster: the Toaster could not be loaded.", error);
      return { default: NoToaster };
    },
  ),
);
function NoToaster() {
  return null;
}
const subscribeNothing = () => () => {};

/**
 * Server và lượt hydrate không render Toaster (HTML hai phía giống nhau, không có Suspense treo trong renderToString);
 * render client đầu tiên sau đó mới nạp. Toaster không có gì để hiện trước khi JavaScript chạy.
 */
function DeferredToaster() {
  const client = React.useSyncExternalStore(subscribeNothing, () => true, () => false);
  if (!client) return null;
  return (
    <React.Suspense fallback={null}>
      <LazyToaster position="bottom-end" />
    </React.Suspense>
  );
}

export interface YugenProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: YugenTheme;
  brand?: YugenBrand;
  dir?: YugenDir;
  /**
   * true: ghi data-theme / data-brand / dir lên <html> (dùng cho provider gốc của ứng dụng — portal của
   * Dialog, Menu, Tooltip cũng nhận đúng theme). false: chỉ áp cho thẻ div bao ngoài (theme lồng).
   */
  applyToDocument?: boolean;
  /** Gắn sẵn TooltipProvider (mặc định true). */
  withTooltipProvider?: boolean;
  /**
   * Gắn sẵn <Toaster /> để dùng toast() (mặc định false — chỉ bật ở provider gốc). Toaster được nạp riêng sau lần render
   * đầu trên client; toast gọi trước đó vẫn hiện khi nó mount.
   *
   * Recommended: render `<Toaster />` as a child of the root provider instead (the way Radix, shadcn/ui, Chakra and Mantine
   * compose it). The Toaster then ships with your bundle from the first render and you choose its `position` and `limit`.
   * @deprecated Render `<Toaster />` inside the root `YugenProvider`; this prop will be removed in 1.0.0.
   */
  withToaster?: boolean;
  /**
   * Ghi đè chuỗi giao diện có sẵn của component (mặc định tiếng Anh), theo namespace: `messages={messagesVi}` cho tiếng
   * Việt, hoặc chỉ vài chuỗi `{ toast: { close: "Đóng" } }`. Provider lồng kế thừa và ghi đè tiếp lên của provider ngoài.
   */
  messages?: YugenMessagesInput;
  /** Locale cho Intl (ngày, giờ, số) của component, vd. "vi-VN". Mặc định kế thừa provider ngoài, không có thì "en-US". */
  locale?: string;
  /**
   * Props mặc định theo component, vd. `{ Button: { shape: "circular" }, Input: { appearance: "filled-darker" } }`. Prop
   * của instance luôn thắng; provider lồng gộp với provider ngoài theo từng component.
   */
  defaults?: YugenDefaultsInput;
  /**
   * Mật độ: `"compact"` cho control mặc định size small và thu spacing (×0.9375), `"comfortable"` nới spacing (×1.125).
   * Ghi `data-density` lên thẻ bao (và lên <html> khi applyToDocument). Mặc định kế thừa provider ngoài, không có thì
   * `"default"`.
   */
  density?: YugenDensity;
  /**
   * Thanh cuộn của trang khi Menu, ContextMenu, Dropdown đang mở (#243). Các bề mặt này khoá cuộn trang (Radix,
   * react-remove-scroll). `"hide-scrollbar"` (mặc định hiện tại): thanh cuộn ẩn và body được bù lề. `"keep-scrollbar"`:
   * thanh cuộn vẫn hiện, không có gì xê dịch; lăn chuột / vuốt ngoài bề mặt vẫn bị chặn. Chỉ có tác dụng với
   * applyToDocument: ghi `data-yugen-scroll-lock` lên <html> (app không dùng provider tự đặt attribute này).
   * Bản 1.0 sẽ đổi mặc định sang `"keep-scrollbar"`.
   */
  scrollLock?: YugenScrollLock;
}

/**
 * Yugen Labs (#230): `material="glass"` cho mọi component điều hướng có glass, dưới dạng một bộ `defaults`:
 * `<YugenProvider defaults={glassNavigationDefaults}>`, hoặc gộp `{ ...glassNavigationDefaults, Button: { … } }`.
 * Prop `material` của instance vẫn thắng (vd. `"glass-clear"` trên ảnh).
 */
export const glassNavigationDefaults = {
  Toolbar: { material: "glass" },
  TabsList: { material: "glass" },
  Nav: { material: "glass" },
  MenuPopover: { material: "glass" },
  MenuSubPopover: { material: "glass" },
  PopoverSurface: { material: "glass" },
  TooltipContent: { material: "glass" },
  DialogSurface: { material: "glass" },
  DrawerSurface: { material: "glass" },
  SheetContent: { material: "glass" },
} as const;

/** Gộp hai lớp ghi đè theo namespace / tên component (lớp trong thắng). */
function mergeLayers<T extends object>(outer: T | undefined, inner: T | undefined): T | undefined {
  if (!outer || !inner) return inner ?? outer;
  const base = outer as Record<string, object | undefined>;
  const merged = { ...base };
  for (const [key, value] of Object.entries(inner as Record<string, object | undefined>)) merged[key] = { ...base[key], ...value };
  return merged as T;
}

/** Bằng nhau hai tầng (tên component → prop): `defaults={{ … }}` viết thẳng trong JSX không đổi context mỗi lần render. */
function sameLayers(a: object | undefined, b: object | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((key) => {
    const x = (a as Record<string, Record<string, unknown> | undefined>)[key];
    const y = (b as Record<string, Record<string, unknown> | undefined>)[key];
    if (x === y) return true;
    if (!x || !y) return false;
    const kx = Object.keys(x);
    return kx.length === Object.keys(y).length && kx.every((k) => Object.is(x[k], y[k]));
  });
}

/** Giữ object cũ khi object mới bằng nó (theo sameLayers). Mẫu "lưu giá trị của lần render trước" của React. */
function useStableLayers<T extends object | undefined>(value: T): T {
  const [stable, setStable] = React.useState(value);
  const same = sameLayers(stable, value);
  if (!same) setStable(value);
  return same ? stable : value;
}

export function YugenProvider({
  theme = "light",
  brand = "sakura",
  dir = "ltr",
  applyToDocument = false,
  withTooltipProvider = true,
  withToaster = false,
  messages: messagesProp,
  locale: localeProp,
  defaults: defaultsProp,
  density: densityProp,
  scrollLock,
  className,
  children,
  ref,
  ...props
}: YugenProviderProps & { ref?: React.Ref<HTMLDivElement> }) {
  if (withToaster) warnDeprecated("YugenProvider.withToaster", "render <Toaster /> inside the root YugenProvider", "1.0.0");
  const parent = React.useContext(YugenContext);
  const parentTheme = React.useContext(YugenThemeContext);
  // messages={{ … }} / {...messagesVi, …} viết thẳng trong JSX: so theo giá trị như defaults (#347).
  const ownMessages = useStableLayers(messagesProp);
  const messages = React.useMemo(() => mergeLayers(parent?.messages, ownMessages), [parent?.messages, ownMessages]);
  const ownDefaults = useStableLayers(defaultsProp);
  const defaults = React.useMemo(() => mergeLayers(parent?.defaults, ownDefaults), [parent?.defaults, ownDefaults]);
  const locale = localeProp ?? parent?.locale ?? "en-US";
  const density = densityProp ?? parent?.density ?? "default";
  const densityAttr = densityProp ?? parentTheme?.densityAttr;
  // Layout effect: attribute lên <html> trước lần vẽ đầu của client, không nháy theme mặc định (#348).
  useIsomorphicLayoutEffect(() => {
    if (!applyToDocument) return;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(yugenHtmlAttributes({ theme, brand, dir }))) root.setAttribute(name, value);
  }, [applyToDocument, theme, brand, dir]);
  useIsomorphicLayoutEffect(() => {
    if (!applyToDocument || !densityProp) return;
    const root = document.documentElement;
    root.setAttribute("data-density", densityProp);
    return () => root.removeAttribute("data-density");
  }, [applyToDocument, densityProp]);
  useIsomorphicLayoutEffect(() => {
    if (!applyToDocument || !scrollLock) return;
    const root = document.documentElement;
    root.setAttribute("data-yugen-scroll-lock", scrollLock);
    return () => root.removeAttribute("data-yugen-scroll-lock");
  }, [applyToDocument, scrollLock]);

  const value = React.useMemo(() => ({ locale, density, messages, defaults }), [locale, density, messages, defaults]);
  const themeValue = React.useMemo(
    () => ({ theme, brand, dir, densityAttr, scoped: !applyToDocument }),
    [theme, brand, dir, densityAttr, applyToDocument],
  );

  const content = (
    <>
      {children}
      {withToaster && <DeferredToaster />}
    </>
  );

  return (
    <DirectionProvider dir={dir}>
      <YugenThemeContext.Provider value={themeValue}>
        <YugenContext.Provider value={value}>
          <div
            ref={ref}
            {...(applyToDocument ? {} : { "data-theme": theme, "data-brand": brand })}
            data-density={densityProp}
            dir={dir}
            className={cn(!applyToDocument && "bg-background-1 text-foreground-1", className)}
            {...props}
          >
            {withTooltipProvider ? <TooltipProvider delayDuration={300}>{content}</TooltipProvider> : content}
          </div>
        </YugenContext.Provider>
      </YugenThemeContext.Provider>
    </DirectionProvider>
  );
}
