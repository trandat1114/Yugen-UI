import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/cn";

/** shadcn ScrollArea (Radix) với thanh cuộn mảnh kiểu Fluent — https://ui.shadcn.com/docs/components/scroll-area */
export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /** Hướng cuộn hiển thị thanh cuộn. */
  orientation?: "vertical" | "horizontal" | "both";
  viewportClassName?: string;
}

export const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(
  ({ className, viewportClassName, orientation = "vertical", type = "hover", children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} type={type} className={cn("relative overflow-hidden", className)} {...props}>
      {/* Vùng cuộn phải focus được để cuộn bằng bàn phím (axe scrollable-region-focusable); outline thụt vào vì Root overflow-hidden. */}
      <ScrollAreaPrimitive.Viewport tabIndex={0} className={cn("size-full rounded-[inherit] -outline-offset-2", viewportClassName)}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
      {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);
ScrollArea.displayName = "ScrollArea";

export const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "z-10 flex touch-none p-0.5 select-none",
      "data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out",
      orientation === "vertical" ? "h-full w-3" : "h-3 flex-col",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb
      className={cn(
        "relative flex-1 rounded-circular bg-stroke-1 transition-colors duration-faster ease-easy-ease hover:bg-stroke-accessible",
        // Vùng bấm tối thiểu 44px cho thumb mảnh.
        "before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2",
      )}
    />
  </ScrollAreaPrimitive.Scrollbar>
));
ScrollBar.displayName = "ScrollBar";
