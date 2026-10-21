import { SITE } from "./site";

const DATE = new Intl.DateTimeFormat(SITE.locale, { day: "numeric", month: "long", year: "numeric" });

/** "2026-10-21" → "21 tháng 10, 2026" (theo SITE.locale). Đọc như ngày địa phương để không lệch múi giờ. */
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return DATE.format(new Date(y, m - 1, d));
};
