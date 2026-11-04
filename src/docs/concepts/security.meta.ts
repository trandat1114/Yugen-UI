import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "security",
  title: "Bảo mật",
  group: "Nhà phát triển",
  order: 9,
  lead: "Component nào hiển thị nội dung không tin cậy (Markdown từ người dùng hay mô hình, code, link, tệp) và Yugen UI làm sạch những gì; phần còn lại app phải tự làm.",
  toc: [
    { id: "handled", label: "Yugen UI xử lý gì" },
    { id: "app", label: "App phải tự làm gì" },
    { id: "report", label: "Báo lỗ hổng" },
  ],
};
