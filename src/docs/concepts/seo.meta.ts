import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "seo",
  title: "SEO với Yugen UI",
  group: "Nhà phát triển",
  order: 6.5,
  lead: "Component Yugen render HTML chuẩn ở phía server, nên công cụ tìm kiếm đọc được nội dung. Phần còn lại là metadata của trang, cấu trúc tiêu đề, link thật và văn bản thay thế cho ảnh.",
  toc: [
    { id: "server", label: "Nội dung có trong HTML" },
    { id: "metadata", label: "Title và description" },
    { id: "headings", label: "Cấu trúc tiêu đề" },
    { id: "links", label: "Link bot đọc được" },
    { id: "images", label: "Ảnh và avatar" },
    { id: "checklist", label: "Kiểm tra trước khi phát hành" },
  ],
};
