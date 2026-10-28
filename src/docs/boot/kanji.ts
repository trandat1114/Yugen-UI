const DIGITS = "〇一二三四五六七八九";

/** Font cho số Hán, cùng danh sách với splash.css: Mincho nét mảnh như bút lông nếu máy có, không thì serif. */
export const MINCHO = '"Yu Mincho", YuMincho, "Hiragino Mincho ProN", "Noto Serif JP", "Noto Serif CJK JP", "Source Han Serif JP", serif';

/** 0–100 bằng số Hán: 〇, 七, 十二, 四十, 九十九, 百. Cùng quy tắc với hàm kanji trong splash.js (màn chờ chạy trước React). */
export function kanji(n: number): string {
  if (n >= 100) return "百";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (!tens) return DIGITS[ones];
  return (tens > 1 ? DIGITS[tens] : "") + "十" + (ones ? DIGITS[ones] : "");
}
