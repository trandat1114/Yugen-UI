import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

/** Fluent 2 TabList — https://fluent2.microsoft.design/components/web/react/core/tablist/usage */
type TabSize = "small" | "medium" | "large";
type TabAppearance = "transparent" | "subtle";

const TabsContext = React.createContext<{ size: TabSize; appearance: TabAppearance }>({
  size: "medium",
  appearance: "transparent",
});

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  size?: TabSize;
  appearance?: TabAppearance;
}

export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, size = "medium", appearance = "transparent", ...props }, ref) => (
    <TabsContext.Provider value={{ size, appearance }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn("flex items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch", className)}
        {...props}
      />
    </TabsContext.Provider>
  ),
);
TabsList.displayName = "TabsList";

const SIZE: Record<TabSize, string> = {
  small: "gap-XS px-SNudge py-XS text-caption1 [&_svg]:size-4 after:inset-x-SNudge",
  medium: "gap-SNudge px-MNudge py-M text-body1 [&_svg]:size-5 after:inset-x-MNudge",
  large: "gap-SNudge px-MNudge py-L text-body2 [&_svg]:size-6 after:inset-x-MNudge",
};

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  icon?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, icon, children, ...props }, ref) => {
    const { size, appearance } = React.useContext(TabsContext);
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "group/tab relative inline-flex shrink-0 cursor-pointer whitespace-nowrap items-center justify-center rounded-medium text-foreground-2",
          "transition-colors duration-faster ease-easy-ease",
          "hover:text-foreground-1 data-[state=active]:font-semibold data-[state=active]:text-foreground-1",
          // Thanh chỉ báo: xám khi hover, brand khi active.
          "after:absolute after:bottom-0 after:h-0.75 after:rounded-circular after:bg-transparent",
          "after:transition-colors after:duration-faster",
          "hover:after:bg-stroke-1-hover data-[state=active]:after:bg-brand-stroke data-[state=active]:hover:after:bg-brand-stroke",
          "[&_svg]:shrink-0 data-[state=active]:[&_svg]:text-brand-foreground-1",
          appearance === "subtle" && "hover:bg-subtle-hover active:bg-subtle-pressed",
          "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:after:bg-transparent",
          SIZE[size],
          className,
        )}
        {...props}
      >
        {icon}
        {/* Giữ chỗ cho chữ đậm để tab không bị nhảy độ rộng khi active */}
        <span className="inline-grid">
          <span className="col-start-1 row-start-1 group-data-[state=active]/tab:invisible">{children}</span>
          <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold group-data-[state=active]/tab:visible">
            {children}
          </span>
        </span>
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("pt-M text-body1 text-foreground-2 outline-none", className)} {...props} />
));
TabsContent.displayName = "TabsContent";
