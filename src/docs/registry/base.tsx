import { Info16Regular, Settings20Regular } from "@fluentui/react-icons";
import {
  Button,
  Field,
  Input,
  Popover,
  PopoverClose,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import type { ComponentDoc } from "../types";

export const docs: ComponentDoc[] = [
  {
    slug: "field",
    name: "Field",
    category: "Nhập liệu",
    lead: "Field gói một control nhập liệu cùng nhãn, dấu bắt buộc, gợi ý và thông báo kiểm tra.",
    description:
      "Field tự sinh id, nối label với control và gắn aria-describedby / aria-invalid. Truyền một element (Textarea, Select…) hoặc render-prop (props) => <Control {...props} /> cho control không nhận id trực tiếp.",
    importCode: `import { Field } from "@/components/ui";`,
    hero: {
      title: "Field",
      code: `<Field label="Description" hint="Up to 200 characters." required className="w-80">
  <Textarea placeholder="Write a short bio…" />
</Field>`,
      render: () => (
        <Field label="Description" hint="Up to 200 characters." required className="w-80">
          <Textarea placeholder="Write a short bio…" />
        </Field>
      ),
    },
    examples: [
      {
        title: "Validation",
        description: "validationState error / warning / success kèm validationMessage có icon.",
        code: `<Field label="Domain" validationState="error" validationMessage="This domain is already taken." className="w-64">
  <Select defaultValue="yugen">
    <option value="yugen">yugen.dev</option>
    <option value="sakura">sakura.dev</option>
  </Select>
</Field>
<Field label="Password" validationState="success" validationMessage="Strong password." className="w-64">
  <Textarea defaultValue="••••••••••••" rows={1} />
</Field>`,
        render: () => (
          <>
            <Field label="Domain" validationState="error" validationMessage="This domain is already taken." className="w-64">
              <Select defaultValue="yugen">
                <option value="yugen">yugen.dev</option>
                <option value="sakura">sakura.dev</option>
              </Select>
            </Field>
            <Field label="Password" validationState="success" validationMessage="Strong password." className="w-64">
              <Textarea defaultValue="••••••••••••" rows={1} />
            </Field>
          </>
        ),
      },
      {
        title: "Ngang (horizontal)",
        description: "Nhãn bên trái, control bên phải — dùng cho form cài đặt rộng.",
        code: `<Field label="Full name" orientation="horizontal" className="w-96">
  <Textarea rows={1} placeholder="Alex Chen" />
</Field>`,
        render: () => (
          <Field label="Full name" orientation="horizontal" className="w-96">
            <Textarea rows={1} placeholder="Alex Chen" />
          </Field>
        ),
      },
      {
        title: "Render-prop",
        description: "Cho control cần nhận props theo cách riêng (RadioGroup, component tự viết…).",
        code: `<Field label="Plan" hint="You can change this at any time." className="w-72">
  {(props) => (
    <RadioGroup {...props} defaultValue="pro">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>
  )}
</Field>`,
        render: () => (
          <Field label="Plan" hint="You can change this at any time." className="w-72">
            {(props) => (
              <RadioGroup {...props} defaultValue="pro">
                <Radio value="free" label="Free" />
                <Radio value="pro" label="Pro" />
              </RadioGroup>
            )}
          </Field>
        ),
      },
    ],
    dos: ["Mỗi control nhập liệu đều nằm trong Field (hoặc có label riêng).", "validationMessage nêu rõ cách sửa lỗi."],
    donts: ["Không dùng placeholder thay cho label.", "Không lồng Field trong Field."],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn, tự nối với control qua htmlFor." },
      { name: "required", type: "boolean", description: "Hiện dấu * đỏ và truyền required xuống control." },
      { name: "hint", type: "ReactNode", description: "Gợi ý bên dưới." },
      { name: "validationState", type: `"none" | "error" | "warning" | "success"`, defaultValue: `"none"`, description: "Trạng thái kiểm tra." },
      { name: "validationMessage", type: "ReactNode", description: "Thông điệp kèm icon trạng thái." },
      { name: "orientation", type: `"vertical" | "horizontal"`, defaultValue: `"vertical"`, description: "Bố cục nhãn." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ nhãn." },
      { name: "children", type: "ReactElement | (props) => ReactNode", description: "Control hoặc render-prop nhận id/aria-*." },
    ],
  },

  {
    slug: "popover",
    name: "Popover",
    category: "Bề mặt & overlay",
    lead: "Popover hiển thị nội dung nổi, có thể tương tác, gắn với một phần tử kích hoạt.",
    description:
      "Khác Tooltip, Popover mở bằng click và chứa được nút, form ngắn. Bề mặt dùng chung popoverSurfaceClass (shadow-16, rounded-medium) với HoverCard, Combobox, DatePicker.",
    importCode: `import { Popover, PopoverTrigger, PopoverSurface, PopoverClose } from "@/components/ui";`,
    hero: {
      title: "Popover",
      code: `<Popover>
  <PopoverTrigger asChild>
    <Button icon={<Settings20Regular />}>Display</Button>
  </PopoverTrigger>
  <PopoverSurface withArrow className="flex w-72 flex-col gap-3">
    <p className="text-subtitle2 font-semibold">Display options</p>
    <Switch label="Compact mode" defaultChecked />
    <Switch label="Show previews" />
    <div className="flex justify-end">
      <PopoverClose asChild>
        <Button appearance="primary" size="small">Done</Button>
      </PopoverClose>
    </div>
  </PopoverSurface>
</Popover>`,
      render: () => (
        <Popover>
          <PopoverTrigger asChild>
            <Button icon={<Settings20Regular />}>Display</Button>
          </PopoverTrigger>
          <PopoverSurface withArrow className="flex w-72 flex-col gap-3">
            <p className="text-subtitle2 font-semibold">Display options</p>
            <Switch label="Compact mode" defaultChecked />
            <Switch label="Show previews" />
            <div className="flex justify-end">
              <PopoverClose asChild>
                <Button appearance="primary" size="small">
                  Done
                </Button>
              </PopoverClose>
            </div>
          </PopoverSurface>
        </Popover>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "normal (mặc định), brand cho teaching/onboarding, inverted.",
        code: `<Popover>
  <PopoverTrigger asChild><Button>Brand</Button></PopoverTrigger>
  <PopoverSurface appearance="brand" withArrow size="small">Tip: press / to search.</PopoverSurface>
</Popover>
<Popover>
  <PopoverTrigger asChild><Button>Inverted</Button></PopoverTrigger>
  <PopoverSurface appearance="inverted" withArrow size="small">Link copied.</PopoverSurface>
</Popover>`,
        render: () => (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button>Brand</Button>
              </PopoverTrigger>
              <PopoverSurface appearance="brand" withArrow size="small">
                Tip: press / to search.
              </PopoverSurface>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button>Inverted</Button>
              </PopoverTrigger>
              <PopoverSurface appearance="inverted" withArrow size="small">
                Link copied.
              </PopoverSurface>
            </Popover>
          </>
        ),
      },
      {
        title: "Form ngắn",
        description: "Chỉnh nhanh một giá trị mà không mở Dialog.",
        code: `<Popover>
  <PopoverTrigger asChild>
    <Button appearance="subtle" icon={<Info16Regular />}>Rename</Button>
  </PopoverTrigger>
  <PopoverSurface side="bottom" align="start" className="flex w-72 flex-col gap-2">
    <Input label="New name" defaultValue="Q3 report" />
    <PopoverClose asChild>
      <Button appearance="primary" size="small" className="self-end">Save</Button>
    </PopoverClose>
  </PopoverSurface>
</Popover>`,
        render: () => (
          <Popover>
            <PopoverTrigger asChild>
              <Button appearance="subtle" icon={<Info16Regular />}>
                Rename
              </Button>
            </PopoverTrigger>
            <PopoverSurface side="bottom" align="start" className="flex w-72 flex-col gap-2">
              <Input label="New name" defaultValue="Q3 report" />
              <PopoverClose asChild>
                <Button appearance="primary" size="small" className="self-end">
                  Save
                </Button>
              </PopoverClose>
            </PopoverSurface>
          </Popover>
        ),
      },
    ],
    dos: ["Giữ nội dung ngắn gọn, tập trung một nhiệm vụ.", "Có cách đóng rõ ràng (nút, Esc, click ra ngoài)."],
    donts: ["Không đặt form dài hoặc nhiều bước — dùng Dialog/Drawer.", "Không dùng Popover cho chú thích thuần — dùng Tooltip."],
    props: [
      { name: "Popover.open / onOpenChange", type: "boolean / (open) => void", description: "Điều khiển trạng thái." },
      { name: "PopoverSurface.size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Padding 8 / 16 / 20px." },
      { name: "PopoverSurface.appearance", type: `"normal" | "brand" | "inverted"`, defaultValue: `"normal"`, description: "Màu bề mặt." },
      { name: "PopoverSurface.withArrow", type: "boolean", defaultValue: "false", description: "Hiện mũi tên." },
      { name: "PopoverSurface.material", type: `"glass" | "glass-clear"`, description: "Yugen Labs — bề mặt glass (mũi tên cùng màu), mọc ra từ nút mở khi mở." },
      { name: "PopoverSurface.side / align", type: "Radix", defaultValue: `"bottom" / "center"`, description: "Vị trí so với trigger." },
    ],
  },
];
