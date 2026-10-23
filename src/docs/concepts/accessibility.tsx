import * as React from "react";
import type { ReactNode } from "react";
import { Accessibility24Regular, Eye24Regular, Keyboard24Regular, Speaker224Regular, TextFont24Regular } from "@fluentui/react-icons";
import { Checkbox, Kbd, KbdGroup, ProgressBar } from "@/components/ui";
import { DocSection } from "../blocks";
import { docsPath } from "../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Keys({ children }: { children: ReactNode }) {
  return <span className="inline-flex flex-wrap items-center gap-1">{children}</span>;
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

const PRINCIPLES = [
  {
    icon: <Accessibility24Regular />,
    title: "Ngữ nghĩa trước",
    body: "Phần tử gốc đúng (button, a, input, table) và role ARIA từ Radix. Không dựng nút bằng div.",
  },
  {
    icon: <Keyboard24Regular />,
    title: "Bàn phím ngang chuột",
    body: "Mọi thao tác bằng chuột đều làm được bằng bàn phím, theo mẫu tương tác của WAI-ARIA APG.",
  },
  {
    icon: <Eye24Regular />,
    title: "Thấy được trạng thái",
    body: "Focus 2px tương phản cao; chữ ≥ 4.5:1, viền control ≥ 3:1; không dùng màu làm tín hiệu duy nhất.",
  },
  {
    icon: <Speaker224Regular />,
    title: "Nghe được thay đổi",
    body: "Lỗi, thông báo và kết quả bất đồng bộ được đọc qua live region với mức độ phù hợp.",
  },
  {
    icon: <TextFont24Regular />,
    title: "Tôn trọng tuỳ chọn người dùng",
    body: "prefers-reduced-motion tắt animation lặp; theme sáng / tối theo hệ điều hành; bố cục reflow khi phóng to.",
  },
];

const CHECKLIST = [
  "Mọi control có tên truy cập: nhãn nhìn thấy (Field, Label) hoặc aria-label cho nút chỉ có icon.",
  "Đi hết luồng chính chỉ bằng bàn phím; thứ tự focus theo thứ tự đọc; focus luôn nhìn thấy.",
  "Overlay (Dialog, Drawer, Menu) trả focus về trigger khi đóng; Esc đóng được (trừ modalType=\"alert\").",
  "Chữ đạt ≥ 4.5:1, thành phần UI ≥ 3:1 ở cả light và dark (trang Màu sắc › Khả năng tiếp cận).",
  "Trạng thái không chỉ dựa vào màu: luôn kèm icon, chữ hoặc hình dạng.",
  "Tiêu đề trang đúng cấp (h1 → h2 → h3), vùng chính có landmark (header, nav, main).",
  "Ảnh có alt mô tả; ảnh trang trí có alt=\"\".",
  "Lỗi form nêu rõ cách sửa và được nối bằng aria-describedby.",
  "Kết quả bất đồng bộ (lưu, tải lên, lọc) được thông báo qua live region.",
  "Kiểm tra với một trình đọc màn hình thật và ở mức phóng to 200%.",
];

function Checklist() {
  const [done, setDone] = React.useState<boolean[]>(() => CHECKLIST.map(() => false));
  const count = done.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-5">
      <ProgressBar value={count} max={CHECKLIST.length} aria-label="Tiến độ checklist" />
      <p className="text-caption1 text-foreground-3" aria-live="polite">
        Đã hoàn thành {count} / {CHECKLIST.length}
      </p>
      <div className="flex flex-col">
        {CHECKLIST.map((item, i) => (
          <Checkbox
            key={item}
            label={item}
            checked={done[i]}
            onCheckedChange={(checked) => setDone((prev) => prev.map((v, j) => (j === i ? checked === true : v)))}
          />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <DocSection
        id="principles"
        title="Nguyên tắc"
        description="Component lo phần cơ chế (role, phím, focus); bạn lo phần nội dung (nhãn, tiêu đề, alt, thứ tự trang). Cả hai cần đủ thì giao diện mới tiếp cận được."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="flex size-10 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">{p.icon}</span>
              <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
              <p className="text-body1 text-foreground-2">{p.body}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="keyboard"
        title="Bàn phím"
        description="Tab chỉ dừng một lần ở mỗi nhóm (roving tabindex); bên trong nhóm dùng phím mũi tên. Trong RTL, ← / → được đảo theo chiều đọc."
      >
        <SimpleTable
          head={["Component", "Phím", "Hành vi"]}
          rows={[
            ["Mọi control", <Keys key="k"><Kbd>Tab</Kbd><KbdGroup><Kbd>Shift</Kbd>+<Kbd>Tab</Kbd></KbdGroup></Keys>, "Tới / lùi control kế tiếp theo thứ tự DOM."],
            ["Button, ToggleButton, Link", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd></Keys>, "Kích hoạt (Link chỉ Enter). ToggleButton đổi aria-pressed."],
            ["Checkbox, Switch", <Keys key="k"><Kbd>Space</Kbd></Keys>, "Đổi trạng thái."],
            ["RadioGroup, ToggleGroup, Toolbar", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Di chuyển trong nhóm (RadioGroup chọn luôn mục mới)."],
            ["Tabs", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Chuyển tab và hiện panel tương ứng; ↑ / ↓ khi tab dọc."],
            ["Menu, ContextMenu, Menubar", <Keys key="k"><Kbd>Enter</Kbd><Kbd>↓</Kbd><Kbd>↑</Kbd><Kbd>→</Kbd><Kbd>Esc</Kbd></Keys>, "Mở, di chuyển giữa item, → mở menu con, Esc đóng và trả focus; gõ chữ để nhảy tới item."],
            ["Dropdown", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Esc</Kbd></Keys>, "Mở listbox, chọn option, gõ chữ để nhảy (typeahead)."],
            ["Combobox, TagPicker, Command", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Enter</Kbd><Kbd>Esc</Kbd><Kbd>Backspace</Kbd></Keys>, "Gõ để lọc, ↑ / ↓ highlight, Enter chọn; Backspace ở ô trống xoá tag cuối (TagPicker)."],
            ["Slider", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>PageUp</Kbd><Kbd>PageDown</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Giảm / tăng một bước, bước lớn, về min / max."],
            ["Dialog, Drawer", <Keys key="k"><Kbd>Esc</Kbd><Kbd>Tab</Kbd></Keys>, "Focus bị giữ trong bề mặt; Esc đóng (trừ modalType=\"alert\"); đóng xong focus về trigger."],
            ["Popover, HoverCard, Tooltip", <Keys key="k"><Kbd>Esc</Kbd></Keys>, "Đóng. Tooltip mở khi trigger nhận focus bàn phím."],
            ["Accordion", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Mở / đóng panel, di chuyển giữa các header."],
            ["Tree", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd><Kbd>←</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "→ mở nhánh / vào con, ← đóng nhánh / về cha."],
            ["List (navigationMode)", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd><Kbd>←</Kbd></Keys>, "Di chuyển giữa item; chế độ composite: → / ← vào / ra nội dung tương tác trong item."],
            ["Toast", <Keys key="k"><Kbd>F8</Kbd></Keys>, "Nhảy tới vùng thông báo; Tab tới nút hành động / đóng."],
          ]}
        />
      </DocSection>

      <DocSection
        id="semantics"
        title="Ngữ nghĩa cho trình đọc màn hình"
        description="Phần lớn do Radix cung cấp; Yugen bổ sung nhãn mặc định tiếng Việt cho nút đóng, phân trang, breadcrumb."
      >
        <SimpleTable
          head={["Component", "Role / thuộc tính"]}
          rows={[
            ["Dialog / DialogSurface", <><C>role=&quot;dialog&quot;</C> hoặc <C>alertdialog</C>, <C>aria-modal</C>, tên từ DialogTitle, mô tả từ DialogDescription.</>],
            ["Menu", <><C>menu</C>, <C>menuitem</C>, <C>menuitemcheckbox</C>, <C>menuitemradio</C>, <C>aria-expanded</C> trên trigger.</>],
            ["Tabs", <><C>tablist</C>, <C>tab</C> (<C>aria-selected</C>, <C>aria-controls</C>), <C>tabpanel</C>.</>],
            ["Checkbox, Switch, Radio", <><C>checkbox</C> (<C>aria-checked=&quot;mixed&quot;</C> khi indeterminate), <C>switch</C>, <C>radiogroup</C> / <C>radio</C>.</>],
            ["Slider", <><C>slider</C> với <C>aria-valuenow / min / max</C>; tên từ <C>label</C> hoặc <C>aria-label</C>.</>],
            ["Dropdown, Combobox", <><C>combobox</C> + <C>listbox</C> / <C>option</C>, <C>aria-expanded</C>, <C>aria-activedescendant</C> (cmdk).</>],
            ["Breadcrumb, Pagination", <><C>nav</C> có <C>aria-label</C>, trang hiện tại <C>aria-current=&quot;page&quot;</C>.</>],
            ["Table", <><C>th scope=&quot;col&quot;</C>, cột sắp xếp có <C>aria-sort</C>; TableSelectionCell có nhãn “Chọn hàng”.</>],
            ["MessageBar", <><C>role=&quot;alert&quot;</C> cho error / warning, <C>role=&quot;status&quot;</C> cho info / success.</>],
            ["Toast", "Vùng thông báo của Radix: toast lỗi / cảnh báo đọc ngay (assertive), còn lại đọc lịch sự (polite)."],
            ["Spinner, ProgressBar", <><C>role=&quot;progressbar&quot;</C>, Spinner mặc định <C>aria-label=&quot;Đang tải&quot;</C>.</>],
            ["Avatar, Persona", <><C>role=&quot;img&quot;</C> với tên người; chấm trạng thái có nhãn.</>],
            ["Field, Input", <><C>label for</C>, <C>aria-describedby</C> trỏ tới hint / validation, <C>aria-invalid</C> khi lỗi.</>],
          ]}
        />
      </DocSection>

      <DocSection id="checklist" title="Checklist trước khi phát hành" description="Đánh dấu khi kiểm tra — danh sách chỉ lưu trong phiên xem này.">
        <Checklist />
      </DocSection>

      <DocSection id="tools" title="Công cụ & trang liên quan">
        <div className="flex flex-col gap-4">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Kiểm tra tự động: axe DevTools, Accessibility Insights for Web, Lighthouse (phát hiện khoảng 30–40% lỗi — phần còn lại cần kiểm thử tay).</li>
            <li>Trình đọc màn hình: NVDA (Windows, miễn phí), Narrator, VoiceOver (macOS / iOS), TalkBack (Android).</li>
            <li>
              Chrome DevTools › Rendering: giả lập <C>prefers-reduced-motion</C>, <C>prefers-color-scheme</C>, <C>forced-colors</C> và các
              dạng mù màu.
            </li>
          </ul>
          <P>Đọc tiếp:</P>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: docsPath("/concepts/component-labelling"), title: "Gắn nhãn component", body: "Field, Label, aria-label, nhãn cho nhóm." },
              { href: docsPath("/concepts/focus-indicator"), title: "Chỉ báo focus", body: ":focus-visible, thanh brand của ô nhập, quản lý focus." },
              { href: docsPath("/concepts/notifications"), title: "Thông báo & live region", body: "MessageBar, Toast, role=status / alert." },
              { href: docsPath("/concepts/truncation"), title: "Cắt chữ", body: "Khi nào cắt, cách cho xem toàn văn." },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex flex-col gap-0.5 rounded-xlarge border border-stroke-2 bg-background-1 p-4 transition-colors duration-faster hover:bg-subtle-hover"
              >
                <span className="text-subtitle2 font-semibold text-foreground-1">{l.title}</span>
                <span className="text-body1 text-foreground-2">{l.body}</span>
              </a>
            ))}
          </div>
        </div>
      </DocSection>
    </>
  );
}
