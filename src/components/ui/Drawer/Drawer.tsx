import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDirection } from "@radix-ui/react-direction";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";

/** Fluent 2 Drawer — https://fluent2.microsoft.design/components/web/react/core/drawer/usage */
export type DrawerPosition = "start" | "end" | "bottom";
export type DrawerSize = "small" | "medium" | "large" | "full";

/** Cho DrawerHeaderTitle biết đang ở overlay (Radix Dialog) hay inline (không có Dialog context). */
const DrawerContext = React.createContext<{ type: "overlay" | "inline" }>({ type: "overlay" });

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

/** small 320 · medium 592 · large 940 · full — theo chiều rộng (start/end) hoặc chiều cao (bottom). */
const OVERLAY_WIDTH: Record<DrawerSize, string> = { small: "w-80", medium: "w-148", large: "w-235", full: "w-screen" };
const OVERLAY_HEIGHT: Record<DrawerSize, string> = { small: "h-80", medium: "h-148", large: "h-235", full: "h-dvh" };

const OVERLAY_POSITION: Record<DrawerPosition, string> = {
  start: "inset-y-0 inset-s-0 max-w-screen animate-slide-in-start data-[state=closed]:animate-slide-out-start",
  end: "inset-y-0 inset-e-0 max-w-screen animate-slide-in-end data-[state=closed]:animate-slide-out-end",
  bottom: "inset-x-0 bottom-0 max-h-dvh animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom",
};

export interface DrawerSurfaceProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  position?: DrawerPosition;
  size?: DrawerSize;
  /** "modal" đóng khi click lớp phủ / Esc; "alert" bắt buộc chọn hành động. */
  modalType?: "modal" | "alert";
  /** Yugen Labs — bề mặt glass. glass-clear: trên ảnh / media (đặt glass-scrim lên media bên dưới). */
  material?: "glass" | "glass-clear";
}

/** Bề mặt Drawer dạng overlay (portal + lớp phủ). Đặt trong `<Drawer>`. */
export const DrawerSurface = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DrawerSurfaceProps>(
  (
    { className, position = "end", size = "small", modalType = "modal", material, onPointerDownOutside, onEscapeKeyDown, ...props },
    ref,
  ) => {
    // Portal render vào <body>: gắn `dir` để start/end và animation slide theo hướng chữ của provider lồng.
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay {...portalTheme} className="fixed inset-0 z-50 bg-overlay animate-fade-in data-[state=closed]:animate-fade-out" />
        <DrawerContext.Provider value={{ type: "overlay" }}>
          <DialogPrimitive.Content
            {...portalTheme}
            ref={ref}
            dir={dir}
            role={modalType === "alert" ? "alertdialog" : "dialog"}
            // Drawer thường không có DialogDescription; truyền aria-describedby để gắn mô tả riêng khi cần.
            aria-describedby={undefined}
            onPointerDownOutside={(e) => {
              if (modalType === "alert") e.preventDefault();
              onPointerDownOutside?.(e);
            }}
            onEscapeKeyDown={(e) => {
              if (modalType === "alert") e.preventDefault();
              onEscapeKeyDown?.(e);
            }}
            className={cn(
              "fixed z-50 flex flex-col bg-background-1 text-foreground-1 shadow-64 outline-none",
              "motion-reduce:animate-none",
              OVERLAY_POSITION[position],
              position === "bottom" ? OVERLAY_HEIGHT[size] : OVERLAY_WIDTH[size],
              material,
              className,
            )}
            {...props}
          />
        </DrawerContext.Provider>
      </DialogPrimitive.Portal>
    );
  },
);
DrawerSurface.displayName = "DrawerSurface";

export interface OverlayDrawerProps extends DrawerSurfaceProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Tiện ích kiểu Fluent: `<OverlayDrawer open onOpenChange position size>` = Drawer + DrawerSurface. */
export const OverlayDrawer = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, OverlayDrawerProps>(
  ({ open, defaultOpen, onOpenChange, ...props }, ref) => (
    <Drawer open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DrawerSurface ref={ref} {...props} />
    </Drawer>
  ),
);
OverlayDrawer.displayName = "OverlayDrawer";

/* ------------------------------------------------------------------ inline */

const INLINE_WIDTH: Record<DrawerSize, string> = { small: "w-80", medium: "w-148", large: "w-235", full: "w-full" };
const INLINE_HEIGHT: Record<DrawerSize, string> = { small: "h-80", medium: "h-148", large: "h-235", full: "h-full" };
const SEPARATOR: Record<DrawerPosition, string> = {
  start: "border-e border-stroke-2",
  end: "border-s border-stroke-2",
  bottom: "border-t border-stroke-2",
};

export interface InlineDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  position?: DrawerPosition;
  size?: DrawerSize;
  /** Vạch ngăn `stroke-2` giữa drawer và nội dung. */
  separator?: boolean;
}

/** Drawer nằm trong bố cục (không modal, không lớp phủ) — đẩy nội dung bên cạnh khi mở. */
export const InlineDrawer = React.forwardRef<HTMLDivElement, InlineDrawerProps>(
  ({ open = false, position = "start", size = "small", separator = false, className, children, ...props }, ref) => {
    const vertical = position === "bottom";
    return (
      <DrawerContext.Provider value={{ type: "inline" }}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn(
            "relative flex shrink-0 overflow-hidden bg-background-1 text-foreground-1",
            "transition-[width,height,visibility] duration-normal ease-easy-ease motion-reduce:transition-none",
            vertical ? (open ? INLINE_HEIGHT[size] : "h-0") : open ? INLINE_WIDTH[size] : "w-0",
            !open && "invisible",
            separator && SEPARATOR[position],
            position === "end" && "justify-end",
            className,
          )}
          {...props}
        >
          <div
            className={cn(
              "flex shrink-0 flex-col",
              vertical ? cn("w-full", INLINE_HEIGHT[size]) : cn("h-full", INLINE_WIDTH[size]),
            )}
          >
            {children}
          </div>
        </div>
      </DrawerContext.Provider>
    );
  },
);
InlineDrawer.displayName = "InlineDrawer";

/* ------------------------------------------------------------------ parts */

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 px-6 pt-6 pb-2", className)} {...props} />;
}

export interface DrawerHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Phần tử bên phải tiêu đề, thường là nút đóng. */
  action?: React.ReactNode;
}

export function DrawerHeaderTitle({ className, action, children, ...props }: DrawerHeaderTitleProps) {
  const { type } = React.useContext(DrawerContext);
  const titleClass = cn("min-w-0 flex-1 font-display text-subtitle1 font-semibold text-foreground-1", className);

  return (
    <div className="flex items-start gap-2">
      {type === "overlay" ? (
        <DialogPrimitive.Title className={titleClass} {...props}>
          {children}
        </DialogPrimitive.Title>
      ) : (
        <h2 className={titleClass} {...props}>
          {children}
        </h2>
      )}
      {action && <div className="-me-1 -mt-0.5 flex shrink-0 items-center gap-1">{action}</div>}
    </div>
  );
}

export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-2 text-body1 text-foreground-1", className)} {...props} />
  );
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-2 px-6 pt-4 pb-6", className)} {...props} />;
}
