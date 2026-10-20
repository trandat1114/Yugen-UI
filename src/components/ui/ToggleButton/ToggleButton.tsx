import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { buttonVariants } from "../Button/Button";

/** Fluent 2 ToggleButton — https://fluent2.microsoft.design/components/web/react/core/togglebutton/usage */
export type ToggleButtonAppearance = "secondary" | "primary" | "outline" | "subtle" | "transparent";
export type ToggleButtonSize = "small" | "medium" | "large";
export type ToggleButtonShape = "rounded" | "circular" | "square";

/** Lớp phủ trạng thái "đang bật" (`data-state=on`) cho từng appearance. */
const toggleCheckedVariants = cva("", {
  variants: {
    appearance: {
      secondary: [
        "data-[state=on]:bg-background-1-pressed data-[state=on]:border-stroke-1-pressed data-[state=on]:text-foreground-1",
        "data-[state=on]:hover:bg-background-1-hover data-[state=on]:hover:border-stroke-1-hover",
        "data-[state=on]:active:bg-background-1-pressed data-[state=on]:active:border-stroke-1-pressed",
        "data-[state=on]:disabled:bg-background-disabled data-[state=on]:disabled:border-stroke-disabled data-[state=on]:disabled:text-foreground-disabled",
      ],
      primary: [
        "data-[state=on]:bg-brand-background-hover data-[state=on]:active:bg-brand-background-pressed",
        "data-[state=on]:disabled:bg-background-disabled data-[state=on]:disabled:border-stroke-disabled data-[state=on]:disabled:text-foreground-disabled",
      ],
      outline: [
        // Viền dày hơn (1px viền + 2px inset ring) mà không làm xê dịch bố cục.
        "data-[state=on]:border-stroke-1-pressed data-[state=on]:inset-ring-2 data-[state=on]:inset-ring-stroke-1-pressed",
        "data-[state=on]:disabled:border-stroke-disabled data-[state=on]:disabled:inset-ring-stroke-disabled",
      ],
      subtle: [
        "data-[state=on]:bg-subtle-pressed data-[state=on]:text-foreground-1 data-[state=on]:[&_svg]:text-brand-foreground-1",
        "data-[state=on]:hover:bg-subtle-hover data-[state=on]:active:bg-subtle-pressed",
        "data-[state=on]:disabled:bg-transparent data-[state=on]:disabled:text-foreground-disabled data-[state=on]:disabled:[&_svg]:text-foreground-disabled",
      ],
      transparent: [
        "data-[state=on]:text-brand-foreground-1",
        "data-[state=on]:disabled:text-foreground-disabled",
      ],
    },
  },
  defaultVariants: { appearance: "secondary" },
});

export interface ToggleButtonVariantOptions {
  appearance?: ToggleButtonAppearance;
  size?: ToggleButtonSize;
  shape?: ToggleButtonShape;
  iconOnly?: boolean;
}

/** Class của ToggleButton (Button + trạng thái bật) — dùng lại cho ToggleGroup, Toolbar. */
export function toggleButtonVariants({ appearance = "secondary", size = "medium", shape = "rounded", iconOnly = false }: ToggleButtonVariantOptions = {}) {
  return cn(buttonVariants({ appearance, size, shape, iconOnly }), toggleCheckedVariants({ appearance }));
}

export interface ToggleButtonProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    "pressed" | "defaultPressed" | "onPressedChange" | "defaultChecked" | "asChild"
  > {
  appearance?: ToggleButtonAppearance;
  size?: ToggleButtonSize;
  shape?: ToggleButtonShape;
  /** Trạng thái bật (controlled). */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  icon?: React.ReactNode;
  /** Icon thay thế khi đang bật (thường là bản Filled của `icon`). */
  checkedIcon?: React.ReactNode;
  iconPosition?: "before" | "after";
  iconOnly?: boolean;
}

export const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      className,
      appearance = "secondary",
      size = "medium",
      shape = "rounded",
      checked,
      defaultChecked = false,
      onCheckedChange,
      icon,
      checkedIcon,
      iconPosition = "before",
      iconOnly,
      children,
      ...props
    },
    ref,
  ) => {
    const [innerChecked, setInnerChecked] = React.useState(defaultChecked);
    const isChecked = checked ?? innerChecked;
    const currentIcon = isChecked && checkedIcon ? checkedIcon : icon;
    const isIconOnly = iconOnly ?? (!!currentIcon && !children);

    return (
      <TogglePrimitive.Root
        ref={ref}
        pressed={isChecked}
        onPressedChange={(next) => {
          if (checked === undefined) setInnerChecked(next);
          onCheckedChange?.(next);
        }}
        className={cn(toggleButtonVariants({ appearance, size, shape, iconOnly: isIconOnly }), className)}
        {...props}
      >
        {currentIcon && iconPosition === "before" && currentIcon}
        {children}
        {currentIcon && iconPosition === "after" && currentIcon}
      </TogglePrimitive.Root>
    );
  },
);
ToggleButton.displayName = "ToggleButton";
