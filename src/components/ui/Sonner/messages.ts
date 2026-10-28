/** Chuỗi giao diện có sẵn của Sonner. Đổi qua `messages.sonner` của YugenProvider. */
export interface SonnerMessages {
  /** Tên vùng thông báo cho trình đọc màn hình. */
  region: string;
  /** Tên vùng kèm phím tắt nhảy tới; `{hotkey}` được thay bằng phím tắt (F8). */
  regionHotkey: string;
  /** Nhãn nút đóng từng thông báo. */
  dismiss: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    sonner: SonnerMessages;
  }
}

export const sonnerMessages: SonnerMessages = {
  region: "Thông báo",
  regionHotkey: "Thông báo ({hotkey})",
  dismiss: "Đóng thông báo",
};

export const sonnerMessagesEn: SonnerMessages = {
  region: "Notifications",
  regionHotkey: "Notifications ({hotkey})",
  dismiss: "Dismiss notification",
};
