/** Chuỗi giao diện có sẵn của Spinner. Đổi qua `messages.spinner` của YugenProvider. */
export interface SpinnerMessages {
  /** aria-label khi không có `label` hiển thị. */
  label: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    spinner: SpinnerMessages;
  }
}

export const spinnerMessages: SpinnerMessages = { label: "Đang tải" };

export const spinnerMessagesEn: SpinnerMessages = { label: "Loading" };
