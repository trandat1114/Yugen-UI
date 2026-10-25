/** Chuỗi giao diện có sẵn của SearchBox. Đổi qua `messages.searchBox` của YugenProvider. */
export interface SearchBoxMessages {
  /** aria-label của nút xoá nội dung. */
  dismiss: string;
  /** Placeholder mặc định. */
  placeholder: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    searchBox: SearchBoxMessages;
  }
}

export const searchBoxMessages: SearchBoxMessages = {
  dismiss: "Xoá nội dung tìm kiếm",
  placeholder: "Tìm kiếm",
};
