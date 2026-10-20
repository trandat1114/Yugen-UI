import type { ReactNode } from "react";
import { Button, Field, Input, MessageBar, toast } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-L py-M font-semibold text-foreground-1" : "px-L py-M text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const INSTALL = `# Phụ thuộc runtime
npm install @fluentui/react-icons class-variance-authority clsx tailwind-merge \\
  cmdk react-day-picker react-resizable-panels \\
  @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox \\
  @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog \\
  @radix-ui/react-direction @radix-ui/react-dropdown-menu @radix-ui/react-hover-card \\
  @radix-ui/react-menubar @radix-ui/react-popover @radix-ui/react-radio-group \\
  @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-slider \\
  @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast \\
  @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Công cụ build
npm install -D tailwindcss @tailwindcss/vite`;

const TREE = `src/
  styles/tokens.css        # Global + Alias token, brand, theme — chép nguyên file
  index.css                # @import tailwindcss + tokens, tắt scale mặc định, @theme bridge
  lib/cn.ts                # cn() = clsx + tailwind-merge đã dạy scale Yugen
  components/ui/
    index.ts               # barrel — export theo nhóm
    YugenProvider/YugenProvider.tsx
    Button/Button.tsx
    Field/Field.tsx
    ...                    # chỉ cần chép những thư mục bạn dùng`;

const VITE = `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});`;

const TSCONFIG = `// tsconfig.app.json (hoặc tsconfig.json)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}`;

const MAIN = `// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`;

const APP = `// src/App.tsx
import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";

const STORAGE_KEY = "yugen-ui-theme";

function initialTheme(): YugenTheme {
  // Script trong index.html đã đặt data-theme trước khi React chạy — đọc lại cho khớp.
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = React.useState<YugenTheme>(initialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage bị chặn */
    }
  }, [theme]);

  return (
    <YugenProvider applyToDocument withToaster theme={theme} brand="sakura" dir="ltr">
      <AppShell onThemeChange={setTheme} />
    </YugenProvider>
  );
}`;

const HTML = `<!-- index.html — đặt TRƯỚC script của ứng dụng -->
<head>
  <script>
    (function () {
      var t;
      try { t = localStorage.getItem("yugen-ui-theme"); } catch (e) {}
      if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", t);
    })();
  </script>
</head>`;

const FIRST = `import { Button, Field, Input, toast } from "@/components/ui";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-M"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Đã đăng ký", body: "Hẹn gặp bạn ở số bản tin tiếp theo." });
      }}
    >
      <Field label="Email" hint="Mỗi tháng một thư, huỷ bất cứ lúc nào." required>
        <Input type="email" placeholder="ban@vidu.vn" />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Đăng ký
      </Button>
    </form>
  );
}`;

function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-M"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Đã đăng ký", body: "Hẹn gặp bạn ở số bản tin tiếp theo." });
      }}
    >
      <Field label="Email" hint="Mỗi tháng một thư, huỷ bất cứ lúc nào." required>
        <Input type="email" placeholder="ban@vidu.vn" />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Đăng ký
      </Button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <DocSection id="requirements" title="Yêu cầu">
        <SimpleTable
          head={["Công nghệ", "Phiên bản", "Ghi chú"]}
          rows={[
            ["React", "18.3+", "Tương thích React 19. Component dùng forwardRef, useId, useSyncExternalStore."],
            ["TypeScript", "5.x", "Khuyến nghị strict. Mọi prop đều có kiểu, không cần @types riêng."],
            ["Tailwind CSS", "4.x", <>Cấu hình CSS-first (<C>@theme</C>, <C>@utility</C>), không có tailwind.config.js. Tailwind 3 không được hỗ trợ.</>],
            ["Bundler", "Vite 6 hoặc Next.js 14+", <>Vite dùng <C>@tailwindcss/vite</C>; Next.js dùng <C>@tailwindcss/postcss</C> (xem trang SSR & Next.js).</>],
            ["Node.js", "18+", "Theo yêu cầu của Vite 6 và Tailwind 4."],
          ]}
        />
      </DocSection>

      <DocSection
        id="install"
        title="Cài phụ thuộc"
        description="Danh sách dưới đây là đủ cho toàn bộ thư viện. Nếu chỉ chép vài component, chỉ cần primitive Radix mà các file đó import."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={INSTALL} />
          <P>
            <C>@radix-ui/react-direction</C> là bắt buộc vì <C>YugenProvider</C> bọc <C>DirectionProvider</C> cho hướng chữ RTL;{" "}
            <C>@radix-ui/react-slot</C> cung cấp <C>asChild</C> cho Button, Link, Breadcrumb, Nav.
          </P>
        </div>
      </DocSection>

      <DocSection id="copy" title="Chép mã nguồn" description="Yugen UI không phải package npm — mã nguồn nằm trong dự án của bạn, sửa tuỳ ý.">
        <div className="flex flex-col gap-L">
          <CodeBlock code={TREE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              <C>tokens.css</C> và <C>index.css</C> phải đi cùng nhau: <C>index.css</C> tắt palette mặc định của Tailwind và nối token
              Fluent sang utility (<C>bg-background-1</C>, <C>p-M</C>, <C>text-body1</C>…).
            </li>
            <li>
              Một số component dùng lại nhau: <C>Dropdown</C> cần <C>Popover</C> + <C>Select</C>, <C>SplitButton</C> cần <C>Button</C> +{" "}
              <C>Menu</C>, <C>YugenProvider</C> cần <C>Tooltip</C> + <C>Toast</C>. Đọc dòng import đầu file để biết cần chép gì.
            </li>
            <li>
              Nếu đổi tên thư mục, cập nhật alias <C>@/</C> hoặc đường dẫn import tương ứng.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="config" title="Cấu hình Vite & alias @/" description="Mọi file component import bằng alias @/ — cần khai báo ở cả Vite và TypeScript.">
        <div className="flex flex-col gap-L">
          <CodeBlock code={VITE} />
          <CodeBlock code={TSCONFIG} />
          <CodeBlock code={MAIN} />
        </div>
      </DocSection>

      <DocSection
        id="provider"
        title="YugenProvider & chống nháy theme"
        description="Bọc toàn bộ ứng dụng một lần. applyToDocument ghi data-theme / data-brand / dir lên <html> để cả portal (Dialog, Menu, Tooltip) cũng đúng theme."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={APP} />
          <P>
            <C>withToaster</C> gắn sẵn <C>{"<Toaster />"}</C> để gọi <C>toast()</C> ở bất kỳ đâu; <C>TooltipProvider</C> được gắn mặc
            định (<C>withTooltipProvider</C>). Chi tiết từng prop ở trang <a className="text-link underline hover:text-link-hover" href="#/concepts/theming">Theming</a>.
          </P>
          <P>
            Vì <C>YugenProvider</C> ghi attribute trong <C>useEffect</C> (sau lần vẽ đầu), hãy thêm script nhỏ vào <C>{"<head>"}</C> để đặt
            theme trước khi trang hiển thị — tránh chớp nền trắng khi người dùng đã chọn theme tối:
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Giữ cùng một khoá localStorage." className="max-w-3xl">
            Script và ứng dụng phải đọc / ghi cùng khoá (ví dụ <C>yugen-ui-theme</C>) và cùng tập giá trị, nếu không theme sẽ nhảy sau khi
            React chạy.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="first-component" title="Component đầu tiên" description="Field gắn nhãn, gợi ý và aria-* cho Input; toast() hiện phản hồi ngắn sau khi gửi.">
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <NewsletterForm />
          </div>
          <CodeBlock code={FIRST} />
          <P>Bước tiếp theo:</P>
          <div className="flex flex-wrap gap-S">
            <Button asChild>
              <a href="#/concepts/styling">Tuỳ biến style</a>
            </Button>
            <Button asChild>
              <a href="#/concepts/theming">Theming</a>
            </Button>
            <Button asChild>
              <a href="#/concepts/accessibility">Khả năng tiếp cận</a>
            </Button>
          </div>
        </div>
      </DocSection>
    </>
  );
}
