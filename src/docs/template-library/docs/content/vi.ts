import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  locale: "vi-VN",
  site: {
    title: "Tài liệu Sakura Notes",
    product: "Sakura Notes",
    description: "Hướng dẫn và tài liệu API của Sakura Notes, ứng dụng ghi chú chung cho nhóm: SDK, REST API, CLI và webhook.",
  },
  themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" },
  appearance: "Giao diện",
  skipToContent: "Bỏ qua, tới nội dung",
  nav: { label: "Tài liệu", open: "Mở mục lục", home: "Trang chủ" },
  search: {
    button: "Tìm trong tài liệu",
    title: "Tìm trong tài liệu",
    placeholder: "Tìm trang và đề mục…",
    empty: "Không có kết quả. Thử bớt từ khoá.",
  },
  home: {
    eyebrow: "Tài liệu",
    title: "Làm việc với Sakura Notes",
    lead: "Cài SDK, tạo ghi chú đầu tiên trong vài phút, rồi tra cứu mọi endpoint, lệnh CLI và sự kiện webhook.",
    primary: { label: "Bắt đầu nhanh", page: "bat-dau/bat-dau-nhanh" },
    secondary: { label: "Tham chiếu API", page: "tham-chieu-api/xac-thuc" },
    sections: "Các phần",
    pageCount: (count) => `${count} trang`,
  },
  page: { toc: "Trong trang này", pager: "Trang khác", previous: "Trang trước", next: "Trang sau" },
  markdown: { done: "Đã xong", todo: "Chưa xong", table: "Bảng", note: "Lưu ý", tip: "Mẹo", warning: "Cảnh báo" },
  notFound: { title: "Không tìm thấy trang", body: "Trang có thể đã đổi địa chỉ hoặc chưa từng tồn tại.", home: "Về trang tài liệu" },
  footer: { builtWith: "Dựng bằng" },
};

export default vi;
