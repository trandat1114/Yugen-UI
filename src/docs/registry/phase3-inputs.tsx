import { Fragment, useState } from "react";
import {
  ClipboardPaste20Regular,
  Copy20Regular,
  Cut20Regular,
  Delete20Regular,
  DocumentAdd20Regular,
  Edit20Regular,
  Link20Regular,
  MoreHorizontal20Regular,
  Print20Regular,
  Save20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  BreadcrumbOverflow,
  DEFAULT_RANGE_PRESETS,
  DateRangePicker,
  Field,
  InteractionTag,
  Menu,
  MenuItem,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  Overflow,
  OverflowDivider,
  OverflowItem,
  Slider,
  Tabs,
  TabsList,
  TabsTrigger,
  Tag,
  TagGroup,
  TimePicker,
  Toolbar,
  ToolbarButton,
  formatTime,
  useMediaQuery,
  useOverflowItems,
  useOverflowMenu,
  type DateRange,
  type DateRangePreset,
  type TimeSelectionErrorType,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import { declarationsOf } from "../setup";
import RAW from "./phase3-inputs.tsx?raw";

/* ======================================================================== Overflow demos */

const ACTIONS = [
  { id: "new", label: "New", icon: <DocumentAdd20Regular /> },
  { id: "save", label: "Save", icon: <Save20Regular /> },
  { id: "cut", label: "Cut", icon: <Cut20Regular /> },
  { id: "copy", label: "Copy", icon: <Copy20Regular /> },
  { id: "paste", label: "Paste", icon: <ClipboardPaste20Regular /> },
  { id: "share", label: "Share", icon: <Share20Regular /> },
  { id: "print", label: "Print", icon: <Print20Regular /> },
  { id: "delete", label: "Delete", icon: <Delete20Regular /> },
];

function ToolbarOverflowMenu({ actions }: { actions: typeof ACTIONS }) {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <ToolbarButton ref={ref} icon={<MoreHorizontal20Regular />} aria-label={`${overflowCount} more items`} />
      </MenuTrigger>
      <MenuPopover align="end">
        {actions
          .filter((a) => hiddenIds.includes(a.id))
          .map((a) => (
            <MenuItem key={a.id} icon={a.icon}>
              {a.label}
            </MenuItem>
          ))}
      </MenuPopover>
    </Menu>
  );
}

function OverflowToolbarDemo() {
  const [width, setWidth] = useState([100]);
  return (
    <div className="flex w-full flex-col gap-3">
      <Slider label="Container width (%)" showValue value={width} onValueChange={setWidth} min={25} max={100} />
      <div style={{ inlineSize: `${width[0]}%` }} className="rounded-xlarge border border-stroke-2">
        <Overflow>
          <Toolbar aria-label="Document">
            {ACTIONS.map((a) => (
              <OverflowItem key={a.id} id={a.id}>
                <ToolbarButton icon={a.icon}>{a.label}</ToolbarButton>
              </OverflowItem>
            ))}
            <ToolbarOverflowMenu actions={ACTIONS} />
          </Toolbar>
        </Overflow>
      </div>
    </div>
  );
}

const TABS = ["Overview", "Activity", "Members", "Files", "Calendar", "Reports", "Integrations", "Settings"];

function TabsOverflowMenu({ value, onSelect }: { value: string; onSelect: (tab: string) => void }) {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <ToolbarButton ref={ref} icon={<MoreHorizontal20Regular />} aria-label={`${overflowCount} more tabs`} />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuRadioGroup value={value} onValueChange={onSelect}>
          {hiddenIds.map((id) => (
            <MenuItemRadio key={id} value={id}>
              {id}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

function OverflowTabsDemo() {
  const [tab, setTab] = useState("Overview");
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full max-w-120">
      <Overflow>
        <div className="flex items-center">
          <TabsList aria-label="Project">
            {TABS.map((t) => (
              <OverflowItem key={t} id={t} priority={t === tab ? 1 : 0}>
                <TabsTrigger value={t}>{t}</TabsTrigger>
              </OverflowItem>
            ))}
          </TabsList>
          <TabsOverflowMenu value={tab} onSelect={setTab} />
        </div>
      </Overflow>
    </Tabs>
  );
}

const PATH = [
  { id: "home", label: "Home" },
  { id: "docs", label: "Docs" },
  { id: "components", label: "Components" },
  { id: "inputs", label: "Inputs" },
  { id: "pickers", label: "Pickers" },
  { id: "timepicker", label: "TimePicker" },
];

function BreadcrumbOverflowMenu() {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLLIElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <>
      <BreadcrumbItem ref={ref}>
        <BreadcrumbOverflow
          label={`${overflowCount} more items`}
          items={PATH.filter((p) => hiddenIds.includes(p.id)).map((p) => ({ key: p.id, label: p.label }))}
        />
      </BreadcrumbItem>
      <BreadcrumbDivider />
    </>
  );
}

function OverflowBreadcrumbDemo() {
  return (
    <div className="w-full max-w-100 resize-x overflow-hidden rounded-xlarge border border-stroke-2 p-1">
      <Overflow>
        <Breadcrumb>
          {PATH.map((p, i) => {
            const last = i === PATH.length - 1;
            return (
              <Fragment key={p.id}>
                <OverflowItem id={p.id} groupId={p.id} priority={i === 0 || last ? 1 : 0}>
                  <BreadcrumbItem>
                    <BreadcrumbButton current={last}>{p.label}</BreadcrumbButton>
                  </BreadcrumbItem>
                </OverflowItem>
                {!last && (
                  <OverflowDivider groupId={p.id}>
                    <BreadcrumbDivider />
                  </OverflowDivider>
                )}
                {i === 0 && <BreadcrumbOverflowMenu />}
              </Fragment>
            );
          })}
        </Breadcrumb>
      </Overflow>
    </div>
  );
}

const SKILLS = ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Fluent 2", "Vite", "Vitest", "Playwright", "Node.js"];

function TagOverflowMenu() {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <InteractionTag ref={ref} appearance="brand" aria-label={`${overflowCount} more skills`}>
          <span dir="ltr">+{overflowCount}</span>
        </InteractionTag>
      </MenuTrigger>
      <MenuPopover>
        {hiddenIds.map((id) => (
          <MenuItem key={id}>{id}</MenuItem>
        ))}
      </MenuPopover>
    </Menu>
  );
}

function OverflowTagGroupDemo() {
  return (
    <div className="w-full max-w-90">
      <Overflow>
        <TagGroup size="small" aria-label="Skills">
          {SKILLS.map((s) => (
            <OverflowItem key={s} id={s}>
              <Tag>{s}</Tag>
            </OverflowItem>
          ))}
          <TagOverflowMenu />
        </TagGroup>
      </Overflow>
    </div>
  );
}

const DOC_ACTIONS = [
  { id: "edit", label: "Edit", icon: <Edit20Regular />, priority: 3 },
  { id: "share", label: "Share", icon: <Share20Regular />, priority: 2 },
  { id: "link", label: "Copy link", icon: <Link20Regular />, priority: 0 },
  { id: "print", label: "Print", icon: <Print20Regular />, priority: 0 },
  { id: "delete", label: "Delete", icon: <Delete20Regular />, priority: 1 },
];

function OverflowPriorityDemo() {
  return (
    <div className="w-full max-w-80 rounded-xlarge border border-stroke-2">
      <Overflow minimumVisible={1}>
        <Toolbar aria-label="Document actions">
          {DOC_ACTIONS.map((a) => (
            <OverflowItem key={a.id} id={a.id} priority={a.priority}>
              <ToolbarButton icon={a.icon}>{a.label}</ToolbarButton>
            </OverflowItem>
          ))}
          <ToolbarOverflowMenu actions={DOC_ACTIONS} />
        </Toolbar>
      </Overflow>
    </div>
  );
}

/* ======================================================================== TimePicker demos */

const TIME_ERRORS: Record<TimeSelectionErrorType, string> = {
  "invalid-input": "Couldn't read that time. Try 9, 930, 9:30 PM or 21:15.",
  "out-of-start-bound": "That's earlier than allowed.",
  "out-of-end-bound": "That's later than allowed.",
};

function TimePickerDemo() {
  const [time, setTime] = useState<Date | null>(null);
  const [error, setError] = useState<TimeSelectionErrorType>();
  return (
    <div className="flex w-72 flex-col gap-2">
      <Field
        label="Meeting time"
        hint="Type 9, 930, 9:30 PM or 21:15, or pick from the list"
        validationState={error ? "error" : "none"}
        validationMessage={error ? TIME_ERRORS[error] : undefined}
      >
        <TimePicker
          value={time}
          onTimeChange={(_, data) => {
            setTime(data.selectedTime);
            setError(data.errorType);
          }}
        />
      </Field>
      <span className="text-caption1 text-foreground-3">{time ? `Selected ${formatTime(time)}` : "No time selected"}</span>
    </div>
  );
}

function WorkHoursDemo() {
  const [error, setError] = useState<TimeSelectionErrorType>();
  return (
    <Field
      label="Appointment (8 AM – 6 PM)"
      required
      validationState={error ? "error" : "none"}
      validationMessage={error ? TIME_ERRORS[error] : undefined}
      className="w-72"
    >
      <TimePicker startHour={8} endHour={18} increment={15} onTimeChange={(_, data) => setError(data.errorType)} />
    </Field>
  );
}

function MinMaxDemo() {
  const [error, setError] = useState<TimeSelectionErrorType>();
  const day = new Date(2026, 9, 20);
  return (
    <Field
      label="Afternoon pickup, Oct 20"
      hint="Between 1:30 PM and 5:00 PM"
      validationState={error ? "error" : "none"}
      validationMessage={error ? TIME_ERRORS[error] : undefined}
      className="w-72"
    >
      <TimePicker
        dateAnchor={day}
        minTime={new Date(2026, 9, 20, 13, 30)}
        maxTime={new Date(2026, 9, 20, 17, 0)}
        onTimeChange={(_, data) => setError(data.errorType)}
      />
    </Field>
  );
}

/* ======================================================================== DateRangePicker presets demos */

function RangePresetsDemo() {
  const [range, setRange] = useState<DateRange | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <Field label="Report period" className="w-80">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        presets={DEFAULT_RANGE_PRESETS}
        numberOfMonths={isDesktop ? 2 : 1}
        clearable
      />
    </Field>
  );
}

const QUARTER_PRESETS: DateRangePreset[] = [
  {
    label: "This quarter",
    range: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3) * 3;
      return { from: new Date(now.getFullYear(), q, 1), to: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    },
  },
  {
    label: "This year",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    },
  },
  {
    label: "Last year",
    range: () => {
      const y = new Date().getFullYear() - 1;
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
    },
  },
  {
    label: "Next 30 days",
    range: () => {
      const now = new Date();
      return { from: now, to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29) };
    },
  },
];

/* ======================================================================== Docs */

export const docs: ComponentDoc[] = [
  /* ===== Overflow ===== */
  {
    slug: "overflow",
    name: "Overflow",
    category: "Bố cục",
    lead: "Overflow thu các item không vừa chiều rộng vào nút menu \"…\", theo thứ tự ưu tiên.",
    description:
      "Bọc container (Toolbar, TabsList, Breadcrumb, TagGroup hay một div flex) bằng `<Overflow>` và từng item bằng `<OverflowItem id priority>`. Kích thước đo bằng ResizeObserver và được cache; item bị ẩn vẫn mounted nhưng gắn `hidden` + `data-overflowing` nên không focus được. Nút menu dùng `useOverflowMenu()` (ref + số item ẩn) và `useOverflowItems()` (id các item ẩn theo thứ tự) để render MenuItem tương ứng. Render đầu tiên (và SSR) luôn hiện đủ item; RTL hoạt động vì chỉ đo độ rộng, không giả định trái/phải.",
    importCode: `import { Overflow, OverflowItem, OverflowDivider, useOverflowMenu, useOverflowItems } from "@/components/ui";`,
    hero: {
      title: "Toolbar co giãn",
      description: "Kéo slider để thu hẹp khung — nút cuối lần lượt chui vào menu \"…\".",
      code: `const ACTIONS = [
  { id: "new", label: "New", icon: <DocumentAdd20Regular /> },
  { id: "save", label: "Save", icon: <Save20Regular /> },
  { id: "cut", label: "Cut", icon: <Cut20Regular /> },
  { id: "copy", label: "Copy", icon: <Copy20Regular /> },
  { id: "paste", label: "Paste", icon: <ClipboardPaste20Regular /> },
  { id: "share", label: "Share", icon: <Share20Regular /> },
  { id: "print", label: "Print", icon: <Print20Regular /> },
  { id: "delete", label: "Delete", icon: <Delete20Regular /> },
];

function ToolbarOverflowMenu({ actions }: { actions: typeof ACTIONS }) {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <ToolbarButton ref={ref} icon={<MoreHorizontal20Regular />} aria-label={\`\${overflowCount} more items\`} />
      </MenuTrigger>
      <MenuPopover align="end">
        {actions
          .filter((a) => hiddenIds.includes(a.id))
          .map((a) => (
            <MenuItem key={a.id} icon={a.icon}>
              {a.label}
            </MenuItem>
          ))}
      </MenuPopover>
    </Menu>
  );
}

function OverflowToolbarDemo() {
  const [width, setWidth] = useState([100]);
  return (
    <div className="flex w-full flex-col gap-3">
      <Slider label="Container width (%)" showValue value={width} onValueChange={setWidth} min={25} max={100} />
      <div style={{ inlineSize: \`\${width[0]}%\` }} className="rounded-xlarge border border-stroke-2">
        <Overflow>
          <Toolbar aria-label="Document">
            {ACTIONS.map((a) => (
              <OverflowItem key={a.id} id={a.id}>
                <ToolbarButton icon={a.icon}>{a.label}</ToolbarButton>
              </OverflowItem>
            ))}
            <ToolbarOverflowMenu actions={ACTIONS} />
          </Toolbar>
        </Overflow>
      </div>
    </div>
  );
}`,
      render: () => <OverflowToolbarDemo />,
    },
    examples: [
      {
        title: "Ưu tiên & minimumVisible",
        setup: declarationsOf(RAW, ["ACTIONS", "ToolbarOverflowMenu"]),
        description:
          "priority lớn hơn ở lại lâu hơn: Sửa (3) → Chia sẻ (2) → Xoá (1) → phần còn lại. minimumVisible={1} giữ ít nhất một nút dù khung rất hẹp.",
        code: `const DOC_ACTIONS = [
  { id: "edit", label: "Edit", icon: <Edit20Regular />, priority: 3 },
  { id: "share", label: "Share", icon: <Share20Regular />, priority: 2 },
  { id: "link", label: "Copy link", icon: <Link20Regular />, priority: 0 },
  { id: "print", label: "Print", icon: <Print20Regular />, priority: 0 },
  { id: "delete", label: "Delete", icon: <Delete20Regular />, priority: 1 },
];

function OverflowPriorityDemo() {
  return (
    <div className="w-full max-w-80 rounded-xlarge border border-stroke-2">
      <Overflow minimumVisible={1}>
        <Toolbar aria-label="Document actions">
          {DOC_ACTIONS.map((a) => (
            <OverflowItem key={a.id} id={a.id} priority={a.priority}>
              <ToolbarButton icon={a.icon}>{a.label}</ToolbarButton>
            </OverflowItem>
          ))}
          <ToolbarOverflowMenu actions={DOC_ACTIONS} />
        </Toolbar>
      </Overflow>
    </div>
  );
}`,
        render: () => <OverflowPriorityDemo />,
      },
      {
        title: "Tabs",
        description:
          "Tab đang chọn có priority 1 nên luôn hiển thị; chọn tab trong menu sẽ đưa nó ra ngoài. Nút menu nằm ngoài TabsList (tablist chỉ nên chứa tab).",
        code: `const TABS = ["Overview", "Activity", "Members", "Files", "Calendar", "Reports", "Integrations", "Settings"];

function TabsOverflowMenu({ value, onSelect }: { value: string; onSelect: (tab: string) => void }) {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <ToolbarButton ref={ref} icon={<MoreHorizontal20Regular />} aria-label={\`\${overflowCount} more tabs\`} />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuRadioGroup value={value} onValueChange={onSelect}>
          {hiddenIds.map((id) => (
            <MenuItemRadio key={id} value={id}>
              {id}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

function OverflowTabsDemo() {
  const [tab, setTab] = useState("Overview");
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full max-w-120">
      <Overflow>
        <div className="flex items-center">
          <TabsList aria-label="Project">
            {TABS.map((t) => (
              <OverflowItem key={t} id={t} priority={t === tab ? 1 : 0}>
                <TabsTrigger value={t}>{t}</TabsTrigger>
              </OverflowItem>
            ))}
          </TabsList>
          <TabsOverflowMenu value={tab} onSelect={setTab} />
        </div>
      </Overflow>
    </Tabs>
  );
}`,
        render: () => <OverflowTabsDemo />,
      },
      {
        title: "Breadcrumb & OverflowDivider",
        description:
          "Mỗi mục có groupId riêng; OverflowDivider ẩn cùng nhóm. Mục đầu và trang hiện tại có priority 1, phần giữa gom vào \"…\". Kéo góc khung để đổi độ rộng.",
        code: `const PATH = [
  { id: "home", label: "Home" },
  { id: "docs", label: "Docs" },
  { id: "components", label: "Components" },
  { id: "inputs", label: "Inputs" },
  { id: "pickers", label: "Pickers" },
  { id: "timepicker", label: "TimePicker" },
];

function BreadcrumbOverflowMenu() {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLLIElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <>
      <BreadcrumbItem ref={ref}>
        <BreadcrumbOverflow
          label={\`\${overflowCount} more items\`}
          items={PATH.filter((p) => hiddenIds.includes(p.id)).map((p) => ({ key: p.id, label: p.label }))}
        />
      </BreadcrumbItem>
      <BreadcrumbDivider />
    </>
  );
}

function OverflowBreadcrumbDemo() {
  return (
    <div className="w-full max-w-100 resize-x overflow-hidden rounded-xlarge border border-stroke-2 p-1">
      <Overflow>
        <Breadcrumb>
          {PATH.map((p, i) => {
            const last = i === PATH.length - 1;
            return (
              <Fragment key={p.id}>
                <OverflowItem id={p.id} groupId={p.id} priority={i === 0 || last ? 1 : 0}>
                  <BreadcrumbItem>
                    <BreadcrumbButton current={last}>{p.label}</BreadcrumbButton>
                  </BreadcrumbItem>
                </OverflowItem>
                {!last && (
                  <OverflowDivider groupId={p.id}>
                    <BreadcrumbDivider />
                  </OverflowDivider>
                )}
                {i === 0 && <BreadcrumbOverflowMenu />}
              </Fragment>
            );
          })}
        </Breadcrumb>
      </Overflow>
    </div>
  );
}`,
        render: () => <OverflowBreadcrumbDemo />,
      },
      {
        title: "TagGroup \"+N\"",
        description: "Tag không vừa một dòng gom vào InteractionTag \"+N\" mở menu.",
        code: `const SKILLS = ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Fluent 2", "Vite", "Vitest", "Playwright", "Node.js"];

function TagOverflowMenu() {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();
  const hiddenIds = useOverflowItems();
  if (!isOverflowing) return null;
  return (
    <Menu>
      <MenuTrigger asChild>
        <InteractionTag ref={ref} appearance="brand" aria-label={\`\${overflowCount} more skills\`}>
          <span dir="ltr">+{overflowCount}</span>
        </InteractionTag>
      </MenuTrigger>
      <MenuPopover>
        {hiddenIds.map((id) => (
          <MenuItem key={id}>{id}</MenuItem>
        ))}
      </MenuPopover>
    </Menu>
  );
}

function OverflowTagGroupDemo() {
  return (
    <div className="w-full max-w-90">
      <Overflow>
        <TagGroup size="small" aria-label="Skills">
          {SKILLS.map((s) => (
            <OverflowItem key={s} id={s}>
              <Tag>{s}</Tag>
            </OverflowItem>
          ))}
          <TagOverflowMenu />
        </TagGroup>
      </Overflow>
    </div>
  );
}`,
        render: () => <OverflowTagGroupDemo />,
      },
    ],
    dos: [
      "Chỉ render nút menu khi `isOverflowing` và gắn `ref` của `useOverflowMenu()` lên phần tử ngoài cùng của nó.",
      "Đặt priority cao cho item quan trọng hoặc đang chọn (tab active, trang hiện tại) để chúng không bị ẩn.",
      "Cho container độ rộng không phụ thuộc nội dung (khối, `w-full`, `flex-1`) — Overflow tự thêm `w-full min-w-0`.",
    ],
    donts: [
      "Không để nút menu luôn hiển thị — Overflow chỉ chừa chỗ cho nó khi có item bị ẩn.",
      "Không dùng Overflow cho nội dung đọc được dạng đoạn văn — dùng truncate hoặc xuống dòng.",
      "Không đặt item có độ rộng co giãn (flex-1) bên trong: kích thước phải là kích thước tự nhiên.",
    ],
    props: [
      { name: "Overflow.children", type: "ReactElement", description: "Một container chuyển tiếp ref và nhận className." },
      { name: "overflowAxis", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Trục đo (vertical cần container cao cố định)." },
      { name: "overflowDirection", type: `"end" | "start"`, defaultValue: `"end"`, description: "Cùng priority thì ẩn từ cuối hay từ đầu." },
      { name: "minimumVisible", type: "number", defaultValue: "0", description: "Số item luôn hiển thị." },
      { name: "padding", type: "number", defaultValue: "0", description: "Khoảng (px) chừa thêm ở cuối; nút menu đã được tự đo." },
      { name: "onOverflowChange", type: "({ hiddenIds, visibleIds }) => void", description: "Gọi khi tập item ẩn thay đổi." },
      { name: "OverflowItem.id / priority / groupId", type: "string / number / string", defaultValue: "— / 0 / —", description: "Định danh, mức ưu tiên (lớn = ở lại lâu hơn), nhóm." },
      { name: "OverflowDivider.groupId", type: "string", description: "Divider ẩn khi mọi item của nhóm bị ẩn (không cần child chuyển tiếp ref)." },
      { name: "useOverflowMenu<T>()", type: "{ ref, overflowCount, isOverflowing }", description: "Cho nút menu \"…\"." },
      { name: "useOverflowItems()", type: "string[]", description: "id các item đang ẩn, theo thứ tự DOM." },
      { name: "useIsOverflowItemVisible(id) / useIsOverflowGroupVisible(groupId)", type: `boolean / "visible" | "overflow" | "hidden"`, description: "Trạng thái một item / một nhóm." },
      { name: "computeOverflow(input)", type: "(input) => { visibleIds, hiddenIds }", description: "Thuật toán thuần (không cần DOM) — dùng để test hoặc tự dựng layout." },
    ],
  },

  /* ===== TimePicker ===== */
  {
    slug: "timepicker",
    name: "TimePicker",
    category: "Nhập liệu",
    lead: "TimePicker là ô nhập kiểu combobox để chọn giờ trong danh sách hoặc gõ tự do.",
    description:
      "Danh sách giờ cách nhau `increment` phút giữa `startHour` và `endHour`; gõ \"9\", \"930\", \"9h30\", \"21:15\" hay \"9:30 PM\" rồi Enter / rời ô để xác nhận; trong lúc gõ, danh sách đánh dấu giờ gần nhất. `onTimeChange(event, { selectedTime, selectedTimeText, errorType })` báo lỗi \"invalid-input\" / \"out-of-start-bound\" / \"out-of-end-bound\" để hiển thị qua `<Field>`. Chu kỳ giờ mặc định theo `locale` (vi-VN → 24 giờ). Dùng chung vỏ ô nhập (`fieldAppearanceClass`) và option của Combobox.",
    importCode: `import { TimePicker, Field, formatTime, parseTimeString, getTimesInRange } from "@/components/ui";`,
    hero: {
      title: "Giờ họp",
      code: `const TIME_ERRORS: Record<TimeSelectionErrorType, string> = {
  "invalid-input": "Couldn't read that time. Try 9, 930, 9:30 PM or 21:15.",
  "out-of-start-bound": "That's earlier than allowed.",
  "out-of-end-bound": "That's later than allowed.",
};

function TimePickerDemo() {
  const [time, setTime] = useState<Date | null>(null);
  const [error, setError] = useState<TimeSelectionErrorType>();
  return (
    <div className="flex w-72 flex-col gap-2">
      <Field
        label="Meeting time"
        hint="Type 9, 930, 9:30 PM or 21:15, or pick from the list"
        validationState={error ? "error" : "none"}
        validationMessage={error ? TIME_ERRORS[error] : undefined}
      >
        <TimePicker
          value={time}
          onTimeChange={(_, data) => {
            setTime(data.selectedTime);
            setError(data.errorType);
          }}
        />
      </Field>
      <span className="text-caption1 text-foreground-3">{time ? \`Selected \${formatTime(time)}\` : "No time selected"}</span>
    </div>
  );
}`,
      render: () => <TimePickerDemo />,
    },
    examples: [
      {
        title: "Giờ làm việc, bước 15 phút",
        setup: declarationsOf(RAW, ["TIME_ERRORS"]),
        description: "startHour / endHour (endHour không gồm) giới hạn danh sách; gõ \"7\" hay \"19:00\" báo lỗi ngoài khoảng.",
        code: `function WorkHoursDemo() {
  const [error, setError] = useState<TimeSelectionErrorType>();
  return (
    <Field
      label="Appointment (8 AM – 6 PM)"
      required
      validationState={error ? "error" : "none"}
      validationMessage={error ? TIME_ERRORS[error] : undefined}
      className="w-72"
    >
      <TimePicker startHour={8} endHour={18} increment={15} onTimeChange={(_, data) => setError(data.errorType)} />
    </Field>
  );
}`,
        render: () => <WorkHoursDemo />,
      },
      {
        title: "minTime / maxTime & dateAnchor",
        setup: declarationsOf(RAW, ["TIME_ERRORS"]),
        description: "Chỉ so phần giờ; giờ trả về gắn vào ngày của dateAnchor.",
        code: `function MinMaxDemo() {
  const [error, setError] = useState<TimeSelectionErrorType>();
  const day = new Date(2026, 9, 20);
  return (
    <Field
      label="Afternoon pickup, Oct 20"
      hint="Between 1:30 PM and 5:00 PM"
      validationState={error ? "error" : "none"}
      validationMessage={error ? TIME_ERRORS[error] : undefined}
      className="w-72"
    >
      <TimePicker
        dateAnchor={day}
        minTime={new Date(2026, 9, 20, 13, 30)}
        maxTime={new Date(2026, 9, 20, 17, 0)}
        onTimeChange={(_, data) => setError(data.errorType)}
      />
    </Field>
  );
}`,
        render: () => <MinMaxDemo />,
      },
      {
        title: "12 giờ (SA / CH, AM / PM)",
        description: "hourCycle=\"h12\" dùng nhãn buổi của locale; locale=\"en-US\" mặc định 12 giờ.",
        code: `<div className="flex w-72 flex-col gap-3">
  <TimePicker locale="vi-VN" lang="vi" hourCycle="h12" aria-label="Giờ (12 giờ, vi-VN)" defaultValue={new Date(2026, 0, 1, 14, 30)} />
  <TimePicker locale="en-US" aria-label="Time (en-US)" defaultValue={new Date(2026, 0, 1, 9, 0)} />
</div>`,
        render: () => (
          <div className="flex w-72 flex-col gap-3">
            <TimePicker locale="vi-VN" lang="vi" hourCycle="h12" aria-label="Giờ (12 giờ, vi-VN)" defaultValue={new Date(2026, 0, 1, 14, 30)} />
            <TimePicker locale="en-US" aria-label="Time (en-US)" defaultValue={new Date(2026, 0, 1, 9, 0)} />
          </div>
        ),
      },
      {
        title: "Kích thước, appearance & disabled",
        description: "small 24px, medium 32px, large 40px; appearance như Input / Combobox.",
        code: `<div className="flex w-64 flex-col gap-3">
  <TimePicker size="small" aria-label="Time (small)" />
  <TimePicker appearance="underline" aria-label="Time (underline)" />
  <TimePicker appearance="filled-darker" size="large" aria-label="Time (filled-darker, large)" />
  <TimePicker disabled aria-label="Time (disabled)" defaultValue={new Date(2026, 0, 1, 8, 0)} />
</div>`,
        render: () => (
          <div className="flex w-64 flex-col gap-3">
            <TimePicker size="small" aria-label="Time (small)" />
            <TimePicker appearance="underline" aria-label="Time (underline)" />
            <TimePicker appearance="filled-darker" size="large" aria-label="Time (filled-darker, large)" />
            <TimePicker disabled aria-label="Time (disabled)" defaultValue={new Date(2026, 0, 1, 8, 0)} />
          </div>
        ),
      },
    ],
    dos: [
      "Bọc trong `<Field>` và hiển thị thông báo theo `errorType` của onTimeChange.",
      "Chọn increment phù hợp (15 / 30 phút) để danh sách ngắn gọn — giờ lẻ vẫn gõ được.",
      "Đặt startHour / endHour hoặc minTime / maxTime thay vì kiểm tra thủ công sau khi chọn.",
    ],
    donts: [
      "Không dùng TimePicker cho khoảng thời lượng (\"2 giờ 30 phút\") — dùng SpinButton.",
      "Không tự định dạng giờ khác nhau giữa các màn hình — dùng hourCycle / locale.",
    ],
    props: [
      { name: "value / defaultValue", type: "Date | null", description: "Giờ đã chọn (controlled / uncontrolled)." },
      { name: "onTimeChange", type: "(event, { selectedTime, selectedTimeText, errorType? }) => void", description: "Chọn option hoặc xác nhận chữ gõ (Enter / rời ô)." },
      { name: "onValueChange", type: "(value: Date | null) => void", description: "Gọi khi giờ đã chọn đổi; null khi xoá trống hoặc chữ gõ không hợp lệ." },
      { name: "increment", type: "number", defaultValue: "30", description: "Bước giữa các option (phút)." },
      { name: "startHour / endHour", type: "number", defaultValue: "0 / 24", description: "Giờ đầu (gồm) và giờ cuối (không gồm)." },
      { name: "minTime / maxTime", type: "Date", description: "Giờ sớm / muộn nhất (gồm, chỉ so phần giờ)." },
      { name: "hourCycle", type: `"h23" | "h12"`, defaultValue: "theo locale", description: "24 giờ hoặc 12 giờ có nhãn buổi." },
      { name: "locale", type: "string", defaultValue: `"vi-VN"`, description: "Quyết định hourCycle mặc định và nhãn SA/CH, AM/PM." },
      { name: "dateAnchor", type: "Date", defaultValue: "ngày của value / hôm nay", description: "Ngày gắn vào giờ trả về." },
      { name: "formatDateToTimeString", type: "(date: Date) => string", description: "Định dạng hiển thị tuỳ biến." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu vỏ ô nhập." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "disabled / required / id / aria-*", type: "—", description: "Field tự truyền khi bọc trong <Field>." },
      { name: "formatTime / parseTimeString / getTimesInRange / getTimeBoundsError", type: "helper", description: "Hàm thuần để định dạng, phân tích chữ gõ, sinh danh sách giờ và kiểm tra khoảng." },
    ],
  },

  /* ===== DateRangePicker presets ===== */
  {
    slug: "daterangepresets",
    name: "DateRangePicker · preset",
    category: "Nhập liệu",
    lead: "DateRangePicker có danh sách chọn nhanh khoảng ngày cạnh lịch.",
    description:
      "Truyền `presets` (mảng `{ label, range: () => ({ from, to }) }`) để hiện các lựa chọn nhanh bên cạnh lịch; ở màn hẹp danh sách xếp phía trên. `DEFAULT_RANGE_PRESETS` gồm Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước, luôn tính theo thời điểm hiện tại; nhãn lấy từ `messages.dateRangePicker` của YugenProvider. Preset khớp khoảng đang chọn được đánh dấu (aria-pressed); preset vượt minDate / maxDate bị vô hiệu. Mọi prop cũ của DateRangePicker giữ nguyên.",
    importCode: `import { DateRangePicker, DEFAULT_RANGE_PRESETS, type DateRangePreset } from "@/components/ui";`,
    hero: {
      title: "Khoảng báo cáo",
      description: "Hai tháng trên desktop, một tháng trên mobile (useMediaQuery).",
      code: `function RangePresetsDemo() {
  const [range, setRange] = useState<DateRange | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <Field label="Report period" className="w-80">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        presets={DEFAULT_RANGE_PRESETS}
        numberOfMonths={isDesktop ? 2 : 1}
        clearable
      />
    </Field>
  );
}`,
      render: () => <RangePresetsDemo />,
    },
    examples: [
      {
        title: "Preset tuỳ biến & maxDate",
        description: "maxDate = hôm nay nên \"30 ngày tới\" bị vô hiệu.",
        code: `const QUARTER_PRESETS: DateRangePreset[] = [
  {
    label: "This quarter",
    range: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3) * 3;
      return { from: new Date(now.getFullYear(), q, 1), to: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    },
  },
  {
    label: "This year",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    },
  },
  {
    label: "Last year",
    range: () => {
      const y = new Date().getFullYear() - 1;
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
    },
  },
  {
    label: "Next 30 days",
    range: () => {
      const now = new Date();
      return { from: now, to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29) };
    },
  },
];

<Field label="Reporting period" className="w-80">
  <DateRangePicker presets={QUARTER_PRESETS} maxDate={new Date()} numberOfMonths={1} />
</Field>`,
        render: () => (
          <Field label="Reporting period" className="w-80">
            <DateRangePicker presets={QUARTER_PRESETS} maxDate={new Date()} numberOfMonths={1} />
          </Field>
        ),
      },
    ],
    dos: [
      "Giữ 3–6 preset phổ biến nhất của nghiệp vụ; người dùng vẫn chọn tay trên lịch được.",
      "Tính khoảng trong `range()` (không phải hằng số) để preset luôn đúng theo ngày hiện tại.",
    ],
    donts: [
      "Không dùng preset cho khoảng tương lai khi đã đặt maxDate là hôm nay — preset sẽ bị vô hiệu.",
      "Không đặt nhãn preset mơ hồ (\"Gần đây\") — ghi rõ số ngày / tháng.",
    ],
    props: [
      { name: "presets", type: "DateRangePreset[]", description: "{ label, range: () => ({ from, to }) } — hiện cạnh lịch, xếp trên lịch khi màn hẹp." },
      { name: "presetsLabel", type: "string", defaultValue: `"Date range presets"`, description: "Nhãn nhóm preset cho trình đọc màn hình." },
      { name: "DEFAULT_RANGE_PRESETS", type: "DateRangePreset[]", description: "Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này (tới hôm nay), Tháng trước." },
      { name: "numberOfMonths", type: "number", defaultValue: "2", description: "Số tháng hiển thị; nên 1 trên mobile." },
      { name: "value / onValueChange / minDate / maxDate / clearable…", type: "—", description: "Như DateRangePicker (xem trang DatePicker)." },
    ],
  },
];
