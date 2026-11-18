import type { ConceptMeta } from "../types";

export const meta: ConceptMeta = {
  slug: "data-tables",
  title: "Bảng dữ liệu dày đặc",
  group: "Yugen Labs",
  order: 4.5,
  lead: "Công thức cho bảng nghiệp vụ 8–15 cột: chọn mật độ, đặt quy tắc độ rộng cho từng cột, giữ cột định danh trong tầm nhìn, và để trạng thái tải, rỗng, lỗi hiện trong cùng một khung.",
  toc: [
    { id: "example", label: "Ví dụ: danh bạ khách hàng" },
    { id: "density", label: "Thoải mái hay gọn" },
    { id: "columns", label: "Độ rộng cột & chữ dài" },
    { id: "alignment", label: "Số & mã định danh" },
    { id: "scrolling", label: "Cuộn ngang & ghim cột" },
    { id: "states", label: "Tải, rỗng, lỗi" },
    { id: "viewports", label: "Theo độ rộng màn hình" },
    { id: "a11y", label: "Bàn phím, sắp xếp, chọn hàng" },
    { id: "rules", label: "Nên & không nên" },
  ],
};
