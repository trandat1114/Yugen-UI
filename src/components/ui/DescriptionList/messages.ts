/** Chuỗi giao diện có sẵn của DescriptionList. Đổi qua `messages.descriptionList` của YugenProvider. */
export interface DescriptionListMessages {
  /** Tên nút sao chép; trình đọc màn hình đọc kèm nhãn của mục ("Sao chép Mã đơn"). */
  copy: string;
  /** Đọc qua vùng status sau khi sao chép. */
  copied: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    descriptionList: DescriptionListMessages;
  }
}

export const descriptionListMessagesVi: DescriptionListMessages = {
  copy: "Sao chép",
  copied: "Đã sao chép vào bộ nhớ tạm",
};

export const descriptionListMessagesEn: DescriptionListMessages = {
  copy: "Copy",
  copied: "Copied to clipboard",
};

/** @deprecated Use `descriptionListMessagesVi` (Vietnamese) or `descriptionListMessagesEn`. Will be removed in v1.0.0. */
export const descriptionListMessages = descriptionListMessagesVi;
