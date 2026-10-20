import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { useDirection } from "@radix-ui/react-direction";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";

/** HoverCard (shadcn/ui) với bề mặt Popover Fluent 2 — https://ui.shadcn.com/docs/components/hover-card */
export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  withArrow?: boolean;
}

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, sideOffset = 6, align = "center", withArrow = false, children, ...props }, ref) => {
  // Portal render vào <body>: gắn `dir` để bề mặt (và căn align start/end) theo hướng chữ của provider lồng.
  const dir = useDirection();
  const portalTheme = usePortalThemeProps();
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        {...portalTheme}
        ref={ref}
        dir={dir}
        sideOffset={sideOffset}
        align={align}
        className={cn(popoverSurfaceClass, "w-80 max-w-[calc(100vw-24px)] p-L", className)}
        {...props}
      >
        {children}
        {withArrow && <HoverCardPrimitive.Arrow width={14} height={7} className="fill-background-1" />}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
});
HoverCardContent.displayName = "HoverCardContent";
