const formats = new Map<string, Intl.DateTimeFormat>();

/** "2026-10-21" → "21 tháng 10, 2026" (vi-VN) · "October 21, 2026" (en-US). Đọc như ngày địa phương để không lệch múi giờ. */
export const formatDate = (iso: string, locale: string) => {
  let format = formats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
    formats.set(locale, format);
  }
  const [y, m, d] = iso.split("-").map(Number);
  return format.format(new Date(y, m - 1, d));
};
