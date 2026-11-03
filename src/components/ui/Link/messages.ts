/** Chuỗi giao diện có sẵn của Link. Đổi qua `messages.link` của YugenProvider. */
export interface LinkMessages {
  /** Chữ ẩn (sr-only) sau link `external`. */
  newTab: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    link: LinkMessages;
  }
}

export const linkMessagesVi: LinkMessages = { newTab: "(mở trong thẻ mới)" };

export const linkMessagesEn: LinkMessages = { newTab: "(opens in new tab)" };

/** @deprecated Use `linkMessagesVi` (Vietnamese) or `linkMessagesEn`. Will be removed in v1.0.0. */
export const linkMessages = linkMessagesVi;
