import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // import { Foo } from "@/components/Foo" thay cho đường dẫn tương đối dài (khai báo cả trong tsconfig.json).
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: {
    rolldownOptions: {
      output: {
        // Tách thư viện khỏi mã ứng dụng: sửa trang chỉ làm đổi chunk nhỏ, phần còn lại trình duyệt giữ cache.
        // Icon Fluent để chung vendor: tách riêng tạo vòng import vendor ↔ icons (lỗi TDZ lúc chạy).
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 20 },
            { name: "vendor", test: /[\\/]node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
