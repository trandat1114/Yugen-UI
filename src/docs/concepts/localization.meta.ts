import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "localization",
  title: "Ngôn ngữ giao diện",
  group: "Nhà phát triển",
  order: 5.5,
  lead: "Chữ có sẵn trong component (nút Đóng, nhãn cho trình đọc màn hình, trạng thái trống…) mặc định là tiếng Anh. YugenProvider đổi toàn bộ sang tiếng Việt, hoặc sang ngôn ngữ khác, bằng một prop messages.",
  toc: [
    { id: "vietnamese", label: "Chuyển sang tiếng Việt" },
    { id: "override", label: "Đổi vài chuỗi" },
    { id: "locale", label: "Ngày, giờ và số" },
    { id: "other", label: "Ngôn ngữ khác" },
    { id: "source", label: "Khi copy source" },
  ],
};
