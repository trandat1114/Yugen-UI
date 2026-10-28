import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";
import { usePressed } from "../_internal/usePressed";

/** Fluent 2 Switch — https://fluent2.microsoft.design/components/web/react/core/switch/usage */
export interface SwitchProps extends SwitchPrimitive.SwitchProps {
  label?: React.ReactNode;
  labelPosition?: "after" | "before";
  /** Yugen Labs — thumb thành glass và dài ra khi đang nhấn (#210). */
  material?: "glass";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, labelPosition = "after", id, disabled, material, onPointerDown, ...props }, ref) => {
    const autoId = React.useId();
    const switchId = id ?? autoId;
    const pressed = usePressed();
    const lens = material === "glass" && pressed.value;

    return (
      <span
        className={cn(
          // relative: input ẩn của Radix trong <form> nằm trong component (xem Checkbox, #223).
          "group/switch relative inline-flex items-center gap-2 py-1.5",
          labelPosition === "before" && "flex-row-reverse",
        )}
      >
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          disabled={disabled}
          className={cn(
            "peer relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-circular border border-stroke-accessible bg-transparent",
            "transition-colors duration-faster ease-easy-ease",
            "hover:border-foreground-2 group-hover/switch:border-foreground-2",
            "data-[state=checked]:border-transparent data-[state=checked]:bg-brand-background",
            "data-[state=checked]:hover:bg-brand-background-hover data-[state=checked]:active:bg-brand-background-pressed",
            "disabled:cursor-not-allowed disabled:border-stroke-disabled data-[state=checked]:disabled:bg-background-disabled",
            className,
          )}
          {...props}
          onPointerDown={(event) => {
            if (material) pressed.start();
            onPointerDown?.(event);
          }}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block translate-x-0.5 rounded-circular rtl:-translate-x-0.5",
              "transition-[translate,width,height,background-color] duration-normal ease-easy-ease",
              // Glass khi nhấn: thumb dài ra (16 × 24px) và vẫn nằm trong track ở cả hai phía.
              lens
                ? "glass h-4 w-6 shadow-4 data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-3"
                : cn(
                    "size-3.5 bg-foreground-3 group-hover/switch:bg-foreground-2",
                    "data-[state=checked]:translate-x-5.5 data-[state=checked]:bg-foreground-on-brand rtl:data-[state=checked]:-translate-x-5.5",
                    "group-has-disabled/switch:bg-foreground-disabled",
                  ),
            )}
          />
        </SwitchPrimitive.Root>
        {label && (
          <label
            htmlFor={switchId}
            className="cursor-pointer text-body1 text-foreground-1 peer-disabled:cursor-not-allowed peer-disabled:text-foreground-disabled"
          >
            {label}
          </label>
        )}
      </span>
    );
  },
);
Switch.displayName = "Switch";
