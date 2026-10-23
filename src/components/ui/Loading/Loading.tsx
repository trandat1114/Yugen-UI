import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowClockwise20Regular, DocumentSearch24Regular, ErrorCircle20Regular, ErrorCircle24Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useAnnounce } from "../AriaLive/AriaLive";
import { Button } from "../Button/Button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../Empty/Empty";
import { Fade } from "../Motion/Motion";
import { SkeletonText } from "../Skeleton/Skeleton";
import { Spinner, type SpinnerSize } from "../Spinner/Spinner";
import { toast } from "../Toast/Toast";
import { usePortalThemeProps, useYugenMessages } from "../YugenProvider/context";
import {
  asyncContentMessages,
  errorStateMessages,
  loadingOverlayMessages,
  optimisticListMessages,
  pageProgressMessages,
} from "./messages";

export {
  asyncContentMessages,
  asyncContentMessagesEn,
  errorStateMessages,
  errorStateMessagesEn,
  loadingOverlayMessages,
  loadingOverlayMessagesEn,
  optimisticListMessages,
  optimisticListMessagesEn,
  pageProgressMessages,
  pageProgressMessagesEn,
  type AsyncContentMessages,
  type ErrorStateMessages,
  type LoadingOverlayMessages,
  type OptimisticListMessages,
  type PageProgressMessages,
} from "./messages";

/** Yugen Labs — Wait UX: các khối dựng cho trải nghiệm chờ (delay, overlay, tiến trình trang, trạng thái bất đồng bộ, optimistic). */

/* ================================================================ useSpinDelay */

export interface SpinDelayOptions {
  /** Chờ bao lâu (ms) rồi mới hiện loader. Phản hồi về sớm hơn → loader không bao giờ hiện. */
  delay?: number;
  /** Đã hiện thì giữ tối thiểu bao lâu (ms) — dữ liệu về ngay sau đó cũng không làm loader nháy. */
  minDuration?: number;
}

type SpinPhase = "idle" | "delay" | "display" | "expire";

/**
 * Biến `loading` thô thành `showLoader` dễ chịu cho mắt:
 * phản hồi < delay → không hiện gì; đã hiện → hiện ít nhất minDuration.
 */
export function useSpinDelay(loading: boolean, { delay = 300, minDuration = 500 }: SpinDelayOptions = {}): boolean {
  const [phase, setPhase] = React.useState<SpinPhase>(() => (loading && delay <= 0 ? "display" : "idle"));

  React.useEffect(() => {
    if (loading && phase === "idle") setPhase(delay > 0 ? "delay" : "display");
    else if (!loading && (phase === "delay" || phase === "expire")) setPhase("idle");
  }, [loading, phase, delay]);

  React.useEffect(() => {
    if (phase !== "delay" && phase !== "display") return;
    const id = window.setTimeout(
      () => setPhase(phase === "delay" ? "display" : "expire"),
      phase === "delay" ? delay : minDuration,
    );
    return () => window.clearTimeout(id);
  }, [phase, delay, minDuration]);

  return phase === "display" || (phase === "expire" && loading);
}

/* ================================================================ LoadingOverlay */

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vùng đang tải. Gắn `aria-busy` lên vùng ngay lập tức; lớp phủ hiện theo delay. */
  loading: boolean;
  /** Nhãn dưới Spinner, đồng thời được đọc cho trình đọc màn hình khi lớp phủ hiện. Mặc định lấy từ `messages.loadingOverlay.label`. */
  label?: React.ReactNode;
  /** Chờ (ms) trước khi phủ. Mặc định 0. */
  delay?: number;
  /** Thời gian hiện tối thiểu (ms). Mặc định 500 khi có delay, ngược lại 0. */
  minDuration?: number;
  spinnerSize?: SpinnerSize;
  /** Class cho lớp phủ (vd. đổi độ trong). */
  overlayClassName?: string;
}

/** Phủ một vùng (nội dung cũ vẫn giữ chỗ bên dưới) bằng bề mặt mờ + Spinner + nhãn. */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { loading, label: labelProp, delay = 0, minDuration, spinnerSize = "medium", overlayClassName, className, children, ...props },
    ref,
  ) => {
    const msg = useYugenMessages("loadingOverlay", loadingOverlayMessages);
    const label = labelProp === undefined ? msg.label : labelProp;
    const shown = useSpinDelay(loading, { delay, minDuration: minDuration ?? (delay > 0 ? 500 : 0) });
    const { announce } = useAnnounce();
    const spoken = typeof label === "string" ? label : msg.announcement;

    React.useEffect(() => {
      if (shown) announce(spoken);
    }, [shown, spoken, announce]);

    return (
      <div ref={ref} aria-busy={loading} className={cn("relative isolate", className)} {...props}>
        {children}
        <Fade visible={shown} unmountOnExit exitDuration="fast">
          {/* Chỉ để nhìn: trạng thái đã có aria-busy + thông báo live, không đọc lặp. */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background-1/80 p-4",
              overlayClassName,
            )}
          >
            <Spinner size={spinnerSize} label={label} labelPosition="below" />
          </div>
        </Fade>
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";

/* ================================================================ PageProgress */

export interface PageProgressSnapshot {
  /** idle: ẩn · running: đang chạy · complete: chạy nốt tới 100% rồi mờ đi. */
  status: "idle" | "running" | "complete";
  /** 0–1. */
  value: number;
  /** true khi giá trị là ước lượng tự tăng (trickle) — không công bố aria-valuenow. */
  trickling: boolean;
}

export interface PageProgressController {
  /** Bắt đầu (hoặc cộng thêm một tác vụ đang chờ) và tự nhích dần tới ~94%. */
  start(): void;
  /** Kết thúc một tác vụ; khi không còn tác vụ nào → chạy tới 100% rồi mờ đi. */
  done(): void;
  /** Đặt tiến độ thật (0–1), tắt trickle; ≥ 1 → hoàn tất. */
  set(value: number): void;
  /** Huỷ ngay, không chạy tới 100%. */
  reset(): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): PageProgressSnapshot;
}

const TRICKLE_START = 0.08;
const TRICKLE_MAX = 0.94;
const TRICKLE_RATE = 0.08;
const TRICKLE_INTERVAL = 250;
/** Bằng durationSlow — thời gian thanh chạy nốt tới 100% trước khi mờ đi. */
const COMPLETE_HOLD = 300;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Tạo một bộ điều khiển tiến trình độc lập (không cần React context). */
export function createPageProgress(): PageProgressController {
  let snapshot: PageProgressSnapshot = { status: "idle", value: 0, trickling: false };
  let pending = 0;
  let trickleTimer: number | undefined;
  let completeTimer: number | undefined;
  const listeners = new Set<() => void>();

  const update = (next: Partial<PageProgressSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    for (const listener of listeners) listener();
  };
  const stopTimers = () => {
    window.clearInterval(trickleTimer);
    window.clearTimeout(completeTimer);
    trickleTimer = undefined;
  };
  const complete = () => {
    stopTimers();
    pending = 0;
    update({ status: "complete", value: 1, trickling: false });
    completeTimer = window.setTimeout(() => update({ status: "idle" }), COMPLETE_HOLD);
  };

  return {
    start() {
      if (typeof window === "undefined") return;
      pending += 1;
      window.clearTimeout(completeTimer);
      if (snapshot.status !== "running") update({ status: "running", value: TRICKLE_START, trickling: true });
      else if (!snapshot.trickling) update({ trickling: true });
      trickleTimer ??= window.setInterval(
        () => update({ value: snapshot.value + (TRICKLE_MAX - snapshot.value) * TRICKLE_RATE }),
        reducedMotion() ? TRICKLE_INTERVAL * 4 : TRICKLE_INTERVAL,
      );
    },
    done() {
      pending = Math.max(0, pending - 1);
      if (pending === 0 && snapshot.status === "running") complete();
    },
    set(value) {
      if (typeof window === "undefined" || Number.isNaN(value)) return;
      if (value >= 1) {
        if (snapshot.status === "running") complete();
        return;
      }
      stopTimers();
      update({ status: "running", value: Math.max(0, value), trickling: false });
    },
    reset() {
      if (typeof window !== "undefined") stopTimers();
      pending = 0;
      update({ status: "idle", value: 0, trickling: false });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}

/** Bộ điều khiển dùng chung: `pageProgress.start()` / `.done()` / `.set(0.5)` gọi được ở bất kỳ đâu. */
export const pageProgress = createPageProgress();

export interface PageProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Chế độ xác định: 0–1; ≥ 1 → hoàn tất rồi mờ đi. Kèm `active` để chỉ hiện trong lúc active. */
  value?: number;
  /** true → hiện (không có value: tự nhích dần kiểu trickle); false → chạy tới 100% rồi mờ đi. */
  active?: boolean;
  /** Bộ điều khiển khi không truyền value / active. Mặc định `pageProgress` dùng chung. */
  controller?: PageProgressController;
  /** fixed: mép trên khung nhìn (portal, z-50) · absolute: mép trên phần tử cha `relative`. */
  position?: "fixed" | "absolute";
  /** medium 2px · large 4px. */
  thickness?: "medium" | "large";
  /** aria-label của progressbar. Mặc định lấy từ `messages.pageProgress.label`. */
  label?: string;
}

/** Thanh tiến trình mảnh màu brand ở mép trên trang (chuyển route, tải nền). */
export const PageProgress = React.forwardRef<HTMLDivElement, PageProgressProps>(
  (
    { value, active, controller = pageProgress, position = "fixed", thickness = "medium", label, className, ...props },
    ref,
  ) => {
    const msg = useYugenMessages("pageProgress", pageProgressMessages);
    const [local] = React.useState(createPageProgress);
    const store = value !== undefined || active !== undefined ? local : controller;
    const themeProps = usePortalThemeProps();

    React.useEffect(() => {
      if (!active) return;
      local.start();
      return () => local.done();
    }, [active, local]);

    // Kèm active: chỉ nhận giá trị khi đang active (active=false → để thanh chạy nốt và mờ đi).
    React.useEffect(() => {
      if (value !== undefined && active !== false) local.set(value);
    }, [value, active, local]);

    React.useEffect(() => () => local.reset(), [local]);

    const snap = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const fixed = position === "fixed";

    const bar = (
      <Fade visible={snap.status !== "idle"} unmountOnExit exitDuration="normal">
        <div
          ref={ref}
          role="progressbar"
          aria-label={label ?? msg.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={snap.trickling ? undefined : Math.round(snap.value * 100)}
          {...(fixed ? themeProps : {})}
          className={cn(
            "pointer-events-none inset-x-0 top-0 overflow-hidden",
            fixed ? "fixed z-50" : "absolute",
            thickness === "large" ? "h-1" : "h-0.5",
            className,
          )}
          {...props}
        >
          {/* scaleX thay cho width: chạy trên compositor, không layout lại cả trang mỗi bước tiến độ. */}
          <div
            className="absolute inset-0 origin-left bg-brand-background transition-transform duration-slow ease-easy-ease motion-reduce:transition-none rtl:origin-right"
            style={{ transform: `scaleX(${snap.value})` }}
          />
        </div>
      </Fade>
    );

    if (!fixed) return bar;
    return typeof document === "undefined" ? null : createPortal(bar, document.body);
  },
);
PageProgress.displayName = "PageProgress";

/** Chạy thanh tiến trình trong lúc `active` (mặc định true: suốt thời gian component được mount). */
export function usePageProgress(active = true, controller: PageProgressController = pageProgress) {
  React.useEffect(() => {
    if (!active) return;
    controller.start();
    return () => controller.done();
  }, [active, controller]);
}

export interface PageProgressFallbackProps {
  controller?: PageProgressController;
  /** Nội dung hiển thị kèm (vd. khung xương của trang). Mặc định không hiển thị gì. */
  children?: React.ReactNode;
}

/** Dùng làm `fallback` của Suspense: thanh trên cùng chạy suốt lúc route lazy đang tải. */
export function PageProgressFallback({ controller, children = null }: PageProgressFallbackProps) {
  usePageProgress(true, controller);
  return <>{children}</>;
}

/* ================================================================ ErrorState */

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function";
}

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  /** Mặc định lấy từ `messages.errorState.title`. */
  title?: React.ReactNode;
  /** Mặc định lấy từ `messages.errorState.description`; `null` để ẩn. */
  description?: React.ReactNode;
  /** Hiện nút "Thử lại". Trả về Promise → nút tự ở trạng thái loading tới khi Promise xong. */
  onRetry?: () => void | Promise<unknown>;
  /** Mặc định lấy từ `messages.errorState.retry`. */
  retryLabel?: React.ReactNode;
  /** Ép nút thử lại ở trạng thái loading (khi trạng thái nằm ở nơi khác). */
  retrying?: boolean;
  /** Hành động phụ, vd. `<Button appearance="subtle">Báo lỗi</Button>`. */
  secondaryAction?: React.ReactNode;
  /** alert: role="alert" — đọc ngay khi xuất hiện (lỗi sau một thao tác người dùng đang chờ). */
  variant?: "default" | "alert";
  /** medium: khối giữa vùng · small: một dòng gọn trong thẻ / panel. */
  size?: "small" | "medium";
}

/** Trạng thái lỗi có lối thoát: nói chuyện gì xảy ra, cho thử lại và một hành động phụ. */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      icon,
      title: titleProp,
      description: descriptionProp,
      onRetry,
      retryLabel: retryLabelProp,
      retrying,
      secondaryAction,
      variant = "default",
      size = "medium",
      className,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("errorState", errorStateMessages);
    const title = titleProp === undefined ? msg.title : titleProp;
    const description = descriptionProp === undefined ? msg.description : descriptionProp;
    const retryLabel = retryLabelProp === undefined ? msg.retry : retryLabelProp;
    const [pending, setPending] = React.useState(false);
    const mounted = React.useRef(true);
    React.useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);
    const busy = !!retrying || pending;
    const small = size === "small";

    const retry = () => {
      if (!onRetry || busy) return;
      const result: unknown = onRetry();
      if (isThenable(result)) {
        setPending(true);
        const settle = () => {
          if (mounted.current) setPending(false);
        };
        result.then(settle, settle);
      }
    };

    const actions = (onRetry || secondaryAction) && (
      <div className={cn("flex flex-wrap items-center gap-2", small ? "shrink-0" : "justify-center")}>
        {onRetry && (
          <Button
            appearance={small ? "secondary" : "primary"}
            size={small ? "small" : "medium"}
            icon={<ArrowClockwise20Regular />}
            loading={busy}
            onClick={retry}
          >
            {retryLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    );

    if (small) {
      return (
        <div
          ref={ref}
          role={variant === "alert" ? "alert" : undefined}
          className={cn("flex min-w-0 flex-wrap items-center gap-3 p-3 text-start", className)}
          {...props}
        >
          <span aria-hidden className="flex shrink-0 text-danger-foreground-1 [&_svg]:size-5">
            {icon ?? <ErrorCircle20Regular />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-body1 font-semibold text-foreground-1">{title}</p>
            {description && <p className="text-caption1 text-foreground-3">{description}</p>}
          </div>
          {actions}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role={variant === "alert" ? "alert" : undefined}
        className={cn("flex min-w-0 flex-col items-center justify-center gap-4 p-6 text-center text-balance", className)}
        {...props}
      >
        <div className="flex max-w-sm flex-col items-center gap-2">
          <div
            aria-hidden
            className="mb-1 flex size-12 items-center justify-center rounded-xlarge bg-danger-background-1 text-danger-foreground-1 [&_svg]:size-6"
          >
            {icon ?? <ErrorCircle24Regular />}
          </div>
          <h3 className="font-display text-subtitle1 font-semibold text-foreground-1">{title}</h3>
          {description && <p className="text-body1 text-foreground-3">{description}</p>}
        </div>
        {actions}
      </div>
    );
  },
);
ErrorState.displayName = "ErrorState";

/* ================================================================ AsyncContent */

export type AsyncStatus = "idle" | "loading" | "success" | "error" | "empty";

export interface AsyncContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  status: AsyncStatus;
  /** Nội dung khi success. Dạng hàm chỉ được gọi khi success (an toàn khi dữ liệu còn undefined). */
  children?: React.ReactNode | (() => React.ReactNode);
  /** Khung xương khi loading — nên khớp bố cục nội dung thật. Mặc định SkeletonText 3 dòng. */
  skeleton?: React.ReactNode;
  /** Thay ErrorState mặc định; dạng hàm nhận `retry` và `retrying`. */
  error?: React.ReactNode | ((state: { retry?: () => void | Promise<unknown>; retrying: boolean }) => React.ReactNode);
  /** Thay Empty mặc định. */
  empty?: React.ReactNode;
  /** Hiển thị khi idle (chưa tải). Mặc định không có gì. */
  idle?: React.ReactNode;
  onRetry?: () => void | Promise<unknown>;
  /** Câu được đọc cho trình đọc màn hình khi khung xương hiện. Mặc định lấy từ `messages.asyncContent.loading`. */
  loadingLabel?: string;
  /** Xem useSpinDelay. Mặc định 300. */
  delay?: number;
  /** Xem useSpinDelay. Mặc định 500. */
  minDuration?: number;
}

function DefaultEmpty() {
  const msg = useYugenMessages("asyncContent", asyncContentMessages);
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <DocumentSearch24Regular />
        </EmptyMedia>
        <EmptyTitle>{msg.emptyTitle}</EmptyTitle>
        <EmptyDescription>{msg.emptyDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/**
 * Hiển thị đúng một trạng thái: idle | loading | success | error | empty.
 * Tải nhanh hơn `delay` → không có khung xương nháy lên (giữ trạng thái trước đó); đã hiện → giữ ít nhất `minDuration`.
 */
export const AsyncContent = React.forwardRef<HTMLDivElement, AsyncContentProps>(
  (
    {
      status,
      children,
      skeleton,
      error,
      empty,
      idle = null,
      onRetry,
      loadingLabel: loadingLabelProp,
      delay = 300,
      minDuration = 500,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const msg = useYugenMessages("asyncContent", asyncContentMessages);
    const loadingLabel = loadingLabelProp ?? msg.loading;
    const loading = status === "loading";
    const showLoader = useSpinDelay(loading, { delay, minDuration });
    // Trạng thái đã ổn định gần nhất — hiển thị tiếp trong khoảng delay thay vì nháy trống.
    const [settled, setSettled] = React.useState<Exclude<AsyncStatus, "loading">>(
      status === "loading" ? "idle" : status,
    );
    if (status !== "loading" && status !== settled) setSettled(status);
    const view: AsyncStatus = showLoader ? "loading" : loading ? settled : status;

    const { announce } = useAnnounce();
    React.useEffect(() => {
      if (showLoader) announce(loadingLabel);
    }, [showLoader, loadingLabel, announce]);

    // Nội dung đang chứa focus (vd. nút "Thử lại") bị thay → giữ focus trong vùng thay vì rơi về <body>.
    const rootRef = React.useRef<HTMLDivElement>(null);
    const focusInside = React.useRef(false);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root || !focusInside.current) return;
      const activeEl = document.activeElement;
      if (!activeEl || activeEl === document.body || !root.contains(activeEl)) root.focus({ preventScroll: true });
    }, [view]);

    let content: React.ReactNode;
    switch (view) {
      case "loading":
        content = skeleton ?? <SkeletonText lines={3} />;
        break;
      case "error":
        content =
          typeof error === "function"
            ? error({ retry: onRetry, retrying: loading })
            : (error ?? <ErrorState variant="alert" onRetry={onRetry} retrying={loading} />);
        break;
      case "empty":
        content = empty ?? <DefaultEmpty />;
        break;
      case "success":
        content = typeof children === "function" ? children() : children;
        break;
      default:
        content = idle;
    }

    return (
      <div
        ref={rootRef}
        tabIndex={-1}
        aria-busy={loading}
        className={cn("min-w-0", className)}
        onFocus={(event) => {
          focusInside.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          // relatedTarget null = phần tử bị gỡ khỏi DOM hoặc bấm ra nền → vẫn coi như focus đang ở vùng này.
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next)) focusInside.current = false;
          onBlur?.(event);
        }}
        {...props}
      >
        <div key={view} className="animate-fade-in motion-reduce:animate-none">
          {content}
        </div>
      </div>
    );
  },
);
AsyncContent.displayName = "AsyncContent";

/* ================================================================ useOptimisticList */

export interface OptimisticOptions {
  /** Tiêu đề toast khi thất bại. Mặc định lấy từ `messages.optimisticList.errorTitle`. */
  errorTitle?: React.ReactNode;
  /** Nội dung toast khi thất bại. Mặc định lấy từ `messages.optimisticList.errorBody`. */
  errorBody?: React.ReactNode;
  /** false → không hiện toast (tự xử lý qua onError / giá trị trả về). */
  toast?: boolean;
  onError?: (error: unknown) => void;
}

interface PendingChange<T> {
  id: number;
  update: (items: T[]) => T[];
}

/**
 * Áp thay đổi lên danh sách ngay lập tức, gửi lên server sau; thất bại → chỉ gỡ đúng thay đổi đó (các thay đổi
 * khác đang chờ vẫn giữ) và báo bằng toast có nút "Thử lại".
 * `update` phải là hàm thuần dựa trên id (không dựa trên vị trí) vì nó được áp lại lên dữ liệu mới nhất.
 */
export function useOptimisticList<T>(initial: T[] | (() => T[])) {
  const [base, setBase] = React.useState<T[]>(initial);
  const [queue, setQueue] = React.useState<PendingChange<T>[]>([]);
  const nextId = React.useRef(0);
  // Ref thay cho dependency: `mutate` giữ nguyên tham chiếu kể cả khi messages đổi.
  const msg = useYugenMessages("optimisticList", optimisticListMessages);
  const msgRef = React.useRef(msg);
  msgRef.current = msg;
  const items = React.useMemo(() => queue.reduce((list, change) => change.update(list), base), [base, queue]);

  const mutate = React.useCallback(async function run(
    update: (items: T[]) => T[],
    commit: () => Promise<unknown>,
    options: OptimisticOptions = {},
  ): Promise<boolean> {
    const id = ++nextId.current;
    setQueue((q) => [...q, { id, update }]);
    try {
      await commit();
      // Cùng một lần render: đưa thay đổi vào dữ liệu gốc và gỡ khỏi hàng chờ → không nháy.
      setBase(update);
      setQueue((q) => q.filter((change) => change.id !== id));
      return true;
    } catch (error) {
      setQueue((q) => q.filter((change) => change.id !== id));
      options.onError?.(error);
      if (options.toast !== false) {
        const m = msgRef.current;
        toast({
          intent: "error",
          title: options.errorTitle ?? m.errorTitle,
          body: options.errorBody ?? m.errorBody,
          timeout: -1,
          action: { label: m.retry, altText: m.retryAltText, onClick: () => void run(update, commit, options) },
        });
      }
      return false;
    }
  }, []);

  return { items, setItems: setBase, mutate, pending: queue.length > 0 };
}
