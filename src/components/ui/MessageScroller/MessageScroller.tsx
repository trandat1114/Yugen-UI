/** Yugen Labs · MessageScroller — vùng cuộn hội thoại: bám đáy, nút "tin nhắn mới", tải tin cũ giữ vị trí, live region. */
import * as React from "react";
import { ArrowDown16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import {
  MessageBubble,
  MessageDaySeparator,
  MessageGroupContext,
  TypingIndicator,
  type MessageBubbleProps,
  type MessageGroupPosition,
} from "./MessageBubble";

export * from "./MessageBubble";
export * from "./ChatComposer";

/* ================================================================ Tiện ích */

/** Lấy văn bản thuần từ ReactNode (để đọc qua live region). */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return "";
}

function isMessage(el: React.ReactElement) {
  return el.type !== TypingIndicator && el.type !== MessageDaySeparator;
}

function bubbleProps(el: React.ReactElement): MessageBubbleProps | null {
  return el.type === MessageBubble ? (el.props as MessageBubbleProps) : null;
}

function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Vị trí trong nhóm: các MessageBubble liên tiếp cùng phía + cùng người gửi. */
function groupPositions(items: React.ReactElement[]): (MessageGroupPosition | null)[] {
  const ids = items.map((el) => {
    const p = bubbleProps(el);
    return p ? `${p.side ?? "incoming"}|${p.author ?? ""}` : null;
  });
  return ids.map((id, i) => {
    if (id === null) return null;
    const prev = ids[i - 1] === id;
    const next = ids[i + 1] === id;
    return prev ? (next ? "middle" : "last") : next ? "first" : "single";
  });
}

/* ================================================================ MessageScroller */

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** MessageBubble, MessageDaySeparator, TypingIndicator… — mỗi phần tử cần `key` ổn định. */
  children?: React.ReactNode;
  /** Nhãn của vùng hội thoại. Mặc định "Cuộc trò chuyện". */
  label?: string;
  /** Gọi khi cuộn chạm đầu danh sách; trả Promise để chặn gọi lặp khi đang tải. */
  onLoadOlder?: () => void | Promise<void>;
  /** Còn tin cũ hơn để tải. Mặc định true khi có onLoadOlder. */
  hasOlder?: boolean;
  /** Đang tải tin cũ — hiện spinner ở đầu danh sách. */
  loadingOlder?: boolean;
  /** Khoảng cách (px) tới đáy vẫn coi là "đang ở cuối". Mặc định 48. */
  bottomThreshold?: number;
  /** Đọc tin đến (không phải của mình) qua live region polite. Mặc định true. */
  announceIncoming?: boolean;
  /** Class cho vùng nội dung bên trong (padding, gap…). */
  contentClassName?: string;
}

/** ref trỏ vào phần tử cuộn (viewport). */
export const MessageScroller = React.forwardRef<HTMLDivElement, MessageScrollerProps>(
  (
    {
      children,
      label = "Cuộc trò chuyện",
      onLoadOlder,
      hasOlder,
      loadingOlder = false,
      bottomThreshold = 48,
      announceIncoming = true,
      className,
      contentClassName,
      onScroll,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const atBottomRef = React.useRef(true);
    /** Phần tử đang ở mép trên vùng nhìn + khoảng cách tới mép — dùng để giữ vị trí đọc khi nội dung phía trên đổi. */
    const anchorRef = React.useRef<{ el: Element; top: number } | null>(null);
    /** Đang cuộn mượt xuống đáy bằng code — bỏ qua các vị trí trung gian. */
    const programmaticRef = React.useRef(false);
    const prevKeysRef = React.useRef<string[] | null>(null);
    const streamingKeysRef = React.useRef(new Set<string>());
    const loadingRef = React.useRef(false);
    const [atBottom, setAtBottom] = React.useState(true);
    const [unread, setUnread] = React.useState(0);
    const [liveMessage, setLiveMessage] = React.useState("");

    const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
    const keys = items.map((el) => String(el.key));
    const positions = groupPositions(items);
    const canLoadOlder = !!onLoadOlder && (hasOlder ?? true);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const announce = React.useCallback((text: string) => {
      const clean = text.trim();
      if (!clean) return;
      // Nội dung trùng lần trước sẽ không được đọc lại → thêm khoảng trắng không ngắt để khác chuỗi.
      setLiveMessage((prev) => (prev === clean ? `${clean} ` : clean));
    }, []);

    /** Ghi lại phần tử con đầu tiên còn thấy ở mép trên (tìm nhị phân theo vị trí). */
    const captureAnchor = React.useCallback(() => {
      const vp = viewportRef.current;
      const content = contentRef.current;
      if (!vp || !content) return;
      const list = content.children;
      const top = vp.getBoundingClientRect().top;
      let lo = 0;
      let hi = list.length - 1;
      let found = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid].getBoundingClientRect().bottom > top) {
          found = mid;
          hi = mid - 1;
        } else lo = mid + 1;
      }
      anchorRef.current = found === -1 ? null : { el: list[found], top: list[found].getBoundingClientRect().top - top };
    }, []);

    /** Giữ phần tử neo đứng yên (tự làm vì đã tắt overflow-anchor để hành vi giống nhau trên mọi trình duyệt). */
    const restoreAnchor = React.useCallback(() => {
      const vp = viewportRef.current;
      const anchor = anchorRef.current;
      if (!vp || !anchor || !anchor.el.isConnected) return;
      const delta = anchor.el.getBoundingClientRect().top - vp.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) >= 1) vp.scrollTop += delta;
    }, []);

    const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
      const el = viewportRef.current;
      if (!el) return;
      const smooth = behavior === "smooth" && !prefersReducedMotion();
      programmaticRef.current = smooth;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
      atBottomRef.current = true;
      setAtBottom(true);
      setUnread(0);
    }, []);

    /* ---------- Sau mỗi lần danh sách đổi: giữ vị trí đọc, bám đáy, đếm tin mới, thông báo ---------- */
    React.useLayoutEffect(() => {
      const el = viewportRef.current;
      if (!el) return;
      const prev = prevKeysRef.current;
      prevKeysRef.current = keys;

      if (prev === null) {
        el.scrollTop = el.scrollHeight;
        return;
      }

      // Tin mới = phần tử chưa từng có, nằm sau phần tử cũ cuối cùng còn lại
      // (TypingIndicator có thể vừa bị thay bằng tin trả lời trong cùng lần render).
      const prevSet = new Set(prev);
      let anchorIndex = -1;
      for (let k = prev.length - 1; k >= 0 && anchorIndex === -1; k--) anchorIndex = keys.lastIndexOf(prev[k]);
      const appended =
        prev.length === 0 ? items : anchorIndex >= 0 ? items.slice(anchorIndex + 1).filter((m) => !prevSet.has(String(m.key))) : [];
      const newMessages = appended.filter(isMessage);
      const mine = newMessages.some((m) => (m.props as { side?: string }).side === "outgoing");

      if (mine) scrollToBottom("auto");
      else if (atBottomRef.current) el.scrollTop = el.scrollHeight;
      else {
        // Đang đọc tin cũ: tin cũ chèn lên đầu không được làm xê dịch chỗ đang đọc.
        restoreAnchor();
        if (newMessages.length > 0) setUnread((n) => n + newMessages.length);
      }
      captureAnchor();

      // Thông báo tin đến: tin đang stream chỉ đọc khi đã nhận đủ.
      if (announceIncoming) {
        const lines: string[] = [];
        const describe = (p: MessageBubbleProps) => `${p.author ? `${p.author}: ` : ""}${textOf(p.children)}`;
        newMessages.forEach((m) => {
          const p = bubbleProps(m);
          if (!p || p.side === "outgoing") return;
          if (p.streaming) streamingKeysRef.current.add(String(m.key));
          else lines.push(describe(p));
        });
        streamingKeysRef.current.forEach((key) => {
          const found = items[keys.indexOf(key)];
          const p = found ? bubbleProps(found) : null;
          if (!p) streamingKeysRef.current.delete(key);
          else if (!p.streaming) {
            lines.push(describe(p));
            streamingKeysRef.current.delete(key);
          }
        });
        if (lines.length) announce(lines.join(". "));
      }
      // Chỉ chạy khi danh sách tin đổi (không chạy lại khi state nội bộ đổi, để không cắt ngang cuộn mượt).
    }, [children]);

    /* ---------- Kích thước đổi (chữ stream, ảnh tải xong, composer giãn) → bám đáy, hoặc giữ chỗ đang đọc ---------- */
    React.useEffect(() => {
      const el = viewportRef.current;
      const content = contentRef.current;
      if (!el || !content || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => {
        if (atBottomRef.current) el.scrollTop = el.scrollHeight;
        else restoreAnchor();
        captureAnchor();
      });
      observer.observe(content);
      observer.observe(el);
      return () => observer.disconnect();
    }, [captureAnchor, restoreAnchor]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e);
      const el = e.currentTarget;
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight <= bottomThreshold;
      if (programmaticRef.current) {
        // Đang cuộn mượt xuống đáy: chưa tới thì giữ trạng thái "ở đáy" để nút không nhấp nháy.
        if (!bottom) return;
        programmaticRef.current = false;
      }
      atBottomRef.current = bottom;
      setAtBottom(bottom);
      if (bottom) setUnread(0);
      captureAnchor();

      if (el.scrollTop <= bottomThreshold && canLoadOlder && !loadingOlder && !loadingRef.current) {
        loadingRef.current = true;
        Promise.resolve(onLoadOlder?.()).finally(() => {
          loadingRef.current = false;
        });
      }
    };

    /** Người dùng tự cuộn → huỷ chế độ cuộn bằng code. */
    const releaseProgrammatic = () => {
      programmaticRef.current = false;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      releaseProgrammatic();
      if (e.defaultPrevented || isEditable(e.target)) return;
      if (e.key === "End" && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        scrollToBottom();
      }
    };

    return (
      <div className={cn("relative flex min-h-0 flex-col bg-background-2", className)}>
        <div
          ref={setRefs}
          role="log"
          aria-label={label}
          // Chỉ đọc qua live region riêng bên dưới — tránh đọc từng mẩu chữ khi stream.
          aria-live="off"
          aria-busy={loadingOlder || undefined}
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onWheel={releaseProgrammatic}
          onTouchStart={releaseProgrammatic}
          onPointerDown={releaseProgrammatic}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] focus-visible:-outline-offset-2"
          {...props}
        >
          <div ref={contentRef} className={cn("flex min-h-full flex-col justify-end p-M", contentClassName)}>
            {items.map((el, i) => (
              <MessageGroupContext.Provider key={el.key ?? i} value={positions[i]}>
                {el}
              </MessageGroupContext.Provider>
            ))}
          </div>
        </div>

        {/* Nổi trên danh sách (không chèn vào luồng) để không đẩy nội dung khi đang tải. */}
        {loadingOlder && (
          <div className="pointer-events-none absolute inset-x-0 top-S flex justify-center">
            <span className="flex items-center rounded-circular bg-background-1 px-M py-XS shadow-8 animate-fade-in motion-reduce:animate-none">
              <Spinner size="extra-tiny" label="Đang tải tin nhắn cũ…" />
            </span>
          </div>
        )}

        {!atBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-M flex justify-center">
            <Button
              size="small"
              shape="circular"
              appearance={unread > 0 ? "primary" : "secondary"}
              icon={<ArrowDown16Regular />}
              aria-label={unread > 0 ? undefined : "Tới tin nhắn mới nhất"}
              onClick={() => scrollToBottom()}
              className={cn("pointer-events-auto shadow-8 animate-surface-in motion-reduce:animate-none", unread > 0 && "px-M")}
            >
              {unread > 0 ? `${unread} tin nhắn mới` : undefined}
            </Button>
          </div>
        )}

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveMessage}
        </div>
      </div>
    );
  },
);
MessageScroller.displayName = "MessageScroller";
