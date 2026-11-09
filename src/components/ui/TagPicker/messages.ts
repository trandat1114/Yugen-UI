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
  /** Tên của listbox khi ô nhập không có nhãn hiển thị (Field nối nhãn qua aria-labelledby). */
  listLabel: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    tagPicker: TagPickerMessages;
  }
}

export const tagPickerMessagesVi: TagPickerMessages = {
  noResults: "Không tìm thấy kết quả",
  addFreeform: (query) => `Nhấn Enter để thêm “${query}”`,
  selectedItems: "Mục đã chọn",
  closeList: "Đóng danh sách",
  openList: "Mở danh sách",
  listLabel: "Gợi ý",
};

export const tagPickerMessagesEn: TagPickerMessages = {
  noResults: "No results found",
  addFreeform: (query) => `Press Enter to add “${query}”`,
  selectedItems: "Selected items",
  closeList: "Close list",
  openList: "Open list",
  listLabel: "Suggestions",
};

/** @deprecated Use `tagPickerMessagesVi` (Vietnamese) or `tagPickerMessagesEn`. Will be removed in v1.0.0. */
export const tagPickerMessages = tagPickerMessagesVi;
