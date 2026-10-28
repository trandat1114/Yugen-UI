import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "loading-screen",
  title: "Màn chờ khởi động",
  group: "Yugen Labs",
  order: 1.5,
  lead: "Màn chờ toàn trang chỉ nên có khi trang chưa có gì để hiện. Đã dùng thì tiến độ phải đo từ việc tải thật, đóng ngay khi trang sẵn sàng và có lối ra khi lỗi.",
  toc: [
    { id: "when", label: "Khi nào cần" },
    { id: "lab", label: "Phòng thử concept" },
    { id: "progress", label: "Tiến độ đo thật" },
    { id: "numerals", label: "Bố cục, số Hán & chữ" },
    { id: "motion", label: "Giảm chuyển động" },
    { id: "a11y", label: "Khả năng tiếp cận" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
