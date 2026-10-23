/** Yugen Labs · NotificationCenter — chuông thông báo + bảng thông báo (Popover trên desktop, bottom sheet trên mobile). */
import * as React from "react";
import {
  Alert20Regular,
  AlertOff20Regular,
  CheckmarkCircle16Regular,
  CheckmarkCircle20Regular,
  Dismiss16Regular,
  Dismiss20Regular,
  ErrorCircle20Regular,
  Info20Regular,
  MailRead16Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useAnnounce } from "../AriaLive/AriaLive";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { CounterBadge } from "../CounterBadge/CounterBadge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../Empty/Empty";
import { ErrorState, useSpinDelay } from "../Loading/Loading";
import { Popover, PopoverSurface, PopoverTrigger } from "../Popover/Popover";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../Sheet/Sheet";
import { useMediaQuery } from "../Sheet/useMediaQuery";
import { SkeletonList } from "../Skeleton/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Tabs/Tabs";

export type NotificationIntent = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  /** Thời điểm (Date, ISO string hoặc timestamp). */
  time: Date | string | number;
  read?: boolean;
  /** Người gửi → Avatar theo tên. */
  author?: string;
  avatarSrc?: string;
  /** Icon thay Avatar; mặc định theo intent. */
  icon?: React.ReactNode;
  intent?: NotificationIntent;
  /** Link mở khi bấm thông báo. */
  href?: string;
}

/* ================================================================ Thời gian */

const DAY = 86_400_000;
const toDate = (time: NotificationItem["time"]) => (time instanceof Date ? time : new Date(time));
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Vừa xong" · "5 phút trước" · "3 giờ trước" · "14:05" (ngày khác). */
export function formatRelativeTime(time: NotificationItem["time"], now: Date | number): string {
  const date = toDate(time);
  const ref = typeof now === "number" ? now : now.getTime();
  const diff = ref - date.getTime();
  if (Number.isNaN(diff)) return "";
  if (diff >= 0 && diff < 60_000) return "Vừa xong";
  if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
  if (diff >= 0 && diff < DAY && startOfDay(date) === startOfDay(new Date(ref))) return `${Math.floor(diff / 3_600_000)} giờ trước`;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/** "Hôm nay" · "Hôm qua" · "Thứ Hai, 12/10" (trong tuần) · "12/10/2025". */
export function formatNotificationDay(time: NotificationItem["time"], now: Date | number): string {
  const date = toDate(time);
  const ref = new Date(typeof now === "number" ? now : now.getTime());
  const days = Math.round((startOfDay(ref) - startOfDay(date)) / DAY);
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days > 1 && days < 7) return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: date.getFullYear() === ref.getFullYear() ? undefined : "numeric",
  });
}

/** Nhóm thông báo theo ngày (mới nhất trước). */
export function groupNotificationsByDay(items: NotificationItem[], now: Date | number) {
  const sorted = [...items].sort((a, b) => toDate(b.time).getTime() - toDate(a.time).getTime());
  const groups: { label: string; items: NotificationItem[] }[] = [];
  for (const item of sorted) {
    const label = formatNotificationDay(item.time, now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

/** "Bây giờ", chỉ có sau khi mount (null trên server) và cập nhật mỗi phút. */
function useNow(fixed?: Date | number): number | null {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (fixed !== undefined) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [fixed]);
  if (fixed !== undefined) return typeof fixed === "number" ? fixed : fixed.getTime();
  return now;
}

/* ================================================================ useNotifications */

let seq = 0;

export type NewNotification = Omit<NotificationItem, "id" | "time"> & Partial<Pick<NotificationItem, "id" | "time">>;

/** Kho thông báo nhỏ cho demo / prototype — `bind` trải thẳng vào NotificationCenter. */
export function useNotifications(initial: NotificationItem[] | (() => NotificationItem[]) = []) {
  const [items, setItems] = React.useState<NotificationItem[]>(initial);
  const add = React.useCallback((item: NewNotification) => {
    const full: NotificationItem = { ...item, id: item.id ?? `notification-${++seq}`, time: item.time ?? Date.now() };
    setItems((list) => [full, ...list]);
    return full.id;
  }, []);
  const markRead = React.useCallback((id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))), []);
  const markAllRead = React.useCallback(() => setItems((list) => list.map((n) => (n.read ? n : { ...n, read: true }))), []);
  const dismiss = React.useCallback((id: string) => setItems((list) => list.filter((n) => n.id !== id)), []);
  const clear = React.useCallback(() => setItems([]), []);
  const unreadCount = items.filter((n) => !n.read).length;
  return {
    items,
    setItems,
    unreadCount,
    add,
    markRead,
    markAllRead,
    dismiss,
    clear,
    bind: { items, onMarkRead: markRead, onMarkAllRead: markAllRead, onDismiss: dismiss },
  };
}

/* ================================================================ Mục thông báo */

const INTENT: Record<NotificationIntent, { icon: React.ReactNode; className: string }> = {
  info: { icon: <Info20Regular />, className: "bg-background-4 text-foreground-2" },
  success: { icon: <CheckmarkCircle20Regular />, className: "bg-success-background-1 text-success-foreground-1" },
  warning: { icon: <Warning20Regular />, className: "bg-warning-background-1 text-warning-foreground-1" },
  error: { icon: <ErrorCircle20Regular />, className: "bg-danger-background-1 text-danger-foreground-1" },
};

interface ItemProps {
  item: NotificationItem;
  now: number | null;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onItemClick?: (item: NotificationItem) => void;
  onBeforeRemove: (li: HTMLLIElement | null) => void;
}

function NotificationRow({ item, now, onMarkRead, onDismiss, onItemClick, onBeforeRemove }: ItemProps) {
  const liRef = React.useRef<HTMLLIElement>(null);
  const unread = !item.read;
  const date = toDate(item.time);
  const clickable = !!item.href || !!onItemClick;
  const activate = () => {
    onItemClick?.(item);
    if (unread) onMarkRead?.(item.id);
  };
  const titleClass = cn(
    "text-start text-body1 text-foreground-1",
    unread && "font-semibold",
    clickable && "rounded-small after:absolute after:inset-0 hover:underline",
  );
  const intent = INTENT[item.intent ?? "info"];

  return (
    <li ref={liRef} data-unread={unread || undefined} className="group/notification relative flex gap-3 px-4 py-3 hover:bg-subtle-hover">
      <span className="shrink-0">
        {item.icon ? (
          <span aria-hidden className={cn("flex size-8 items-center justify-center rounded-circular [&_svg]:size-5", intent.className)}>
            {item.icon}
          </span>
        ) : item.author ? (
          <Avatar name={item.author} src={item.avatarSrc} size={32} color="colorful" />
        ) : (
          <span aria-hidden className={cn("flex size-8 items-center justify-center rounded-circular [&_svg]:size-5", intent.className)}>
            {intent.icon}
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="min-w-0 wrap-break-word">
          {item.href ? (
            <a href={item.href} onClick={activate} className={titleClass}>
              {item.title}
            </a>
          ) : onItemClick ? (
            <button type="button" onClick={activate} className={titleClass}>
              {item.title}
            </button>
          ) : (
            <span className={titleClass}>{item.title}</span>
          )}
          {unread && <span className="sr-only">, chưa đọc</span>}
        </p>
        {item.body && <p className="line-clamp-2 text-caption1 text-foreground-2">{item.body}</p>}
        <time dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()} className="text-caption1 text-foreground-3">
          {now === null ? "" : formatRelativeTime(date, now)}
        </time>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1">
        <span aria-hidden className={cn("mt-1.5 size-2 rounded-circular", unread ? "bg-brand-background" : "bg-transparent")} />
        <div className="flex gap-0.5 opacity-0 transition-opacity duration-faster group-focus-within/notification:opacity-100 group-hover/notification:opacity-100 pointer-coarse:opacity-100">
          {unread && onMarkRead && (
            <Button
              size="small"
              appearance="subtle"
              icon={<MailRead16Regular />}
              aria-label={`Đánh dấu đã đọc: ${item.title}`}
              title="Đánh dấu đã đọc"
              onClick={() => onMarkRead(item.id)}
            />
          )}
          {onDismiss && (
            <Button
              size="small"
              appearance="subtle"
              icon={<Dismiss16Regular />}
              aria-label={`Bỏ thông báo: ${item.title}`}
              title="Bỏ thông báo"
              onClick={() => {
                onBeforeRemove(liRef.current);
                onDismiss(item.id);
              }}
            />
          )}
        </div>
      </div>
    </li>
  );
}

/* ================================================================ NotificationPanel */

export type NotificationFilter = "all" | "unread";

export interface NotificationPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  items: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onItemClick?: (item: NotificationItem) => void;
  loading?: boolean;
  /** Lỗi tải: hiện ErrorState có nút Thử lại (cần onRetry). */
  error?: React.ReactNode;
  onRetry?: () => void | Promise<unknown>;
  /** Mốc "bây giờ" cố định (SSR / test). Bỏ trống → lấy sau khi mount, cập nhật mỗi phút. */
  now?: Date | number;
  /** Phần tử tiêu đề (h2, SheetTitle…). */
  heading?: React.ReactNode;
  filter?: NotificationFilter;
  defaultFilter?: NotificationFilter;
  onFilterChange?: (filter: NotificationFilter) => void;
  footer?: React.ReactNode;
}

/** Nội dung bảng thông báo (tiêu đề, lọc, danh sách theo ngày) — dùng riêng được trong trang / Drawer. */
export const NotificationPanel = React.forwardRef<HTMLDivElement, NotificationPanelProps>(
  (
    {
      items,
      onMarkRead,
      onMarkAllRead,
      onDismiss,
      onItemClick,
      loading = false,
      error,
      onRetry,
      now: nowProp,
      heading,
      filter: filterProp,
      defaultFilter = "all",
      onFilterChange,
      footer,
      className,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId();
    const now = useNow(nowProp);
    const [innerFilter, setInnerFilter] = React.useState<NotificationFilter>(defaultFilter);
    const filter = filterProp ?? innerFilter;
    const showSkeleton = useSpinDelay(loading);
    const unread = items.filter((n) => !n.read).length;
    const focusAfterRemove = React.useRef<HTMLElement | null>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    // Gỡ một mục → focus sang mục kế tiếp (hoặc trước đó) thay vì rơi về <body>.
    const onBeforeRemove = (li: HTMLLIElement | null) => {
      const sibling = (li?.nextElementSibling ?? li?.previousElementSibling) as HTMLElement | null;
      focusAfterRemove.current = sibling?.querySelector<HTMLElement>("a,button") ?? null;
    };
    React.useEffect(() => {
      const el = focusAfterRemove.current;
      if (!el) return;
      focusAfterRemove.current = null;
      if (el.isConnected) el.focus();
      else listRef.current?.querySelector<HTMLElement>("[role=tabpanel]")?.focus();
    }, [items]);

    const renderList = (list: NotificationItem[], which: NotificationFilter) => {
      if (error) return <ErrorState size="small" title="Không tải được thông báo" description={error} onRetry={onRetry} />;
      if (loading) return showSkeleton ? <SkeletonList rows={4} avatarSize={32} className="p-4" /> : null;
      if (list.length === 0) {
        return (
          <Empty className="p-5">
            <EmptyHeader>
              <EmptyMedia>
                <AlertOff20Regular />
              </EmptyMedia>
              <EmptyTitle className="text-subtitle2">{which === "unread" ? "Bạn đã đọc hết" : "Chưa có thông báo"}</EmptyTitle>
              <EmptyDescription>
                {which === "unread" ? "Không còn thông báo chưa đọc." : "Thông báo mới sẽ xuất hiện ở đây."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        );
      }
      const rowProps = { now, onMarkRead, onDismiss, onItemClick, onBeforeRemove };
      // Chưa biết "bây giờ" (SSR, trước mount) → danh sách phẳng, không nhãn ngày để tránh lệch hydration.
      if (now === null) {
        return (
          <ul aria-label="Thông báo">
            {list.map((item) => (
              <NotificationRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        );
      }
      return groupNotificationsByDay(list, now).map((group, g) => (
        <div key={group.label} role="group" aria-labelledby={`${uid}-${which}-${g}`}>
          <h3
            id={`${uid}-${which}-${g}`}
            className="sticky top-0 z-20 border-b border-stroke-3 bg-background-1 px-4 py-1 text-caption1 font-semibold text-foreground-3"
          >
            {group.label}
          </h3>
          <ul>
            {group.items.map((item) => (
              <NotificationRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </div>
      ));
    };

    return (
      <div ref={ref} aria-busy={loading || undefined} className={cn("flex min-h-0 flex-1 flex-col", className)} {...props}>
        <div className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-1">
          <div className="min-w-0 flex-1">{heading}</div>
          {onMarkAllRead && (
            <Button size="small" appearance="subtle" icon={<CheckmarkCircle16Regular />} disabled={unread === 0} onClick={onMarkAllRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <Tabs
          ref={listRef}
          value={filter}
          onValueChange={(v) => {
            const next = v as NotificationFilter;
            if (filterProp === undefined) setInnerFilter(next);
            onFilterChange?.(next);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList size="small" aria-label="Lọc thông báo" className="shrink-0 border-b border-stroke-2 px-2">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="unread">
              Chưa đọc{unread > 0 ? ` (${unread})` : ""}
            </TabsTrigger>
          </TabsList>
          {(["all", "unread"] as const).map((which) => (
            <TabsContent
              key={which}
              value={which}
              className="min-h-0 flex-1 overflow-y-auto pt-0 focus-visible:-outline-offset-2"
            >
              {renderList(which === "unread" ? items.filter((n) => !n.read) : items, which)}
            </TabsContent>
          ))}
        </Tabs>
        {footer && <div className="flex shrink-0 items-center justify-center border-t border-stroke-2 px-4 py-2">{footer}</div>}
      </div>
    );
  },
);
NotificationPanel.displayName = "NotificationPanel";

/* ================================================================ NotificationCenter */

export interface NotificationCenterProps
  extends Omit<NotificationPanelProps, "heading" | "className" | "style">,
    Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "disabled"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tiêu đề bảng và tên nút chuông. Mặc định "Thông báo". */
  title?: string;
  /** auto: Popover khi rộng ≥ breakpoint, bottom sheet khi hẹp hơn. */
  mode?: "auto" | "popover" | "sheet";
  breakpoint?: number;
  /** Đọc thông báo mới (chưa đọc) qua live region polite. Mặc định true. */
  announce?: boolean;
  /** Căn bảng theo nút (Popover). Mặc định "end". */
  align?: "start" | "center" | "end";
  panelClassName?: string;
}

/** ref trỏ vào nút chuông. */
export const NotificationCenter = React.forwardRef<HTMLButtonElement, NotificationCenterProps>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      title = "Thông báo",
      mode = "auto",
      breakpoint = 768,
      announce: announceNew = true,
      align = "end",
      className,
      style,
      disabled,
      panelClassName,
      ...panelProps
    },
    ref,
  ) => {
    const { items } = panelProps;
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openProp ?? innerOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    };
    const wide = useMediaQuery(`(min-width: ${breakpoint}px)`, { defaultValue: true });
    const asSheet = mode === "sheet" || (mode === "auto" && !wide);
    const headingId = React.useId();
    const unread = items.filter((n) => !n.read).length;

    // Thông báo mới (chưa từng thấy, chưa đọc) → đọc polite; lần render đầu không đọc.
    const { announce } = useAnnounce();
    const seen = React.useRef<Set<string> | null>(null);
    React.useEffect(() => {
      if (seen.current === null) {
        seen.current = new Set(items.map((n) => n.id));
        return;
      }
      const known = seen.current;
      const fresh = items.filter((n) => !known.has(n.id) && !n.read);
      items.forEach((n) => known.add(n.id));
      if (announceNew && fresh.length > 0) {
        announce(fresh.length === 1 ? `Thông báo mới: ${fresh[0].title}` : `${fresh.length} thông báo mới`, {
          batchId: "yugen-notification-center",
        });
      }
    }, [items, announceNew, announce]);

    const trigger = (
      <Button
        ref={ref}
        appearance="subtle"
        icon={<Alert20Regular />}
        aria-label={unread > 0 ? `${title}, ${unread} chưa đọc` : title}
        title={title}
        disabled={disabled}
        style={style}
        className={cn("relative overflow-visible", className)}
      >
        {unread > 0 && (
          <CounterBadge
            aria-hidden
            count={unread}
            size="small"
            color="danger"
            className="pointer-events-none absolute -inset-e-0.5 -top-0.5"
          />
        )}
      </Button>
    );

    if (asSheet) {
      return (
        <Sheet open={open} onOpenChange={setOpen} mode="bottom" snapPoints={[0.6, 0.95]}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent aria-describedby={undefined} className={panelClassName}>
            <SheetHeader
              className="pb-0"
              action={
                <SheetClose asChild>
                  <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Đóng" />
                </SheetClose>
              }
            >
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <NotificationPanel {...panelProps} className="pb-[env(safe-area-inset-bottom)]" />
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverSurface
          align={align}
          aria-labelledby={headingId}
          className={cn(
            "flex w-96 max-w-[calc(100vw-var(--spacingXXL))] flex-col overflow-hidden p-0",
            "max-h-[min(36rem,var(--radix-popover-content-available-height))]",
            panelClassName,
          )}
        >
          <NotificationPanel
            {...panelProps}
            heading={
              <h2 id={headingId} className="truncate text-subtitle2 font-semibold text-foreground-1">
                {title}
              </h2>
            }
          />
        </PopoverSurface>
      </Popover>
    );
  },
);
NotificationCenter.displayName = "NotificationCenter";
