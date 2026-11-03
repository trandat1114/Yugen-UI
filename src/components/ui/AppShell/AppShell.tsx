import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import { useYugenMessages } from "../YugenProvider/context";
import { useComposedRefs } from "../_internal/composeRefs";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import {
  AppShellContext,
  isShown,
  SHOW_WIDE,
  SidebarContext,
  useShell,
  type AppShellBreakpoint,
  type AppShellContextValue,
  type AppShellLayout,
  type AppShellScroll,
  type SidebarCollapsible,
} from "./context";
import { appShellMessagesEn } from "./messages";

export { appShellMessages, appShellMessagesVi, appShellMessagesEn, type AppShellMessages } from "./messages";
export type { AppShellBreakpoint, AppShellLayout, AppShellScroll } from "./context";

/**
 * Khung ứng dụng: sidebar (rail chỉ icon khi thu gọn, Drawer khi khung hẹp), thanh trên cùng, nội dung chính và cột phụ.
 * Bố cục là lưới 3 cột × 2 hàng; mỗi phần tự đặt vào ô của nó, phần nào vắng thì cột / hàng đó rộng 0.
 */

const BREAKPOINT_REM: Record<AppShellBreakpoint, number> = { lg: 32, xl: 36, "2xl": 42, "3xl": 48, "4xl": 56, "5xl": 64 };

/*
 * Vị trí trong lưới theo bố cục. Chiều cao thanh trên cùng (`--app-shell-header`, mặc định 3.5rem) và phần trang còn
 * thấy (`--app-shell-viewport`, mặc định 100dvh) là biến CSS để các phần dính khớp nhau.
 */
const HEADER_AREA: Record<AppShellLayout, string> = { sidebar: "col-[2/-1]", header: "col-span-full" };
const ASIDE_STICKY =
  "sticky top-(--app-shell-header,3.5rem) max-h-[calc(var(--app-shell-viewport,100dvh)-var(--app-shell-header,3.5rem))] self-start";

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

/** Ô nhập chữ: phím tắt không cướp Ctrl+B (in đậm) hay phím đang gõ dở bằng bộ gõ (IME). */
function isTextEntry(target: EventTarget | null) {
  return target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null;
}

/*
 * Một trang có thể có nhiều AppShell (docs, trang demo): phím tắt chỉ đổi một khung. Khung gốc và Drawer (nằm trong
 * portal) mang `data-app-shell` = id của khung.
 */
const shortcutShells = new Set<string>();
let lastPointerShell: string | null = null;
let trackingPointer = false;

function shellOf(target: EventTarget | null) {
  return target instanceof Element ? (target.closest("[data-app-shell]")?.getAttribute("data-app-shell") ?? null) : null;
}

function trackPointer() {
  if (trackingPointer) return;
  trackingPointer = true;
  document.addEventListener("pointerdown", (e) => (lastPointerShell = shellOf(e.target)), true);
}

/** Khung nhận phím tắt: khung đang chứa focus; không có thì khung vừa được bấm vào; trang chỉ có một khung thì khung đó. */
function shortcutOwner(target: EventTarget | null) {
  const focused = shellOf(target);
  if (focused) return focused;
  if (lastPointerShell && shortcutShells.has(lastPointerShell)) return lastPointerShell;
  return shortcutShells.size === 1 ? [...shortcutShells][0] : null;
}

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
  /**
   * Phím đi cùng Ctrl / ⌘ để mở / đóng sidebar; `false` để tắt. Bỏ qua khi đang gõ trong ô nhập hoặc bằng bộ gõ.
   * Trang có nhiều AppShell: chỉ khung đang chứa focus (hoặc vừa được bấm vào) nhận phím.
   */
  shortcut?: string | false;
  /** Skip link tới AppShellMain, hiện khi được focus. */
  skipLink?: boolean;
  /** sidebar: sidebar cao hết khung · header: thanh trên cùng trải ngang, sidebar bên dưới. */
  layout?: AppShellLayout;
  /**
   * main: khung cao bằng màn hình, AppShellMain cuộn (ứng dụng). page: cả trang cuộn, thanh trên cùng và sidebar dính lại
   * (site nội dung). Đặt khung trong một vùng tự cuộn (`h-full min-h-0 overflow-y-auto`) thì vùng đó thay cho cửa sổ.
   */
  scroll?: AppShellScroll;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      breakpoint = "4xl",
      layout = "sidebar",
      scroll = "main",
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
    const msg = useYugenMessages("appShell", appShellMessagesEn);
    const id = React.useId();
    const [saved] = React.useState(() =>
      persistKey && typeof document !== "undefined" ? readAppShellCookie(document.cookie, persistKey) : undefined,
    );
    const [collapsed, setCollapsedState] = useControllableState({
      value: collapsedProp,
      defaultValue: saved?.collapsed ?? defaultCollapsed ?? false,
      onChange: onCollapsedChange,
    });
    const [drawerOpen, setDrawerOpenState] = React.useState(false);
    const [narrow, setNarrow] = React.useState(false);
    const [collapsible, setCollapsible] = React.useState<SidebarCollapsible | null>(null);

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
        persisted.current = { ...persisted.current, collapsed: next };
        if (persistKey) writeAppShellCookie(persistKey, persisted.current);
        setCollapsedState(next);
      },
      [persistKey, setCollapsedState],
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

    // Có gì để mở / đóng không: cần một Sidebar, và trên màn rộng nó phải thu gọn được.
    const canToggle = collapsible !== null && (narrow || collapsible !== "none");
    const toggleSidebar = React.useCallback(() => {
      if (!canToggle) return;
      if (narrow) setDrawerOpen(!drawerOpen);
      else setCollapsed(!collapsed);
    }, [canToggle, narrow, drawerOpen, collapsed, setDrawerOpen, setCollapsed]);

    // Đo khung (cùng mốc rem với container query) để biết sidebar đang là Drawer hay nằm trong bố cục.
    useIsomorphicLayoutEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const update = (width: number) => {
        // Cuộn cả trang trong một vùng tự cuộn (preview nhúng): phần còn thấy là chiều cao vùng đó, không phải màn hình.
        if (scroll === "page" && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
          el.style.setProperty("--app-shell-viewport", `${el.clientHeight}px`);
        } else el.style.removeProperty("--app-shell-viewport");
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
    }, [breakpoint, scroll]);

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
    const canToggleRef = React.useRef(canToggle);
    React.useEffect(() => {
      toggleRef.current = toggleSidebar;
      canToggleRef.current = canToggle;
    });
    React.useEffect(() => {
      if (!shortcut) return;
      const key = shortcut.toLowerCase();
      const code = /^[a-z]$/.test(key) ? `Key${key.toUpperCase()}` : undefined;
      shortcutShells.add(id);
      trackPointer();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.defaultPrevented || e.repeat || e.isComposing || e.keyCode === 229) return;
        if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
        if (e.key.toLowerCase() !== key && e.code !== code) return;
        // Không có gì để đổi (chưa có Sidebar): để phím cho trình duyệt.
        if (!canToggleRef.current || isTextEntry(e.target) || shortcutOwner(e.target) !== id) return;
        e.preventDefault();
        toggleRef.current();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        shortcutShells.delete(id);
        if (lastPointerShell === id) lastPointerShell = null;
        window.removeEventListener("keydown", onKeyDown);
      };
    }, [shortcut, id]);

    const ctx = React.useMemo<AppShellContextValue>(
      () => ({
        narrow,
        collapsed,
        setCollapsed,
        drawerOpen,
        setDrawerOpen,
        toggleSidebar,
        breakpoint,
        layout,
        scroll,
        collapsible,
        setCollapsible,
        shortcut,
        shellId: id,
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
      [
        narrow,
        collapsed,
        setCollapsed,
        drawerOpen,
        setDrawerOpen,
        toggleSidebar,
        breakpoint,
        layout,
        scroll,
        collapsible,
        shortcut,
        id,
        saved,
        persistWidth,
        focusTriggerOrMain,
      ],
    );

    return (
      <AppShellContext.Provider value={ctx}>
        <div
          ref={refs}
          data-app-shell={id}
          data-scroll={scroll}
          className={cn(
            "@container/app-shell grid grid-cols-[auto_minmax(0,1fr)_auto] bg-background-2 text-foreground-1",
            // Hàng giữa của "page" lớn theo nội dung (trang dài ra); của "main" bị giới hạn để AppShellMain tự cuộn.
            scroll === "page" ? "min-h-dvh grid-rows-[auto_1fr_auto]" : "h-dvh grid-rows-[auto_minmax(0,1fr)_auto]",
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

/** Thanh trên cùng: bên cạnh sidebar, hoặc trải ngang với `layout="header"`. Cao `--app-shell-header` (3.5rem). */
export const AppShellHeader = React.forwardRef<HTMLElement, PartProps>(({ asChild, className, ...props }, ref) => {
  const shell = useShell("AppShellHeader");
  const Comp = asChild ? Slot : "header";
  return (
    <Comp
      ref={ref}
      className={cn(
        "row-start-1 flex h-(--app-shell-header,3.5rem) min-w-0 items-center gap-2 border-b border-stroke-2 bg-background-1 px-3 @lg/app-shell:px-4",
        HEADER_AREA[shell.layout],
        shell.scroll === "page" && "sticky top-0 z-10",
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
      className={cn("col-start-2 row-start-2 min-w-0 outline-none", shell.scroll === "main" && "min-h-0 overflow-y-auto", className)}
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
        "col-start-3 row-start-2 hidden w-72 flex-col overflow-y-auto border-s border-stroke-2 bg-background-1",
        shell.scroll === "page" ? ASIDE_STICKY : "min-h-0",
        SHOW_WIDE[shell.breakpoint],
        className,
      )}
      {...props}
    />
  );
});
AppShellAside.displayName = "AppShellAside";

/** Cuối trang, dưới nội dung và cột phụ. `scroll="page"`: ở cuối trang; `"main"`: luôn thấy ở đáy khung. */
export const AppShellFooter = React.forwardRef<HTMLElement, PartProps>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "footer";
  return (
    <Comp
      ref={ref}
      className={cn("col-[2/-1] row-start-3 min-w-0 border-t border-stroke-2 bg-background-1", className)}
      {...props}
    />
  );
});
AppShellFooter.displayName = "AppShellFooter";
