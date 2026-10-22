import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { REGISTRY_URL } from "../install";
import { NAMESPACE, SHADCN_ADD, SHADCN_EXISTING, SHADCN_INIT, SHADCN_INIT_NEXT } from "./_snippets";

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

const RESULT = `components.json                       # tạo mới nếu chưa có
src/
  styles/yugen.css                    # theme — đã tự @import vào src/index.css
  lib/cn.ts                           # cn() đã dạy scale Yugen
  components/ui/YugenProvider/…       # provider + Tooltip, Toast mà nó dùng
  components/ui/Button/Button.tsx     # component từ lệnh add (giữ thư mục để import tương đối chạy)
  components/ui/Dialog/Dialog.tsx`;

const PROVIDER = `import { YugenProvider } from "@/components/ui/YugenProvider/YugenProvider";
import { Button } from "@/components/ui/Button/Button";

export default function App() {
  return (
    <YugenProvider applyToDocument withToaster>
      <Button appearance="primary">Xin chào</Button>
    </YugenProvider>
  );
}`;

const ALIAS = `// tsconfig.json (và tsconfig.app.json nếu có)
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }

// vite.config.ts
import path from "node:path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});`;

export default function Page() {
  return (
    <>
      <DocSection id="choose" title="npm hay chép mã nguồn">
        <div className="flex flex-col gap-M">
          <P>
            <strong className="font-semibold text-foreground-1">Gói npm</strong> (<C>npm install yugen-ui</C>) hợp khi bạn muốn nâng cấp
            bằng một lệnh và ít sửa component. <strong className="font-semibold text-foreground-1">shadcn CLI</strong> chép mã nguồn vào dự
            án để bạn sửa trực tiếp, đổi lại bạn tự cập nhật khi có bản mới. Hai cách dùng chung token nên có thể kết hợp.
          </P>
          <MessageBar intent="info" title="Cách ngắn hơn: @yugen-ui/cli" className="max-w-3xl">
            <C>npx @yugen-ui/cli@latest init --mode source</C> rồi <C>npx @yugen-ui/cli add button</C> chép cùng mã nguồn từ cùng registry, gõ tên ngắn,
            không cần components.json hay alias <C>@/</C>. Chi tiết ở trang <A href="#/concepts/cli">@yugen-ui/cli</A>. Trang này dành cho dự
            án đã dùng shadcn CLI.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="init"
        title="Khởi tạo — một lần cho mỗi dự án"
        description="Dự án React có Tailwind CSS v4. Một lệnh tạo components.json (nếu chưa có), chép theme + cn() + YugenProvider, cài gói npm và tự thêm @import vào file CSS chính."
      >
        <div className="flex flex-col gap-L">
          <Tabs defaultValue="vite" className="flex flex-col gap-S">
            <TabsList aria-label="Framework">
              <TabsTrigger value="vite">Vite · TanStack Start</TabsTrigger>
              <TabsTrigger value="next">Next.js · React Router</TabsTrigger>
            </TabsList>
            <TabsContent value="vite" className="flex flex-col gap-S">
              <PackageManagerTabs packages={SHADCN_INIT} command="dlx" />
              <P>
                Theme nằm ở <C>src/styles/yugen.css</C>, import vào <C>src/index.css</C>.
              </P>
            </TabsContent>
            <TabsContent value="next" className="flex flex-col gap-S">
              <PackageManagerTabs packages={SHADCN_INIT_NEXT} command="dlx" />
              <P>
                Theme nằm cạnh file CSS chính (<C>app/yugen.css</C> hoặc <C>src/app/yugen.css</C>), import vào <C>globals.css</C>.
              </P>
            </TabsContent>
          </Tabs>
          <P>
            Item <C>init</C> là style <C>extends: &quot;none&quot;</C>: CLI không cài style mặc định của shadcn/ui (biến màu, font, icon
            lucide), nên CSS của bạn chỉ có Tailwind và theme Yugen. Sau đó bọc ứng dụng một lần:
          </P>
          <CodeBlock code={PROVIDER} />
          <MessageBar intent="info" title="CLI báo thiếu import alias?" className="max-w-3xl">
            Dự án Vite tạo bằng <C>npm create vite</C> chưa có alias <C>@/*</C>. Thêm vào tsconfig và vite.config rồi chạy lại lệnh:
          </MessageBar>
          <CodeBlock code={ALIAS} />
        </div>
      </DocSection>

      <DocSection id="add" title="Thêm component" description="CLI tải item, chép file, kéo theo component phụ thuộc và cài gói npm còn thiếu.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={SHADCN_ADD} command="dlx" />
          <P>Kết quả sau init + add (thư mục giữ nguyên cấu trúc của Yugen để import tương đối giữa các component vẫn chạy):</P>
          <CodeBlock code={RESULT} />
          <P>
            Mỗi trang component có tab <C>shadcn CLI</C> trong mục Import với lệnh cho đúng component đó. Cần tất cả? Dùng item{" "}
            <C>all</C>: <C>npx shadcn@latest add {REGISTRY_URL}/all.json</C>. Danh mục đầy đủ ở{" "}
            <a className="text-link underline hover:text-link-hover" href={`${REGISTRY_URL}/registry.json`} target="_blank" rel="noreferrer">
              registry.json
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection id="namespace" title="Registry có tên @yugen" description="Gõ ngắn hơn khi thêm nhiều component (tuỳ chọn).">
        <div className="flex flex-col gap-L">
          <P>
            Thêm khối <C>registries</C> vào <C>components.json</C>:
          </P>
          <CodeBlock code={NAMESPACE} />
          <PackageManagerTabs packages="shadcn@latest add @yugen/button @yugen/chart @yugen/sheet" command="dlx" />
        </div>
      </DocSection>

      <DocSection id="existing" title="Dự án đã dùng shadcn/ui">
        <div className="flex flex-col gap-L">
          <P>
            Không cần chạy lại <C>init</C> — thêm item theme cùng component đầu tiên (Next.js dùng <C>theme-next.json</C>):
          </P>
          <PackageManagerTabs packages={SHADCN_EXISTING} command="dlx" />
          <MessageBar intent="warning" title="Theme Yugen thay scale mặc định của Tailwind." className="max-w-3xl">
            <C>yugen.css</C> tắt bảng màu, bo góc, bóng đổ và cỡ chữ mặc định (<C>bg-blue-500</C>, <C>rounded-lg</C>, <C>text-sm</C> không còn).
            Component shadcn/ui cũ dùng các class đó sẽ mất style — nên chuyển dần (xem <A href="#/concepts/migration-shadcn">Từ shadcn/ui</A>)
            thay vì trộn hai theme lâu dài.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="update" title="Cập nhật">
        <P>
          Mã đã chép là của bạn — CLI không tự cập nhật. Khi Yugen phát hành bản mới (xem trang <A href="#/news">Có gì mới</A>), commit thay
          đổi của bạn trước, chạy lại lệnh <C>add</C> với <C>--overwrite</C>, rồi dùng diff của git để giữ lại phần đã tuỳ biến.
        </P>
      </DocSection>

      <DocSection id="notes" title="Lưu ý">
        <div className="flex max-w-3xl flex-col gap-M">
          <MessageBar intent="info" title="cn() riêng của Yugen.">
            Component import <C>cn</C> từ <C>@/lib/cn</C> (đã dạy scale Yugen cho tailwind-merge), không dùng <C>@/lib/utils</C> của
            shadcn.
          </MessageBar>
          <MessageBar intent="info" title={'Chỉ thị "use client".'}>
            Mỗi file component mở đầu bằng <C>&quot;use client&quot;</C> để dùng được trong Next.js App Router; với Vite, dòng này vô hại.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
