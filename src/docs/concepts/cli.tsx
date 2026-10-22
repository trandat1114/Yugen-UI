import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { REGISTRY_URL } from "../install";
import {
  CLI_ADD,
  CLI_CONFIG,
  CLI_CREATE,
  CLI_DOCTOR,
  CLI_DOCTOR_OUTPUT,
  CLI_INIT,
  CLI_INIT_SOURCE,
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

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "whitespace-nowrap px-L py-M font-mono text-body1 text-foreground-1" : "px-L py-M text-foreground-2"}>
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

const SOURCE_RESULT = `yugen.json
src/
  index.css                           # thêm @import "./yugen.css"; sau @import "tailwindcss";
  yugen.css                           # theme
  lib/cn.ts
  components/ui/YugenProvider/…       # cùng Toast, Tooltip mà provider dùng
  components/ui/Button/Button.tsx     # từ yugen add`;

const ADD_MORE = `npx @yugen-ui/cli add select --dry-run    # in danh sách file sẽ ghi, không ghi gì
npx @yugen-ui/cli add --all               # mọi component
npx @yugen-ui/cli add button --overwrite  # ghi đè cả file bạn đã sửa
npx @yugen-ui/cli list grid               # tìm trong registry, ✓ là đã có trong dự án`;

const CI = `npx @yugen-ui/cli@latest create app -t starter -y --no-git
npx @yugen-ui/cli@latest add button dialog -y --no-install`;

export default function Page() {
  return (
    <>
      <DocSection id="commands" title="Các lệnh">
        <div className="flex flex-col gap-L">
          <Table
            head={["Lệnh", "Việc làm"]}
            rows={[
              ["create [dir]", "Tạo app từ template: starter, saas, blog, dashboard, ai-chat."],
              ["init", "Thiết lập dự án React có sẵn, dùng gói npm hoặc chép mã nguồn. Ghi yugen.json."],
              ["add <tên…>", "Chép component cùng các component phụ thuộc, cài gói npm còn thiếu."],
              ["list [từ khoá]", "Danh sách component trong registry."],
              ["doctor", "Kiểm tra React, Tailwind CSS v4, import theme, phiên bản yugen-ui và YugenProvider."],
            ]}
          />
          <P>
            Không cần cài trước: chạy bằng <C>npx @yugen-ui/cli@latest</C> (hoặc <C>pnpm dlx</C>, <C>yarn dlx</C>, <C>bunx</C>). Cần Node.js 22 trở lên.
          </P>
        </div>
      </DocSection>

      <DocSection id="create" title="Tạo app mới" description="Hỏi tên thư mục và template, chép file, cài phụ thuộc rồi chạy git init.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={CLI_CREATE} command="dlx" />
          <P>
            Tuỳ chọn: <C>-t, --template</C>, <C>--pm npm|pnpm|yarn|bun</C>, <C>--no-install</C>, <C>--no-git</C>, <C>--force</C> (ghi vào thư
            mục không trống). <C>npx create-yugen-ui@latest</C> là cách gọi ngắn của lệnh này. Template nằm sẵn trong gói nên không cần
            mạng. Xem trước ở <A href="#/templates">Templates</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="init"
        title="Thiết lập dự án có sẵn"
        description="Nhận diện Vite, Next.js, React Router hoặc TanStack Start, trình quản lý gói và file CSS chính, rồi hỏi cách dùng."
      >
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={CLI_INIT} command="dlx" />
          <Table
            head={["Chế độ", "CLI làm gì"]}
            rows={[
              [
                "package",
                <>
                  Cài <C>yugen-ui</C>, thêm <C>@import &quot;yugen-ui/theme.css&quot;;</C> ngay sau <C>@import &quot;tailwindcss&quot;;</C>.
                  Không có Tailwind CSS v4 thì thêm <C>import &quot;yugen-ui/styles.css&quot;;</C> vào file gốc (main.tsx, app/layout.tsx).
                </>,
              ],
              [
                "source",
                <>
                  Cần Tailwind CSS v4. Ghi theme thành <C>yugen.css</C> cạnh file CSS chính và import nó, chép <C>cn()</C> và{" "}
                  <C>YugenProvider</C> vào dự án.
                </>,
              ],
            ]}
          />
          <PackageManagerTabs packages={CLI_INIT_SOURCE} command="dlx" />
          <P>Kết quả ở chế độ source với dự án Vite có alias @/:</P>
          <CodeBlock code={SOURCE_RESULT} />
          <P>
            Import trong mã chép vào dùng alias của tsconfig (<C>@/*</C>, <C>~/*</C>) nếu có, không thì dùng đường dẫn tương đối, nên không phải
            sửa vite.config. Dòng <C>&quot;use client&quot;</C> chỉ được giữ với Next.js. Cuối cùng CLI in đoạn bọc{" "}
            <C>{"<YugenProvider applyToDocument withToaster>"}</C> kèm tên file cần sửa.
          </P>
        </div>
      </DocSection>

      <DocSection id="add" title="Thêm component" description="Chế độ source. Tên viết kiểu nào cũng được: data-grid, DataGrid.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={CLI_ADD} command="dlx" />
          <CodeBlock code={ADD_MORE} />
          <P>
            File đã có và khác registry (thường là bạn đã sửa) được giữ nguyên, CLI liệt kê chúng để bạn chạy lại với <C>--overwrite</C> khi
            muốn cập nhật. Commit trước rồi xem diff của git để giữ phần đã tuỳ biến.
          </P>
          <MessageBar intent="info" title="Ở chế độ package" className="max-w-3xl">
            Component đã có sẵn trong gói <C>yugen-ui</C>. Lệnh <C>add</C> chỉ in dòng import tương ứng.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="doctor" title="Kiểm tra cấu hình" description="Chỉ đọc, không sửa file. Thoát với mã 1 khi có lỗi, dùng được trong CI.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={CLI_DOCTOR} command="dlx" />
          <CodeBlock code={CLI_DOCTOR_OUTPUT} />
          <P>
            Các mục kiểm tra: React 18 trở lên, Tailwind CSS v4 khi dùng theme, theme được import đúng một lần và đứng sau{" "}
            <C>@import &quot;tailwindcss&quot;</C>, bản <C>yugen-ui</C> đã cài so với bản mới nhất trên npm, thư mục component và{" "}
            <C>cn.ts</C> ở chế độ source, có dùng <C>YugenProvider</C>.
          </P>
        </div>
      </DocSection>

      <DocSection id="config" title="yugen.json và registry">
        <div className="flex flex-col gap-L">
          <P>
            <C>init</C> ghi file này ở gốc dự án; <C>add</C>, <C>list</C> và <C>doctor</C> đọc nó. Có thể sửa tay, ví dụ đổi{" "}
            <C>paths.ui</C> để đặt component ở thư mục khác.
          </P>
          <CodeBlock code={CLI_CONFIG} />
          <P>
            Component lấy từ registry <C>{REGISTRY_URL}</C>, cùng nguồn với <A href="#/concepts/shadcn-registry">shadcn CLI</A>. Dự án đã
            chạy <C>shadcn init</C> với registry Yugen dùng được <C>yugen add</C> ngay vì CLI đọc <C>components.json</C>. Dùng registry khác
            hoặc thư mục local (<C>public/r</C> sau <C>npm run registry</C> khi phát triển Yugen) bằng <C>--registry</C> hoặc trường{" "}
            <C>registry</C> trong yugen.json.
          </P>
        </div>
      </DocSection>

      <DocSection id="options" title="Tuỳ chọn chung">
        <div className="flex flex-col gap-L">
          <Table
            head={["Tuỳ chọn", "Ý nghĩa"]}
            rows={[
              ["-y, --yes", "Không hỏi, dùng giá trị mặc định. Tự bật khi chạy trong CI hoặc không có terminal."],
              ["--cwd <dir>", "Chạy trong thư mục khác."],
              ["--no-install", "In lệnh cài gói thay vì chạy (init, add, create)."],
              ["--registry <url|dir>", "Registry khác mặc định (init, add, list)."],
              ["-h, --help", "Trợ giúp của từng lệnh."],
            ]}
          />
          <CodeBlock code={CI} />
        </div>
      </DocSection>
    </>
  );
}
