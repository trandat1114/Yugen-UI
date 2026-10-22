import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ErrorCircle12Filled, CheckmarkCircle12Filled, Warning12Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Input + Field — https://fluent2.microsoft.design/components/web/react/core/input/usage */
const inputRootVariants = cva(
  [
    "relative inline-flex w-full items-center text-foreground-1",
    // Fluent focus indicator: thanh brand 2px ở đáy, scale từ giữa ra.
    "after:pointer-events-none after:absolute after:-inset-x-px after:-bottom-px after:box-border",
    "after:h-[max(2px,var(--borderRadiusMedium))] after:rounded-b-medium after:border-b-2 after:border-brand-stroke",
    "after:[clip-path:inset(calc(100%-2px)_0_0_0)] after:scale-x-0",
    "after:transition-transform after:duration-faster after:ease-accelerate-mid",
    "focus-within:after:scale-x-100 focus-within:after:duration-normal focus-within:after:ease-decelerate-mid",
    "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:after:hidden",
  ],
  {
    variants: {
      appearance: {
        outline: [
          "rounded-medium border border-stroke-1 border-b-stroke-accessible bg-background-1",
          "hover:border-stroke-1-hover hover:border-b-foreground-2 focus-within:border-stroke-1",
        ],
        underline: "rounded-none border-b border-stroke-accessible bg-transparent after:rounded-none",
        "filled-darker": "rounded-medium border border-transparent bg-background-3",
        "filled-lighter": "rounded-medium border border-transparent bg-background-1",
      },
      size: {
        small: "h-6 gap-0.5 px-1 text-caption1 [&_svg]:size-4",
        medium: "h-8 gap-0.5 px-2.5 text-body1 [&_svg]:size-5",
        large: "h-10 gap-1 px-3 text-body2 [&_svg]:size-6",
      },
      invalid: {
        true: "border-danger-background-3 hover:border-danger-background-3 border-b-danger-background-3 hover:border-b-danger-background-3",
        false: "",
      },
    },
    defaultVariants: { appearance: "outline", size: "medium", invalid: false },
  },
);

type ValidationState = "none" | "error" | "warning" | "success";

const VALIDATION = {
  error: { icon: ErrorCircle12Filled, className: "text-danger-foreground-1" },
  warning: { icon: Warning12Filled, className: "text-warning-foreground-1" },
  success: { icon: CheckmarkCircle12Filled, className: "text-success-foreground-1" },
} as const;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<VariantProps<typeof inputRootVariants>, "invalid"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  validationState?: ValidationState;
  validationMessage?: React.ReactNode;
  contentBefore?: React.ReactNode;
  contentAfter?: React.ReactNode;
  rootClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      rootClassName,
      appearance,
      size,
      label,
      hint,
      validationState = "none",
      validationMessage,
      contentBefore,
      contentAfter,
      required,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;
    const hintId = `${inputId}-hint`;
    const validation = validationState !== "none" ? VALIDATION[validationState] : null;

    return (
      <div className={cn("flex flex-col gap-0.5", rootClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn("pb-0.5 text-body1 text-foreground-1", disabled && "text-foreground-disabled")}
          >
            {label}
            {required && <span className="ps-1 text-danger-foreground-1">*</span>}
          </label>
        )}
        <span
          className={cn(
            inputRootVariants({ appearance, size, invalid: validationState === "error" }),
            disabled && "border-stroke-disabled bg-transparent text-foreground-disabled hover:border-stroke-disabled",
            className,
          )}
        >
          {contentBefore && <span className="flex text-foreground-3">{contentBefore}</span>}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={validationState === "error" || undefined}
            aria-describedby={cn(validationMessage && messageId, hint && hintId) || undefined}
            className="h-full w-full min-w-0 grow bg-transparent px-0.5 outline-none placeholder:text-foreground-4 disabled:cursor-not-allowed"
            {...props}
          />
          {contentAfter && <span className="flex text-foreground-3">{contentAfter}</span>}
        </span>
        {validationMessage && (
          <span
            id={messageId}
            className={cn("flex items-center gap-1 text-caption1", validation?.className ?? "text-foreground-3")}
          >
            {validation && <validation.icon className="shrink-0" />}
            <span className={validationState === "error" ? undefined : "text-foreground-3"}>{validationMessage}</span>
          </span>
        )}
        {hint && (
          <span id={hintId} className="text-caption1 text-foreground-3">
            {hint}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
