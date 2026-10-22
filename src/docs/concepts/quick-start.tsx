import type { ReactNode } from "react";
import { Open16Regular, Rocket16Regular } from "@fluentui/react-icons";
import {
  Button,
  Field,
  Input,
  MessageBar,
  PackageManagerTabs,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { templateStackBlitzUrl } from "../templates";
import {
  CSS_PRECOMPILED,
  CSS_TAILWIND,
  PROVIDER_NEXT,
  PROVIDER_VITE,
  SHADCN_ADD,
  SHADCN_INIT,
  TEMPLATE_COMMAND,
} from "./_snippets";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

/** Các bước đánh số — mỗi bước một tiêu đề h3 và nội dung. */
function Steps({ items }: { items: { title: ReactNode; body: ReactNode }[] }) {
  return (
    <ol className="flex max-w-4xl flex-col gap-XL">
      {items.map((s, i) => (
        <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-M">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-circular bg-brand-background-2 text-body1 font-semibold text-brand-foreground-2"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-S pt-XS">
            <h3 className="text-subtitle2 font-semibold text-foreground-1">{s.title}</h3>
            {s.body}
          </div>
        </li>
      ))}
    </ol>
  );
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

const FIRST = `import { Button, Field, Input, toast } from "yugen-ui";

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

const PERSIST = `// src/App.tsx — nhớ theme người dùng chọn
import * as React from "react";
import { YugenProvider, type YugenTheme } from "yugen-ui";

const STORAGE_KEY = "yugen-ui-theme";

// Script trong index.html đã đặt data-theme trước khi React chạy — đọc lại cho khớp.
const initialTheme = (): YugenTheme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

export default function App() {
  const [theme, setTheme] = React.useState(initialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage bị chặn */
    }
  }, [theme]);

  return (
    <YugenProvider applyToDocument withToaster theme={theme}>
      <AppShell onThemeChange={setTheme} />
    </YugenProvider>
  );
}`;

const HTML = `<!-- index.html — đặt TRƯỚC script của ứng dụng -->
<script>
  (function () {
    var t;
    try { t = localStorage.getItem("yugen-ui-theme"); } catch (e) {}
    if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
  })();
</script>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="template"
        title="Nhanh nhất: một lệnh"
        description="Tải template, cài phụ thuộc và chạy dev server — không cần cấu hình gì thêm."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={TEMPLATE_COMMAND} />
          <P>
            Lệnh trên tạo dự án starter: theme đã ghi nhớ, toast, alias <C>@/</C>, SEO cơ bản và một trang chào để xoá khi bắt đầu viết.
            Cần nhiều hơn? Đổi <C>vite-starter</C> thành <C>vite-saas</C> (ứng dụng SaaS 8 trang), <C>vite-blog</C> (blog Markdown),{" "}
            <C>vite-dashboard</C> hoặc <C>vite-ai-chat</C> — xem trước tất cả ở trang Templates. Không muốn cài gì? Mở thẳng trên
            StackBlitz. Muốn chọn template từ danh sách? Dùng <A href="#/concepts/cli">CLI yugen</A>: <C>npx @yugen-ui/cli@latest create</C>.
          </P>
          <div className="flex flex-wrap gap-S">
            <Button asChild appearance="primary" icon={<Rocket16Regular />}>
              <a href="#/templates">Xem các template</a>
            </Button>
            <Button asChild icon={<Open16Regular />}>
              <a href={templateStackBlitzUrl("vite-starter")} target="_blank" rel="noreferrer">
                Mở trên StackBlitz
              </a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="existing" title="Thêm vào dự án có sẵn" description="React 18+ và Tailwind CSS v4 — ba bước, không cần alias hay cấu hình bundler.">
        <Steps
          items={[
            {
              title: "Cài gói",
              body: (
                <>
                  <PackageManagerTabs packages="yugen-ui" />
                  <P>Mọi primitive Radix, icon Fluent và helper đều là dependency của gói — không cần cài thêm gì.</P>
                </>
              ),
            },
            {
              title: "Thêm theme vào CSS",
              body: (
                <>
                  <CodeBlock code={CSS_TAILWIND} />
                  <P>
                    Không dùng Tailwind? Bỏ dòng trên và import bản CSS biên dịch sẵn (preflight + token + mọi utility component cần):
                  </P>
                  <CodeBlock code={CSS_PRECOMPILED} />
                </>
              ),
            },
            {
              title: "Bọc ứng dụng bằng YugenProvider",
              body: (
                <>
                  <Tabs defaultValue="vite" className="flex flex-col gap-S">
                    <TabsList aria-label="Framework">
                      <TabsTrigger value="vite">Vite</TabsTrigger>
                      <TabsTrigger value="next">Next.js</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vite">
                      <CodeBlock code={PROVIDER_VITE} />
                    </TabsContent>
                    <TabsContent value="next">
                      <CodeBlock code={PROVIDER_NEXT} />
                    </TabsContent>
                  </Tabs>
                  <P>
                    <C>applyToDocument</C> ghi theme lên <C>{"<html>"}</C> để Dialog, Menu, Tooltip (render qua portal) cũng đúng màu;{" "}
                    <C>withToaster</C> để gọi <C>toast()</C> ở bất kỳ đâu. Xong — thử ngay với component đầu tiên bên dưới.
                  </P>
                </>
              ),
            },
          ]}
        />
      </DocSection>

      <DocSection
        id="shadcn"
        title="Muốn sở hữu mã nguồn?"
        description="shadcn CLI chép component vào dự án để bạn sửa từng dòng — hai lệnh, CLI tự lo components.json, theme và gói npm."
      >
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={SHADCN_INIT} command="dlx" />
          <PackageManagerTabs packages={SHADCN_ADD} command="dlx" />
          <P>
            Dự án Next.js dùng <C>init-next.json</C>. Chi tiết, kết quả và cách cập nhật ở trang{" "}
            <A href="#/concepts/shadcn-registry">Cài bằng shadcn CLI</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="first-component" title="Component đầu tiên" description="Field gắn nhãn, gợi ý và aria-* cho Input; toast() hiện phản hồi ngắn sau khi gửi.">
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <NewsletterForm />
          </div>
          <CodeBlock code={FIRST} />
        </div>
      </DocSection>

      <DocSection
        id="persist-theme"
        title="Nhớ theme & chống nháy (tuỳ chọn)"
        description="Template đã làm sẵn phần này. Tự dựng thì cần hai mảnh: state lưu lựa chọn và script nhỏ đặt theme trước khi trang hiện."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={PERSIST} />
          <P>
            <C>YugenProvider</C> ghi attribute trong <C>useEffect</C> (sau lần vẽ đầu), nên thêm script vào <C>{"<head>"}</C> để không chớp
            nền trắng khi người dùng đã chọn theme tối. Với Next.js, xem <A href="#/concepts/ssr">SSR & Next.js</A>.
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Giữ cùng một khoá localStorage." className="max-w-3xl">
            Script và ứng dụng phải đọc / ghi cùng khoá (ví dụ <C>yugen-ui-theme</C>) và cùng tập giá trị, nếu không theme sẽ nhảy sau khi
            React chạy.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="requirements" title="Yêu cầu">
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Công nghệ", "Phiên bản", "Ghi chú"]}
            rows={[
              ["React", "18.3+", "Tương thích React 19."],
              ["Tailwind CSS", "4.x", <>Không bắt buộc nếu dùng <C>yugen-ui/styles.css</C>. Tailwind 3 không được hỗ trợ.</>],
              ["Bundler", "Vite 6, Next.js 14+", <>Vite dùng <C>@tailwindcss/vite</C>; Next.js dùng <C>@tailwindcss/postcss</C>.</>],
              ["TypeScript", "5.x", "Không bắt buộc — gói đã kèm kiểu."],
              ["Node.js", "18+", "Theo yêu cầu của Vite 6 và Tailwind 4."],
            ]}
          />
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
