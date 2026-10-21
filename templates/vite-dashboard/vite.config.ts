import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Tách thư viện khỏi mã ứng dụng: sửa trang chỉ làm đổi chunk nhỏ, phần còn lại trình duyệt giữ cache.
        // Icon Fluent để chung vendor: tách riêng tạo vòng import vendor ↔ icons (lỗi TDZ lúc chạy).
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
});
