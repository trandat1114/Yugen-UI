/** Fluent 2 RadioGroup — https://fluent2.microsoft.design/components/web/react/core/radiogroup/usage */
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";

type RadioLayout = "vertical" | "horizontal" | "horizontal-stacked";

const LayoutContext = React.createContext<RadioLayout>("vertical");

export interface RadioGroupProps extends Omit<RadioGroupPrimitive.RadioGroupProps, "orientation"> {
  /** vertical (mặc định), horizontal, horizontal-stacked (label nằm dưới nút). */
  layout?: RadioLayout;
}

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, layout = "vertical", ...props }, ref) => (
    <LayoutContext.Provider value={layout}>
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn("flex", layout === "vertical" ? "flex-col items-start" : "flex-row flex-wrap", className)}
        {...props}
      />
    </LayoutContext.Provider>
  ),
);
RadioGroup.displayName = "RadioGroup";

export interface RadioProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "children"> {
  label?: React.ReactNode;
}

export const Radio = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const layout = React.useContext(LayoutContext);
    const autoId = React.useId();
    const radioId = id ?? autoId;
    const stacked = layout === "horizontal-stacked";

    return (
      <span
        className={cn(
          "group/radio relative inline-flex cursor-pointer rounded-medium has-[button:disabled]:cursor-not-allowed",
          stacked ? "flex-col items-center" : "items-start",
          // Fluent: focus ring bao cả nút + label.
          "has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-0 has-[button:focus-visible]:outline-stroke-focus",
          className,
        )}
      >
        <RadioGroupPrimitive.Item
          ref={ref}
          id={radioId}
          className={cn(
            "peer m-2 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-circular border border-stroke-accessible bg-transparent outline-none",
            "transition-colors duration-faster ease-easy-ease",
            "data-[state=unchecked]:enabled:group-hover/radio:border-foreground-2 data-[state=unchecked]:enabled:active:border-foreground-1",
            "enabled:data-[state=checked]:border-brand-stroke",
            "disabled:cursor-not-allowed disabled:border-stroke-disabled",
            stacked && "mb-0",
          )}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="size-2.5 rounded-circular bg-brand-stroke data-disabled:bg-foreground-disabled" />
        </RadioGroupPrimitive.Item>
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              "cursor-pointer text-body1 text-foreground-3 transition-colors duration-faster ease-easy-ease",
              "peer-data-[state=unchecked]:group-hover/radio:text-foreground-2 peer-data-[state=checked]:text-foreground-1",
              "peer-disabled:cursor-not-allowed peer-disabled:text-foreground-disabled!",
              stacked ? "px-2 pt-1 pb-2 text-center" : "py-2 pe-2 ps-1",
            )}
          >
            {label}
          </label>
        )}
      </span>
    );
  },
);
Radio.displayName = "Radio";
