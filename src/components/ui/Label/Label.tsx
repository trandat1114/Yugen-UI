/** Fluent 2 Label — https://fluent2.microsoft.design/components/web/react/core/label/usage */
import * as React from "react";
import { cn } from "@/lib/cn";
import { cvx } from "@/lib/cvx";
import { useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";

const labelVariants = cvx("text-foreground-1", {
  variants: {
    size: {
      small: "text-caption1",
      medium: "text-body1",
      // Fluent: size large luôn semibold (có thể ghi đè bằng weight="regular").
      large: "text-body2 font-semibold",
    },
    weight: {
      regular: "font-normal",
      semibold: "font-semibold",
    },
    disabled: {
      true: "text-foreground-disabled",
      false: "",
    },
  },
  defaultVariants: { size: "medium", disabled: false },
});

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: "small" | "medium" | "large";
  weight?: "regular" | "semibold";
  /** `true` hiển thị dấu `*` đỏ; truyền ReactNode để thay ký hiệu. */
  required?: boolean | React.ReactNode;
  disabled?: boolean;
}

export function Label(inProps: LabelProps & { ref?: React.Ref<HTMLLabelElement> }) {
  const {
    className,
    size,
    weight,
    required,
    disabled,
    children,
    ref,
    ...props
  } = useComponentDefaults("Label", inProps, COMPACT_SIZE);
  return (
    <label
      ref={ref}
      aria-disabled={disabled || undefined}
      className={labelVariants({ size, weight, disabled: !!disabled, className: [disabled && "cursor-not-allowed", className] })}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className={cn("ps-1", disabled ? "text-foreground-disabled" : "text-danger-foreground-1")}>
          {required === true ? "*" : required}
        </span>
      )}
    </label>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Label: LabelProps;
  }
}
