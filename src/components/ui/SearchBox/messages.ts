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

export const searchBoxMessagesVi: SearchBoxMessages = {
  dismiss: "Xoá nội dung tìm kiếm",
  placeholder: "Tìm kiếm",
};

export const searchBoxMessagesEn: SearchBoxMessages = {
  dismiss: "Clear search",
  placeholder: "Search",
};

/** @deprecated Use `searchBoxMessagesVi` (Vietnamese) or `searchBoxMessagesEn`. Will be removed in v1.0.0. */
export const searchBoxMessages = searchBoxMessagesVi;
