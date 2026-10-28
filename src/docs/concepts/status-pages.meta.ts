import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "status-pages",
  title: "Trang trạng thái HTTP",
  group: "Yugen Labs",
  order: 1.6,
  lead: "404, 500, bảo trì, mất mạng: khi cả trang không hiện được, nói rõ chuyện gì xảy ra, chỉ một việc nên làm tiếp và tự khôi phục khi có thể, trong cùng bố cục với màn chờ khởi động.",
  toc: [
    { id: "when", label: "Khi nào cần trang riêng" },
    { id: "lab", label: "Phòng thử" },
    { id: "catalog", label: "Danh mục trạng thái" },
    { id: "copy", label: "Viết nội dung" },
    { id: "art", label: "Logo & mã viết dọc" },
    { id: "recovery", label: "Tự khôi phục" },
    { id: "a11y", label: "Khả năng tiếp cận" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
