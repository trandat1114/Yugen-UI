/** Chuỗi giao diện có sẵn của ColorPicker. Đổi qua `messages.colorPicker` của YugenProvider. */
export interface ColorPickerMessages {
  /** aria-label của vùng chọn độ bão hoà / độ sáng. */
  area: string;
  /** Giá trị đọc cho trình đọc màn hình (phần trăm). */
  areaValue: (saturation: number, brightness: number) => string;
  hue: string;
  /** Thanh và ô độ đục (alpha). */
  alpha: string;
  /** aria-label ô chọn định dạng (HEX / RGB / HSL). */
  format: string;
  hex: string;
  red: string;
  green: string;
  blue: string;
  saturation: string;
  lightness: string;
  /** Nút lấy màu trên màn hình (EyeDropper). */
  eyeDropper: string;
  /** Nhãn nhóm màu có sẵn (`swatches`). */
  swatches: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    colorPicker: ColorPickerMessages;
  }
}

export const colorPickerMessagesVi: ColorPickerMessages = {
  area: "Độ bão hoà và độ sáng",
  areaValue: (saturation, brightness) => `Độ bão hoà ${saturation}%, độ sáng ${brightness}%`,
  hue: "Sắc độ",
  alpha: "Độ đục",
  format: "Định dạng màu",
  hex: "Hex",
  red: "Đỏ",
  green: "Xanh lá",
  blue: "Xanh dương",
  saturation: "Bão hoà",
  lightness: "Độ sáng",
  eyeDropper: "Lấy màu trên màn hình",
  swatches: "Màu có sẵn",
};

export const colorPickerMessagesEn: ColorPickerMessages = {
  area: "Saturation and brightness",
  areaValue: (saturation, brightness) => `Saturation ${saturation}%, brightness ${brightness}%`,
  hue: "Hue",
  alpha: "Opacity",
  format: "Color format",
  hex: "Hex",
  red: "Red",
  green: "Green",
  blue: "Blue",
  saturation: "Saturation",
  lightness: "Lightness",
  eyeDropper: "Pick a color from the screen",
  swatches: "Preset colors",
};
