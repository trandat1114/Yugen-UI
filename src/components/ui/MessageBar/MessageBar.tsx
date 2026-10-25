import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckmarkCircle20Filled,
  DiamondDismiss20Filled,
  Info20Filled,
  Warning20Filled,
  Dismiss20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { messageBarMessages } from "./messages";

export { messageBarMessages, messageBarMessagesEn, type MessageBarMessages } from "./messages";

/** Fluent 2 MessageBar — https://fluent2.microsoft.design/components/web/react/core/messagebar/usage */
const messageBarVariants = cva(
  "flex min-h-9 w-full items-start gap-2 rounded-medium border px-3 py-1.5 text-body1 text-foreground-1",
  {
    variants: {
      intent: {
        info: "bg-background-3 border-stroke-2",
        success: "bg-success-background-1 border-success-border-1",
        warning: "bg-warning-background-1 border-warning-border-1",
        error: "bg-danger-background-1 border-danger-border-1",
      },
    },
    defaultVariants: { intent: "info" },
  },
);

const ICON = {
  info: { icon: Info20Filled, className: "text-foreground-3" },
  success: { icon: CheckmarkCircle20Filled, className: "text-success-foreground-1" },
  warning: { icon: Warning20Filled, className: "text-warning-foreground-1" },
  error: { icon: DiamondDismiss20Filled, className: "text-danger-foreground-1" },
} as const;

export interface MessageBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof messageBarVariants> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  layout?: "singleline" | "multiline";
}

export function MessageBar({
  className,
  intent = "info",
  title,
  actions,
  onDismiss,
  layout = "singleline",
  children,
  ...props
}: MessageBarProps) {
  const { icon: Icon, className: iconClass } = ICON[intent ?? "info"];
  const multiline = layout === "multiline";
  const msg = useYugenMessages("messageBar", messageBarMessages);

  return (
    <div
      role={intent === "error" || intent === "warning" ? "alert" : "status"}
      className={cn(messageBarVariants({ intent }), className)}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} />
      <div className={cn("min-w-0 flex-1 py-px", multiline ? "flex flex-col gap-0.5" : "flex flex-wrap items-baseline gap-x-1")}>
        {title && <span className="font-semibold">{title}</span>}
        <span>{children}</span>
        {multiline && actions && <div className="mt-2 flex gap-2">{actions}</div>}
      </div>
      {!multiline && actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={msg.dismiss}
          className="-me-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1"
        >
          <Dismiss20Regular className="size-4" />
        </button>
      )}
    </div>
  );
}
