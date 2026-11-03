/** Chuỗi giao diện có sẵn của PasswordInput. Đổi qua `messages.passwordInput` của YugenProvider. */
export interface PasswordInputMessages {
  /** aria-label nút hiện / ẩn mật khẩu (nút bật tắt, `aria-pressed` cho biết đang hiện). */
  show: string;
  /** Nhắc khi Caps Lock đang bật lúc gõ. */
  capsLock: string;
  /** Nhãn của thước đo độ mạnh. */
  strength: string;
  /** Bốn mức của `getPasswordStrength` (1 → 4). */
  weak: string;
  fair: string;
  good: string;
  strong: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    passwordInput: PasswordInputMessages;
  }
}

export const passwordInputMessagesVi: PasswordInputMessages = {
  show: "Hiện mật khẩu",
  capsLock: "Caps Lock đang bật",
  strength: "Độ mạnh",
  weak: "Yếu",
  fair: "Trung bình",
  good: "Khá",
  strong: "Mạnh",
};

export const passwordInputMessagesEn: PasswordInputMessages = {
  show: "Show password",
  capsLock: "Caps Lock is on",
  strength: "Strength",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};
