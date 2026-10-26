import * as React from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Checkmark16Filled, ChevronRight16Regular } from "@fluentui/react-icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";

/** Fluent 2 Menu — https://fluent2.microsoft.design/components/web/react/core/menu/usage */
export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export const MenuRadioGroup = MenuPrimitive.RadioGroup;
export const MenuSub = MenuPrimitive.Sub;

/**
 * Class dùng chung cho mọi bề mặt menu (Menu, ContextMenu, Menubar, menu con). Menu dài cuộn bên trong thay vì tràn khỏi
 * màn hình: popper của Radix đặt --radix-popper-available-height cho mọi loại menu (ngoài popper thì max-height = none).
 */
export const menuPopoverClass = cn(
  "z-50 max-h-(--radix-popper-available-height) min-w-40 max-w-80 overflow-y-auto rounded-medium border border-transparent bg-background-1 p-1 text-foreground-1 shadow-16",
  "animate-surface-in data-[state=closed]:animate-fade-out",
);

export const MenuPopover = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(({ className, sideOffset = 4, align = "start", ...props }, ref) => {
  const portalTheme = usePortalThemeProps();
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        {...portalTheme}
        sideOffset={sideOffset}
        align={align}
        className={cn(menuPopoverClass, className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});
MenuPopover.displayName = "MenuPopover";

/** Class dùng chung cho mọi item menu. */
export const menuItemClass = cn(
  "relative flex h-8 cursor-pointer items-center gap-2 rounded-medium px-2 text-body1 text-foreground-2 outline-none select-none",
  "data-highlighted:bg-background-1-hover data-highlighted:text-foreground-1 active:bg-background-1-pressed",
  "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
  "[&_svg]:size-5 [&_svg]:shrink-0",
);

export interface MenuItemProps extends React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> {
  icon?: React.ReactNode;
  secondaryContent?: React.ReactNode;
}

/** Nội dung phụ ở cuối item (phím tắt, trạng thái…). */
function SecondaryContent({ children }: { children: React.ReactNode }) {
  return <span className="flex shrink-0 items-center gap-1 ps-4 text-caption1 text-foreground-3">{children}</span>;
}

export const MenuItem = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Item>, MenuItemProps>(
  ({ className, icon, secondaryContent, children, ...props }, ref) => (
    <MenuPrimitive.Item ref={ref} className={cn(menuItemClass, className)} {...props}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {secondaryContent && <SecondaryContent>{secondaryContent}</SecondaryContent>}
    </MenuPrimitive.Item>
  ),
);
MenuItem.displayName = "MenuItem";

export const MenuItemRadio = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem> & Pick<MenuItemProps, "icon" | "secondaryContent">
>(({ className, icon, secondaryContent, children, ...props }, ref) => (
  <MenuPrimitive.RadioItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-2 flex size-4 items-center justify-center">
      <MenuPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </MenuPrimitive.ItemIndicator>
    </span>
    {icon}
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {secondaryContent && <SecondaryContent>{secondaryContent}</SecondaryContent>}
  </MenuPrimitive.RadioItem>
));
MenuItemRadio.displayName = "MenuItemRadio";

export const MenuItemCheckbox = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem> & Pick<MenuItemProps, "icon" | "secondaryContent">
>(({ className, icon, secondaryContent, children, ...props }, ref) => (
  <MenuPrimitive.CheckboxItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-2 flex size-4 items-center justify-center">
      <MenuPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </MenuPrimitive.ItemIndicator>
    </span>
    {icon}
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {secondaryContent && <SecondaryContent>{secondaryContent}</SecondaryContent>}
  </MenuPrimitive.CheckboxItem>
));
MenuItemCheckbox.displayName = "MenuItemCheckbox";

export function MenuDivider({ className }: { className?: string }) {
  return <MenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-stroke-2", className)} />;
}

export function MenuGroupHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      className={cn("flex h-8 items-center px-2 text-caption1 font-semibold text-foreground-3", className)}
      {...props}
    />
  );
}

export function MenuSubTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger> & { icon?: React.ReactNode }) {
  return (
    <MenuPrimitive.SubTrigger
      className={cn(menuItemClass, "data-[state=open]:bg-background-1-hover data-[state=open]:text-foreground-1", className)}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronRight16Regular className="size-4! text-foreground-3 rtl:-scale-x-100" />
    </MenuPrimitive.SubTrigger>
  );
}

export function MenuSubPopover({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>) {
  const portalTheme = usePortalThemeProps();
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent {...portalTheme} sideOffset={4} className={cn(menuPopoverClass, className)} {...props} />
    </MenuPrimitive.Portal>
  );
}
