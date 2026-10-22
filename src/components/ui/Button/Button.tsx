import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner, type SpinnerSize } from "../Spinner/Spinner";

/** Fluent 2 Button — https://fluent2.microsoft.design/components/web/react/core/button/usage */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap border align-middle select-none",
    "transition-[background-color,border-color,color] duration-faster ease-easy-ease",
    "disabled:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      appearance: {
        secondary: [
          "bg-background-1 border-stroke-1 text-foreground-1",
          "hover:bg-background-1-hover hover:border-stroke-1-hover",
          "active:bg-background-1-pressed active:border-stroke-1-pressed",
          "disabled:bg-background-disabled disabled:border-stroke-disabled disabled:text-foreground-disabled",
        ],
        primary: [
          "bg-brand-background border-transparent text-foreground-on-brand",
          "hover:bg-brand-background-hover active:bg-brand-background-pressed",
          "disabled:bg-background-disabled disabled:border-stroke-disabled disabled:text-foreground-disabled",
        ],
        outline: [
          "bg-transparent border-stroke-1 text-foreground-1",
          "hover:border-stroke-1-hover active:border-stroke-1-pressed",
          "disabled:border-stroke-disabled disabled:text-foreground-disabled",
        ],
        subtle: [
          "bg-transparent border-transparent text-foreground-2",
          "hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
          "disabled:text-foreground-disabled",
        ],
        transparent: [
          "bg-transparent border-transparent text-foreground-2",
          "hover:text-brand-foreground-2 active:text-brand-foreground-1",
          "disabled:text-foreground-disabled",
        ],
        danger: [
          "bg-danger-background-3 border-transparent text-foreground-on-brand",
          "hover:brightness-110 active:brightness-90",
          "disabled:bg-background-disabled disabled:border-stroke-disabled disabled:text-foreground-disabled",
        ],
      },
      size: {
        small: "h-6 min-w-16 gap-1 rounded-small px-2 text-caption1 [&_svg]:size-4",
        medium: "h-8 min-w-24 gap-1.5 rounded-medium px-3 text-body1 font-semibold [&_svg]:size-5",
        large: "h-10 min-w-24 gap-1.5 rounded-large px-4 text-body2 font-semibold [&_svg]:size-6",
      },
      shape: {
        rounded: "",
        circular: "rounded-circular",
        square: "rounded-none",
      },
      iconOnly: {
        true: "min-w-0 px-0",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "small", class: "w-6" },
      { iconOnly: true, size: "medium", class: "w-8" },
      { iconOnly: true, size: "large", class: "w-10" },
    ],
    defaultVariants: { appearance: "secondary", size: "medium", shape: "rounded", iconOnly: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "before" | "after";
  /**
   * Đang xử lý: Spinner thay chỗ icon (nút không có icon: Spinner ở giữa, nhãn vẫn giữ chỗ), độ rộng không đổi,
   * `aria-busy` + `aria-disabled`, bỏ qua click nhưng vẫn focus được.
   */
  loading?: boolean;
  /** Nhãn thay thế khi đang xử lý (vd. "Đang lưu…"). Nút luôn rộng bằng nội dung dài hơn trong hai nhãn. */
  loadingText?: React.ReactNode;
}

type ButtonSize = "small" | "medium" | "large";

/** Spinner cùng cỡ icon của nút (16 / 20 / 24px) để thay chỗ mà không xê dịch. */
const LOADING: Record<ButtonSize, { spinner: SpinnerSize; box: string; gap: string }> = {
  small: { spinner: "extra-tiny", box: "size-4", gap: "gap-1" },
  medium: { spinner: "tiny", box: "size-5", gap: "gap-1.5" },
  large: { spinner: "extra-small", box: "size-6", gap: "gap-1.5" },
};

/** Các lớp con nằm chồng trong cùng một ô lưới → khối rộng bằng lớp lớn nhất, đổi lớp không làm nút đổi kích thước. */
const STACK = "grid place-items-center *:col-start-1 *:row-start-1";

function preventClick(event: React.MouseEvent<HTMLElement>) {
  event.preventDefault();
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      appearance,
      size,
      shape,
      iconOnly,
      icon,
      iconPosition = "before",
      asChild,
      loading,
      loadingText,
      children,
      type,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = iconOnly ?? (!!icon && !children);
    const busy = !!loading;
    const classes = cn(
      buttonVariants({ appearance, size, shape, iconOnly: isIconOnly }),
      busy && "cursor-progress",
      className,
    );
    // Không dùng `disabled`: nút đang xử lý vẫn phải focus được và được đọc là "bận".
    const busyProps = busy ? { "aria-busy": true, "aria-disabled": true } : {};

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} onClick={busy ? preventClick : onClick} {...props} {...busyProps}>
          {children}
        </Slot>
      );
    }

    let content: React.ReactNode;
    if (loading === undefined) {
      content = (
        <>
          {icon && iconPosition === "before" && icon}
          {children}
          {icon && iconPosition === "after" && icon}
        </>
      );
    } else {
      const s = LOADING[size ?? "medium"];
      const spinner = (
        <Spinner
          aria-hidden
          size={s.spinner}
          appearance={(appearance === "primary" || appearance === "danger") && !props.disabled ? "inverted" : "primary"}
        />
      );
      const rest = (
        <>
          {icon && iconPosition === "before" && icon}
          {children}
          {icon && iconPosition === "after" && icon}
        </>
      );

      if (loadingText !== undefined) {
        // Hai lớp chồng nhau; lớp ẩn dùng `invisible` nên cũng rời khỏi cây trợ năng → tên nút = lớp đang hiện.
        content = (
          <span className={STACK}>
            <span className={cn("inline-flex items-center", s.gap, busy && "invisible")}>{rest}</span>
            <span className={cn("inline-flex items-center", s.gap, !busy && "invisible")}>
              {busy ? spinner : <span className={s.box} />}
              {loadingText}
            </span>
          </span>
        );
      } else if (icon) {
        const slot = busy ? spinner : icon;
        content = (
          <>
            {iconPosition === "before" && slot}
            {children}
            {iconPosition === "after" && slot}
          </>
        );
      } else {
        // Chỉ có nhãn: nhãn trong suốt (vẫn giữ chỗ và tên truy cập), Spinner nằm giữa.
        content = (
          <span className={STACK}>
            <span className={cn("inline-flex items-center", s.gap, busy && "opacity-0")}>{children}</span>
            {busy && spinner}
          </span>
        );
      }
    }

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={classes}
        onClick={busy ? preventClick : onClick}
        {...props}
        {...busyProps}
      >
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
