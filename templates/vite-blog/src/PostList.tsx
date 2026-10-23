import * as React from "react";
import { Badge, Empty, EmptyDescription, EmptyTitle, SearchBox } from "yugen-ui";
import type { Post } from "./content";
import { POSTS, TAGS } from "./posts";
import { Link } from "./router";
import { formatDate } from "./format";

export function PostMeta({ post }: { post: Post }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption1 text-foreground-3">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} phút đọc</span>
    </span>
  );
}

export function TagLinks({ tags, current }: { tags: { name: string; slug: string; count?: number }[]; current?: string }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <li key={t.slug}>
          <Link
            to={{ name: "tag", tag: t.slug }}
            aria-current={current === t.slug ? "page" : undefined}
            className="inline-flex items-center gap-1 rounded-circular border border-stroke-2 px-2 py-0.5 text-caption1 text-foreground-2 hover:bg-background-3 aria-[current=page]:border-brand-stroke aria-[current=page]:bg-brand-background-2 aria-[current=page]:text-brand-foreground-2"
          >
            #{t.name}
            {t.count !== undefined && <span className="text-foreground-3 tabular-nums">{t.count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PostCard({ post, headingLevel }: { post: Post; headingLevel: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-5 transition-shadow duration-faster hover:shadow-8">
      <PostMeta post={post} />
      <Heading className="font-display text-title3 font-semibold text-foreground-1">
        {/* Cả thẻ bấm được, link vẫn là phần tử duy nhất nhận focus. */}
        <Link to={{ name: "post", slug: post.slug }} className="after:absolute after:inset-0 after:rounded-xlarge group-hover:text-brand-foreground-1">
          {post.title}
        </Link>
      </Heading>
      <p className="text-body1 text-foreground-2">{post.description}</p>
      {post.draft && (
        <Badge appearance="tint" color="warning" className="self-start">
          Bản nháp
        </Badge>
      )}
      <div className="relative mt-1 flex flex-wrap gap-1">
        {post.tags.map((tag) => (
          <span key={tag} className="text-caption1 text-foreground-3">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

/** Trang chủ (tất cả bài) hoặc trang thẻ: ô tìm kiếm, bộ lọc thẻ, danh sách bài. */
export function PostList({ tag, headingLevel = "h1" }: { tag?: string; headingLevel?: "h1" | "h2" }) {
  const [query, setQuery] = React.useState("");
  const tagName = TAGS.find((t) => t.slug === tag)?.name;
  const q = query.trim().toLowerCase();
  const posts = POSTS.filter((p) => !tag || p.tags.some((t) => TAGS.find((x) => x.name === t)?.slug === tag)).filter(
    (p) => !q || `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q),
  );
  const Heading = headingLevel;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Heading className="font-display text-title1 font-semibold text-foreground-1">{tagName ? `#${tagName}` : "Bài viết mới"}</Heading>
        <p className="text-body2 text-foreground-2">
          {tagName ? `${posts.length} bài gắn thẻ ${tagName}.` : "Thiết kế giao diện, React và Tailwind CSS — mỗi tuần một bài."}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <SearchBox value={query} onValueChange={setQuery} placeholder="Tìm bài viết…" aria-label="Tìm bài viết" className="max-w-md" />
        <TagLinks tags={TAGS} current={tag} />
      </div>
      {posts.length === 0 ? (
        <Empty>
          <EmptyTitle>Không có bài phù hợp</EmptyTitle>
          <EmptyDescription>Thử từ khoá khác hoặc bỏ bộ lọc thẻ.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid gap-4 @3xl:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} headingLevel={headingLevel === "h1" ? "h2" : "h3"} />
          ))}
        </div>
      )}
    </div>
  );
}
