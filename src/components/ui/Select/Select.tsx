/** Fluent 2 Select — https://fluent2.microsoft.design/components/web/react/core/select/usage */
import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDown16Regular, ChevronDown20Regular, ChevronDown24Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { fieldControlClass } from "@/components/ui/Field/Field";

export type FieldAppearance = "outline" | "underline" | "filled-darker" | "filled-lighter";

/**
 * Lớp "vỏ" dùng chung cho các ô nhập kiểu Fluent (Select, Dropdown, Combobox, SpinButton, TagPicker…).
 * Tất cả dựa trên `fieldControlClass` (viền đáy stroke-accessible + thanh brand chạy từ giữa khi focus),
 * chỉ đổi nền/viền theo appearance. Đặt `data-invalid` / `data-disabled` lên phần tử để đổi trạng thái.
 */
export const fieldAppearanceClass: Record<FieldAppearance, string> = {
  outline: fieldControlClass,
  underline: cn(
    fieldControlClass,
    "rounded-none border-transparent border-b-stroke-accessible bg-transparent after:rounded-none",
    "hover:border-transparent hover:border-b-foreground-2",
  ),
  "filled-darker": cn(fieldControlClass, "border-transparent bg-background-3 hover:border-transparent"),
  "filled-lighter": cn(fieldControlClass, "border-transparent bg-background-1 hover:border-transparent"),
};

const selectVariants = cva(
  [
    "peer h-full w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-foreground-1 outline-none",
    "disabled:cursor-not-allowed disabled:text-foreground-disabled",
    "[&_option]:bg-background-1 [&_option]:text-foreground-1 [&_optgroup]:bg-background-1",
  ],
  {
    variants: {
      size: {
        small: "ps-S pe-6 text-caption1",
        medium: "ps-M pe-9 text-body1",
        large: "ps-M pe-11 text-body2",
      },
    },
    defaultVariants: { size: "medium" },
  },
);

const ICON = {
  small: { Icon: ChevronDown16Regular, className: "inset-e-SNudge size-4" },
  medium: { Icon: ChevronDown20Regular, className: "inset-e-MNudge size-5" },
  large: { Icon: ChevronDown24Regular, className: "inset-e-M size-6" },
} as const;

const HEIGHT = { small: "h-6", medium: "h-8", large: "h-10" } as const;

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple"> {
  appearance?: FieldAppearance;
  size?: "small" | "medium" | "large";
  /** Class cho chính thẻ `<select>`; `className` áp vào khung ngoài (đặt width ở đây). */
  selectClassName?: string;
}

/** Select = thẻ `<select>` gốc của trình duyệt được tạo kiểu Fluent — phù hợp form đơn giản và thiết bị di động. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, selectClassName, appearance = "outline", size = "medium", disabled, ...props }, ref) => {
    const icon = ICON[size];
    const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
    return (
      <span
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        className={cn(fieldAppearanceClass[appearance], "inline-flex w-full items-center", HEIGHT[size], className)}
      >
        <select ref={ref} disabled={disabled} className={cn(selectVariants({ size }), selectClassName)} {...props} />
        <icon.Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-foreground-3 peer-disabled:text-foreground-disabled",
            icon.className,
          )}
        />
      </span>
    );
  },
);
Select.displayName = "Select";
