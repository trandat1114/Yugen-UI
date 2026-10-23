import { useId, useState } from "react";
import { Calendar20Regular, Globe20Regular, Location20Regular } from "@fluentui/react-icons";
import { Avatar, Button, Input } from "@/components/ui";
import { Field } from "@/components/ui/Field/Field";
import { Label } from "@/components/ui/Label/Label";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { Select } from "@/components/ui/Select/Select";
import { Dropdown, DropdownGroup, DropdownOption } from "@/components/ui/Dropdown/Dropdown";
import { Radio, RadioGroup } from "@/components/ui/RadioGroup/RadioGroup";
import { Combobox } from "@/components/ui/Combobox/Combobox";
import { InteractionTag, Tag, TagGroup } from "@/components/ui/Tag/Tag";
import { TagPicker } from "@/components/ui/TagPicker/TagPicker";
import { SpinButton } from "@/components/ui/SpinButton/SpinButton";
import { SearchBox } from "@/components/ui/SearchBox/SearchBox";
import { HighlightMatch } from "@/components/ui/Autocomplete/Autocomplete";
import { normalizeSearchText } from "@/components/ui/Combobox/Combobox";
import { List, ListItem } from "@/components/ui/List/List";
import { InputOTP } from "@/components/ui/InputOTP/InputOTP";
import { Rating, RatingDisplay } from "@/components/ui/Rating/Rating";
import type { ComponentDoc } from "../types";

/* ------------------------------------------------------------------ Demo có state */

function LabelInputDemo() {
  const id = useId();
  return (
    <div className="flex w-72 flex-col gap-1">
      <Label htmlFor={id} required>
        Số điện thoại
      </Label>
      <Input id={id} type="tel" placeholder="0912 345 678" />
    </div>
  );
}

function DropdownControlledDemo() {
  const [size, setSize] = useState("m");
  return (
    <div className="flex flex-col gap-2">
      <Dropdown aria-label="Cỡ áo" value={size} onValueChange={setSize}>
        <DropdownOption value="s">S</DropdownOption>
        <DropdownOption value="m">M</DropdownOption>
        <DropdownOption value="l">L</DropdownOption>
      </Dropdown>
      <span className="text-caption1 text-foreground-3">Đã chọn: {size.toUpperCase()}</span>
    </div>
  );
}

function RadioControlledDemo() {
  const labelId = useId();
  const [plan, setPlan] = useState("monthly");
  return (
    <div className="flex flex-col gap-1">
      <Label id={labelId}>Chu kỳ thanh toán</Label>
      <RadioGroup aria-labelledby={labelId} value={plan} onValueChange={setPlan}>
        <Radio value="monthly" label="Hằng tháng" />
        <Radio value="yearly" label="Hằng năm (tiết kiệm 20%)" />
      </RadioGroup>
      <span className="text-caption1 text-foreground-3">Giá trị: {plan}</span>
    </div>
  );
}

function ComboboxFreeformDemo() {
  const [dessert, setDessert] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <Combobox
        freeform
        aria-label="Món tráng miệng"
        placeholder="Chọn hoặc nhập món khác"
        value={dessert}
        onValueChange={setDessert}
        options={["Chè", "Bánh flan", "Kem", "Sữa chua"]}
      />
      <span className="text-caption1 text-foreground-3">Giá trị: {dessert || "(trống)"}</span>
    </div>
  );
}

function TagDismissDemo() {
  const [tags, setTags] = useState(["React", "TypeScript", "Tailwind CSS", "Radix UI"]);
  return (
    <div className="flex flex-col items-center gap-3">
      <TagGroup aria-label="Bộ lọc" onDismiss={(value) => setTags((t) => t.filter((x) => x !== value))}>
        {tags.map((tag) => (
          <Tag key={tag} value={tag} dismissible>
            {tag}
          </Tag>
        ))}
      </TagGroup>
      {tags.length === 0 && (
        <Button size="small" onClick={() => setTags(["React", "TypeScript", "Tailwind CSS", "Radix UI"])}>
          Khôi phục
        </Button>
      )}
    </div>
  );
}

function TagPickerControlledDemo() {
  const [members, setMembers] = useState<string[]>(["Lan", "Hùng"]);
  return (
    <div className="flex w-96 flex-col gap-2">
      <TagPicker
        aria-label="Thành viên"
        value={members}
        onValueChange={setMembers}
        options={["Lan", "Hùng", "Minh", "Thảo", "Quân"]}
        tagAppearance="brand"
        tagShape="circular"
      />
      <span className="text-caption1 text-foreground-3">{members.length} thành viên được chọn</span>
    </div>
  );
}

function SpinButtonControlledDemo() {
  const [guests, setGuests] = useState<number | null>(2);
  return (
    <div className="flex flex-col gap-2">
      <SpinButton aria-label="Số khách" value={guests} onValueChange={setGuests} min={1} max={10} className="w-40" />
      <span className="text-caption1 text-foreground-3">Phòng cho {guests ?? 0} khách</span>
    </div>
  );
}

const FRUITS = [
  { name: "Xoài cát Hoà Lộc", origin: "Tiền Giang" },
  { name: "Sầu riêng Ri6", origin: "Bến Tre" },
  { name: "Măng cụt", origin: "Lái Thiêu" },
  { name: "Chôm chôm Java", origin: "Vĩnh Long" },
  { name: "Thanh long ruột đỏ", origin: "Bình Thuận" },
  { name: "Vú sữa Lò Rèn", origin: "Tiền Giang" },
];

function FruitFilterDemo() {
  const [query, setQuery] = useState("");
  const results = FRUITS.filter((f) => normalizeSearchText(f.name).includes(normalizeSearchText(query.trim())));

  return (
    <div className="w-80 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-4">
      <div className="flex flex-col gap-1 border-b border-stroke-2 p-3">
        <SearchBox aria-label="Tìm trái cây" aria-controls="fruit-results" value={query} onValueChange={setQuery} />
        <p aria-live="polite" className="text-caption1 text-foreground-3">
          {results.length} / {FRUITS.length} trái cây
        </p>
      </div>
      {results.length > 0 ? (
        <List id="fruit-results" aria-label="Kết quả" className="divide-y divide-stroke-3">
          {results.map((f) => (
            <ListItem
              key={f.name}
              media={<Avatar name={f.name} size={32} color="colorful" />}
              title={<HighlightMatch text={f.name} query={query} />}
              description={f.origin}
              className="px-3"
            />
          ))}
        </List>
      ) : (
        <p id="fruit-results" className="px-3 py-5 text-center text-body1 text-foreground-3">
          Không có trái cây nào khớp “{query}”.
        </p>
      )}
    </div>
  );
}

function InputOTPCompleteDemo() {
  const [code, setCode] = useState("");
  return (
    <div className="flex flex-col items-center gap-2">
      <InputOTP aria-label="Mã OTP" onComplete={setCode} />
      <span className="text-caption1 text-foreground-3">{code ? "Đã nhập mã " + code : "Nhập đủ 6 số"}</span>
    </div>
  );
}

function RatingHalfDemo() {
  const [score, setScore] = useState(3.5);
  return (
    <div className="flex flex-col items-center gap-2">
      <Rating step={0.5} value={score} onValueChange={setScore} color="marigold" aria-label="Chất lượng phục vụ" />
      <span className="text-caption1 text-foreground-3">{score} / 5 sao</span>
    </div>
  );
}

/* ------------------------------------------------------------------ Docs */

const SIZE_PROP = { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." };

export const docs: ComponentDoc[] = [
  /* ---------------------------------------------------------------- Label */
  {
    slug: "label",
    category: "Nhập liệu",
    name: "Label",
    lead: "Label đặt tên cho một control để người dùng biết cần nhập hoặc chọn gì.",
    description:
      "Label của Fluent có ba cỡ chữ, hai độ đậm, dấu * cho trường bắt buộc và trạng thái disabled. Khi dùng Field, label đã được tạo sẵn — chỉ dùng Label rời khi tự dựng bố cục form.",
    importCode: `import { Label } from "@/components/ui";`,
    hero: {
      title: "Label",
      code: `<div className="flex flex-col gap-2">
  <Label>Tên hiển thị</Label>
  <Label weight="semibold">Thông tin liên hệ</Label>
  <Label required>Email công việc</Label>
</div>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <Label>Tên hiển thị</Label>
          <Label weight="semibold">Thông tin liên hệ</Label>
          <Label required>Email công việc</Label>
        </div>
      ),
    },
    examples: [
      {
        title: "Kích thước",
        description: "small (12px), medium (14px, mặc định), large (16px semibold).",
        code: `<Label size="small">Small</Label>
<Label size="medium">Medium</Label>
<Label size="large">Large</Label>`,
        render: () => (
          <>
            <Label size="small">Small</Label>
            <Label size="medium">Medium</Label>
            <Label size="large">Large</Label>
          </>
        ),
      },
      {
        title: "Bắt buộc & disabled",
        description: "required thêm dấu * màu danger; disabled làm mờ nhãn.",
        code: `<Label required>Họ và tên</Label>
<Label disabled>Mã giới thiệu</Label>
<Label required disabled>Bắt buộc nhưng bị khoá</Label>`,
        render: () => (
          <>
            <Label required>Họ và tên</Label>
            <Label disabled>Mã giới thiệu</Label>
            <Label required disabled>
              Bắt buộc nhưng bị khoá
            </Label>
          </>
        ),
      },
      {
        title: "Gắn với ô nhập",
        description: "Liên kết bằng htmlFor + id (useId) để bấm nhãn là focus vào ô.",
        code: `const id = useId();

<div className="flex w-72 flex-col gap-1">
  <Label htmlFor={id} required>Số điện thoại</Label>
  <Input id={id} type="tel" placeholder="0912 345 678" />
</div>`,
        render: () => <LabelInputDemo />,
      },
    ],
    dos: [
      "Viết nhãn ngắn gọn, viết hoa chữ cái đầu.",
      "Luôn liên kết nhãn với control bằng htmlFor (hoặc dùng Field).",
      "Đánh dấu trường bắt buộc bằng required thay vì ghi chữ “(bắt buộc)”.",
    ],
    donts: [
      "Không dùng Label làm tiêu đề section — dùng type ramp subtitle.",
      "Không kết thúc nhãn bằng dấu hai chấm.",
      "Không tô màu brand cho nhãn.",
    ],
    props: [
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ 12 / 14 / 16px (large mặc định semibold)." },
      { name: "weight", type: `"regular" | "semibold"`, description: "Độ đậm; mặc định theo size." },
      { name: "required", type: "boolean | ReactNode", description: "Hiện dấu * (hoặc ký hiệu tuỳ chọn) màu danger." },
      { name: "disabled", type: "boolean", description: "Chữ màu foreground-disabled." },
      { name: "htmlFor", type: "string", description: "id của control được gắn nhãn." },
    ],
  },

  /* ------------------------------------------------------------- Textarea */
  {
    slug: "textarea",
    category: "Nhập liệu",
    name: "Textarea",
    lead: "Textarea cho phép nhập và chỉnh sửa văn bản dài trên nhiều dòng.",
    description:
      "Có cùng ngôn ngữ thị giác với Input: viền đáy stroke-accessible và thanh brand chạy từ giữa khi focus. Đặt trong Field để có label, hint và validation; chọn resize để người dùng tự kéo giãn.",
    importCode: `import { Textarea, Field } from "@/components/ui";`,
    hero: {
      title: "Textarea",
      code: `<Field label="Mô tả sự cố" hint="Nêu các bước để tái hiện lỗi." className="w-80">
  <Textarea placeholder="Nhập mô tả…" />
</Field>`,
      render: () => (
        <Field label="Mô tả sự cố" hint="Nêu các bước để tái hiện lỗi." className="w-80">
          <Textarea placeholder="Nhập mô tả…" />
        </Field>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "outline (mặc định), filled-darker, filled-lighter — filled dùng trên nền có màu tương phản.",
        code: `<div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
  <Textarea placeholder="Outline" className="w-64" />
  <Textarea appearance="filled-darker" placeholder="Filled darker" className="w-64" />
  <Textarea appearance="filled-lighter" placeholder="Filled lighter" className="w-64" />
</div>`,
        render: () => (
          <div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
            <Textarea placeholder="Outline" className="w-64" />
            <Textarea appearance="filled-darker" placeholder="Filled darker" className="w-64" />
            <Textarea appearance="filled-lighter" placeholder="Filled lighter" className="w-64" />
          </div>
        ),
      },
      {
        title: "Kích thước",
        description: "small, medium, large — đổi cỡ chữ, padding và chiều cao tối thiểu.",
        code: `<Textarea size="small" placeholder="Small" className="w-56" />
<Textarea size="medium" placeholder="Medium" className="w-56" />
<Textarea size="large" placeholder="Large" className="w-56" />`,
        render: () => (
          <>
            <Textarea size="small" placeholder="Small" className="w-56" />
            <Textarea size="medium" placeholder="Medium" className="w-56" />
            <Textarea size="large" placeholder="Large" className="w-56" />
          </>
        ),
      },
      {
        title: "Resize",
        description: "none (mặc định), vertical, horizontal, both.",
        code: `<Textarea resize="vertical" placeholder="Kéo giãn theo chiều dọc" className="w-64" />
<Textarea resize="both" placeholder="Kéo giãn tự do" />`,
        render: () => (
          <>
            <Textarea resize="vertical" placeholder="Kéo giãn theo chiều dọc" className="w-64" />
            <Textarea resize="both" placeholder="Kéo giãn tự do" />
          </>
        ),
      },
      {
        title: "Validation & disabled",
        description: "Field tự truyền aria-invalid / disabled xuống Textarea.",
        code: `<Field label="Ghi chú" required validationState="error" validationMessage="Ghi chú không được để trống." className="w-64">
  <Textarea />
</Field>
<Field label="Ghi chú hệ thống" disabled className="w-64">
  <Textarea defaultValue="Không thể chỉnh sửa" />
</Field>`,
        render: () => (
          <>
            <Field label="Ghi chú" required validationState="error" validationMessage="Ghi chú không được để trống." className="w-64">
              <Textarea />
            </Field>
            <Field label="Ghi chú hệ thống" disabled className="w-64">
              <Textarea defaultValue="Không thể chỉnh sửa" />
            </Field>
          </>
        ),
      },
    ],
    dos: [
      "Dùng cho nội dung có thể dài hơn một dòng (mô tả, phản hồi, ghi chú).",
      "Cho phép resize vertical khi độ dài nội dung khó đoán.",
      "Nêu giới hạn ký tự trong hint nếu có.",
    ],
    donts: [
      "Không dùng Textarea cho dữ liệu một dòng như tên, email — dùng Input.",
      "Không để Textarea quá thấp khiến người dùng phải cuộn ngay từ đầu.",
    ],
    props: [
      { name: "appearance", type: `"outline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô nhập." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ, padding, chiều cao tối thiểu 40 / 52 / 64px." },
      { name: "resize", type: `"none" | "vertical" | "horizontal" | "both"`, defaultValue: `"none"`, description: "Hướng cho phép kéo giãn." },
      { name: "className", type: "string", description: "Class cho khung ngoài (đặt width)." },
      { name: "textareaClassName", type: "string", description: "Class cho chính thẻ textarea." },
      { name: "value, onChange, rows…", type: "TextareaHTMLAttributes", description: "Thuộc tính gốc của textarea." },
    ],
  },

  /* --------------------------------------------------------------- Select */
  {
    slug: "select",
    category: "Nhập liệu",
    name: "Select",
    lead: "Select cho phép chọn một giá trị từ danh sách bằng thẻ select gốc của trình duyệt.",
    description:
      "Dùng thẻ <select> native nên danh sách mở ra theo giao diện hệ điều hành — rất hợp với thiết bị di động và form đơn giản. Cần option có icon, nhóm tuỳ biến hay giao diện đồng nhất thì dùng Dropdown.",
    importCode: `import { Select, Field } from "@/components/ui";`,
    hero: {
      title: "Select",
      code: `<Field label="Quốc gia" className="w-64">
  <Select defaultValue="vn">
    <option value="vn">Việt Nam</option>
    <option value="jp">Nhật Bản</option>
    <option value="kr">Hàn Quốc</option>
    <option value="sg">Singapore</option>
  </Select>
</Field>`,
      render: () => (
        <Field label="Quốc gia" className="w-64">
          <Select defaultValue="vn">
            <option value="vn">Việt Nam</option>
            <option value="jp">Nhật Bản</option>
            <option value="kr">Hàn Quốc</option>
            <option value="sg">Singapore</option>
          </Select>
        </Field>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "outline (mặc định), underline, filled-darker, filled-lighter.",
        code: `<div className="grid w-64 gap-3 rounded-xlarge bg-background-1 p-4">
  <Select aria-label="Outline"><option>Outline</option></Select>
  <Select appearance="underline" aria-label="Underline"><option>Underline</option></Select>
  <Select appearance="filled-darker" aria-label="Filled darker"><option>Filled darker</option></Select>
  <Select appearance="filled-lighter" aria-label="Filled lighter"><option>Filled lighter</option></Select>
</div>`,
        render: () => (
          <div className="grid w-64 gap-3 rounded-xlarge bg-background-1 p-4">
            <Select aria-label="Outline">
              <option>Outline</option>
            </Select>
            <Select appearance="underline" aria-label="Underline">
              <option>Underline</option>
            </Select>
            <Select appearance="filled-darker" aria-label="Filled darker">
              <option>Filled darker</option>
            </Select>
            <Select appearance="filled-lighter" aria-label="Filled lighter">
              <option>Filled lighter</option>
            </Select>
          </div>
        ),
      },
      {
        title: "Kích thước",
        description: "small (24px), medium (32px), large (40px).",
        code: `<Select size="small" aria-label="Small" className="w-40"><option>Small</option></Select>
<Select size="medium" aria-label="Medium" className="w-40"><option>Medium</option></Select>
<Select size="large" aria-label="Large" className="w-40"><option>Large</option></Select>`,
        render: () => (
          <>
            <Select size="small" aria-label="Small" className="w-40">
              <option>Small</option>
            </Select>
            <Select size="medium" aria-label="Medium" className="w-40">
              <option>Medium</option>
            </Select>
            <Select size="large" aria-label="Large" className="w-40">
              <option>Large</option>
            </Select>
          </>
        ),
      },
      {
        title: "Nhóm option & disabled",
        description: "optgroup gom nhóm; option hoặc cả Select đều có thể disabled.",
        code: `<Select aria-label="Múi giờ" defaultValue="hn" className="w-64">
  <optgroup label="Châu Á">
    <option value="hn">(UTC+07:00) Hà Nội</option>
    <option value="tokyo">(UTC+09:00) Tokyo</option>
  </optgroup>
  <optgroup label="Châu Âu">
    <option value="london">(UTC+00:00) London</option>
    <option value="paris" disabled>(UTC+01:00) Paris</option>
  </optgroup>
</Select>
<Select aria-label="Disabled" disabled className="w-40"><option>Disabled</option></Select>`,
        render: () => (
          <>
            <Select aria-label="Múi giờ" defaultValue="hn" className="w-64">
              <optgroup label="Châu Á">
                <option value="hn">(UTC+07:00) Hà Nội</option>
                <option value="tokyo">(UTC+09:00) Tokyo</option>
              </optgroup>
              <optgroup label="Châu Âu">
                <option value="london">(UTC+00:00) London</option>
                <option value="paris" disabled>
                  (UTC+01:00) Paris
                </option>
              </optgroup>
            </Select>
            <Select aria-label="Disabled" disabled className="w-40">
              <option>Disabled</option>
            </Select>
          </>
        ),
      },
    ],
    dos: [
      "Dùng cho danh sách ngắn đến trung bình, giá trị là văn bản thuần.",
      "Ưu tiên Select trong form trên di động — picker hệ điều hành dễ thao tác.",
      "Sắp xếp option theo thứ tự có ý nghĩa (chữ cái, tần suất, logic).",
    ],
    donts: [
      "Không dùng khi option cần icon, avatar hay mô tả phụ — dùng Dropdown.",
      "Không dùng cho danh sách rất dài cần tìm kiếm — dùng Combobox.",
    ],
    props: [
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô." },
      SIZE_PROP,
      { name: "className", type: "string", description: "Class cho khung ngoài (đặt width)." },
      { name: "selectClassName", type: "string", description: "Class cho chính thẻ select." },
      { name: "value, defaultValue, onChange, disabled…", type: "SelectHTMLAttributes", description: "Thuộc tính gốc của select." },
    ],
  },

  /* ------------------------------------------------------------- Dropdown */
  {
    slug: "dropdown",
    category: "Nhập liệu",
    name: "Dropdown",
    lead: "Dropdown cho phép chọn một lựa chọn từ listbox tuỳ biến mở ra bên dưới ô.",
    description:
      "Khác với Select, listbox được vẽ bằng bề mặt Fluent (shadow-16, rounded-medium) nên hỗ trợ dấu tick, nhóm có tiêu đề, option disabled và nội dung tuỳ biến. Bàn phím: mũi tên, Home/End, gõ ký tự để nhảy, Enter để chọn, Esc để đóng.",
    importCode: `import { Dropdown, DropdownOption, DropdownGroup, DropdownDivider } from "@/components/ui";`,
    hero: {
      title: "Dropdown",
      code: `<Field label="Phòng ban" className="w-72">
  <Dropdown placeholder="Chọn phòng ban">
    <DropdownOption value="design">Thiết kế</DropdownOption>
    <DropdownOption value="dev">Phát triển</DropdownOption>
    <DropdownOption value="marketing">Marketing</DropdownOption>
    <DropdownOption value="sales">Kinh doanh</DropdownOption>
  </Dropdown>
</Field>`,
      render: () => (
        <Field label="Phòng ban" className="w-72">
          <Dropdown placeholder="Chọn phòng ban">
            <DropdownOption value="design">Thiết kế</DropdownOption>
            <DropdownOption value="dev">Phát triển</DropdownOption>
            <DropdownOption value="marketing">Marketing</DropdownOption>
            <DropdownOption value="sales">Kinh doanh</DropdownOption>
          </Dropdown>
        </Field>
      ),
    },
    examples: [
      {
        title: "Nhóm & option disabled",
        description: "DropdownGroup thêm tiêu đề; các nhóm tự cách nhau bằng vạch chia.",
        code: `<Dropdown aria-label="Thú cưng" placeholder="Chọn thú cưng">
  <DropdownGroup label="Trên cạn">
    <DropdownOption value="dog">Chó</DropdownOption>
    <DropdownOption value="cat">Mèo</DropdownOption>
  </DropdownGroup>
  <DropdownGroup label="Dưới nước">
    <DropdownOption value="fish">Cá vàng</DropdownOption>
    <DropdownOption value="turtle" disabled>Rùa (hết hàng)</DropdownOption>
  </DropdownGroup>
</Dropdown>`,
        render: () => (
          <Dropdown aria-label="Thú cưng" placeholder="Chọn thú cưng">
            <DropdownGroup label="Trên cạn">
              <DropdownOption value="dog">Chó</DropdownOption>
              <DropdownOption value="cat">Mèo</DropdownOption>
            </DropdownGroup>
            <DropdownGroup label="Dưới nước">
              <DropdownOption value="fish">Cá vàng</DropdownOption>
              <DropdownOption value="turtle" disabled>
                Rùa (hết hàng)
              </DropdownOption>
            </DropdownGroup>
          </Dropdown>
        ),
      },
      {
        title: "Controlled",
        description: "value / onValueChange.",
        code: `const [size, setSize] = useState("m");

<div className="flex flex-col gap-2">
  <Dropdown aria-label="Cỡ áo" value={size} onValueChange={setSize}>
    <DropdownOption value="s">S</DropdownOption>
    <DropdownOption value="m">M</DropdownOption>
    <DropdownOption value="l">L</DropdownOption>
  </Dropdown>
  <span className="text-caption1 text-foreground-3">Đã chọn: {size.toUpperCase()}</span>
</div>`,
        render: () => <DropdownControlledDemo />,
      },
      {
        title: "Option có icon",
        description: "media đặt icon trước nhãn.",
        code: `<Dropdown aria-label="Vị trí" defaultValue="office">
  <DropdownOption value="office" media={<Location20Regular />}>Văn phòng</DropdownOption>
  <DropdownOption value="remote" media={<Globe20Regular />}>Từ xa</DropdownOption>
  <DropdownOption value="event" media={<Calendar20Regular />}>Sự kiện</DropdownOption>
</Dropdown>`,
        render: () => (
          <Dropdown aria-label="Vị trí" defaultValue="office">
            <DropdownOption value="office" media={<Location20Regular />}>
              Văn phòng
            </DropdownOption>
            <DropdownOption value="remote" media={<Globe20Regular />}>
              Từ xa
            </DropdownOption>
            <DropdownOption value="event" media={<Calendar20Regular />}>
              Sự kiện
            </DropdownOption>
          </Dropdown>
        ),
      },
      {
        title: "Appearance, kích thước & disabled",
        description: "Cùng bộ appearance / size với Input.",
        code: `<div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
  <Dropdown appearance="underline" size="small" aria-label="Underline" placeholder="Underline · small">
    <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
  </Dropdown>
  <Dropdown appearance="filled-darker" aria-label="Filled darker" placeholder="Filled darker">
    <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
  </Dropdown>
  <Dropdown size="large" aria-label="Large" placeholder="Large">
    <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
  </Dropdown>
  <Dropdown disabled aria-label="Disabled" placeholder="Disabled">
    <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
  </Dropdown>
</div>`,
        render: () => (
          <div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
            <Dropdown appearance="underline" size="small" aria-label="Underline" placeholder="Underline · small">
              <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
            </Dropdown>
            <Dropdown appearance="filled-darker" aria-label="Filled darker" placeholder="Filled darker">
              <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
            </Dropdown>
            <Dropdown size="large" aria-label="Large" placeholder="Large">
              <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
            </Dropdown>
            <Dropdown disabled aria-label="Disabled" placeholder="Disabled">
              <DropdownOption value="a">Tuỳ chọn A</DropdownOption>
            </Dropdown>
          </div>
        ),
      },
    ],
    dos: [
      "Dùng placeholder dạng hành động (“Chọn phòng ban”) khi chưa có giá trị mặc định.",
      "Nhóm option bằng DropdownGroup khi danh sách có nhiều loại.",
      "Giữ nhãn option ngắn, phân biệt rõ ràng.",
    ],
    donts: [
      "Không dùng khi chỉ có 2–3 lựa chọn luôn cần nhìn thấy — dùng RadioGroup.",
      "Không dùng cho danh sách rất dài mà không cho tìm — dùng Combobox.",
      "Không đặt hành động (lệnh) vào Dropdown — dùng Menu.",
    ],
    props: [
      { name: "placeholder", type: "ReactNode", description: "Hiện khi chưa chọn." },
      { name: "value / defaultValue", type: "string", description: "Giá trị đang chọn (controlled / uncontrolled)." },
      { name: "onValueChange", type: "(value: string) => void", description: "Callback khi chọn." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô trigger." },
      SIZE_PROP,
      { name: "disabled, required, name", type: "boolean / string", description: "Như form control gốc." },
      { name: "className / listboxClassName", type: "string", description: "Class cho trigger / bề mặt listbox." },
      { name: "DropdownOption.media", type: "ReactNode", description: "Icon trước nhãn option." },
      { name: "DropdownGroup.label", type: "ReactNode", description: "Tiêu đề nhóm." },
    ],
  },

  /* ----------------------------------------------------------- RadioGroup */
  {
    slug: "radiogroup",
    category: "Nhập liệu",
    name: "RadioGroup",
    lead: "RadioGroup cho phép chọn đúng một lựa chọn trong một tập loại trừ lẫn nhau.",
    description:
      "Nút tròn 16px viền stroke-accessible; khi chọn, viền chuyển brand và có chấm brand 10px. Nhãn chưa chọn màu foreground-3, đậm dần khi hover và khi được chọn. Tab vào nhóm, phím mũi tên để đổi lựa chọn.",
    importCode: `import { RadioGroup, Radio } from "@/components/ui";`,
    hero: {
      title: "RadioGroup",
      code: `<RadioGroup defaultValue="email" aria-label="Kênh nhận thông báo">
  <Radio value="email" label="Email" />
  <Radio value="sms" label="Tin nhắn SMS" />
  <Radio value="push" label="Thông báo đẩy" />
</RadioGroup>`,
      render: () => (
        <RadioGroup defaultValue="email" aria-label="Kênh nhận thông báo">
          <Radio value="email" label="Email" />
          <Radio value="sms" label="Tin nhắn SMS" />
          <Radio value="push" label="Thông báo đẩy" />
        </RadioGroup>
      ),
    },
    examples: [
      {
        title: "Layout ngang",
        description: "layout=\"horizontal\" khi chỉ có vài lựa chọn ngắn.",
        code: `<RadioGroup layout="horizontal" defaultValue="m" aria-label="Cỡ áo">
  <Radio value="s" label="S" />
  <Radio value="m" label="M" />
  <Radio value="l" label="L" />
  <Radio value="xl" label="XL" />
</RadioGroup>`,
        render: () => (
          <RadioGroup layout="horizontal" defaultValue="m" aria-label="Cỡ áo">
            <Radio value="s" label="S" />
            <Radio value="m" label="M" />
            <Radio value="l" label="L" />
            <Radio value="xl" label="XL" />
          </RadioGroup>
        ),
      },
      {
        title: "Ngang, nhãn bên dưới",
        description: "layout=\"horizontal-stacked\" — hợp với thang đo.",
        code: `<RadioGroup layout="horizontal-stacked" defaultValue="3" aria-label="Mức độ hài lòng">
  <Radio value="1" label="Rất tệ" />
  <Radio value="2" label="Tệ" />
  <Radio value="3" label="Bình thường" />
  <Radio value="4" label="Tốt" />
  <Radio value="5" label="Rất tốt" />
</RadioGroup>`,
        render: () => (
          <RadioGroup layout="horizontal-stacked" defaultValue="3" aria-label="Mức độ hài lòng">
            <Radio value="1" label="Rất tệ" />
            <Radio value="2" label="Tệ" />
            <Radio value="3" label="Bình thường" />
            <Radio value="4" label="Tốt" />
            <Radio value="5" label="Rất tốt" />
          </RadioGroup>
        ),
      },
      {
        title: "Disabled",
        description: "Khoá một lựa chọn hoặc cả nhóm.",
        code: `<RadioGroup defaultValue="standard" aria-label="Giao hàng">
  <Radio value="standard" label="Tiêu chuẩn" />
  <Radio value="express" label="Hoả tốc (tạm ngưng)" disabled />
</RadioGroup>
<RadioGroup defaultValue="a" disabled aria-label="Nhóm bị khoá">
  <Radio value="a" label="Đã chọn" />
  <Radio value="b" label="Chưa chọn" />
</RadioGroup>`,
        render: () => (
          <>
            <RadioGroup defaultValue="standard" aria-label="Giao hàng">
              <Radio value="standard" label="Tiêu chuẩn" />
              <Radio value="express" label="Hoả tốc (tạm ngưng)" disabled />
            </RadioGroup>
            <RadioGroup defaultValue="a" disabled aria-label="Nhóm bị khoá">
              <Radio value="a" label="Đã chọn" />
              <Radio value="b" label="Chưa chọn" />
            </RadioGroup>
          </>
        ),
      },
      {
        title: "Controlled + Label",
        description: "Đặt tên nhóm bằng Label + aria-labelledby.",
        code: `const labelId = useId();
const [plan, setPlan] = useState("monthly");

<div className="flex flex-col gap-1">
  <Label id={labelId}>Chu kỳ thanh toán</Label>
  <RadioGroup aria-labelledby={labelId} value={plan} onValueChange={setPlan}>
    <Radio value="monthly" label="Hằng tháng" />
    <Radio value="yearly" label="Hằng năm (tiết kiệm 20%)" />
  </RadioGroup>
  <span className="text-caption1 text-foreground-3">Giá trị: {plan}</span>
</div>`,
        render: () => <RadioControlledDemo />,
      },
    ],
    dos: [
      "Dùng cho 2–7 lựa chọn loại trừ nhau mà người dùng cần thấy hết cùng lúc.",
      "Chọn sẵn lựa chọn an toàn/phổ biến nhất khi hợp lý.",
      "Xếp dọc khi nhãn dài; chỉ xếp ngang khi nhãn rất ngắn.",
    ],
    donts: [
      "Không dùng cho lựa chọn bật/tắt đơn lẻ — dùng Checkbox hoặc Switch.",
      "Không dùng khi có quá nhiều lựa chọn — dùng Dropdown hoặc Combobox.",
    ],
    props: [
      { name: "layout", type: `"vertical" | "horizontal" | "horizontal-stacked"`, defaultValue: `"vertical"`, description: "Bố cục nhóm." },
      { name: "value / defaultValue", type: "string", description: "Giá trị đang chọn." },
      { name: "onValueChange", type: "(value: string) => void", description: "Callback khi đổi." },
      { name: "disabled / required / name", type: "boolean / string", description: "Áp dụng cho cả nhóm." },
      { name: "Radio.value", type: "string", description: "Giá trị của lựa chọn." },
      { name: "Radio.label", type: "ReactNode", description: "Nhãn bấm được." },
      { name: "Radio.disabled", type: "boolean", description: "Khoá riêng một lựa chọn." },
    ],
  },

  /* ------------------------------------------------------------- Combobox */
  {
    slug: "combobox",
    category: "Nhập liệu",
    name: "Combobox",
    lead: "Combobox kết hợp ô nhập và listbox: gõ để lọc rồi chọn một hoặc nhiều lựa chọn.",
    description:
      "Lọc không phân biệt dấu tiếng Việt (gõ “da nang” vẫn ra “Đà Nẵng”). Bàn phím: mũi tên để duyệt, Enter để chọn, Esc để đóng. multiselect hiện ô tick cho từng option; freeform cho phép giữ giá trị tự gõ không có trong danh sách.",
    importCode: `import { Combobox } from "@/components/ui";`,
    hero: {
      title: "Combobox",
      code: `<Field label="Thành phố" className="w-72">
  <Combobox
    placeholder="Chọn hoặc gõ để tìm"
    options={["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", "Nha Trang"]}
  />
</Field>`,
      render: () => (
        <Field label="Thành phố" className="w-72">
          <Combobox
            placeholder="Chọn hoặc gõ để tìm"
            options={["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", "Nha Trang"]}
          />
        </Field>
      ),
    },
    examples: [
      {
        title: "Chọn nhiều",
        description: "multiselect: listbox giữ mở sau mỗi lần chọn, ô hiện danh sách đã chọn.",
        code: `<Combobox
  multiselect
  aria-label="Kỹ năng"
  placeholder="Chọn kỹ năng"
  defaultValue={["react"]}
  options={[
    { value: "react", label: "React" },
    { value: "ts", label: "TypeScript" },
    { value: "tailwind", label: "Tailwind CSS" },
    { value: "node", label: "Node.js" },
    { value: "figma", label: "Figma" },
  ]}
/>`,
        render: () => (
          <Combobox
            multiselect
            aria-label="Kỹ năng"
            placeholder="Chọn kỹ năng"
            defaultValue={["react"]}
            options={[
              { value: "react", label: "React" },
              { value: "ts", label: "TypeScript" },
              { value: "tailwind", label: "Tailwind CSS" },
              { value: "node", label: "Node.js" },
              { value: "figma", label: "Figma" },
            ]}
          />
        ),
      },
      {
        title: "Nhóm & option disabled",
        description: "Option có group được gom dưới tiêu đề.",
        code: `<Combobox
  aria-label="Múi giờ"
  placeholder="Chọn múi giờ"
  options={[
    { value: "hn", label: "Hà Nội (UTC+7)", group: "Châu Á" },
    { value: "tokyo", label: "Tokyo (UTC+9)", group: "Châu Á" },
    { value: "london", label: "London (UTC+0)", group: "Châu Âu" },
    { value: "paris", label: "Paris (UTC+1)", group: "Châu Âu", disabled: true },
  ]}
/>`,
        render: () => (
          <Combobox
            aria-label="Múi giờ"
            placeholder="Chọn múi giờ"
            options={[
              { value: "hn", label: "Hà Nội (UTC+7)", group: "Châu Á" },
              { value: "tokyo", label: "Tokyo (UTC+9)", group: "Châu Á" },
              { value: "london", label: "London (UTC+0)", group: "Châu Âu" },
              { value: "paris", label: "Paris (UTC+1)", group: "Châu Âu", disabled: true },
            ]}
          />
        ),
      },
      {
        title: "Freeform (controlled)",
        description: "Gõ giá trị không có trong danh sách rồi Enter hoặc rời ô để giữ lại.",
        code: `const [dessert, setDessert] = useState("");

<div className="flex flex-col gap-2">
  <Combobox
    freeform
    aria-label="Món tráng miệng"
    placeholder="Chọn hoặc nhập món khác"
    value={dessert}
    onValueChange={setDessert}
    options={["Chè", "Bánh flan", "Kem", "Sữa chua"]}
  />
  <span className="text-caption1 text-foreground-3">Giá trị: {dessert || "(trống)"}</span>
</div>`,
        render: () => <ComboboxFreeformDemo />,
      },
      {
        title: "Appearance, kích thước & disabled",
        description: "Cùng bộ appearance / size với Input.",
        code: `<div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
  <Combobox appearance="underline" size="small" aria-label="Underline" placeholder="Underline · small" options={["Một", "Hai"]} />
  <Combobox appearance="filled-darker" size="large" aria-label="Filled darker" placeholder="Filled darker · large" options={["Một", "Hai"]} />
  <Combobox disabled aria-label="Disabled" placeholder="Disabled" options={["Một", "Hai"]} />
</div>`,
        render: () => (
          <div className="grid gap-3 rounded-xlarge bg-background-1 p-4">
            <Combobox appearance="underline" size="small" aria-label="Underline" placeholder="Underline · small" options={["Một", "Hai"]} />
            <Combobox
              appearance="filled-darker"
              size="large"
              aria-label="Filled darker"
              placeholder="Filled darker · large"
              options={["Một", "Hai"]}
            />
            <Combobox disabled aria-label="Disabled" placeholder="Disabled" options={["Một", "Hai"]} />
          </div>
        ),
      },
    ],
    dos: [
      "Dùng khi danh sách dài (hơn ~10 mục) và người dùng biết mình cần tìm gì.",
      "Viết placeholder gợi ý rằng có thể gõ để tìm.",
      "Bật freeform khi giá trị hợp lệ không giới hạn trong danh sách.",
    ],
    donts: [
      "Không dùng cho vài lựa chọn ngắn — dùng Dropdown hoặc RadioGroup.",
      "Không dùng multiselect khi các giá trị cần hiển thị rõ từng mục — dùng TagPicker.",
    ],
    props: [
      { name: "options", type: "(string | { value, label?, disabled?, group? })[]", description: "Danh sách lựa chọn." },
      { name: "value / defaultValue", type: "string | string[]", description: "string khi chọn một; string[] khi multiselect." },
      { name: "onValueChange", type: "(value: string | string[]) => void", description: "Callback khi chọn." },
      { name: "multiselect", type: "boolean", defaultValue: "false", description: "Cho phép chọn nhiều (option có ô tick)." },
      { name: "freeform", type: "boolean", defaultValue: "false", description: "Giữ văn bản tự gõ làm giá trị." },
      { name: "noResultsText", type: "ReactNode", defaultValue: `"Không tìm thấy kết quả"`, description: "Hiện khi lọc không ra option nào." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô." },
      SIZE_PROP,
      { name: "className / listboxClassName", type: "string", description: "Class cho ô / bề mặt listbox." },
    ],
  },

  /* ------------------------------------------------------------------ Tag */
  {
    slug: "tag",
    category: "Nhập liệu",
    name: "Tag",
    lead: "Tag biểu diễn một thuộc tính, bộ lọc hoặc đối tượng đã chọn; có thể gỡ bỏ hoặc tương tác.",
    description:
      "Tag tĩnh chỉ hiển thị; Tag dismissible là một nút — bấm, Delete hoặc Backspace để gỡ. InteractionTag tách hành động chính và nút X riêng. TagGroup xếp các tag, điều hướng bằng phím mũi tên và tự chuyển focus sang tag kế bên khi một tag bị gỡ.",
    importCode: `import { Tag, InteractionTag, TagGroup } from "@/components/ui";`,
    hero: {
      title: "Tag",
      code: `<TagGroup aria-label="Chủ đề">
  <Tag>Thiết kế</Tag>
  <Tag icon={<Calendar20Regular />}>Sự kiện</Tag>
  <Tag media={<Avatar name="Lê Minh" size={24} color="colorful" />}>Lê Minh</Tag>
  <Tag appearance="brand">Mới</Tag>
</TagGroup>`,
      render: () => (
        <TagGroup aria-label="Chủ đề">
          <Tag>Thiết kế</Tag>
          <Tag icon={<Calendar20Regular />}>Sự kiện</Tag>
          <Tag media={<Avatar name="Lê Minh" size={24} color="colorful" />}>Lê Minh</Tag>
          <Tag appearance="brand">Mới</Tag>
        </TagGroup>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "filled (mặc định), outline, brand.",
        code: `<Tag>Filled</Tag>
<Tag appearance="outline">Outline</Tag>
<Tag appearance="brand">Brand</Tag>`,
        render: () => (
          <>
            <Tag>Filled</Tag>
            <Tag appearance="outline">Outline</Tag>
            <Tag appearance="brand">Brand</Tag>
          </>
        ),
      },
      {
        title: "Kích thước & shape",
        description: "medium (32px), small (24px), extra-small (20px); rounded hoặc circular.",
        code: `<Tag icon={<Globe20Regular />}>Medium</Tag>
<Tag size="small" icon={<Globe20Regular />}>Small</Tag>
<Tag size="extra-small" icon={<Globe20Regular />}>Extra small</Tag>
<Tag shape="circular" appearance="outline">Circular</Tag>`,
        render: () => (
          <>
            <Tag icon={<Globe20Regular />}>Medium</Tag>
            <Tag size="small" icon={<Globe20Regular />}>
              Small
            </Tag>
            <Tag size="extra-small" icon={<Globe20Regular />}>
              Extra small
            </Tag>
            <Tag shape="circular" appearance="outline">
              Circular
            </Tag>
          </>
        ),
      },
      {
        title: "Avatar & secondaryText",
        description: "media đặt Avatar sát mép; secondaryText thêm dòng phụ (size medium).",
        code: `<Tag shape="circular" media={<Avatar name="Phạm Thu Hà" size={24} color="colorful" />}>Phạm Thu Hà</Tag>
<Tag media={<Avatar name="Trần Quốc Bảo" size={24} />} secondaryText="Kỹ sư phần mềm">Trần Quốc Bảo</Tag>`,
        render: () => (
          <>
            <Tag shape="circular" media={<Avatar name="Phạm Thu Hà" size={24} color="colorful" />}>
              Phạm Thu Hà
            </Tag>
            <Tag media={<Avatar name="Trần Quốc Bảo" size={24} />} secondaryText="Kỹ sư phần mềm">
              Trần Quốc Bảo
            </Tag>
          </>
        ),
      },
      {
        title: "Dismissible trong TagGroup",
        description: "Bấm tag hoặc nhấn Delete/Backspace để gỡ; focus tự sang tag kế bên.",
        code: `const [tags, setTags] = useState(["React", "TypeScript", "Tailwind CSS", "Radix UI"]);

<div className="flex flex-col items-center gap-3">
  <TagGroup aria-label="Bộ lọc" onDismiss={(value) => setTags((t) => t.filter((x) => x !== value))}>
    {tags.map((tag) => (
      <Tag key={tag} value={tag} dismissible>
        {tag}
      </Tag>
    ))}
  </TagGroup>
  {tags.length === 0 && (
    <Button size="small" onClick={() => setTags(["React", "TypeScript", "Tailwind CSS", "Radix UI"])}>
      Khôi phục
    </Button>
  )}
</div>`,
        render: () => <TagDismissDemo />,
      },
      {
        title: "InteractionTag",
        description: "Hành động chính và nút X là hai điểm focus riêng.",
        code: `<TagGroup aria-label="Người tham dự">
  <InteractionTag media={<Avatar name="Ngô Thanh Vân" size={24} color="colorful" />} dismissible>
    Ngô Thanh Vân
  </InteractionTag>
  <InteractionTag appearance="outline" icon={<Location20Regular />} dismissible>
    Phòng họp A
  </InteractionTag>
  <InteractionTag appearance="brand">Chỉ bấm</InteractionTag>
</TagGroup>`,
        render: () => (
          <TagGroup aria-label="Người tham dự">
            <InteractionTag media={<Avatar name="Ngô Thanh Vân" size={24} color="colorful" />} dismissible>
              Ngô Thanh Vân
            </InteractionTag>
            <InteractionTag appearance="outline" icon={<Location20Regular />} dismissible>
              Phòng họp A
            </InteractionTag>
            <InteractionTag appearance="brand">Chỉ bấm</InteractionTag>
          </TagGroup>
        ),
      },
    ],
    dos: [
      "Giữ nhãn tag ngắn (1–3 từ); nhãn dài sẽ bị cắt bằng dấu …",
      "Dùng TagGroup để tag xuống dòng gọn gàng và có điều hướng bàn phím.",
      "Dùng appearance brand tiết kiệm — chỉ cho tag cần nhấn mạnh.",
    ],
    donts: [
      "Không dùng Tag thay Button cho hành động chính của trang.",
      "Không dùng Tag để báo trạng thái (thành công, lỗi) — dùng Badge.",
      "Không trộn nhiều appearance trong cùng một nhóm khi không có ý nghĩa.",
    ],
    props: [
      { name: "appearance", type: `"filled" | "outline" | "brand"`, defaultValue: `"filled"`, description: "Kiểu tag." },
      { name: "size", type: `"extra-small" | "small" | "medium"`, defaultValue: `"medium"`, description: "Chiều cao 20 / 24 / 32px." },
      { name: "shape", type: `"rounded" | "circular"`, defaultValue: `"rounded"`, description: "Bo góc." },
      { name: "icon / media", type: "ReactNode", description: "Icon hoặc Avatar trước nhãn." },
      { name: "secondaryText", type: "ReactNode", description: "Dòng phụ dưới nhãn." },
      { name: "dismissible / onDismiss", type: "boolean / (event, value) => void", description: "Biến tag thành nút gỡ." },
      { name: "value", type: "string", description: "Định danh — TagGroup.onDismiss nhận giá trị này." },
      { name: "TagGroup.onDismiss", type: "(value: string) => void", description: "Gỡ tag trong nhóm, tự quản lý focus." },
      { name: "TagGroup.size / appearance / disabled", type: "—", description: "Mặc định cho mọi tag con." },
    ],
  },

  /* ------------------------------------------------------------ TagPicker */
  {
    slug: "tagpicker",
    category: "Nhập liệu",
    name: "TagPicker",
    lead: "TagPicker cho phép chọn nhiều mục, hiển thị mỗi mục là một Tag ngay trong ô nhập.",
    description:
      "Gõ để lọc danh sách gợi ý (không phân biệt dấu), Enter để thêm, Backspace khi ô trống để gỡ tag cuối, mũi tên trái để di chuyển giữa các tag. Option đã chọn tự ẩn khỏi danh sách.",
    importCode: `import { TagPicker } from "@/components/ui";`,
    hero: {
      title: "TagPicker",
      code: `<Field label="Thẻ bài viết" className="w-96">
  <TagPicker
    placeholder="Thêm thẻ"
    defaultValue={["design"]}
    options={[
      { value: "design", label: "Thiết kế" },
      { value: "frontend", label: "Frontend" },
      { value: "backend", label: "Backend" },
      { value: "ux", label: "Trải nghiệm người dùng" },
      { value: "a11y", label: "Khả năng tiếp cận" },
    ]}
  />
</Field>`,
      render: () => (
        <Field label="Thẻ bài viết" className="w-96">
          <TagPicker
            placeholder="Thêm thẻ"
            defaultValue={["design"]}
            options={[
              { value: "design", label: "Thiết kế" },
              { value: "frontend", label: "Frontend" },
              { value: "backend", label: "Backend" },
              { value: "ux", label: "Trải nghiệm người dùng" },
              { value: "a11y", label: "Khả năng tiếp cận" },
            ]}
          />
        </Field>
      ),
    },
    examples: [
      {
        title: "Avatar & mô tả phụ",
        description: "media hiện trên cả option và tag; size large dùng tag small vừa Avatar 20px.",
        code: `<TagPicker
  size="large"
  aria-label="Người nhận"
  placeholder="Chọn người nhận"
  className="w-96"
  options={[
    { value: "an", label: "Nguyễn Văn An", secondaryText: "Kỹ sư phần mềm", media: <Avatar name="Nguyễn Văn An" size={20} color="colorful" /> },
    { value: "binh", label: "Trần Thị Bình", secondaryText: "Thiết kế sản phẩm", media: <Avatar name="Trần Thị Bình" size={20} color="colorful" /> },
    { value: "chi", label: "Lê Hoài Chi", secondaryText: "Quản lý dự án", media: <Avatar name="Lê Hoài Chi" size={20} color="colorful" /> },
  ]}
/>`,
        render: () => (
          <TagPicker
            size="large"
            aria-label="Người nhận"
            placeholder="Chọn người nhận"
            className="w-96"
            options={[
              { value: "an", label: "Nguyễn Văn An", secondaryText: "Kỹ sư phần mềm", media: <Avatar name="Nguyễn Văn An" size={20} color="colorful" /> },
              { value: "binh", label: "Trần Thị Bình", secondaryText: "Thiết kế sản phẩm", media: <Avatar name="Trần Thị Bình" size={20} color="colorful" /> },
              { value: "chi", label: "Lê Hoài Chi", secondaryText: "Quản lý dự án", media: <Avatar name="Lê Hoài Chi" size={20} color="colorful" /> },
            ]}
          />
        ),
      },
      {
        title: "Freeform",
        description: "Gõ từ khoá mới rồi Enter để tạo tag.",
        code: `<TagPicker freeform aria-label="Từ khoá" placeholder="Gõ rồi nhấn Enter" className="w-80" options={["khuyến mãi", "mùa hè", "giảm giá"]} />`,
        render: () => (
          <TagPicker freeform aria-label="Từ khoá" placeholder="Gõ rồi nhấn Enter" className="w-80" options={["khuyến mãi", "mùa hè", "giảm giá"]} />
        ),
      },
      {
        title: "Controlled",
        description: "value / onValueChange; tagAppearance và tagShape đổi kiểu tag.",
        code: `const [members, setMembers] = useState<string[]>(["Lan", "Hùng"]);

<div className="flex w-96 flex-col gap-2">
  <TagPicker
    aria-label="Thành viên"
    value={members}
    onValueChange={setMembers}
    options={["Lan", "Hùng", "Minh", "Thảo", "Quân"]}
    tagAppearance="brand"
    tagShape="circular"
  />
  <span className="text-caption1 text-foreground-3">{members.length} thành viên được chọn</span>
</div>`,
        render: () => <TagPickerControlledDemo />,
      },
      {
        title: "Kích thước",
        description: "medium (tag extra-small), large (tag small), extra-large (tag medium).",
        code: `<div className="grid w-96 gap-3">
  <TagPicker aria-label="Medium" defaultValue={["A"]} options={["A", "B", "C"]} />
  <TagPicker size="large" aria-label="Large" defaultValue={["A"]} options={["A", "B", "C"]} />
  <TagPicker size="extra-large" aria-label="Extra large" defaultValue={["A"]} options={["A", "B", "C"]} />
</div>`,
        render: () => (
          <div className="grid w-96 gap-3">
            <TagPicker aria-label="Medium" defaultValue={["A"]} options={["A", "B", "C"]} />
            <TagPicker size="large" aria-label="Large" defaultValue={["A"]} options={["A", "B", "C"]} />
            <TagPicker size="extra-large" aria-label="Extra large" defaultValue={["A"]} options={["A", "B", "C"]} />
          </div>
        ),
      },
    ],
    dos: [
      "Dùng khi người dùng cần chọn nhiều mục và cần thấy rõ từng mục đã chọn.",
      "Thêm Avatar/mô tả phụ khi chọn người để dễ phân biệt trùng tên.",
      "Bật freeform cho từ khoá, email… không có sẵn trong danh sách.",
    ],
    donts: [
      "Không dùng cho lựa chọn đơn — dùng Combobox hoặc Dropdown.",
      "Không để quá nhiều tag khiến ô cao vượt khỏi bố cục — cân nhắc giới hạn số lượng.",
    ],
    props: [
      { name: "options", type: "(string | { value, label?, media?, secondaryText?, disabled?, group? })[]", description: "Danh sách gợi ý." },
      { name: "value / defaultValue", type: "string[]", description: "Các giá trị đã chọn." },
      { name: "onValueChange", type: "(value: string[]) => void", description: "Callback khi thêm/gỡ." },
      { name: "size", type: `"medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "Chiều cao tối thiểu 32 / 40 / 48px." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô." },
      { name: "tagAppearance / tagShape", type: "TagAppearance / TagShape", description: "Kiểu của tag đã chọn." },
      { name: "freeform", type: "boolean", defaultValue: "false", description: "Enter để tạo tag từ văn bản tự gõ." },
      { name: "noResultsText", type: "ReactNode", description: "Hiện khi không còn gợi ý phù hợp." },
    ],
  },

  /* ----------------------------------------------------------- SpinButton */
  {
    slug: "spinbutton",
    category: "Nhập liệu",
    name: "SpinButton",
    lead: "SpinButton cho phép nhập số và tăng/giảm theo bước bằng nút hoặc bàn phím.",
    description:
      "Hai nút mũi tên xếp chồng bên phải (nhấn giữ để chạy liên tục). Bàn phím: ↑/↓ theo step, PageUp/PageDown theo stepPage, Home/End về min/max, Enter để xác nhận số vừa gõ. Giá trị luôn được kẹp trong [min, max].",
    importCode: `import { SpinButton } from "@/components/ui";`,
    hero: {
      title: "SpinButton",
      code: `<Field label="Số lượng" className="w-48">
  <SpinButton defaultValue={1} min={0} max={99} />
</Field>`,
      render: () => (
        <Field label="Số lượng" className="w-48">
          <SpinButton defaultValue={1} min={0} max={99} />
        </Field>
      ),
    },
    examples: [
      {
        title: "Bước thập phân",
        description: "step={0.1}: số chữ số thập phân suy ra từ step.",
        code: `<SpinButton aria-label="Hệ số" defaultValue={1.5} step={0.1} min={0} max={5} className="w-40" />`,
        render: () => <SpinButton aria-label="Hệ số" defaultValue={1.5} step={0.1} min={0} max={5} className="w-40" />,
      },
      {
        title: "Định dạng hiển thị",
        description: "formatValue thêm đơn vị; khi gõ, ký tự không phải số được bỏ qua.",
        code: `<SpinButton aria-label="Giảm giá" defaultValue={10} step={5} min={0} max={100} formatValue={(v) => v + "%"} className="w-40" />`,
        render: () => (
          <SpinButton aria-label="Giảm giá" defaultValue={10} step={5} min={0} max={100} formatValue={(v) => v + "%"} className="w-40" />
        ),
      },
      {
        title: "Controlled",
        description: "value / onValueChange (null khi ô trống).",
        code: `const [guests, setGuests] = useState<number | null>(2);

<div className="flex flex-col gap-2">
  <SpinButton aria-label="Số khách" value={guests} onValueChange={setGuests} min={1} max={10} className="w-40" />
  <span className="text-caption1 text-foreground-3">Phòng cho {guests ?? 0} khách</span>
</div>`,
        render: () => <SpinButtonControlledDemo />,
      },
      {
        title: "Appearance, kích thước & disabled",
        description: "outline, underline, filled-darker, filled-lighter; size small / medium.",
        code: `<div className="grid w-48 gap-3 rounded-xlarge bg-background-1 p-4">
  <SpinButton aria-label="Outline" defaultValue={1} />
  <SpinButton appearance="underline" aria-label="Underline" defaultValue={2} />
  <SpinButton appearance="filled-darker" aria-label="Filled darker" defaultValue={3} />
  <SpinButton appearance="filled-lighter" aria-label="Filled lighter" defaultValue={3} />
  <SpinButton size="small" aria-label="Small" defaultValue={4} />
  <SpinButton disabled aria-label="Disabled" defaultValue={5} />
</div>`,
        render: () => (
          <div className="grid w-48 gap-3 rounded-xlarge bg-background-1 p-4">
            <SpinButton aria-label="Outline" defaultValue={1} />
            <SpinButton appearance="underline" aria-label="Underline" defaultValue={2} />
            <SpinButton appearance="filled-darker" aria-label="Filled darker" defaultValue={3} />
            <SpinButton appearance="filled-lighter" aria-label="Filled lighter" defaultValue={3} />
            <SpinButton size="small" aria-label="Small" defaultValue={4} />
            <SpinButton disabled aria-label="Disabled" defaultValue={5} />
          </div>
        ),
      },
    ],
    dos: [
      "Dùng cho số nhỏ, thay đổi theo bước nhỏ (số lượng, số khách, cỡ chữ).",
      "Luôn đặt min/max hợp lý để tránh giá trị vô nghĩa.",
      "Hiển thị đơn vị bằng formatValue thay vì ghi trong nhãn khi phù hợp.",
    ],
    donts: [
      "Không dùng cho số lớn hoặc không theo bước (số điện thoại, mã bưu chính) — dùng Input.",
      "Không dùng khi giá trị tương đối quan trọng hơn con số chính xác — dùng Slider.",
    ],
    props: [
      { name: "value / defaultValue", type: "number | null", description: "Giá trị số (null = trống)." },
      { name: "onValueChange", type: "(value: number | null) => void", description: "Gọi khi giá trị đổi." },
      { name: "min / max", type: "number", description: "Giới hạn; nút tương ứng bị khoá khi chạm biên." },
      { name: "step / stepPage", type: "number", defaultValue: "1 / step × 10", description: "Bước cho ↑↓ và PageUp/PageDown." },
      { name: "precision", type: "number", description: "Số chữ số thập phân (mặc định suy từ step)." },
      { name: "displayValue", type: "string", description: "Chuỗi hiển thị thay cho số (controlled)." },
      { name: "formatValue / parseValue", type: "(v: number) => string / (text: string) => number | null", description: "Định dạng và đọc số tuỳ biến." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô." },
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32px." },
    ],
  },

  /* ------------------------------------------------------------ SearchBox */
  {
    slug: "searchbox",
    category: "Nhập liệu",
    name: "SearchBox",
    lead: "SearchBox là ô nhập chuyên cho tìm kiếm, có icon kính lúp và nút xoá nhanh.",
    description:
      "Nút X chỉ xuất hiện khi ô có nội dung; Esc cũng xoá nội dung. Hỗ trợ controlled (value + onValueChange) lẫn uncontrolled (defaultValue). Kế thừa toàn bộ prop của Input (label, hint, appearance, size…).",
    importCode: `import { SearchBox } from "@/components/ui";`,
    hero: {
      title: "SearchBox",
      code: `<SearchBox placeholder="Tìm trong tài liệu" rootClassName="w-72" />`,
      render: () => <SearchBox placeholder="Tìm trong tài liệu" rootClassName="w-72" />,
    },
    examples: [
      {
        title: "Lọc danh sách (controlled)",
        description: "Kết quả nằm trong khung danh sách có số đếm, tô sáng phần khớp (không dấu: gõ “xoai” vẫn ra “Xoài”) và trạng thái rỗng. onValueChange chạy cả khi bấm X hoặc Esc.",
        code: `const FRUITS = [
  { name: "Xoài cát Hoà Lộc", origin: "Tiền Giang" },
  { name: "Sầu riêng Ri6", origin: "Bến Tre" },
  { name: "Măng cụt", origin: "Lái Thiêu" },
  { name: "Chôm chôm Java", origin: "Vĩnh Long" },
  { name: "Thanh long ruột đỏ", origin: "Bình Thuận" },
  { name: "Vú sữa Lò Rèn", origin: "Tiền Giang" },
];

function FruitFilterDemo() {
  const [query, setQuery] = useState("");
  const results = FRUITS.filter((f) => normalizeSearchText(f.name).includes(normalizeSearchText(query.trim())));

  return (
    <div className="w-80 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-4">
      <div className="flex flex-col gap-1 border-b border-stroke-2 p-3">
        <SearchBox aria-label="Tìm trái cây" aria-controls="fruit-results" value={query} onValueChange={setQuery} />
        <p aria-live="polite" className="text-caption1 text-foreground-3">
          {results.length} / {FRUITS.length} trái cây
        </p>
      </div>
      {results.length > 0 ? (
        <List id="fruit-results" aria-label="Kết quả" className="divide-y divide-stroke-3">
          {results.map((f) => (
            <ListItem
              key={f.name}
              media={<Avatar name={f.name} size={32} color="colorful" />}
              title={<HighlightMatch text={f.name} query={query} />}
              description={f.origin}
              className="px-3"
            />
          ))}
        </List>
      ) : (
        <p id="fruit-results" className="px-3 py-5 text-center text-body1 text-foreground-3">
          Không có trái cây nào khớp “{query}”.
        </p>
      )}
    </div>
  );
}`,
        render: () => <FruitFilterDemo />,
      },
      {
        title: "Appearance",
        description: "outline (mặc định), underline, filled-darker, filled-lighter.",
        code: `<div className="grid w-72 gap-3 rounded-xlarge bg-background-1 p-4">
  <SearchBox aria-label="Outline" placeholder="Outline" />
  <SearchBox appearance="underline" aria-label="Underline" placeholder="Underline" />
  <SearchBox appearance="filled-darker" aria-label="Filled darker" placeholder="Filled darker" />
  <SearchBox appearance="filled-lighter" aria-label="Filled lighter" placeholder="Filled lighter" />
</div>`,
        render: () => (
          <div className="grid w-72 gap-3 rounded-xlarge bg-background-1 p-4">
            <SearchBox aria-label="Outline" placeholder="Outline" />
            <SearchBox appearance="underline" aria-label="Underline" placeholder="Underline" />
            <SearchBox appearance="filled-darker" aria-label="Filled darker" placeholder="Filled darker" />
            <SearchBox appearance="filled-lighter" aria-label="Filled lighter" placeholder="Filled lighter" />
          </div>
        ),
      },
      {
        title: "Kích thước & disabled",
        description: "small, medium, large — icon đổi cỡ 16 / 20 / 24px.",
        code: `<SearchBox size="small" aria-label="Small" defaultValue="Small" rootClassName="w-48" />
<SearchBox aria-label="Medium" defaultValue="Medium" rootClassName="w-48" />
<SearchBox size="large" aria-label="Large" defaultValue="Large" rootClassName="w-48" />
<SearchBox disabled aria-label="Disabled" rootClassName="w-48" />`,
        render: () => (
          <>
            <SearchBox size="small" aria-label="Small" defaultValue="Small" rootClassName="w-48" />
            <SearchBox aria-label="Medium" defaultValue="Medium" rootClassName="w-48" />
            <SearchBox size="large" aria-label="Large" defaultValue="Large" rootClassName="w-48" />
            <SearchBox disabled aria-label="Disabled" rootClassName="w-48" />
          </>
        ),
      },
    ],
    dos: [
      "Đặt SearchBox ở vị trí dễ thấy, phía trên nội dung được tìm.",
      "Cập nhật kết quả ngay khi gõ nếu dữ liệu nhỏ; debounce khi gọi API.",
      "Dùng placeholder mô tả phạm vi tìm (“Tìm trong tài liệu”).",
    ],
    donts: [
      "Không dùng SearchBox cho ô nhập dữ liệu thông thường — dùng Input.",
      "Không xoá nội dung tìm kiếm khi người dùng chuyển trang kết quả.",
    ],
    props: [
      { name: "value / defaultValue", type: "string", description: "Nội dung (controlled / uncontrolled)." },
      { name: "onValueChange", type: "(value: string) => void", description: "Gọi khi gõ, bấm X hoặc nhấn Esc." },
      { name: "onChange", type: "ChangeEventHandler", description: "Sự kiện gốc (cũng chạy khi xoá)." },
      { name: "dismissLabel", type: "string", defaultValue: `"Xoá nội dung tìm kiếm"`, description: "aria-label của nút X." },
      { name: "contentBefore / contentAfter", type: "ReactNode", description: "Thay icon kính lúp / thêm nội dung sau nút X." },
      { name: "appearance, size, label, hint, rootClassName…", type: "InputProps", description: "Kế thừa từ Input." },
    ],
  },

  /* ------------------------------------------------------------- InputOTP */
  {
    slug: "inputotp",
    category: "Nhập liệu",
    name: "InputOTP",
    lead: "InputOTP nhập mã xác thực một lần, mỗi ký tự một ô.",
    description:
      "Gõ tự nhảy sang ô kế tiếp, Backspace lùi về ô trước, dán (Ctrl+V) điền toàn bộ mã, onComplete chạy khi đủ ký tự. Ô dùng chung style với Input của Fluent; ô đầu có autocomplete=\"one-time-code\" để trình duyệt tự điền mã SMS.",
    importCode: `import { InputOTP } from "@/components/ui";`,
    hero: {
      title: "InputOTP",
      code: `<InputOTP aria-label="Mã xác thực" groups={[3, 3]} />`,
      render: () => <InputOTP aria-label="Mã xác thực" groups={[3, 3]} />,
    },
    examples: [
      {
        title: "onComplete",
        description: "Gọi khi người dùng nhập đủ 6 số.",
        code: `const [code, setCode] = useState("");

<div className="flex flex-col items-center gap-2">
  <InputOTP aria-label="Mã OTP" onComplete={setCode} />
  <span className="text-caption1 text-foreground-3">{code ? "Đã nhập mã " + code : "Nhập đủ 6 số"}</span>
</div>`,
        render: () => <InputOTPCompleteDemo />,
      },
      {
        title: "Chữ và số",
        description: "pattern=\"alphanumeric\", length={4}.",
        code: `<InputOTP aria-label="Mã giới thiệu" length={4} pattern="alphanumeric" size="large" />`,
        render: () => <InputOTP aria-label="Mã giới thiệu" length={4} pattern="alphanumeric" size="large" />,
      },
      {
        title: "Trong Field, báo lỗi",
        description: "Field gắn label vào ô đầu và truyền aria-invalid cho mọi ô.",
        code: `<Field label="Mã xác thực" validationState="error" validationMessage="Mã không đúng, vui lòng thử lại.">
  <InputOTP defaultValue="123" />
</Field>`,
        render: () => (
          <Field label="Mã xác thực" validationState="error" validationMessage="Mã không đúng, vui lòng thử lại.">
            <InputOTP defaultValue="123" />
          </Field>
        ),
      },
      {
        title: "Kích thước & disabled",
        description: "small (32px) và disabled. medium (40px) là mặc định; large (48px) ở ví dụ Chữ và số.",
        code: `<InputOTP aria-label="Small" size="small" length={4} />
<InputOTP aria-label="Disabled" length={4} defaultValue="42" disabled />`,
        render: () => (
          <>
            <InputOTP aria-label="Small" size="small" length={4} />
            <InputOTP aria-label="Disabled" length={4} defaultValue="42" disabled />
          </>
        ),
      },
    ],
    dos: [
      "Cho biết mã được gửi tới đâu (“Mã đã gửi tới 09xx xxx 678”).",
      "Tự động xác thực khi đủ ký tự qua onComplete thay vì bắt bấm nút.",
      "Chia nhóm (groups) cho mã dài để dễ đọc và đối chiếu.",
    ],
    donts: [
      "Không dùng InputOTP cho mật khẩu hay dữ liệu dài — dùng Input.",
      "Không xoá toàn bộ mã khi sai một ký tự; để người dùng sửa từng ô.",
    ],
    props: [
      { name: "length", type: "number", defaultValue: "6", description: "Số ô." },
      { name: "value / defaultValue", type: "string", description: "Mã hiện tại." },
      { name: "onValueChange", type: "(value: string) => void", description: "Gọi mỗi khi mã đổi." },
      { name: "onComplete", type: "(code: string) => void", description: "Gọi khi đủ length ký tự." },
      { name: "pattern", type: `"digits" | "alphanumeric" | RegExp`, defaultValue: `"digits"`, description: "Ký tự hợp lệ." },
      { name: "groups / separator", type: "number[] / ReactNode", description: "Chia nhóm ô và phần tử ngăn cách." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Ô 32 / 40 / 48px." },
      { name: "disabled, name, autoFocus", type: "—", description: "name tạo input ẩn chứa mã khi submit form." },
    ],
  },

  /* --------------------------------------------------------------- Rating */
  {
    slug: "rating",
    category: "Nhập liệu",
    name: "Rating",
    lead: "Rating cho phép người dùng chấm điểm bằng sao; RatingDisplay hiển thị điểm chỉ đọc.",
    description:
      "Rating là một nhóm radio: Tab để vào, mũi tên để đổi điểm, rê chuột để xem trước. Hỗ trợ nửa sao (step 0.5), ba màu brand / marigold / neutral và bốn kích thước. RatingDisplay kèm giá trị và số lượt đánh giá.",
    importCode: `import { Rating, RatingDisplay } from "@/components/ui";`,
    hero: {
      title: "Rating",
      code: `<Rating defaultValue={3} aria-label="Đánh giá sản phẩm" />`,
      render: () => <Rating defaultValue={3} aria-label="Đánh giá sản phẩm" />,
    },
    examples: [
      {
        title: "Màu",
        description: "neutral (mặc định), brand, marigold.",
        code: `<div className="flex flex-col items-center gap-2">
  <Rating defaultValue={4} size="large" aria-label="Neutral" />
  <Rating defaultValue={4} size="large" color="brand" aria-label="Brand" />
  <Rating defaultValue={4} size="large" color="marigold" aria-label="Marigold" />
</div>`,
        render: () => (
          <div className="flex flex-col items-center gap-2">
            <Rating defaultValue={4} size="large" aria-label="Neutral" />
            <Rating defaultValue={4} size="large" color="brand" aria-label="Brand" />
            <Rating defaultValue={4} size="large" color="marigold" aria-label="Marigold" />
          </div>
        ),
      },
      {
        title: "Nửa sao (controlled)",
        description: "step={0.5}: mỗi sao có hai vùng bấm.",
        code: `const [score, setScore] = useState(3.5);

<div className="flex flex-col items-center gap-2">
  <Rating step={0.5} value={score} onValueChange={setScore} color="marigold" aria-label="Chất lượng phục vụ" />
  <span className="text-caption1 text-foreground-3">{score} / 5 sao</span>
</div>`,
        render: () => <RatingHalfDemo />,
      },
      {
        title: "RatingDisplay",
        description: "Hiển thị chỉ đọc kèm giá trị, số lượt; compact chỉ hiện một sao.",
        code: `<div className="flex flex-col items-start gap-2">
  <RatingDisplay value={4.5} count={1280} color="marigold" />
  <RatingDisplay value={3} count={86} size="large" />
  <RatingDisplay value={4.2} count={530} compact color="brand" />
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-2">
            <RatingDisplay value={4.5} count={1280} color="marigold" />
            <RatingDisplay value={3} count={86} size="large" />
            <RatingDisplay value={4.2} count={530} compact color="brand" />
          </div>
        ),
      },
      {
        title: "Kích thước",
        description: "small (12px), medium (16px), large (20px), extra-large (28px, mặc định).",
        code: `<div className="flex flex-col items-center gap-2">
  <Rating size="small" defaultValue={4} aria-label="Small" />
  <Rating size="medium" defaultValue={4} aria-label="Medium" />
  <Rating size="large" defaultValue={4} aria-label="Large" />
  <Rating size="extra-large" defaultValue={4} aria-label="Extra large" />
</div>`,
        render: () => (
          <div className="flex flex-col items-center gap-2">
            <Rating size="small" defaultValue={4} aria-label="Small" />
            <Rating size="medium" defaultValue={4} aria-label="Medium" />
            <Rating size="large" defaultValue={4} aria-label="Large" />
            <Rating size="extra-large" defaultValue={4} aria-label="Extra large" />
          </div>
        ),
      },
    ],
    dos: [
      "Luôn có aria-label mô tả đối tượng được chấm điểm.",
      "Dùng RatingDisplay kèm số lượt để người dùng đánh giá độ tin cậy.",
      "Giữ một màu sao nhất quán trong toàn sản phẩm.",
    ],
    donts: [
      "Không dùng Rating cho lựa chọn không mang tính thang điểm — dùng RadioGroup.",
      "Không dùng màu sao làm tín hiệu duy nhất — hiện kèm giá trị số.",
    ],
    props: [
      { name: "value / defaultValue", type: "number", defaultValue: "0", description: "Điểm hiện tại (0 = chưa chấm)." },
      { name: "onValueChange", type: "(value: number) => void", description: "Gọi khi chọn điểm." },
      { name: "max", type: "number", defaultValue: "5", description: "Số sao." },
      { name: "step", type: "1 | 0.5", defaultValue: "1", description: "Cho phép nửa sao." },
      { name: "color", type: `"neutral" | "brand" | "marigold"`, defaultValue: `"neutral"`, description: "Màu sao." },
      { name: "size", type: `"small" | "medium" | "large" | "extra-large"`, defaultValue: `"extra-large"`, description: "Cỡ sao 12 / 16 / 20 / 28px." },
      { name: "itemLabel", type: "(value: number) => string", description: "Nhãn đọc cho từng mức điểm." },
      { name: "RatingDisplay.count / compact", type: "number / boolean", description: "Số lượt; chỉ hiện một sao." },
      { name: "RatingDisplay.size", type: "RatingSize", defaultValue: `"medium"`, description: "Cỡ sao và chữ." },
    ],
  },
];
