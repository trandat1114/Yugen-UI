import type { ReactNode } from "react";
import {
  Accessibility24Regular,
  Code24Regular,
  Color24Regular,
  DarkTheme24Regular,
  Layer24Regular,
  PaintBrush24Regular,
} from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardHeader, MessageBar } from "@/components/ui";
import { DocSection } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">
      {children}
    </span>
  );
}

const PILLARS = [
  {
    icon: <Color24Regular />,
    title: "Nền móng Fluent 2",
    tag: "Token & hành vi",
    body: "Tên token trùng 1-1 với Fluent UI React v9 (colorNeutralForeground1, spacingHorizontalM, shadow16…), cùng thang spacing, type ramp, bo góc, elevation, motion và cùng quy tắc trạng thái của từng component.",
  },
  {
    icon: <Code24Regular />,
    title: "Mã nguồn thuộc về bạn",
    tag: "Copy-paste",
    body: "Như shadcn/ui, không có package npm để cài: bạn chép thư mục component vào dự án, đọc được, sửa được. Hành vi phức tạp dựa trên Radix, cmdk và react-day-picker.",
  },
  {
    icon: <PaintBrush24Regular />,
    title: "Thương hiệu Sakura 桜",
    tag: "Brand",
    body: "Brand mặc định là hồng anh đào với ramp 16 bậc, Brand80 đạt 5.16:1 với chữ trắng. Đổi sang Web (xanh Fluent), Teams hoặc brand riêng chỉ bằng một attribute.",
  },
];

const PRINCIPLES = [
  {
    icon: <Layer24Regular />,
    title: "Token ba lớp",
    body: "Global (giá trị thô) → Alias (vai trò, tên Fluent) → Utility (class Tailwind). Component chỉ dùng utility, nên đổi theme là đổi token, không sửa component.",
  },
  {
    icon: <Accessibility24Regular />,
    title: "Tiếp cận được ngay từ đầu",
    body: "Ngữ nghĩa ARIA và điều hướng bàn phím từ Radix, focus 2px tương phản cao, chữ ≥ 4.5:1, không dùng màu làm tín hiệu duy nhất.",
  },
  {
    icon: <DarkTheme24Regular />,
    title: "Theme, brand, hướng chữ đổi được",
    body: "data-theme (light / dark), data-brand và dir là attribute trên DOM — đặt ở <html> cho cả app hoặc lồng cho từng vùng qua YugenProvider.",
  },
  {
    icon: <Code24Regular />,
    title: "Code mang về được",
    body: "Mỗi ví dụ, mỗi Block chỉ import từ @/components/ui và @fluentui/react-icons — chép nguyên đoạn code vào dự án là chạy.",
  },
];

const SECTIONS = [
  {
    href: "#/foundations/color",
    title: "Ngôn ngữ thiết kế",
    body: "Màu sắc, typography, spacing, bo góc, elevation, motion — nguồn gốc của mọi token, kèm bảng kiểm tra tương phản.",
  },
  {
    href: "#/components/button",
    title: "Components",
    body: "Hơn 60 component chia nhóm: Hành động, Nhập liệu, Điều hướng, Hiển thị dữ liệu, Phản hồi, Bề mặt & overlay, Bố cục. Mỗi trang có ví dụ sống, Nên / Không nên và bảng props.",
  },
  {
    href: "#/blocks",
    title: "Blocks",
    body: "Màn hình mẫu ghép từ component (đăng nhập, thống kê, đặt lịch, phản hồi…). Tab Code hiển thị nguyên file để chép.",
  },
  {
    href: "#/theme-designer",
    title: "Theme Designer",
    body: "Sinh ramp brand 16 bậc từ một màu chủ đạo, xem trước trên component thật và xuất khối CSS [data-brand].",
  },
  {
    href: "#/concepts/quick-start",
    title: "Khái niệm",
    body: "Hướng dẫn tích hợp, tuỳ biến style, theming, slot, định vị, RTL, SSR, khả năng tiếp cận và chuyển đổi từ Fluent UI hoặc shadcn/ui.",
  },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="what"
        title="Yugen UI là gì?"
        description="幽玄 (yūgen) là vẻ đẹp sâu lắng, gợi nhiều hơn nói. Yugen UI mang tinh thần đó vào giao diện: tiết chế, rõ ràng, có chiều sâu."
      >
        <div className="flex flex-col gap-XL">
          <P>
            Yugen UI là bộ component và token cho <strong className="font-semibold text-foreground-1">React 18 + TypeScript + Tailwind CSS v4</strong>,
            tạo bởi trandat1114. Hệ thống kết hợp ba nguồn: cấu trúc token và hành vi component của Microsoft Fluent 2, mô hình phân
            phối copy-paste của shadcn/ui và bảng màu thương hiệu Sakura riêng.
          </P>
          <div className="grid gap-L md:grid-cols-3">
            {PILLARS.map((p) => (
              <Card key={p.title} size="large">
                <CardHeader image={<IconTile>{p.icon}</IconTile>} header={p.title} description={p.tag} />
                <CardContent>{p.body}</CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-S">
            <Button asChild appearance="primary">
              <a href="#/concepts/quick-start">Bắt đầu nhanh</a>
            </Button>
            <Button asChild>
              <a href="#/components/button">Xem component</a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="principles" title="Nguyên tắc" description="Bốn nguyên tắc chi phối mọi quyết định thiết kế và mã nguồn.">
        <div className="flex flex-col gap-XL">
          <div className="grid gap-L sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="flex gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-L">
                <IconTile>{p.icon}</IconTile>
                <div className="min-w-0 flex-1">
                  <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
                  <p className="mt-XS text-body1 text-foreground-2">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <P>
            Ví dụ, nền của nút primary đi qua đủ ba lớp. Đổi <C>data-brand</C> chỉ thay lớp Global; lớp Alias và class trong component
            giữ nguyên:
          </P>
          <CodeBlock
            code={`/* 1. Global — giá trị thô, theo brand (tokens.css) */
[data-brand="sakura"] { --brand-80: #c2347a; }

/* 2. Alias — vai trò, tên giống Fluent (tokens.css) */
[data-theme="light"], [data-brand] { --colorBrandBackground: var(--brand-80); }

/* 3. Utility — cầu nối sang Tailwind (index.css) */
@theme inline { --color-brand-background: var(--colorBrandBackground); }

// Component chỉ biết utility
<button className="bg-brand-background text-foreground-on-brand">Lưu</button>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="structure"
        title="Cấu trúc tài liệu"
        description="Tài liệu đi từ nền tảng tới chi tiết; mọi trang đều đổi được theme sáng / tối ở thanh trên cùng."
      >
        <div className="grid gap-M sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-XS rounded-xlarge border border-stroke-2 bg-background-1 p-L transition-colors duration-faster hover:bg-subtle-hover"
            >
              <span className="text-subtitle2 font-semibold text-foreground-1 group-hover:text-brand-foreground-1">{s.title}</span>
              <span className="text-body1 text-foreground-2">{s.body}</span>
            </a>
          ))}
        </div>
      </DocSection>

      <DocSection id="credit" title="Ghi công">
        <div className="flex flex-col gap-L">
          <P>
            <strong className="font-semibold text-foreground-1">Yugen UI</strong> © trandat1114. Lấy cảm hứng từ{" "}
            <a className="text-link underline hover:text-link-hover" href="https://fluent2.microsoft.design/" target="_blank" rel="noopener noreferrer">
              Microsoft Fluent 2
            </a>{" "}
            và{" "}
            <a className="text-link underline hover:text-link-hover" href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
              shadcn/ui
            </a>
            . Icon: Fluent System Icons (MIT). Hành vi: Radix UI, cmdk, react-day-picker, react-resizable-panels.
          </P>
          <div className="flex flex-wrap gap-S">
            <Badge appearance="tint" color="brand">React 18</Badge>
            <Badge appearance="tint" color="brand">TypeScript 5</Badge>
            <Badge appearance="tint" color="brand">Tailwind CSS 4</Badge>
            <Badge appearance="tint" color="informative">Radix UI</Badge>
            <Badge appearance="tint" color="informative">Fluent System Icons</Badge>
          </div>
          <MessageBar intent="info" title="Không phải sản phẩm chính thức của Microsoft." className="max-w-3xl">
            Tên token, thang spacing / typography / bo góc / elevation / motion theo Fluent UI React v9; bảng màu Sakura, gradient và
            brand ramp do Yugen UI định nghĩa.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
