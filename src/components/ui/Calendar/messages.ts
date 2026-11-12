import { vi } from "react-day-picker/locale/vi";

/**
 * A date-fns locale, e.g. `import { fr } from "react-day-picker/locale"`. Only `code` is named here so that Calendar's
 * props do not depend on date-fns types.
 */
export interface CalendarLocale {
  code?: string;
}

/** Chuỗi giao diện có sẵn của Calendar. Đổi qua `messages.calendar` của YugenProvider. */
export interface CalendarMessages {
  /**
   * Locale của react-day-picker: tên tháng / thứ, nhãn trợ năng của nút và ô ngày, ngày đầu tuần. Prop `locale` của
   * Calendar vẫn ưu tiên hơn. `undefined` dùng locale en-US có sẵn trong react-day-picker.
   */
  locale: CalendarLocale | undefined;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    calendar: CalendarMessages;
  }
}

export const calendarMessagesVi: CalendarMessages = { locale: vi };

/** en-US là locale mặc định của react-day-picker, nên `messagesEn` không phải nạp thêm locale nào. */
export const calendarMessagesEn: CalendarMessages = { locale: undefined };

/** @deprecated Use `calendarMessagesVi` (Vietnamese) or `calendarMessagesEn`. Will be removed in v1.0.0. */
export const calendarMessages = calendarMessagesVi;
