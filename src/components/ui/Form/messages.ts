/**
 * Chuỗi giao diện có sẵn của Form, FormErrorSummary và HookForm (`yugen-ui/form`): tiêu đề tóm tắt lỗi và thông báo lỗi
 * khi control không qua ràng buộc (`required`, `type`, `pattern`, `minLength`…). Đổi qua `messages.form` của YugenProvider.
 */
export interface FormMessages {
  /** Tiêu đề của FormErrorSummary; `count` là số lỗi. */
  summaryTitle: (count: number) => string;
  /** `required` của ô nhập, ô chữ nhiều dòng. */
  required: string;
  /** `required` của checkbox. */
  requiredCheckbox: string;
  /** `required` của select và nhóm radio. */
  requiredSelect: string;
  /** `required` của `<input type="file">`. */
  requiredFile: string;
  /** `type="email"` không đúng định dạng. */
  typeEmail: string;
  /** `type="url"` không đúng định dạng. */
  typeUrl: string;
  /** Không khớp `pattern`. */
  pattern: string;
  /** Ngắn hơn `minLength`; `length` là số ký tự hiện có. */
  tooShort: (min: number, length: number) => string;
  /** Dài hơn `maxLength`. */
  tooLong: (max: number, length: number) => string;
  /** Nhỏ hơn `min` (số, ngày); `min` như viết trong thuộc tính. */
  rangeUnderflow: (min: string) => string;
  /** Lớn hơn `max`. */
  rangeOverflow: (max: string) => string;
  /** Lỗi khác (`step`, giá trị không đọc được, quy tắc không có thông báo). */
  invalid: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    form: FormMessages;
  }
}

export const formMessagesVi: FormMessages = {
  summaryTitle: (count) => `Có ${count} lỗi cần sửa`,
  required: "Hãy điền mục này.",
  requiredCheckbox: "Hãy đánh dấu ô này để tiếp tục.",
  requiredSelect: "Hãy chọn một mục.",
  requiredFile: "Hãy chọn một tệp.",
  typeEmail: "Nhập địa chỉ email, ví dụ ten@example.com.",
  typeUrl: "Nhập địa chỉ URL, ví dụ https://example.com.",
  pattern: "Nhập đúng định dạng được yêu cầu.",
  tooShort: (min, length) => `Nhập ít nhất ${min} ký tự (hiện có ${length}).`,
  tooLong: (max, length) => `Nhập tối đa ${max} ký tự (hiện có ${length}).`,
  rangeUnderflow: (min) => `Nhập giá trị từ ${min} trở lên.`,
  rangeOverflow: (max) => `Nhập giá trị không quá ${max}.`,
  invalid: "Giá trị không hợp lệ.",
};

export const formMessagesEn: FormMessages = {
  summaryTitle: (count) => (count === 1 ? "There is 1 problem" : `There are ${count} problems`),
  required: "Fill in this field.",
  requiredCheckbox: "Check this box to continue.",
  requiredSelect: "Choose an option.",
  requiredFile: "Choose a file.",
  typeEmail: "Enter an email address, like name@example.com.",
  typeUrl: "Enter a URL, like https://example.com.",
  pattern: "Use the format shown.",
  tooShort: (min, length) => `Use at least ${min === 1 ? "1 character" : `${min} characters`} (now ${length}).`,
  tooLong: (max, length) => `Use at most ${max === 1 ? "1 character" : `${max} characters`} (now ${length}).`,
  rangeUnderflow: (min) => `Enter ${min} or more.`,
  rangeOverflow: (max) => `Enter ${max} or less.`,
  invalid: "Enter a valid value.",
};
