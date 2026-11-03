/** Chuỗi giao diện có sẵn của SplitButton. Đổi qua `messages.splitButton` của YugenProvider. */
export interface SplitButtonMessages {
  /** aria-label của nút mở menu. */
  menu: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    splitButton: SplitButtonMessages;
  }
}

export const splitButtonMessagesVi: SplitButtonMessages = { menu: "Thêm tuỳ chọn" };

export const splitButtonMessagesEn: SplitButtonMessages = { menu: "More options" };

/** @deprecated Use `splitButtonMessagesVi` (Vietnamese) or `splitButtonMessagesEn`. Will be removed in v1.0.0. */
export const splitButtonMessages = splitButtonMessagesVi;
