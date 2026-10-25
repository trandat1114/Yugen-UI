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
