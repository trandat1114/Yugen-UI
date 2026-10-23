import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Checkmark12Filled, Square12Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Checkbox — https://fluent2.microsoft.design/components/web/react/core/checkbox/usage */
export interface CheckboxProps extends CheckboxPrimitive.CheckboxProps {
  label?: React.ReactNode;
  size?: "medium" | "large";
  labelPosition?: "after" | "before";
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, size = "medium", labelPosition = "after", id, disabled, ...props }, ref) => {
    const autoId = React.useId();
    const checkboxId = id ?? autoId;

    return (
      <span
        className={cn(
          "group/checkbox inline-flex items-center gap-2 py-1.5",
          labelPosition === "before" && "flex-row-reverse",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          disabled={disabled}
          className={cn(
            "peer inline-flex shrink-0 items-center justify-center rounded-small border border-stroke-accessible bg-transparent text-foreground-on-brand",
            "transition-colors duration-faster ease-easy-ease",
            size === "large" ? "size-5" : "size-4",
            "hover:border-foreground-2 group-hover/checkbox:border-foreground-2",
            "data-[state=checked]:border-brand-background data-[state=checked]:bg-brand-background",
            "data-[state=checked]:hover:border-brand-background-hover data-[state=checked]:hover:bg-brand-background-hover",
            "data-[state=indeterminate]:border-brand-stroke data-[state=indeterminate]:text-brand-foreground-1",
            "disabled:border-stroke-disabled disabled:bg-transparent disabled:text-foreground-disabled",
            "data-[state=checked]:disabled:border-stroke-disabled data-[state=checked]:disabled:bg-transparent",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex">
            {props.checked === "indeterminate" ? (
              <Square12Filled className={size === "large" ? "size-3" : "size-2"} />
            ) : (
              <Checkmark12Filled className={size === "large" ? "size-4" : "size-3"} />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-foreground-1 peer-disabled:text-foreground-disabled",
              size === "large" ? "text-body2" : "text-body1",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            {label}
          </label>
        )}
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
