import type { Locale } from "react-day-picker";
import { vi } from "react-day-picker/locale/vi";

/** Chuỗi giao diện có sẵn của Calendar. Đổi qua `messages.calendar` của YugenProvider. */
export interface CalendarMessages {
  /**
   * Locale của react-day-picker: tên tháng / thứ, nhãn trợ năng của nút và ô ngày, ngày đầu tuần. Prop `locale` của
   * Calendar vẫn ưu tiên hơn. `undefined` dùng locale en-US có sẵn trong react-day-picker.
   */
  locale: Locale | undefined;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    calendar: CalendarMessages;
  }
}

export const calendarMessages: CalendarMessages = { locale: vi };

/** en-US là locale mặc định của react-day-picker, nên `messagesEn` không phải nạp thêm locale nào. */
export const calendarMessagesEn: CalendarMessages = { locale: undefined };
