import * as React from "react";
import type { ReactNode } from "react";
import { Document20Regular } from "@fluentui/react-icons";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownOption,
  Field,
  Input,
  Link,
  MessageBar,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

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

const BASE_CSS = `/* src/index.css — @layer base: áp cho MỌI phần tử nhận focus bằng bàn phím */
:focus-visible {
  outline: 2px solid var(--colorStrokeFocus2); /* đen ở light, trắng ở dark */
  outline-offset: 1px;
  border-radius: var(--borderRadiusMedium);
}`;

const CUSTOM_CODE = `{/* Phần tử tự viết tự có vòng focus nhờ base style — chỉ cần tabIndex và role đúng */}
<div
  role="button"
  tabIndex={0}
  onClick={open}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  }}
  className="flex items-center gap-2 rounded-medium p-3 hover:bg-subtle-hover"
>
  …
</div>

{/* Trong khung overflow-hidden (list, card bo góc): kéo outline vào trong để không bị cắt */}
<a href="/files/42" className="block px-3 py-2 hover:bg-subtle-hover focus-visible:-outline-offset-2">…</a>

{/* Muốn đổi kiểu viền thì THAY bằng một chỉ báo tương đương, không xoá */}
<button className="outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus focus-visible:ring-offset-1">…</button>`;

const DIALOG_CODE = `function RenameDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Đổi tên</Button>
      </DialogTrigger>
      <DialogSurface
        // Mặc định Radix focus phần tử đầu tiên (nút X). Chuyển focus vào ô cần nhập:
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          nameRef.current?.select();
        }}
      >
        <DialogTitle>Đổi tên tệp</DialogTitle>
        <DialogContent>
          <Field label="Tên mới">
            <Input ref={nameRef} defaultValue="Báo cáo quý 3" />
          </Field>
        </DialogContent>
        <DialogActions>
          <DialogClose asChild>
            <Button>Huỷ</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="primary">Lưu</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
{/* Đóng bằng Esc, nút X hay Huỷ → focus tự quay về nút "Đổi tên" */}`;

function RenameDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Đổi tên</Button>
      </DialogTrigger>
      <DialogSurface
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          nameRef.current?.select();
        }}
      >
        <DialogTitle>Đổi tên tệp</DialogTitle>
        <DialogContent>
          <Field label="Tên mới">
            <Input ref={nameRef} defaultValue="Báo cáo quý 3" />
          </Field>
        </DialogContent>
        <DialogActions>
          <DialogClose asChild>
            <Button>Huỷ</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="primary">Lưu</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

export default function Page() {
  return (
    <>
      <DocSection
        id="how"
        title="Cách hoạt động"
        description="Một quy tắc toàn cục trong index.css vẽ outline cho :focus-visible — trình duyệt chỉ bật nó khi người dùng di chuyển bằng bàn phím, không bật khi click chuột."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={BASE_CSS} />
          <MessageBar intent="info" title="Thử ngay:" className="max-w-3xl">
            bấm vào vùng trống của khung dưới rồi nhấn <strong className="font-semibold">Tab</strong> /{" "}
            <strong className="font-semibold">Shift + Tab</strong>. Bấm chuột vào cùng các control đó — viền không xuất hiện.
          </MessageBar>
          <div className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button appearance="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button appearance="subtle" icon={<Document20Regular />} aria-label="Tài liệu" />
              <Link href={docsPath("/concepts/accessibility")}>Link</Link>
              <Checkbox label="Checkbox" defaultChecked />
              <Switch label="Switch" />
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <RadioGroup aria-label="Kích thước" layout="horizontal" defaultValue="m">
                <Radio value="s" label="Nhỏ" />
                <Radio value="m" label="Vừa" />
              </RadioGroup>
              <Tabs defaultValue="a">
                <TabsList>
                  <TabsTrigger value="a">Tổng quan</TabsTrigger>
                  <TabsTrigger value="b">Chi tiết</TabsTrigger>
                </TabsList>
              </Tabs>
              <Slider aria-label="Âm lượng" defaultValue={[40]} rootClassName="w-48" />
            </div>
          </div>
          <P>
            Utility tương ứng là <C>outline-stroke-focus</C> (token <C>colorStrokeFocus2</C>). Radio vẽ vòng quanh cả nút lẫn nhãn bằng{" "}
            <C>has-[button:focus-visible]</C> để vùng chỉ báo khớp vùng bấm.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="why"
        title="Vì sao màu của control không đổi khi focus"
        description="Fluent tách focus thành một kênh riêng: hover / pressed / selected đổi màu, còn focus chỉ thêm viền."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Trạng thái", "Tín hiệu", "Lý do"]}
            rows={[
              ["Rest → Hover → Pressed", "Nền / viền đậm dần (X → XHover → XPressed)", "Phản hồi cho con trỏ."],
              ["Selected / Checked", "Brand (nền, vạch chỉ báo, chữ semibold)", "Trạng thái lâu dài của dữ liệu."],
              ["Focus (bàn phím)", "Outline 2px đen / trắng, offset 1px", "Vị trí hiện tại — phải kết hợp được với mọi trạng thái trên."],
              ["Disabled", "Màu disabled, không opacity", "Không tương tác."],
            ]}
          />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Một tab vừa được chọn vừa đang focus vẫn đọc được cả hai: vạch brand ở đáy và viền focus bao ngoài.</li>
            <li>
              Đen / trắng luôn đạt ≥ 3:1 với mọi nền neutral của theme, bất kể brand là Sakura, Web hay brand riêng — màu brand thì không
              đảm bảo điều đó.
            </li>
            <li>Đổi màu khi focus dễ bị nhầm với hover hoặc pressed, khiến người dùng tưởng đã bấm.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="inputs"
        title="Ô nhập & mục trong danh sách"
        description="Hai ngoại lệ có chủ đích, cả hai đều thay outline bằng một chỉ báo tương đương."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Field label="Ô nhập" className="w-64">
              <Input placeholder="Click hoặc Tab vào đây" />
            </Field>
            <Field label="Dropdown" className="w-64">
              <Dropdown placeholder="Chọn màu" className="min-w-0 w-full">
                <DropdownOption value="sakura">Sakura</DropdownOption>
                <DropdownOption value="web">Web</DropdownOption>
                <DropdownOption value="teams">Teams</DropdownOption>
              </Dropdown>
            </Field>
          </div>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <strong className="font-semibold text-foreground-1">Ô nhập</strong> (Input, Textarea, Select, Dropdown, Combobox, TagPicker,
              SpinButton, DatePicker): thanh brand 2px chạy từ giữa ra ở đáy, theo <C>:focus-within</C> — hiện cả khi click, vì người dùng
              cần biết ô nào đang nhận chữ. Thẻ <C>{"<input>"}</C> bên trong đặt <C>outline-none</C> vì đã có chỉ báo thay thế.
            </li>
            <li>
              <strong className="font-semibold text-foreground-1">Mục trong widget tổng hợp</strong> (item của Menu, option của Dropdown /
              Combobox, mục Command): focus nằm ở item đang highlight, chỉ báo bằng nền <C>background-1-hover</C> theo{" "}
              <C>data-highlighted</C> / <C>data-selected</C>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="custom"
        title="Phần tử tự viết"
        description="Vì quy tắc nằm ở base, phần tử tương tác tự viết có vòng focus miễn phí. Việc của bạn là đừng vô tình xoá nó."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="w-64 overflow-hidden rounded-xlarge border border-stroke-2">
              {["Báo cáo quý 3.pdf", "Kế hoạch 2027.docx", "Ngân sách.xlsx"].map((f) => (
                <a
                  key={f}
                  href={docsPath("/concepts/focus-indicator")}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 border-b border-stroke-3 px-3 py-2 text-body1 text-foreground-1 last:border-b-0 hover:bg-subtle-hover focus-visible:-outline-offset-2"
                >
                  <Document20Regular className="shrink-0 text-foreground-3" />
                  <span className="min-w-0 truncate">{f}</span>
                </a>
              ))}
            </div>
            <p className="max-w-xs text-caption1 text-foreground-3">
              Danh sách nằm trong khung <code className="font-mono">overflow-hidden</code>: <code className="font-mono">-outline-offset-2</code> kéo
              viền vào trong để không bị cắt.
            </p>
          </div>
          <CodeBlock code={CUSTOM_CODE} />
          <DoDont
            dos={[
              "Dùng focus-visible: cho mọi style chỉ dành cho bàn phím.",
              "Kéo outline vào trong (-outline-offset-2) khi phần tử nằm sát mép khung overflow-hidden.",
              "Nếu thay outline, dùng chỉ báo tương đương: ≥ 2px, tương phản ≥ 3:1, bao quanh phần tử.",
            ]}
            donts={[
              "Không dùng outline-none / focus:outline-none mà không có chỉ báo thay thế.",
              "Không dùng focus: cho viền — nó hiện cả khi click chuột.",
              "Không chỉ đổi màu nền hay màu brand làm tín hiệu focus duy nhất.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="management"
        title="Quản lý focus: dialog, menu, popover"
        description="Radix lo phần khó: giữ focus trong Dialog / Drawer, đưa focus vào bề mặt khi mở và trả về trigger khi đóng."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <RenameDialog />
            <p className="text-body1 text-foreground-2">Mở bằng Enter, đóng bằng Esc — focus quay lại nút.</p>
          </div>
          <CodeBlock code={DIALOG_CODE} />
          <SimpleTable
            head={["Tình huống", "Việc cần làm"]}
            rows={[
              ["Mở Dialog / Drawer", <>Mặc định focus phần tử focus được đầu tiên. Dùng <C>onOpenAutoFocus</C> để chọn ô nhập chính.</>],
              ["Đóng overlay", <>Focus tự về trigger. Dùng <C>onCloseAutoFocus</C> nếu cần trả về nơi khác.</>],
              ["Trigger biến mất (xoá item vừa mở menu)", "Tự chuyển focus tới item kế tiếp hoặc tiêu đề danh sách — đừng để focus rơi về <body>."],
              ["Điều hướng trang trong SPA", "Đưa focus về tiêu đề h1 (tabIndex={-1}) hoặc vùng main của trang mới."],
              ["Nội dung tải thêm", "Giữ focus tại chỗ; thông báo số mục mới qua live region thay vì kéo focus đi."],
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
