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

export const commandMessagesVi: CommandMessages = { dialogTitle: "Bảng lệnh" };

export const commandMessagesEn: CommandMessages = { dialogTitle: "Command palette" };

/** @deprecated Use `commandMessagesVi` (Vietnamese) or `commandMessagesEn`. Will be removed in v1.0.0. */
export const commandMessages = commandMessagesVi;
