import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "performance",
  title: "Hiệu năng",
  group: "Nhà phát triển",
  order: 6.8,
  lead: "Những thiết lập giúp ứng dụng dùng Yugen UI nhẹ và nhanh, kèm số đo trên bản build của thư viện. Dung lượng tính sau minify và gzip.",
  toc: [
    { id: "imports", label: "Đường dẫn import và bundler" },
    { id: "on-demand", label: "Phần nạp lúc cần" },
    { id: "css", label: "Dung lượng CSS" },
    { id: "theme", label: "Theme trước lần vẽ đầu" },
    { id: "re-renders", label: "Render lại" },
    { id: "charts", label: "Biểu đồ nhiều điểm" },
  ],
};
