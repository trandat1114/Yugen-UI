import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { Toaster } from "../Toast/Toast";

/** YugenProvider — tương đương FluentProvider: áp theme, brand, hướng chữ cho một cây component. */
import { YugenContext, type YugenBrand, type YugenDir, type YugenTheme } from "./context";

export { useYugen, usePortalThemeProps, type YugenTheme, type YugenBrand, type YugenDir } from "./context";

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
      className,
      children,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      if (!applyToDocument) return;
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-brand", brand);
      root.setAttribute("dir", dir);
    }, [applyToDocument, theme, brand, dir]);

    const value = React.useMemo(() => ({ theme, brand, dir, scoped: !applyToDocument }), [theme, brand, dir, applyToDocument]);

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
