import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { useDirection } from "@radix-ui/react-direction";
import {
  CheckmarkCircle20Filled,
  DiamondDismiss20Filled,
  Dismiss20Regular,
  Info20Filled,
  Warning20Filled,
} from "../_internal/icons";
import { useYugenMessages } from "../YugenProvider/context";
import { toastMessagesEn } from "./messages";
import { cn } from "@/lib/cn";
import { dismissToast, getToastSnapshot, subscribeToasts, type ToastRecord } from "./toastStore";

export { toastMessages, toastMessagesVi, toastMessagesEn, type ToastMessages } from "./messages";
// Store tách riêng (#346): import từ đây vẫn chạy như cũ.
export {
  dispatchToast,
  dismissToast,
  dismissAllToasts,
  toast,
  useToast,
  type ToastIntent,
  type ToastActionOptions,
  type ToastOptions,
} from "./toastStore";

/** Fluent 2 Toast — https://fluent2.microsoft.design/components/web/react/core/toast/usage */
export type ToastPosition = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end";

/** Cùng icon / màu với MessageBar. */
const ICON = {
  info: { icon: Info20Filled, className: "text-foreground-3" },
  success: { icon: CheckmarkCircle20Filled, className: "text-success-foreground-1" },
  warning: { icon: Warning20Filled, className: "text-warning-foreground-1" },
  error: { icon: DiamondDismiss20Filled, className: "text-danger-foreground-1" },
} as const;

/* ------------------------------------------------------------------ Toaster */

/** `swipe` theo chiều đọc ("start"/"end"); đổi sang left/right vật lý của Radix trong Toaster theo `useDirection()`. */
const POSITION: Record<ToastPosition, { viewport: string; enter: string; exit: string; swipe: "start" | "end" | "up" | "down" }> = {
  "top-start": {
    viewport: "top-0 inset-s-0 flex-col-reverse",
    enter: "animate-slide-in-start",
    exit: "data-[state=closed]:animate-slide-out-start data-[swipe=end]:animate-slide-out-start",
    swipe: "start",
  },
  top: {
    viewport: "top-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
    enter: "animate-surface-in",
    exit: "data-[state=closed]:animate-fade-out data-[swipe=end]:animate-fade-out",
    swipe: "up",
  },
  "top-end": {
    viewport: "top-0 inset-e-0 flex-col-reverse",
    enter: "animate-slide-in-end",
    exit: "data-[state=closed]:animate-slide-out-end data-[swipe=end]:animate-slide-out-end",
    swipe: "end",
  },
  "bottom-start": {
    viewport: "bottom-0 inset-s-0 flex-col",
    enter: "animate-slide-in-start",
    exit: "data-[state=closed]:animate-slide-out-start data-[swipe=end]:animate-slide-out-start",
    swipe: "start",
  },
  bottom: {
    viewport: "bottom-0 left-1/2 -translate-x-1/2 flex-col items-center",
    enter: "animate-surface-in",
    exit: "data-[state=closed]:animate-fade-out data-[swipe=end]:animate-fade-out",
    swipe: "down",
  },
  "bottom-end": {
    viewport: "bottom-0 inset-e-0 flex-col",
    enter: "animate-slide-in-end",
    exit: "data-[state=closed]:animate-slide-out-end data-[swipe=end]:animate-slide-out-end",
    swipe: "end",
  },
};

export interface ToasterProps {
  /** Vị trí vùng hiển thị toast. */
  position?: ToastPosition;
  /** Chỉ hiển thị toast gửi tới toasterId này (nhiều Toaster trong một app). */
  toasterId?: string;
  /** Số toast hiển thị cùng lúc tối đa. */
  limit?: number;
  className?: string;
}

/** Đặt một lần ở gốc ứng dụng (hoặc trong vùng cần toast riêng với `toasterId`). */
export function Toaster({ position = "bottom-end", toasterId, limit = 5, className }: ToasterProps) {
  const all = React.useSyncExternalStore(subscribeToasts, getToastSnapshot, getToastSnapshot);
  const items = all.filter((t) => t.toasterId === toasterId);
  const msg = useYugenMessages("toast", toastMessagesEn);
  // Giữ nguyên thứ tự DOM; chỉ `limit` toast mở mới nhất được hiển thị, toast đang đóng vẫn render để chạy animation.
  const visibleIds = new Set(
    items
      .filter((t) => t.open)
      .slice(-limit)
      .map((t) => t.id),
  );
  const config = POSITION[position];
  const vertical = config.swipe === "up" || config.swipe === "down";
  const rtl = useDirection() === "rtl";
  const swipeDirection =
    config.swipe === "start" ? (rtl ? "right" : "left") : config.swipe === "end" ? (rtl ? "left" : "right") : config.swipe;

  return (
    <ToastPrimitive.Provider swipeDirection={swipeDirection} label={msg.region}>
      {items
        .filter((t) => !t.open || visibleIds.has(t.id))
        .map((t) => (
          <ToastItem key={t.id} record={t} enter={config.enter} exit={config.exit} vertical={vertical} dismissLabel={msg.dismiss} />
        ))}
      <ToastPrimitive.Viewport
        label={msg.regionHotkey}
        className={cn(
          "fixed z-100 m-0 flex max-h-dvh max-w-screen list-none gap-2 p-4 outline-none",
          config.viewport,
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

function ToastItem({
  record,
  enter,
  exit,
  vertical,
  dismissLabel,
}: {
  record: ToastRecord;
  enter: string;
  exit: string;
  vertical: boolean;
  dismissLabel: string;
}) {
  const { id, open, intent = "info", title, body, action, timeout = 3000, dismissible, hideDismiss } = record;
  const showDismiss = dismissible ?? (hideDismiss === undefined ? true : !hideDismiss);
  const { icon: Icon, className: iconClass } = ICON[intent];

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) dismissToast(id);
      }}
      duration={timeout < 0 ? Infinity : timeout}
      type={intent === "error" || intent === "warning" ? "foreground" : "background"}
      className={cn(
        "pointer-events-auto grid w-80 max-w-[calc(100vw-32px)] grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2",
        "rounded-medium border border-transparent bg-background-1 p-3 text-body1 text-foreground-1 shadow-16",
        enter,
        exit,
        vertical
          ? "data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y) data-[swipe=end]:translate-y-(--radix-toast-swipe-end-y) data-[swipe=cancel]:translate-y-0"
          : "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=cancel]:translate-x-0",
        "data-[swipe=cancel]:transition-[translate] data-[swipe=cancel]:duration-normal data-[swipe=cancel]:ease-decelerate-mid",
        "motion-reduce:animate-none",
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconClass)} />
      <div className="flex min-w-0 flex-col gap-0.5 py-px">
        <div className="flex items-baseline gap-2">
          {title && <ToastPrimitive.Title className="min-w-0 flex-1 font-semibold">{title}</ToastPrimitive.Title>}
          {action && (
            <ToastPrimitive.Action
              altText={action.altText ?? action.label}
              onClick={action.onClick}
              className="shrink-0 rounded-small text-body1 text-link hover:text-link-hover hover:underline"
            >
              {action.label}
            </ToastPrimitive.Action>
          )}
        </div>
        {body && <ToastPrimitive.Description className="text-foreground-1">{body}</ToastPrimitive.Description>}
      </div>
      {!showDismiss ? (
        <span />
      ) : (
        <ToastPrimitive.Close
          aria-label={dismissLabel}
          className="-me-1 -mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
        >
          <Dismiss20Regular className="size-4" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}
