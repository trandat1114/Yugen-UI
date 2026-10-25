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

export const spinButtonMessages: SpinButtonMessages = {
  increment: "Tăng giá trị",
  decrement: "Giảm giá trị",
};
