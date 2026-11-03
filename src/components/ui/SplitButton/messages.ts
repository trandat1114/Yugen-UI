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

export const splitButtonMessages: SplitButtonMessages = { menu: "Thêm tuỳ chọn" };

export const splitButtonMessagesEn: SplitButtonMessages = { menu: "More options" };

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `splitButtonMessagesEn` (mặc định). `splitButtonMessages` giữ cho code cũ. */
export const splitButtonMessagesVi = splitButtonMessages;
