/** Chuỗi giao diện có sẵn của Questionnaire. Đổi qua `messages.questionnaire` của YugenProvider. */
export interface QuestionnaireMessages {
  /** Lỗi khi câu bắt buộc chưa trả lời (text / longText · rating / scale · còn lại). */
  requiredText: string;
  requiredScore: string;
  requiredChoice: string;
  /** Lỗi số mục đã chọn của câu `multiple`. */
  minSelected: (min: number) => string;
  maxSelected: (max: number) => string;
  /** Đếm số mục đã chọn của câu `multiple` có `max`. */
  selectedCount: (count: number, max: number) => string;
  /** Trang xem lại: câu chưa trả lời, điểm rating. */
  unanswered: string;
  ratingAnswer: (value: number, max: number) => string;
  /** Nhãn mặc định của câu `yesNo`. */
  yes: string;
  no: string;
  /** Chữ ẩn (sr-only) sau tiêu đề câu bắt buộc. */
  required: string;
  /** Gợi ý phím tắt (chế độ stepper). */
  keyHintChoice: (count: number) => string;
  keyHintYesNo: string;
  keyHintRating: (max: number) => string;
  keyHintScale: string;
  /** Dòng tiến độ và thanh tiến độ (chế độ stepper); `current` đếm từ 1. */
  questionOf: (current: number, total: number) => string;
  progressLabel: string;
  progressValue: (current: number, total: number) => string;
  /** Trang xem lại. */
  reviewTitle: string;
  reviewDescription: string;
  /** aria-label nút sửa một câu; `index` đếm từ 1. */
  editQuestion: (index: number, title: string) => string;
  /** Màn hình hoàn tất mặc định. */
  doneTitle: string;
  doneDescription: string;
  restart: string;
  /** Nút và trạng thái. */
  submit: string;
  submitting: string;
  submitError: string;
  review: string;
  back: string;
  backToEdit: string;
  next: string;
  /** Chữ trước phím Enter cạnh nút Tiếp. */
  orPress: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    questionnaire: QuestionnaireMessages;
  }
}

export const questionnaireMessages: QuestionnaireMessages = {
  requiredText: "Vui lòng nhập câu trả lời.",
  requiredScore: "Vui lòng chọn một mức điểm.",
  requiredChoice: "Vui lòng chọn một câu trả lời.",
  minSelected: (min) => `Chọn ít nhất ${min} mục.`,
  maxSelected: (max) => `Chọn tối đa ${max} mục.`,
  selectedCount: (count, max) => `Đã chọn ${count}/${max}`,
  unanswered: "Chưa trả lời",
  ratingAnswer: (value, max) => `${value}/${max} sao`,
  yes: "Có",
  no: "Không",
  required: "(bắt buộc)",
  keyHintChoice: (count) => `Nhấn 1–${count} để chọn`,
  keyHintYesNo: "Nhấn Y hoặc N để chọn",
  keyHintRating: (max) => `Nhấn 1–${max} để chấm điểm`,
  keyHintScale: "Nhấn phím số để chọn",
  questionOf: (current, total) => `Câu ${current}/${total}`,
  progressLabel: "Tiến độ khảo sát",
  progressValue: (current, total) => `Câu ${current} trên ${total}`,
  reviewTitle: "Xem lại câu trả lời",
  reviewDescription: "Kiểm tra lần cuối trước khi gửi. Chọn “Sửa” để thay đổi.",
  editQuestion: (index, title) => `Sửa câu ${index}: ${title}`,
  doneTitle: "Cảm ơn bạn!",
  doneDescription: "Câu trả lời của bạn đã được ghi nhận.",
  restart: "Làm lại",
  submit: "Gửi",
  submitting: "Đang gửi…",
  submitError: "Không gửi được câu trả lời. Vui lòng thử lại.",
  review: "Xem lại",
  back: "Quay lại",
  backToEdit: "Quay lại chỉnh sửa",
  next: "Tiếp",
  orPress: "hoặc nhấn",
};
