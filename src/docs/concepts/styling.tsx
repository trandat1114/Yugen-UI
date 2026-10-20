import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown20Regular, MoreHorizontal20Regular, Star20Regular } from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  type ButtonProps,
  fieldControlClass,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Demo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL", className)}>
      {children}
    </div>
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
                <td key={j} className="px-L py-M text-foreground-2">
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

/* ---------------------------------------------------------------- cn demo */
const MERGE_CASES: [string, string][] = [
  ["text-body1 text-foreground-2", "text-foreground-1"],
  ["px-M py-S", "px-XL"],
  ["rounded-medium shadow-4", "rounded-circular shadow-16"],
  ["bg-background-1 hover:bg-background-1-hover", "bg-brand-background-2"],
];

/* ---------------------------------------------------------------- spacing */
const SPACING = [
  { name: "XXS", px: 2, bar: "w-XXS" },
  { name: "XS", px: 4, bar: "w-XS" },
  { name: "SNudge", px: 6, bar: "w-SNudge" },
  { name: "S", px: 8, bar: "w-S" },
  { name: "MNudge", px: 10, bar: "w-MNudge" },
  { name: "M", px: 12, bar: "w-M" },
  { name: "L", px: 16, bar: "w-L" },
  { name: "XL", px: 20, bar: "w-XL" },
  { name: "XXL", px: 24, bar: "w-XXL" },
  { name: "XXXL", px: 32, bar: "w-XXXL" },
];

/* ---------------------------------------------------------------- cva demo */
const pillVariants = cva("rounded-circular", {
  variants: {
    tone: {
      neutral: "",
      brand: "border-transparent bg-brand-background-2 text-brand-foreground-2 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type PillButtonProps = ButtonProps & VariantProps<typeof pillVariants>;

function PillButton({ tone, className, ...props }: PillButtonProps) {
  return <Button className={cn(pillVariants({ tone }), className)} {...props} />;
}

const CVA_CODE = `import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/cn";

const pillVariants = cva("rounded-circular", {
  variants: {
    tone: {
      neutral: "",
      brand:
        "border-transparent bg-brand-background-2 text-brand-foreground-2 hover:bg-brand-background-2-hover active:bg-brand-background-2-pressed",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type PillButtonProps = ButtonProps & VariantProps<typeof pillVariants>;

export function PillButton({ tone, className, ...props }: PillButtonProps) {
  return <Button className={cn(pillVariants({ tone }), className)} {...props} />;
}

<PillButton>Neutral</PillButton>
<PillButton tone="brand" icon={<Star20Regular />}>Đã gắn sao</PillButton>`;

/* ---------------------------------------------------------------- media object */
const PEOPLE = [
  { name: "Trần Minh Anh", role: "Thiết kế sản phẩm · Nhóm Nền tảng thanh toán và đối soát quốc tế" },
  { name: "Lê Hoàng Phúc", role: "Kỹ sư frontend" },
];

const MEDIA_CODE = `<div className="flex items-center gap-M">
  <Avatar name="Trần Minh Anh" color="colorful" size={40} />
  <div className="min-w-0 flex-1">
    <p className="truncate text-body1 font-semibold text-foreground-1">Trần Minh Anh</p>
    <p className="truncate text-caption1 text-foreground-3">Thiết kế sản phẩm · Nhóm Nền tảng…</p>
  </div>
  <div className="flex shrink-0 items-center gap-XS">
    <Button size="small">Nhắn tin</Button>
    <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />
  </div>
</div>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="classname"
        title="className & cn()"
        description="className của bạn luôn được đặt cuối cùng trong cn(...) của component, nên nó thắng mọi class mặc định cùng nhóm."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <Button>Mặc định</Button>
            <Button className="rounded-circular px-XL">Bo tròn</Button>
            <Button appearance="primary" className="min-w-40">
              Rộng hơn
            </Button>
            <Badge className="tracking-wide uppercase">Mới</Badge>
          </Demo>
          <CodeBlock
            code={`<Button className="rounded-circular px-XL">Bo tròn</Button>
<Button appearance="primary" className="min-w-40">Rộng hơn</Button>
<Badge className="tracking-wide uppercase">Mới</Badge>`}
          />
          <P>
            <C>cn()</C> trong <C>src/lib/cn.ts</C> là <C>clsx</C> + <C>tailwind-merge</C> đã được <strong className="font-semibold">dạy</strong>{" "}
            scale của Yugen. Thiếu bước này, <C>tailwind-merge</C> gốc coi <C>text-body1</C> là một màu chữ và xoá nó khi gặp{" "}
            <C>text-foreground-1</C> — chữ sẽ rơi về cỡ mặc định. Kết quả thật của <C>cn()</C> trên trang này:
          </P>
          <SimpleTable
            head={["Class của component", "className truyền vào", "cn() trả về"]}
            rows={MERGE_CASES.map(([base, extra]) => [
              <C key="a">{base}</C>,
              <C key="b">{extra}</C>,
              <C key="c">{cn(base, extra)}</C>,
            ])}
          />
          <MessageNote>
            Luôn import <C>cn</C> từ <C>@/lib/cn</C>; không dùng <C>twMerge</C> trực tiếp. Nếu thêm token mới (cỡ chữ, shadow, duration…),
            nhớ khai báo vào <C>extendTailwindMerge</C> trong <C>cn.ts</C>.
          </MessageNote>
        </div>
      </DocSection>

      <DocSection
        id="tokens"
        title="Chỉ dùng utility từ token"
        description="Palette, bo góc, shadow, cỡ chữ và easing mặc định của Tailwind đã bị tắt trong index.css — chỉ còn utility map từ token Fluent."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Cần", "Dùng", "Không dùng"]}
            rows={[
              ["Màu chữ phụ", <C key="a">text-foreground-2</C>, <C key="b">text-gray-600, text-[#…]</C>],
              ["Nền nút chính", <C key="a">bg-brand-background</C>, <C key="b">bg-pink-600, bg-[#…]</C>],
              ["Cỡ chữ UI", <C key="a">text-body1</C>, <C key="b">text-sm, text-[14px]</C>],
              ["Bo góc control", <C key="a">rounded-medium</C>, <C key="b">rounded-md, rounded-[4px]</C>],
              ["Bóng của Menu", <C key="a">shadow-16</C>, <C key="b">shadow-lg</C>],
              ["Thời gian hover", <C key="a">duration-faster</C>, <C key="b">duration-100</C>],
              ["Theme tối", <C key="a">data-theme=&quot;dark&quot;</C>, <C key="b">dark:bg-…</C>],
            ]}
          />
          <h3 className="text-subtitle1 font-semibold text-foreground-1">Spacing viết hoa</h3>
          <P>
            Spacing dùng hậu tố <strong className="font-semibold">viết hoa</strong> đúng tên token Fluent: <C>spacingHorizontalM</C> →{" "}
            <C>px-M</C>, <C>spacingVerticalSNudge</C> → <C>py-SNudge</C>. Tên thường như <C>p-xl</C> không tồn tại — nếu thêm vào, biến{" "}
            <C>--spacing-xl</C> sẽ va chạm thang container của Tailwind và <C>max-w-xl</C> bỗng chỉ còn 20px. Kích thước phần tử (
            <C>h-8</C>, <C>size-5</C>, <C>w-64</C>) vẫn dùng thang số gốc, bội của 4px.
          </P>
          <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            {SPACING.map((s) => (
              <div key={s.name} className="flex items-center gap-L border-b border-stroke-3 px-L py-S last:border-b-0">
                <span className="w-24 font-mono text-caption1 font-semibold text-brand-foreground-1">p-{s.name}</span>
                <span className="w-12 font-mono text-caption1 text-foreground-3">{s.px}px</span>
                <span className={cn("h-3 rounded-small bg-brand-background", s.bar)} />
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection
        id="variants"
        title="Ghi đè & tạo variant"
        description="Ghi đè một lần thì dùng className; lặp lại nhiều nơi thì đóng gói thành variant bằng class-variance-authority (cva)."
      >
        <div className="flex flex-col gap-L">
          <P>
            Vì mã nguồn nằm trong dự án, cách “chuẩn shadcn” là sửa thẳng bảng <C>variants</C> trong <C>Button.tsx</C>. Khi muốn giữ file
            gốc nguyên vẹn để dễ cập nhật, hãy bọc component và thêm variant bằng <C>cva</C>:
          </P>
          <Demo>
            <PillButton>Neutral</PillButton>
            <PillButton tone="brand" icon={<Star20Regular />}>
              Đã gắn sao
            </PillButton>
            <PillButton tone="brand" size="small">
              Nhỏ
            </PillButton>
          </Demo>
          <CodeBlock code={CVA_CODE} />
          <P>
            Các component cũng export hàm variant để áp style lên phần tử khác: <C>buttonVariants</C>, <C>linkVariants</C>,{" "}
            <C>imageVariants</C>, <C>toggleButtonVariants</C>. Ví dụ <C>{`<a className={buttonVariants({ appearance: "primary" })}>`}</C> —
            tuy vậy <C>{"<Button asChild>"}</C> thường gọn hơn (xem trang Slot).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="state"
        title="Data-attribute & important"
        description="Radix ghi trạng thái lên DOM bằng data-attribute; style theo trạng thái bằng variant data-[…] thay vì state React."
      >
        <div className="flex flex-col gap-L">
          <Demo>
            <Menu>
              <MenuTrigger asChild>
                <Button
                  appearance="subtle"
                  icon={<ChevronDown20Regular className="transition-transform duration-normal" />}
                  iconPosition="after"
                  className="data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1 data-[state=open]:[&_svg]:rotate-180"
                >
                  Sắp xếp
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuItem>Mới nhất</MenuItem>
                <MenuItem>Cũ nhất</MenuItem>
                <MenuItem>Tên A → Z</MenuItem>
              </MenuPopover>
            </Menu>
            <Button icon={<Star20Regular className="size-4!" />}>Icon 16px trong nút medium</Button>
          </Demo>
          <CodeBlock
            code={`<MenuTrigger asChild>
  <Button
    appearance="subtle"
    icon={<ChevronDown20Regular className="transition-transform duration-normal" />}
    iconPosition="after"
    className="data-[state=open]:bg-subtle-pressed data-[state=open]:text-foreground-1 data-[state=open]:[&_svg]:rotate-180"
  >
    Sắp xếp
  </Button>
</MenuTrigger>

{/* Button medium đặt [&_svg]:size-5 — muốn icon 16px phải dùng hậu tố ! (Tailwind v4) */}
<Button icon={<Star20Regular className="size-4!" />}>Icon 16px trong nút medium</Button>`}
          />
          <SimpleTable
            head={["Attribute", "Đặt bởi", "Ví dụ variant"]}
            rows={[
              [<C key="a">data-state=&quot;open | closed&quot;</C>, "Menu, Popover, Dialog, Tooltip, Accordion, Collapsible trigger & content", <C key="b">data-[state=open]:bg-subtle-pressed</C>],
              [<C key="a">data-state=&quot;checked | unchecked&quot;</C>, "Checkbox, Switch, Radio, MenuItemCheckbox", <C key="b">data-[state=checked]:bg-brand-background</C>],
              [<C key="a">data-state=&quot;active&quot;</C>, "TabsTrigger, TabsContent", <C key="b">data-[state=active]:font-semibold</C>],
              [<C key="a">data-highlighted</C>, "Item của Menu, Dropdown (bàn phím / chuột)", <C key="b">data-highlighted:bg-background-1-hover</C>],
              [<C key="a">data-disabled</C>, "Item bị tắt, Slider, Dropdown trigger", <C key="b">data-disabled:text-foreground-disabled</C>],
              [<C key="a">data-side=&quot;top | bottom…&quot;</C>, "Bề mặt nổi sau khi định vị (kể cả khi bị lật)", <C key="b">data-[side=top]:origin-bottom</C>],
            ]}
          />
          <P>
            Hậu tố <C>!</C> (cú pháp Tailwind v4, đặt ở <strong className="font-semibold">cuối</strong> class) chỉ dùng khi component cha đặt
            selector có độ ưu tiên cao hơn như <C>[&_svg]:size-5</C>. Đừng rải <C>!</C> để thắng className của chính component — className
            của bạn đã đứng cuối <C>cn()</C>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="shared"
        title="Class dùng chung"
        description="Khi tự viết control mới, ghép từ class dùng chung để giữ đúng đặc trưng Fluent thay vì chép lại chuỗi class."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Class", "Export từ", "Dùng cho"]}
            rows={[
              [<C key="a">fieldControlClass</C>, "Field", "Vỏ ô nhập: viền stroke-1, đáy stroke-accessible, thanh brand 2px chạy từ giữa khi focus; data-invalid / data-disabled."],
              [<C key="a">fieldAppearanceClass[appearance]</C>, "Select", "Như trên, theo appearance outline / underline / filled-darker / filled-lighter."],
              [<C key="a">popoverSurfaceClass</C>, "Popover", "Bề mặt nổi: z-50, bg-background-1, shadow-16, animation mở / đóng."],
              [<C key="a">menuPopoverClass</C>, <span key="b">Menu</span>, "Bề mặt menu (Menu, ContextMenu, Menubar)."],
              [<C key="a">menuItemClass</C>, "Menu", "Item menu cao 32px, highlight bằng data-highlighted."],
              [<C key="a">listboxOptionClass</C>, "Dropdown", "Option trong listbox (Dropdown, Combobox, TagPicker)."],
              [<C key="a">cmdkOptionClass</C>, "Combobox", "Option cmdk: highlight bằng data-selected=true."],
            ]}
          />
          <P>Ví dụ: một ô chỉ đọc tự viết nhưng vẫn có đáy stroke-accessible và thanh brand khi focus (bấm vào hoặc Tab tới ô):</P>
          <Demo>
            <div
              tabIndex={0}
              role="textbox"
              aria-readonly
              aria-label="Mã giới thiệu"
              className={cn(fieldControlClass, "flex h-8 w-64 items-center px-MNudge font-mono text-body1")}
            >
              YUGEN-2026-SAKURA
            </div>
          </Demo>
          <CodeBlock
            code={`import { fieldControlClass } from "@/components/ui";
import { cn } from "@/lib/cn";

<div
  tabIndex={0}
  role="textbox"
  aria-readonly
  aria-label="Mã giới thiệu"
  className={cn(fieldControlClass, "flex h-8 w-64 items-center px-MNudge font-mono text-body1")}
>
  YUGEN-2026-SAKURA
</div>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="media-object"
        title="Công thức media object"
        description="Avatar / icon + khối chữ + thao tác là bố cục gặp ở khắp nơi. Ba class quyết định nó có vỡ hay không."
      >
        <div className="flex flex-col gap-L">
          <Demo className="flex-col items-stretch">
            {PEOPLE.map((p) => (
              <div key={p.name} className="flex w-full max-w-md items-center gap-M">
                <Avatar name={p.name} color="colorful" size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body1 font-semibold text-foreground-1">{p.name}</p>
                  <p className="truncate text-caption1 text-foreground-3" title={p.role}>
                    {p.role}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-XS">
                  <Button size="small">Nhắn tin</Button>
                  <Button size="small" appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />
                </div>
              </div>
            ))}
          </Demo>
          <CodeBlock code={MEDIA_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              <C>min-w-0 flex-1</C> trên khối chữ: flex item mặc định không co nhỏ hơn nội dung, thiếu <C>min-w-0</C> thì <C>truncate</C>{" "}
              không có tác dụng và hàng bị tràn.
            </li>
            <li>
              <C>shrink-0</C> trên avatar và nhóm thao tác để chúng giữ nguyên kích thước khi chữ dài.
            </li>
            <li>
              <C>gap-*</C> thay cho margin — tự đúng khi đổi sang RTL. CardHeader, ListItem, TableCellLayout và Persona đã đóng gói sẵn công
              thức này.
            </li>
          </ul>
          <DoDont
            dos={[
              "Gộp class bằng cn() và để className của người dùng ở cuối.",
              "Dùng utility token (text-foreground-2, p-M, rounded-medium, shadow-16).",
              "Style trạng thái bằng data-[state=…] do Radix đặt sẵn.",
            ]}
            donts={[
              "Không dùng giá trị tuỳ ý (#hex, 14px, 120ms) hay palette Tailwind (bg-blue-500).",
              "Không dùng dark: — theme nằm trong token.",
              "Không dùng ml/mr/pl/pr/left/right; dùng ms/me/ps/pe/start/end.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}

function MessageNote({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl rounded-medium border border-stroke-2 bg-background-3 px-M py-S text-body1 text-foreground-2">{children}</div>
  );
}
