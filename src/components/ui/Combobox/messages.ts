/** Chuỗi giao diện có sẵn của Combobox. Đổi qua `messages.combobox` của YugenProvider. */
export interface ComboboxMessages {
  /** Nội dung khi không có kết quả lọc. */
  noResults: string;
  /** Gợi ý khi `freeform` và chữ gõ không khớp option nào. */
  useFreeform: (query: string) => string;
  /** aria-label nút mũi tên khi listbox đang mở. */
  closeList: string;
  /** aria-label nút mũi tên khi listbox đang đóng. */
  openList: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    combobox: ComboboxMessages;
  }
}

export const comboboxMessages: ComboboxMessages = {
  noResults: "Không tìm thấy kết quả",
  useFreeform: (query) => `Nhấn Enter để dùng “${query}”`,
  closeList: "Đóng danh sách",
  openList: "Mở danh sách",
};

export const comboboxMessagesEn: ComboboxMessages = {
  noResults: "No results found",
  useFreeform: (query) => `Press Enter to use “${query}”`,
  closeList: "Close list",
  openList: "Open list",
};
