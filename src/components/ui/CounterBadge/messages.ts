/** Chuỗi giao diện có sẵn của CounterBadge. Đổi qua `messages.counterBadge` của YugenProvider. */
export interface CounterBadgeMessages {
  /** Nhãn cho trình đọc màn hình khi `dot`. */
  dot: string;
  /** Nhãn cho trình đọc màn hình theo số đếm. */
  count: (count: number) => string;
  /** Nhãn cho trình đọc màn hình khi count vượt `overflowCount`. */
  overflow: (overflowCount: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    counterBadge: CounterBadgeMessages;
  }
}

export const counterBadgeMessages: CounterBadgeMessages = {
  dot: "Có thông báo mới",
  count: (count) => `${count} thông báo`,
  overflow: (overflowCount) => `Hơn ${overflowCount} thông báo`,
};
