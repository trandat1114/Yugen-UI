/** Chuỗi giao diện có sẵn của Markdown. Đổi qua `messages.markdown` của YugenProvider. */
export interface MarkdownMessages {
  /** Chữ ẩn sau link mở tab mới. */
  newTab: string;
  /** Chữ ẩn trước mục danh sách việc đã xong / chưa xong. */
  taskDone: string;
  taskTodo: string;
  /** Tên vùng cuộn của bảng. */
  table: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    markdown: MarkdownMessages;
  }
}

export const markdownMessages: MarkdownMessages = {
  newTab: "(mở tab mới)",
  taskDone: "Đã xong:",
  taskTodo: "Chưa xong:",
  table: "Bảng",
};

export const markdownMessagesEn: MarkdownMessages = {
  newTab: "(opens in new tab)",
  taskDone: "Done:",
  taskTodo: "Not done:",
  table: "Table",
};
