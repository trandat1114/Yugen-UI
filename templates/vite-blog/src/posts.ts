import { createContext, useContext } from "react";
import { loadPosts, slugify, type Post } from "./blog";
import type { Content } from "./content/types";

// Mọi file trong content/<lang>/posts/ — thêm bài mới chỉ cần tạo file .md. Bài `draft: true` chỉ hiện khi chạy dev.
// App tạo bằng `create --lang` chỉ còn thư mục của một ngôn ngữ.
const files = import.meta.glob<string>("./content/*/posts/*.md", { query: "?raw", import: "default", eager: true });

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

export interface BlogData {
  posts: Post[];
  bySlug: Record<string, Post>;
  /** Thẻ → số bài, nhiều bài trước. */
  tags: Tag[];
}

const cache = new Map<string, BlogData>();

/** Bài viết của một ngôn ngữ (content/<lang>/posts). */
export function postsFor(lang: string): BlogData {
  let data = cache.get(lang);
  if (!data) {
    const prefix = `./content/${lang}/posts/`;
    const posts = loadPosts(Object.fromEntries(Object.entries(files).filter(([file]) => file.startsWith(prefix))), {
      includeDrafts: import.meta.env.DEV,
    });
    const tags = Object.entries(posts.flatMap((p) => p.tags).reduce<Record<string, number>>((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {}))
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    data = { posts, bySlug: Object.fromEntries(posts.map((p) => [p.slug, p])), tags };
    cache.set(lang, data);
  }
  return data;
}

export interface Blog extends BlogData {
  t: Content;
}

/** Chữ và bài viết của ngôn ngữ đang dùng — BlogLayout cung cấp. */
export const BlogContext = createContext<Blog | null>(null);

export function useBlog() {
  const value = useContext(BlogContext);
  if (!value) throw new Error("useBlog() must be used inside <BlogLayout>");
  return value;
}
