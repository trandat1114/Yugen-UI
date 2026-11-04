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

export const spinnerMessagesVi: SpinnerMessages = { label: "Đang tải" };

export const spinnerMessagesEn: SpinnerMessages = { label: "Loading" };

/** @deprecated Use `spinnerMessagesVi` (Vietnamese) or `spinnerMessagesEn`. Will be removed in v1.0.0. */
export const spinnerMessages = spinnerMessagesVi;
