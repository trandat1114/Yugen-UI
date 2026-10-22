import type { ReactNode } from "react";
import { Delete20Regular, MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
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
                <td key={j} className="px-4 py-3 text-foreground-2">
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

function Names({ items }: { items: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {items.map((n) => (
        <C key={n}>{n}</C>
      ))}
    </span>
  );
}

/** Hàng [shadcn, Yugen, ghi chú] — viết gọn. */
function row(shadcn: string[], yugen: string[], note: ReactNode = ""): ReactNode[] {
  return [<Names key="a" items={shadcn} />, yugen.length ? <Names key="b" items={yugen} /> : "—", note];
}

const VARIANTS = [
  { shadcn: `variant="default"`, appearance: "primary" as const, label: "Primary" },
  { shadcn: `variant="secondary"`, appearance: "secondary" as const, label: "Secondary" },
  { shadcn: `variant="destructive"`, appearance: "danger" as const, label: "Danger" },
  { shadcn: `variant="outline"`, appearance: "outline" as const, label: "Outline" },
  { shadcn: `variant="ghost"`, appearance: "subtle" as const, label: "Subtle" },
  { shadcn: `variant="link"`, appearance: "transparent" as const, label: "Transparent" },
];

const VARIANT_CODE = `// shadcn/ui
<Button>Lưu</Button>
<Button variant="destructive" size="sm">Xoá</Button>
<Button variant="ghost" size="icon"><Trash2 /></Button>

// Yugen UI — LƯU Ý: Button mặc định là secondary, không phải primary
<Button appearance="primary">Lưu</Button>
<Button appearance="danger" size="small">Xoá</Button>
<Button appearance="subtle" icon={<Delete20Regular />} aria-label="Xoá" />`;

const THEME_CODE = `/* shadcn/ui — globals.css */
:root {
  --primary: oklch(0.205 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --radius: 0.625rem;
}
.dark {
  --primary: oklch(0.922 0 0);
}
/* <html class="dark"> + biến thể dark: trong class */

/* Yugen UI — tokens.css đã có sẵn light, dark và các brand */
/* <html data-theme="dark" data-brand="web"> — không cần dark: */`;

const BEFORE_CODE = `// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Thông báo</CardTitle>
    <CardDescription>Bạn có 3 tin chưa đọc.</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
    </CardAction>
  </CardHeader>
  <CardContent className="text-sm text-muted-foreground">
    Lịch họp nhóm thiết kế đã dời sang 15:00.
  </CardContent>
  <CardFooter className="gap-2">
    <Badge variant="secondary">Lịch</Badge>
    <Button variant="outline" size="sm" className="ml-auto">Xem tất cả</Button>
  </CardFooter>
</Card>`;

const AFTER_CODE = `// Yugen UI
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@/components/ui";

<Card className="w-full max-w-sm">
  <CardHeader
    header="Thông báo"
    description="Bạn có 3 tin chưa đọc."
    action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
  />
  <CardContent className="text-body1 text-foreground-3">
    Lịch họp nhóm thiết kế đã dời sang 15:00.
  </CardContent>
  <CardFooter className="gap-2">
    <Badge appearance="tint" color="informative">Lịch</Badge>
    <Button appearance="outline" size="small" className="ms-auto">Xem tất cả</Button>
  </CardFooter>
</Card>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="overview"
        title="Giống & khác"
        description="Nếu bạn quen shadcn/ui, phần lớn kiến thức dùng lại được: cùng Radix, cùng cmdk, cùng react-day-picker, cùng Tailwind và cùng triết lý mã nguồn thuộc về bạn."
      >
        <SimpleTable
          head={["", "shadcn/ui", "Yugen UI"]}
          rows={[
            ["Cài đặt", <C key="a">npx shadcn add button</C>, "Chép thư mục component (chưa có CLI)"],
            ["Cấu trúc file", <C key="a">components/ui/button.tsx</C>, <><C>components/ui/Button/Button.tsx</C> + barrel <C>@/components/ui</C></>],
            ["Primitive", "Radix, cmdk, react-day-picker, vaul, sonner, embla", "Radix, cmdk, react-day-picker, react-resizable-panels (không vaul / sonner / embla)"],
            ["Ngôn ngữ thiết kế", "Trung tính, tối giản", "Fluent 2: type ramp, elevation, motion, trạng thái theo Fluent"],
            ["API variant", <><C>variant</C>, <C>size: sm | default | lg | icon</C></>, <><C>appearance</C>, <C>size: small | medium | large</C>, <C>shape</C></>],
            ["Token màu", <><C>--primary</C>, <C>--muted</C>… (oklch)</>, <>Tên Fluent: <C>--colorBrandBackground</C>, <C>--colorNeutralForeground3</C>… (hex)</>],
            ["Dark mode", <><C>.dark</C> + <C>dark:</C></>, <><C>data-theme</C> lồng được, không dùng <C>dark:</C></>],
            ["Icon", "lucide-react", "@fluentui/react-icons"],
          ]}
        />
      </DocSection>

      <DocSection
        id="components"
        title="Bảng tương ứng component"
        description="Nhiều component trùng tên (Tabs, Tooltip, Command, ContextMenu, Menubar, HoverCard, ScrollArea, Resizable, Kbd, Empty). Bảng dưới tập trung vào những chỗ khác."
      >
        <SimpleTable
          head={["shadcn/ui", "Yugen UI", "Ghi chú"]}
          rows={[
            row(["Accordion", "AccordionTrigger", "AccordionContent"], ["Accordion", "AccordionHeader", "AccordionPanel"], <>Cùng prop Radix (<C>type</C>, <C>collapsible</C>).</>),
            row(["Alert", "AlertTitle", "AlertDescription"], ["MessageBar"], <><C>variant=&quot;destructive&quot;</C> → <C>intent=&quot;error&quot;</C>; tiêu đề qua <C>title</C>; có <C>actions</C>, <C>onDismiss</C>.</>),
            row(["AlertDialog", "AlertDialogContent", "AlertDialogAction", "AlertDialogCancel"], ["Dialog", "DialogSurface modalType=\"alert\"", "DialogClose"], <>Ẩn nút X bằng <C>{"<DialogTitle action={null}>"}</C>.</>),
            row(["AspectRatio"], ["AspectRatio"], <><C>ratio</C> như shadcn.</>),
            row(["Avatar", "AvatarImage", "AvatarFallback"], ["Avatar"], <>Một component: <C>name</C> (tự sinh chữ viết tắt), <C>src</C>, <C>presence</C>.</>),
            row(["Badge"], ["Badge"], <><C>variant</C> → <C>appearance</C> + <C>color</C>.</>),
            row(["Breadcrumb", "BreadcrumbLink", "BreadcrumbPage", "BreadcrumbSeparator", "BreadcrumbEllipsis"], ["Breadcrumb", "BreadcrumbButton", "BreadcrumbButton current", "BreadcrumbDivider", "BreadcrumbOverflow"], <>Hoặc truyền mảng <C>items</C>.</>),
            row(["Button", "ButtonGroup"], ["Button", "ButtonGroup"], "Xem bảng variant bên dưới."),
            row(["Card", "CardTitle", "CardDescription", "CardAction"], ["Card", "CardHeader"], <><C>{"<CardHeader header description action image />"}</C>.</>),
            row(["Carousel (embla)"], ["Carousel", "CarouselViewport", "CarouselCard", "CarouselNavContainer"], "Không phụ thuộc embla."),
            row(["Chart"], [], "Chưa có."),
            row(["Checkbox", "RadioGroup", "RadioGroupItem"], ["Checkbox", "RadioGroup", "Radio"], <>Có prop <C>label</C> sẵn.</>),
            row(["Combobox (Popover + Command)"], ["Combobox"], <>Component hoàn chỉnh: <C>options</C>, <C>multiselect</C>, <C>freeform</C>.</>),
            row(["Data Table (TanStack)"], ["Table"], "Mẫu DataTable ở trang Table, không cần TanStack."),
            row(["Date Picker"], ["DatePicker", "DateRangePicker"], "Component hoàn chỉnh thay vì công thức."),
            row(["Dialog", "DialogContent", "DialogHeader", "DialogFooter"], ["Dialog", "DialogSurface", "DialogTitle", "DialogActions"], <><strong className="font-semibold">Chú ý:</strong> <C>DialogContent</C> của shadcn là bề mặt; của Yugen là phần thân.</>),
            row(["Drawer (vaul)"], ["Drawer", "DrawerSurface position=\"bottom\""], "Không có kéo để đóng."),
            row(["DropdownMenu", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuShortcut"], ["Menu", "MenuPopover", "MenuItem", "MenuGroupHeader", "MenuDivider", "MenuItem secondaryContent"], <><C>DropdownMenuCheckboxItem / RadioItem / Sub</C> → <C>MenuItemCheckbox / MenuItemRadio / MenuSub</C>.</>),
            row(["Field", "FieldLabel", "FieldDescription", "FieldError"], ["Field"], <>Một component: <C>label</C>, <C>hint</C>, <C>validationState</C>, <C>validationMessage</C>.</>),
            row(["Form (react-hook-form)"], ["Field"], "Dùng thư viện form bạn chọn; nối lỗi vào validationMessage."),
            row(["Input Group"], ["Input contentBefore / contentAfter"], ""),
            row(["Input OTP", "InputOTPGroup", "InputOTPSlot"], ["InputOTP"], <><C>maxLength</C> → <C>length</C>; nhóm bằng <C>groups={"{[3, 3]}"}</C>.</>),
            row(["Item"], ["List", "ListItem"], <><C>media</C>, <C>title</C>, <C>description</C>, <C>actions</C>.</>),
            row(["Navigation Menu"], [], "Chưa có — dùng Nav (dọc) hoặc Menubar."),
            row(["Native Select"], ["Select"], <>Thẻ <C>{"<select>"}</C> gốc.</>),
            row(["Pagination", "PaginationLink", "PaginationNext"], ["Pagination"], <>Một component: <C>pageCount</C>, <C>page / onPageChange</C>.</>),
            row(["Popover", "PopoverContent"], ["Popover", "PopoverSurface"], <>Thêm <C>appearance</C>, <C>withArrow</C>.</>),
            row(["Progress"], ["ProgressBar"], <>shadcn nhận 0–100; Yugen mặc định <C>max=1</C> → truyền <C>max={"{100}"}</C> hoặc giá trị 0–1.</>),
            row(["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"], ["Dropdown", "DropdownOption"], "Trigger, value và content đã gộp vào Dropdown."),
            row(["Separator"], ["Divider"], <>Có thể chứa chữ; <C>vertical</C>, <C>appearance</C>.</>),
            row(["Sheet", "SheetContent side"], ["Drawer", "DrawerSurface position"], <><C>left / right</C> → <C>start / end</C> (logical).</>),
            row(["Sidebar"], ["Nav", "InlineDrawer"], ""),
            row(["Sonner / Toast"], ["Toaster", "toast()", "useToast"], <><C>toast(&quot;Đã lưu&quot;, {"{ description }"})</C> → <C>toast({"{ title, body }"})</C>.</>),
            row(["Table", "TableHead", "TableCaption", "TableFooter"], ["Table", "TableHeaderCell"], <>Caption / footer dùng thẻ <C>{"<caption>"}</C>, <C>{"<tfoot>"}</C> gốc.</>),
            row(["Toggle", "ToggleGroup"], ["ToggleButton", "ToggleGroup"], <><C>pressed</C> → <C>checked</C>.</>),
            row(["Typography"], ["Text", "Title1…Caption2"], ""),
          ]}
        />
      </DocSection>

      <DocSection
        id="variants"
        title="Variant & size"
        description="Tên theo Fluent. Khác biệt dễ sót nhất: Button không truyền gì là secondary, không phải primary."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {VARIANTS.map((v) => (
              <div key={v.appearance} className="flex flex-col items-start gap-2">
                <span className="font-mono text-caption1 text-foreground-3">{v.shadcn}</span>
                <Button appearance={v.appearance}>{v.label}</Button>
                <span className="font-mono text-caption1 text-brand-foreground-1">appearance=&quot;{v.appearance}&quot;</span>
              </div>
            ))}
          </div>
          <SimpleTable
            head={["shadcn/ui", "Yugen UI"]}
            rows={[
              [<C key="a">size=&quot;sm&quot; / &quot;default&quot; / &quot;lg&quot;</C>, <C key="b">size=&quot;small&quot; / &quot;medium&quot; / &quot;large&quot;</C>],
              [<C key="a">size=&quot;icon&quot;</C>, <><C>icon</C> không kèm children → tự thành nút vuông; bắt buộc <C>aria-label</C></>],
              [<C key="a">Badge variant=&quot;default&quot;</C>, <C key="b">appearance=&quot;filled&quot; color=&quot;brand&quot;</C>],
              [<C key="a">Badge variant=&quot;secondary&quot;</C>, <C key="b">appearance=&quot;tint&quot; color=&quot;informative&quot;</C>],
              [<C key="a">Badge variant=&quot;destructive&quot;</C>, <C key="b">color=&quot;danger&quot;</C>],
              [<C key="a">Badge variant=&quot;outline&quot;</C>, <C key="b">appearance=&quot;outline&quot;</C>],
              [<C key="a">Alert variant=&quot;destructive&quot;</C>, <C key="b">MessageBar intent=&quot;error&quot;</C>],
            ]}
          />
          <CodeBlock code={VARIANT_CODE} />
          <div className="flex flex-wrap items-center gap-2">
            <Button appearance="primary">Lưu</Button>
            <Button appearance="danger" size="small">
              Xoá
            </Button>
            <Button appearance="subtle" icon={<Delete20Regular />} aria-label="Xoá" />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="css-variables"
        title="Biến CSS & utility"
        description="Đổi theo vai trò, không theo giá trị: tìm token Fluent có cùng nhiệm vụ."
      >
        <SimpleTable
          head={["shadcn/ui", "Yugen alias", "Yugen utility"]}
          rows={[
            [<C key="a">--background</C>, <C key="b">--colorShellBackground / --colorNeutralBackground1</C>, <><C>bg-shell</C> (nền trang), <C>bg-background-1</C> (bề mặt)</>],
            [<C key="a">--foreground</C>, <C key="b">--colorNeutralForeground1</C>, <C key="c">text-foreground-1</C>],
            [<C key="a">--card, --popover</C>, <C key="b">--colorNeutralBackground1</C>, <C key="c">bg-background-1</C>],
            [<C key="a">--primary</C>, <C key="b">--colorBrandBackground</C>, <C key="c">bg-brand-background</C>],
            [<C key="a">--primary-foreground</C>, <C key="b">--colorNeutralForegroundOnBrand</C>, <C key="c">text-foreground-on-brand</C>],
            [<C key="a">--secondary, --muted</C>, <C key="b">--colorNeutralBackground3</C>, <C key="c">bg-background-3</C>],
            [<C key="a">--muted-foreground</C>, <C key="b">--colorNeutralForeground3</C>, <C key="c">text-foreground-3</C>],
            [<C key="a">--accent</C>, <C key="b">--colorSubtleBackgroundHover</C>, <C key="c">hover:bg-subtle-hover</C>],
            [<C key="a">--destructive</C>, <C key="b">--colorStatusDangerBackground3 / Foreground1</C>, <><C>bg-danger-background-3</C>, <C>text-danger-foreground-1</C></>],
            [<C key="a">--border</C>, <C key="b">--colorNeutralStroke2</C>, <C key="c">border-stroke-2</C>],
            [<C key="a">--input</C>, <C key="b">--colorNeutralStroke1 (+ StrokeAccessible ở đáy)</C>, <><C>border-stroke-1</C>, hoặc <C>fieldControlClass</C></>],
            [<C key="a">--ring</C>, <C key="b">--colorStrokeFocus2</C>, <C key="c">outline-stroke-focus</C>],
            [<C key="a">--radius</C>, <C key="b">--borderRadiusSmall … 4XLarge, Circular</C>, <><C>rounded-small</C> 2 · <C>medium</C> 4 · <C>large</C> 6 · <C>xlarge</C> 8 · <C>circular</C></>],
            [<C key="a">--sidebar</C>, <C key="b">--colorShellNavBackground</C>, <C key="c">bg-shell-nav</C>],
            [<C key="a">--chart-1 … 5</C>, "Palette shared", <><C>bg-teal-bg</C>, <C>text-lavender-fg</C>… (dùng tiết kiệm)</>],
          ]}
        />
        <div className="mt-4">
          <SimpleTable
            head={["Utility shadcn", "Utility Yugen"]}
            rows={[
              [<C key="a">text-xs / text-sm / text-base / text-lg</C>, <C key="b">text-caption1 / text-body1 / text-body2 / text-subtitle1</C>],
              [<C key="a">font-medium</C>, <C key="b">font-semibold (chỉ có normal / semibold)</C>],
                            [<C key="a">rounded-md / rounded-lg / rounded-full</C>, <C key="b">rounded-medium / rounded-xlarge / rounded-circular</C>],
              [<C key="a">shadow-xs / shadow-sm / shadow-md / shadow-lg</C>, <C key="b">shadow-2 / shadow-4 / shadow-8 / shadow-16</C>],
              [<C key="a">ml-auto / pl-2 / left-0</C>, <C key="b">ms-auto / ps-2 / start-0</C>],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="theming"
        title="Khác biệt về theming"
        description="shadcn đổi theme bằng class .dark và bộ biến CSS; Yugen dùng hai attribute lồng được và token đã kiểm tra tương phản."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={THEME_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Palette mặc định của Tailwind (<C>bg-zinc-900</C>, <C>text-sm</C>, <C>rounded-lg</C>) đã bị tắt — class shadcn chép sang sẽ
              không có tác dụng, cần đổi theo bảng trên.
            </li>
            <li>
              Không có <C>dark:</C>: mọi khác biệt sáng / tối nằm trong token. Lồng theme bằng <C>data-theme</C> trên bất kỳ phần tử nào.
            </li>
            <li>
              Màu thương hiệu là một ramp 16 bậc (<C>--brand-10 … 160</C>) thay vì một biến <C>--primary</C>: hover, pressed, tint chọn,
              focus và link đều lấy từ ramp. Tạo ramp ở{" "}
              <a className="text-link underline hover:text-link-hover" href="#/theme-designer">
                Theme Designer
              </a>
              .
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="example" title="Ví dụ chuyển đổi" description="Một Card shadcn và bản Yugen tương ứng.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={BEFORE_CODE} />
          <CodeBlock code={AFTER_CODE} />
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Card className="w-full max-w-sm">
              <CardHeader
                header="Thông báo"
                description="Bạn có 3 tin chưa đọc."
                action={<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm thao tác" />}
              />
              <CardContent className="text-body1 text-foreground-3">Lịch họp nhóm thiết kế đã dời sang 15:00.</CardContent>
              <CardFooter className="gap-2">
                <Badge appearance="tint" color="informative">
                  Lịch
                </Badge>
                <Button appearance="outline" size="small" className="ms-auto">
                  Xem tất cả
                </Button>
              </CardFooter>
            </Card>
          </div>
          <MessageBar intent="info" title="Checklist khi chuyển một file:" className="max-w-3xl">
            đổi import sang <C>@/components/ui</C>; <C>variant</C> → <C>appearance</C>; <C>size</C> sm / lg → small / large; class màu
            shadcn → utility token; <C>ml / mr / left / right</C> → logical; lucide → icon Fluent cỡ 20.
          </MessageBar>
          <DoDont
            dos={[
              "Thêm appearance=\"primary\" cho nút chính — mặc định là secondary.",
              "Đổi class theo vai trò (muted-foreground → foreground-3), không theo độ sáng gần giống.",
              "Dùng component hoàn chỉnh (Combobox, DatePicker, Pagination) thay cho công thức ghép tay.",
            ]}
            donts={[
              "Không mang palette Tailwind hay dark: sang — chúng không tồn tại.",
              "Không nhầm DialogContent của shadcn (bề mặt) với DialogContent của Yugen (thân).",
              "Không dùng font-medium; weight chỉ có normal và semibold.",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
