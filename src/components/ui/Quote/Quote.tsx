import * as React from "react";
import { TextQuoteOpening24Filled } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

export type QuoteAppearance = "default" | "subtle" | "emphasis";
export type QuoteSize = "small" | "medium" | "large";

export interface QuoteProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Nội dung trích dẫn. Chuỗi được bọc trong <p>; truyền nhiều <p> cho trích dẫn nhiều đoạn. */
  children: React.ReactNode;
  /** Người nói / tác giả. */
  author?: React.ReactNode;
  /** Chức danh, tổ chức của tác giả. */
  authorTitle?: React.ReactNode;
  /** Tên nguồn (sách, bài viết, cuộc phỏng vấn) — hiển thị trong <cite>. */
  source?: React.ReactNode;
  /** URL nguồn: gắn vào `cite` của <blockquote> và biến `source` thành link. */
  cite?: string;
  /** Avatar của tác giả (thường là <Avatar size={32} />). */
  avatar?: React.ReactNode;
  /**
   * default: vạch brand ở đầu dòng · subtle: vạch neutral, chữ phụ — trích dẫn trong thân bài ·
   * emphasis: chữ lớn kèm dấu ngoặc — testimonial, hero.
   */
  appearance?: QuoteAppearance;
  size?: QuoteSize;
}

const TEXT: Record<QuoteSize, string> = {
  small: "text-body1",
  medium: "text-body2",
  large: "text-subtitle1",
};

/**
 * Quote — trích dẫn có ghi nguồn. Ngữ nghĩa: <figure> › <blockquote cite> + <figcaption> (tác giả, <cite> nguồn),
 * nên trình đọc màn hình đọc đúng "trích dẫn" và ai nói. Vạch nhấn dùng border-s → tự đổi bên khi RTL.
 */
export const Quote = React.forwardRef<HTMLElement, QuoteProps>(
  (
    { children, author, authorTitle, source, cite, avatar, appearance = "default", size = "medium", className, ...props },
    ref,
  ) => {
    const emphasis = appearance === "emphasis";
    const body = typeof children === "string" ? <p>{children}</p> : children;
    const sourceNode =
      source && cite ? (
        <a href={cite} target="_blank" rel="noreferrer" className="text-link underline-offset-2 hover:text-link-hover hover:underline">
          {source}
        </a>
      ) : (
        source
      );
    const hasCaption = Boolean(author || source);

    return (
      <figure
        ref={ref}
        className={cn(
          "m-0 flex flex-col gap-M",
          !emphasis && "border-s-3 ps-L",
          appearance === "default" && "border-brand-stroke",
          appearance === "subtle" && "border-stroke-1",
          emphasis && "relative rounded-xlarge bg-background-2 p-XL",
          className,
        )}
        {...props}
      >
        {emphasis && <TextQuoteOpening24Filled aria-hidden className="size-8 text-brand-foreground-1 rtl:-scale-x-100" />}
        <blockquote
          cite={cite}
          className={cn(
            "m-0 flex flex-col gap-S",
            emphasis ? (size === "small" ? "text-subtitle2" : size === "large" ? "text-title2" : "text-subtitle1") : TEXT[size],
            emphasis ? "font-display font-semibold text-foreground-1" : appearance === "subtle" ? "text-foreground-2" : "text-foreground-1",
          )}
        >
          {body}
        </blockquote>
        {hasCaption && (
          <figcaption className="flex items-center gap-S text-caption1 text-foreground-3">
            {avatar}
            <span className="flex flex-col">
              {author && (
                <span className="text-body1 font-semibold text-foreground-1">
                  {!avatar && <span aria-hidden>— </span>}
                  {author}
                </span>
              )}
              {(authorTitle || source) && (
                <span>
                  {authorTitle}
                  {authorTitle && source && " · "}
                  {source && <cite className="not-italic">{sourceNode}</cite>}
                </span>
              )}
            </span>
          </figcaption>
        )}
      </figure>
    );
  },
);
Quote.displayName = "Quote";
