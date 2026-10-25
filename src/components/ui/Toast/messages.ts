/** Chuỗi giao diện có sẵn của Toast. Đổi qua `messages.toast` của YugenProvider. */
export interface ToastMessages {
  /** Tên vùng thông báo cho trình đọc màn hình. */
  region: string;
  /** Tên vùng kèm phím tắt nhảy tới; `{hotkey}` được thay bằng phím tắt (F8). */
  regionHotkey: string;
  /** Nhãn nút đóng từng toast. */
  dismiss: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    toast: ToastMessages;
  }
}

export const toastMessages: ToastMessages = {
  region: "Thông báo",
  regionHotkey: "Thông báo ({hotkey})",
  dismiss: "Đóng thông báo",
};
