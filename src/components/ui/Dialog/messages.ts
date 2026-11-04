/** Chuỗi giao diện có sẵn của Dialog. Đổi qua `messages.dialog` của YugenProvider. */
export interface DialogMessages {
  /** Nhãn nút X ở DialogTitle. */
  close: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    dialog: DialogMessages;
  }
}

export const dialogMessagesVi: DialogMessages = { close: "Đóng" };

export const dialogMessagesEn: DialogMessages = { close: "Close" };

/** @deprecated Use `dialogMessagesVi` (Vietnamese) or `dialogMessagesEn`. Will be removed in v1.0.0. */
export const dialogMessages = dialogMessagesVi;
