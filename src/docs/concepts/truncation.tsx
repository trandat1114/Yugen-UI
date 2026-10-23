import * as React from "react";
import type { ReactNode } from "react";
import { Document20Regular, MoreHorizontal20Regular, Send20Regular } from "@fluentui/react-icons";
import { Button, Card, CardHeader, Persona, SimpleTooltip, Text, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-caption1 text-brand-foreground-1">{label}</span>
      <div className="w-64 max-w-full rounded-medium border border-dashed border-stroke-1 p-2">{children}</div>
    </div>
  );
}

const LONG_TITLE = "Báo cáo tổng hợp doanh thu và chi phí vận hành quý 3 năm 2026 — bản trình hội đồng quản trị";
const LONG_FILE = "Hop-dong-dich-vu-thiet-ke-giao-dien-Yugen-UI-phien-ban-cuoi-cung-da-ky.pdf";

/** Link chỉ hiện tooltip toàn văn khi chữ thật sự bị cắt. */
function TruncatedLink({ href, children }: { href: string; children: string }) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = React.useState(false);
  const isTruncated = () => {
    const el = ref.current;
    return !!el && el.scrollWidth > el.clientWidth;
  };

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && isTruncated())}>
      <TooltipTrigger asChild>
        <a
          ref={ref}
          href={href}
          onClick={(e) => e.preventDefault()}
          className="block min-w-0 truncate rounded-small text-body1 text-link hover:text-link-hover hover:underline"
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 break-all">{children}</TooltipContent>
    </Tooltip>
  );
}

const WRAP_CODE = `{/* Mặc định: để chữ xuống dòng; wrap-break-word cho chuỗi dài không có khoảng trắng */}
<Card className="w-72">
  <CardHeader
    image={<Document20Regular />}
    header={<span className="wrap-break-word">Báo cáo tổng hợp doanh thu và chi phí vận hành quý 3…</span>}
    description="Cập nhật hôm qua"
  />
</Card>`;

const HOW_CODE = `{/* Một dòng: cần một chiều rộng giới hạn; trong flex, phần tử cha phải có min-w-0 */}
<p className="truncate">…</p>

{/* Nhiều dòng */}
<p className="line-clamp-2">…</p>

{/* Component Text */}
<Text truncate wrap={false} block>…</Text>

{/* Trong flex: thiếu min-w-0 thì truncate không có tác dụng */}
<div className="flex items-center gap-2">
  <Document20Regular className="shrink-0" />
  <span className="min-w-0 flex-1 truncate">…</span>
</div>`;

const TOOLTIP_CODE = `import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

/** Link chỉ hiện tooltip toàn văn khi chữ thật sự bị cắt. */
export function TruncatedLink({ href, children }: { href: string; children: string }) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = React.useState(false);
  const isTruncated = () => {
    const el = ref.current;
    return !!el && el.scrollWidth > el.clientWidth;
  };

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && isTruncated())}>
      <TooltipTrigger asChild>
        <a ref={ref} href={href} className="block min-w-0 truncate text-link hover:underline">
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 break-all">{children}</TooltipContent>
    </Tooltip>
  );
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="prefer-wrap"
        title="Ưu tiên xuống dòng"
        description="Chữ bị cắt là nội dung bị giấu: người phóng to màn hình, bản dịch dài hơn (tiếng Việt thường dài hơn tiếng Anh 20–30%) và người dùng cảm ứng là những người mất nhiều nhất."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-caption1 font-semibold text-success-foreground-1">✓ Xuống dòng</span>
              <Card className="w-72">
                <CardHeader image={<Document20Regular />} header={<span className="wrap-break-word">{LONG_TITLE}</span>} description="Cập nhật hôm qua" />
              </Card>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-caption1 font-semibold text-danger-foreground-1">✕ Cắt không cần thiết</span>
              <Card className="w-72">
                <CardHeader image={<Document20Regular />} header={<span className="block truncate">{LONG_TITLE}</span>} description="Cập nhật hôm qua" />
              </Card>
            </div>
          </div>
          <CodeBlock code={WRAP_CODE} />
          <P>
            Cắt chỉ hợp lý khi có một ràng buộc thật: hàng trong bảng hoặc danh sách cần cao đều, thanh điều hướng, tab, breadcrumb, chip trong
            ô nhập, tên tệp trong khung cố định.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="how"
        title="Cách cắt"
        description="Ba công cụ, cùng một điều kiện: phần tử phải có chiều rộng giới hạn."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Labeled label="truncate">
              <p className="truncate text-body1 text-foreground-1">{LONG_TITLE}</p>
            </Labeled>
            <Labeled label="line-clamp-2">
              <p className="line-clamp-2 text-body1 text-foreground-1">{LONG_TITLE}</p>
            </Labeled>
            <Labeled label="<Text truncate wrap={false} block>">
              <Text truncate wrap={false} block>
                {LONG_TITLE}
              </Text>
            </Labeled>
            <Labeled label="flex + min-w-0">
              <div className="flex items-center gap-2 text-body1 text-foreground-1">
                <Document20Regular className="shrink-0 text-foreground-3" />
                <span className="min-w-0 flex-1 truncate">{LONG_FILE}</span>
                <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />
              </div>
            </Labeled>
            <Labeled label="Persona (tự cắt)">
              <Persona name="Nguyễn Hoàng Bảo Ngọc Anh" secondaryText="Trưởng nhóm Trải nghiệm người dùng và Nghiên cứu" />
            </Labeled>
          </div>
          <CodeBlock code={HOW_CODE} />
          <P>
            Component có sẵn chế độ cắt: <C>TableCellLayout truncate</C>, <C>Persona</C>, <C>MenuItem</C> (nhãn dài), giá trị của{" "}
            <C>Dropdown</C>, <C>Tag</C>. Trình đọc màn hình vẫn đọc toàn văn — cắt chỉ ảnh hưởng người nhìn.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="full-text"
        title="Cho xem toàn văn"
        description="Mỗi chuỗi bị cắt cần một đường tới nội dung đầy đủ, dùng được bằng chuột, bàn phím và cảm ứng."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <p className="text-caption1 text-foreground-3">Rê chuột hoặc Tab tới từng link — chỉ link bị cắt mới hiện tooltip.</p>
            <div className="flex w-72 max-w-full flex-col gap-2">
              <TruncatedLink href="#/files/1">{LONG_FILE}</TruncatedLink>
              <TruncatedLink href="#/files/2">Ngân-sách-2027.xlsx</TruncatedLink>
            </div>
          </div>
          <CodeBlock code={TOOLTIP_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Đặt tooltip lên phần tử <strong className="font-semibold">vốn đã focus được</strong> (link, nút, ô của bảng có tương tác).
              Đừng thêm <C>tabIndex</C> cho đoạn văn chỉ để có tooltip — hãy cho xuống dòng hoặc mở trang chi tiết.
            </li>
            <li>
              <C>title</C> là phương án tối thiểu: chỉ hiện khi rê chuột, không dùng được bằng bàn phím hay cảm ứng.
            </li>
            <li>Ở bảng và danh sách, trang chi tiết hoặc panel mở rộng là nơi hiển thị toàn văn tốt nhất.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="buttons"
        title="Không cắt nhãn chính của nút"
        description="“Xoá vĩnh…” hay “Gửi cho người…” biến một hành động rõ ràng thành câu đố. Nút có whitespace-nowrap và chiều rộng tối thiểu để nhãn luôn trọn vẹn."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="text-caption1 font-semibold text-success-foreground-1">✓ Rút gọn câu chữ hoặc dùng icon + tooltip</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button appearance="primary" icon={<Send20Regular />}>
                  Gửi duyệt
                </Button>
                <SimpleTooltip content="Gửi cho người duyệt">
                  <Button appearance="subtle" icon={<Send20Regular />} aria-label="Gửi cho người duyệt" />
                </SimpleTooltip>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="text-caption1 font-semibold text-danger-foreground-1">✕ Cắt nhãn để vừa chỗ</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button appearance="primary" className="max-w-32">
                  <span className="min-w-0 truncate">Lưu và gửi cho người duyệt</span>
                </Button>
              </div>
            </div>
          </div>
          <DoDont
            dos={[
              "Để chữ xuống dòng theo mặc định; dùng wrap-break-word cho chuỗi dài không dấu cách.",
              "Khi phải cắt: truncate / line-clamp-* + min-w-0 trên phần tử flex.",
              "Cho xem toàn văn bằng Tooltip trên phần tử focus được, hoặc trang chi tiết.",
              "Nhãn nút 1–3 từ; thiếu chỗ thì chuyển hành động phụ vào menu “…”.",
            ]}
            donts={[
              "Không cắt nhãn chính của Button, MenuItem quan trọng hay tiêu đề trang.",
              "Không dựa vào title làm cách duy nhất để xem toàn văn.",
              "Không thêm tabIndex vào văn bản tĩnh chỉ để gắn tooltip.",
              "Không cắt số liệu (số tiền, ngày) — người dùng sẽ hiểu sai.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
