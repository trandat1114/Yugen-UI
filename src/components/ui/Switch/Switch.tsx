import * as React from "react";
import { cn } from "@/lib/cn";
import { usePressed } from "../_internal/usePressed";
import { useControllableState } from "../hooks/useControllableState";
import { useComponentDefaults } from "../YugenProvider/context";

/** Fluent 2 Switch — https://fluent2.microsoft.design/components/web/react/core/switch/usage */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "checked" | "defaultChecked" | "children"> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the new state after a click or Space. */
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  labelPosition?: "after" | "before";
  /** Yugen Labs — thumb thành glass và dài ra khi đang nhấn (#210). */
  material?: "glass";
}

/**
 * A native `<input type="checkbox" role="switch">` (#357): one commit to mount and hydrate, native form participation.
 * `data-state` stays on the input for styling.
 */
export function Switch(inProps: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    className,
    label,
    labelPosition = "after",
    id,
    disabled,
    material,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    onPointerDown,
    ref,
    ...props
  } = useComponentDefaults("Switch", inProps);
  const autoId = React.useId();
  const switchId = id ?? autoId;
  const [checked, setChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked });
  const pressed = usePressed();
  const lens = material === "glass" && pressed.value;

  return (
    <span className={cn("group/switch inline-flex items-center gap-2 py-1.5", labelPosition === "before" && "flex-row-reverse")}>
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={switchId}
          disabled={disabled}
          checked={checked}
          data-state={checked ? "checked" : "unchecked"}
          onChange={(event) => {
            onChange?.(event);
            setChecked(event.target.checked);
            onCheckedChange?.(event.target.checked);
          }}
          onPointerDown={(event) => {
            if (material) pressed.start();
            onPointerDown?.(event);
          }}
          className={cn(
            "peer m-0 inline-flex h-5 w-10 shrink-0 cursor-pointer appearance-none rounded-circular border border-stroke-accessible bg-transparent",
            "transition-colors duration-faster ease-easy-ease",
            "hover:border-foreground-2 group-hover/switch:border-foreground-2",
            "data-[state=checked]:border-transparent data-[state=checked]:bg-brand-background",
            "data-[state=checked]:hover:bg-brand-background-hover data-[state=checked]:active:bg-brand-background-pressed",
            "disabled:cursor-not-allowed disabled:border-stroke-disabled data-[state=checked]:disabled:bg-background-disabled",
            className,
          )}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            // 2px inside the 1px border on each side; the checked offset moves the thumb to the other end.
            "pointer-events-none absolute inset-s-0.75 top-1/2 block -translate-y-1/2 rounded-circular",
            "transition-[translate,width,height,background-color] duration-normal ease-easy-ease",
            // Glass khi nhấn: thumb dài ra (16 × 24px) và vẫn nằm trong track ở cả hai phía.
            lens
              ? "glass h-4 w-6 shadow-4 peer-data-[state=checked]:translate-x-2.5 rtl:peer-data-[state=checked]:-translate-x-2.5"
              : cn(
                  "size-3.5 bg-foreground-3 group-hover/switch:bg-foreground-2",
                  "peer-data-[state=checked]:translate-x-5 peer-data-[state=checked]:bg-foreground-on-brand rtl:peer-data-[state=checked]:-translate-x-5",
                  "peer-disabled:bg-foreground-disabled",
                ),
          )}
        />
      </span>
      {label && (
        <label
          htmlFor={switchId}
          className={cn("text-body1", disabled ? "cursor-not-allowed text-foreground-disabled" : "cursor-pointer text-foreground-1")}
        >
          {label}
        </label>
      )}
    </span>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Switch: SwitchProps;
  }
}
