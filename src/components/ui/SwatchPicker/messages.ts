/** Chuỗi giao diện có sẵn của SwatchPicker. Đổi qua `messages.swatchPicker` của YugenProvider. */
export interface SwatchPickerMessages {
  /** aria-label mặc định của EmptySwatch. */
  emptySwatch: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    swatchPicker: SwatchPickerMessages;
  }
}

export const swatchPickerMessages: SwatchPickerMessages = { emptySwatch: "Ô trống" };

export const swatchPickerMessagesEn: SwatchPickerMessages = { emptySwatch: "Empty swatch" };

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `swatchPickerMessagesEn` (mặc định). `swatchPickerMessages` giữ cho code cũ. */
export const swatchPickerMessagesVi = swatchPickerMessages;
