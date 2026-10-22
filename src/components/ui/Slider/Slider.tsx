import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";

/** Fluent 2 Slider — https://fluent2.microsoft.design/components/web/react/core/slider/usage */
export interface SliderProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "aria-label"> {
  size?: "small" | "medium";
  label?: React.ReactNode;
  /** Nhãn cho trình đọc màn hình khi không có `label` hiển thị. */
  "aria-label"?: string;
  /** Hiện giá trị hiện tại bên phải label. */
  showValue?: boolean;
  rootClassName?: string;
}

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, rootClassName, size = "medium", label, showValue, value, defaultValue, onValueChange, disabled, ...props }, ref) => {
    const labelId = React.useId();
    const [inner, setInner] = React.useState<number[]>(value ?? defaultValue ?? [props.min ?? 0]);
    const current = value ?? inner;
    const small = size === "small";

    return (
      <div className={cn("flex w-full flex-col gap-0.5", rootClassName)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-body1">
            {label && (
              <span id={labelId} className={disabled ? "text-foreground-disabled" : "text-foreground-1"}>
                {label}
              </span>
            )}
            {showValue && <span className="text-foreground-3 tabular-nums">{current.join(" – ")}</span>}
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onValueChange={(v) => {
            setInner(v);
            onValueChange?.(v);
          }}
          className={cn(
            "group/slider relative flex w-full touch-none items-center select-none data-disabled:pointer-events-none",
            small ? "h-6" : "h-8",
            className,
          )}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(
              "relative grow overflow-hidden rounded-circular bg-stroke-accessible group-data-disabled/slider:bg-stroke-disabled",
              small ? "h-0.5" : "h-1",
            )}
          >
            <SliderPrimitive.Range className="absolute h-full bg-brand-background group-data-disabled/slider:bg-foreground-disabled" />
          </SliderPrimitive.Track>
          {current.map((_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              aria-label={props["aria-label"]}
              aria-labelledby={label ? labelId : undefined}
              className={cn(
                "block cursor-grab rounded-circular border border-stroke-1 bg-brand-background active:cursor-grabbing",
                "transition-colors duration-faster ease-easy-ease",
                "hover:bg-brand-background-hover active:bg-brand-background-pressed",
                "group-data-disabled/slider:bg-foreground-disabled group-data-disabled/slider:border-stroke-disabled",
                small
                  ? "size-4 shadow-[inset_0_0_0_3px_var(--colorNeutralBackground1)]"
                  : "size-5 shadow-[inset_0_0_0_4px_var(--colorNeutralBackground1)]",
              )}
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    );
  },
);
Slider.displayName = "Slider";
