/** Yugen Labs · Citation, CitationList — chú thích nguồn đánh số trong câu trả lời AI và danh sách nguồn bên dưới. */
import * as React from "react";
import { cn } from "@/lib/cn";
import { Popover, PopoverSurface, PopoverTrigger } from "../Popover/Popover";
import { useYugenMessages } from "../YugenProvider/context";
import { sanitizeHref } from "./markdown";
import { citationMessages } from "./messages";

export { citationMessages, citationMessagesEn, type CitationMessages } from "./messages";

export interface CitationSource {
  title: string;
  url?: string;
  /** Tên miền hiển thị; mặc định tách từ url. */
  domain?: string;
  /** Đoạn trích liên quan. */
  snippet?: string;
  /** Thông tin phụ: ngày đăng, tác giả… */
  meta?: string;
}

/** Tên miền gọn ("www." bị bỏ). */
export function getSourceDomain(source: CitationSource): string {
  if (source.domain) return source.domain;
  if (!source.url) return "";
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const PALETTE = [
  "bg-cranberry-bg text-cranberry-fg",
  "bg-marigold-bg text-marigold-fg",
  "bg-teal-bg text-teal-fg",
  "bg-lavender-bg text-lavender-fg",
  "bg-forest-bg text-forest-fg",
  "bg-steel-bg text-steel-fg",
] as const;

function hashOf(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Thay favicon (không tải tài nguyên ngoài): chữ cái đầu của tên miền trên nền palette. */
function SourceIcon({ domain, title }: { domain: string; title: string }) {
  const seed = domain || title;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-small text-caption2 font-semibold",
        PALETTE[hashOf(seed) % PALETTE.length],
      )}
    >
      {(seed.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

function NewTab({ label }: { label: string }) {
  return <span className="sr-only"> {label}</span>;
}

/* ================================================================ Citation */

export interface CitationProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Số thứ tự nguồn (bắt đầu từ 1). */
  index: number;
  source: CitationSource;
  /** Chờ bao lâu (ms) sau khi rê chuột mới mở thẻ. Mặc định 250. */
  openDelay?: number;
  /** Chờ bao lâu (ms) sau khi rời chuột mới đóng thẻ. Mặc định 200. */
  closeDelay?: number;
}

/**
 * Chip `[1]` trong dòng chữ. Rê chuột / focus bàn phím: xem nhanh thẻ nguồn (không cướp focus).
 * Bấm / Enter: mở thẻ và đưa focus vào trong để tới được link; Esc đóng và trả focus về chip.
 */
export const Citation = React.forwardRef<HTMLButtonElement, CitationProps>(
  (
    { index, source, openDelay = 250, closeDelay = 200, className, onPointerEnter, onPointerLeave, onFocus, onBlur, onClick, ...props },
    ref,
  ) => {
    const msg = useYugenMessages("citation", citationMessages);
    const id = React.useId();
    const descId = `${id}-desc`;
    const titleId = `${id}-title`;
    const [open, setOpen] = React.useState(false);
    /** peek: mở do rê chuột / focus — không di chuyển focus · pinned: mở do bấm. */
    const modeRef = React.useRef<"peek" | "pinned">("peek");
    const timer = React.useRef<number | undefined>(undefined);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const domain = getSourceDomain(source);
    const href = sanitizeHref(source.url);

    React.useEffect(() => () => window.clearTimeout(timer.current), []);

    const schedule = (next: boolean, delay: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(next), delay);
    };
    const peek = () => {
      if (open && modeRef.current === "pinned") return;
      modeRef.current = "peek";
      schedule(true, openDelay);
    };
    const leave = () => {
      if (modeRef.current === "peek") schedule(false, closeDelay);
    };

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          window.clearTimeout(timer.current);
          if (next) modeRef.current = "pinned";
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-describedby={descId}
            data-citation={index}
            className={cn(
              "relative -top-0.5 mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-small border border-stroke-2 bg-background-4 px-0.5 align-text-top",
              "font-sans text-caption2 font-semibold text-foreground-2 tabular-nums no-underline",
              "transition-colors duration-faster ease-easy-ease hover:bg-brand-background-2 hover:text-brand-foreground-2",
              "data-[state=open]:border-brand-stroke data-[state=open]:bg-brand-background-2 data-[state=open]:text-brand-foreground-2",
              className,
            )}
            onPointerEnter={(e) => {
              onPointerEnter?.(e);
              if (e.pointerType === "mouse") peek();
            }}
            onPointerLeave={(e) => {
              onPointerLeave?.(e);
              if (e.pointerType === "mouse") leave();
            }}
            onFocus={(e) => {
              onFocus?.(e);
              if (e.currentTarget.matches(":focus-visible")) peek();
            }}
            onBlur={(e) => {
              onBlur?.(e);
              if (!contentRef.current?.contains(e.relatedTarget as Node | null)) leave();
            }}
            onClick={(e) => {
              onClick?.(e);
              if (open && modeRef.current === "peek") {
                // Đang xem nhanh → ghim lại và đưa focus vào thẻ (Radix sẽ không tự đóng).
                e.preventDefault();
                window.clearTimeout(timer.current);
                modeRef.current = "pinned";
                contentRef.current?.querySelector<HTMLElement>("a[href]")?.focus() ?? contentRef.current?.focus();
              }
            }}
            {...props}
          >
            <span className="sr-only">{msg.source} </span>
            {index}
            <span id={descId} className="sr-only">
              {`: ${source.title}${domain ? ` — ${domain}` : ""}`}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverSurface
          ref={contentRef}
          side="top"
          size="small"
          tabIndex={-1}
          aria-labelledby={titleId}
          className="flex w-72 flex-col gap-1 p-3"
          onOpenAutoFocus={(e) => {
            if (modeRef.current === "peek") e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            if (modeRef.current === "peek") e.preventDefault();
          }}
          onPointerEnter={() => window.clearTimeout(timer.current)}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") leave();
          }}
        >
          <div className="flex min-w-0 items-center gap-1 text-caption1 text-foreground-3">
            <SourceIcon domain={domain} title={source.title} />
            <span className="min-w-0 flex-1 truncate">{domain || msg.source}</span>
            <span aria-hidden className="tabular-nums">
              [{index}]
            </span>
          </div>
          <p id={titleId} className="line-clamp-2 text-body1 font-semibold text-foreground-1">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-small text-foreground-1 hover:text-link-hover hover:underline"
              >
                {source.title}
                <NewTab label={msg.newTab} />
              </a>
            ) : (
              source.title
            )}
          </p>
          {source.snippet && <p className="line-clamp-3 text-caption1 text-foreground-2">{source.snippet}</p>}
          {source.meta && <p className="text-caption2 text-foreground-3">{source.meta}</p>}
        </PopoverSurface>
      </Popover>
    );
  },
);
Citation.displayName = "Citation";

/* ================================================================ CitationList */

export interface CitationListProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  sources: CitationSource[];
  /** Tiêu đề danh sách. Mặc định lấy từ `messages.citation.sources` ("Nguồn"). */
  title?: React.ReactNode;
}

/** Danh sách nguồn dưới câu trả lời: số thứ tự khớp với chip Citation trong bài. */
export const CitationList = React.forwardRef<HTMLElement, CitationListProps>(({ sources, title, className, ...props }, ref) => {
  const msg = useYugenMessages("citation", citationMessages);
  const headingId = React.useId();
  if (sources.length === 0) return null;
  return (
    <section ref={ref} aria-labelledby={headingId} className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
      <p id={headingId} className="text-caption1 font-semibold text-foreground-3">
        {title ?? msg.sources} <span className="tabular-nums">({sources.length})</span>
      </p>
      <ol className="grid gap-2 sm:grid-cols-2">
        {sources.map((source, i) => {
          const domain = getSourceDomain(source);
          const href = sanitizeHref(source.url);
          const inner = (
            <>
              <span className="flex min-w-0 items-center gap-1 text-caption1 text-foreground-3">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-small bg-background-4 px-0.5 text-caption2 font-semibold text-foreground-2 tabular-nums">
                  {i + 1}
                </span>
                <SourceIcon domain={domain} title={source.title} />
                <span className="min-w-0 truncate">{domain}</span>
              </span>
              <span className="line-clamp-2 text-caption1 font-semibold text-foreground-1">{source.title}</span>
            </>
          );
          const box = "flex h-full min-w-0 flex-col gap-0.5 rounded-medium border border-stroke-2 bg-background-1 p-2";
          return (
            <li key={`${i}-${source.title}`} className="min-w-0">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(box, "transition-colors duration-faster ease-easy-ease hover:border-stroke-1-hover hover:bg-background-1-hover")}
                >
                  {inner}
                  <NewTab label={msg.newTab} />
                </a>
              ) : (
                <div className={box}>{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
});
CitationList.displayName = "CitationList";
