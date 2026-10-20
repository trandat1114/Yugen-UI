import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import {
  Group,
  Panel,
  Separator,
  isCoarsePointer,
  useDefaultLayout,
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

/**
 * shadcn Resizable — https://ui.shadcn.com/docs/components/resizable
 * (react-resizable-panels v4: Group / Panel / Separator; kích thước số = px, chuỗi "30%" = phần trăm).
 *
 * Yugen Labs: nút thu gọn / mở rộng trên đường chia, lưu bố cục (persistKey) và RTL lật thứ tự hiển thị.
 * Thư viện chỉ biết trục X vật lý: ở nhóm ngang RTL, Yugen lật bố cục bằng `dir="rtl"` rồi đảo dấu
 * thao tác kéo (sự kiện con trỏ được phát lại với clientX đối xứng) và đổi vai ArrowLeft / ArrowRight.
 */

type Orientation = "horizontal" | "vertical";
type HitSize = { coarse: number; fine: number };

/** Kích thước vùng bắt chuột mặc định của thư viện (px). */
const DEFAULT_HIT_SIZE: HitSize = { coarse: 20, fine: 10 };

interface ResizableGroupContextValue {
  orientation: Orientation;
  /** Nhóm ngang đang lật theo RTL — thao tác kéo / phím cần đảo chiều. */
  mirrored: boolean;
  hitSize: HitSize;
  panels: React.MutableRefObject<Map<string, PanelImperativeHandle>>;
  collapsed: Record<string, boolean>;
  setCollapsed: (id: string, value: boolean) => void;
}

const ResizableGroupContext = React.createContext<ResizableGroupContextValue | null>(null);

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

/* ------------------------------------------------------------------ cầu nối sự kiện (RTL + nút thu gọn) */
const syntheticEvents = new WeakSet<Event>();
const mirroredSeparators = new Set<{ element: HTMLElement; hitSize: HitSize }>();
let bridgeUsers = 0;
let pendingDrag: { pointerId: number; startX: number } | null = null;
let mirroredDrag: { pointerId: number; startX: number } | null = null;

function isAction(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-resizable-action]") !== null;
}

/** Vùng bắt giống thư viện: rect của separator nới tới kích thước tối thiểu (+1px dự phòng làm tròn). */
function hitsMirroredSeparator(event: PointerEvent) {
  for (const { element, hitSize } of mirroredSeparators) {
    const rect = element.getBoundingClientRect();
    const min = isCoarsePointer() ? hitSize.coarse : hitSize.fine;
    const halfWidth = Math.max(rect.width, min) / 2 + 1;
    const halfHeight = Math.max(rect.height, min) / 2 + 1;
    if (
      Math.abs(event.clientX - (rect.left + rect.width / 2)) <= halfWidth &&
      Math.abs(event.clientY - (rect.top + rect.height / 2)) <= halfHeight
    ) {
      return true;
    }
  }
  return false;
}

/** Chặn sự kiện thật và phát lại bản đối xứng qua điểm bắt đầu kéo → thư viện tính delta ngược dấu. */
function redispatchMirrored(event: PointerEvent, startX: number) {
  event.stopImmediatePropagation();
  const clone = new PointerEvent(event.type, {
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
    clientX: 2 * startX - event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
    movementX: -event.movementX,
    movementY: event.movementY,
    button: event.button,
    buttons: event.buttons,
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    isPrimary: event.isPrimary,
    pressure: event.pressure,
    width: event.width,
    height: event.height,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
  });
  syntheticEvents.add(clone);
  (event.target ?? document).dispatchEvent(clone);
}

function onPointerDownCapture(event: PointerEvent) {
  if (syntheticEvents.has(event)) return;
  pendingDrag = null;
  // Nút thu gọn nằm trên đường chia: không để thư viện coi cú bấm là bắt đầu kéo.
  if (isAction(event.target)) {
    event.preventDefault();
    return;
  }
  if (mirroredSeparators.size > 0 && hitsMirroredSeparator(event)) {
    pendingDrag = { pointerId: event.pointerId, startX: event.clientX };
  }
}

function onPointerDownBubble(event: PointerEvent) {
  // Thư viện gọi preventDefault() khi thật sự bắt đầu kéo một separator.
  mirroredDrag = pendingDrag && event.defaultPrevented && pendingDrag.pointerId === event.pointerId ? pendingDrag : null;
  pendingDrag = null;
}

function onPointerMoveCapture(event: PointerEvent) {
  if (!mirroredDrag || syntheticEvents.has(event) || event.pointerId !== mirroredDrag.pointerId) return;
  redispatchMirrored(event, mirroredDrag.startX);
}

function onPointerEndCapture(event: PointerEvent) {
  if (!mirroredDrag || syntheticEvents.has(event) || event.pointerId !== mirroredDrag.pointerId) return;
  const { startX } = mirroredDrag;
  mirroredDrag = null;
  if (event.type === "pointerup") redispatchMirrored(event, startX);
}

function onPointerLeaveCapture(event: PointerEvent) {
  if (!mirroredDrag || syntheticEvents.has(event) || event.target !== document) return;
  redispatchMirrored(event, mirroredDrag.startX);
}

function onDoubleClickCapture(event: MouseEvent) {
  // Nhấp đúp vào nút thu gọn không được kích hoạt "đặt lại kích thước" của separator.
  if (isAction(event.target)) event.preventDefault();
}

function onWindowBlur() {
  pendingDrag = null;
  mirroredDrag = null;
}

function retainBridge() {
  if (bridgeUsers++ === 0) {
    window.addEventListener("pointerdown", onPointerDownCapture, true);
    window.addEventListener("pointerdown", onPointerDownBubble);
    window.addEventListener("pointermove", onPointerMoveCapture, true);
    window.addEventListener("pointerup", onPointerEndCapture, true);
    window.addEventListener("pointercancel", onPointerEndCapture, true);
    window.addEventListener("pointerleave", onPointerLeaveCapture, true);
    window.addEventListener("dblclick", onDoubleClickCapture, true);
    window.addEventListener("blur", onWindowBlur);
  }
  return () => {
    if (--bridgeUsers > 0) return;
    window.removeEventListener("pointerdown", onPointerDownCapture, true);
    window.removeEventListener("pointerdown", onPointerDownBubble);
    window.removeEventListener("pointermove", onPointerMoveCapture, true);
    window.removeEventListener("pointerup", onPointerEndCapture, true);
    window.removeEventListener("pointercancel", onPointerEndCapture, true);
    window.removeEventListener("pointerleave", onPointerLeaveCapture, true);
    window.removeEventListener("dblclick", onDoubleClickCapture, true);
    window.removeEventListener("blur", onWindowBlur);
    pendingDrag = null;
    mirroredDrag = null;
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

export function ResizablePanelGroup({
  className,
  dir,
  orientation = "horizontal",
  persistKey,
  mirrorInRtl = true,
  defaultLayout,
  onLayoutChanged,
  resizeTargetMinimumSize,
  ...props
}: ResizablePanelGroupProps) {
  const contextDir = useDirection();
  const horizontalRtl = orientation === "horizontal" && contextDir === "rtl" && dir === undefined;
  const mirrored = horizontalRtl && mirrorInRtl;
  // Không lật: ép LTR để kéo đúng chiều (ResizablePanel trả lại hướng chữ cho nội dung).
  const groupDir = dir ?? (horizontalRtl ? (mirrorInRtl ? "rtl" : "ltr") : undefined);

  const persisted = useDefaultLayout({ id: persistKey ?? "yugen-resizable", storage: persistKey ? safeLocalStorage : noopStorage });

  const panels = React.useRef(new Map<string, PanelImperativeHandle>());
  const [collapsed, setCollapsedState] = React.useState<Record<string, boolean>>({});
  const setCollapsed = React.useCallback((id: string, value: boolean) => {
    setCollapsedState((current) => (current[id] === value ? current : { ...current, [id]: value }));
  }, []);

  const hitFine = resizeTargetMinimumSize?.fine ?? DEFAULT_HIT_SIZE.fine;
  const hitCoarse = resizeTargetMinimumSize?.coarse ?? DEFAULT_HIT_SIZE.coarse;
  const context = React.useMemo<ResizableGroupContextValue>(
    () => ({ orientation, mirrored, hitSize: { fine: hitFine, coarse: hitCoarse }, panels, collapsed, setCollapsed }),
    [orientation, mirrored, hitFine, hitCoarse, collapsed, setCollapsed],
  );

  return (
    <ResizableGroupContext.Provider value={context}>
      <Group
        dir={groupDir}
        orientation={orientation}
        defaultLayout={defaultLayout ?? (persistKey ? persisted.defaultLayout : undefined)}
        onLayoutChanged={(layout, meta) => {
          if (persistKey) persisted.onLayoutChanged(layout, meta);
          onLayoutChanged?.(layout, meta);
        }}
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
  React.useLayoutEffect(() => {
    const id = element && collapseButton ? adjacentPanelId(element, collapseButton) : null;
    setTargetId((current) => (current === id ? current : id));
  });

  const hitFine = group?.hitSize.fine ?? DEFAULT_HIT_SIZE.fine;
  const hitCoarse = group?.hitSize.coarse ?? DEFAULT_HIT_SIZE.coarse;
  React.useEffect(() => {
    if (!element || !mirrored) return;
    const entry = { element, hitSize: { fine: hitFine, coarse: hitCoarse } };
    mirroredSeparators.add(entry);
    const release = retainBridge();
    return () => {
      mirroredSeparators.delete(entry);
      release();
    };
  }, [element, mirrored, hitFine, hitCoarse]);

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
        if (event.defaultPrevented || event.target !== event.currentTarget || syntheticEvents.has(event.nativeEvent)) return;
        if (collapseButton && event.key === "Enter") {
          event.preventDefault();
          toggle();
          return;
        }
        // Nhóm ngang đã lật (RTL): mũi tên trái phải di chuyển đường chia sang trái → phát lại phím ngược vai.
        if (mirrored && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          const swapped = event.key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
          const clone = new KeyboardEvent("keydown", {
            key: swapped,
            code: swapped,
            bubbles: true,
            cancelable: true,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
          });
          syntheticEvents.add(clone);
          event.currentTarget.dispatchEvent(clone);
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
        // Bản sao cho chuột / cảm ứng của phím Enter trên đường chia → ẩn khỏi cây truy cập, không nhận Tab.
        <button
          type="button"
          tabIndex={-1}
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
              ? cn("top-M", !isCollapsed ? "left-1/2 -translate-x-1/2" : collapseButton === "before" ? "inset-s-0" : "inset-e-0")
              : cn("inset-s-M", !isCollapsed ? "top-1/2 -translate-y-1/2" : collapseButton === "before" ? "top-0" : "bottom-0"),
          )}
        >
          <ChevronIcon className={cn("size-3", horizontal && mirrored && "-scale-x-100")} />
        </button>
      )}
      {children}
    </Separator>
  );
}
