import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  locale: "vi-VN",
  appName: "Ứng dụng của tôi",
  description: "Dự án Next.js App Router với Yugen UI.",
  nav: { label: "Chính", home: "Trang chủ", settings: "Cài đặt", skip: "Bỏ qua tới nội dung" },
  home: {
    title: "Next.js với Yugen UI",
    lead: "App Router, Server Component và theme mà server đã biết sẵn. Sửa src/app/page.tsx để bắt đầu.",
    settings: "Đổi theme",
    docs: "Đọc tài liệu",
    serverTitle: "Server Component",
    renderedAt: (time) => `Trang này được render trên server lúc ${time}. File không có "use client": component của Yugen là client component, và Server Component render được chúng miễn là props tuần tự hoá được (chữ, số, phần tử, không có hàm).`,
    features: [
      { title: "Theme lưu trong cookie", body: "src/app/layout.tsx đọc cookie và ghi data-theme lên <html>, nên HTML đầu tiên đã đúng theme." },
      { title: "Một provider phía client", body: "src/app/providers.tsx là file \"use client\" duy nhất ở gốc. Nó bọc YugenProvider và lưu thay đổi." },
      { title: "Metadata theo trang", body: "Mỗi trang export metadata; layout gốc đặt mẫu tiêu đề và description." },
      { title: "next/font", body: "Noto Sans được tự host lúc build và thành font chữ chính của Yugen, đủ dấu tiếng Việt." },
    ],
  },
  settings: {
    title: "Cài đặt",
    description: "Theme và brand, lưu trong cookie.",
    lead: "Trang này là Server Component; biểu mẫu bên dưới là Client Component vì nó xử lý thao tác bấm.",
    theme: "Theme",
    themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" },
    brand: "Brand",
    saved: "Đã lưu. Tải lại trang: server render đúng theme này.",
    clientNote: "src/components/AppearanceForm.tsx bắt đầu bằng \"use client\" vì nó dùng state và trình xử lý sự kiện.",
  },
  notFound: { title: "Không tìm thấy trang", body: "Trang này không tồn tại hoặc đã được chuyển.", action: "Về trang chủ" },
};

export default vi;
