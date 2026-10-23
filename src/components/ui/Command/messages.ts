/** Chuỗi giao diện có sẵn của Command. Đổi qua `messages.command` của YugenProvider. */
export interface CommandMessages {
  /** Tiêu đề ẩn (cho trình đọc màn hình) của CommandDialog. */
  dialogTitle: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    command: CommandMessages;
  }
}

export const commandMessages: CommandMessages = { dialogTitle: "Bảng lệnh" };

export const commandMessagesEn: CommandMessages = { dialogTitle: "Command palette" };
