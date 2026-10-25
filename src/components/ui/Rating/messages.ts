/** Chuỗi giao diện có sẵn của Rating và RatingDisplay. Đổi qua `messages.rating` của YugenProvider. */
export interface RatingMessages {
  /** Nhãn đọc cho từng giá trị của Rating; `valueText` là `value` đã định dạng theo locale. */
  item: (value: number, valueText: string) => string;
  /** Nhãn đọc của RatingDisplay; `valueText` là điểm đã định dạng theo locale. */
  summary: (valueText: string, max: number) => string;
  /** Số lượt đánh giá, nối sau `summary` (", …"); `countText` là `count` đã định dạng theo locale. */
  count: (count: number, countText: string) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    rating: RatingMessages;
  }
}

export const ratingMessages: RatingMessages = {
  item: (_value, valueText) => `${valueText} sao`,
  summary: (valueText, max) => `Đánh giá ${valueText} trên ${max} sao`,
  count: (_count, countText) => `${countText} lượt`,
};
