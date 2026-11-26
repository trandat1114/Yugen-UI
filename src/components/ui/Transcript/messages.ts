/** Chuỗi giao diện có sẵn của Transcript. Đổi qua `messages.transcript` của YugenProvider. */
export interface TranscriptMessages {
  /** Tên của vùng transcript (khi không truyền `aria-label`). */
  label: string;
  /** Chưa có lượt nào. */
  empty: string;
  loading: string;
  /** Nhãn chữ của lượt đang diễn ra (không chỉ bằng màu). */
  current: string;
  /** Chữ ẩn sau lượt đang nhận dữ liệu. */
  streaming: string;
  /** Lượt lỗi mà không có `error` riêng (nhận dạng giọng nói thất bại…). */
  error: string;
  /** Đọc một lượt vừa xong qua vùng live. */
  announce: (speaker: string, text: string) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    transcript: TranscriptMessages;
  }
}

export const transcriptMessagesVi: TranscriptMessages = {
  label: "Bản ghi hội thoại",
  empty: "Chưa có ai nói gì.",
  loading: "Đang tải bản ghi…",
  current: "Đang nói",
  streaming: "(đang tiếp tục)",
  error: "Không nhận dạng được lời nói.",
  announce: (speaker, text) => `${speaker}: ${text}`,
};

export const transcriptMessagesEn: TranscriptMessages = {
  label: "Transcript",
  empty: "Nothing has been said yet.",
  loading: "Loading transcript…",
  current: "Speaking",
  streaming: "(continuing)",
  error: "Speech couldn't be recognized.",
  announce: (speaker, text) => `${speaker}: ${text}`,
};
