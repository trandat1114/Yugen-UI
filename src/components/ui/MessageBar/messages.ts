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

export const messageBarMessagesVi: MessageBarMessages = { dismiss: "Đóng thông báo" };

export const messageBarMessagesEn: MessageBarMessages = { dismiss: "Dismiss" };

/** @deprecated Use `messageBarMessagesVi` (Vietnamese) or `messageBarMessagesEn`. Will be removed in v1.0.0. */
export const messageBarMessages = messageBarMessagesVi;
