import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { useDirection } from "@radix-ui/react-direction";
import { Navigation20Regular, PanelLeftContract20Regular, PanelLeftExpand20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { Button, type ButtonProps } from "../Button/Button";
import { Drawer, DrawerSurface } from "../Drawer/Drawer";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { NavHostContext, type NavHostValue } from "../Nav/context";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { appShellMessages } from "./messages";

export { appShellMessages, appShellMessagesEn, type AppShellMessages } from "./messages";

/**
 * Khung ứng dụng: sidebar (rail chỉ icon khi thu gọn, Drawer khi khung hẹp), thanh trên cùng, nội dung chính và cột phụ.
 * Bố cục là lưới 3 cột × 2 hàng; mỗi phần tự đặt vào ô của nó, phần nào vắng thì cột / hàng đó rộng 0.
 */

/** Độ rộng khung (container query, rem) từ đó sidebar nằm trong bố cục; hẹp hơn thì thành Drawer. */
export type AppShellBreakpoint = "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
/** icon: thu về rail chỉ icon · offcanvas: ẩn hẳn · none: luôn mở trên màn rộng. */
export type SidebarCollapsible = "icon" | "offcanvas" | "none";

const BREAKPOINT_REM: Record<AppShellBreakpoint, number> = { lg: 32, xl: 36, "2xl": 42, "3xl": 48, "4xl": 56, "5xl": 64 };
/** Hiện từ breakpoint: sidebar, cột phụ, icon thu gọn của SidebarTrigger. */
const SHOW_WIDE: Record<AppShellBreakpoint, string> = {
  lg: "@lg/app-shell:flex",
  xl: "@xl/app-shell:flex",
  "2xl": "@2xl/app-shell:flex",
  "3xl": "@3xl/app-shell:flex",
  "4xl": "@4xl/app-shell:flex",
  "5xl": "@5xl/app-shell:flex",
};
/** Ẩn từ breakpoint: icon mở Drawer của SidebarTrigger. */
const HIDE_WIDE: Record<AppShellBreakpoint, string> = {
  lg: "@lg/app-shell:hidden",
  xl: "@xl/app-shell:hidden",
  "2xl": "@2xl/app-shell:hidden",
  "3xl": "@3xl/app-shell:hidden",
  "4xl": "@4xl/app-shell:hidden",
  "5xl": "@5xl/app-shell:hidden",
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface AppShellSavedState {
  collapsed: boolean;
  /** Chỉ có khi Sidebar `resizable` đã được kéo. */
  width?: number;
}

/**
 * Đọc trạng thái đã lưu theo `persistKey` từ chuỗi cookie: `document.cookie`, hoặc header Cookie khi render ở server
 * để truyền `defaultCollapsed` / `defaultWidth` và không nháy bố cục.
 */
export function readAppShellCookie(cookie: string | null | undefined, persistKey: string): AppShellSavedState | undefined {
  const name = `${encodeURIComponent(persistKey)}=`;
  const raw = cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name))
    ?.slice(name.length);
  if (!raw) return undefined;
  const [state, width] = raw.split(":");
  if (state !== "collapsed" && state !== "expanded") return undefined;
  const w = Number(width);
  return { collapsed: state === "collapsed", width: width && Number.isFinite(w) ? w : undefined };
}

function writeAppShellCookie(persistKey: string, { collapsed, width }: AppShellSavedState) {
  const value = `${collapsed ? "collapsed" : "expanded"}${width === undefined ? "" : `:${Math.round(width)}`}`;
  document.cookie = `${encodeURIComponent(persistKey)}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/** Phần tử còn hiển thị (không nằm trong nhánh display: none / bị gỡ khỏi DOM). */
function isShown(el: HTMLElement | null | undefined): el is HTMLElement {
  if (!el?.isConnected) return false;
  return typeof el.checkVisibility === "function" ? el.checkVisibility() : true;
}

/** Ô nhập chữ: phím tắt không cướp Ctrl+B (in đậm) hay phím đang gõ dở bằng bộ gõ (IME). */
function isTextEntry(target: EventTarget | null) {
  return target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null;
}

interface AppShellContextValue {
  narrow: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  breakpoint: AppShellBreakpoint;
  collapsible: SidebarCollapsible;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
  shortcut: string | false;
  mainId: string;
  sidebarId: string;
  mainRef: React.MutableRefObject<HTMLElement | null>;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  sidebarRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Focus đang (hoặc vừa) ở trong sidebar trên màn rộng. */
  sidebarFocused: React.MutableRefObject<boolean>;
  /** Phần tử giữ focus trước khi Drawer mở. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  savedWidth?: number;
  persistWidth: (width: number) => void;
  focusTriggerOrMain: () => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

function useShell(part: string) {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error(`${part} phải nằm trong <AppShell>.`);
  return ctx;
}

interface SidebarContextValue {
  drawer: boolean;
  rail: boolean;
  collapsible: SidebarCollapsible;
  resizable: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  setWidth: (width: number, persist: boolean) => void;
  setResizing: (resizing: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export interface AppShellState {
  /** Khung hẹp hơn `breakpoint`: sidebar là Drawer. */
  narrow: boolean;
  /** Sidebar thu gọn trên màn rộng (lưu theo `persistKey`). */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Drawer trên màn hẹp — không lưu, luôn đóng khi tải trang. */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /** Như SidebarTrigger: khung hẹp mở / đóng Drawer, khung rộng thu gọn / mở rộng. */
  toggleSidebar: () => void;
  /** Đang render trong Sidebar hiện dạng rail (chỉ icon). */
  rail: boolean;
}

/** Trạng thái của AppShell gần nhất, cho phần tự làm (ẩn khối trong rail, đóng Drawer sau một hành động…). */
export function useAppShell(): AppShellState {
  const shell = useShell("useAppShell()");
  const sidebar = React.useContext(SidebarContext);
  return {
    narrow: shell.narrow,
    collapsed: shell.collapsed,
    setCollapsed: shell.setCollapsed,
    drawerOpen: shell.drawerOpen,
    setDrawerOpen: shell.setDrawerOpen,
    toggleSidebar: shell.toggleSidebar,
    rail: !!sidebar?.rail,
  };
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Độ rộng khung từ đó sidebar nằm trong bố cục: lg 32rem · xl 36rem · 2xl 42rem · 3xl 48rem · 4xl 56rem · 5xl 64rem. */
  breakpoint?: AppShellBreakpoint;
  /** Sidebar thu gọn trên màn rộng (controlled). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Lưu trạng thái thu gọn (và độ rộng khi `resizable`) vào cookie tên này; giá trị đã lưu thắng `defaultCollapsed`.
   * Render ở server: đọc bằng `readAppShellCookie()` rồi truyền `defaultCollapsed` để không nháy.
   */
  persistKey?: string;
  /** Phím đi cùng Ctrl / ⌘ để mở / đóng sidebar; `false` để tắt. Bỏ qua khi đang gõ trong ô nhập hoặc bằng bộ gõ. */
  shortcut?: string | false;
  /** Skip link tới AppShellMain, hiện khi được focus. */
  skipLink?: boolean;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      breakpoint = "4xl",
      collapsed: collapsedProp,
      defaultCollapsed,
      onCollapsedChange,
      persistKey,
      shortcut = "b",
      skipLink = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("appShell", appShellMessages);
    const id = React.useId();
    const [saved] = React.useState(() =>
      persistKey && typeof document !== "undefined" ? readAppShellCookie(document.cookie, persistKey) : undefined,
    );
    const [innerCollapsed, setInnerCollapsed] = React.useState(saved?.collapsed ?? defaultCollapsed ?? false);
    const collapsed = collapsedProp ?? innerCollapsed;
    const [drawerOpen, setDrawerOpenState] = React.useState(false);
    const [narrow, setNarrow] = React.useState(false);
    const [collapsible, setCollapsible] = React.useState<SidebarCollapsible>("icon");

    const rootRef = React.useRef<HTMLDivElement>(null);
    const refs = useComposedRefs(ref, rootRef);
    const mainRef = React.useRef<HTMLElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const sidebarRef = React.useRef<HTMLDivElement | null>(null);
    const sidebarFocused = React.useRef(false);
    const returnFocusRef = React.useRef<HTMLElement | null>(null);
    const persisted = React.useRef<AppShellSavedState>({ collapsed, width: saved?.width });

    const setCollapsed = React.useCallback(
      (next: boolean) => {
        if (collapsedProp === undefined) setInnerCollapsed(next);
        persisted.current = { ...persisted.current, collapsed: next };
        if (persistKey) writeAppShellCookie(persistKey, persisted.current);
        onCollapsedChange?.(next);
      },
      [collapsedProp, persistKey, onCollapsedChange],
    );

    const persistWidth = React.useCallback(
      (width: number) => {
        persisted.current = { ...persisted.current, width };
        if (persistKey) writeAppShellCookie(persistKey, persisted.current);
      },
      [persistKey],
    );

    const setDrawerOpen = React.useCallback((open: boolean) => {
      if (open) {
        const active = document.activeElement;
        returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      }
      setDrawerOpenState(open);
    }, []);

    const focusTriggerOrMain = React.useCallback(() => {
      const trigger = triggerRef.current;
      if (isShown(trigger)) trigger.focus();
      else mainRef.current?.focus();
    }, []);

    const toggleSidebar = React.useCallback(() => {
      if (narrow) setDrawerOpen(!drawerOpen);
      else if (collapsible !== "none") setCollapsed(!collapsed);
    }, [narrow, drawerOpen, collapsible, collapsed, setDrawerOpen, setCollapsed]);

    // Đo khung (cùng mốc rem với container query) để biết sidebar đang là Drawer hay nằm trong bố cục.
    useIsomorphicLayoutEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const update = (width: number) => {
        // 0: chưa có layout (khối cha display: none, jsdom) — giữ giá trị cũ.
        if (width <= 0) return;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        setNarrow(width < BREAKPOINT_REM[breakpoint] * rem);
      };
      update(el.getBoundingClientRect().width);
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (entry) update(entry.contentRect.width);
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [breakpoint]);

    // Qua breakpoint: Drawer chỉ có trên màn hẹp nên đóng lại (focus về trigger hoặc nội dung qua onCloseAutoFocus);
    // sidebar trên màn rộng bị ẩn khi thu hẹp, nên focus đang ở trong nó chuyển ra trigger hoặc nội dung.
    const wasNarrow = React.useRef(narrow);
    React.useEffect(() => {
      if (wasNarrow.current === narrow) return;
      wasNarrow.current = narrow;
      if (!narrow) {
        setDrawerOpenState(false);
        return;
      }
      const active = document.activeElement;
      const lost = !active || active === document.body;
      if (sidebarFocused.current && (lost || sidebarRef.current?.contains(active))) {
        sidebarFocused.current = false;
        focusTriggerOrMain();
      }
    }, [narrow, focusTriggerOrMain]);

    const toggleRef = React.useRef(toggleSidebar);
    React.useEffect(() => {
      toggleRef.current = toggleSidebar;
    });
    React.useEffect(() => {
      if (!shortcut) return;
      const key = shortcut.toLowerCase();
      const code = /^[a-z]$/.test(key) ? `Key${key.toUpperCase()}` : undefined;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.defaultPrevented || e.repeat || e.isComposing || e.keyCode === 229) return;
        if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
        if (e.key.toLowerCase() !== key && e.code !== code) return;
        if (isTextEntry(e.target)) return;
        e.preventDefault();
        toggleRef.current();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [shortcut]);

    const ctx = React.useMemo<AppShellContextValue>(
      () => ({
        narrow,
        collapsed,
        setCollapsed,
        drawerOpen,
        setDrawerOpen,
        toggleSidebar,
        breakpoint,
        collapsible,
        setCollapsible,
        shortcut,
        mainId: `${id}-main`,
        sidebarId: `${id}-sidebar`,
        mainRef,
        triggerRef,
        sidebarRef,
        sidebarFocused,
        returnFocusRef,
        savedWidth: saved?.width,
        persistWidth,
        focusTriggerOrMain,
      }),
      [narrow, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggleSidebar, breakpoint, collapsible, shortcut, id, saved, persistWidth, focusTriggerOrMain],
    );

    return (
      <AppShellContext.Provider value={ctx}>
        <div
          ref={refs}
          className={cn(
            "@container/app-shell grid h-dvh grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)] bg-background-2 text-foreground-1",
            className,
          )}
          {...props}
        >
          {skipLink && (
            <a
              href={`#${ctx.mainId}`}
              onClick={(e) => {
                // Không đổi hash của URL (router dùng hash, khôi phục cuộn): focus thẳng vào nội dung.
                if (!mainRef.current) return;
                e.preventDefault();
                mainRef.current.focus();
              }}
              className="sr-only rounded-medium bg-background-1 px-3 py-2 text-body1 font-semibold text-foreground-1 shadow-8 focus:not-sr-only focus:fixed focus:inset-s-2 focus:top-2 focus:z-50"
            >
              {msg.skipToContent}
            </a>
          )}
          {children}
        </div>
      </AppShellContext.Provider>
    );
  },
);
AppShell.displayName = "AppShell";

type PartProps = React.HTMLAttributes<HTMLElement> & {
  /** Đổi thẻ (vd. `div` khi khung nằm trong một trang đã có landmark). */
  asChild?: boolean;
};

/** Thanh trên cùng, bên cạnh sidebar. */
export const AppShellHeader = React.forwardRef<HTMLElement, PartProps>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "header";
  return (
    <Comp
      ref={ref}
      className={cn(
        "col-[2/-1] row-start-1 flex h-14 min-w-0 items-center gap-2 border-b border-stroke-2 bg-background-1 px-3 @lg/app-shell:px-4",
        className,
      )}
      {...props}
    />
  );
});
AppShellHeader.displayName = "AppShellHeader";

/** Nội dung chính: vùng cuộn, đích của skip link và nơi nhận focus khi trigger không còn hiển thị. */
export const AppShellMain = React.forwardRef<HTMLElement, PartProps>(({ asChild, className, ...props }, ref) => {
  const shell = useShell("AppShellMain");
  const refs = useComposedRefs(ref, shell.mainRef);
  const Comp = asChild ? Slot : "main";
  return (
    <Comp
      ref={refs}
      id={shell.mainId}
      tabIndex={-1}
      className={cn("col-start-2 row-start-2 min-h-0 min-w-0 overflow-y-auto outline-none", className)}
      {...props}
    />
  );
});
AppShellMain.displayName = "AppShellMain";

/** Cột phụ bên cạnh nội dung (chi tiết, bộ lọc…). Ẩn khi khung hẹp hơn `breakpoint`. */
export const AppShellAside = React.forwardRef<HTMLElement, PartProps>(({ asChild, className, ...props }, ref) => {
  const shell = useShell("AppShellAside");
  const Comp = asChild ? Slot : "aside";
  return (
    <Comp
      ref={ref}
      className={cn(
        "col-start-3 row-start-2 hidden min-h-0 w-72 flex-col overflow-y-auto border-s border-stroke-2 bg-background-1",
        SHOW_WIDE[shell.breakpoint],
        className,
      )}
      {...props}
    />
  );
});
AppShellAside.displayName = "AppShellAside";

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
    const msg = useYugenMessages("appShell", appShellMessages);
    const refs = useComposedRefs(ref, shell.sidebarRef);
    const clamp = (width: number) => Math.round(Math.min(maxWidth, Math.max(minWidth, width)));
    const [width, setWidthState] = React.useState(() =>
      clamp(resizable && shell.savedWidth !== undefined ? shell.savedWidth : defaultWidth),
    );
    const [resizing, setResizing] = React.useState(false);

    const { setCollapsible, setCollapsed, setDrawerOpen, persistWidth } = shell;
    useIsomorphicLayoutEffect(() => setCollapsible(collapsible), [collapsible, setCollapsible]);

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
              "relative col-start-1 row-span-full hidden min-h-0 flex-col border-e border-stroke-2 bg-background-1 text-foreground-1",
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
      "flex h-14 shrink-0 items-center gap-2 border-b border-stroke-2 px-4 in-data-rail:justify-center in-data-rail:px-0",
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

/** Nút mở / thu gọn sidebar: màn hẹp mở Drawer, màn rộng thu về rail (hoặc ẩn khi `collapsible="offcanvas"`). */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, onClick, ...props }, ref) => {
  const shell = useShell("SidebarTrigger");
  const msg = useYugenMessages("appShell", appShellMessages);
  const refs = useComposedRefs(ref, shell.triggerRef);
  const WideIcon = shell.collapsed ? PanelLeftExpand20Regular : PanelLeftContract20Regular;
  const key = shell.shortcut ? shell.shortcut.toUpperCase() : undefined;
  return (
    <Button
      ref={refs}
      appearance="subtle"
      // Icon theo container query (đúng ngay từ lần vẽ đầu); nhãn theo kích thước đo được. Ẩn / hiện bằng span bọc
      // ngoài: CSS của icon Fluent không nằm trong layer nên thắng `hidden` đặt thẳng lên svg.
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
      aria-label={shell.narrow ? msg.openSidebar : shell.collapsed ? msg.expandSidebar : msg.collapseSidebar}
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
  const msg = useYugenMessages("appShell", appShellMessages);
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
