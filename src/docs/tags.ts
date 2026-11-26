/**
 * Thẻ chủ đề của trang component (#445): id chuẩn không theo ngôn ngữ, nhãn tiếng Việt / tiếng Anh và từ đồng nghĩa.
 * Gõ một id, nhãn hay từ đồng nghĩa ở ô tìm của sidebar, trang Components hay command palette sẽ ra các component mang
 * thẻ đó, kể cả khi tên component không chứa từ ấy (gõ "voice" ra Transcript).
 */
export const COMPONENT_TAGS = {
  ai: { vi: "AI", en: "AI", aliases: ["llm", "chat", "assistant", "trợ lý", "agent"] },
  voice: { vi: "Giọng nói", en: "Voice", aliases: ["audio", "speech", "mic", "microphone", "âm thanh"] },
  calling: { vi: "Cuộc gọi", en: "Calling", aliases: ["call", "phone", "meeting", "gọi"] },
  transcript: { vi: "Bản ghi", en: "Transcript", aliases: ["captions", "subtitles", "phụ đề"] },
  markdown: { vi: "Markdown", en: "Markdown", aliases: ["md", "content", "cms", "nội dung"] },
  article: { vi: "Bài viết", en: "Article", aliases: ["post", "long-form", "toc", "mục lục"] },
  blog: { vi: "Blog", en: "Blog", aliases: ["posts", "news", "tin tức"] },
} as const satisfies Record<string, { vi: string; en: string; aliases: readonly string[] }>;

export type ComponentTag = keyof typeof COMPONENT_TAGS;

export const isComponentTag = (value: string): value is ComponentTag => Object.hasOwn(COMPONENT_TAGS, value);

/** Chữ thường, bỏ dấu (đ → d), để "giong noi" khớp "Giọng nói". */
export function foldSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/[đĐ]/g, "d").toLowerCase();
}

/** Mọi chữ tìm được của các thẻ: id, nhãn hai ngôn ngữ và từ đồng nghĩa. */
export function tagTerms(tags: readonly string[] | undefined): string[] {
  if (!tags) return [];
  return tags.flatMap((tag) => (isComponentTag(tag) ? [tag, COMPONENT_TAGS[tag].vi, COMPONENT_TAGS[tag].en, ...COMPONENT_TAGS[tag].aliases] : [tag]));
}

export interface SearchableComponent {
  slug: string;
  name: string;
  lead?: string;
  tags?: readonly string[];
}

/**
 * Component có khớp truy vấn không: mọi từ của truy vấn phải có trong tên, slug, lead (ngôn ngữ đang xem) hoặc thẻ; không
 * phân biệt dấu và hoa thường. Truy vấn rỗng khớp mọi thứ.
 */
export function matchesComponent(item: SearchableComponent, query: string): boolean {
  const words = foldSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = foldSearch([item.name, item.slug, item.lead ?? "", ...tagTerms(item.tags)].join(" "));
  return words.every((word) => haystack.includes(word));
}

/** Nhãn của thẻ theo ngôn ngữ. */
export const tagLabel = (tag: string, locale: "vi" | "en") => (isComponentTag(tag) ? COMPONENT_TAGS[tag][locale] : tag);
