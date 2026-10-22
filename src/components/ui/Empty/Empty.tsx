import * as React from "react";
import { cn } from "@/lib/cn";

/** Empty state (shadcn/ui) theo ngôn ngữ Fluent 2 — https://ui.shadcn.com/docs/components/empty */
export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** default: không viền · outline: viền nét đứt bo 12px, dùng cho vùng thả / khối trống trong trang. */
  variant?: "default" | "outline";
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(({ variant = "default", className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center text-balance",
      variant === "outline" && "rounded-2xlarge border border-dashed border-stroke-1",
      className,
    )}
    {...props}
  />
));
Empty.displayName = "Empty";

export function EmptyHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex max-w-sm flex-col items-center gap-2", className)} {...props} />;
}

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** icon: đặt icon trong ô 48px nền background-4 · default: giữ nguyên (Avatar, ảnh minh hoạ…). */
  variant?: "icon" | "default";
}

export function EmptyMedia({ variant = "icon", className, ...props }: EmptyMediaProps) {
  return (
    <div
      className={cn(
        "mb-1 flex shrink-0 items-center justify-center",
        variant === "icon" && "size-12 rounded-xlarge bg-background-4 text-foreground-2 [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-subtitle1 font-semibold text-foreground-1", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-body1 text-foreground-3 [&_a]:text-link [&_a]:underline [&_a:hover]:text-link-hover", className)}
      {...props}
    />
  );
}

/** Vùng hành động (Button, Link…) bên dưới tiêu đề. */
export function EmptyContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full max-w-sm flex-wrap items-center justify-center gap-2", className)} {...props} />;
}
