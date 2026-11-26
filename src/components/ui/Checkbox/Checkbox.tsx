import * as React from "react";
import { Checkmark12Filled, Square12Filled } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useControllableState } from "../hooks/useControllableState";
import { useComponentDefaults } from "../YugenProvider/context";

export type CheckedState = boolean | "indeterminate";

/** Fluent 2 Checkbox — https://fluent2.microsoft.design/components/web/react/core/checkbox/usage */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "checked" | "defaultChecked" | "children"> {
  /** `"indeterminate"` shows a mixed state (some of a group selected). */
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  /** Called with the new state after a click or Space: always a boolean. */
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  size?: "medium" | "large";
  labelPosition?: "after" | "before";
}

const stateOf = (checked: CheckedState) => (checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked");

/**
 * A native `<input type="checkbox">` (#357): one commit to mount and hydrate, form participation, FormData and autofill
 * without a hidden copy. `data-state` stays on the input for styling.
 */
export function Checkbox(inProps: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const {
    className,
    label,
    size = "medium",
    labelPosition = "after",
    id,
    disabled,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    ref,
    ...props
  } = useComponentDefaults("Checkbox", inProps);
  const autoId = React.useId();
  const checkboxId = id ?? autoId;
  const [checked, setChecked] = useControllableState<CheckedState>({ value: checkedProp, defaultValue: defaultChecked });
  const indeterminate = checked === "indeterminate";
  const input = React.useRef<HTMLInputElement>(null);
  const refs = useComposedRefs(ref, input);
  // `indeterminate` is a property, not an attribute: set after mount (data-state draws it before that).
  useIsomorphicLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <span
      className={cn(
        "group/checkbox inline-flex items-center gap-2 py-1.5",
        labelPosition === "before" && "flex-row-reverse",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <span className="relative inline-flex shrink-0">
        <input
          ref={refs}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          checked={checked === true}
          data-state={stateOf(checked)}
          onChange={(event) => {
            onChange?.(event);
            setChecked(event.target.checked);
            onCheckedChange?.(event.target.checked);
            // A click clears the native flag. Still indeterminate after this event (controlled, no update): put it back; a
            // new value re-renders and the layout effect sets the flag from it.
            if (indeterminate) event.target.indeterminate = true;
          }}
          className={cn(
            "peer m-0 inline-flex shrink-0 cursor-pointer appearance-none rounded-small border border-stroke-accessible bg-transparent",
            "transition-colors duration-faster ease-easy-ease",
            size === "large" ? "size-5" : "size-4",
            "hover:border-foreground-2 group-hover/checkbox:border-foreground-2",
            "data-[state=checked]:border-brand-background data-[state=checked]:bg-brand-background",
            "data-[state=checked]:hover:border-brand-background-hover data-[state=checked]:hover:bg-brand-background-hover",
            "data-[state=indeterminate]:border-brand-stroke",
            "disabled:cursor-not-allowed disabled:border-stroke-disabled disabled:bg-transparent",
            "data-[state=checked]:disabled:border-stroke-disabled data-[state=checked]:disabled:bg-transparent",
            className,
          )}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 hidden items-center justify-center",
            "peer-data-[state=checked]:flex peer-data-[state=indeterminate]:flex",
            "text-foreground-on-brand peer-data-[state=indeterminate]:text-brand-foreground-1 peer-disabled:text-foreground-disabled",
          )}
        >
          {indeterminate ? (
            <Square12Filled className={size === "large" ? "size-3" : "size-2"} />
          ) : (
            <Checkmark12Filled className={size === "large" ? "size-4" : "size-3"} />
          )}
        </span>
      </span>
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            size === "large" ? "text-body2" : "text-body1",
            disabled ? "cursor-not-allowed text-foreground-disabled" : "cursor-pointer text-foreground-1",
          )}
        >
          {label}
        </label>
      )}
    </span>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Checkbox: CheckboxProps;
  }
}
