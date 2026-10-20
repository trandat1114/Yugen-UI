import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** ButtonGroup (shadcn/ui, giao diện Fluent 2 Button) — https://ui.shadcn.com/docs/components/button-group */
const buttonGroupVariants = cva(
  [
    "inline-flex w-fit items-stretch align-middle",
    // Phần tử con nổi lên khi hover/focus để viền và vòng focus không bị nút kế bên che.
    "*:relative [&>*:hover]:z-1 [&_*:focus-visible]:relative [&_*:focus-visible]:z-3",
  ],
  {
    variants: {
      orientation: {
        horizontal: [
          "flex-row",
          "[&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none",
          // Hỗ trợ phần tử ghép (SplitButton) — bo góc nằm trên nút con.
          "[&>*:not(:first-child)>*:first-child]:rounded-s-none [&>*:not(:last-child)>*:last-child]:rounded-e-none",
        ],
        vertical: [
          "flex-col",
          "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
          "[&>*:not(:first-child)>*:first-child]:rounded-t-none [&>*:not(:last-child)>*:last-child]:rounded-b-none",
        ],
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof buttonGroupVariants> {}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation ?? "horizontal"}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hướng của vạch chia — ngược với hướng nhóm. */
  orientation?: "vertical" | "horizontal";
  /** `"on-brand"` khi đặt giữa các nút primary. */
  appearance?: "default" | "on-brand";
}

/** Vạch chia giữa các nút trong nhóm (cần thiết cho nút primary/subtle vốn không có viền). */
export const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  ({ className, orientation = "vertical", appearance = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "relative z-2 shrink-0 self-stretch",
        orientation === "vertical" ? "w-px" : "h-px",
        appearance === "on-brand" ? "bg-stroke-on-brand/40" : "bg-stroke-2",
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export { buttonGroupVariants };
