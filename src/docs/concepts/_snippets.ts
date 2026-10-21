import { REGISTRY_URL } from "../install";
import { templateCommand } from "../templates";

/** Code mẫu dùng chung cho Bắt đầu nhanh & shadcn CLI (bản tiếng Việt và tiếng Anh) — một nơi sửa khi đổi lệnh. */

export const TEMPLATE_COMMAND = templateCommand("vite-starter");

export const CSS_TAILWIND = `/* src/index.css (Vite) · app/globals.css (Next.js) */
@import "tailwindcss";
@import "yugen-ui/theme.css";`;

export const CSS_PRECOMPILED = `// src/main.tsx — no Tailwind
import "yugen-ui/styles.css";`;

export const PROVIDER_VITE = `// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster>
      <App />
    </YugenProvider>
  </StrictMode>,
);`;

export const PROVIDER_NEXT = `// app/layout.tsx
import { YugenProvider } from "yugen-ui";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-theme="light" data-brand="sakura">
      <body>
        <YugenProvider applyToDocument withToaster>{children}</YugenProvider>
      </body>
    </html>
  );
}`;

export const SHADCN_INIT = `shadcn@latest init ${REGISTRY_URL}/init.json`;
export const SHADCN_INIT_NEXT = `shadcn@latest init ${REGISTRY_URL}/init-next.json`;
export const SHADCN_ADD = `shadcn@latest add ${REGISTRY_URL}/button.json ${REGISTRY_URL}/dialog.json`;

export const SHADCN_EXISTING = `shadcn@latest add ${REGISTRY_URL}/theme.json ${REGISTRY_URL}/button.json`;

export const NAMESPACE = `{
  "registries": {
    "@yugen": "${REGISTRY_URL}/{name}.json"
  }
}`;
