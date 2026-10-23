/** Chuỗi giao diện có sẵn của PromptInput (và `validateFiles`). Đổi qua `messages.promptInput` của YugenProvider. */
export interface PromptInputMessages {
  placeholder: string;
  /** Nhãn truy cập cho ô soạn. */
  label: string;
  /** Tên nút gửi / dừng. */
  send: string;
  stop: string;
  /** Tên nút đính kèm. */
  attach: string;
  /** Tên danh sách tệp đã đính kèm. */
  attachments: string;
  /** Tên nút gỡ một tệp. */
  remove: (fileName: string) => string;
  /** Gợi ý phím (showHint). */
  hint: string;
  /** Lớp phủ khi kéo tệp vào. */
  dropzone: string;
  /** Đọc qua live region sau khi đính kèm / gỡ tệp. */
  attachedOne: (fileName: string) => string;
  attachedMany: (count: number) => string;
  removed: (fileName: string) => string;
  /** Lỗi kiểm tra tệp (validateFiles). `maxSize` đã định dạng sẵn (vd. "5 MB"). */
  duplicate: (fileName: string) => string;
  invalidType: (fileName: string) => string;
  tooLarge: (fileName: string, maxSize: string) => string;
  tooMany: (maxFiles: number) => string;
}

/** Chuỗi giao diện có sẵn của StreamingMarkdown. Đổi qua `messages.streamingMarkdown` của YugenProvider. */
export interface StreamingMarkdownMessages {
  /** Chữ ẩn sau link mở tab mới. */
  newTab: string;
  /** Chữ ẩn trước mục danh sách việc đã xong / chưa xong. */
  taskDone: string;
  taskTodo: string;
  /** Tên vùng cuộn của bảng. */
  table: string;
}

/** Chuỗi giao diện có sẵn của Citation và CitationList. Đổi qua `messages.citation` của YugenProvider. */
export interface CitationMessages {
  /** Chữ ẩn trước số của chip, và tên thay khi nguồn không có tên miền. */
  source: string;
  /** Tiêu đề CitationList (khi không truyền `title`). */
  sources: string;
  /** Chữ ẩn sau link mở tab mới. */
  newTab: string;
}

/** Chuỗi giao diện có sẵn của Reasoning. Đổi qua `messages.reasoning` của YugenProvider. */
export interface ReasoningMessages {
  thinking: string;
  /** Đã xong, không rõ thời lượng. */
  thought: string;
  /** Đã xong; `duration` đã định dạng sẵn (vd. "12s"). */
  thoughtFor: (duration: string) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    promptInput: PromptInputMessages;
    streamingMarkdown: StreamingMarkdownMessages;
    citation: CitationMessages;
    reasoning: ReasoningMessages;
  }
}

export const promptInputMessages: PromptInputMessages = {
  placeholder: "Hỏi bất cứ điều gì…",
  label: "Nhập yêu cầu",
  send: "Gửi",
  stop: "Dừng phản hồi",
  attach: "Đính kèm tệp",
  attachments: "Tệp đính kèm",
  remove: (fileName) => `Gỡ ${fileName}`,
  hint: "Enter để gửi · Shift+Enter xuống dòng",
  dropzone: "Thả tệp để đính kèm",
  attachedOne: (fileName) => `Đã đính kèm ${fileName}`,
  attachedMany: (count) => `Đã đính kèm ${count} tệp`,
  removed: (fileName) => `Đã gỡ ${fileName}`,
  duplicate: (fileName) => `“${fileName}” đã được đính kèm.`,
  invalidType: (fileName) => `“${fileName}” không đúng định dạng cho phép.`,
  tooLarge: (fileName, maxSize) => `“${fileName}” vượt quá ${maxSize}.`,
  tooMany: (maxFiles) => `Chỉ đính kèm tối đa ${maxFiles} tệp.`,
};

export const promptInputMessagesEn: PromptInputMessages = {
  placeholder: "Ask anything…",
  label: "Enter a prompt",
  send: "Send",
  stop: "Stop responding",
  attach: "Attach files",
  attachments: "Attachments",
  remove: (fileName) => `Remove ${fileName}`,
  hint: "Enter to send · Shift+Enter for a new line",
  dropzone: "Drop files to attach",
  attachedOne: (fileName) => `Attached ${fileName}`,
  attachedMany: (count) => (count === 1 ? "Attached 1 file" : `Attached ${count} files`),
  removed: (fileName) => `Removed ${fileName}`,
  duplicate: (fileName) => `“${fileName}” is already attached.`,
  invalidType: (fileName) => `“${fileName}” isn't an allowed file type.`,
  tooLarge: (fileName, maxSize) => `“${fileName}” is larger than ${maxSize}.`,
  tooMany: (maxFiles) => (maxFiles === 1 ? "You can attach only 1 file." : `You can attach up to ${maxFiles} files.`),
};

export const streamingMarkdownMessages: StreamingMarkdownMessages = {
  newTab: "(mở tab mới)",
  taskDone: "Đã xong:",
  taskTodo: "Chưa xong:",
  table: "Bảng",
};

export const streamingMarkdownMessagesEn: StreamingMarkdownMessages = {
  newTab: "(opens in new tab)",
  taskDone: "Done:",
  taskTodo: "Not done:",
  table: "Table",
};

export const citationMessages: CitationMessages = {
  source: "Nguồn",
  sources: "Nguồn",
  newTab: "(mở tab mới)",
};

export const citationMessagesEn: CitationMessages = {
  source: "Source",
  sources: "Sources",
  newTab: "(opens in new tab)",
};

export const reasoningMessages: ReasoningMessages = {
  thinking: "Đang suy luận…",
  thought: "Đã suy luận",
  thoughtFor: (duration) => `Đã suy luận trong ${duration}`,
};

export const reasoningMessagesEn: ReasoningMessages = {
  thinking: "Thinking…",
  thought: "Thought",
  thoughtFor: (duration) => `Thought for ${duration}`,
};
