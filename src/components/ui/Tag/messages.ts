/** Chuỗi giao diện có sẵn của Tag và InteractionTag. Đổi qua `messages.tag` của YugenProvider. */
export interface TagMessages {
  /** Mô tả hành động gỡ (Tag dismissible) và nhãn nút X khi nhãn tag không phải chuỗi. */
  dismiss: string;
  /** Nhãn nút X của InteractionTag khi nhãn tag là chuỗi. */
  dismissNamed: (name: string) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    tag: TagMessages;
  }
}

export const tagMessages: TagMessages = {
  dismiss: "Gỡ",
  dismissNamed: (name) => `Gỡ ${name}`,
};
