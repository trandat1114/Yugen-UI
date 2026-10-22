import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Checkmark16Filled, ChevronRight16Regular } from "@fluentui/react-icons";
import { usePortalThemeProps } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { menuItemClass, menuPopoverClass } from "../Menu/Menu";

/** ContextMenu (shadcn/ui, giao diện Fluent 2 Menu) — https://fluent2.microsoft.design/components/web/react/core/menu/usage */
export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
export const ContextMenuSub = ContextMenuPrimitive.Sub;

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => {
  const portalTheme = usePortalThemeProps();
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content ref={ref} {...portalTheme} className={cn(menuPopoverClass, className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
  icon?: React.ReactNode;
  /** Phím tắt / thông tin phụ bên phải. */
  secondaryContent?: React.ReactNode;
}

export const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, ContextMenuItemProps>(
  ({ className, icon, secondaryContent, children, ...props }, ref) => (
    <ContextMenuPrimitive.Item ref={ref} className={cn(menuItemClass, className)} {...props}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {secondaryContent && <span className="ps-4 text-caption1 text-foreground-3">{secondaryContent}</span>}
    </ContextMenuPrimitive.Item>
  ),
);
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> & { secondaryContent?: React.ReactNode }
>(({ className, secondaryContent, children, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-2 flex size-4 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {secondaryContent && <span className="ps-4 text-caption1 text-foreground-3">{secondaryContent}</span>}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem ref={ref} className={cn(menuItemClass, "ps-8", className)} {...props}>
    <span className="absolute inset-s-2 flex size-4 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Checkmark16Filled className="size-4! text-foreground-1" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export function ContextMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-stroke-2", className)} {...props} />;
}

export function ContextMenuLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>) {
  return (
    <ContextMenuPrimitive.Label
      className={cn("flex h-8 items-center px-2 text-caption1 font-semibold text-foreground-3", className)}
      {...props}
    />
  );
}

export function ContextMenuSubTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & { icon?: React.ReactNode }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(menuItemClass, "data-[state=open]:bg-background-1-hover data-[state=open]:text-foreground-1", className)}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronRight16Regular className="size-4! text-foreground-3 rtl:-scale-x-100" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

export function ContextMenuSubContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>) {
  const portalTheme = usePortalThemeProps();
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent {...portalTheme} sideOffset={4} className={cn(menuPopoverClass, className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
}
