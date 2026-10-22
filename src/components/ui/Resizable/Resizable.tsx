import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  type GroupImperativeHandle,
  type GroupProps,
  type LayoutStorage,
  type PanelImperativeHandle,
  type PanelProps,
  type SeparatorProps,
} from "react-resizable-panels";
import {
  ChevronDown16Regular,
  ChevronLeft16Regular,
  ChevronRight16Regular,
  ChevronUp16Regular,
  ReOrderDotsVertical16Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";

/**
 * shadcn Resizable — https://ui.shadcn.com/docs/components/resizable
 * (react-resizable-panels v4: Group / Panel / Separator; kích thước số = px, chuỗi "30%" = phần trăm).
 *
 * Yugen Labs: nút thu gọn / mở rộng trên đường chia, lưu bố cục (persistKey) và RTL lật thứ tự hiển thị.
 * Ở nhóm ngang RTL, Yugen lật bố cục bằng `dir="rtl"`. Thư viện (≥ 4.14) sắp panel theo vị trí hiển thị
 * (offsetLeft) nên kéo và ArrowLeft / ArrowRight tự đi theo hướng nhìn thấy — không phát lại / đảo sự kiện
 * (bản cũ đảo dấu thêm lần nữa khiến đường chia chạy ngược con trỏ).
 */

type Orientation = "horizontal" | "vertical";

interface ResizableGroupContextValue {
  orientation: Orientation;
  /** Nhóm ngang đang lật theo RTL (để lật icon chevron của nút thu gọn). */
  mirrored: boolean;
  panels: React.MutableRefObject<Map<string, PanelImperativeHandle>>;
  collapsed: Record<string, boolean>;
  setCollapsed: (id: string, value: boolean) => void;
}

const ResizableGroupContext = React.createContext<ResizableGroupContextValue | null>(null);

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

/* ------------------------------------------------------------------ cầu nối sự kiện (nút thu gọn) */
let bridgeUsers = 0;

function isAction(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-resizable-action]") !== null;
}

function onPointerDownCapture(event: PointerEvent) {
  // Nút thu gọn nằm trên đường chia: không để thư viện coi cú bấm là bắt đầu kéo.
  if (isAction(event.target)) event.preventDefault();
}

function onDoubleClickCapture(event: MouseEvent) {
  // Nhấp đúp vào nút thu gọn không được kích hoạt "đặt lại kích thước" của separator.
  if (isAction(event.target)) event.preventDefault();
}

function retainBridge() {
  if (bridgeUsers++ === 0) {
    window.addEventListener("pointerdown", onPointerDownCapture, true);
    window.addEventListener("dblclick", onDoubleClickCapture, true);
  }
  return () => {
    if (--bridgeUsers > 0) return;
    window.removeEventListener("pointerdown", onPointerDownCapture, true);
    window.removeEventListener("dblclick", onDoubleClickCapture, true);
  };
}

/* ------------------------------------------------------------------ lưu bố cục */
/**
 * localStorage bọc try/catch: chế độ riêng tư, hết hạn mức hoặc bị chặn cookie thì chỉ bỏ qua.
 * Giá trị hỏng (không phải JSON) coi như chưa lưu — thư viện parse không bắt lỗi.
 */
const safeLocalStorage: LayoutStorage = {
  getItem(key) {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* không lưu được — giữ bố cục trong phiên hiện tại */
    }
  },
};
const noopStorage: LayoutStorage = { getItem: () => null, setItem: () => {} };

/* ------------------------------------------------------------------ ResizablePanelGroup */
export interface ResizablePanelGroupProps extends GroupProps {
  /**
   * Lưu bố cục vào localStorage (khoá `react-resizable-panels:<persistKey>`) sau mỗi lần kéo và khôi phục khi tải lại.
   * Đặt `id` cố định cho từng ResizablePanel để bố cục khớp đúng panel.
   */
  persistKey?: string;
  /** RTL: nhóm ngang hiển thị theo thứ tự phải → trái (mặc định). false = giữ bố cục LTR như trước. */
  mirrorInRtl?: boolean;
}

export function ResizablePanelGroup({ persistKey, ...props }: ResizablePanelGroupProps) {
  // Chỉ nhóm có persistKey mới gọi useDefaultLayout (hook của thư viện đọc localStorage và dùng useLayoutEffect
  // trực tiếp → React 18 cảnh báo khi SSR).
  return persistKey ? <PersistedPanelGroup persistKey={persistKey} {...props} /> : <PanelGroup {...props} />;
}

const subscribeNothing = () => () => {};

/**
 * Nhóm có lưu bố cục. Khi SSR và lúc hydration chưa đọc localStorage để HTML khớp server (tránh lệch `style` của panel);
 * bố cục đã lưu được áp ngay sau hydration qua API mệnh lệnh. Render thuần client: đọc ngay từ lần mount đầu.
 */
function PersistedPanelGroup({
  persistKey,
  defaultLayout,
  onLayoutChanged,
  groupRef,
  ...props
}: ResizablePanelGroupProps & { persistKey: string }) {
  const hydrating = React.useSyncExternalStore(subscribeNothing, () => false, () => true);
  const persisted = useDefaultLayout({ id: persistKey, storage: hydrating ? noopStorage : safeLocalStorage });
  const api = React.useRef<GroupImperativeHandle | null>(null);
  const restoreAfterHydration = React.useRef(hydrating);

  React.useEffect(() => {
    if (hydrating || !restoreAfterHydration.current) return;
    restoreAfterHydration.current = false;
    if (defaultLayout === undefined && persisted.defaultLayout) api.current?.setLayout(persisted.defaultLayout);
  }, [hydrating, defaultLayout, persisted.defaultLayout]);

  const setGroupRef = React.useCallback(
    (handle: GroupImperativeHandle | null) => {
      api.current = handle;
      setRef(groupRef, handle);
    },
    [groupRef],
  );

  return (
    <PanelGroup
      {...props}
      groupRef={setGroupRef}
      defaultLayout={defaultLayout ?? persisted.defaultLayout}
      onLayoutChanged={(layout, meta) => {
        persisted.onLayoutChanged(layout, meta);
        onLayoutChanged?.(layout, meta);
      }}
    />
  );
}

function PanelGroup({
  className,
  dir,
  orientation = "horizontal",
  mirrorInRtl = true,
  resizeTargetMinimumSize,
  ...props
}: Omit<ResizablePanelGroupProps, "persistKey">) {
  const contextDir = useDirection();
  const horizontalRtl = orientation === "horizontal" && contextDir === "rtl" && dir === undefined;
  const mirrored = horizontalRtl && mirrorInRtl;
  // Không lật: ép LTR để kéo đúng chiều (ResizablePanel trả lại hướng chữ cho nội dung).
  const groupDir = dir ?? (horizontalRtl ? (mirrorInRtl ? "rtl" : "ltr") : undefined);

  const panels = React.useRef(new Map<string, PanelImperativeHandle>());
  const [collapsed, setCollapsedState] = React.useState<Record<string, boolean>>({});
  const setCollapsed = React.useCallback((id: string, value: boolean) => {
    setCollapsedState((current) => (current[id] === value ? current : { ...current, [id]: value }));
  }, []);

  const context = React.useMemo<ResizableGroupContextValue>(
    () => ({ orientation, mirrored, panels, collapsed, setCollapsed }),
    [orientation, mirrored, collapsed, setCollapsed],
  );

  return (
    <ResizableGroupContext.Provider value={context}>
      <Group
        dir={groupDir}
        orientation={orientation}
        resizeTargetMinimumSize={resizeTargetMinimumSize}
        className={cn("size-full", className)}
        {...props}
      />
    </ResizableGroupContext.Provider>
  );
}

/* ------------------------------------------------------------------ ResizablePanel */
export type ResizablePanelProps = PanelProps;

export function ResizablePanel({ dir, id, panelRef, onResize, ...props }: ResizablePanelProps) {
  const contextDir = useDirection();
  const group = React.useContext(ResizableGroupContext);
  const autoId = React.useId();
  const panelId = id !== undefined ? String(id) : autoId;
  const handleRef = React.useRef<PanelImperativeHandle | null>(null);

  const setHandle = React.useCallback(
    (handle: PanelImperativeHandle | null) => {
      handleRef.current = handle;
      if (group) {
        if (handle) group.panels.current.set(panelId, handle);
        else group.panels.current.delete(panelId);
      }
      setRef(panelRef, handle);
    },
    [group, panelId, panelRef],
  );

  return (
    <Panel
      id={id ?? panelId}
      dir={dir ?? (contextDir === "rtl" ? "rtl" : undefined)}
      panelRef={setHandle}
      onResize={(size, resizedId, prevSize) => {
        onResize?.(size, resizedId, prevSize);
        try {
          group?.setCollapsed(panelId, handleRef.current?.isCollapsed() ?? false);
        } catch {
          /* panel chưa đăng ký xong với group */
        }
      }}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ ResizableHandle */
export interface ResizableHandleProps extends SeparatorProps {
  /** Hiện tay nắm (grip) ở giữa đường chia. */
  withHandle?: boolean;
  /**
   * Nút thu gọn / mở rộng panel phía trước ("before" — trên / đầu dòng) hoặc phía sau ("after") đường chia.
   * Panel đó phải `collapsible`. Bàn phím: Enter trên đường chia làm cùng việc.
   */
  collapseButton?: "before" | "after";
  collapseLabel?: string;
  expandLabel?: string;
}

function adjacentPanelId(separator: HTMLElement, side: "before" | "after") {
  let el = side === "before" ? separator.previousElementSibling : separator.nextElementSibling;
  while (el && !el.hasAttribute("data-panel")) el = side === "before" ? el.previousElementSibling : el.nextElementSibling;
  return el?.id || null;
}

export function ResizableHandle({
  withHandle = false,
  collapseButton,
  collapseLabel = "Thu gọn panel",
  expandLabel = "Mở rộng panel",
  className,
  elementRef,
  onKeyDownCapture,
  children,
  ...props
}: ResizableHandleProps) {
  const group = React.useContext(ResizableGroupContext);
  const orientation = group?.orientation ?? "horizontal";
  const mirrored = group?.mirrored ?? false;
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const [targetId, setTargetId] = React.useState<string | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      setRef(elementRef, node);
    },
    [elementRef],
  );

  // Panel đích của nút thu gọn: panel liền trước / liền sau trong DOM (thứ tự logic, đúng cả khi lật RTL).
  useIsomorphicLayoutEffect(() => {
    const id = element && collapseButton ? adjacentPanelId(element, collapseButton) : null;
    setTargetId((current) => (current === id ? current : id));
  });

  React.useEffect(() => (collapseButton ? retainBridge() : undefined), [collapseButton]);

  const isCollapsed = targetId ? (group?.collapsed[targetId] ?? false) : false;
  const toggle = () => {
    const handle = targetId ? group?.panels.current.get(targetId) : undefined;
    if (!handle) return;
    if (handle.isCollapsed()) handle.expand();
    else handle.collapse();
  };

  const horizontal = orientation === "horizontal";
  // Chevron chỉ về phía panel sẽ thu vào; khi đã thu gọn thì chỉ hướng ngược lại.
  const towardStart = (collapseButton === "before") !== isCollapsed;
  const ChevronIcon = horizontal
    ? towardStart
      ? ChevronLeft16Regular
      : ChevronRight16Regular
    : towardStart
      ? ChevronUp16Regular
      : ChevronDown16Regular;

  return (
    <Separator
      elementRef={setRefs}
      aria-keyshortcuts={collapseButton ? "Enter" : undefined}
      data-mirrored={mirrored || undefined}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        // Enter thu gọn / mở rộng đúng panel đích của nút (liền trước / sau đường chia trong DOM).
        if (collapseButton && event.key === "Enter") {
          event.preventDefault();
          toggle();
        }
      }}
      className={cn(
        "group/handle relative flex shrink-0 items-center justify-center bg-stroke-2",
        "transition-colors duration-faster ease-easy-ease",
        // Group ngang → separator aria-orientation="vertical" (đường dọc) và ngược lại.
        "aria-[orientation=vertical]:w-px aria-[orientation=horizontal]:h-px",
        "hover:bg-brand-stroke focus-visible:bg-brand-stroke data-[separator=active]:bg-brand-stroke data-[separator=hover]:bg-brand-stroke",
        "data-[separator=disabled]:bg-stroke-disabled",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <span
          className={cn(
            "z-10 flex h-4 w-3 shrink-0 items-center justify-center rounded-small border border-stroke-1 bg-background-1 text-foreground-3",
            "transition-colors duration-faster ease-easy-ease group-aria-[orientation=horizontal]/handle:rotate-90",
            "group-data-[separator=active]/handle:border-brand-stroke group-data-[separator=active]/handle:text-brand-foreground-1",
          )}
        >
          <ReOrderDotsVertical16Regular className="size-2.5" />
        </span>
      )}
      {collapseButton && (
        // Bản sao cho chuột / cảm ứng của phím Enter trên đường chia → ẩn khỏi cây truy cập, không nhận focus
        // (span thay vì button: separator đã là control, không được chứa phần tử focus được — axe nested-interactive).
        <span
          aria-hidden
          data-resizable-action=""
          title={isCollapsed ? expandLabel : collapseLabel}
          onClick={() => {
            toggle();
            element?.focus({ preventScroll: true });
          }}
          className={cn(
            "absolute z-10 flex size-5 cursor-pointer items-center justify-center rounded-circular border border-stroke-1 bg-background-1 text-foreground-2 shadow-2",
            "transition-colors duration-faster ease-easy-ease hover:border-brand-stroke hover:text-brand-foreground-1 active:bg-background-1-pressed",
            // Panel đích đã thu về 0 thì đường chia nằm sát mép nhóm → đẩy nút vào trong để không bị cắt.
            horizontal
              ? cn("top-3", !isCollapsed ? "left-1/2 -translate-x-1/2" : collapseButton === "before" ? "inset-s-0" : "inset-e-0")
              : cn("inset-s-3", !isCollapsed ? "top-1/2 -translate-y-1/2" : collapseButton === "before" ? "top-0" : "bottom-0"),
          )}
        >
          <ChevronIcon className={cn("size-3", horizontal && mirrored && "-scale-x-100")} />
        </span>
      )}
      {children}
    </Separator>
  );
}
