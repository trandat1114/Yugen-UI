import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDirection } from "@radix-ui/react-direction";
import { Navigation20Regular, PanelLeftContract20Regular, PanelLeftExpand20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { Button, type ButtonProps } from "../Button/Button";
import { Drawer, DrawerSurface } from "../Drawer/Drawer";
import { Kbd, KbdGroup } from "../Kbd/Kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Tooltip/Tooltip";
import { NavHostContext, type NavHostValue } from "../Nav/context";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import {
  HIDE_WIDE,
  isShown,
  SHOW_WIDE,
  SidebarContext,
  useShell,
  type AppShellLayout,
  type SidebarCollapsible,
  type SidebarContextValue,
} from "./context";
import { appShellMessagesEn } from "./messages";

export type { SidebarCollapsible } from "./context";

/** Vị trí trong lưới của AppShell: cao hết khung, hoặc dưới thanh trên cùng khi `layout="header"`. */
const SIDEBAR_AREA: Record<AppShellLayout, string> = { sidebar: "row-span-full", header: "row-[2/-1]" };
/** Cuộn cả trang: sidebar dính ở mép trên (hoặc dưới thanh trên cùng), cao bằng phần trang còn thấy. */
const SIDEBAR_STICKY: Record<AppShellLayout, string> = {
  sidebar: "sticky top-0 h-(--app-shell-viewport,100dvh) self-start",
  header:
    "sticky top-(--app-shell-header,3.5rem) h-[calc(var(--app-shell-viewport,100dvh)-var(--app-shell-header,3.5rem))] self-start",
};

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: SidebarCollapsible;
  /** Thêm thanh chia kéo đổi độ rộng (đặt `<SidebarRail />` trong Sidebar). */
  resizable?: boolean;
  /** Độ rộng khi mở, px. */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Tên của Drawer trên màn hẹp. Mặc định: `messages.appShell.sidebar`. */
  label?: string;
}

/**
 * Sidebar của AppShell. Màn rộng: cột bên trái, thu về rail (`collapsible="icon"`) với Nav chỉ còn icon + Tooltip.
 * Màn hẹp: cùng nội dung trong Drawer, tự đóng khi theo một link hoặc chọn một mục Nav.
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      collapsible = "icon",
      resizable = false,
      defaultWidth = 256,
      minWidth = 200,
      maxWidth = 400,
      label,
      className,
      style,
      onFocus,
      onBlur,
      children,
      ...props
    },
    ref,
  ) => {
    const shell = useShell("Sidebar");
    const msg = useYugenMessages("appShell", appShellMessagesEn);
    const refs = useComposedRefs(ref, shell.sidebarRef);
    const clamp = (width: number) => Math.round(Math.min(maxWidth, Math.max(minWidth, width)));
    const [width, setWidthState] = React.useState(() =>
      clamp(resizable && shell.savedWidth !== undefined ? shell.savedWidth : defaultWidth),
    );
    const [resizing, setResizing] = React.useState(false);

    const { setCollapsible, setCollapsed, setDrawerOpen, persistWidth } = shell;
    useIsomorphicLayoutEffect(() => {
      setCollapsible(collapsible);
      return () => setCollapsible(null);
    }, [collapsible, setCollapsible]);

    const collapsed = collapsible !== "none" && shell.collapsed;
    const rail = collapsed && collapsible === "icon";
    const offcanvas = collapsed && collapsible === "offcanvas";

    const setWidth = React.useCallback(
      (next: number, persist: boolean) => {
        const value = Math.round(Math.min(maxWidth, Math.max(minWidth, next)));
        setWidthState(value);
        if (persist) persistWidth(value);
      },
      [minWidth, maxWidth, persistWidth],
    );

    const desktop = React.useMemo<SidebarContextValue>(
      () => ({ drawer: false, rail, collapsible, resizable, width, minWidth, maxWidth, defaultWidth, setWidth, setResizing }),
      [rail, collapsible, resizable, width, minWidth, maxWidth, defaultWidth, setWidth],
    );
    const inDrawer = React.useMemo<SidebarContextValue>(() => ({ ...desktop, drawer: true, rail: false }), [desktop]);
    const desktopHost = React.useMemo<NavHostValue>(() => ({ rail, expand: () => setCollapsed(false) }), [rail, setCollapsed]);
    const drawerHost = React.useMemo<NavHostValue>(
      () => ({ rail: false, expand: () => {}, onSelect: () => setDrawerOpen(false) }),
      [setDrawerOpen],
    );

    return (
      <TooltipProvider delayDuration={300}>
        <SidebarContext.Provider value={desktop}>
          <div
            ref={refs}
            id={shell.sidebarId}
            data-state={collapsed ? "collapsed" : "expanded"}
            data-collapsible={collapsible}
            data-rail={rail || undefined}
            style={{ "--app-shell-sidebar-width": `${width}px`, ...style } as React.CSSProperties}
            onFocus={(e) => {
              shell.sidebarFocused.current = true;
              onFocus?.(e);
            }}
            onBlur={(e) => {
              // relatedTarget null: cửa sổ mất focus hoặc phần tử bị ẩn — giữ cờ để chuyển focus khi qua breakpoint.
              if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) shell.sidebarFocused.current = false;
              onBlur?.(e);
            }}
            className={cn(
              "col-start-1 hidden min-h-0 flex-col border-e border-stroke-2 bg-background-1 text-foreground-1",
              SIDEBAR_AREA[shell.layout],
              shell.scroll === "page" ? SIDEBAR_STICKY[shell.layout] : "relative",
              !resizing && "transition-[width,visibility] duration-normal ease-easy-ease motion-reduce:transition-none",
              SHOW_WIDE[shell.breakpoint],
              rail ? "w-14" : offcanvas ? "invisible w-0 border-e-0" : "w-(--app-shell-sidebar-width)",
              className,
            )}
            {...props}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* offcanvas: nội dung giữ độ rộng trong lúc cột co về 0, không bị dồn chữ. */}
              <div className={cn("flex min-h-0 flex-1 flex-col", collapsible === "offcanvas" ? "w-(--app-shell-sidebar-width)" : "w-full")}>
                <NavHostContext.Provider value={desktopHost}>{children}</NavHostContext.Provider>
              </div>
            </div>
          </div>
        </SidebarContext.Provider>

        <Drawer open={shell.narrow && shell.drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerSurface
            position="start"
            size="small"
            data-app-shell={shell.shellId}
            onClick={(e) => {
              // Theo một link (kể cả link router chặn tải lại trang) là rời trang hiện tại: đóng Drawer.
              if (e.target instanceof Element && e.target.closest("a[href]")) setDrawerOpen(false);
            }}
            onCloseAutoFocus={(e) => {
              // Về phần tử đã mở Drawer nếu còn thấy; không thì trigger (khi còn hiện) hoặc nội dung chính.
              e.preventDefault();
              const back = shell.returnFocusRef.current;
              shell.returnFocusRef.current = null;
              if (isShown(back)) back.focus();
              else shell.focusTriggerOrMain();
            }}
          >
            <DialogPrimitive.Title className="sr-only">{label ?? msg.sidebar}</DialogPrimitive.Title>
            <SidebarContext.Provider value={inDrawer}>
              <NavHostContext.Provider value={drawerHost}>{children}</NavHostContext.Provider>
            </SidebarContext.Provider>
          </DrawerSurface>
        </Drawer>
      </TooltipProvider>
    );
  },
);
Sidebar.displayName = "Sidebar";

/** Đầu sidebar (logo, tên ứng dụng), cao bằng AppShellHeader. Trong rail: nội dung căn giữa — ẩn chữ bằng `in-data-rail:hidden`. */
export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-(--app-shell-header,3.5rem) shrink-0 items-center gap-2 border-b border-stroke-2 px-4 in-data-rail:justify-center in-data-rail:px-0",
      className,
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

/** Phần cuộn của sidebar, thường chứa Nav. */
export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

/** Cuối sidebar (tài khoản, dung lượng…). */
export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex shrink-0 flex-col gap-2 border-t border-stroke-2 p-2", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tên nhóm; trong rail chỉ còn cho trình đọc màn hình. */
  label?: React.ReactNode;
}

/** Nhóm nội dung không phải điều hướng trong sidebar (bộ lọc, dự án gần đây…). Nav dùng NavSectionHeader. */
export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(({ label, className, children, ...props }, ref) => {
  const labelId = React.useId();
  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={cn("flex flex-col gap-1 py-2", className)}
      {...props}
    >
      {label && (
        <div id={labelId} className="px-3 pb-1 text-caption1 font-semibold text-foreground-3 in-data-rail:sr-only">
          {label}
        </div>
      )}
      {children}
    </div>
  );
});
SidebarGroup.displayName = "SidebarGroup";

/** ⌘ trên máy Apple, Ctrl ở nơi khác. Đọc sau khi mount để HTML render ở server và lần hydrate đầu giống nhau. */
function useModifierKey() {
  const [mac, setMac] = React.useState(false);
  React.useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.userAgent)), []);
  return mac ? "⌘" : "Ctrl";
}

/**
 * Nút mở / thu gọn sidebar: màn hẹp mở Drawer, màn rộng thu về rail (hoặc ẩn khi `collapsible="offcanvas"`). Tooltip
 * mang nhãn và phím tắt.
 */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, onClick, ...props }, ref) => {
  const shell = useShell("SidebarTrigger");
  const msg = useYugenMessages("appShell", appShellMessagesEn);
  const refs = useComposedRefs(ref, shell.triggerRef);
  const modifier = useModifierKey();
  const WideIcon = shell.collapsed ? PanelLeftExpand20Regular : PanelLeftContract20Regular;
  const key = shell.shortcut ? shell.shortcut.toUpperCase() : undefined;
  const label = shell.narrow ? msg.openSidebar : shell.collapsed ? msg.expandSidebar : msg.collapseSidebar;
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={refs}
            appearance="subtle"
            // Icon theo container query (đúng ngay từ lần vẽ đầu); nhãn theo kích thước đo được. Ẩn / hiện bằng span
            // bọc ngoài: CSS của icon Fluent không nằm trong layer nên thắng `hidden` đặt thẳng lên svg.
            icon={
              <>
                <span className={cn("flex", HIDE_WIDE[shell.breakpoint])}>
                  <Navigation20Regular />
                </span>
                <span className={cn("hidden", SHOW_WIDE[shell.breakpoint])}>
                  <WideIcon className="rtl:-scale-x-100" />
                </span>
              </>
            }
            aria-label={label}
            aria-expanded={shell.narrow ? shell.drawerOpen : !shell.collapsed}
            aria-controls={shell.narrow ? undefined : shell.sidebarId}
            aria-keyshortcuts={key ? `Control+${key} Meta+${key}` : undefined}
            className={cn(shell.collapsible === "none" && HIDE_WIDE[shell.breakpoint], className)}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented) return;
              shell.triggerRef.current = e.currentTarget;
              shell.toggleSidebar();
            }}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          {label}
          {key && (
            <KbdGroup>
              <Kbd size="small">{modifier}</Kbd>
              <Kbd size="small">{key}</Kbd>
            </KbdGroup>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const RESIZE_STEP = 16;

/**
 * Mép sidebar. Bấm để thu gọn / mở rộng. Với Sidebar `resizable` (khi đang mở): thanh chia kéo đổi độ rộng theo mẫu
 * WAI-ARIA Window Splitter — mũi tên ±16px, Home / End về giới hạn, Enter thu gọn, nhấp đúp về độ rộng mặc định.
 */
export const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const shell = useShell("SidebarRail");
  const sidebar = React.useContext(SidebarContext);
  const msg = useYugenMessages("appShell", appShellMessagesEn);
  const dir = useDirection();
  if (!sidebar || sidebar.drawer || sidebar.collapsible === "none") return null;

  const line = cn(
    "h-full w-0.5 transition-colors duration-faster ease-easy-ease",
    "group-hover/rail:bg-brand-stroke group-focus-visible/rail:bg-brand-stroke group-data-resizing/rail:bg-brand-stroke",
  );
  const edge = "group/rail absolute inset-y-0 -inset-e-1 z-10 flex w-2 touch-none justify-center outline-none";

  if (!sidebar.resizable || shell.collapsed) {
    // Lối tắt cho chuột; bàn phím và trình đọc màn hình dùng SidebarTrigger / phím tắt nên không lặp lại ở đây.
    return (
      <div
        ref={ref}
        aria-hidden
        title={shell.collapsed ? msg.expandSidebar : msg.collapseSidebar}
        onClick={() => shell.setCollapsed(!shell.collapsed)}
        className={cn(edge, "cursor-pointer", className)}
        {...props}
      >
        <span className={line} />
      </div>
    );
  }

  const { width, minWidth, maxWidth, defaultWidth, setWidth, setResizing } = sidebar;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    let last = width;
    handle.setPointerCapture(event.pointerId);
    handle.setAttribute("data-resizing", "");
    setResizing(true);
    // Theo độ dịch của con trỏ (không theo vị trí tuyệt đối): chỗ nắm trên thanh chia không làm độ rộng nhảy.
    const move = (e: PointerEvent) => {
      last = width + (dir === "rtl" ? startX - e.clientX : e.clientX - startX);
      setWidth(last, false);
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      handle.removeAttribute("data-resizing");
      setResizing(false);
      setWidth(last, true);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const grow = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const shrink = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const next: Record<string, number> = {
      [grow]: width + RESIZE_STEP,
      [shrink]: width - RESIZE_STEP,
      Home: minWidth,
      End: maxWidth,
    };
    if (event.key === "Enter") {
      event.preventDefault();
      shell.setCollapsed(true);
    } else if (event.key in next) {
      event.preventDefault();
      setWidth(next[event.key], true);
    }
  };

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={msg.resizeSidebar}
      aria-controls={shell.sidebarId}
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuetext={`${width}px`}
      aria-keyshortcuts="Enter"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setWidth(defaultWidth, true)}
      className={cn(edge, "cursor-col-resize", className)}
      {...props}
    >
      <span className={line} />
    </div>
  );
});
SidebarRail.displayName = "SidebarRail";
