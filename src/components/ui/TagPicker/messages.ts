/** Chuỗi giao diện có sẵn của TagPicker. Đổi qua `messages.tagPicker` của YugenProvider. */
export interface TagPickerMessages {
  /** Nội dung khi không có kết quả lọc. */
  noResults: string;
  /** Gợi ý khi `freeform` và chữ gõ không khớp option nào. */
  addFreeform: (query: string) => string;
  /** aria-label nhóm tag đã chọn. */
  selectedItems: string;
  /** aria-label nút mũi tên khi listbox đang mở. */
  closeList: string;
  /** aria-label nút mũi tên khi listbox đang đóng. */
  openList: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    tagPicker: TagPickerMessages;
  }
}

export const tagPickerMessages: TagPickerMessages = {
  noResults: "Không tìm thấy kết quả",
  addFreeform: (query) => `Nhấn Enter để thêm “${query}”`,
  selectedItems: "Mục đã chọn",
  closeList: "Đóng danh sách",
  openList: "Mở danh sách",
};
