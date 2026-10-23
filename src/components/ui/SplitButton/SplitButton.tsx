import * as React from "react";
import { ChevronDown20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "../Button/Button";
import { Menu, MenuPopover, MenuTrigger } from "../Menu/Menu";
import { useYugenMessages } from "../YugenProvider/context";
import { splitButtonMessages } from "./messages";

export { splitButtonMessages, splitButtonMessagesEn, type SplitButtonMessages } from "./messages";

/** Fluent 2 SplitButton — https://fluent2.microsoft.design/components/web/react/core/splitbutton/usage */
export interface SplitButtonProps extends Omit<ButtonProps, "appearance" | "asChild" | "iconOnly" | "shape"> {
  appearance?: "primary" | "secondary" | "outline" | "subtle";
  /** Nội dung menu: các MenuItem / MenuItemRadio / MenuDivider. */
  menu: React.ReactNode;
  /** aria-label của nút mở menu. Mặc định lấy từ `messages.splitButton.menu`. */
  menuLabel?: string;
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  ({ appearance = "secondary", size = "medium", menu, menuLabel, className, disabled, ...props }, ref) => {
    const msg = useYugenMessages("splitButton", splitButtonMessages);
    const divider =
      appearance === "primary"
        ? "border-s border-s-stroke-on-brand/40"
        : appearance === "subtle"
          ? "border-s border-s-stroke-2"
          : "-ms-px";

    return (
      <span className={cn("inline-flex align-middle", className)}>
        <Button ref={ref} appearance={appearance} size={size} disabled={disabled} className="rounded-e-none" {...props} />
        <Menu>
          <MenuTrigger asChild disabled={disabled}>
            <Button
              appearance={appearance}
              size={size}
              disabled={disabled}
              aria-label={menuLabel ?? msg.menu}
              icon={<ChevronDown20Regular />}
              className={cn("rounded-s-none", size === "small" ? "w-6" : size === "large" ? "w-11" : "w-8", divider)}
            />
          </MenuTrigger>
          <MenuPopover align="end">{menu}</MenuPopover>
        </Menu>
      </span>
    );
  },
);
SplitButton.displayName = "SplitButton";
