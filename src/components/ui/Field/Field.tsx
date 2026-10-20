import * as React from "react";
import { ErrorCircle12Filled, CheckmarkCircle12Filled, Warning12Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Field — https://fluent2.microsoft.design/components/web/react/core/field/usage */
export type ValidationState = "none" | "error" | "warning" | "success";

const VALIDATION = {
  error: { icon: ErrorCircle12Filled, className: "text-danger-foreground-1" },
  warning: { icon: Warning12Filled, className: "text-warning-foreground-1" },
  success: { icon: CheckmarkCircle12Filled, className: "text-success-foreground-1" },
} as const;

export interface FieldControlProps {
  id: string;
  /** id của nhãn — dùng cho control dạng nhóm (RadioGroup…) không gắn được qua htmlFor. */
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  validationState?: ValidationState;
  validationMessage?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  size?: "small" | "medium" | "large";
  className?: string;
  /** id cho control; mặc định tự sinh. */
  id?: string;
  /**
   * Control bên trong. Truyền element thường (Field tự gắn id / aria-*), hoặc render-prop
   * `(props) => <MyControl {...props} />` khi control không nhận id trực tiếp.
   */
  children: React.ReactElement | ((props: FieldControlProps) => React.ReactNode);
}

export function Field({
  label,
  hint,
  required,
  disabled,
  validationState = "none",
  validationMessage,
  orientation = "vertical",
  size = "medium",
  className,
  id,
  children,
}: FieldProps) {
  const autoId = React.useId();
  const controlId = id ?? autoId;
  const messageId = `${controlId}-message`;
  const hintId = `${controlId}-hint`;
  const labelId = `${controlId}-label`;
  const validation = validationState !== "none" ? VALIDATION[validationState] : null;

  const controlProps: FieldControlProps = {
    id: controlId,
    "aria-labelledby": label ? labelId : undefined,
    "aria-describedby": cn(validationMessage && messageId, hint && hintId) || undefined,
    "aria-invalid": validationState === "error" || undefined,
    required,
    disabled,
  };

  const control =
    typeof children === "function"
      ? children(controlProps)
      : React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          ...controlProps,
          ...(children.props as Record<string, unknown>),
        });

  return (
    <div
      className={cn(
        orientation === "horizontal" ? "grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-x-M" : "flex flex-col",
        "gap-y-XXS",
        className,
      )}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={controlId}
          className={cn(
            "text-foreground-1",
            size === "small" ? "text-caption1" : size === "large" ? "text-body2 font-semibold" : "text-body1",
            orientation === "vertical" ? "pb-XXS" : "pt-SNudge",
            disabled && "text-foreground-disabled",
          )}
        >
          {label}
          {required && <span className="ps-XS text-danger-foreground-1">*</span>}
        </label>
      )}
      <div className={cn("flex min-w-0 flex-col gap-y-XXS", orientation === "horizontal" && "col-start-2")}>
        {control}
        {validationMessage && (
          <span id={messageId} role={validationState === "error" ? "alert" : undefined} className={cn("flex items-center gap-XS text-caption1", validation?.className ?? "text-foreground-3")}>
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
    </div>
  );
}

/**
 * Class chung cho mọi ô nhập kiểu "outline" của Fluent (Input, Textarea, Select, Dropdown, Combobox…):
 * viền stroke-1, đáy stroke-accessible, thanh brand 2px chạy từ giữa khi focus.
 */
export const fieldControlClass = cn(
  "relative rounded-medium border border-stroke-1 border-b-stroke-accessible bg-background-1 text-foreground-1",
  "hover:border-stroke-1-hover hover:border-b-foreground-2",
  "after:pointer-events-none after:absolute after:-inset-x-px after:-bottom-px after:box-border",
  "after:h-[max(2px,var(--borderRadiusMedium))] after:rounded-b-medium after:border-b-2 after:border-brand-stroke",
  "after:[clip-path:inset(calc(100%-2px)_0_0_0)] after:scale-x-0",
  "after:transition-transform after:duration-faster after:ease-accelerate-mid",
  "focus-within:after:scale-x-100 focus-within:after:duration-normal focus-within:after:ease-decelerate-mid",
  "data-[invalid=true]:border-danger-background-3 data-[invalid=true]:border-b-danger-background-3",
  "data-[disabled=true]:border-stroke-disabled data-[disabled=true]:bg-transparent data-[disabled=true]:text-foreground-disabled data-[disabled=true]:after:hidden",
);
