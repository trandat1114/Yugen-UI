import * as React from "react";
import { Info16Filled, Info16Regular, Info20Filled, Info20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Popover, PopoverSurface, PopoverTrigger } from "@/components/ui/Popover/Popover";

/** Fluent 2 InfoLabel — https://fluent2.microsoft.design/components/web/react/core/infolabel/usage */
const SIZE = {
  small: { label: "text-caption1", button: "size-4" },
  medium: { label: "text-body1", button: "size-5" },
  large: { label: "text-body2", button: "size-6" },
} as const;

export interface InfoLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Nội dung giải thích hiển thị trong Popover khi bấm nút (i). */
  info: React.ReactNode;
  size?: keyof typeof SIZE;
  weight?: "regular" | "semibold";
  required?: boolean;
  disabled?: boolean;
  /** aria-label cho nút thông tin. */
  infoButtonLabel?: string;
  /** Class cho khối ngoài (label + nút). */
  rootClassName?: string;
}

export const InfoLabel = React.forwardRef<HTMLLabelElement, InfoLabelProps>(
  (
    {
      info,
      size = "medium",
      weight = "regular",
      required,
      disabled,
      infoButtonLabel = "Thông tin",
      className,
      rootClassName,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const labelId = id ?? `${autoId}-label`;
    const buttonId = `${autoId}-info`;
    const s = SIZE[size];
    const [Rest, Active] = size === "large" ? [Info20Regular, Info20Filled] : [Info16Regular, Info16Filled];

    return (
      <span className={cn("inline-flex items-center gap-0.5 align-middle", rootClassName)}>
        <label
          ref={ref}
          id={labelId}
          className={cn(
            s.label,
            weight === "semibold" && "font-semibold",
            disabled ? "text-foreground-disabled" : "text-foreground-1",
            className,
          )}
          {...props}
        >
          {children}
          {required && (
            <span aria-hidden className="ps-1 text-danger-foreground-1">
              *
            </span>
          )}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={buttonId}
              aria-label={infoButtonLabel}
              aria-labelledby={`${buttonId} ${labelId}`}
              className={cn(
                "group/info inline-flex shrink-0 items-center justify-center rounded-small text-foreground-2",
                "transition-colors duration-faster ease-easy-ease hover:text-foreground-1",
                "data-[state=open]:text-brand-foreground-1",
                s.button,
              )}
            >
              <Rest aria-hidden className="group-hover/info:hidden group-data-[state=open]/info:hidden" />
              <Active aria-hidden className="hidden group-hover/info:block group-data-[state=open]/info:block" />
            </button>
          </PopoverTrigger>
          <PopoverSurface size="small" withArrow side="top" align="start" className="max-w-66 text-body1">
            {info}
          </PopoverSurface>
        </Popover>
      </span>
    );
  },
);
InfoLabel.displayName = "InfoLabel";
