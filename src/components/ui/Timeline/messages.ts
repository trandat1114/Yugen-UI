/** Chuỗi giao diện có sẵn của Timeline. Đổi qua `messages.timeline` của YugenProvider, hoặc prop `progressLabel`. */
export interface TimelineMessages {
  /** Tên của progressbar ẩn khi bật `progress` (trình đọc màn hình). */
  progressLabel: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    timeline: TimelineMessages;
  }
}

export const timelineMessagesVi: TimelineMessages = {
  progressLabel: "Tiến độ dòng thời gian",
};

export const timelineMessagesEn: TimelineMessages = {
  progressLabel: "Timeline progress",
};
