/** NavigationMenu (Radix, mẫu WAI-ARIA disclosure navigation) — https://www.radix-ui.com/primitives/docs/components/navigation-menu */
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown12Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { useYugenMessages } from "../YugenProvider/context";
import { navigationMenuMessagesEn } from "./messages";

export { navigationMenuMessagesVi, navigationMenuMessagesEn, type NavigationMenuMessages } from "./messages";

/**
 * Nút / link ở hàng trên cùng: chữ foreground-2, hover nền subtle; đang mở hoặc là trang hiện tại thì đậm, trang hiện tại
 * có thêm thanh brand 2px ở đáy (như Tabs).
 */
export const navigationMenuTriggerClass = cn(
  "group/nav-trigger relative inline-flex h-8 cursor-pointer items-center gap-1 rounded-medium px-3 text-body1 whitespace-nowrap text-foreground-2 select-none",
  "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
  "data-[state=open]:bg-subtle-hover data-[state=open]:text-foreground-1",
  "data-active:font-semibold data-active:text-foreground-1",
  "data-active:after:absolute data-active:after:inset-x-3 data-active:after:-bottom-px data-active:after:h-0.5 data-active:after:rounded-circular data-active:after:bg-brand-stroke",
  "disabled:pointer-events-none disabled:text-foreground-disabled",
  "[&_svg]:shrink-0",
);

/** Link trong bảng thả xuống: khối có tiêu đề (+ icon, mô tả). */
const panelLinkClass = cn(
  "flex gap-3 rounded-medium p-3 text-start text-foreground-1 outline-none select-none",
  "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed focus-visible:bg-subtle-hover",
  "data-active:bg-brand-background-2 data-active:text-brand-foreground-2",
  "[&_svg]:size-6 [&_svg]:shrink-0",
);

/** Link nằm trong NavigationMenuContent thì có dạng khối của bảng thả xuống. */
const InContentContext = React.createContext(false);

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  /** Class cho khung nổi (viewport) chứa nội dung đang mở. */
  viewportClassName?: string;
}

/**
 * Menu điều hướng cho header website: link và nút mở bảng thả xuống (mega menu). Rê chuột có độ trễ để không mở nhầm;
 * Tab đi qua các mục, Enter / Space mở, mũi tên trái / phải chuyển mục, Esc đóng. Bảng nằm trong một khung nổi đổi cỡ
 * theo nội dung. Trên màn hình hẹp, đặt các link vào Drawer (xem trang docs).
 */
export function NavigationMenu({
  className,
  viewportClassName,
  children,
  "aria-label": ariaLabel,
  ref,
  ...props
}: NavigationMenuProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("navigationMenu", navigationMenuMessagesEn);
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      aria-label={ariaLabel ?? msg.label}
      className={cn("relative z-10 flex max-w-max flex-1 items-center", className)}
      {...props}
    >
      {children}
      <div className="absolute inset-s-0 top-full flex justify-start">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            popoverSurfaceClass,
            "relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-2rem)] origin-top overflow-hidden p-0",
            "transition-[width,height] duration-normal ease-decelerate-mid motion-reduce:transition-none",
            "data-[state=closed]:animate-fade-out",
            viewportClassName,
          )}
        />
      </div>
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> & { ref?: React.Ref<HTMLUListElement> }) {
  return <NavigationMenuPrimitive.List ref={ref} className={cn("flex flex-1 list-none items-center gap-1", className)} {...props} />;
}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export function NavigationMenuTrigger({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerClass, className)} {...props}>
      {children}
      <ChevronDown12Regular
        aria-hidden
        className="size-3 text-foreground-3 transition-transform duration-normal ease-easy-ease group-data-[state=open]/nav-trigger:rotate-180 motion-reduce:transition-none"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "inset-s-0 top-0 w-full p-2 sm:absolute sm:w-auto",
        "data-[motion^=from-]:animate-fade-in data-[motion^=to-]:animate-fade-out",
        className,
      )}
      {...props}
    >
      {/* Radix render nội dung trong viewport (ngoài cây của Content): context phải nằm trong children. */}
      <InContentContext.Provider value={true}>{children}</InContentContext.Provider>
    </NavigationMenuPrimitive.Content>
  );
}

export interface NavigationMenuLinkProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link> {
  /** Icon đầu link (trong bảng thả xuống). */
  icon?: React.ReactNode;
  /** Mô tả một dòng dưới tiêu đề (trong bảng thả xuống). */
  description?: React.ReactNode;
}

/**
 * Link: ở hàng trên cùng có dạng như nút mở bảng; trong NavigationMenuContent thành khối có icon và mô tả. `active` đánh dấu
 * trang hiện tại (`aria-current="page"`); `asChild` để dùng Link của router.
 */
export function NavigationMenuLink({
  className,
  icon,
  description,
  children,
  asChild,
  ref,
  ...props
}: NavigationMenuLinkProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  const inContent = React.useContext(InContentContext);
  if (!inContent || asChild) {
    return (
      <NavigationMenuPrimitive.Link ref={ref} asChild={asChild} className={cn(inContent ? panelLinkClass : navigationMenuTriggerClass, className)} {...props}>
        {children}
      </NavigationMenuPrimitive.Link>
    );
  }
  return (
    <NavigationMenuPrimitive.Link ref={ref} className={cn(panelLinkClass, className)} {...props}>
      {icon && <span className="mt-0.5 flex text-brand-foreground-1">{icon}</span>}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-body1 font-semibold">{children}</span>
        {description && <span className="text-caption1 text-foreground-3">{description}</span>}
      </span>
    </NavigationMenuPrimitive.Link>
  );
}

export function NavigationMenuIndicator({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        "top-full z-20 flex h-1.5 items-end justify-center overflow-hidden transition-[width,transform] duration-normal ease-decelerate-mid",
        "data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-small bg-background-1 shadow-4" />
    </NavigationMenuPrimitive.Indicator>
  );
}
