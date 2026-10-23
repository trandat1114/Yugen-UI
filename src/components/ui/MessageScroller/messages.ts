/** Chuỗi giao diện có sẵn của MessageScroller. Đổi qua `messages.messageScroller` của YugenProvider. */
export interface MessageScrollerMessages {
  /** Nhãn vùng hội thoại (khi không truyền `label`). */
  label: string;
  /** Spinner khi đang tải tin cũ. */
  loadingOlder: string;
  /** Tên nút cuộn xuống đáy khi không có tin mới. */
  jumpToLatest: string;
  /** Chữ trên nút cuộn xuống đáy khi có tin mới. */
  newMessages: (count: number) => string;
}

/** Chuỗi giao diện có sẵn của MessageBubble. Đổi qua `messages.messageBubble` của YugenProvider. */
export interface MessageBubbleMessages {
  /** Nhãn trạng thái gửi — cùng tên với `MessageStatus`. */
  sending: string;
  sent: string;
  delivered: string;
  read: string;
  /** Lỗi gửi (khi không truyền `errorMessage`). */
  error: string;
  retry: string;
}

/** Chuỗi giao diện có sẵn của TypingIndicator. Đổi qua `messages.typingIndicator` của YugenProvider. */
export interface TypingIndicatorMessages {
  /** Câu đọc cho trình đọc màn hình (khi không truyền `label`). */
  label: (author?: string) => string;
}

/** Chuỗi giao diện có sẵn của ChatComposer. Đổi qua `messages.chatComposer` của YugenProvider. */
export interface ChatComposerMessages {
  placeholder: string;
  /** Nhãn truy cập cho ô soạn. */
  label: string;
  /** Tên nút gửi. */
  send: string;
  /** Tên nút dừng (khi busy + onStop). */
  stop: string;
  /** Gợi ý phím (showHint). */
  hint: string;
  /** Chữ ẩn trước / sau bộ đếm "12/100", cho trình đọc màn hình. */
  countPrefix: string;
  countSuffix: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    messageScroller: MessageScrollerMessages;
    messageBubble: MessageBubbleMessages;
    typingIndicator: TypingIndicatorMessages;
    chatComposer: ChatComposerMessages;
  }
}

export const messageScrollerMessages: MessageScrollerMessages = {
  label: "Cuộc trò chuyện",
  loadingOlder: "Đang tải tin nhắn cũ…",
  jumpToLatest: "Tới tin nhắn mới nhất",
  newMessages: (count) => `${count} tin nhắn mới`,
};

export const messageScrollerMessagesEn: MessageScrollerMessages = {
  label: "Conversation",
  loadingOlder: "Loading earlier messages…",
  jumpToLatest: "Jump to latest message",
  newMessages: (count) => (count === 1 ? "1 new message" : `${count} new messages`),
};

export const messageBubbleMessages: MessageBubbleMessages = {
  sending: "Đang gửi",
  sent: "Đã gửi",
  delivered: "Đã nhận",
  read: "Đã xem",
  error: "Không gửi được.",
  retry: "Thử lại",
};

export const messageBubbleMessagesEn: MessageBubbleMessages = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Seen",
  error: "Couldn't send.",
  retry: "Retry",
};

export const typingIndicatorMessages: TypingIndicatorMessages = {
  label: (author) => `${author ?? "Đối phương"} đang soạn tin…`,
};

export const typingIndicatorMessagesEn: TypingIndicatorMessages = {
  label: (author) => `${author ?? "Someone"} is typing…`,
};

export const chatComposerMessages: ChatComposerMessages = {
  placeholder: "Nhập tin nhắn…",
  label: "Tin nhắn",
  send: "Gửi",
  stop: "Dừng phản hồi",
  hint: "Enter để gửi · Shift+Enter xuống dòng",
  countPrefix: "Đã nhập",
  countSuffix: "ký tự",
};

export const chatComposerMessagesEn: ChatComposerMessages = {
  placeholder: "Type a message…",
  label: "Message",
  send: "Send",
  stop: "Stop responding",
  hint: "Enter to send · Shift+Enter for a new line",
  countPrefix: "Typed",
  countSuffix: "characters",
};
