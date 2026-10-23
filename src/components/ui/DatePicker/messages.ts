/** Chuỗi giao diện có sẵn của DatePicker. Đổi qua `messages.datePicker` của YugenProvider. */
export interface DatePickerMessages {
  /** Placeholder khi chưa chọn ngày. */
  placeholder: string;
  /** aria-label nút xoá giá trị (`clearable`). */
  clear: string;
}

/** Chuỗi giao diện có sẵn của DateRangePicker. Đổi qua `messages.dateRangePicker` của YugenProvider. */
export interface DateRangePickerMessages {
  /** Placeholder khi chưa chọn khoảng ngày. */
  placeholder: string;
  /** aria-label nút xoá giá trị (`clearable`). */
  clear: string;
  /** Nhãn nhóm preset cho trình đọc màn hình. */
  presets: string;
  /** Nhãn các preset trong `DEFAULT_RANGE_PRESETS`. */
  today: string;
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastMonth: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    datePicker: DatePickerMessages;
    dateRangePicker: DateRangePickerMessages;
  }
}

export const datePickerMessages: DatePickerMessages = {
  placeholder: "Chọn ngày…",
  clear: "Xoá giá trị",
};

export const datePickerMessagesEn: DatePickerMessages = {
  placeholder: "Select a date…",
  clear: "Clear",
};

export const dateRangePickerMessages: DateRangePickerMessages = {
  placeholder: "Chọn khoảng ngày…",
  clear: "Xoá giá trị",
  presets: "Chọn nhanh khoảng ngày",
  today: "Hôm nay",
  last7Days: "7 ngày qua",
  last30Days: "30 ngày qua",
  thisMonth: "Tháng này",
  lastMonth: "Tháng trước",
};

export const dateRangePickerMessagesEn: DateRangePickerMessages = {
  placeholder: "Select a date range…",
  clear: "Clear",
  presets: "Date range presets",
  today: "Today",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  thisMonth: "This month",
  lastMonth: "Last month",
};
