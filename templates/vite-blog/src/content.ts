/**
 * Đọc bài viết Markdown: frontmatter → metadata, thời gian đọc, sắp xếp mới nhất trước.
 * Thuần TypeScript (không dùng API trình duyệt) để plugin SEO trong vite.config.ts dùng lại lúc build.
 */
import { SITE } from "./site";

export interface Post {
  /** Tên file không đuôi .md — dùng trong URL /posts/<slug>/. */
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  tags: string[];
  author?: string;
  draft: boolean;
  /** Nội dung Markdown sau frontmatter. */
  body: string;
  readingMinutes: number;
}

type Frontmatter = Record<string, string | string[] | boolean>;

const unquote = (s: string) => s.replace(/^(["'])(.*)\1$/, "$2");

/**
 * Frontmatter dạng đơn giản giữa hai dòng `---`:
 *   title: Tiêu đề
 *   tags: [react, tailwind]
 *   draft: true
 */
export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const data: Frontmatter = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[kv[1]] = value
        .slice(1, -1)
        .split(",")
        .map((s) => unquote(s.trim()))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[kv[1]] = value === "true";
    } else {
      data[kv[1]] = unquote(value);
    }
  }
  return { data, body: text.slice(m[0].length) };
}

/** ~200 từ / phút, tối thiểu 1 phút. Bỏ khối code khi đếm. */
export function readingMinutes(markdown: string) {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** `files`: đường dẫn → nội dung thô (từ import.meta.glob hoặc fs). */
export function loadPosts(files: Record<string, string>, { includeDrafts = false } = {}): Post[] {
  return Object.entries(files)
    .map(([file, raw]) => {
      const slug = file.replace(/^.*[\\/]/, "").replace(/\.md$/, "");
      const { data, body } = parseFrontmatter(raw);
      const str = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
      if (!str("title") || !/^\d{4}-\d{2}-\d{2}$/.test(str("date"))) {
        throw new Error(`${file}: frontmatter cần "title" và "date" dạng YYYY-MM-DD`);
      }
      return {
        slug,
        title: str("title"),
        description: str("description"),
        date: str("date"),
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: str("author") || undefined,
        draft: data.draft === true,
        body,
        readingMinutes: readingMinutes(body),
      };
    })
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export type PageKind = { kind: "home" } | { kind: "post"; post: Post } | { kind: "tag"; tag: string } | { kind: "notFound" };

/** Tiêu đề & mô tả của một trang — app ghi vào <head> khi chuyển trang, plugin SEO dùng khi sinh HTML tĩnh. */
export function pageMeta(page: PageKind): { title: string; description: string } {
  if (page.kind === "post") return { title: `${page.post.title} · ${SITE.title}`, description: page.post.description || SITE.description };
  if (page.kind === "tag") return { title: `#${page.tag} · ${SITE.title}`, description: `Các bài viết gắn thẻ ${page.tag} trên ${SITE.title}.` };
  if (page.kind === "notFound") return { title: `Không tìm thấy trang · ${SITE.title}`, description: SITE.description };
  return { title: SITE.title, description: SITE.description };
}

/** "Tailwind CSS" → "tailwind-css" — dùng cho URL thẻ và id heading. */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
