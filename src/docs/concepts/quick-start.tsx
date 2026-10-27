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
  CLI_ADD,
  CLI_INIT,
  CLI_INIT_SOURCE,
  CSS_PRECOMPILED,
  CSS_TAILWIND,
  PROVIDER_NEXT,
  PROVIDER_VITE,
  TEMPLATE_COMMAND,
} from "./_snippets";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
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
    <ol className="flex max-w-4xl flex-col gap-5">
      {items.map((s, i) => (
        <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-circular bg-brand-background-2 text-body1 font-semibold text-brand-foreground-2"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-2 pt-1">
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
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
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
      className="flex w-full max-w-sm flex-col gap-3"
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
      className="flex w-full max-w-sm flex-col gap-3"
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
        description="CLI chép template, cài phụ thuộc rồi chạy dev server. Không cần cấu hình gì thêm."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={TEMPLATE_COMMAND} />
          <P>
            Dự án starter có sẵn: lưu theme người dùng chọn, toast, alias <C>@/</C>, SEO cơ bản và một trang chào để xoá khi bắt đầu.
            Đổi <C>starter</C> thành <C>saas</C> (ứng dụng SaaS 8 trang), <C>blog</C> (blog Markdown), <C>dashboard</C>, <C>ai-chat</C>,{" "}
            <C>glass</C> (nhật ký du lịch với điều hướng glass), <C>admin</C> (trang quản trị: bảng, form, đăng nhập) hoặc{" "}
            <C>next-starter</C> (Next.js App Router), hoặc bỏ <C>--template</C> để chọn trong terminal. Các tuỳ chọn khác ở <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A>.
          </P>
          <div className="flex flex-wrap gap-2">
            <Button asChild appearance="primary" icon={<Rocket16Regular />}>
              <a href={docsPath("/templates")}>Xem các template</a>
            </Button>
            <Button asChild icon={<Open16Regular />}>
              <a href={templateStackBlitzUrl("vite-starter")} target="_blank" rel="noreferrer">
                Mở trên StackBlitz
              </a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="existing" title="Thêm vào dự án có sẵn" description="React 19 (hoặc 18.3) và Tailwind CSS v4. Không cần alias hay cấu hình bundler.">
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_INIT} command="dlx" />
          <P>
            Chọn <C>package</C> khi được hỏi: CLI cài <C>yugen-ui</C>, thêm dòng theme vào file CSS chính (hoặc <C>styles.css</C> nếu
            không có Tailwind v4) và in đoạn bọc <C>YugenProvider</C> kèm tên file cần sửa. Muốn tự làm thì theo ba bước dưới đây.
          </P>
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
                  <Tabs defaultValue="vite" className="flex flex-col gap-2">
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
        </div>
      </DocSection>

      <DocSection
        id="shadcn"
        title="Cần tuỳ biến sâu?"
        description="Chép mã nguồn component vào dự án để sửa trực tiếp, thay vì dùng bản dựng sẵn trong gói npm. Chạy init một lần, sau đó add từng component."
      >
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_INIT_SOURCE} command="dlx" />
          <PackageManagerTabs packages={CLI_ADD} command="dlx" />
          <P>
            CLI ghi theme, <C>cn()</C> và <C>YugenProvider</C>, chép kèm component phụ thuộc, cài gói npm còn thiếu và đổi import theo alias
            của dự án. Chi tiết ở <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A>. Dự án đã dùng shadcn CLI thì xem{" "}
            <A href={docsPath("/concepts/shadcn-registry")}>Cài bằng shadcn CLI</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="first-component" title="Component đầu tiên" description="Field gắn nhãn, gợi ý và aria-* cho Input; toast() hiện phản hồi ngắn sau khi gửi.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
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
        <div className="flex flex-col gap-4">
          <CodeBlock code={PERSIST} />
          <P>
            <C>YugenProvider</C> ghi attribute trong <C>useEffect</C> (sau lần vẽ đầu), nên thêm script vào <C>{"<head>"}</C> để không chớp
            nền trắng khi người dùng đã chọn theme tối. Với Next.js, xem <A href={docsPath("/concepts/ssr")}>SSR & Next.js</A>.
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Giữ cùng một khoá localStorage." className="max-w-3xl">
            Script và ứng dụng phải đọc / ghi cùng khoá (ví dụ <C>yugen-ui-theme</C>) và cùng tập giá trị, nếu không theme sẽ nhảy sau khi
            React chạy.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="requirements" title="Yêu cầu">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Công nghệ", "Phiên bản", "Ghi chú"]}
            rows={[
              ["React", "19 (khuyên dùng), 18.3", "React 18 vẫn được hỗ trợ; ngày ngừng sẽ báo trước ở Có gì mới."],
              ["Tailwind CSS", "4.x", <>Không bắt buộc nếu dùng <C>yugen-ui/styles.css</C>. Tailwind 3 không được hỗ trợ.</>],
              ["Bundler", "Vite 6, Next.js 14+", <>Vite dùng <C>@tailwindcss/vite</C>; Next.js dùng <C>@tailwindcss/postcss</C>.</>],
              ["TypeScript", "5.x", "Không bắt buộc — gói đã kèm kiểu."],
              ["Node.js", "18+", "Theo yêu cầu của Vite 6 và Tailwind 4."],
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={docsPath("/concepts/styling")}>Tuỳ biến style</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/concepts/theming")}>Theming</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/concepts/accessibility")}>Khả năng tiếp cận</a>
            </Button>
          </div>
        </div>
      </DocSection>
    </>
  );
}
