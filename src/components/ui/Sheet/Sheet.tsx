import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useDirection } from "@radix-ui/react-direction";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useMediaQuery } from "./useMediaQuery";
import { sheetMessages } from "./messages";

export { sheetMessages, sheetMessagesEn, type SheetMessages } from "./messages";

export { useMediaQuery, type UseMediaQueryOptions } from "./useMediaQuery";

/**
 * Yugen Labs — Sheet: MỘT overlay thích ứng. Màn hình rộng → panel trượt từ cạnh (như Drawer);
 * màn hình hẹp → bottom sheet kéo được, có snap point, vuốt xuống để đóng.
 * Dựng trên Radix Dialog (focus trap, Esc, khoá cuộn, ARIA dialog).
 */
export type SheetSide = "start" | "end";
export type SheetSize = "small" | "medium" | "large";
export type SheetMode = "auto" | "side" | "bottom";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  isBottom: boolean;
  side: SheetSide;
  size: SheetSize;
  modal: boolean;
  dismissible: boolean;
  /** Đã chuẩn hoá: tăng dần, nằm trong (0, 1]. */
  snapPoints: number[];
  snapPoint: number;
  setSnapPoint: (value: number) => void;
  bodyRef: React.MutableRefObject<HTMLDivElement | null>;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Các phần của Sheet phải nằm trong <Sheet>.");
  return ctx;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function nearest(values: number[], target: number) {
  return values.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), values[0]);
}

/* ------------------------------------------------------------------ Sheet (root) */
export interface SheetProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Cạnh trượt vào ở dạng panel (desktop). "end" = phải ở LTR, trái ở RTL. */
  side?: SheetSide;
  /** Độ rộng panel desktop: small 320 · medium 592 · large 940. */
  size?: SheetSize;
  /** "auto" theo `breakpoint`; "side" / "bottom" ép một dạng. */
  mode?: SheetMode;
  /** Chiều rộng viewport tối thiểu (px) để hiện dạng panel. */
  breakpoint?: number;
  /** Các nấc chiều cao của bottom sheet, tính theo phần của chiều cao viewport, ví dụ [0.45, 0.9]. */
  snapPoints?: number[];
  snapPoint?: number;
  /** Nấc khi mở; mặc định nấc thấp nhất. */
  defaultSnapPoint?: number;
  onSnapPointChange?: (snapPoint: number) => void;
  /** false: không lớp phủ, không bẫy focus, trang phía sau vẫn tương tác được. */
  modal?: boolean;
  /** false: không đóng bằng Esc, bấm lớp phủ hay vuốt xuống — phải dùng nút trong Sheet. */
  dismissible?: boolean;
}

export function Sheet({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "end",
  size = "small",
  mode = "auto",
  breakpoint = 768,
  snapPoints: snapPointsProp = [0.5, 0.9],
  snapPoint: snapPointProp,
  defaultSnapPoint,
  onSnapPointChange,
  modal = true,
  dismissible = true,
}: SheetProps) {
  const snapKey = snapPointsProp.join(",");
  const snapPoints = React.useMemo(() => {
    const points = Array.from(new Set(snapPointsProp.filter((p) => p > 0 && p <= 1))).sort((a, b) => a - b);
    return points.length > 0 ? points : [0.9];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapKey]);
  const initialSnap = nearest(snapPoints, defaultSnapPoint ?? snapPoints[0]);

  const isDesktop = useMediaQuery(`(min-width: ${breakpoint}px)`);
  const isBottom = mode === "bottom" || (mode === "auto" && !isDesktop);

  const callbacks = React.useRef({ onOpenChange, onSnapPointChange });
  useIsomorphicLayoutEffect(() => {
    callbacks.current = { onOpenChange, onSnapPointChange };
  });

  const [innerSnap, setInnerSnap] = React.useState(initialSnap);
  const snapControlled = snapPointProp !== undefined;
  const snapPoint = nearest(snapPoints, snapControlled ? snapPointProp : innerSnap);
  const snapRef = React.useRef(snapPoint);
  snapRef.current = snapPoint;
  const setSnapPoint = React.useCallback(
    (value: number) => {
      if (!snapControlled) setInnerSnap(value);
      if (value !== snapRef.current) callbacks.current.onSnapPointChange?.(value);
    },
    [snapControlled],
  );

  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const openRef = React.useRef(open);
  openRef.current = open;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === openRef.current) return;
      // Mỗi lần mở (uncontrolled) bắt đầu lại từ nấc mặc định.
      if (next && !snapControlled) setInnerSnap(initialSnap);
      if (openProp === undefined) setInnerOpen(next);
      callbacks.current.onOpenChange?.(next);
    },
    [openProp, snapControlled, initialSnap],
  );

  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const [hasDescription, setHasDescription] = React.useState(false);

  const value = React.useMemo<SheetContextValue>(
    () => ({
      open,
      setOpen,
      isBottom,
      side,
      size,
      modal,
      dismissible,
      snapPoints,
      snapPoint,
      setSnapPoint,
      bodyRef,
      hasDescription,
      setHasDescription,
    }),
    [open, setOpen, isBottom, side, size, modal, dismissible, snapPoints, snapPoint, setSnapPoint, hasDescription],
  );

  return (
    <SheetContext.Provider value={value}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={modal}>
        {children}
      </DialogPrimitive.Root>
    </SheetContext.Provider>
  );
}

export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

/* ------------------------------------------------------------------ SheetContent */
const SIDE_POSITION: Record<SheetSide, string> = {
  start: "inset-y-0 inset-s-0 animate-slide-in-start data-[state=closed]:animate-slide-out-start",
  end: "inset-y-0 inset-e-0 animate-slide-in-end data-[state=closed]:animate-slide-out-end",
};
const SIDE_WIDTH: Record<SheetSize, string> = { small: "w-80", medium: "w-148", large: "w-235" };

/** Quãng đường (px) trước khi một cú chạm được coi là kéo — dưới mức này vẫn là bấm. */
const DRAG_SLOP = 6;
/** Vận tốc (px/ms) coi là cú vuốt nhanh: nhảy sang nấc kế tiếp theo hướng vuốt. */
const FLICK_VELOCITY = 0.45;

/** Vị trí (translateY) của sheet ở một nấc — CSS thuần để tự đúng khi xoay máy / thanh địa chỉ co giãn. */
function snapOffsetCss(snap: number) {
  return `max(0px, calc(var(--sheet-height) - ${snap * 100}dvh))`;
}

function readOffset(el: HTMLElement) {
  const parts = getComputedStyle(el).translate.split(" ");
  const y = parseFloat(parts[1] ?? "0");
  return Number.isFinite(y) ? y : 0;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startOffset: number;
  offset: number;
  sheetHeight: number;
  viewportHeight: number;
  fromBody: boolean;
  active: boolean;
  samples: { y: number; t: number }[];
}

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Hiện tay nắm ở dạng bottom sheet (mặc định true). */
  handle?: boolean;
  /** Nhãn của tay nắm (nút đổi nấc chiều cao). Mặc định lấy từ `messages.sheet.handle`. */
  handleLabel?: string;
  overlayClassName?: string;
  /**
   * Yugen Labs — bề mặt glass. Bottom sheet glass nằm lồi vào trong mép màn hình, bo cả bốn góc, và đặc dần khi kéo lên
   * nấc cao nhất (nội dung dài cần nền đặc để dễ đọc). glass-clear: trên ảnh / media.
   */
  material?: "glass" | "glass-clear";
}

export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  (
    {
      className,
      overlayClassName,
      material,
      handle = true,
      handleLabel,
      children,
      style,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
      onFocus,
      onOpenAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const ctx = useSheet();
    const { isBottom, snapPoints, snapPoint, setSnapPoint, dismissible, modal } = ctx;
    const dir = useDirection();
    const portalTheme = usePortalThemeProps();
    const msg = useYugenMessages("sheet", sheetMessages);
    const [node, setNode] = React.useState<HTMLDivElement | null>(null);
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const overlayRef = React.useRef<HTMLDivElement | null>(null);
    const dragRef = React.useRef<DragState | null>(null);
    /** Mốc thời gian (event.timeStamp) tới khi còn nuốt cú click sinh ra từ việc thả tay sau khi kéo. */
    const suppressClickUntil = React.useRef(0);
    const maxSnap = snapPoints[snapPoints.length - 1];
    const latest = React.useRef({ isBottom, snapPoint });
    latest.current = { isBottom, snapPoint };

    const setRefs = React.useCallback(
      (el: HTMLDivElement | null) => {
        nodeRef.current = el;
        // Đặt vị trí nấc ngay khi gắn vào DOM — trước khi trình duyệt tính style lần đầu (tránh chuyển động thừa).
        if (el && latest.current.isBottom) el.style.setProperty("--sheet-offset", snapOffsetCss(latest.current.snapPoint));
        setNode(el);
        setRef(ref, el);
      },
      [ref],
    );

    /** Đưa sheet về một nấc (có chuyển động CSS) và báo nấc mới. */
    const settle = React.useCallback(
      (snap: number) => {
        nodeRef.current?.style.setProperty("--sheet-offset", snapOffsetCss(snap));
        if (overlayRef.current) overlayRef.current.style.opacity = "";
        setSnapPoint(snap);
      },
      [setSnapPoint],
    );

    useIsomorphicLayoutEffect(() => {
      if (!node) return;
      if (!isBottom) {
        node.style.removeProperty("--sheet-offset");
        return;
      }
      if (!dragRef.current?.active) node.style.setProperty("--sheet-offset", snapOffsetCss(snapPoint));
    }, [node, isBottom, snapPoint]);

    // Ở nấc cao nhất nội dung cuộn được; khi đã cuộn lên đầu mà kéo xuống thì chặn cuộn gốc để kéo cả sheet.
    React.useEffect(() => {
      const body = ctx.bodyRef.current;
      if (!node || !isBottom || !body) return;
      const onTouchMove = (event: TouchEvent) => {
        const drag = dragRef.current;
        if (!drag?.fromBody || !event.cancelable) return;
        const dy = (event.touches[0]?.clientY ?? drag.startY) - drag.startY;
        if (drag.active || (dy > 0 && body.scrollTop <= 0)) event.preventDefault();
      };
      body.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => body.removeEventListener("touchmove", onTouchMove);
    }, [node, isBottom, ctx.bodyRef]);

    const applyOffset = (drag: DragState, raw: number) => {
      const lowest = Math.max(0, drag.sheetHeight - snapPoints[0] * drag.viewportHeight);
      let offset = raw;
      if (raw < 0) offset = raw / 4; // kéo quá nấc cao nhất: đàn hồi
      else if (!dismissible && raw > lowest) offset = lowest + (raw - lowest) / 4;
      drag.offset = offset;
      nodeRef.current?.style.setProperty("--sheet-offset", `${offset}px`);
      if (overlayRef.current && dismissible) {
        const fade = offset > lowest ? 1 - (offset - lowest) / Math.max(1, drag.sheetHeight - lowest) : 1;
        overlayRef.current.style.opacity = String(Math.max(0, Math.min(1, fade)));
      }
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (!drag.active) return;
      const el = nodeRef.current;
      el?.removeAttribute("data-dragging");
      if (el?.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      if (!cancelled) suppressClickUntil.current = event.timeStamp + 400;

      // Vận tốc từ các mẫu trong 120ms cuối; giữ yên ngón tay trước khi thả → vận tốc 0 (không tính là hất).
      const recent = drag.samples.filter((s) => event.timeStamp - s.t < 120);
      const first = recent[0];
      const last = recent[recent.length - 1];
      const velocity = recent.length > 1 && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0;

      const heights = snapPoints.map((p) => Math.min(p * drag.viewportHeight, drag.sheetHeight));
      const visible = drag.sheetHeight - drag.offset;
      const close = () => {
        if (dismissible) ctx.setOpen(false);
        else settle(snapPoints[0]);
      };

      if (!cancelled && Math.abs(velocity) > FLICK_VELOCITY) {
        if (velocity > 0) {
          // Vuốt xuống: nấc thấp hơn gần nhất dưới vị trí hiện tại; không còn nấc nào → đóng.
          const lower = heights.map((h, i) => ({ h, i })).filter(({ h }) => h < visible - 1);
          if (lower.length === 0) close();
          else settle(snapPoints[lower[lower.length - 1].i]);
        } else {
          const upper = heights.findIndex((h) => h > visible + 1);
          settle(snapPoints[upper === -1 ? snapPoints.length - 1 : upper]);
        }
        return;
      }
      if (visible < heights[0] / 2) {
        close();
        return;
      }
      let best = 0;
      heights.forEach((h, i) => {
        if (Math.abs(h - visible) < Math.abs(heights[best] - visible)) best = i;
      });
      settle(snapPoints[best]);
    };

    const cycleSnap = (step: number, wrap: boolean) => {
      const index = snapPoints.indexOf(snapPoint);
      let next = index + step;
      if (wrap) next = (next + snapPoints.length) % snapPoints.length;
      next = Math.max(0, Math.min(snapPoints.length - 1, next));
      if (next !== index) settle(snapPoints[next]);
    };

    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          {...portalTheme}
          ref={overlayRef}
          className={cn(
            "fixed inset-0 z-50 bg-overlay animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none",
            overlayClassName,
          )}
        />
        <DialogPrimitive.Content
          {...portalTheme}
          ref={setRefs}
          dir={dir}
          data-sheet={isBottom ? "bottom" : ctx.side}
          data-expanded={(material && isBottom && snapPoint === maxSnap) || undefined}
          {...(ctx.hasDescription ? {} : { "aria-describedby": undefined })}
          style={
            isBottom
              ? ({ "--sheet-height": `min(${maxSnap * 100}dvh, calc(100dvh - env(safe-area-inset-top)))`, ...style } as React.CSSProperties)
              : style
          }
          onOpenAutoFocus={(event) => {
            onOpenAutoFocus?.(event);
            // Bottom sheet: focus vào chính bề mặt để trình đọc màn hình đọc tiêu đề, không nhảy vào tay nắm.
            if (!event.defaultPrevented && isBottom) {
              event.preventDefault();
              nodeRef.current?.focus({ preventScroll: true });
            }
          }}
          onEscapeKeyDown={(event) => {
            if (!dismissible) event.preventDefault();
            onEscapeKeyDown?.(event);
          }}
          onPointerDownOutside={(event) => {
            if (!dismissible) event.preventDefault();
            onPointerDownOutside?.(event);
          }}
          onInteractOutside={(event) => {
            // Không modal: trang phía sau vẫn dùng được, sheet không tự đóng.
            if (!modal) event.preventDefault();
            onInteractOutside?.(event);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            // Focus bàn phím (hoặc ô nhập) vào nội dung khi đang ở nấc thấp → mở lên nấc cao nhất để không bị che.
            const body = ctx.bodyRef.current;
            const target = event.target as HTMLElement;
            if (isBottom && snapPoint < maxSnap && body?.contains(target) && target.matches(":focus-visible")) settle(maxSnap);
          }}
          onClickCapture={(event) => {
            if (event.timeStamp < suppressClickUntil.current) {
              suppressClickUntil.current = 0;
              event.preventDefault();
              event.stopPropagation();
            }
            onClickCapture?.(event);
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            const node = nodeRef.current;
            if (event.defaultPrevented || !isBottom || !node) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;
            suppressClickUntil.current = 0;
            const target = event.target as HTMLElement;
            if (target.closest("input, textarea, select, [contenteditable='true'], [contenteditable=''], [data-sheet-no-drag]")) return;
            const body = ctx.bodyRef.current;
            const fromBody = !!body?.contains(target) && snapPoint >= maxSnap;
            if (fromBody && body && body.scrollTop > 0) return; // đang đọc giữa nội dung: để trình duyệt cuộn
            const offset = readOffset(node);
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              startOffset: offset,
              offset,
              sheetHeight: node.offsetHeight,
              viewportHeight: window.innerHeight,
              fromBody,
              active: false,
              samples: [{ y: event.clientY, t: event.timeStamp }],
            };
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            const drag = dragRef.current;
            const node = nodeRef.current;
            if (!drag || drag.pointerId !== event.pointerId || !node) return;
            const dy = event.clientY - drag.startY;
            if (!drag.active) {
              const dx = event.clientX - drag.startX;
              if (Math.abs(dy) < DRAG_SLOP && Math.abs(dx) < DRAG_SLOP) return;
              // Vuốt ngang (carousel bên trong) hoặc cuộn nội dung lên → nhường cho trình duyệt.
              if (Math.abs(dx) > Math.abs(dy) || (drag.fromBody && dy < 0)) {
                dragRef.current = null;
                return;
              }
              drag.active = true;
              node.setPointerCapture(event.pointerId);
              node.setAttribute("data-dragging", "");
              window.getSelection()?.removeAllRanges();
            }
            drag.samples.push({ y: event.clientY, t: event.timeStamp });
            if (drag.samples.length > 8) drag.samples.shift();
            applyOffset(drag, drag.startOffset + dy);
          }}
          onPointerUp={(event) => {
            onPointerUp?.(event);
            endDrag(event, false);
          }}
          onPointerCancel={(event) => {
            onPointerCancel?.(event);
            endDrag(event, true);
          }}
          className={cn(
            "group/sheet fixed z-50 flex flex-col bg-background-1 text-foreground-1 shadow-64 outline-none",
            "motion-reduce:animate-none",
            isBottom
              ? cn(
                  // Ép bottom trên màn hình rộng (mode="bottom"): căn giữa, không trải hết chiều ngang.
                  "inset-x-0 bottom-0 mx-auto h-(--sheet-height) w-full max-w-2xl translate-y-(--sheet-offset) rounded-t-3xlarge",
                  "animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom",
                  "transition-[translate] duration-gentle ease-decelerate-mid data-dragging:transition-none data-dragging:select-none motion-reduce:transition-none",
                  // "Váy" nối dài bề mặt xuống dưới mép màn hình khi kéo quá nấc cao nhất (đàn hồi).
                  "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[50dvh] after:bg-background-1",
                )
              : cn("max-w-screen", SIDE_POSITION[ctx.side], SIDE_WIDTH[ctx.size]),
            material,
            material &&
              isBottom &&
              cn(
                "inset-x-2 bottom-2 w-auto max-h-[calc(100dvh-var(--spacing)*4)] rounded-4xlarge after:hidden",
                "transition-[translate,background-color] data-expanded:[--glass-bg:var(--glass-solid)]",
              ),
            className,
          )}
          {...props}
        >
          {isBottom && handle && (
            <div className="flex shrink-0 touch-none justify-center pt-2">
              {snapPoints.length > 1 ? (
                <button
                  type="button"
                  aria-label={`${handleLabel ?? msg.handle} (${Math.round(snapPoint * 100)}%)`}
                  onClick={() => cycleSnap(1, true)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();
                      cycleSnap(event.key === "ArrowUp" ? 1 : -1, false);
                    }
                  }}
                  className="group/handle flex h-6 w-16 cursor-grab items-center justify-center rounded-circular active:cursor-grabbing"
                >
                  <span className="h-1 w-9 rounded-circular bg-stroke-accessible transition-colors duration-faster ease-easy-ease group-hover/handle:bg-foreground-3" />
                </button>
              ) : (
                <span aria-hidden className="my-2.5 h-1 w-9 rounded-circular bg-stroke-accessible" />
              )}
            </div>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);
SheetContent.displayName = "SheetContent";

/* ------------------------------------------------------------------ parts */
export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Phần tử cuối hàng tiêu đề, thường là nút đóng. */
  action?: React.ReactNode;
}

export function SheetHeader({ className, action, children, ...props }: SheetHeaderProps) {
  const { isBottom } = useSheet();
  return (
    <div
      className={cn("flex shrink-0 items-start gap-2 px-6 pt-6 pb-2", isBottom && "touch-none pt-2", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      {action && <div className="-me-1 -mt-0.5 flex shrink-0 items-center gap-1">{action}</div>}
    </div>
  );
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-subtitle1 font-semibold text-foreground-1", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const { setHasDescription } = useSheet();
  React.useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return <DialogPrimitive.Description ref={ref} className={cn("text-body1 text-foreground-2", className)} {...props} />;
});
SheetDescription.displayName = "SheetDescription";

/** Vùng nội dung cuộn được. Ở bottom sheet chỉ cuộn khi sheet ở nấc cao nhất; nấc thấp hơn: kéo ở đâu cũng di chuyển sheet. */
export const SheetBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { isBottom, snapPoint, snapPoints, bodyRef } = useSheet();
  const scrollable = !isBottom || snapPoint >= snapPoints[snapPoints.length - 1];
  return (
    <div
      ref={(el) => {
        bodyRef.current = el;
        setRef(ref, el);
      }}
      className={cn(
        "min-h-0 flex-1 overscroll-contain px-6 py-2 text-body1 text-foreground-1",
        scrollable ? "overflow-y-auto" : "overflow-hidden",
        isBottom && (scrollable ? "touch-pan-y" : "touch-none"),
        isBottom && "pb-[calc(var(--spacingS)+env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  );
});
SheetBody.displayName = "SheetBody";

/** Hàng hành động. Ở bottom sheet luôn bám đáy màn hình (kể cả ở nấc thấp) và chừa vùng an toàn. */
export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isBottom } = useSheet();
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 px-6 pt-4 pb-6",
        isBottom &&
          cn(
            "relative z-10 touch-none border-t border-stroke-2 bg-background-1 pt-3 pb-[calc(var(--spacingL)+env(safe-area-inset-bottom))]",
            "-translate-y-(--sheet-offset) transition-[translate] duration-gentle ease-decelerate-mid",
            "group-data-dragging/sheet:transition-none motion-reduce:transition-none",
          ),
        className,
      )}
      {...props}
    />
  );
}
