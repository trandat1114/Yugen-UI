import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "wait-ux",
  title: "Trải nghiệm chờ (Wait UX)",
  group: "Yugen Labs",
  order: 1,
  lead: "Chờ là không tránh được; cảm giác chờ thì thiết kế được. Chọn đúng tín hiệu cho từng khoảng thời gian, đừng để loader nháy, giữ nội dung đứng yên — và luôn có lối thoát khi lỗi.",
  toc: [
    { id: "thresholds", label: "Ngưỡng cảm nhận" },
    { id: "decision", label: "Chọn loại chỉ báo" },
    { id: "delay", label: "Delay & thời gian tối thiểu" },
    { id: "skeleton", label: "Độ trung thực của khung xương" },
    { id: "optimistic", label: "Optimistic UI & hoàn tác" },
    { id: "cancel", label: "Huỷ & timeout" },
    { id: "errors", label: "Lỗi & thử lại" },
    { id: "a11y", label: "Khả năng tiếp cận" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
