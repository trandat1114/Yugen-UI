import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // React (trang nào cũng cần) tách riêng để trình duyệt giữ cache khi mã ứng dụng đổi. Không gom mọi node_modules vào
        // một chunk "vendor": yugen-ui được build theo từng component, để Rolldown tự chia thì trang nạp lười chỉ tải
        // component của chính nó (lần tải đầu của SaaS giảm ~27%).
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
