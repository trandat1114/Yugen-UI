/**
 * Blog — các mảnh cho danh sách bài viết từ Markdown: BlogCard (card dạng link), BlogList (lưới / danh sách, đang tải,
 * trống, xem thêm), BlogTagFilter (lọc theo thẻ) và filterPosts (tìm không dấu theo tiêu đề, tóm tắt, thẻ). Không gắn với
 * router hay bộ xử lý Markdown nào; trạng thái lọc và URL là của app.
 */
import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { blogMessagesEn } from "./messages";

export { blogMessagesVi, blogMessagesEn, type BlogMessages } from "./messages";

export interface BlogPost {
  /** Khoá duy nhất (slug). */
  id: string;
  title: string;
  href: string;
  excerpt?: string;
  /** Ảnh bìa: `{ src, alt }` (khung 16:9 giữ chỗ) hoặc một phần tử của bạn (component ảnh của framework). */
  cover?: { src: string; alt: string } | React.ReactNode;
  author?: { name: string; avatar?: React.ReactNode };
  published?: Date | number | string;
  /** Số phút đọc. */
  readingTime?: number;
  tags?: readonly string[];
}

/* ------------------------------------------------------------------ filterPosts */

/** Chữ thường, bỏ dấu (đ → d): "Thiết kế" khớp "thiet ke". */
export function foldText(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/[đĐ]/g, "d").toLowerCase();
}

export interface FilterPostsOptions {
  /** Tìm trong tiêu đề, tóm tắt và thẻ, không phân biệt dấu và hoa thường; mọi từ đều phải có. */
  query?: string;
  /** Chỉ giữ bài có thẻ trong danh sách. */
  tags?: readonly string[];
  /** any: có ít nhất một thẻ (mặc định) · all: có đủ mọi thẻ. */
  match?: "any" | "all";
}

export function filterPosts<T extends BlogPost>(posts: readonly T[], { query = "", tags = [], match = "any" }: FilterPostsOptions = {}): T[] {
  const words = foldText(query).split(/\s+/).filter(Boolean);
  const wanted = tags.map(foldText);
  return posts.filter((post) => {
    const postTags = (post.tags ?? []).map(foldText);
    if (wanted.length > 0) {
      const hit = match === "all" ? wanted.every((t) => postTags.includes(t)) : wanted.some((t) => postTags.includes(t));
      if (!hit) return false;
    }
    if (words.length === 0) return true;
    const haystack = foldText([post.title, post.excerpt ?? "", ...(post.tags ?? [])].join(" "));
    return words.every((w) => haystack.includes(w));
  });
}

/* ------------------------------------------------------------------ BlogCard */

const toDate = (value: BlogPost["published"]) => {
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const isImage = (cover: BlogPost["cover"]): cover is { src: string; alt: string } =>
  typeof cover === "object" && cover !== null && !React.isValidElement(cover) && "src" in cover;

export interface BlogCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  post: BlogPost;
  /** Cấp heading của tiêu đề (theo heading của trang chứa danh sách). */
  headingLevel?: "h2" | "h3" | "h4";
  /** vertical: ảnh trên chữ · horizontal: ảnh bên cạnh từ màn hình sm. */
  layout?: "vertical" | "horizontal";
  /** Bài nổi bật: nhãn chữ và tiêu đề lớn hơn. */
  featured?: boolean;
  /** Tự render link của tiêu đề (router của app); giữ `className` để vùng bấm phủ cả card. */
  renderLink?: (link: { href: string; children: React.ReactNode; className: string }) => React.ReactNode;
  locale?: string;
}

const LINK_CLASS = "text-inherit no-underline outline-none after:absolute after:inset-0 after:content-['']";

export function BlogCard({
  post,
  headingLevel: Heading = "h3",
  layout = "vertical",
  featured = false,
  renderLink,
  locale: localeProp,
  className,
  ref,
  ...props
}: BlogCardProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("blog", blogMessagesEn);
  const yugenLocale = useYugenLocale();
  const locale = localeProp ?? yugenLocale;
  const dateFormat = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }), [locale]);
  const date = toDate(post.published);
  const dateText = date ? dateFormat.format(date) : undefined;
  const horizontal = layout === "horizontal";
  const descriptionId = React.useId();
  const title = renderLink ? (
    renderLink({ href: post.href, children: post.title, className: LINK_CLASS })
  ) : (
    <a data-blog-link="" href={post.href} aria-describedby={post.excerpt ? descriptionId : undefined} className={LINK_CLASS}>
      {post.title}
    </a>
  );

  return (
    <article
      ref={ref}
      data-featured={featured || undefined}
      className={cn(
        "group relative flex min-w-0 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 text-foreground-1",
        "transition-[border-color,box-shadow] duration-faster hover:border-stroke-1-hover hover:shadow-4 motion-reduce:transition-none",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-stroke-focus forced-colors:has-[a:focus-visible]:outline-[Highlight]",
        horizontal ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      {post.cover !== undefined && post.cover !== null && (
        <div
          className={cn(
            "shrink-0 overflow-hidden bg-background-3 [&_img]:size-full [&_img]:object-cover",
            horizontal ? "aspect-video sm:aspect-auto sm:w-2/5" : "aspect-video",
          )}
        >
          {isImage(post.cover) ? <img src={post.cover.src} alt={post.cover.alt} loading="lazy" decoding="async" /> : post.cover}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        {featured && <span className="text-caption1 font-semibold text-brand-foreground-1">{msg.featured}</span>}
        <Heading className={cn("m-0 wrap-break-word font-display font-semibold text-balance", featured ? "text-title2" : "text-subtitle1")}>{title}</Heading>
        {post.excerpt && (
          <p id={descriptionId} className="m-0 line-clamp-3 wrap-break-word text-body1 text-foreground-2">
            {post.excerpt}
          </p>
        )}
        {(post.author || dateText || post.readingTime) && (
          <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-caption1 text-foreground-3">
            {post.author && (
              <span className="flex min-w-0 items-center gap-1.5 text-foreground-2">
                {post.author.avatar}
                <span className="truncate">{post.author.name}</span>
              </span>
            )}
            {date && dateText && <time dateTime={date.toISOString()}>{dateText}</time>}
            {post.readingTime !== undefined && post.readingTime > 0 && (
              <span>{msg.readingTime(Math.ceil(post.readingTime), new Intl.NumberFormat(locale).format(Math.ceil(post.readingTime)))}</span>
            )}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-circular bg-background-3 px-2 py-0.5 text-caption1 text-foreground-2">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ BlogList */

export interface BlogListProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  posts: readonly BlogPost[];
  /** grid: lưới card · list: card ngang, một cột. */
  layout?: "grid" | "list";
  /** Đang tải lần đầu: card giữ chỗ cùng kích thước (không xô lệch), aria-busy. */
  loading?: boolean;
  /** Số card giữ chỗ khi đang tải. */
  loadingCount?: number;
  /** Nội dung khi không có bài (mặc định `messages.blog.empty`). */
  empty?: React.ReactNode;
  /** Có thêm bài để tải: hiện nút Xem thêm gọi `onLoadMore`. */
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** Đang tải thêm: nút ở trạng thái loading. */
  loadingMore?: boolean;
  /** Bài nổi bật (id): card đầu, rộng hai cột trong lưới. */
  featuredId?: string;
  headingLevel?: BlogCardProps["headingLevel"];
  /** Thay card (vẫn nhận post). */
  renderCard?: (post: BlogPost) => React.ReactNode;
  renderLink?: BlogCardProps["renderLink"];
  locale?: string;
}

export function BlogList({
  posts,
  layout = "grid",
  loading = false,
  loadingCount = 3,
  empty,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  featuredId,
  headingLevel,
  renderCard,
  renderLink,
  locale,
  className,
  ref,
  ...props
}: BlogListProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("blog", blogMessagesEn);
  const grid = layout === "grid";
  const ordered = React.useMemo(() => {
    if (!featuredId) return posts;
    const featured = posts.find((p) => p.id === featuredId);
    return featured ? [featured, ...posts.filter((p) => p !== featured)] : posts;
  }, [posts, featuredId]);
  const listClass = cn("m-0 grid list-none gap-4 p-0", grid ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1");

  return (
    <section ref={ref} aria-busy={loading || loadingMore || undefined} className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
      {loading && posts.length === 0 ? (
        <ul aria-label={msg.loading} className={listClass}>
          {Array.from({ length: loadingCount }, (_, i) => (
            <li key={i} aria-hidden className="flex flex-col overflow-hidden rounded-xlarge border border-stroke-2">
              <div className="aspect-video animate-pulse bg-background-3 motion-reduce:animate-none" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded-medium bg-background-3 motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded-medium bg-background-3 motion-reduce:animate-none" />
                <div className="h-4 w-1/2 animate-pulse rounded-medium bg-background-3 motion-reduce:animate-none" />
              </div>
            </li>
          ))}
        </ul>
      ) : ordered.length === 0 ? (
        <p role="status" className="m-0 rounded-xlarge border border-dashed border-stroke-2 px-4 py-10 text-center text-body1 text-foreground-3">
          {empty ?? msg.empty}
        </p>
      ) : (
        <ul className={listClass}>
          {ordered.map((post) => {
            const featured = post.id === featuredId;
            return (
              <li key={post.id} className={cn("flex min-w-0", grid && featured && "sm:col-span-2")}>
                {renderCard ? (
                  renderCard(post)
                ) : (
                  <BlogCard
                    post={post}
                    featured={featured}
                    layout={grid ? (featured ? "horizontal" : "vertical") : "horizontal"}
                    headingLevel={headingLevel}
                    renderLink={renderLink}
                    locale={locale}
                    className="w-full"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {hasMore && (
        <Button className="self-center" loading={loadingMore} onClick={onLoadMore}>
          {msg.loadMore}
        </Button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ BlogTagFilter */

export interface BlogTagFilterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Thẻ để chọn, kèm số bài nếu muốn. */
  tags: readonly (string | { tag: string; count?: number })[];
  /** Thẻ đang chọn (controlled). */
  selected: readonly string[];
  onSelectedChange: (selected: string[]) => void;
  /** Chỉ chọn một thẻ mỗi lần. Mặc định cho chọn nhiều. */
  single?: boolean;
}

/** Nhóm nút bật-tắt (aria-pressed): "Tất cả" bỏ lọc. Trạng thái lọc và URL do app giữ. */
export function BlogTagFilter({ tags, selected, onSelectedChange, single = false, className, ref, ...props }: BlogTagFilterProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("blog", blogMessagesEn);
  const items = tags.map((t) => (typeof t === "string" ? { tag: t } : t));
  const chip = (pressed: boolean) =>
    cn(
      "inline-flex min-h-8 items-center gap-1 rounded-circular border px-3 text-caption1 font-semibold transition-colors duration-faster motion-reduce:transition-none",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus",
      pressed
        ? "border-transparent bg-brand-background text-foreground-on-brand forced-colors:border-[Highlight]"
        : "border-stroke-1 bg-background-1 text-foreground-1 hover:bg-background-1-hover",
    );
  const toggle = (tag: string) => {
    const on = selected.includes(tag);
    onSelectedChange(on ? selected.filter((t) => t !== tag) : single ? [tag] : [...selected, tag]);
  };
  return (
    <div ref={ref} role="group" aria-label={props["aria-labelledby"] ? undefined : msg.tagFilter} className={cn("flex flex-wrap gap-2", className)} {...props}>
      <button type="button" aria-pressed={selected.length === 0} className={chip(selected.length === 0)} onClick={() => onSelectedChange([])}>
        {msg.allTags}
      </button>
      {items.map(({ tag, count }) => {
        const pressed = selected.includes(tag);
        return (
          <button key={tag} type="button" aria-pressed={pressed} className={chip(pressed)} onClick={() => toggle(tag)}>
            {tag}
            {count !== undefined && (
              <>
                {" "}
                <span className="font-normal tabular-nums opacity-80">{count}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
