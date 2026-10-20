import * as React from "react";
import { cn } from "@/lib/cn";

/** Fluent 2 Divider — https://fluent2.microsoft.design/components/web/react/core/divider/usage */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Divider dọc (mặc định ngang). */
  vertical?: boolean;
  /** Vị trí nội dung (chữ / icon) trên đường kẻ. */
  alignContent?: "start" | "center" | "end";
  appearance?: "default" | "subtle" | "brand" | "strong";
  /** Thụt hai đầu 12px. */
  inset?: boolean;
}

const APPEARANCE = {
  default: "text-foreground-2 before:border-stroke-2 after:border-stroke-2",
  subtle: "text-foreground-3 before:border-stroke-3 after:border-stroke-3",
  brand: "text-brand-foreground-1 before:border-brand-stroke after:border-brand-stroke",
  strong: "text-foreground-1 before:border-stroke-1 after:border-stroke-1",
} as const;

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ vertical = false, alignContent = "center", appearance = "default", inset = false, className, children, ...props }, ref) => {
    const hasContent = children != null && children !== false;
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={vertical ? "vertical" : "horizontal"}
        className={cn(
          "box-border flex items-center text-caption1",
          "before:box-border before:flex before:grow after:box-border after:flex after:grow",
          vertical
            ? "min-h-5 shrink-0 grow-0 flex-col self-stretch before:min-h-2 before:border-s after:min-h-2 after:border-s"
            : "w-full grow flex-row before:min-w-2 before:border-t after:min-w-2 after:border-t",
          hasContent && (vertical ? "before:mb-M after:mt-M" : "before:me-M after:ms-M"),
          alignContent === "start" && (vertical ? "before:max-h-2" : "before:max-w-2"),
          alignContent === "end" && (vertical ? "after:max-h-2" : "after:max-w-2"),
          inset && (vertical ? "my-M" : "px-M"),
          APPEARANCE[appearance],
          "[&_svg]:size-4 [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {hasContent && <div className="flex items-center gap-XS">{children}</div>}
      </div>
    );
  },
);
Divider.displayName = "Divider";
