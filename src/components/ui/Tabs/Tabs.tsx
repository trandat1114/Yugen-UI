import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export { useScrollMinimize, type UseScrollMinimizeOptions } from "./useScrollMinimize";

/** Fluent 2 TabList — https://fluent2.microsoft.design/components/web/react/core/tablist/usage */
type TabSize = "small" | "medium" | "large";
type TabAppearance = "transparent" | "subtle";

type TabMaterial = "glass" | "glass-clear";

const TabsContext = React.createContext<{
  size: TabSize;
  appearance: TabAppearance;
  material?: TabMaterial;
  minimized: boolean;
}>({
  size: "medium",
  appearance: "transparent",
  minimized: false,
});

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  size?: TabSize;
  appearance?: TabAppearance;
  /**
   * Yugen Labs — thanh tab nổi bằng glass: tab đang chọn là nền bo tròn thay cho thanh chỉ báo. glass-clear: trên ảnh /
   * media (đặt glass-scrim lên media bên dưới).
   */
  material?: TabMaterial;
  /** Thu gọn: tab có icon chỉ còn icon, tên vẫn đọc được cho trình đọc màn hình (vd. khi cuộn xuống — useScrollMinimize). */
  minimized?: boolean;
}

export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, size = "medium", appearance = "transparent", material, minimized = false, ...props }, ref) => (
    <TabsContext.Provider value={{ size, appearance, material, minimized }}>
      <TabsPrimitive.List
        ref={ref}
        data-minimized={minimized || undefined}
        className={cn(
          "group/tablist flex items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          material &&
            cn(
              material,
              "w-fit gap-0.5 rounded-circular border border-transparent p-1 shadow-16 data-[orientation=vertical]:rounded-3xlarge",
            ),
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  ),
);
TabsList.displayName = "TabsList";

const SIZE: Record<TabSize, string> = {
  small: "gap-1 px-1.5 py-1 text-caption1 [&_svg]:size-4 after:inset-x-1.5",
  medium: "gap-1.5 px-2.5 py-3 text-body1 [&_svg]:size-5 after:inset-x-2.5",
  large: "gap-1.5 px-2.5 py-4 text-body2 [&_svg]:size-6 after:inset-x-2.5",
};

/** Tab trong thanh glass: thấp hơn, vì nền bo tròn thay cho thanh chỉ báo ở đáy. */
const GLASS_SIZE: Record<TabSize, string> = { small: "py-1", medium: "py-1.5", large: "py-2" };

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  icon?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, icon, children, ...props }, ref) => {
    const { size, appearance, material, minimized } = React.useContext(TabsContext);
    const innerRef = React.useRef<HTMLButtonElement | null>(null);
    const controlsRef = React.useRef<string | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // TabList kiểu Fluent hay dùng không kèm TabsContent: Radix vẫn gắn aria-controls tới panel không tồn tại
    // (id rỗng là ARIA không hợp lệ). Chỉ giữ aria-controls khi panel thật sự có trong DOM — chạy lại mỗi lần render.
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      controlsRef.current ??= el.getAttribute("aria-controls");
      const id = controlsRef.current;
      if (!id) return;
      if (document.getElementById(id)) el.setAttribute("aria-controls", id);
      else el.removeAttribute("aria-controls");
    });

    return (
      <TabsPrimitive.Trigger
        ref={setRefs}
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
          material &&
            cn(
              "rounded-circular after:hidden hover:bg-subtle-hover active:bg-subtle-pressed",
              "data-[state=active]:bg-(--glass-selected) data-[state=active]:hover:bg-(--glass-selected)",
              GLASS_SIZE[size],
            ),
          className,
        )}
        {...props}
      >
        {icon}
        {/* Giữ chỗ cho chữ đậm để tab không bị nhảy độ rộng khi active. Chữ thật luôn hiển thị (đậm theo trigger)
            để tab active vẫn có tên truy cập; bản sao đậm chỉ chiếm chỗ, luôn ẩn. */}
        {/* Thu gọn: chỉ còn icon; hiện lại tên khi bàn phím đang ở trong thanh tab. */}
        <span className={cn("inline-grid", minimized && icon !== undefined && "sr-only group-focus-within/tablist:not-sr-only")}>
          <span className="col-start-1 row-start-1">{children}</span>
          <span aria-hidden className="invisible col-start-1 row-start-1 font-semibold">
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
  <TabsPrimitive.Content ref={ref} className={cn("pt-3 text-body1 text-foreground-2 outline-none", className)} {...props} />
));
TabsContent.displayName = "TabsContent";
