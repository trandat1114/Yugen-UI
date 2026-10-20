import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "data-visualization",
  title: "Trực quan hoá dữ liệu",
  group: "Yugen Labs",
  order: 4,
  lead: "Một biểu đồ được người đọc và được máy thực thi: chọn dạng trước, gán màu theo nhiệm vụ, kiểm bảng màu bằng công cụ thay vì bằng mắt — rồi mới vẽ.",
  toc: [
    { id: "form", label: "Chọn dạng biểu đồ" },
    { id: "palette", label: "Bảng màu & token" },
    { id: "marks", label: "Mark & khoảng trắng" },
    { id: "interaction", label: "Tương tác" },
    { id: "accessibility", label: "Khả năng tiếp cận" },
    { id: "anti-patterns", label: "Lỗi thường gặp" },
  ],
};
