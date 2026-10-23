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

export const dialogMessages: DialogMessages = { close: "Đóng" };

export const dialogMessagesEn: DialogMessages = { close: "Close" };
