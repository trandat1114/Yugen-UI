import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/cn";
import { buttonGroupVariants } from "../ButtonGroup/ButtonGroup";
import { toggleButtonVariants, type ToggleButtonAppearance, type ToggleButtonSize } from "../ToggleButton/ToggleButton";

/** ToggleGroup (shadcn/ui, giao diện Fluent 2 ToggleButton) — https://fluent2.microsoft.design/components/web/react/core/togglebutton/usage */
type ToggleGroupAppearance = Exclude<ToggleButtonAppearance, "primary">;

const ToggleGroupContext = React.createContext<{ appearance: ToggleGroupAppearance; size: ToggleButtonSize }>({
  appearance: "secondary",
  size: "medium",
});

export type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
  appearance?: ToggleGroupAppearance;
  size?: ToggleButtonSize;
};

export const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(
  ({ className, appearance = "secondary", size = "medium", orientation = "horizontal", ...props }, ref) => {
    // secondary / outline ghép liền viền; subtle / transparent để rời với khoảng cách nhỏ.
    const joined = appearance === "secondary" || appearance === "outline";
    return (
      <ToggleGroupContext.Provider value={{ appearance, size }}>
        <ToggleGroupPrimitive.Root
          ref={ref}
          orientation={orientation}
          className={cn(
            joined
              ? buttonGroupVariants({ orientation })
              : cn("inline-flex w-fit items-stretch gap-XXS align-middle", orientation === "vertical" && "flex-col"),
            className,
          )}
          {...props}
        />
      </ToggleGroupContext.Provider>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> {
  icon?: React.ReactNode;
}

export const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(
  ({ className, icon, children, ...props }, ref) => {
    const { appearance, size } = React.useContext(ToggleGroupContext);
    const iconOnly = !!icon && !children;
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(toggleButtonVariants({ appearance, size, iconOnly }), !iconOnly && "min-w-0", className)}
        {...props}
      >
        {icon}
        {children}
      </ToggleGroupPrimitive.Item>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
