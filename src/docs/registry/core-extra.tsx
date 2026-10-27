import { useState } from "react";
import {
  ArrowReply20Regular,
  Copy20Regular,
  Delete20Regular,
  Edit20Regular,
  Folder20Regular,
  Mail20Regular,
  MoreHorizontal20Regular,
  Send20Regular,
  Share20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
} from "@fluentui/react-icons";
import {
  Button,
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuSub,
  MenuSubPopover,
  MenuSubTrigger,
  MenuTrigger,
  Slider,
  SplitButton,
} from "@/components/ui";
import type { ComponentDoc } from "../types";

function RadioMenuDemo() {
  const [sort, setSort] = useState("date");
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button>Sắp xếp</Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuGroupHeader>Sắp xếp theo</MenuGroupHeader>
        <MenuRadioGroup value={sort} onValueChange={setSort}>
          <MenuItemRadio value="date">Ngày sửa</MenuItemRadio>
          <MenuItemRadio value="name">Tên</MenuItemRadio>
          <MenuItemRadio value="size">Kích thước</MenuItemRadio>
        </MenuRadioGroup>
        <MenuDivider />
        <MenuItemCheckbox defaultChecked>Hiện thư mục trước</MenuItemCheckbox>
      </MenuPopover>
    </Menu>
  );
}

function VolumeDemo() {
  const [volume, setVolume] = useState([60]);
  return (
    <div className="flex w-72 items-center gap-2">
      {volume[0] === 0 ? <SpeakerMute20Regular className="shrink-0" /> : <Speaker220Regular className="shrink-0" />}
      <Slider aria-label="Âm lượng" value={volume} onValueChange={setVolume} />
      <span className="w-8 text-end text-body1 tabular-nums">{volume[0]}</span>
    </div>
  );
}

const EXTRA: Record<string, ComponentDoc> = {
  splitbutton: {
    slug: "splitbutton",
    category: "Hành động",
    name: "SplitButton",
    lead: "SplitButton cho phép chọn một trong nhiều hành động liên quan: nút chính là hành động trội, các lựa chọn khác nằm trong menu.",
    description: "Hành động trội không được lặp lại trong menu. Dùng khi có một lựa chọn mặc định rõ ràng và vài biến thể ít dùng hơn.",
    importCode: `import { SplitButton, MenuItem } from "@/components/ui";`,
    hero: {
      title: "SplitButton",
      code: `<SplitButton
  appearance="primary"
  icon={<Send20Regular className="rtl:-scale-x-100" />}
  menu={
    <>
      <MenuItem>Hẹn giờ gửi</MenuItem>
      <MenuItem>Gửi bản nháp cho tôi</MenuItem>
    </>
  }
>
  Gửi
</SplitButton>`,
      render: () => (
        <SplitButton
          appearance="primary"
          icon={<Send20Regular className="rtl:-scale-x-100" />}
          menu={
            <>
              <MenuItem>Hẹn giờ gửi</MenuItem>
              <MenuItem>Gửi bản nháp cho tôi</MenuItem>
            </>
          }
        >
          Gửi
        </SplitButton>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "primary, secondary (mặc định), outline, subtle.",
        code: `<SplitButton appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Primary</SplitButton>
<SplitButton menu={<MenuItem>Tuỳ chọn</MenuItem>}>Secondary</SplitButton>
<SplitButton appearance="outline" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Outline</SplitButton>
<SplitButton appearance="subtle" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Subtle</SplitButton>`,
        render: () => (
          <>
            <SplitButton appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Primary
            </SplitButton>
            <SplitButton menu={<MenuItem>Tuỳ chọn</MenuItem>}>Secondary</SplitButton>
            <SplitButton appearance="outline" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Outline
            </SplitButton>
            <SplitButton appearance="subtle" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Subtle
            </SplitButton>
          </>
        ),
      },
      {
        title: "Kích thước",
        description: "small, medium, large.",
        code: `<SplitButton size="small" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Small</SplitButton>
<SplitButton size="medium" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Medium</SplitButton>
<SplitButton size="large" appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Large</SplitButton>`,
        render: () => (
          <>
            <SplitButton size="small" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Small
            </SplitButton>
            <SplitButton size="medium" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Medium
            </SplitButton>
            <SplitButton size="large" appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Large
            </SplitButton>
          </>
        ),
      },
    ],
    dos: ["Hành động trên nút chính là lựa chọn phổ biến nhất.", "Menu chứa 2–5 biến thể của cùng hành động."],
    donts: ["Không lặp lại hành động chính trong menu.", "Không dùng khi các lựa chọn ngang hàng nhau — dùng Menu thường."],
    props: [
      { name: "appearance", type: `"primary" | "secondary" | "outline" | "subtle"`, defaultValue: `"secondary"`, description: "Áp dụng cho cả hai nửa." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Kích thước." },
      { name: "menu", type: "ReactNode", description: "MenuItem / MenuItemRadio / MenuDivider." },
      { name: "menuLabel", type: "string", defaultValue: `"Thêm tuỳ chọn"`, description: "aria-label cho nút mở menu." },
      { name: "icon, onClick, disabled…", type: "ButtonProps", description: "Truyền cho nút chính." },
    ],
  },

  menu: {
    slug: "menu",
    category: "Điều hướng",
    name: "Menu",
    lead: "Menu hiển thị danh sách lệnh hoặc lựa chọn khi người dùng tương tác với một nút.",
    description: "Hỗ trợ icon, phím tắt (secondaryContent), nhóm có tiêu đề, divider, radio, checkbox và submenu. Điều hướng bằng phím mũi tên, Enter, Esc.",
    importCode: `import {
  Menu, MenuTrigger, MenuPopover, MenuItem, MenuDivider, MenuGroupHeader,
  MenuRadioGroup, MenuItemRadio, MenuItemCheckbox, MenuSub, MenuSubTrigger, MenuSubPopover,
} from "@/components/ui";`,
    hero: {
      title: "Menu",
      code: `<Menu>
  <MenuTrigger asChild>
    <Button icon={<MoreHorizontal20Regular />} aria-label="Thao tác" />
  </MenuTrigger>
  <MenuPopover>
    <MenuItem icon={<ArrowReply20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+R">Trả lời</MenuItem>
    <MenuItem icon={<Share20Regular />}>Chuyển tiếp</MenuItem>
    <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">Sao chép</MenuItem>
    <MenuDivider />
    <MenuItem icon={<Delete20Regular />}>Xoá</MenuItem>
  </MenuPopover>
</Menu>`,
      render: () => (
        <Menu>
          <MenuTrigger asChild>
            <Button icon={<MoreHorizontal20Regular />} aria-label="Thao tác" />
          </MenuTrigger>
          <MenuPopover>
            <MenuItem icon={<ArrowReply20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+R">
              Trả lời
            </MenuItem>
            <MenuItem icon={<Share20Regular />}>Chuyển tiếp</MenuItem>
            <MenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">
              Sao chép
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<Delete20Regular />}>Xoá</MenuItem>
          </MenuPopover>
        </Menu>
      ),
    },
    examples: [
      {
        title: "Radio & checkbox",
        description: "Lựa chọn loại trừ (radio) và bật/tắt (checkbox) ngay trong menu.",
        code: `const [sort, setSort] = useState("date");

<Menu>
  <MenuTrigger asChild><Button>Sắp xếp</Button></MenuTrigger>
  <MenuPopover>
    <MenuGroupHeader>Sắp xếp theo</MenuGroupHeader>
    <MenuRadioGroup value={sort} onValueChange={setSort}>
      <MenuItemRadio value="date">Ngày sửa</MenuItemRadio>
      <MenuItemRadio value="name">Tên</MenuItemRadio>
      <MenuItemRadio value="size">Kích thước</MenuItemRadio>
    </MenuRadioGroup>
    <MenuDivider />
    <MenuItemCheckbox defaultChecked>Hiện thư mục trước</MenuItemCheckbox>
  </MenuPopover>
</Menu>`,
        render: () => <RadioMenuDemo />,
      },
      {
        title: "Submenu",
        description: "Nhóm lệnh phụ; chỉ lồng tối đa 1 cấp.",
        code: `<Menu>
  <MenuTrigger asChild><Button icon={<Edit20Regular />}>Tệp</Button></MenuTrigger>
  <MenuPopover>
    <MenuItem icon={<Folder20Regular />}>Mở</MenuItem>
    <MenuSub>
      <MenuSubTrigger icon={<Share20Regular />}>Chia sẻ</MenuSubTrigger>
      <MenuSubPopover>
        <MenuItem icon={<Mail20Regular />}>Email</MenuItem>
        <MenuItem icon={<Copy20Regular />}>Sao chép liên kết</MenuItem>
      </MenuSubPopover>
    </MenuSub>
    <MenuItem disabled>Xuất PDF</MenuItem>
  </MenuPopover>
</Menu>`,
        render: () => (
          <Menu>
            <MenuTrigger asChild>
              <Button icon={<Edit20Regular />}>Tệp</Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuItem icon={<Folder20Regular />}>Mở</MenuItem>
              <MenuSub>
                <MenuSubTrigger icon={<Share20Regular />}>Chia sẻ</MenuSubTrigger>
                <MenuSubPopover>
                  <MenuItem icon={<Mail20Regular />}>Email</MenuItem>
                  <MenuItem icon={<Copy20Regular />}>Sao chép liên kết</MenuItem>
                </MenuSubPopover>
              </MenuSub>
              <MenuItem disabled>Xuất PDF</MenuItem>
            </MenuPopover>
          </Menu>
        ),
      },
    ],
    dos: ["Nhãn là động từ ngắn, viết hoa chữ đầu.", "Nhóm lệnh liên quan bằng MenuDivider / MenuGroupHeader.", "Đặt lệnh phá huỷ ở cuối, tách bằng divider."],
    donts: ["Không quá ~10 mục trong một menu.", "Không lồng submenu quá 1 cấp.", "Không đặt nội dung tương tác phức tạp (form) trong menu — dùng Popover."],
    props: [
      { name: "MenuItem.icon", type: "ReactNode", description: "Icon cỡ 20." },
      { name: "MenuItem.secondaryContent", type: "ReactNode", description: "Phím tắt / thông tin phụ ở cuối item. MenuItemCheckbox và MenuItemRadio cũng có." },
      { name: "MenuPopover.align", type: `"start" | "center" | "end"`, defaultValue: `"start"`, description: "Căn với trigger." },
      { name: "MenuPopover.material", type: `"glass" | "glass-clear"`, description: "Yugen Labs — menu bằng glass, thường mở từ thanh glass, mọc ra từ nút mở. MenuSubPopover cũng có." },
      { name: "MenuRadioGroup.value / onValueChange", type: "string", description: "Lựa chọn radio." },
      { name: "MenuItemCheckbox.checked / defaultChecked", type: "boolean", description: "Bật/tắt." },
    ],
  },

  slider: {
    slug: "slider",
    category: "Nhập liệu",
    name: "Slider",
    lead: "Slider cho phép chọn một giá trị (hoặc khoảng) trong dải liên tục bằng cách kéo thumb.",
    description: "Dùng khi giá trị chính xác không quan trọng bằng cảm giác tương đối (âm lượng, độ sáng). Hỗ trợ bàn phím: mũi tên, Home/End, PageUp/PageDown.",
    importCode: `import { Slider } from "@/components/ui";`,
    hero: {
      title: "Slider",
      code: `<Slider label="Độ sáng" showValue defaultValue={[70]} rootClassName="w-72" />`,
      render: () => <Slider label="Độ sáng" showValue defaultValue={[70]} rootClassName="w-72" />,
    },
    examples: [
      {
        title: "Kèm icon & giá trị",
        description: "Controlled với value / onValueChange.",
        code: `const [volume, setVolume] = useState([60]);

<div className="flex w-72 items-center gap-2">
  <Speaker220Regular />
  <Slider aria-label="Âm lượng" value={volume} onValueChange={setVolume} />
  <span className="w-8 text-end">{volume[0]}</span>
</div>`,
        render: () => <VolumeDemo />,
      },
      {
        title: "Khoảng & bước",
        description: "Hai thumb cho khoảng giá trị; step để nhảy theo bước.",
        code: `<Slider label="Khoảng giá (triệu)" showValue defaultValue={[20, 60]} step={5} rootClassName="w-72" />`,
        render: () => <Slider label="Khoảng giá (triệu)" showValue defaultValue={[20, 60]} step={5} rootClassName="w-72" />,
      },
      {
        title: "Kích thước & disabled",
        description: "small, medium (mặc định).",
        code: `<Slider size="small" aria-label="Small" defaultValue={[40]} rootClassName="w-56" />
<Slider aria-label="Medium" defaultValue={[40]} rootClassName="w-56" />
<Slider aria-label="Disabled" defaultValue={[40]} disabled rootClassName="w-56" />`,
        render: () => (
          <div className="flex flex-col gap-2">
            <Slider size="small" aria-label="Small" defaultValue={[40]} rootClassName="w-56" />
            <Slider aria-label="Medium" defaultValue={[40]} rootClassName="w-56" />
            <Slider aria-label="Disabled" defaultValue={[40]} disabled rootClassName="w-56" />
          </div>
        ),
      },
      {
        title: "Glass (Yugen Labs)",
        description: "Nhấn hoặc kéo: thumb thành glass và to ra, thấy thanh trượt qua nó.",
        code: `<Slider label="Âm lượng" material="glass" defaultValue={[60]} rootClassName="w-72" />`,
        render: () => <Slider label="Âm lượng" material="glass" defaultValue={[60]} rootClassName="w-72" />,
      },
    ],
    dos: ["Luôn có label hoặc aria-label.", "Hiện giá trị (showValue) khi con số có ý nghĩa với người dùng."],
    donts: ["Không dùng Slider khi cần nhập số chính xác — dùng SpinButton.", "Không dùng cho dải quá rộng mà bước nhỏ (khó kéo chính xác)."],
    props: [
      { name: "value / defaultValue", type: "number[]", description: "Một phần tử = 1 thumb, hai phần tử = khoảng." },
      { name: "onValueChange", type: "(value: number[]) => void", description: "Callback khi kéo." },
      { name: "min / max / step", type: "number", defaultValue: "0 / 100 / 1", description: "Dải và bước." },
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Thumb 16 / 20px." },
      { name: "label / showValue", type: "ReactNode / boolean", description: "Nhãn và giá trị hiển thị phía trên." },
      { name: "rootClassName", type: "string", description: "Class cho khối ngoài (đặt width)." },
      { name: "material", type: `"glass"`, description: "Yugen Labs — thumb thành glass và to ra khi đang nhấn / kéo." },
    ],
  },
};

export const docs: ComponentDoc[] = Object.values(EXTRA);
