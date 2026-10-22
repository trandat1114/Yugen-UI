import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  appName: "Ứng dụng của tôi",
  nav: { label: "Liên kết", docs: "Tài liệu", appearance: "Giao diện", mode: "Chế độ", brand: "Thương hiệu" },
  themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" },
  hero: {
    title: "Dự án đã chạy.",
    body: [
      "Vite, React và Tailwind CSS v4 đã cấu hình sẵn với Yugen UI: lưu theme người dùng chọn, toast, bàn phím và trình đọc màn hình. Sửa ",
      { code: "src/Welcome.tsx" },
      " rồi lưu để thấy trang đổi.",
    ],
    docs: "Mở tài liệu",
    next: "Bước tiếp theo",
  },
  steps: {
    title: "Bước tiếp theo",
    items: [
      {
        title: "Thay trang này",
        body: ["Render ứng dụng của bạn trong ", { code: "src/App.tsx" }, " thay cho ", { code: "<Welcome />" }, ". Provider, theme đã lưu và toast vẫn giữ."],
      },
      {
        title: "Thêm component",
        body: ["Import từ yugen-ui, ví dụ ", { code: 'import { DataGrid } from "yugen-ui"' }, ". Mỗi trang tài liệu có ví dụ để chép."],
      },
      {
        title: "Đổi màu thương hiệu",
        body: [
          "Chuyển giữa Sakura và Web ở menu phía trên. Muốn màu riêng, tạo bảng màu trong Theme Designer rồi dán CSS vào ",
          { code: "src/index.css" },
          ".",
        ],
      },
    ],
  },
  links: {
    title: "Khám phá",
    items: [
      { title: "Components", body: "Ví dụ và props của từng component.", path: "#/components/button" },
      { title: "Blocks", body: "Đăng nhập, cài đặt, thống kê… để chép.", path: "#/blocks" },
      { title: "Templates", body: "SaaS, blog Markdown, dashboard và chat AI.", path: "#/templates" },
      { title: "Theme Designer", body: "Bảng màu thương hiệu kèm kiểm tra tương phản.", path: "#/theme-designer" },
    ],
  },
  footer: { yugen: "yūgen: vẻ đẹp sâu lắng trong những điều tinh tế.", builtWith: "Dựng bằng" },
};

export default vi;
