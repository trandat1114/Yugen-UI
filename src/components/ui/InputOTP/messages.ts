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

export const inputOTPMessagesVi: InputOTPMessages = {
  slot: (position, length) => `Ký tự ${position} trên ${length}`,
};

export const inputOTPMessagesEn: InputOTPMessages = {
  slot: (position, length) => `Character ${position} of ${length}`,
};

/** @deprecated Use `inputOTPMessagesVi` (Vietnamese) or `inputOTPMessagesEn`. Will be removed in v1.0.0. */
export const inputOTPMessages = inputOTPMessagesVi;
