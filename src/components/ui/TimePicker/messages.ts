/** Chuỗi giao diện có sẵn của TimePicker. Đổi qua `messages.timePicker` của YugenProvider. */
export interface TimePickerMessages {
  /** Placeholder của ô nhập. */
  placeholder: string;
  /** Nội dung khi khoảng giờ rỗng. */
  noOptions: string;
  /** aria-label của danh sách giờ khi ô nhập không có nhãn riêng. */
  listLabel: string;
  /** aria-label nút mũi tên khi danh sách đang mở. */
  closeList: string;
  /** aria-label nút mũi tên khi danh sách đang đóng. */
  openList: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    timePicker: TimePickerMessages;
  }
}

export const timePickerMessages: TimePickerMessages = {
  placeholder: "Chọn giờ…",
  noOptions: "Không có giờ phù hợp",
  listLabel: "Chọn giờ",
  closeList: "Đóng danh sách giờ",
  openList: "Mở danh sách giờ",
};
