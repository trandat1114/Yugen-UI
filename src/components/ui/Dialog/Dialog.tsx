import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDirection } from "@radix-ui/react-direction";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import { dialogMessages } from "./messages";
import { cn } from "@/lib/cn";

export { dialogMessages, dialogMessagesEn, type DialogMessages } from "./messages";

/** Fluent 2 Dialog — https://fluent2.microsoft.design/components/web/react/core/dialog/usage */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogSurfaceProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** "modal" đóng khi click nền; "alert" bắt buộc chọn hành động. */
  modalType?: "modal" | "alert";
  /** Yugen Labs — bề mặt glass. glass-clear: trên ảnh / media (đặt glass-scrim lên media bên dưới). */
  material?: "glass" | "glass-clear";
}

export const DialogSurface = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogSurfaceProps>(
  ({ className, modalType = "modal", material, onPointerDownOutside, onEscapeKeyDown, ...props }, ref) => {
    // Portal render vào <body>: gắn `dir` để nội dung theo hướng chữ của provider lồng.
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay {...portalTheme} className="fixed inset-0 z-50 bg-overlay animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogPrimitive.Content
          {...portalTheme}
          ref={ref}
          dir={dir}
          role={modalType === "alert" ? "alertdialog" : "dialog"}
          onPointerDownOutside={(e) => {
            if (modalType === "alert") e.preventDefault();
            onPointerDownOutside?.(e);
          }}
          onEscapeKeyDown={(e) => {
            if (modalType === "alert") e.preventDefault();
            onEscapeKeyDown?.(e);
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-48px)] w-[calc(100vw-32px)] max-w-150 -translate-x-1/2 -translate-y-1/2 flex-col gap-2",
            "rounded-xlarge border border-transparent bg-background-1 p-6 text-foreground-1 shadow-64",
            "animate-surface-in data-[state=closed]:animate-surface-out",
            material,
            className,
          )}
          {...props}
        />
      </DialogPrimitive.Portal>
    );
  },
);
DialogSurface.displayName = "DialogSurface";

export function DialogTitle({
  className,
  children,
  action,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  /** Mặc định hiện nút X; truyền `null` để ẩn. */
  action?: React.ReactNode | null;
}) {
  const msg = useYugenMessages("dialog", dialogMessages);
  return (
    <div className="flex items-start gap-2">
      <DialogPrimitive.Title className={cn("flex-1 text-subtitle1 font-semibold", className)} {...props}>
        {children}
      </DialogPrimitive.Title>
      {action === undefined ? (
        <DialogPrimitive.Close
          aria-label={msg.close}
          className="-me-1 inline-flex size-8 shrink-0 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
        >
          <Dismiss24Regular className="size-5" />
        </DialogPrimitive.Close>
      ) : (
        action
      )}
    </div>
  );
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-8 overflow-y-auto text-body1 text-foreground-1", className)} {...props} />;
}

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-body1 text-foreground-1", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export function DialogActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-2 flex flex-wrap justify-end gap-2", className)} {...props} />;
}
