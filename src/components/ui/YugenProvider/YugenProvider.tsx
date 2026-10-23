import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { Toaster } from "../Toast/Toast";

/** YugenProvider — tương đương FluentProvider: áp theme, brand, hướng chữ cho một cây component. */
import { YugenContext, type YugenBrand, type YugenDir, type YugenMessagesInput, type YugenTheme } from "./context";

export {
  useYugen,
  useYugenMessages,
  usePortalThemeProps,
  type YugenTheme,
  type YugenBrand,
  type YugenDir,
  type YugenMessages,
  type YugenMessagesInput,
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
   * Ghi đè chuỗi giao diện có sẵn của component (mặc định tiếng Việt), theo namespace: `messages={messagesEn}` cho tiếng
   * Anh, hoặc chỉ vài chuỗi `{ toast: { close: "Close" } }`. Provider lồng kế thừa và ghi đè tiếp lên của provider ngoài.
   */
  messages?: YugenMessagesInput;
  /** Locale cho Intl (ngày, giờ, số) của component, vd. "en-US". Mặc định kế thừa provider ngoài, không có thì "vi-VN". */
  locale?: string;
}

/** Gộp hai lớp ghi đè chuỗi theo namespace (lớp trong thắng). */
function mergeMessages(outer: YugenMessagesInput | undefined, inner: YugenMessagesInput | undefined): YugenMessagesInput | undefined {
  if (!outer || !inner) return inner ?? outer;
  const base = outer as Record<string, object | undefined>;
  const merged = { ...base };
  for (const [key, value] of Object.entries(inner as Record<string, object | undefined>)) merged[key] = { ...base[key], ...value };
  return merged as YugenMessagesInput;
}

export const YugenProvider = React.forwardRef<HTMLDivElement, YugenProviderProps>(
  (
    {
      theme = "light",
      brand = "sakura",
      dir = "ltr",
      applyToDocument = false,
      withTooltipProvider = true,
      withToaster = false,
      messages: messagesProp,
      locale: localeProp,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const parent = React.useContext(YugenContext);
    const messages = React.useMemo(() => mergeMessages(parent?.messages, messagesProp), [parent?.messages, messagesProp]);
    const locale = localeProp ?? parent?.locale ?? "vi-VN";
    React.useEffect(() => {
      if (!applyToDocument) return;
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-brand", brand);
      root.setAttribute("dir", dir);
    }, [applyToDocument, theme, brand, dir]);

    const value = React.useMemo(
      () => ({ theme, brand, dir, locale, messages, scoped: !applyToDocument }),
      [theme, brand, dir, locale, messages, applyToDocument],
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
            dir={dir}
            className={cn(!applyToDocument && "bg-background-1 text-foreground-1", className)}
            {...props}
          >
            {withTooltipProvider ? <TooltipProvider delayDuration={300}>{content}</TooltipProvider> : content}
          </div>
        </YugenContext.Provider>
      </DirectionProvider>
    );
  },
);
YugenProvider.displayName = "YugenProvider";
