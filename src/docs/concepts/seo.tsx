import type { ReactNode } from "react";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
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

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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

const METADATA_CODE = `// app/pricing/page.tsx — Server Component
import type { Metadata } from "next";
import { Button, Card } from "yugen-ui";

export const metadata: Metadata = {
  title: "Bảng giá · Acme",
  description: "Ba gói cho nhóm từ 1 đến 500 người, dùng thử 14 ngày.",
  alternates: { canonical: "https://acme.vn/pricing" },
  openGraph: { title: "Bảng giá · Acme", images: ["/og/pricing.png"] },
};

export default function PricingPage() {
  return (
    <main>
      <h1 className="text-title1 font-semibold">Bảng giá</h1>
      {/* Card, Button… là client component nhưng vẫn render ra HTML ở server */}
    </main>
  );
}`;

const DYNAMIC_CODE = `// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return { title: \`\${post.title} · Acme\`, description: post.excerpt };
}`;

const LINKS_CODE = `import NextLink from "next/link";
import { Button, Link } from "yugen-ui";

// Link của Yugen là <a href> — bot đọc được.
<Link href="/docs">Tài liệu</Link>

// Dùng router của framework mà vẫn giữ giao diện Yugen: asChild.
<Link asChild>
  <NextLink href="/pricing">Bảng giá</NextLink>
</Link>

// Nút trông như Button nhưng là link điều hướng.
<Button appearance="primary" asChild>
  <NextLink href="/signup">Đăng ký</NextLink>
</Button>`;

const IMAGES_CODE = `import { Avatar, Image } from "yugen-ui";

<Image src="/team.jpg" alt="Nhóm sản phẩm Acme tại văn phòng Đà Nẵng" width={640} height={360} />
<Image src="/wave.svg" alt="" /> {/* ảnh trang trí: alt rỗng */}
<Avatar name="Nguyễn Minh Anh" src="/u/anh.jpg" /> {/* role="img", tên đọc là name */}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="server"
        title="Nội dung có trong HTML"
        description="Client component vẫn render ở server; thứ bot không thấy là nội dung chỉ xuất hiện sau tương tác."
      >
        <div className="flex flex-col gap-4">
          <P>
            Trong Next.js App Router, component có <C>&quot;use client&quot;</C> vẫn được render thành HTML ở server rồi mới hydrate. Văn bản
            trong Card, Table, Accordion… nằm sẵn trong HTML gửi về. Khác biệt nằm ở nội dung chỉ được tạo khi người dùng thao tác:
          </P>
          <Table
            head={["Component", "Có trong HTML ban đầu"]}
            rows={[
              ["Accordion", "Có — panel đóng vẫn được render (ẩn), bot đọc được."],
              ["Tabs", "Chỉ tab đang chọn. Nội dung quan trọng cho SEO nên đặt ở tab mặc định hoặc thành trang riêng."],
              ["Dialog, Drawer, Popover, Menu, Tooltip", "Không — render khi mở, qua portal. Đừng đặt nội dung chính ở đây."],
              ["Carousel", "Có — mọi slide nằm trong HTML."],
              ["DataGrid, Table", "Có, với dữ liệu có sẵn lúc render ở server (không phải dữ liệu tải sau ở client)."],
            ]}
          />
          <P>
            Cách dựng Next.js với Yugen ở trang <A href={docsPath("/concepts/ssr")}>Server-Side Rendering &amp; Next.js</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="metadata" title="Title và description" description="Mỗi trang một title và một description riêng, viết cho người đọc kết quả tìm kiếm.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={METADATA_CODE} />
          <P>Trang có nội dung động (bài viết, sản phẩm) dùng <C>generateMetadata</C>:</P>
          <CodeBlock code={DYNAMIC_CODE} />
          <P>
            Vite (SPA) không có metadata theo trang ở server. Trang cần lên kết quả tìm kiếm thì prerender lúc build hoặc dùng framework có SSR;
            template Blog của <C>create-yugen-ui</C> ghi sẵn title, description và Open Graph cho từng bài lúc build.
          </P>
        </div>
      </DocSection>

      <DocSection id="headings" title="Cấu trúc tiêu đề" description="Một h1 cho mỗi trang, các cấp tiếp theo không nhảy bậc.">
        <div className="flex flex-col gap-4">
          <P>
            Cỡ chữ và cấp tiêu đề là hai việc riêng: chọn thẻ theo cấu trúc (<C>h1</C>–<C>h3</C>), chọn cỡ bằng type ramp (
            <C>text-title1</C>, <C>text-subtitle1</C>). Một số component tự render thẻ tiêu đề:
          </P>
          <Table
            head={["Component", "Thẻ"]}
            rows={[
              ["DialogTitle", <C key="c">h2</C>],
              ["DrawerHeaderTitle", <C key="c">h2</C>],
              ["EmptyTitle", <C key="c">h3</C>],
              ["Card, CardHeader", "Không tự tạo thẻ tiêu đề — tự đặt h2 / h3 phù hợp vị trí."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="links" title="Link bot đọc được" description="Điều hướng bằng thẻ a có href; không dùng onClick trên nút để chuyển trang.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={LINKS_CODE} />
          <P>
            <C>asChild</C> giữ class và trạng thái focus của Yugen nhưng để framework render thẻ <C>a</C> (prefetch, chuyển trang phía client).
            Bot chỉ đi theo <C>href</C>, nên <C>{"<Button onClick={() => router.push(...)}>"}</C> là một trang không ai tìm thấy.
          </P>
        </div>
      </DocSection>

      <DocSection id="images" title="Ảnh và avatar" description="alt mô tả nội dung ảnh; ảnh trang trí để alt rỗng.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={IMAGES_CODE} />
          <P>
            Đặt <C>width</C> và <C>height</C> (hoặc khung <C>AspectRatio</C>) để trình duyệt giữ chỗ trước khi ảnh tải xong, tránh nhảy bố cục
            (CLS). Nút chỉ có icon cần <C>aria-label</C>; đó cũng là chữ duy nhất bot đọc được ở nút đó.
          </P>
        </div>
      </DocSection>

      <DocSection id="checklist" title="Kiểm tra trước khi phát hành">
        <DoDont
          dos={[
            "Mỗi trang có title và description riêng, canonical khi một nội dung có nhiều URL.",
            "Nội dung chính nằm trong HTML ban đầu, không ẩn sau Tabs khác tab mặc định, Dialog hay Popover.",
            "Một h1, các cấp tiêu đề theo thứ tự; mọi ảnh có alt.",
            "Điều hướng bằng a href (Link, hoặc asChild với link của framework).",
          ]}
          donts={[
            "Chuyển trang bằng onClick trên Button.",
            "Chọn thẻ tiêu đề theo cỡ chữ muốn có.",
            "Để alt trống cho ảnh có nội dung, hoặc nhồi từ khoá vào alt.",
          ]}
        />
      </DocSection>
    </>
  );
}
