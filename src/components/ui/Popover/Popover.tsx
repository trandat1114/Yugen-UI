import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useDirection } from "@radix-ui/react-direction";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";

/** Fluent 2 Popover — https://fluent2.microsoft.design/components/web/react/core/popover/usage */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

/** Class bề mặt nổi dùng chung (Popover, HoverCard, Combobox listbox, DatePicker…). */
export const popoverSurfaceClass = cn(
  "z-50 rounded-medium border border-transparent bg-background-1 text-foreground-1 shadow-16 outline-none",
  "animate-surface-in data-[state=closed]:animate-fade-out",
);

export interface PopoverSurfaceProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  size?: "small" | "medium" | "large";
  appearance?: "normal" | "brand" | "inverted";
  withArrow?: boolean;
}

const PADDING = { small: "p-2", medium: "p-4", large: "p-5" } as const;
const APPEARANCE = {
  normal: "",
  brand: "bg-brand-background text-foreground-on-brand",
  inverted: "bg-background-inverted text-foreground-inverted",
} as const;
const ARROW = { normal: "fill-background-1", brand: "fill-brand-background", inverted: "fill-background-inverted" } as const;

export const PopoverSurface = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverSurfaceProps>(
  ({ className, size = "medium", appearance = "normal", withArrow = false, sideOffset = 6, align = "center", children, ...props }, ref) => {
    // Portal render vào <body>: gắn `dir` để bề mặt (và căn align start/end) theo hướng chữ của provider lồng.
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          {...portalTheme}
          dir={dir}
          sideOffset={sideOffset}
          align={align}
          className={cn(popoverSurfaceClass, PADDING[size], APPEARANCE[appearance], "max-w-[min(360px,calc(100vw-24px))]", className)}
          {...props}
        >
          {children}
          {withArrow && <PopoverPrimitive.Arrow width={14} height={7} className={ARROW[appearance]} />}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverSurface.displayName = "PopoverSurface";
