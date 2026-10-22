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

/* CLI yugen (packages/cli) — trang #/concepts/cli. */

export const CLI_CREATE = "@yugen-ui/cli@latest create my-app";
export const CLI_CREATE_PM = `npx create-yugen-ui@latest my-app --template saas
pnpm create yugen-ui my-app --template saas
yarn create yugen-ui my-app --template saas
bun create yugen-ui my-app --template saas`;
export const CLI_INIT = "@yugen-ui/cli@latest init";
export const CLI_INIT_SOURCE = "@yugen-ui/cli@latest init --mode source";
export const CLI_ADD = "@yugen-ui/cli@latest add button dialog data-grid";
export const CLI_DOCTOR = "@yugen-ui/cli@latest doctor";

export const CLI_CONFIG = `{
  "mode": "source",
  "framework": "vite",
  "rsc": false,
  "css": "src/index.css",
  "paths": { "ui": "src/components/ui", "lib": "src/lib" },
  "aliases": { "ui": "@/components/ui", "lib": "@/lib" }
}`;

export const CLI_DOCTOR_OUTPUT = `◆  yugen.json: source mode
◆  React 18.3.1
◆  Tailwind CSS 4.3.3
◆  Theme imported: src/index.css → ./yugen.css
◆  15 component folders in src/components/ui
▲  YugenProvider not found
│  Wrap your app once: <YugenProvider applyToDocument withToaster>…</YugenProvider>
└  Looks good, 1 warning`;
