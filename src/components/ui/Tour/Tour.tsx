/** Yugen Labs · Tour — hướng dẫn sản phẩm nhiều bước: spotlight làm nổi phần tử, TeachingPopover chỉ dẫn, Tiếp / Quay lại / Bỏ qua. */
import * as React from "react";
import { createPortal } from "react-dom";
import { useDirection } from "@radix-ui/react-direction";
import { Lightbulb16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { PopoverAnchor } from "../Popover/Popover";
import {
  TeachingPopover,
  TeachingPopoverBody,
  TeachingPopoverHeader,
  TeachingPopoverSurface,
  TeachingPopoverTitle,
  type TeachingPopoverAppearance,
} from "../TeachingPopover/TeachingPopover";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { tourMessages } from "./messages";

export { tourMessages, tourMessagesEn, type TourMessages } from "./messages";

/** Vị trí popover so với phần tử — start / end theo hướng chữ (tự đảo ở RTL). */
export type TourPlacement = "top" | "bottom" | "start" | "end";

export interface TourStep {
  /** CSS selector hoặc ref tới phần tử cần làm nổi. Bỏ trống → popover ở giữa màn hình. */
  target?: string | React.RefObject<HTMLElement | null>;
  title: React.ReactNode;
  content: React.ReactNode;
  placement?: TourPlacement;
  /** Ảnh / minh hoạ phía trên nội dung. */
  media?: React.ReactNode;
}

export interface TourContextValue {
  open: boolean;
  /** Bước hiện tại (bắt đầu từ 0). */
  step: number;
  total: number;
  /** Mở tour (mặc định từ bước 0). */
  start: (step?: number) => void;
  /** Đóng tour (không gọi onFinish). */
  stop: () => void;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
}

const TourContext = React.createContext<TourContextValue | null>(null);

/** Điều khiển Tour gần nhất: start / stop / next / back / goTo. */
export function useTour(): TourContextValue {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error("useTour() phải được gọi bên trong <Tour>.");
  return ctx;
}

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Bấm "Hoàn tất" ở bước cuối. */
  onFinish?: () => void;
  /** normal: bề mặt neutral · brand: nền brand (như TeachingPopover). */
  appearance?: TeachingPopoverAppearance;
  /** Khoảng hở (px) quanh phần tử được làm nổi. Mặc định 8. */
  spotlightPadding?: number;
  /** Bấm lớp phủ để đóng. Mặc định false. */
  closeOnOverlayClick?: boolean;
  /** Nhãn các nút; mặc định lấy từ `messages.tour` (`next` / `back` / `skip` / `finish`). */
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  finishLabel?: string;
  /** Ứng dụng của bạn — gọi useTour() ở bất kỳ đâu bên trong. */
  children?: React.ReactNode;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveTarget(target: TourStep["target"]): HTMLElement | null {
  if (!target || typeof document === "undefined") return null;
  if (typeof target === "string") {
    try {
      return document.querySelector<HTMLElement>(target);
    } catch {
      return null;
    }
  }
  return target.current ?? null;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

const raf = (fn: () => void) =>
  typeof requestAnimationFrame === "function" ? requestAnimationFrame(fn) : (setTimeout(fn, 16) as unknown as number);
const cancelRaf = (id: number) => (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame(id) : clearTimeout(id));

export function Tour({
  steps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onFinish,
  appearance = "normal",
  spotlightPadding = 8,
  closeOnOverlayClick = false,
  nextLabel,
  backLabel,
  skipLabel,
  finishLabel,
  children,
}: TourProps) {
  const msg = useYugenMessages("tour", tourMessages);
  const total = steps.length;
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = (openProp ?? innerOpen) && total > 0;
  const [innerStep, setInnerStep] = React.useState(defaultStep);
  const step = Math.min(Math.max(stepProp ?? innerStep, 0), Math.max(total - 1, 0));
  const current = steps[step];

  const dir = useDirection();
  const portalTheme = usePortalThemeProps();
  const titleId = React.useId();
  const bodyId = React.useId();
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [targetEl, setTargetEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  const callbacks = React.useRef({ onOpenChange, onStepChange, onFinish });
  useIsomorphicLayoutEffect(() => {
    callbacks.current = { onOpenChange, onStepChange, onFinish };
  });

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      callbacks.current.onOpenChange?.(next);
    },
    [openProp],
  );
  const goTo = React.useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), Math.max(total - 1, 0));
      if (stepProp === undefined) setInnerStep(clamped);
      callbacks.current.onStepChange?.(clamped);
    },
    [stepProp, total],
  );

  const context = React.useMemo<TourContextValue>(
    () => ({
      open,
      step,
      total,
      start: (from = 0) => {
        goTo(from);
        setOpen(true);
      },
      stop: () => setOpen(false),
      next: () => (step >= total - 1 ? undefined : goTo(step + 1)),
      back: () => goTo(step - 1),
      goTo,
    }),
    [open, step, total, goTo, setOpen],
  );

  const finish = () => {
    callbacks.current.onFinish?.();
    setOpen(false);
  };

  // Ghi lại phần tử đang focus trước khi tour mở để trả focus khi kết thúc.
  useIsomorphicLayoutEffect(() => {
    if (open && typeof document !== "undefined") {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body) returnFocus.current = active;
    }
  }, [open]);

  // Theo dõi vị trí phần tử mỗi khung hình khi tour mở: cuộn, đổi kích thước, bố cục xê dịch đều được cập nhật.
  const target = current?.target;
  React.useEffect(() => {
    if (!open) return;
    let frame = 0;
    let lastKey = "";
    let scrolled = false;
    const tick = () => {
      const el = resolveTarget(target);
      let next: Rect | null = null;
      if (el) {
        const r = el.getBoundingClientRect();
        next = { top: r.top, left: r.left, width: r.width, height: r.height };
        if (!scrolled) {
          scrolled = true;
          const fully = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
          if (!fully) el.scrollIntoView?.({ block: "center", inline: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }
      }
      const key = next ? `${Math.round(next.top)},${Math.round(next.left)},${Math.round(next.width)},${Math.round(next.height)}` : "none";
      if (key !== lastKey) {
        lastKey = key;
        setRect(next);
        setTargetEl(el);
      }
      frame = raf(tick);
    };
    tick();
    return () => cancelRaf(frame);
  }, [open, target, step]);

  // Mỗi bước mới: đưa focus vào popover để trình đọc màn hình đọc tiêu đề + nội dung.
  React.useEffect(() => {
    if (!open) return;
    const id = raf(() => surfaceRef.current?.focus({ preventScroll: true }));
    return () => cancelRaf(id);
  }, [open, step]);

  const centerAnchor = React.useMemo(
    () => ({
      getBoundingClientRect: () => {
        const w = typeof window === "undefined" ? 0 : window.innerWidth;
        const h = typeof window === "undefined" ? 0 : window.innerHeight;
        const x = w / 2;
        const y = h * 0.3;
        return { x, y, top: y, left: x, right: x, bottom: y, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
      },
    }),
    [],
  );
  const anchorRef = React.useMemo(() => ({ current: targetEl ?? centerAnchor }), [targetEl, centerAnchor]);

  const placement = current?.placement ?? "bottom";
  const side =
    placement === "start" ? (dir === "rtl" ? "right" : "left") : placement === "end" ? (dir === "rtl" ? "left" : "right") : placement;

  const brand = appearance === "brand";
  const primaryButton = brand
    ? { appearance: "secondary" as const, className: "min-w-0 border-transparent text-brand-foreground-1 hover:border-transparent active:border-transparent" }
    : { appearance: "primary" as const, className: "min-w-0" };
  const secondaryButton = brand
    ? {
        appearance: "outline" as const,
        className:
          "min-w-0 border-foreground-on-brand text-foreground-on-brand hover:border-foreground-on-brand hover:bg-brand-background-hover active:bg-brand-background-pressed",
      }
    : { appearance: "secondary" as const, className: "min-w-0" };

  const first = step === 0;
  const last = step === total - 1;
  const pad = spotlightPadding;

  return (
    <TourContext.Provider value={context}>
      {children}
      {mounted &&
        open &&
        createPortal(
          <div {...portalTheme} data-yugen-tour-overlay="" aria-hidden className="fixed inset-0 z-50">
            {rect ? (
              <div
                className={cn(
                  "absolute rounded-medium shadow-[0_0_0_100vmax_var(--colorBackgroundOverlay)]",
                  "outline-2 outline-offset-2 outline-brand-stroke forced-colors:outline-[Highlight]",
                  "transition-[top,left,width,height] duration-normal ease-easy-ease motion-reduce:transition-none",
                )}
                style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
              />
            ) : (
              <div className="absolute inset-0 bg-overlay" />
            )}
          </div>,
          document.body,
        )}
      <TeachingPopover open={open} onOpenChange={(next) => !next && setOpen(false)} appearance={appearance} modal>
        <PopoverAnchor virtualRef={anchorRef} />
        {current && (
          <TeachingPopoverSurface
            ref={surfaceRef}
            tabIndex={-1}
            side={side}
            align="center"
            withArrow={!!targetEl}
            sideOffset={pad + 6}
            collisionPadding={12}
            updatePositionStrategy="always"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            aria-roledescription={msg.roleDescription}
            className="w-80"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              const el = returnFocus.current;
              returnFocus.current = null;
              if (el?.isConnected) el.focus();
            }}
            onPointerDownOutside={(e) => {
              if (!closeOnOverlayClick) e.preventDefault();
            }}
          >
            <TeachingPopoverHeader dismissible={false} icon={<Lightbulb16Regular />}>
              <span className="sr-only">{msg.step} </span>
              <span className="tabular-nums">
                {step + 1} / {total}
              </span>
            </TeachingPopoverHeader>
            <div key={step} className="animate-fade-in motion-reduce:animate-none">
              <TeachingPopoverBody media={current.media}>
                <TeachingPopoverTitle id={titleId}>{current.title}</TeachingPopoverTitle>
                <div id={bodyId}>{current.content}</div>
              </TeachingPopoverBody>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {!last && (
                <Button
                  appearance="transparent"
                  className={cn("-ms-2 min-w-0", brand && "text-foreground-on-brand hover:text-foreground-on-brand")}
                  onClick={() => setOpen(false)}
                >
                  {skipLabel ?? msg.skip}
                </Button>
              )}
              <div className="ms-auto flex gap-2">
                {!first && (
                  <Button appearance={secondaryButton.appearance} className={secondaryButton.className} onClick={() => goTo(step - 1)}>
                    {backLabel ?? msg.back}
                  </Button>
                )}
                <Button
                  appearance={primaryButton.appearance}
                  className={primaryButton.className}
                  onClick={() => (last ? finish() : goTo(step + 1))}
                >
                  {last ? (finishLabel ?? msg.finish) : (nextLabel ?? msg.next)}
                </Button>
              </div>
            </div>
          </TeachingPopoverSurface>
        )}
      </TeachingPopover>
    </TourContext.Provider>
  );
}
Tour.displayName = "Tour";
