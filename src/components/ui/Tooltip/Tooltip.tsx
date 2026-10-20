import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useDirection } from "@radix-ui/react-direction";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";

/** Fluent 2 Tooltip — https://fluent2.microsoft.design/components/web/react/core/tooltip/usage */
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  appearance?: "normal" | "inverted";
  withArrow?: boolean;
}

export const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(
  ({ className, appearance = "normal", withArrow = true, sideOffset = 4, children, ...props }, ref) => {
    // Portal render vào <body>: gắn `dir` để tooltip theo hướng chữ của provider lồng.
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          {...portalTheme}
          ref={ref}
          dir={dir}
          sideOffset={sideOffset}
          className={cn(
            "z-50 max-w-60 rounded-medium border px-2.75 pt-1.25 pb-1.75 text-caption1 shadow-8",
            "animate-fade-in data-[state=closed]:animate-fade-out",
            appearance === "inverted"
              ? "border-transparent bg-background-inverted text-foreground-inverted"
              : "border-transparent bg-background-1 text-foreground-1",
            className,
          )}
          {...props}
        >
          {children}
          {withArrow && (
            <TooltipPrimitive.Arrow
              width={12}
              height={6}
              className={appearance === "inverted" ? "fill-background-inverted" : "fill-background-1"}
            />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  },
);
TooltipContent.displayName = "TooltipContent";

/** Rút gọn: <SimpleTooltip content="...">{trigger}</SimpleTooltip> */
export function SimpleTooltip({
  content,
  children,
  ...props
}: { content: React.ReactNode; children: React.ReactElement } & Omit<TooltipContentProps, "content">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent {...props}>{content}</TooltipContent>
    </Tooltip>
  );
}
