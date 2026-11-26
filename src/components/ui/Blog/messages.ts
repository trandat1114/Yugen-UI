/** Chuỗi giao diện có sẵn của BlogCard, BlogList, BlogTagFilter. Đổi qua `messages.blog` của YugenProvider. */
export interface BlogMessages {
  /** Nút bỏ mọi thẻ đang lọc. */
  allTags: string;
  /** Tên của nhóm nút lọc theo thẻ. */
  tagFilter: string;
  /** Không có bài nào (sau khi lọc). */
  empty: string;
  loadMore: string;
  /** Tên của danh sách đang tải (aria-busy). */
  loading: string;
  /** Thời gian đọc; `text` là số phút đã định dạng theo locale. */
  readingTime: (minutes: number, text: string) => string;
  /** Nhãn của bài nổi bật. */
  featured: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    blog: BlogMessages;
  }
}

export const blogMessagesVi: BlogMessages = {
  allTags: "Tất cả",
  tagFilter: "Lọc theo thẻ",
  empty: "Không có bài viết nào phù hợp.",
  loadMore: "Xem thêm bài",
  loading: "Đang tải bài viết…",
  readingTime: (_minutes, text) => `${text} phút đọc`,
  featured: "Nổi bật",
};

export const blogMessagesEn: BlogMessages = {
  allTags: "All",
  tagFilter: "Filter by tag",
  empty: "No posts match.",
  loadMore: "Load more posts",
  loading: "Loading posts…",
  readingTime: (_minutes, text) => `${text} min read`,
  featured: "Featured",
};
