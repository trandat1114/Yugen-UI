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

export const swatchPickerMessagesVi: SwatchPickerMessages = { emptySwatch: "Ô trống" };

export const swatchPickerMessagesEn: SwatchPickerMessages = { emptySwatch: "Empty swatch" };

/** @deprecated Use `swatchPickerMessagesVi` (Vietnamese) or `swatchPickerMessagesEn`. Will be removed in v1.0.0. */
export const swatchPickerMessages = swatchPickerMessagesVi;
