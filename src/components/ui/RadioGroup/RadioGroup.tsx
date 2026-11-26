/** Fluent 2 RadioGroup — https://fluent2.microsoft.design/components/web/react/core/radiogroup/usage */
import * as React from "react";
import { cn } from "@/lib/cn";
import { useControllableState } from "../hooks/useControllableState";
import { useComponentDefaults } from "../YugenProvider/context";

type RadioLayout = "vertical" | "horizontal" | "horizontal-stacked";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  disabled: boolean;
  required: boolean;
  form: string | undefined;
  layout: RadioLayout;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Name shared by the radios (form field name). Generated when not set. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Id of the `<form>` the radios belong to, when they are outside it. */
  form?: string;
  /** vertical (mặc định), horizontal, horizontal-stacked (label nằm dưới nút). */
  layout?: RadioLayout;
}

/**
 * Native radios sharing one `name` (#357): the browser moves focus and selection with the arrow keys, submits the value with
 * the form and restores it on reset / back navigation.
 */
export function RadioGroup(inProps: RadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    className,
    layout = "vertical",
    value: valueProp,
    defaultValue,
    onValueChange,
    name,
    disabled = false,
    required = false,
    form,
    ref,
    ...props
  } = useComponentDefaults("RadioGroup", inProps);
  const autoName = React.useId();
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });
  const context = React.useMemo<RadioGroupContextValue>(
    () => ({ name: name ?? autoName, value, select: setValue, disabled, required, form, layout }),
    [name, autoName, value, setValue, disabled, required, form, layout],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        ref={ref}
        role="radiogroup"
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        className={cn("flex", layout === "vertical" ? "flex-col items-start" : "flex-row flex-wrap", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "value" | "checked" | "defaultChecked" | "children" | "form"> {
  value: string;
  label?: React.ReactNode;
}

export function Radio({ className, label, id, value, disabled: disabledProp, onChange, ref, ...props }: RadioProps & { ref?: React.Ref<HTMLInputElement> }) {
  const group = React.useContext(RadioGroupContext);
  const autoId = React.useId();
  const radioId = id ?? autoId;
  const layout = group?.layout ?? "vertical";
  const stacked = layout === "horizontal-stacked";
  const checked = group?.value === value;
  const disabled = Boolean(group?.disabled || disabledProp);

  return (
    <span
      className={cn(
        "group/radio relative inline-flex rounded-medium",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        stacked ? "flex-col items-center" : "items-start",
        // Fluent: focus ring bao cả nút + label.
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-0 has-[input:focus-visible]:outline-stroke-focus",
        className,
      )}
    >
      <span className={cn("relative m-2 inline-flex shrink-0", stacked && "mb-0")}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={group?.name}
          form={group?.form}
          value={value}
          checked={checked}
          disabled={disabled}
          required={group?.required}
          data-state={checked ? "checked" : "unchecked"}
          onChange={(event) => {
            onChange?.(event);
            if (event.target.checked) group?.select(value);
          }}
          className={cn(
            "peer m-0 inline-flex size-4 shrink-0 cursor-pointer appearance-none rounded-circular border border-stroke-accessible bg-transparent outline-none",
            "transition-colors duration-faster ease-easy-ease",
            "data-[state=unchecked]:enabled:group-hover/radio:border-foreground-2 data-[state=unchecked]:enabled:active:border-foreground-1",
            "enabled:data-[state=checked]:border-brand-stroke",
            "disabled:cursor-not-allowed disabled:border-stroke-disabled",
          )}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 m-auto hidden size-2.5 rounded-circular bg-brand-stroke",
            "peer-data-[state=checked]:block peer-disabled:bg-foreground-disabled",
          )}
        />
      </span>
      {label && (
        <label
          htmlFor={radioId}
          className={cn(
            "text-body1 transition-colors duration-faster ease-easy-ease",
            disabled
              ? "cursor-not-allowed text-foreground-disabled"
              : checked
                ? "cursor-pointer text-foreground-1"
                : "cursor-pointer text-foreground-3 group-hover/radio:text-foreground-2",
            stacked ? "px-2 pt-1 pb-2 text-center" : "py-2 pe-2 ps-1",
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
    RadioGroup: RadioGroupProps;
  }
}
