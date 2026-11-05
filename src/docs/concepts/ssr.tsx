import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

const USE_CLIENT_CODE = `// scripts/use-client.mjs — chạy một lần: node scripts/use-client.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "src/components/ui";
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  for (const file of readdirSync(join(root, entry.name))) {
    if (!file.endsWith(".tsx")) continue;
    const path = join(root, entry.name, file);
    const source = readFileSync(path, "utf8");
    if (!source.startsWith('"use client"')) writeFileSync(path, '"use client";\\n' + source);
  }
}`;

const SETUP_CODE = `# Tailwind v4 trong Next.js chạy qua PostCSS
npm install -D tailwindcss @tailwindcss/postcss`;

const POSTCSS_CODE = `// postcss.config.mjs
export default {
  plugins: { "@tailwindcss/postcss": {} },
};`;

const GLOBALS_CODE = `/* src/app/globals.css — nội dung của src/index.css, chỉ sửa đường dẫn tokens */
@import "tailwindcss";
@import "../styles/tokens.css";

/* … giữ nguyên phần @theme, @theme inline, @utility, @keyframes và @layer base của index.css … */`;

const TSCONFIG_CODE = `// tsconfig.json — Next.js đọc paths trực tiếp, không cần cấu hình bundler
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}`;

const LAYOUT_CODE = `// src/app/layout.tsx — Server Component
import type { Metadata } from "next";
import { yugenHtmlAttributes, yugenThemeScript } from "@/components/ui";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "Ứng dụng Yugen" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Script sửa attribute của <html> trước khi hydrate → tắt cảnh báo lệch attribute cho riêng thẻ này.
    <html lang="vi" {...yugenHtmlAttributes({ brand: "sakura" })} suppressHydrationWarning>
      <head>
        {/* Chạy trước khi trình duyệt vẽ trang: data-theme theo lựa chọn đã lưu, không có thì theo hệ điều hành. */}
        <script dangerouslySetInnerHTML={{ __html: yugenThemeScript({ storageKey: "yugen-ui-theme" }) }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`;

/** sha256 của yugenThemeScript() không tuỳ chọn; document.test.ts báo lỗi khi script đổi mà giá trị này chưa đổi. */
const THEME_SCRIPT_HASH = "sha256-aQ5/7/M1H2ZEsd4PyJ7/nRi/VlDCe/SWLVR6JGIWbgM=";

const CSP_NONCE_CODE = `// Mỗi response một nonce ngẫu nhiên mới, đặt ở header và trên thẻ <script>:
// Content-Security-Policy: script-src 'self' 'nonce-<nonce>'
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: yugenThemeScript() }} />`;

const CSP_HASH_CODE = `# yugenThemeScript() không tuỳ chọn, ở phiên bản này
Content-Security-Policy: script-src 'self' '${THEME_SCRIPT_HASH}'`;

const CSP_HASH_COMPUTE_CODE = `// Tuỳ chọn khác: tính hash ở server hoặc lúc build
import { createHash } from "node:crypto";
import { yugenThemeScript } from "@/components/ui";

const script = yugenThemeScript({ storageKey: "my-app-theme" }); // đúng chuỗi bạn render trong <head>
const hash = createHash("sha256").update(script).digest("base64");
// Content-Security-Policy: script-src 'self' 'sha256-\${hash}'`;

const PROVIDERS_CODE = `// src/app/providers.tsx
"use client";

import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";

const STORAGE_KEY = "yugen-ui-theme";

function readTheme(): YugenTheme {
  // Server không có document → "light"; client đọc lại giá trị script đã đặt.
  if (typeof document === "undefined") return "light";
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "dark" || theme === "high-contrast" ? theme : "light";
}

export const SetThemeContext = React.createContext<(theme: YugenTheme) => void>(() => {});

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<YugenTheme>(readTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage bị chặn */
    }
  }, [theme]);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <YugenProvider applyToDocument withToaster theme={theme}>
        {children}
      </YugenProvider>
    </SetThemeContext.Provider>
  );
}`;

const RSC_CODE = `// src/app/settings/page.tsx — Server Component: lấy dữ liệu, render component Yugen với props tuần tự hoá được
import { Card, CardContent, CardHeader } from "@/components/ui";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <Card className="max-w-lg">
      <CardHeader header="Hồ sơ" description={user.email} />
      <CardContent>
        <SettingsForm defaultName={user.name} />
      </CardContent>
    </Card>
  );
}

// src/app/settings/settings-form.tsx — mọi thứ có hàm (onClick, render-prop, toast) nằm ở đây
"use client";

import { Button, Field, Input, toast } from "@/components/ui";

export function SettingsForm({ defaultName }: { defaultName: string }) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Đã lưu hồ sơ" });
      }}
    >
      <Field label="Tên hiển thị" required>
        <Input name="name" defaultValue={defaultName} />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Lưu
      </Button>
    </form>
  );
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="client-components"
        title="Client component"
        description="Mọi file trong src/components/ui dùng hook, context hoặc primitive Radix — nghĩa là chúng phải chạy trên client."
      >
        <div className="flex flex-col gap-4">
          <P>
            Site docs này là Vite SPA nên mã nguồn không có chỉ thị <C>&quot;use client&quot;</C>. Khi chép vào Next.js App Router, thêm{" "}
            <C>&quot;use client&quot;;</C> ở dòng đầu mỗi file component. Đoạn script dưới làm việc đó một lần cho cả thư mục:
          </P>
          <CodeBlock code={USE_CLIENT_CODE} />
          <MessageBar intent="warning" title="Hằng số cũng thành tham chiếu client." className="max-w-3xl">
            Class dùng chung (<C>fieldControlClass</C>, <C>popoverSurfaceClass</C>, <C>buttonVariants</C>…) export từ file có{" "}
            <C>&quot;use client&quot;</C> chỉ dùng được bên trong client component. Ở Server Component, import thẳng <C>cn</C> từ{" "}
            <C>@/lib/cn</C> (file không có chỉ thị) và viết utility.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="setup"
        title="Cài đặt cho Next.js"
        description="Các bước ở trang Bắt đầu nhanh vẫn đúng; chỉ khác plugin Tailwind và nơi đặt CSS."
      >
        <div className="flex flex-col gap-4">
          <MessageBar intent="info" title="Có sẵn template:" className="max-w-3xl">
            <C>npx create-yugen-ui@latest my-app --template next-starter</C> tạo app App Router đã làm sẵn các bước dưới đây,
            theme lưu trong cookie để server render đúng theme ngay từ HTML đầu tiên.
          </MessageBar>
          <CodeBlock code={SETUP_CODE} />
          <CodeBlock code={POSTCSS_CODE} />
          <CodeBlock code={GLOBALS_CODE} />
          <CodeBlock code={TSCONFIG_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="theme-flash"
        title="Root layout & chống nháy theme"
        description="HTML từ server không biết theme người dùng đã chọn. Script trong <head> đặt data-theme trước lần vẽ đầu; provider client đọc lại cùng giá trị."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={LAYOUT_CODE} />
          <CodeBlock code={PROVIDERS_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>suppressHydrationWarning</C> chỉ tác động lên chính thẻ <C>{"<html>"}</C> (một cấp), không che lỗi hydrate của phần còn lại.
            </li>
            <li>
              <C>yugenThemeScript()</C> đọc giá trị đã lưu ở <C>storageKey</C>: tên theme, hoặc JSON có <C>theme</C> và tuỳ chọn{" "}
              <C>brand</C>, <C>dir</C>. Chưa lưu gì thì theo hệ điều hành: <C>high-contrast</C> khi <C>prefers-contrast: more</C> (tắt
              bằng <C>highContrast: false</C>), sau đó tới <C>prefers-color-scheme</C>. Đặt <C>defaultTheme</C> để dùng một theme cố
              định.
            </li>
            <li>
              <C>yugenHtmlAttributes()</C> trả về đúng những gì <C>applyToDocument</C> ghi lên <C>{"<html>"}</C> (cùng mặc định), nên giá
              trị cố định như brand và <C>dir</C> có ngay trong HTML đầu tiên. Khi server biết theme (cookie), truyền theme vào đây và bỏ
              script. Cả hai helper là hàm thường, gọi được trong Server Component.
            </li>
            <li>
              Với <C>applyToDocument</C>, YugenProvider không render attribute theme vào markup nên server và client cho cùng HTML. Provider
              cập nhật <C>{"<html>"}</C> trong layout effect, trước khi trình duyệt vẽ. Nếu UI của bạn render khác nhau theo theme (icon
              mặt trời / mặt trăng), hãy render phần đó sau khi mount.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="csp"
        title="Content Security Policy"
        description="Script chống nháy là script inline. Policy chặt có thể cho phép nó bằng nonce hoặc bằng hash, không cần 'unsafe-inline'."
      >
        <div className="flex flex-col gap-4">
          <P>
            Dùng nonce: tạo một giá trị ngẫu nhiên mới cho mỗi response, đặt vào header <C>Content-Security-Policy</C> và lên thẻ{" "}
            <C>{"<script>"}</C>. Với Next.js, tạo nonce trong middleware rồi đọc lại trong layout bằng <C>headers()</C>.
          </P>
          <CodeBlock code={CSP_NONCE_CODE} />
          <P>
            Dùng hash: cùng tuỳ chọn thì script giống hệt nhau, nên trang tĩnh hoặc prerender có thể ghi hash sha256 của nó. Giá trị dưới
            đây là của <C>yugenThemeScript()</C> không tuỳ chọn. Hash đổi khi bạn truyền tuỳ chọn hoặc khi bản cập nhật đổi script, nên
            tính từ hàm khi có thể.
          </P>
          <CodeBlock code={CSP_HASH_CODE} />
          <CodeBlock code={CSP_HASH_COMPUTE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="rsc"
        title="Dùng trong Server Component"
        description="Server Component import và render component Yugen bình thường — chúng là ranh giới client. Điều kiện: props phải tuần tự hoá được."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={RSC_CODE} />
          <DoDont
            dos={[
              "Truyền chuỗi, số, JSX tĩnh, mảng options từ Server Component.",
              "Gom handler, state, render-prop của Field và toast() vào một client component nhỏ.",
              "Lấy dữ liệu trên server rồi truyền xuống làm defaultValue.",
            ]}
            donts={[
              "Không truyền hàm (onClick, onValueChange, children dạng hàm) từ Server Component.",
              "Không gọi toast() khi đang render trên server.",
              "Không dùng useYugen() trong Server Component — đó là hook.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="hydration"
        title="Portal, Toast & hydration"
        description="Những phần chỉ tồn tại trên client không có trong HTML của server."
      >
        <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
          <li>
            Portal của Radix (Dialog, Drawer, Menu, Popover, Tooltip, listbox) chỉ gắn vào <C>{"<body>"}</C> sau khi mount. Dialog mở sẵn (
            <C>defaultOpen</C>) xuất hiện sau hydrate — đừng đặt nội dung quan trọng cho SEO bên trong overlay.
          </li>
          <li>
            <C>Toaster</C> dùng một store phía client; <C>toast()</C> chỉ gọi trong event handler hoặc effect.
          </li>
          <li>
            Field, Input, Checkbox… sinh id bằng <C>useId</C> của React nên id ở server và client khớp nhau, <C>htmlFor</C> /{" "}
            <C>aria-describedby</C> không bị lệch.
          </li>
          <li>
            <C>useSyncExternalStore</C> của Toaster đã có snapshot cho server, không gây lỗi khi render SSR.
          </li>
          <li>
            Toaster của <C>withToaster</C> không có trong HTML từ server: nó nạp sau khi hydrate. Nút “…” của Breadcrumb và chip chú thích
            của StreamingMarkdown render ở server thành cùng một nút, rồi đổi sang component đầy đủ khi code của nó nạp xong, nên HTML hai
            phía khớp nhau. Xem{" "}
            <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/performance#on-demand")}>
              Hiệu năng
            </a>
            .
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="docs-only"
        title="Phần chỉ dành cho site docs"
        description="Một vài cơ chế bạn thấy trong repo là để dựng trang tài liệu, không cần trong ứng dụng."
      >
        <div className="flex flex-col gap-4">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>import.meta.glob</C> (API riêng của Vite) trong <C>src/docs/registry/index.ts</C>, <C>src/docs/concepts/index.ts</C> và{" "}
              <C>BlocksPage</C> chỉ để tự gom trang tài liệu. Component trong <C>src/components/ui</C> không dùng API nào của Vite, nên chạy
              được với webpack, Turbopack, Rspack.
            </li>
            <li>
              Import <C>?raw</C> để hiện mã nguồn Block cũng là của site docs.
            </li>
            <li>
              <C>useTheme()</C> trong <C>src/hooks</C> là hook của site docs; trong ứng dụng, dùng state của bạn + <C>YugenProvider</C>.
            </li>
          </ul>
          <MessageBar intent="success" title="Tóm lại:" className="max-w-3xl">
            chép <C>tokens.css</C>, <C>index.css</C>, <C>cn.ts</C>, <C>components/ui</C>; thêm <C>&quot;use client&quot;</C>; bọc layout bằng
            một client Providers chứa YugenProvider; thêm script chống nháy vào <C>{"<head>"}</C>.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
