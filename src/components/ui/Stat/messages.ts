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

export const statMessagesVi: StatMessages = {
  increase: "Tăng",
  decrease: "Giảm",
  noChange: "Không đổi",
};

export const statMessagesEn: StatMessages = {
  increase: "Increase",
  decrease: "Decrease",
  noChange: "No change",
};

/** @deprecated Use `statMessagesVi` (Vietnamese) or `statMessagesEn`. Will be removed in v1.0.0. */
export const statMessages = statMessagesVi;
