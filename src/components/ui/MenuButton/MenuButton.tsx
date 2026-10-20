/** Fluent 2 MenuButton — https://storybooks.fluentui.dev/react/?path=/docs/components-button-menubutton--docs */
import * as React from "react";
import { ChevronDown20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "../Button/Button";
import { Menu, MenuPopover, MenuTrigger } from "../Menu/Menu";

type MenuButtonAppearance = NonNullable<ButtonProps["appearance"]>;

/** Trạng thái "đang mở menu" giữ nguyên sắc pressed của từng appearance. */
const OPEN_CLASS: Record<MenuButtonAppearance, string> = {
  secondary: "data-[state=open]:bg-background-1-pressed data-[state=open]:border-stroke-1-pressed",
  primary: "data-[state=open]:bg-brand-background-pressed",
  outline: "data-[state=open]:border-stroke-1-pressed",
  subtle: "data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1",
  transparent: "data-[state=open]:text-brand-foreground-1",
  danger: "data-[state=open]:brightness-90",
};

const ICON_ONLY_PADDING = { small: "px-XS", medium: "px-SNudge", large: "px-S" } as const;

export interface MenuButtonProps extends Omit<ButtonProps, "asChild" | "iconPosition" | "iconOnly"> {
  /** Nội dung menu: MenuItem / MenuItemRadio / MenuDivider… */
  menu: React.ReactNode;
  /** Thay chevron mặc định. */
  menuIcon?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Căn menu theo nút. Mặc định "start". */
  align?: "start" | "center" | "end";
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (
    {
      menu,
      menuIcon,
      open,
      defaultOpen,
      onOpenChange,
      align = "start",
      appearance = "secondary",
      size = "medium",
      icon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const hasLabel = children !== undefined && children !== null && children !== false && children !== "";
    const resolvedSize = size ?? "medium";
    const resolvedAppearance = appearance ?? "secondary";

    return (
      <Menu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <MenuTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            appearance={resolvedAppearance}
            size={resolvedSize}
            icon={icon}
            iconOnly={false}
            disabled={disabled}
            className={cn(
              "group/menubutton",
              OPEN_CLASS[resolvedAppearance],
              !hasLabel && cn("min-w-0", ICON_ONLY_PADDING[resolvedSize]),
              className,
            )}
            {...props}
          >
            {hasLabel && children}
            <span
              aria-hidden="true"
              className="inline-flex transition-transform duration-normal ease-easy-ease motion-reduce:transition-none group-data-[state=open]/menubutton:rotate-180"
            >
              {menuIcon ?? <ChevronDown20Regular />}
            </span>
          </Button>
        </MenuTrigger>
        <MenuPopover align={align}>{menu}</MenuPopover>
      </Menu>
    );
  },
);
MenuButton.displayName = "MenuButton";
