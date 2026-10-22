import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "cli",
  title: "CLI yugen",
  group: "Bắt đầu",
  order: 3,
  lead: "Một công cụ dòng lệnh để tạo app từ template, thiết lập Yugen UI trong dự án có sẵn, chép mã nguồn component và kiểm tra cấu hình.",
  toc: [
    { id: "commands", label: "Các lệnh" },
    { id: "create", label: "Tạo app mới" },
    { id: "init", label: "Thiết lập dự án có sẵn" },
    { id: "add", label: "Thêm component" },
    { id: "doctor", label: "Kiểm tra cấu hình" },
    { id: "config", label: "yugen.json và registry" },
    { id: "options", label: "Tuỳ chọn chung" },
  ],
};
