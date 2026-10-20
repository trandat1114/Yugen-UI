import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { REGISTRY_URL } from "../install";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

const COMPONENTS_JSON = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}`;

const RESULT = `src/
  components/ui/Button/Button.tsx     # component bạn yêu cầu
  components/ui/Spinner/Spinner.tsx   # component nó import (tự kéo theo)
  lib/cn.ts                           # cn() đã dạy scale Yugen
  styles/yugen.css                    # token, @theme, utility, keyframes`;

const CSS = `/* src/index.css */
@import "tailwindcss";
@import "./styles/yugen.css";`;

const PROVIDER = `import { YugenProvider } from "@/components/ui/YugenProvider/YugenProvider";
import { Button } from "@/components/ui/Button/Button";

export default function App() {
  return (
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <Button appearance="primary">Xin chào</Button>
    </YugenProvider>
  );
}`;

const NAMESPACE = `{
  "registries": {
    "@yugen": "${REGISTRY_URL}/{name}.json"
  }
}`;

export default function Page() {
  return (
    <>
      <DocSection id="choose" title="npm hay chép mã nguồn">
        <div className="flex flex-col gap-M">
          <P>
            <strong className="font-semibold text-foreground-1">Gói npm</strong> (<C>npm install yugen-ui</C>) hợp khi bạn muốn nâng cấp
            bằng một lệnh và không sửa sâu component. <strong className="font-semibold text-foreground-1">shadcn CLI</strong> chép mã nguồn
            vào dự án: bạn sở hữu và sửa thoải mái từng dòng, đổi lại tự chịu trách nhiệm cập nhật. Hai cách dùng cùng token nên có thể
            kết hợp — ví dụ cài gói npm, rồi chép riêng một component cần tuỳ biến mạnh.
          </P>
          <P>
            Mỗi trang component có tab <C>shadcn CLI</C> trong mục Import với lệnh cài sẵn cho đúng component đó.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="setup"
        title="Chuẩn bị dự án"
        description="React 18 trở lên, Tailwind CSS v4 và alias @/* trỏ vào src — giống mọi dự án dùng shadcn/ui."
      >
        <div className="flex flex-col gap-L">
          <P>
            Dự án đã chạy <C>npx shadcn@latest init</C> thì bỏ qua bước này. Nếu chưa, tạo <C>components.json</C> ở thư mục gốc (ví dụ cho
            Vite; với Next.js App Router đặt <C>&quot;rsc&quot;: true</C> và <C>css</C> là <C>app/globals.css</C>):
          </P>
          <CodeBlock code={COMPONENTS_JSON} />
          <P>
            Thêm alias vào <C>tsconfig.json</C> (<C>&quot;paths&quot;: {"{"} &quot;@/*&quot;: [&quot;./src/*&quot;] {"}"}</C>) và vào
            bundler (Vite: <C>resolve.alias</C>).
          </P>
        </div>
      </DocSection>

      <DocSection id="add" title="Thêm component" description="CLI tải item, chép file, kéo theo component phụ thuộc và cài gói npm còn thiếu.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={`shadcn@latest add ${REGISTRY_URL}/button.json`} command="dlx" />
          <P>Kết quả (thư mục giữ nguyên cấu trúc của Yugen để import tương đối giữa các component vẫn chạy):</P>
          <CodeBlock code={RESULT} />
          <P>
            Cần tất cả? Dùng item <C>all</C>: <C>npx shadcn@latest add {REGISTRY_URL}/all.json</C>. Danh mục đầy đủ nằm ở{" "}
            <a className="text-link underline hover:text-link-hover" href={`${REGISTRY_URL}/registry.json`} target="_blank" rel="noreferrer">
              registry.json
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection id="theme" title="Bật theme Yugen" description="Làm một lần cho cả dự án.">
        <div className="flex flex-col gap-L">
          <P>
            Item <C>theme</C> (tự cài kèm component đầu tiên) tạo <C>styles/yugen.css</C>. Import nó ngay sau Tailwind trong file CSS
            chính, rồi bọc ứng dụng bằng <C>YugenProvider</C>:
          </P>
          <CodeBlock code={CSS} />
          <CodeBlock code={PROVIDER} />
        </div>
      </DocSection>

      <DocSection id="namespace" title="Registry có tên @yugen" description="Gõ ngắn hơn và cài nhiều component một lần.">
        <div className="flex flex-col gap-L">
          <P>
            Thêm khối <C>registries</C> vào <C>components.json</C>:
          </P>
          <CodeBlock code={NAMESPACE} />
          <PackageManagerTabs packages="shadcn@latest add @yugen/button @yugen/chart @yugen/sheet" command="dlx" />
        </div>
      </DocSection>

      <DocSection id="update" title="Cập nhật">
        <P>
          Mã đã chép là của bạn — CLI không tự cập nhật. Khi Yugen phát hành bản mới (xem trang <a className="text-link underline hover:text-link-hover" href="#/news">Có gì mới</a>),
          commit thay đổi của bạn trước, chạy lại lệnh <C>add</C> với <C>--overwrite</C>, rồi dùng diff của git để giữ lại phần đã tuỳ
          biến.
        </P>
      </DocSection>

      <DocSection id="notes" title="Lưu ý">
        <div className="flex max-w-3xl flex-col gap-M">
          <MessageBar intent="warning" title="Theme Yugen thay scale mặc định của Tailwind.">
            <C>yugen.css</C> tắt bảng màu, bo góc, bóng đổ và cỡ chữ mặc định (<C>bg-blue-500</C>, <C>rounded-lg</C>, <C>text-sm</C> không còn).
            Không nên trộn với theme mặc định của shadcn/ui trong cùng một ứng dụng.
          </MessageBar>
          <MessageBar intent="info" title="cn() riêng của Yugen.">
            Component import <C>cn</C> từ <C>@/lib/cn</C> (đã dạy scale Yugen cho tailwind-merge), không dùng <C>@/lib/utils</C> của
            shadcn.
          </MessageBar>
          <MessageBar intent="info" title={'Chỉ thị "use client".'}>
            Mỗi file component mở đầu bằng <C>&quot;use client&quot;</C> để dùng được trong Next.js App Router; với Vite hay CRA, dòng này
            vô hại.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
