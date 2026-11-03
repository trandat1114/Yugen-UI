/** Chuỗi giao diện có sẵn của Resizable. Đổi qua `messages.resizable` của YugenProvider. */
export interface ResizableMessages {
  /** Chú thích (title) nút thu gọn panel của ResizableHandle. */
  collapse: string;
  /** Chú thích (title) nút mở rộng panel của ResizableHandle. */
  expand: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    resizable: ResizableMessages;
  }
}

export const resizableMessagesVi: ResizableMessages = {
  collapse: "Thu gọn panel",
  expand: "Mở rộng panel",
};

export const resizableMessagesEn: ResizableMessages = {
  collapse: "Collapse panel",
  expand: "Expand panel",
};

/** @deprecated Use `resizableMessagesVi` (Vietnamese) or `resizableMessagesEn`. Will be removed in v1.0.0. */
export const resizableMessages = resizableMessagesVi;
