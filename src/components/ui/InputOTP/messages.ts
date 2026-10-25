/** Chuỗi giao diện có sẵn của InputOTP. Đổi qua `messages.inputOTP` của YugenProvider. */
export interface InputOTPMessages {
  /** aria-label của từng ô; `position` đếm từ 1. */
  slot: (position: number, length: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    inputOTP: InputOTPMessages;
  }
}

export const inputOTPMessages: InputOTPMessages = {
  slot: (position, length) => `Ký tự ${position} trên ${length}`,
};
