/** Yugen Labs · MessageBubble, MessageReaction, MessageDaySeparator, TypingIndicator — các phần của giao diện hội thoại. */
import * as React from "react";
import {
  ArrowClockwise12Regular,
  CheckmarkCircle12Filled,
  CheckmarkCircle12Regular,
  Clock12Regular,
  ErrorCircle12Filled,
  Eye12Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Avatar } from "../Avatar/Avatar";

export type MessageSide = "incoming" | "outgoing";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";
export type MessageGroupPosition = "single" | "first" | "middle" | "last";

/** MessageScroller tự tính vị trí trong nhóm (tin liên tiếp cùng người gửi) và cung cấp qua context. */
export const MessageGroupContext = React.createContext<MessageGroupPosition | null>(null);

type IconComponent = React.ComponentType<{ className?: string }>;

const STATUS: Record<Exclude<MessageStatus, "error">, { label: string; icon: IconComponent }> = {
  sending: { label: "Đang gửi", icon: Clock12Regular },
  sent: { label: "Đã gửi", icon: CheckmarkCircle12Regular },
  delivered: { label: "Đã nhận", icon: CheckmarkCircle12Filled },
  read: { label: "Đã xem", icon: Eye12Regular },
};

/* ================================================================ MessageBubble */

export interface MessageBubbleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** incoming: tin của người khác / bot (bên đầu dòng) · outgoing: tin của mình (bên cuối dòng). */
  side?: MessageSide;
  author?: string;
  /** Thay avatar mặc định; `null` để ẩn. Mặc định: Avatar theo tên cho tin đến, không avatar cho tin đi. */
  avatar?: React.ReactNode;
  avatarSrc?: string;
  /** Giờ hiển thị (vd. "14:05"). */
  time?: string;
  /** Giá trị máy đọc cho <time> (ISO). */
  dateTime?: string;
  /** Trạng thái gửi (thường cho tin đi). */
  status?: MessageStatus;
  onRetry?: () => void;
  errorMessage?: string;
  /** Vị trí trong nhóm; mặc định lấy từ MessageScroller. */
  groupPosition?: MessageGroupPosition;
  /** Slot cảm xúc (MessageReaction). */
  reactions?: React.ReactNode;
  /** Đang nhận nội dung theo luồng — hiện con trỏ nhấp nháy, aria-busy. */
  streaming?: boolean;
  /** bubble: bong bóng (mặc định) · plain: không nền, rộng hết — hợp cho câu trả lời dài của AI. */
  appearance?: "bubble" | "plain";
  /** Văn bản thuần; xuống dòng được giữ nguyên. */
  children?: React.ReactNode;
}

const CORNERS: Record<MessageSide, Record<MessageGroupPosition, string>> = {
  incoming: { single: "", first: "rounded-es-small", middle: "rounded-ss-small rounded-es-small", last: "rounded-ss-small" },
  outgoing: { single: "", first: "rounded-ee-small", middle: "rounded-se-small rounded-ee-small", last: "rounded-se-small" },
};

export const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  (
    {
      side = "incoming",
      author,
      avatar,
      avatarSrc,
      time,
      dateTime,
      status,
      onRetry,
      errorMessage = "Không gửi được.",
      groupPosition,
      reactions,
      streaming = false,
      appearance = "bubble",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const contextPosition = React.useContext(MessageGroupContext);
    const position = groupPosition ?? contextPosition ?? "single";
    const outgoing = side === "outgoing";
    const startsGroup = position === "single" || position === "first";
    const plain = appearance === "plain";

    const avatarNode =
      avatar !== undefined ? avatar : !outgoing && author ? <Avatar name={author} src={avatarSrc} size={32} color="colorful" /> : null;
    const hasAvatarColumn = avatarNode !== null && avatarNode !== false;

    const timeNode = time ? (
      <time dateTime={dateTime} className="text-foreground-3">
        {time}
      </time>
    ) : null;

    const statusMeta = status && status !== "error" ? STATUS[status] : null;

    return (
      <div
        ref={ref}
        data-side={side}
        data-group={position}
        className={cn(
          "group/message flex w-full gap-2",
          outgoing && "flex-row-reverse",
          startsGroup ? "mt-3 first:mt-0" : "mt-0.5",
          className,
        )}
        {...props}
      >
        {hasAvatarColumn && (
          <div className="w-8 shrink-0">{startsGroup && avatarNode}</div>
        )}

        <div className={cn("flex min-w-0 flex-col", outgoing ? "items-end" : "items-start", plain ? "flex-1" : "max-w-[85%]")}>
          {startsGroup && (author || time) && (
            <div className={cn("mb-0.5 flex items-baseline gap-2 text-caption1", outgoing && "flex-row-reverse")}>
              {author && !outgoing && <span className="font-semibold text-foreground-1">{author}</span>}
              {author && outgoing && <span className="sr-only">{author}</span>}
              {timeNode}
            </div>
          )}

          <div className={cn("flex max-w-full items-end gap-1", outgoing && "flex-row-reverse")}>
            <div
              aria-busy={streaming || undefined}
              className={cn(
                "relative min-w-0 text-body1 wrap-break-word whitespace-pre-wrap text-foreground-1",
                plain
                  ? "w-full"
                  : cn(
                      "rounded-xlarge px-3 py-2",
                      outgoing ? "bg-brand-background-2" : "bg-background-1 shadow-2",
                      CORNERS[side][position],
                    ),
                status === "error" && !plain && "outline outline-danger-border-1",
              )}
            >
              {children}
              {streaming && (
                <span
                  aria-hidden
                  className="ms-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse rounded-circular bg-foreground-2 motion-reduce:animate-none"
                />
              )}
            </div>
            {/* Tin trong nhóm không lặp lại giờ — hiện khi rê chuột / focus. */}
            {!startsGroup && time && (
              <time
                dateTime={dateTime}
                className="shrink-0 pb-0.5 text-caption2 text-foreground-3 opacity-0 transition-opacity duration-faster group-focus-within/message:opacity-100 group-hover/message:opacity-100"
              >
                {time}
              </time>
            )}
          </div>

          {reactions && (
            <div className={cn("relative -mt-1 flex flex-wrap gap-0.5", outgoing ? "pe-2" : "ps-2")}>{reactions}</div>
          )}

          {status === "error" ? (
            <div role="alert" className="mt-0.5 flex items-center gap-1 text-caption1 text-danger-foreground-1">
              <ErrorCircle12Filled aria-hidden className="shrink-0" />
              <span>{errorMessage}</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-0.5 rounded-small font-semibold text-link hover:text-link-hover hover:underline"
                >
                  <ArrowClockwise12Regular aria-hidden />
                  Thử lại
                </button>
              )}
            </div>
          ) : (
            statusMeta && (
              <div title={statusMeta.label} className="mt-0.5 flex items-center gap-0.5 text-caption2 text-foreground-3">
                <statusMeta.icon aria-hidden className={cn("shrink-0", status === "read" && "text-brand-foreground-1")} />
                <span className="sr-only">{statusMeta.label}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  },
);
MessageBubble.displayName = "MessageBubble";

/* ================================================================ MessageReaction */

export interface MessageReactionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  count?: number;
  /** Người dùng hiện tại đã thả cảm xúc này. */
  selected?: boolean;
  /** Tên đọc cho trình đọc màn hình (vd. "Thích"). */
  label?: string;
}

export const MessageReaction = React.forwardRef<HTMLButtonElement, MessageReactionProps>(
  ({ emoji, count, selected = false, label, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      aria-label={label ? `${label}${count !== undefined ? `: ${count}` : ""}` : undefined}
      className={cn(
        "inline-flex h-6 items-center gap-0.5 rounded-circular border px-1.5 text-caption1 shadow-2",
        "transition-colors duration-faster ease-easy-ease",
        selected
          ? "border-brand-stroke bg-brand-background-2 text-brand-foreground-2 hover:bg-brand-background-2-hover"
          : "border-stroke-2 bg-background-1 text-foreground-2 hover:bg-background-1-hover",
        className,
      )}
      {...props}
    >
      <span aria-hidden>{emoji}</span>
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  ),
);
MessageReaction.displayName = "MessageReaction";

/* ================================================================ MessageDaySeparator */

export interface MessageDaySeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Giá trị máy đọc cho <time> (ISO). */
  dateTime?: string;
}

/** Mốc ngày giữa các tin nhắn ("Hôm nay", "Thứ Hai, 12/10"). Chữ vẫn được trình đọc màn hình đọc. */
export const MessageDaySeparator = React.forwardRef<HTMLDivElement, MessageDaySeparatorProps>(
  ({ dateTime, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("my-3 flex items-center gap-3 text-caption1 text-foreground-3", className)} {...props}>
      <span aria-hidden className="h-px flex-1 bg-stroke-2" />
      {dateTime ? <time dateTime={dateTime}>{children}</time> : <span>{children}</span>}
      <span aria-hidden className="h-px flex-1 bg-stroke-2" />
    </div>
  ),
);
MessageDaySeparator.displayName = "MessageDaySeparator";

/* ================================================================ TypingIndicator */

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  author?: string;
  /** Thay avatar mặc định; `null` để ẩn. */
  avatar?: React.ReactNode;
  avatarSrc?: string;
  /** Câu đọc cho trình đọc màn hình. Mặc định "<author> đang soạn tin…". */
  label?: string;
}

const DOT_DELAY = ["", "[animation-delay:var(--durationFast)]", "[animation-delay:var(--durationSlow)]"];

export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ author, avatar, avatarSrc, label, className, ...props }, ref) => {
    const avatarNode = avatar !== undefined ? avatar : author ? <Avatar name={author} src={avatarSrc} size={32} color="colorful" /> : null;
    return (
      <div ref={ref} role="status" className={cn("mt-3 flex w-full items-end gap-2 first:mt-0", className)} {...props}>
        {avatarNode !== null && avatarNode !== false && <div className="w-8 shrink-0">{avatarNode}</div>}
        <div aria-hidden className="flex h-9 items-center gap-1 rounded-xlarge rounded-es-small bg-background-1 px-3 shadow-2">
          {DOT_DELAY.map((delay, i) => (
            <span key={i} className={cn("flex h-3 items-end animate-bounce motion-reduce:animate-none", delay)}>
              <span className={cn("size-1.5 rounded-circular bg-foreground-3", i === 1 && "motion-reduce:opacity-70", i === 2 && "motion-reduce:opacity-40")} />
            </span>
          ))}
        </div>
        <span className="sr-only">{label ?? `${author ?? "Đối phương"} đang soạn tin…`}</span>
      </div>
    );
  },
);
TypingIndicator.displayName = "TypingIndicator";
