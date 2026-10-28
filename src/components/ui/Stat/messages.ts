/** Chuỗi giao diện có sẵn của Stat. Đổi qua `messages.stat` của YugenProvider. */
export interface StatMessages {
  /** Chữ ẩn đọc trước delta: chiều thay đổi. */
  increase: string;
  decrease: string;
  noChange: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    stat: StatMessages;
  }
}

export const statMessages: StatMessages = {
  increase: "Tăng",
  decrease: "Giảm",
  noChange: "Không đổi",
};

export const statMessagesEn: StatMessages = {
  increase: "Increase",
  decrease: "Decrease",
  noChange: "No change",
};
