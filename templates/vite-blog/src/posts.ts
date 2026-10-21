import { loadPosts, slugify } from "./content";

// Mọi file trong posts/ — thêm bài mới chỉ cần tạo file .md. Bài `draft: true` chỉ hiện khi chạy dev.
const files = import.meta.glob<string>("./posts/*.md", { query: "?raw", import: "default", eager: true });

export const POSTS = loadPosts(files, { includeDrafts: import.meta.env.DEV });

export const POST_BY_SLUG = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

/** Thẻ → số bài, nhiều bài trước. */
export const TAGS = Object.entries(
  POSTS.flatMap((p) => p.tags).reduce<Record<string, number>>((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {}),
)
  .map(([name, count]) => ({ name, slug: slugify(name), count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
