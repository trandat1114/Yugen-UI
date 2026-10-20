import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Fluent 2 Badge — https://fluent2.microsoft.design/components/web/react/core/badge/usage */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center border font-semibold whitespace-nowrap [&_svg]:shrink-0",
  {
    variants: {
      appearance: {
        filled: "border-transparent",
        tint: "",
        outline: "bg-transparent",
        ghost: "border-transparent bg-transparent",
      },
      color: {
        brand: "",
        danger: "",
        success: "",
        warning: "",
        informative: "",
        subtle: "",
      },
      size: {
        small: "h-4 min-w-4 gap-XXS px-XXS text-caption2 [&_svg]:size-3",
        medium: "h-5 min-w-5 gap-XXS px-XS text-caption1 [&_svg]:size-3",
        large: "h-6 min-w-6 gap-XXS px-XS text-caption1 [&_svg]:size-4",
        "extra-large": "h-8 min-w-8 gap-XS px-S text-body1 [&_svg]:size-5",
      },
      shape: {
        circular: "rounded-circular",
        rounded: "rounded-medium",
        square: "rounded-none",
      },
    },
    compoundVariants: [
      { appearance: "filled", color: "brand", class: "bg-brand-background text-foreground-on-brand" },
      { appearance: "filled", color: "danger", class: "bg-danger-background-3 text-foreground-on-brand" },
      { appearance: "filled", color: "success", class: "bg-success-background-3 text-foreground-on-brand" },
      // Nền cam sáng: chữ trắng chỉ ~3.1:1 → chữ tối cố định như Fluent (≥ 4.9:1 ở light lẫn dark).
      { appearance: "filled", color: "warning", class: "bg-warning-background-3 text-foreground-1-static" },
      { appearance: "filled", color: "informative", class: "bg-background-5 text-foreground-3" },
      { appearance: "filled", color: "subtle", class: "bg-background-1 text-foreground-1" },

      { appearance: "tint", color: "brand", class: "bg-brand-background-2 border-brand-stroke/30 text-brand-foreground-2" },
      { appearance: "tint", color: "danger", class: "bg-danger-background-1 border-danger-border-1 text-danger-foreground-1" },
      { appearance: "tint", color: "success", class: "bg-success-background-1 border-success-border-1 text-success-foreground-1" },
      { appearance: "tint", color: "warning", class: "bg-warning-background-1 border-warning-border-1 text-warning-foreground-1" },
      { appearance: "tint", color: "informative", class: "bg-background-4 border-stroke-2 text-foreground-3" },
      { appearance: "tint", color: "subtle", class: "bg-background-1 border-stroke-2 text-foreground-3" },

      { appearance: "outline", color: "brand", class: "border-current text-brand-foreground-1" },
      { appearance: "outline", color: "danger", class: "border-current text-danger-foreground-1" },
      { appearance: "outline", color: "success", class: "border-current text-success-foreground-1" },
      { appearance: "outline", color: "warning", class: "border-current text-warning-foreground-1" },
      { appearance: "outline", color: "informative", class: "border-stroke-2 text-foreground-3" },
      { appearance: "outline", color: "subtle", class: "border-stroke-2 text-foreground-2" },

      { appearance: "ghost", color: "brand", class: "text-brand-foreground-1" },
      { appearance: "ghost", color: "danger", class: "text-danger-foreground-1" },
      { appearance: "ghost", color: "success", class: "text-success-foreground-1" },
      { appearance: "ghost", color: "warning", class: "text-warning-foreground-1" },
      { appearance: "ghost", color: "informative", class: "text-foreground-3" },
      { appearance: "ghost", color: "subtle", class: "text-foreground-2" },
    ],
    defaultVariants: { appearance: "filled", color: "brand", size: "medium", shape: "circular" },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, appearance, color, size, shape, icon, children, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ appearance, color, size, shape }), className)} {...props}>
      {icon}
      {children != null && <span className="px-XXS">{children}</span>}
    </span>
  ),
);
Badge.displayName = "Badge";
