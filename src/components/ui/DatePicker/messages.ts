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

/** Chuỗi giao diện có sẵn của MonthPicker. Đổi qua `messages.monthPicker` của YugenProvider. */
export interface MonthPickerMessages {
  /** Placeholder khi chưa chọn tháng. */
  placeholder: string;
  /** aria-label nút xoá giá trị (`clearable`). */
  clear: string;
  /** aria-label nút sang năm trước / năm sau. */
  previousYear: string;
  nextYear: string;
}

/** Chuỗi giao diện có sẵn của YearPicker. Đổi qua `messages.yearPicker` của YugenProvider. */
export interface YearPickerMessages {
  /** Placeholder khi chưa chọn năm. */
  placeholder: string;
  /** aria-label nút xoá giá trị (`clearable`). */
  clear: string;
  /** aria-label nút sang 12 năm trước / sau. */
  previousYears: string;
  nextYears: string;
}

/** Chuỗi giao diện có sẵn của DateTimePicker. Đổi qua `messages.dateTimePicker` của YugenProvider. */
export interface DateTimePickerMessages {
  /** Placeholder khi chưa chọn. */
  placeholder: string;
  /** aria-label nút xoá giá trị (`clearable`). */
  clear: string;
  /** Nhãn ô giờ trong popover. */
  time: string;
  /** Nút đóng popover. */
  done: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    datePicker: DatePickerMessages;
    dateRangePicker: DateRangePickerMessages;
    monthPicker: MonthPickerMessages;
    yearPicker: YearPickerMessages;
    dateTimePicker: DateTimePickerMessages;
  }
}

export const datePickerMessagesVi: DatePickerMessages = {
  placeholder: "Chọn ngày…",
  clear: "Xoá giá trị",
};

export const datePickerMessagesEn: DatePickerMessages = {
  placeholder: "Select a date…",
  clear: "Clear",
};

export const dateRangePickerMessagesVi: DateRangePickerMessages = {
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

export const monthPickerMessagesVi: MonthPickerMessages = {
  placeholder: "Chọn tháng…",
  clear: "Xoá giá trị",
  previousYear: "Năm trước",
  nextYear: "Năm sau",
};

export const monthPickerMessagesEn: MonthPickerMessages = {
  placeholder: "Select a month…",
  clear: "Clear",
  previousYear: "Previous year",
  nextYear: "Next year",
};

export const yearPickerMessagesVi: YearPickerMessages = {
  placeholder: "Chọn năm…",
  clear: "Xoá giá trị",
  previousYears: "Các năm trước",
  nextYears: "Các năm sau",
};

export const yearPickerMessagesEn: YearPickerMessages = {
  placeholder: "Select a year…",
  clear: "Clear",
  previousYears: "Earlier years",
  nextYears: "Later years",
};

export const dateTimePickerMessagesVi: DateTimePickerMessages = {
  placeholder: "Chọn ngày giờ…",
  clear: "Xoá giá trị",
  time: "Giờ",
  done: "Xong",
};

export const dateTimePickerMessagesEn: DateTimePickerMessages = {
  placeholder: "Select date and time…",
  clear: "Clear",
  time: "Time",
  done: "Done",
};

/** @deprecated Use `datePickerMessagesVi` (Vietnamese) or `datePickerMessagesEn`. Will be removed in v1.0.0. */
export const datePickerMessages = datePickerMessagesVi;

/** @deprecated Use `dateRangePickerMessagesVi` (Vietnamese) or `dateRangePickerMessagesEn`. Will be removed in v1.0.0. */
export const dateRangePickerMessages = dateRangePickerMessagesVi;
