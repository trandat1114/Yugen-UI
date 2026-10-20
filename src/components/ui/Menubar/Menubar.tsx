import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Checkmark16Filled, ChevronRight16Regular } from "@fluentui/react-icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { menuItemClass, menuPopoverClass } from "../Menu/Menu";

/** Menubar (shadcn/ui, giao diện Fluent 2 Menu) — https://ui.shadcn.com/docs/components/menubar */
export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
export const MenubarSub = MenubarPrimitive.Sub;

export const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("flex w-fit items-center gap-XXS rounded-medium border border-stroke-2 bg-background-1 p-XXS", className)}
    {...props}
  />
));
Menubar.displayName = "Menubar";

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-8 cursor-pointer items-center gap-XS rounded-medium px-S text-body1 text-foreground-1 select-none",
      "transition-colors duration-faster ease-easy-ease",
      "hover:bg-subtle-hover data-highlighted:bg-subtle-hover data-[state=open]:bg-subtle-pressed",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:size-5 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", sideOffset = 6, ...props }, ref) => {
  const portalTheme = usePortalThemeProps();
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        {...portalTheme}
        align={align}
        sideOffset={sideOffset}
        className={cn(menuPopoverClass, className)}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});
MenubarContent.displayName = "MenubarContent";

export interface MenubarItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  icon?: React.ReactNode;
  /** Phím tắt / thông tin phụ bên phải. */
  secondaryContent?: React.ReactNode;
}

export const MenubarItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Item>, MenubarItemProps>(
  ({ className, icon, secondaryContent, children, ...props }, ref) => (
    <MenubarPrimitive.Item ref={ref} className={cn(menuItemClass, className)} {...props}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {secondaryContent && <span className="ps-L text-caption1 text-foreground-3">{secondaryContent}</span>}
    </MenubarPrimitive.Item>
  ),
);
MenubarItem.displayName = "MenubarItem";

export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> & { secondaryContent?: React.ReactNode }
>(({ className, secondaryContent, children, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-S flex size-4 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {secondaryContent && <span className="ps-L text-caption1 text-foreground-3">{secondaryContent}</span>}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-S flex size-4 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = "MenubarRadioItem";

export function MenubarSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator className={cn("-mx-XS my-XS h-px bg-stroke-2", className)} {...props} />;
}

export function MenubarLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>) {
  return (
    <MenubarPrimitive.Label
      className={cn("flex h-8 items-center px-S text-caption1 font-semibold text-foreground-3", className)}
      {...props}
    />
  );
}

export function MenubarSubTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & { icon?: React.ReactNode }) {
  return (
    <MenubarPrimitive.SubTrigger
      className={cn(menuItemClass, "data-[state=open]:bg-background-1-hover data-[state=open]:text-foreground-1", className)}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronRight16Regular className="size-4! text-foreground-3 rtl:-scale-x-100" />
    </MenubarPrimitive.SubTrigger>
  );
}

export function MenubarSubContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>) {
  const portalTheme = usePortalThemeProps();
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent {...portalTheme} sideOffset={4} className={cn(menuPopoverClass, className)} {...props} />
    </MenubarPrimitive.Portal>
  );
}
