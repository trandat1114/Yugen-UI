import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "adaptive-overlays",
  title: "Overlay thích ứng desktop & mobile",
  group: "Yugen Labs",
  order: 5,
  lead: "Cùng một tác vụ, khác thiết bị: chọn đúng Dialog, Drawer, Sheet hay Popover, và để Sheet tự thành panel trên màn hình rộng, bottom sheet trong tầm ngón cái trên điện thoại.",
  toc: [
    { id: "choose", label: "Chọn overlay" },
    { id: "sheet", label: "Sheet: một API, hai dạng" },
    { id: "ergonomics", label: "Công thái học bottom sheet" },
    { id: "a11y", label: "Bàn phím & trình đọc màn hình" },
    { id: "safe-area", label: "Vùng an toàn & bàn phím ảo" },
    { id: "motion", label: "Giảm chuyển động" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
