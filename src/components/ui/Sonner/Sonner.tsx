import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { useDirection } from "@radix-ui/react-direction";
import {
  CheckmarkCircle20Filled,
  DiamondDismiss20Filled,
  Dismiss20Regular,
  Info20Filled,
  Warning20Filled,
} from "@fluentui/react-icons";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import { useYugenMessages } from "../YugenProvider/context";
import { sonnerMessages } from "./messages";
import { cn } from "@/lib/cn";

export { sonnerMessages, sonnerMessagesEn, type SonnerMessages } from "./messages";

/**
 * Sonner — thông báo xếp chồng kiểu Sonner (shadcn/ui): toast mới nhất ở trước, toast cũ ló ra phía sau; trỏ chuột hoặc
 * focus vào thì xoè thành danh sách. Dựng trên Radix Toast (F8, đọc cho trình đọc màn hình, tạm dừng khi tương tác).
 */
export type SonnerType = "default" | "success" | "info" | "warning" | "error" | "loading";
export type SonnerPosition = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end";

export interface SonnerButton {
  label: React.ReactNode;
  /** Mô tả cho trình đọc màn hình (cách làm việc này khi toast đã đóng). Mặc định = label nếu là chuỗi. */
  altText?: string;
  /** Gọi `event.preventDefault()` để giữ toast mở. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface SonnerOptions {
  /** id tuỳ chọn; gọi lại với id của toast đang mở sẽ thay nội dung tại chỗ. */
  id?: string;
  description?: React.ReactNode;
  /** Thay icon theo loại; `null` = không icon. */
  icon?: React.ReactNode;
  /** Nút chính (primary). */
  action?: SonnerButton;
  /** Nút phụ (subtle) — đóng toast. */
  cancel?: SonnerButton;
  /** Thời gian tự đóng (ms). `Infinity` = không tự đóng. Mặc định theo `Sonner.duration`; loading luôn là Infinity. */
  duration?: number;
  /** Hiện nút đóng (X); mặc định theo `Sonner.closeButton`. */
  closeButton?: boolean;
  /** Sonner đích; bỏ trống = Sonner mặc định (không có sonnerId). */
  sonnerId?: string;
  /** Người dùng đóng (nút, vuốt, Esc) hoặc gọi `sonner.dismiss`. */
  onDismiss?: (id: string) => void;
  /** Hết thời gian tự đóng. */
  onAutoClose?: (id: string) => void;
  className?: string;
}

export interface SonnerPromiseData<T> extends Omit<SonnerOptions, "id"> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
}

interface SonnerRecord extends SonnerOptions {
  id: string;
  type: SonnerType;
  title: React.ReactNode;
  open: boolean;
  /** Tăng mỗi lần cập nhật tại chỗ — Root được gắn lại để Radix đọc nội dung mới và đếm giờ lại từ đầu. */
  revision: number;
}

/* ------------------------------------------------------------------ store */

let records: SonnerRecord[] = [];
let counter = 0;
const EMPTY: SonnerRecord[] = [];
const listeners = new Set<() => void>();
const REMOVE_DELAY = 1000; // giữ record đủ lâu cho animation đóng chạy xong

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => records;
const getServerSnapshot = () => EMPTY;

function show(type: SonnerType, title: React.ReactNode, options: SonnerOptions = {}): string {
  const id = options.id ?? `sonner-${++counter}`;
  const current = records.find((t) => t.id === id);
  if (current?.open) {
    records = records.map((t) => (t.id === id ? { ...t, ...options, id, type, title, revision: t.revision + 1 } : t));
  } else {
    records = [...records.filter((t) => t.id !== id), { ...options, id, type, title, open: true, revision: 0 }];
  }
  emit();
  return id;
}

function close(id: string, reason: "dismiss" | "auto") {
  const target = records.find((t) => t.id === id);
  if (!target || !target.open) return;
  records = records.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  (reason === "auto" ? target.onAutoClose : target.onDismiss)?.(id);
  window.setTimeout(() => {
    records = records.filter((t) => t.id !== id || t.open);
    emit();
  }, REMOVE_DELAY);
}

const isOpen = (id: string) => records.some((t) => t.id === id && t.open);

type SonnerShow = (title: React.ReactNode, options?: SonnerOptions) => string;

export interface SonnerFn extends SonnerShow {
  success: SonnerShow;
  info: SonnerShow;
  warning: SonnerShow;
  error: SonnerShow;
  /** Không tự đóng; cập nhật bằng cùng `id` khi xong. */
  loading: SonnerShow;
  /** Toast loading theo một promise, rồi đổi tại chỗ thành success / error. Trả về id. */
  promise: <T>(promise: Promise<T> | (() => Promise<T>), data: SonnerPromiseData<T>) => string;
  /** Đóng một toast; bỏ trống id = đóng tất cả. */
  dismiss: (id?: string) => void;
}

/** `sonner("Đã lưu")`, `sonner.success(…)`, `sonner.promise(…)` — hiển thị ở `<Sonner />` đặt ở gốc ứng dụng. */
export const sonner: SonnerFn = Object.assign((title: React.ReactNode, options?: SonnerOptions) => show("default", title, options), {
  success: (title: React.ReactNode, options?: SonnerOptions) => show("success", title, options),
  info: (title: React.ReactNode, options?: SonnerOptions) => show("info", title, options),
  warning: (title: React.ReactNode, options?: SonnerOptions) => show("warning", title, options),
  error: (title: React.ReactNode, options?: SonnerOptions) => show("error", title, options),
  loading: (title: React.ReactNode, options?: SonnerOptions) => show("loading", title, options),
  promise: <T,>(input: Promise<T> | (() => Promise<T>), data: SonnerPromiseData<T>) => {
    const { loading, success, error, ...options } = data;
    const id = show("loading", loading, options);
    (typeof input === "function" ? input() : input).then(
      (value) => {
        if (isOpen(id)) show("success", typeof success === "function" ? success(value) : success, { ...options, id });
      },
      (reason: unknown) => {
        if (isOpen(id)) show("error", typeof error === "function" ? error(reason) : error, { ...options, id });
      },
    );
    return id;
  },
  dismiss: (id?: string) => {
    for (const t of records) if (t.open && (id === undefined || t.id === id)) close(t.id, "dismiss");
  },
});

/* ------------------------------------------------------------------ Sonner */

/** Cùng icon / màu với MessageBar và Toast. */
const ICON = {
  info: { icon: Info20Filled, className: "text-foreground-3" },
  success: { icon: CheckmarkCircle20Filled, className: "text-success-foreground-1" },
  warning: { icon: Warning20Filled, className: "text-warning-foreground-1" },
  error: { icon: DiamondDismiss20Filled, className: "text-danger-foreground-1" },
} as const;

/** richColors: nền và viền theo loại, như MessageBar. */
const RICH: Partial<Record<SonnerType, string>> = {
  info: "border-stroke-2 bg-background-3",
  success: "border-success-border-1 bg-success-background-1",
  warning: "border-warning-border-1 bg-warning-background-1",
  error: "border-danger-border-1 bg-danger-background-1",
};

interface PositionConfig {
  viewport: string;
  /** Mép neo của chồng: toast mới vào từ mép này, toast cũ lùi về phía kia. */
  edge: "top" | "bottom";
  /** Theo chiều đọc; đổi sang left/right vật lý của Radix theo `useDirection()`. */
  swipe: "start" | "end" | "up" | "down";
  /** Animation khi vuốt đóng, nối tiếp vị trí ngón tay. */
  swipeExit: string;
}

const POSITION: Record<SonnerPosition, PositionConfig> = {
  "top-start": {
    viewport: "top-4 inset-s-4 sm:top-6 sm:inset-s-6",
    edge: "top",
    swipe: "start",
    swipeExit: "data-[swipe=end]:data-[state=closed]:animate-slide-out-start",
  },
  top: { viewport: "top-4 left-1/2 -translate-x-1/2 sm:top-6", edge: "top", swipe: "up", swipeExit: "" },
  "top-end": {
    viewport: "top-4 inset-e-4 sm:top-6 sm:inset-e-6",
    edge: "top",
    swipe: "end",
    swipeExit: "data-[swipe=end]:data-[state=closed]:animate-slide-out-end",
  },
  "bottom-start": {
    viewport: "bottom-4 inset-s-4 sm:bottom-6 sm:inset-s-6",
    edge: "bottom",
    swipe: "start",
    swipeExit: "data-[swipe=end]:data-[state=closed]:animate-slide-out-start",
  },
  bottom: {
    viewport: "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6",
    edge: "bottom",
    swipe: "down",
    swipeExit: "data-[swipe=end]:data-[state=closed]:animate-slide-out-bottom",
  },
  "bottom-end": {
    viewport: "bottom-4 inset-e-4 sm:bottom-6 sm:inset-e-6",
    edge: "bottom",
    swipe: "end",
    swipeExit: "data-[swipe=end]:data-[state=closed]:animate-slide-out-end",
  },
};

export interface SonnerProps {
  /** Vị trí vùng thông báo. */
  position?: SonnerPosition;
  /** Chỉ hiển thị toast gửi tới sonnerId này (nhiều Sonner trong một app). */
  sonnerId?: string;
  /** Luôn xoè thành danh sách thay vì xếp chồng. */
  expand?: boolean;
  /** Số toast nhìn thấy cùng lúc; toast cũ hơn ẩn phía sau tới khi có chỗ. */
  visibleToasts?: number;
  /** Nền và viền theo loại (success / info / warning / error). */
  richColors?: boolean;
  /** Hiện nút đóng (X) trên mọi toast. */
  closeButton?: boolean;
  /** Thời gian tự đóng mặc định (ms). */
  duration?: number;
  /** Khoảng cách giữa các toast khi xoè, và phần ló ra khi xếp chồng (px). */
  gap?: number;
  className?: string;
}

/** Đặt một lần ở gốc ứng dụng; gọi `sonner(…)` ở bất kỳ đâu. */
export function Sonner({
  position = "bottom-end",
  sonnerId,
  expand = false,
  visibleToasts = 3,
  richColors = false,
  closeButton = false,
  duration = 4000,
  gap = 12,
  className,
}: SonnerProps) {
  const all = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = all.filter((t) => t.sonnerId === sonnerId);
  const msg = useYugenMessages("sonner", sonnerMessages);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const onHeight = React.useCallback((id: string, height: number) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }, []);

  const config = POSITION[position];
  const rtl = useDirection() === "rtl";
  const swipeDirection =
    config.swipe === "start" ? (rtl ? "right" : "left") : config.swipe === "end" ? (rtl ? "left" : "right") : config.swipe;

  // Mới nhất trước. Toast đang đóng giữ chỗ theo số toast còn mở đứng trước nó, nên chồng dồn lên trong lúc nó mờ đi.
  const ordered = [...items].reverse();
  let openBefore = 0;
  let offset = 0;
  const layout = ordered.map((record, order) => {
    const entry = { record, order, index: openBefore, offset };
    if (record.open) {
      if (openBefore < visibleToasts) offset += (heights[record.id] ?? 0) + gap;
      openBefore++;
    }
    return entry;
  });
  const openCount = openBefore;
  const expanded = expand || ((hovered || focused) && openCount > 0);
  const frontId = ordered.find((t) => t.open)?.id;
  const frontHeight = frontId === undefined ? undefined : heights[frontId];
  const stackHeight = expanded
    ? Math.max(0, offset - gap)
    : (frontHeight ?? 0) + gap * Math.max(0, Math.min(openCount, visibleToasts) - 1);

  // Hết toast trong lúc chuột còn nằm trên vùng → pointerleave không bao giờ tới.
  React.useEffect(() => {
    if (openCount === 0) setHovered(false);
  }, [openCount]);

  // Listener DOM gốc: li được Radix portal vào ol nên sự kiện React của chúng không đi qua Viewport.
  const [viewport, setViewport] = React.useState<HTMLOListElement | null>(null);
  React.useEffect(() => {
    if (!viewport) return;
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== "touch") setHovered(true);
    };
    const leave = () => setHovered(false);
    const focusIn = () => setFocused(true);
    const focusOut = (e: FocusEvent) => {
      if (!viewport.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    viewport.addEventListener("pointerenter", enter);
    viewport.addEventListener("pointerleave", leave);
    viewport.addEventListener("focusin", focusIn);
    viewport.addEventListener("focusout", focusOut);
    return () => {
      viewport.removeEventListener("pointerenter", enter);
      viewport.removeEventListener("pointerleave", leave);
      viewport.removeEventListener("focusin", focusIn);
      viewport.removeEventListener("focusout", focusOut);
    };
  }, [viewport]);

  const ids = items.map((t) => t.id).join(" ");
  React.useEffect(() => {
    const live = new Set(ids.split(" "));
    setHeights((prev) => {
      const keys = Object.keys(prev);
      return keys.every((k) => live.has(k)) ? prev : Object.fromEntries(keys.filter((k) => live.has(k)).map((k) => [k, prev[k]]));
    });
  }, [ids]);

  return (
    <ToastPrimitive.Provider swipeDirection={swipeDirection} label={msg.region}>
      {layout.map(({ record, order, index, offset: itemOffset }) => (
        <SonnerItem
          key={`${record.id}:${record.revision}`}
          record={record}
          zIndex={ordered.length - order}
          index={index}
          visible={index < visibleToasts}
          visibleToasts={visibleToasts}
          expanded={expanded}
          offset={itemOffset}
          height={heights[record.id]}
          frontHeight={frontHeight}
          gap={gap}
          config={config}
          richColors={richColors}
          closeButton={record.closeButton ?? closeButton}
          duration={record.type === "loading" ? Infinity : (record.duration ?? duration)}
          dismissLabel={msg.dismiss}
          onHeight={onHeight}
        />
      ))}
      <ToastPrimitive.Viewport
        label={msg.regionHotkey}
        ref={setViewport}
        data-expanded={expanded}
        style={{ height: stackHeight }}
        className={cn(
          "fixed z-100 m-0 w-89 max-w-[calc(100vw-32px)] list-none p-0 outline-none",
          "transition-[height] duration-slow ease-decelerate-max motion-reduce:transition-none",
          config.viewport,
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

interface SonnerItemProps {
  record: SonnerRecord;
  zIndex: number;
  /** Vị trí trong chồng, 0 = trước nhất. */
  index: number;
  visible: boolean;
  visibleToasts: number;
  expanded: boolean;
  /** Khoảng cách từ mép neo khi xoè (px). */
  offset: number;
  height: number | undefined;
  frontHeight: number | undefined;
  gap: number;
  config: PositionConfig;
  richColors: boolean;
  closeButton: boolean;
  duration: number;
  dismissLabel: string;
  onHeight: (id: string, height: number) => void;
}

function SonnerItem({
  record,
  zIndex,
  index,
  visible,
  visibleToasts,
  expanded,
  offset,
  height,
  frontHeight,
  gap,
  config,
  richColors,
  closeButton,
  duration,
  dismissLabel,
  onHeight,
}: SonnerItemProps) {
  const { id, type, title, description, action, cancel } = record;
  const rootRef = React.useRef<HTMLLIElement>(null);
  // Radix chỉ render li khi viewport đã có → theo dõi bằng state để đo lại khi phần tử xuất hiện.
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  // Bản gắn lại sau khi cập nhật tại chỗ đã ở đúng chỗ → không trượt vào lần nữa.
  const [mounted, setMounted] = React.useState(record.revision > 0);
  const closedByUser = React.useRef(false);
  const markUser = () => {
    closedByUser.current = true;
  };

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !content) return;
    // li bị ép chiều cao khi nằm sau trong chồng → đo phần nội dung, cộng viền của li.
    const measure = () => onHeight(id, content.offsetHeight + root.offsetHeight - root.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [id, content, onHeight]);

  // Lần đo ở trên đã buộc trình duyệt tính style ban đầu (ngoài mép) → đổi sang vị trí trong chồng sẽ chạy transition.
  useIsomorphicLayoutEffect(() => {
    if (content && !mounted) setMounted(true);
  }, [content, mounted]);

  const behind = !expanded && index > 0;
  const step = Math.min(index, visibleToasts);
  const lift = (expanded ? offset : step * gap) * (config.edge === "bottom" ? -1 : 1);
  const style: React.CSSProperties = mounted
    ? {
        zIndex,
        // Radix đặt biến vuốt trên li; cộng vào vị trí trong chồng thay vì ghi đè nó.
        translate: `var(--radix-toast-swipe-end-x, var(--radix-toast-swipe-move-x, 0px)) calc(${lift}px + var(--radix-toast-swipe-end-y, var(--radix-toast-swipe-move-y, 0px)))`,
        scale: expanded ? undefined : String(1 - step * 0.05),
        height: behind ? frontHeight : height,
        opacity: visible ? undefined : 0,
      }
    : { zIndex, translate: `0 ${config.edge === "bottom" ? "100%" : "-100%"}`, opacity: 0 };

  const preset = type === "default" || type === "loading" ? undefined : ICON[type];
  const icon =
    record.icon !== undefined ? (
      record.icon
    ) : type === "loading" ? (
      <Spinner size="tiny" aria-hidden />
    ) : preset ? (
      <preset.icon aria-hidden className={preset.className} />
    ) : null;
  const altText = (button: SonnerButton) => button.altText ?? (typeof button.label === "string" ? button.label : "");

  return (
    <ToastPrimitive.Root
      ref={rootRef}
      open={record.open}
      onOpenChange={(next) => {
        if (!next) close(id, closedByUser.current ? "dismiss" : "auto");
      }}
      onSwipeEnd={markUser}
      onEscapeKeyDown={markUser}
      duration={duration}
      type={type === "error" || type === "warning" ? "foreground" : "background"}
      data-type={type}
      data-index={index}
      data-front={index === 0 && record.open}
      data-expanded={expanded}
      data-visible={visible}
      aria-hidden={visible ? undefined : true}
      style={style}
      className={cn(
        "absolute inset-x-0 overflow-hidden rounded-large border text-body1 text-foreground-1 shadow-16",
        config.edge === "bottom" ? "bottom-0" : "top-0",
        (richColors && RICH[type]) || "border-transparent bg-background-1",
        "transition-[translate,scale,opacity,height,visibility] duration-slow ease-decelerate-max",
        "data-[swipe=move]:transition-none data-[visible=false]:pointer-events-none data-[visible=false]:invisible",
        "data-[state=closed]:animate-fade-out",
        config.swipeExit,
        "motion-reduce:animate-none motion-reduce:transition-none",
        record.className,
      )}
    >
      <div
        ref={setContent}
        className={cn(
          "flex items-start gap-3 px-4 py-3 transition-opacity duration-normal motion-reduce:transition-none",
          behind && "opacity-0",
        )}
      >
        {icon && <span className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">{icon}</span>}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-px">
          <ToastPrimitive.Title className="font-semibold">{title}</ToastPrimitive.Title>
          {description && <ToastPrimitive.Description className="text-foreground-2">{description}</ToastPrimitive.Description>}
        </div>
        {(cancel || action) && (
          <div className="flex shrink-0 items-center gap-2 self-center">
            {cancel && (
              <ToastPrimitive.Close asChild>
                <Button
                  size="small"
                  appearance="subtle"
                  onClick={(e) => {
                    cancel.onClick?.(e);
                    if (!e.defaultPrevented) markUser();
                  }}
                >
                  {cancel.label}
                </Button>
              </ToastPrimitive.Close>
            )}
            {action && (
              <ToastPrimitive.Action asChild altText={altText(action)}>
                <Button
                  size="small"
                  appearance="primary"
                  onClick={(e) => {
                    action.onClick?.(e);
                    if (!e.defaultPrevented) markUser();
                  }}
                >
                  {action.label}
                </Button>
              </ToastPrimitive.Action>
            )}
          </div>
        )}
        {closeButton && (
          <ToastPrimitive.Close
            aria-label={dismissLabel}
            onClick={markUser}
            className="-me-1 -mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-medium text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed"
          >
            <Dismiss20Regular className="size-4" />
          </ToastPrimitive.Close>
        )}
      </div>
    </ToastPrimitive.Root>
  );
}
