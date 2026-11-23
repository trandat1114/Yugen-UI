/**
 * Article — khung cho bài viết dài từ Markdown: Article (bố cục, mục lục bên cạnh), ArticleHeader (tiêu đề, tóm tắt,
 * ảnh bìa), ArticleMeta (tác giả, ngày, thời gian đọc, thẻ), ArticleBody (độ rộng đọc) và ArticleToc (mục lục theo id
 * heading). Mỗi phần là một component riêng, tree-shake được; SEO / JSON-LD là của app (`articleJsonLd` chỉ dựng object).
 */
import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { articleMessagesEn } from "./messages";

export { articleMessagesVi, articleMessagesEn, type ArticleMessages } from "./messages";

export interface ArticleProps extends React.HTMLAttributes<HTMLElement> {
  /** Mục lục (ArticleToc): cột bên cạnh, dính khi cuộn từ màn hình lg; trên màn hình hẹp nằm trước nội dung. */
  toc?: React.ReactNode;
}

export function Article({ toc, className, children, ref, ...props }: ArticleProps & { ref?: React.Ref<HTMLElement> }) {
  return (
    <article
      ref={ref}
      className={cn(
        "min-w-0 text-foreground-1",
        toc && "grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_14rem]",
        className,
      )}
      {...props}
    >
      {toc ? (
        <>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">{children}</div>
          <aside className="min-w-0 lg:col-start-2 lg:row-start-1">
            <div className="lg:sticky lg:top-4">{toc}</div>
          </aside>
        </>
      ) : (
        children
      )}
    </article>
  );
}

export interface ArticleHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Cấp heading của tiêu đề; trang đã có h1 khác thì dùng h2. */
  titleAs?: "h1" | "h2" | "h3";
  /** Câu tóm tắt dưới tiêu đề. */
  excerpt?: React.ReactNode;
  /** Breadcrumb hoặc chuyên mục, phía trên tiêu đề. */
  eyebrow?: React.ReactNode;
  /** ArticleMeta. */
  meta?: React.ReactNode;
  /** Ảnh bìa: khung 16:9 giữ chỗ trước khi ảnh tải xong (không xô lệch bố cục). */
  cover?: React.ReactNode;
}

export function ArticleHeader({
  title,
  titleAs: Title = "h1",
  excerpt,
  eyebrow,
  meta,
  cover,
  className,
  ref,
  ...props
}: ArticleHeaderProps & { ref?: React.Ref<HTMLElement> }) {
  return (
    <header ref={ref} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      {eyebrow && <div className="min-w-0 text-caption1 text-foreground-3">{eyebrow}</div>}
      <Title className="m-0 wrap-break-word font-display text-title1 font-semibold text-balance text-foreground-1">{title}</Title>
      {excerpt && <p className="m-0 wrap-break-word text-body2 text-foreground-2">{excerpt}</p>}
      {meta}
      {cover && (
        <div className="mt-2 aspect-video w-full overflow-hidden rounded-xlarge bg-background-3 [&_img]:size-full [&_img]:object-cover">{cover}</div>
      )}
    </header>
  );
}

export interface ArticleAuthor {
  name: string;
  avatar?: React.ReactNode;
  href?: string;
}

export interface ArticleMetaProps extends React.HTMLAttributes<HTMLDivElement> {
  author?: ArticleAuthor;
  /** Ngày đăng (Date, timestamp hoặc chuỗi ISO 8601). */
  published?: Date | number | string;
  /** Ngày cập nhật; chỉ hiện khi khác ngày đăng. */
  updated?: Date | number | string;
  /** Số phút đọc (xem `readingTime`). */
  readingTime?: number;
  tags?: readonly string[];
  /** Thay cách hiện một thẻ (link tới trang thẻ của app). */
  renderTag?: (tag: string) => React.ReactNode;
  locale?: string;
}

const toDate = (value: Date | number | string | undefined) => {
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export function ArticleMeta({
  author,
  published,
  updated,
  readingTime: minutes,
  tags,
  renderTag,
  locale: localeProp,
  className,
  ref,
  ...props
}: ArticleMetaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("article", articleMessagesEn);
  const yugenLocale = useYugenLocale();
  const locale = localeProp ?? yugenLocale;
  const dateFormat = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }), [locale]);
  const publishedDate = toDate(published);
  const updatedDate = toDate(updated);
  const showUpdated = updatedDate && (!publishedDate || dateFormat.format(updatedDate) !== dateFormat.format(publishedDate));
  const parts: React.ReactNode[] = [];
  if (publishedDate) parts.push(<time key="p" dateTime={publishedDate.toISOString()}>{dateFormat.format(publishedDate)}</time>);
  if (showUpdated)
    parts.push(
      <span key="u">
        {msg.updated} <time dateTime={updatedDate.toISOString()}>{dateFormat.format(updatedDate)}</time>
      </span>,
    );
  if (minutes !== undefined && minutes > 0) {
    const rounded = Math.ceil(minutes);
    parts.push(<span key="r">{msg.readingTime(rounded, new Intl.NumberFormat(locale).format(rounded))}</span>);
  }

  return (
    <div ref={ref} className={cn("flex min-w-0 flex-col gap-2 text-caption1 text-foreground-2", className)} {...props}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        {author && (
          <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground-1">
            {author.avatar}
            {author.href ? (
              <a href={author.href} rel="author" className="truncate text-inherit underline-offset-2 hover:underline">
                {author.name}
              </a>
            ) : (
              <span className="truncate">{author.name}</span>
            )}
          </span>
        )}
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-x-3">
            {(i > 0 || author) && <span aria-hidden className="text-foreground-4">·</span>}
            {part}
          </span>
        ))}
      </div>
      {tags && tags.length > 0 && (
        <ul aria-label={msg.tags} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {tags.map((tag) => (
            <li key={tag} className="min-w-0">
              {renderTag ? renderTag(tag) : <span className="inline-flex rounded-circular bg-background-3 px-2 py-0.5 text-caption1 text-foreground-2">{tag}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface ArticleBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Độ rộng đọc: reading ≈ 70 ký tự / dòng · wide cho bảng, code dài · full theo khung chứa. */
  width?: "reading" | "wide" | "full";
}

const BODY_WIDTH = { reading: "max-w-[70ch]", wide: "max-w-[90ch]", full: "max-w-none" } as const;

export function ArticleBody({ width = "reading", className, ref, ...props }: ArticleBodyProps & { ref?: React.Ref<HTMLDivElement> }) {
  // overflow-x-auto cho bảng / code rộng hơn màn hình nhỏ: cuộn trong khung, trang không tràn ngang.
  return <div ref={ref} className={cn("min-w-0 [&_pre]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto", BODY_WIDTH[width], className)} {...props} />;
}

export interface ArticleTocItem {
  id: string;
  text: string;
  /** Cấp heading (2 = h2). Mục cấp sâu hơn cấp nhỏ nhất được thụt vào. */
  level: number;
}

export interface ArticleTocProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Các heading, vd. `markdownHeadings(markdown)` với `<Markdown headingIds>`. Rỗng: không render gì. */
  items: readonly ArticleTocItem[];
  /** Chỉ lấy heading tới cấp này (mặc định 3). */
  maxLevel?: number;
  title?: React.ReactNode;
  /** Theo dõi mục đang đọc (một IntersectionObserver cho mọi heading) và đánh dấu `aria-current`. Mặc định true. */
  trackActive?: boolean;
  /** Khoảng trên cùng bị header dính che (px): heading tính là đang đọc khi đi qua vạch này. */
  offset?: number;
}

export function ArticleToc({
  items,
  maxLevel = 3,
  title,
  trackActive = true,
  offset = 0,
  className,
  ref,
  ...props
}: ArticleTocProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("article", articleMessagesEn);
  const visible = React.useMemo(() => items.filter((item) => item.level <= maxLevel), [items, maxLevel]);
  const minLevel = visible.reduce((m, item) => Math.min(m, item.level), 6);
  const [active, setActive] = React.useState<string | null>(null);
  const idsKey = visible.map((item) => item.id).join("\u0000");
  const titleId = React.useId();

  React.useEffect(() => {
    if (!trackActive || typeof IntersectionObserver === "undefined") return;
    const ids = idsKey ? idsKey.split("\u0000") : [];
    const nodes = ids.map((id) => document.getElementById(id)).filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;
    // Heading nằm phía trên vạch `offset` của viewport: mục cuối cùng trong số đó là mục đang đọc.
    const above = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.boundingClientRect.top < offset + 1) above.add(entry.target.id);
          else above.delete(entry.target.id);
        }
        const current = [...ids].reverse().find((id) => above.has(id)) ?? ids[0];
        setActive((prev) => (prev === current ? prev : current));
      },
      { rootMargin: `${-offset}px 0px 0px 0px`, threshold: [0, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [idsKey, trackActive, offset]);

  if (visible.length === 0) return null;
  return (
    <nav ref={ref} aria-labelledby={titleId} className={cn("min-w-0 text-caption1", className)} {...props}>
      <p id={titleId} className="m-0 mb-2 font-semibold text-foreground-1">
        {title ?? msg.toc}
      </p>
      <ol className="m-0 flex list-none flex-col gap-0.5 border-s border-stroke-2 p-0">
        {visible.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id} style={{ paddingInlineStart: `${(item.level - minLevel) * 0.75}rem` }}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "-ms-px block border-s-2 border-transparent py-1 ps-3 wrap-break-word text-foreground-2 no-underline",
                  "hover:text-foreground-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stroke-focus",
                  current && "border-brand-stroke font-semibold text-brand-foreground-1 forced-colors:border-[Highlight]",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Số phút đọc của một đoạn chữ (Markdown hoặc text), mặc định 220 từ / phút; tối thiểu 1. */
export function readingTime(text: string, wordsPerMinute = 220): number {
  const words = text.replace(/```[\s\S]*?```/g, " ").match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / Math.max(1, wordsPerMinute)));
}

export interface ArticleJsonLdInput {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  author?: string | { name: string; url?: string };
  published?: Date | number | string;
  updated?: Date | number | string;
  tags?: readonly string[];
}

/**
 * Object schema.org `Article` cho thẻ `<script type="application/ld+json">` của app (app tự render và tự thoát chuỗi khi
 * đưa vào HTML). Bỏ các trường không có.
 */
export function articleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const iso = (value: ArticleJsonLdInput["published"]) => toDate(value)?.toISOString();
  const author = typeof input.author === "string" ? { "@type": "Person", name: input.author } : input.author ? { "@type": "Person", ...input.author } : undefined;
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    image: input.image,
    author,
    datePublished: iso(input.published),
    dateModified: iso(input.updated),
    keywords: input.tags && input.tags.length > 0 ? input.tags.join(", ") : undefined,
  };
  for (const key of Object.keys(out)) if (out[key] === undefined) delete out[key];
  return out;
}
