import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Checkmark16Filled, ChevronRight16Regular } from "../_internal/icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { menuItemClass, menuPopoverClass } from "../Menu/Menu";

/** Menubar (shadcn/ui, giao diện Fluent 2 Menu) — https://ui.shadcn.com/docs/components/menubar */
export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
export const MenubarSub = MenubarPrimitive.Sub;

export function Menubar({ className, ref, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      ref={ref}
      className={cn("flex w-fit items-center gap-0.5 rounded-medium border border-stroke-2 bg-background-1 p-0.5", className)}
      {...props}
    />
  );
}

export function MenubarTrigger({ className, ref, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1 rounded-medium px-2 text-body1 text-foreground-1 select-none",
        "transition-colors duration-faster ease-easy-ease",
        "hover:bg-subtle-hover data-highlighted:bg-subtle-hover data-[state=open]:bg-subtle-pressed",
        "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
        "[&_svg]:size-5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function MenubarContent({
  className,
  align = "start",
  sideOffset = 6,
  ref,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
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
}

export interface MenubarItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  icon?: React.ReactNode;
  /** Phím tắt / thông tin phụ bên phải. */
  secondaryContent?: React.ReactNode;
}

export function MenubarItem({
  className,
  icon,
  secondaryContent,
  children,
  ref,
  ...props
}: MenubarItemProps & { ref?: React.Ref<React.ComponentRef<typeof MenubarPrimitive.Item>> }) {
  return (
    <MenubarPrimitive.Item ref={ref} className={cn(menuItemClass, className)} {...props}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {secondaryContent && <span className="ps-4 text-caption1 text-foreground-3">{secondaryContent}</span>}
    </MenubarPrimitive.Item>
  );
}

export function MenubarCheckboxItem({
  className,
  secondaryContent,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & { secondaryContent?: React.ReactNode }) {
  return (
    <MenubarPrimitive.CheckboxItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
      <span className="absolute inset-s-2 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Checkmark16Filled className="size-4! text-foreground-1" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {secondaryContent && <span className="ps-4 text-caption1 text-foreground-3">{secondaryContent}</span>}
    </MenubarPrimitive.CheckboxItem>
  );
}

export function MenubarRadioItem({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
      <span className="absolute inset-s-2 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Checkmark16Filled className="size-4! text-foreground-1" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </MenubarPrimitive.RadioItem>
  );
}

export function MenubarSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-stroke-2", className)} {...props} />;
}

export function MenubarLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>) {
  return (
    <MenubarPrimitive.Label
      className={cn("flex h-8 items-center px-2 text-caption1 font-semibold text-foreground-3", className)}
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
