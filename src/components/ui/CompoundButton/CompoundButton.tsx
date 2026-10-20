/** Fluent 2 CompoundButton — https://storybooks.fluentui.dev/react/?path=/docs/components-button-compoundbutton--docs */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import { buttonVariants, type ButtonProps } from "../Button/Button";

type CompoundSize = "small" | "medium" | "large";

/** Cao tự do, icon lớn (32 / 40px), hai dòng chữ. Ghi đè chiều cao/padding của buttonVariants qua cn(). */
const SIZE: Record<CompoundSize, string> = {
  small: "h-auto gap-S p-S text-caption1 [&_svg]:size-8",
  medium: "h-auto gap-M p-M text-body1 [&_svg]:size-10",
  large: "h-auto gap-M p-L text-body2 [&_svg]:size-10",
};

const SECONDARY_SIZE: Record<CompoundSize, string> = {
  small: "text-caption2",
  medium: "text-caption1",
  large: "text-body1",
};

export interface CompoundButtonProps extends ButtonProps {
  /** Dòng mô tả thứ hai (caption, foreground-2). */
  secondaryContent?: React.ReactNode;
}

export const CompoundButton = React.forwardRef<HTMLButtonElement, CompoundButtonProps>(
  (
    {
      className,
      appearance = "secondary",
      size = "medium",
      shape,
      iconOnly,
      icon,
      iconPosition = "before",
      secondaryContent,
      asChild,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = size ?? "medium";
    const onBrand = appearance === "primary" || appearance === "danger";
    const child = asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null;
    const label = child ? child.props.children : children;
    const isIconOnly = iconOnly ?? (!!icon && label == null && secondaryContent == null);

    const classes = cn(
      buttonVariants({ appearance, size: resolvedSize, shape, iconOnly: false }),
      "group/compound font-normal whitespace-normal",
      SIZE[resolvedSize],
      isIconOnly && "min-w-0",
      className,
    );

    const content = (
      <>
        {icon && iconPosition === "before" && icon}
        {!isIconOnly && (
          <span className="flex min-w-0 flex-col items-start text-start">
            <span className="font-semibold">{label}</span>
            {secondaryContent != null && (
              <span
                className={cn(
                  "font-normal",
                  SECONDARY_SIZE[resolvedSize],
                  onBrand ? "text-foreground-on-brand" : "text-foreground-2",
                  "group-disabled/compound:text-foreground-disabled",
                )}
              >
                {secondaryContent}
              </span>
            )}
          </span>
        )}
        {icon && iconPosition === "after" && icon}
      </>
    );

    if (child) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {React.cloneElement(child, undefined, content)}
        </Slot>
      );
    }

    return (
      <button ref={ref} type={type ?? "button"} className={classes} {...props}>
        {content}
      </button>
    );
  },
);
CompoundButton.displayName = "CompoundButton";
