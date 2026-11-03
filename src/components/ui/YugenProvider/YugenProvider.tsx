import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { Toaster } from "../Toast/Toast";

/** YugenProvider — tương đương FluentProvider: áp theme, brand, hướng chữ cho một cây component. */
import {
  YugenContext,
  type YugenBrand,
  type YugenDefaultsInput,
  type YugenDensity,
  type YugenDir,
  type YugenMessagesInput,
  type YugenTheme,
} from "./context";

export {
  useYugen,
  useYugenMessages,
  usePortalThemeProps,
  type YugenTheme,
  type YugenBrand,
  type YugenDir,
  type YugenDensity,
  type YugenMessages,
  type YugenMessagesInput,
  type YugenComponentDefaults,
  type YugenDefaultsInput,
} from "./context";

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
  /** Gắn sẵn <Toaster /> để dùng toast() (mặc định false — chỉ bật ở provider gốc). */
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
  className,
  children,
  ref,
  ...props
}: YugenProviderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const parent = React.useContext(YugenContext);
  const messages = React.useMemo(() => mergeLayers(parent?.messages, messagesProp), [parent?.messages, messagesProp]);
  const ownDefaults = useStableLayers(defaultsProp);
  const defaults = React.useMemo(() => mergeLayers(parent?.defaults, ownDefaults), [parent?.defaults, ownDefaults]);
  const locale = localeProp ?? parent?.locale ?? "en-US";
  const density = densityProp ?? parent?.density ?? "default";
  const densityAttr = densityProp ?? parent?.densityAttr;
  React.useEffect(() => {
    if (!applyToDocument) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-brand", brand);
    root.setAttribute("dir", dir);
  }, [applyToDocument, theme, brand, dir]);
  React.useEffect(() => {
    if (!applyToDocument || !densityProp) return;
    const root = document.documentElement;
    root.setAttribute("data-density", densityProp);
    return () => root.removeAttribute("data-density");
  }, [applyToDocument, densityProp]);

  const value = React.useMemo(
    () => ({ theme, brand, dir, locale, density, densityAttr, messages, defaults, scoped: !applyToDocument }),
    [theme, brand, dir, locale, density, densityAttr, messages, defaults, applyToDocument],
  );

  const content = (
    <>
      {children}
      {withToaster && <Toaster position="bottom-end" />}
    </>
  );

  return (
    <DirectionProvider dir={dir}>
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
    </DirectionProvider>
  );
}
