/** Chuỗi giao diện có sẵn của SpinButton. Đổi qua `messages.spinButton` của YugenProvider. */
export interface SpinButtonMessages {
  /** aria-label nút tăng. */
  increment: string;
  /** aria-label nút giảm. */
  decrement: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    spinButton: SpinButtonMessages;
  }
}

export const spinButtonMessagesVi: SpinButtonMessages = {
  increment: "Tăng giá trị",
  decrement: "Giảm giá trị",
};

export const spinButtonMessagesEn: SpinButtonMessages = {
  increment: "Increment value",
  decrement: "Decrement value",
};

/** @deprecated Use `spinButtonMessagesVi` (Vietnamese) or `spinButtonMessagesEn`. Will be removed in v1.0.0. */
export const spinButtonMessages = spinButtonMessagesVi;
