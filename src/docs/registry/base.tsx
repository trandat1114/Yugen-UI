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
      code: `<Field label="Mô tả" hint="Tối đa 200 ký tự." required className="w-80">
  <Textarea placeholder="Viết vài dòng giới thiệu…" />
</Field>`,
      render: () => (
        <Field label="Mô tả" hint="Tối đa 200 ký tự." required className="w-80">
          <Textarea placeholder="Viết vài dòng giới thiệu…" />
        </Field>
      ),
    },
    examples: [
      {
        title: "Validation",
        description: "validationState error / warning / success kèm validationMessage có icon.",
        code: `<Field label="Tên miền" validationState="error" validationMessage="Tên miền đã có người dùng." className="w-64">
  <Select defaultValue="yugen">
    <option value="yugen">yugen.vn</option>
    <option value="sakura">sakura.vn</option>
  </Select>
</Field>
<Field label="Mật khẩu" validationState="success" validationMessage="Mật khẩu mạnh." className="w-64">
  <Textarea defaultValue="••••••••••••" rows={1} />
</Field>`,
        render: () => (
          <>
            <Field label="Tên miền" validationState="error" validationMessage="Tên miền đã có người dùng." className="w-64">
              <Select defaultValue="yugen">
                <option value="yugen">yugen.vn</option>
                <option value="sakura">sakura.vn</option>
              </Select>
            </Field>
            <Field label="Mật khẩu" validationState="success" validationMessage="Mật khẩu mạnh." className="w-64">
              <Textarea defaultValue="••••••••••••" rows={1} />
            </Field>
          </>
        ),
      },
      {
        title: "Ngang (horizontal)",
        description: "Nhãn bên trái, control bên phải — dùng cho form cài đặt rộng.",
        code: `<Field label="Họ và tên" orientation="horizontal" className="w-96">
  <Textarea rows={1} placeholder="Nguyễn Văn An" />
</Field>`,
        render: () => (
          <Field label="Họ và tên" orientation="horizontal" className="w-96">
            <Textarea rows={1} placeholder="Nguyễn Văn An" />
          </Field>
        ),
      },
      {
        title: "Render-prop",
        description: "Cho control cần nhận props theo cách riêng (RadioGroup, component tự viết…).",
        code: `<Field label="Gói dịch vụ" hint="Có thể đổi bất cứ lúc nào." className="w-72">
  {(props) => (
    <RadioGroup {...props} defaultValue="pro">
      <Radio value="free" label="Miễn phí" />
      <Radio value="pro" label="Pro" />
    </RadioGroup>
  )}
</Field>`,
        render: () => (
          <Field label="Gói dịch vụ" hint="Có thể đổi bất cứ lúc nào." className="w-72">
            {(props) => (
              <RadioGroup {...props} defaultValue="pro">
                <Radio value="free" label="Miễn phí" />
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
    <Button icon={<Settings20Regular />}>Hiển thị</Button>
  </PopoverTrigger>
  <PopoverSurface withArrow className="flex w-72 flex-col gap-3">
    <p className="text-subtitle2 font-semibold">Tuỳ chọn hiển thị</p>
    <Switch label="Chế độ gọn" defaultChecked />
    <Switch label="Hiện ảnh xem trước" />
    <div className="flex justify-end">
      <PopoverClose asChild>
        <Button appearance="primary" size="small">Xong</Button>
      </PopoverClose>
    </div>
  </PopoverSurface>
</Popover>`,
      render: () => (
        <Popover>
          <PopoverTrigger asChild>
            <Button icon={<Settings20Regular />}>Hiển thị</Button>
          </PopoverTrigger>
          <PopoverSurface withArrow className="flex w-72 flex-col gap-3">
            <p className="text-subtitle2 font-semibold">Tuỳ chọn hiển thị</p>
            <Switch label="Chế độ gọn" defaultChecked />
            <Switch label="Hiện ảnh xem trước" />
            <div className="flex justify-end">
              <PopoverClose asChild>
                <Button appearance="primary" size="small">
                  Xong
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
  <PopoverSurface appearance="brand" withArrow size="small">Mẹo: nhấn / để tìm nhanh.</PopoverSurface>
</Popover>
<Popover>
  <PopoverTrigger asChild><Button>Inverted</Button></PopoverTrigger>
  <PopoverSurface appearance="inverted" withArrow size="small">Đã sao chép liên kết.</PopoverSurface>
</Popover>`,
        render: () => (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button>Brand</Button>
              </PopoverTrigger>
              <PopoverSurface appearance="brand" withArrow size="small">
                Mẹo: nhấn / để tìm nhanh.
              </PopoverSurface>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button>Inverted</Button>
              </PopoverTrigger>
              <PopoverSurface appearance="inverted" withArrow size="small">
                Đã sao chép liên kết.
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
    <Button appearance="subtle" icon={<Info16Regular />}>Đổi tên</Button>
  </PopoverTrigger>
  <PopoverSurface side="bottom" align="start" className="flex w-72 flex-col gap-2">
    <Input label="Tên mới" defaultValue="Báo cáo Q3" />
    <PopoverClose asChild>
      <Button appearance="primary" size="small" className="self-end">Lưu</Button>
    </PopoverClose>
  </PopoverSurface>
</Popover>`,
        render: () => (
          <Popover>
            <PopoverTrigger asChild>
              <Button appearance="subtle" icon={<Info16Regular />}>
                Đổi tên
              </Button>
            </PopoverTrigger>
            <PopoverSurface side="bottom" align="start" className="flex w-72 flex-col gap-2">
              <Input label="Tên mới" defaultValue="Báo cáo Q3" />
              <PopoverClose asChild>
                <Button appearance="primary" size="small" className="self-end">
                  Lưu
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
      { name: "PopoverSurface.material", type: `"glass" | "glass-clear"`, description: "Yugen Labs — bề mặt glass (mũi tên cùng màu)." },
      { name: "PopoverSurface.side / align", type: "Radix", defaultValue: `"bottom" / "center"`, description: "Vị trí so với trigger." },
    ],
  },
];
