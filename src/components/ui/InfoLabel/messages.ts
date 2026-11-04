/** Chuỗi giao diện có sẵn của InfoLabel. Đổi qua `messages.infoLabel` của YugenProvider. */
export interface InfoLabelMessages {
  /** aria-label của nút thông tin (i). */
  infoButton: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    infoLabel: InfoLabelMessages;
  }
}

export const infoLabelMessagesVi: InfoLabelMessages = { infoButton: "Thông tin" };

export const infoLabelMessagesEn: InfoLabelMessages = { infoButton: "Information" };

/** @deprecated Use `infoLabelMessagesVi` (Vietnamese) or `infoLabelMessagesEn`. Will be removed in v1.0.0. */
export const infoLabelMessages = infoLabelMessagesVi;
