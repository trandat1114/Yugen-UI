/** Chuỗi giao diện có sẵn của Stepper và Step. Đổi qua `messages.stepper` của YugenProvider. */
export interface StepperMessages {
  /** aria-label mặc định của danh sách bước. */
  label: string;
  /** Tiền tố ẩn (sr-only) trước tiêu đề bước, theo sau là ":"; `index` đếm từ 1. */
  step: (index: number) => string;
  /** Trạng thái đọc sau tiêu đề bước (sr-only). */
  complete: string;
  current: string;
  upcoming: string;
  error: string;
  /** Nhãn của bước `optional`. */
  optional: string;
  /** Dòng tóm tắt khi Stepper ngang thu gọn ở màn hẹp; `current` đếm từ 1. */
  progress: (current: number, total: number) => string;
  /** aria-label thanh tiến độ khi thu gọn. */
  progressLabel: (current: number, total: number) => string;
}

/** Chuỗi giao diện có sẵn của Wizard. Đổi qua `messages.wizard` của YugenProvider. */
export interface WizardMessages {
  back: string;
  next: string;
  finish: string;
  /** Lỗi khi `validate` trả `false`. */
  invalid: string;
  /** Lỗi khi `validate` ném lỗi. */
  validateFailed: string;
  /** Tên ẩn của vùng nội dung bước, theo sau là ": " và tiêu đề bước; `current` đếm từ 1. */
  panel: (current: number, total: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    stepper: StepperMessages;
    wizard: WizardMessages;
  }
}

export const stepperMessages: StepperMessages = {
  label: "Các bước",
  step: (index) => `Bước ${index}`,
  complete: "đã hoàn thành",
  current: "bước hiện tại",
  upcoming: "chưa thực hiện",
  error: "có lỗi",
  optional: "Tuỳ chọn",
  progress: (current, total) => `Bước ${current}/${total}`,
  progressLabel: (current, total) => `Bước ${current} trên ${total}`,
};

export const stepperMessagesEn: StepperMessages = {
  label: "Steps",
  step: (index) => `Step ${index}`,
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  error: "error",
  optional: "Optional",
  progress: (current, total) => `Step ${current} of ${total}`,
  progressLabel: (current, total) => `Step ${current} of ${total}`,
};

export const wizardMessages: WizardMessages = {
  back: "Quay lại",
  next: "Tiếp tục",
  finish: "Hoàn tất",
  invalid: "Vui lòng kiểm tra lại thông tin ở bước này.",
  validateFailed: "Không kiểm tra được bước này. Hãy thử lại.",
  panel: (current, total) => `Bước ${current}/${total}`,
};

export const wizardMessagesEn: WizardMessages = {
  back: "Back",
  next: "Next",
  finish: "Finish",
  invalid: "Check the information in this step.",
  validateFailed: "Couldn't validate this step. Try again.",
  panel: (current, total) => `Step ${current} of ${total}`,
};
