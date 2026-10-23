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

export const infoLabelMessages: InfoLabelMessages = { infoButton: "Thông tin" };

export const infoLabelMessagesEn: InfoLabelMessages = { infoButton: "Information" };
