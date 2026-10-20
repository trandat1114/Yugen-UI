import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "agent-trace",
  title: "Minh bạch tiến trình với Trace",
  group: "Yugen Labs",
  order: 3,
  lead: "Khi hệ thống làm việc thay người dùng — agent AI, pipeline, tác vụ nền — hãy cho họ thấy từng bước: đang làm gì, mất bao lâu, sai ở đâu và có thể làm gì tiếp.",
  toc: [
    { id: "why", label: "Vì sao cần minh bạch" },
    { id: "states", label: "Sáu trạng thái" },
    { id: "granularity", label: "Chọn độ chi tiết" },
    { id: "live", label: "Cập nhật trực tiếp" },
    { id: "errors", label: "Khi có lỗi" },
    { id: "a11y", label: "Khả năng tiếp cận" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
