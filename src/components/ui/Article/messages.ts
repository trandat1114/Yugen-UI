/** Chuỗi giao diện có sẵn của Article. Đổi qua `messages.article` của YugenProvider. */
export interface ArticleMessages {
  /** Tiêu đề (và tên) của ArticleToc. */
  toc: string;
  /** Thời gian đọc; `minutes` đã làm tròn lên, `text` là số đã định dạng theo locale. */
  readingTime: (minutes: number, text: string) => string;
  /** Nhãn trước ngày cập nhật. */
  updated: string;
  /** Tên của danh sách thẻ. */
  tags: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    article: ArticleMessages;
  }
}

export const articleMessagesVi: ArticleMessages = {
  toc: "Trong bài này",
  readingTime: (_minutes, text) => `${text} phút đọc`,
  updated: "Cập nhật",
  tags: "Thẻ",
};

export const articleMessagesEn: ArticleMessages = {
  toc: "On this page",
  readingTime: (_minutes, text) => `${text} min read`,
  updated: "Updated",
  tags: "Tags",
};
