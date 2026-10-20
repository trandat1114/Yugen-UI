import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "shadcn-registry",
  title: "Cài bằng shadcn CLI",
  group: "Bắt đầu",
  order: 3,
  lead: "Muốn sở hữu mã nguồn như shadcn/ui? Yugen UI có registry tương thích shadcn CLI: một lệnh chép component, các component nó phụ thuộc, cn() và theme vào dự án, đồng thời cài đủ gói npm.",
  toc: [
    { id: "choose", label: "npm hay chép mã nguồn" },
    { id: "setup", label: "Chuẩn bị dự án" },
    { id: "add", label: "Thêm component" },
    { id: "theme", label: "Bật theme Yugen" },
    { id: "namespace", label: "Registry có tên @yugen" },
    { id: "update", label: "Cập nhật" },
    { id: "notes", label: "Lưu ý" },
  ],
};
