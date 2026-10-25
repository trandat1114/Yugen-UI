import type { ReactNode } from "react";
import { Accessibility24Regular, Code24Regular, DarkTheme24Regular, Layer24Regular } from "@fluentui/react-icons";
import { Button, MessageBar } from "@/components/ui";
import { DocSection } from "../blocks";
import { AuthorLink } from "../AuthorLink";
import { COMPONENTS_META } from "../registry";
import { SITE } from "../site";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      className="text-link underline hover:text-link-hover"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">
      {children}
    </span>
  );
}

const INCLUDED = [
  {
    href: "/components/button",
    title: `${COMPONENTS_META.length} component`,
    body: "Mỗi trang có ví dụ chạy thật, hướng dẫn dùng và bảng props. Nhóm Yugen Labs có thêm biểu đồ, giao diện chat AI, Trace và Sheet.",
  },
  {
    href: "/blocks",
    title: "Blocks",
    body: "Màn hình mẫu ghép từ component: đăng nhập, bảng số liệu, đặt lịch… Chép nguyên file vào dự án.",
  },
  {
    href: "/templates",
    title: "Templates",
    body: "Ứng dụng mẫu tạo bằng một lệnh: starter, SaaS, blog, dashboard, AI chat.",
  },
  {
    href: "/theme-designer",
    title: "Theme Designer",
    body: "Tạo màu thương hiệu từ một mã màu, kiểm tra tương phản và xuất token.",
  },
];

const WAYS: { way: string; command: string; when: string; update: ReactNode }[] = [
  { way: "Gói npm", command: "npm i yugen-ui", when: "Dùng ngay, ít sửa component.", update: <C>npm update yugen-ui</C> },
  {
    way: "@yugen-ui/cli",
    command: "npx @yugen-ui/cli add button",
    when: "Cần sửa mã nguồn component trong dự án.",
    update: (
      <>
        Chạy lại <C>add --overwrite</C> rồi xem diff
      </>
    ),
  },
  {
    way: "shadcn CLI",
    command: "npx shadcn@latest add …",
    when: "Dự án đã dùng shadcn/ui.",
    update: (
      <>
        Chạy lại <C>add</C> như với shadcn/ui
      </>
    ),
  },
];

const PRINCIPLES = [
  {
    icon: <Layer24Regular />,
    title: "Token ba lớp",
    body: "Giá trị gốc → vai trò → class Tailwind. Component chỉ dùng class, nên đổi theme là đổi token, không phải sửa component.",
  },
  {
    icon: <Accessibility24Regular />,
    title: "Tiếp cận được",
    body: "Dùng được bằng bàn phím và trình đọc màn hình, viền focus rõ, chữ đạt tương phản 4.5:1, không chỉ dựa vào màu để báo trạng thái.",
  },
  {
    icon: <DarkTheme24Regular />,
    title: "Theme đặt bằng attribute",
    body: "data-theme, data-brand và dir đặt ở <html> cho cả ứng dụng, hoặc cho từng vùng qua YugenProvider.",
  },
  {
    icon: <Code24Regular />,
    title: "Ví dụ chép là chạy",
    body: "Ví dụ trên trang component được kiểm tra kiểu tự động khi import từ yugen-ui.",
  },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="what"
        title="Yugen UI là gì?"
        description="幽玄 (yūgen) là vẻ đẹp sâu lắng, gợi nhiều hơn nói. Giao diện của Yugen UI theo tinh thần đó: tiết chế và rõ ràng."
      >
        <div className="flex flex-col gap-5">
          <P>
            Yugen UI là bộ component React viết bằng TypeScript, chạy trên React 18 hoặc 19 với Tailwind CSS v4. Không dùng Tailwind thì
            import file CSS biên dịch sẵn. Mọi component dùng chung một bộ token, nên đổi theme, màu thương hiệu hay hướng chữ không phải
            sửa component.
          </P>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((s) => (
              <a
                key={s.href}
                href={docsPath(s.href)}
                className="group flex flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 p-4 transition-colors duration-faster hover:bg-subtle-hover"
              >
                <span className="text-subtitle2 font-semibold text-foreground-1 group-hover:text-brand-foreground-1">{s.title}</span>
                <span className="text-body1 text-foreground-2">{s.body}</span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild appearance="primary">
              <a href={docsPath("/concepts/quick-start")}>Bắt đầu nhanh</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/components/button")}>Xem component</a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="ways" title="Chọn cách dùng" description="Ba cách dùng chung token và theme, có thể kết hợp trong một dự án.">
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
            <table className="w-full border-collapse text-start text-body1">
              <thead>
                <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
                  <th scope="col" className="px-4 py-2 text-start">
                    Cách
                  </th>
                  <th scope="col" className="px-4 py-2 text-start">
                    Hợp khi
                  </th>
                  <th scope="col" className="px-4 py-2 text-start">
                    Cập nhật
                  </th>
                </tr>
              </thead>
              <tbody>
                {WAYS.map((w) => (
                  <tr key={w.way} className="border-b border-stroke-3 align-top last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-start font-semibold text-foreground-1">
                      {w.way}
                      <span className="mt-0.5 block font-mono text-caption1 font-normal whitespace-nowrap text-foreground-3">{w.command}</span>
                    </th>
                    <td className="px-4 py-3 text-foreground-2">{w.when}</td>
                    <td className="px-4 py-3 text-foreground-2">{w.update}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>
            Lệnh đầy đủ và yêu cầu phiên bản ở <A href={docsPath("/concepts/quick-start")}>Bắt đầu nhanh</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="principles" title="Nguyên tắc">
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <IconTile>{p.icon}</IconTile>
              <div className="min-w-0 flex-1">
                <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
                <p className="mt-1 text-body1 text-foreground-2">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="status" title="Phiên bản & giấy phép">
        <div className="flex flex-col gap-4">
          <P>
            Yugen UI đang ở giai đoạn trước 1.0. Bản minor có thể có thay đổi phá vỡ và luôn được ghi rõ ở{" "}
            <A href={docsPath("/news")}>Có gì mới</A>; bản patch chỉ sửa lỗi. Quy tắc đầy đủ ở <A href={docsPath("/concepts/versioning")}>Phiên bản</A>.
          </P>
          <P>
            Giấy phép MIT. Báo lỗi ở <A href={SITE.links.issues}>GitHub Issues</A>, hỏi đáp và góp ý ở{" "}
            <A href={SITE.links.discussions}>Discussions</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="credit" title="Ghi công">
        <div className="flex flex-col gap-4">
          <P>
            Yugen UI do <AuthorLink className="text-link hover:text-link-hover" /> phát triển. Cấu trúc token và hành vi component lấy cảm
            hứng từ <A href="https://fluent2.microsoft.design/">Microsoft Fluent 2</A>; cách phân phối mã nguồn học từ{" "}
            <A href="https://ui.shadcn.com/">shadcn/ui</A>. Hành vi phức tạp dựa trên Radix UI, cmdk, react-day-picker và
            react-resizable-panels. Icon: Fluent System Icons (MIT).
          </P>
          <MessageBar intent="info" title="Không phải sản phẩm của Microsoft." className="max-w-3xl">
            Bảng màu Sakura, gradient và brand ramp do Yugen UI định nghĩa.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
