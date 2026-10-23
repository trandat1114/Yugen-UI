import type { Locale } from "react-day-picker";
import { vi } from "react-day-picker/locale/vi";
import { enUS } from "react-day-picker/locale/en-US";

/** Chuỗi giao diện có sẵn của Calendar. Đổi qua `messages.calendar` của YugenProvider. */
export interface CalendarMessages {
  /**
   * Locale của react-day-picker: tên tháng / thứ, nhãn trợ năng của nút và ô ngày, ngày đầu tuần. Prop `locale` của
   * Calendar vẫn ưu tiên hơn.
   */
  locale: Locale;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    calendar: CalendarMessages;
  }
}

export const calendarMessages: CalendarMessages = { locale: vi };

export const calendarMessagesEn: CalendarMessages = { locale: enUS };
