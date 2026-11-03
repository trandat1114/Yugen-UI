/** Chuỗi giao diện có sẵn của MessageBar. Đổi qua `messages.messageBar` của YugenProvider. */
export interface MessageBarMessages {
  /** Nhãn nút đóng (khi có `onDismiss`). */
  dismiss: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    messageBar: MessageBarMessages;
  }
}

export const messageBarMessages: MessageBarMessages = { dismiss: "Đóng thông báo" };

export const messageBarMessagesEn: MessageBarMessages = { dismiss: "Dismiss" };

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `messageBarMessagesEn` (mặc định). `messageBarMessages` giữ cho code cũ. */
export const messageBarMessagesVi = messageBarMessages;
