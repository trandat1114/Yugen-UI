import { useEffect, useState } from "react";
import {
  Add20Regular,
  ArrowClockwise20Regular,
  ArrowDown16Regular,
  ArrowRedo20Regular,
  ArrowUndo20Regular,
  ArrowUp16Regular,
  Board20Regular,
  Calculator20Regular,
  CalendarLtr20Regular,
  ChartMultiple20Regular,
  ClipboardPaste20Regular,
  Copy20Regular,
  Cut20Regular,
  Delete20Regular,
  Document20Regular,
  DocumentAdd20Regular,
  Edit20Regular,
  Emoji20Regular,
  Folder20Regular,
  FolderOpen20Regular,
  Grid20Regular,
  Home20Regular,
  Image20Regular,
  Link20Regular,
  List20Regular,
  Mail20Regular,
  Mic20Regular,
  MicOff20Regular,
  MoreHorizontal20Regular,
  People20Regular,
  Person20Regular,
  Pin20Filled,
  Pin20Regular,
  Print20Regular,
  Save20Regular,
  Search20Regular,
  Send20Regular,
  Settings20Regular,
  Share20Regular,
  Star20Filled,
  Star20Regular,
  TextAlignCenter20Regular,
  TextAlignLeft20Regular,
  TextAlignRight20Regular,
  TextBold20Regular,
  TextBulletListLtr20Regular,
  TextItalic20Regular,
  TextNumberListLtr20Regular,
  TextUnderline20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from "@fluentui/react-icons";
import { Button, Menu, MenuItem, MenuPopover, MenuTrigger, SplitButton } from "@/components/ui";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/ButtonGroup/ButtonGroup";
import { ToggleButton } from "@/components/ui/ToggleButton/ToggleButton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup/ToggleGroup";
import { Toolbar, ToolbarButton, ToolbarDivider, ToolbarGroup, ToolbarToggleButton } from "@/components/ui/Toolbar/Toolbar";
import { Link } from "@/components/ui/Link/Link";
import { Kbd, KbdGroup } from "@/components/ui/Kbd/Kbd";
import { Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem } from "@/components/ui/Breadcrumb/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import {
  Nav,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
} from "@/components/ui/Nav/Nav";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/Menubar/Menubar";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu/ContextMenu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/Command/Command";
import type { ComponentDoc } from "../types";

/* ---------- Demo có state (code hiển thị = toàn bộ component) ---------- */

function MuteDemo() {
  const [muted, setMuted] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <ToggleButton
        checked={muted}
        onCheckedChange={setMuted}
        icon={<Mic20Regular />}
        checkedIcon={<MicOff20Regular />}
        aria-label="Tắt tiếng"
      />
      <span className="text-body1 text-foreground-2">{muted ? "Đang tắt tiếng" : "Micro đang bật"}</span>
    </div>
  );
}

function AlignDemo() {
  const [align, setAlign] = useState("left");
  return (
    <ToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)} aria-label="Căn lề">
      <ToggleGroupItem value="left" icon={<TextAlignLeft20Regular />} aria-label="Căn trái" />
      <ToggleGroupItem value="center" icon={<TextAlignCenter20Regular />} aria-label="Căn giữa" />
      <ToggleGroupItem value="right" icon={<TextAlignRight20Regular />} aria-label="Căn phải" />
    </ToggleGroup>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <div className="flex flex-col items-center gap-2">
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <span className="text-caption1 text-foreground-3">Trang {page} / 20</span>
    </div>
  );
}

function NavDemo() {
  const [selected, setSelected] = useState("overview");
  return (
    <Nav
      selectedValue={selected}
      onNavItemSelect={setSelected}
      defaultOpenCategories={["projects"]}
      aria-label="Quản lý"
      className="w-64"
    >
      <NavItem value="overview" icon={<Board20Regular />}>Tổng quan</NavItem>
      <NavItem value="reports" icon={<ChartMultiple20Regular />}>Báo cáo</NavItem>
      <NavSectionHeader>Công việc</NavSectionHeader>
      <NavCategory value="projects">
        <NavCategoryItem icon={<Folder20Regular />}>Dự án</NavCategoryItem>
        <NavSubItemGroup>
          <NavSubItem value="active">Đang chạy</NavSubItem>
          <NavSubItem value="archived">Lưu trữ</NavSubItem>
        </NavSubItemGroup>
      </NavCategory>
      <NavCategory value="people">
        <NavCategoryItem icon={<People20Regular />}>Nhân sự</NavCategoryItem>
        <NavSubItemGroup>
          <NavSubItem value="members">Thành viên</NavSubItem>
          <NavSubItem value="roles">Vai trò</NavSubItem>
        </NavSubItemGroup>
      </NavCategory>
      <NavDivider />
      <NavItem value="settings" icon={<Settings20Regular />}>Cài đặt</NavItem>
    </Nav>
  );
}

function MenubarDemo() {
  const [ruler, setRuler] = useState(true);
  const [grid, setGrid] = useState(false);
  const [zoom, setZoom] = useState("100");
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Xem</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>Thước kẻ</MenubarCheckboxItem>
          <MenubarCheckboxItem checked={grid} onCheckedChange={setGrid} secondaryContent="Ctrl+'">Lưới</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Thu phóng</MenubarLabel>
          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenubarRadioItem value="75">75%</MenubarRadioItem>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="150">150%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Chia sẻ</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger icon={<Share20Regular />}>Gửi qua</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem icon={<Mail20Regular />}>Email</MenubarItem>
              <MenubarItem icon={<Link20Regular />}>Sao chép liên kết</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem disabled>Xuất bản</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function ContextMenuDemo() {
  const [showGrid, setShowGrid] = useState(true);
  const [sort, setSort] = useState("name");
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-36 w-72 items-center justify-center rounded-xlarge border border-dashed border-stroke-1 text-body1 text-foreground-3 select-none">
          Nhấp chuột phải vào đây
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<Add20Regular />}>Tạo mới</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem icon={<Folder20Regular />}>Thư mục</ContextMenuItem>
            <ContextMenuItem icon={<Document20Regular />}>Tài liệu</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem icon={<ArrowClockwise20Regular />}>Làm mới</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>Hiện lưới</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Sắp xếp theo</ContextMenuLabel>
        <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
          <ContextMenuRadioItem value="name">Tên</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Ngày sửa</ContextMenuRadioItem>
          <ContextMenuRadioItem value="size">Kích thước</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function CommandDialogDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button icon={<Search20Regular />} onClick={() => setOpen(true)}>
        Mở bảng lệnh
        <KbdGroup className="ms-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Nhập lệnh hoặc tìm kiếm…" />
        <CommandList>
          <CommandEmpty>Không có kết quả.</CommandEmpty>
          <CommandGroup heading="Điều hướng">
            <CommandItem icon={<Home20Regular />} onSelect={() => setOpen(false)}>Trang chủ</CommandItem>
            <CommandItem icon={<Document20Regular />} onSelect={() => setOpen(false)}>Tài liệu</CommandItem>
            <CommandItem icon={<Settings20Regular />} onSelect={() => setOpen(false)}>Cài đặt</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Giao diện">
            <CommandItem icon={<WeatherSunny20Regular />} onSelect={() => setOpen(false)}>Chế độ sáng</CommandItem>
            <CommandItem icon={<WeatherMoon20Regular />} onSelect={() => setOpen(false)}>Chế độ tối</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

/* ---------- Docs ---------- */

export const docs: ComponentDoc[] = [
  /* ===== ButtonGroup ===== */
  {
    slug: "buttongroup",
    name: "ButtonGroup",
    category: "Hành động",
    lead: "ButtonGroup ghép các nút liền kề thành một khối điều khiển thống nhất cho những hành động cùng nhóm.",
    description:
      "Bo góc bên trong và viền chồng nhau được gộp tự động (-ms-px), theo hướng ngang hoặc dọc. Dùng ButtonGroupSeparator khi các nút không có viền (primary, subtle). Hoạt động cùng Button, ToggleButton và SplitButton.",
    importCode: `import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui";`,
    hero: {
      title: "ButtonGroup",
      code: `<ButtonGroup>
  <Button icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />}>Hoàn tác</Button>
  <Button icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />}>Làm lại</Button>
  <Button icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
</ButtonGroup>`,
      render: () => (
        <ButtonGroup>
          <Button icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />}>Hoàn tác</Button>
          <Button icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />}>Làm lại</Button>
          <Button icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
        </ButtonGroup>
      ),
    },
    examples: [
      {
        title: "Hướng dọc",
        description: "orientation=\"vertical\" — thường dùng cho cặp phóng to / thu nhỏ trên bản đồ, canvas.",
        code: `<ButtonGroup orientation="vertical">
  <Button icon={<ZoomIn20Regular />} aria-label="Phóng to" />
  <Button icon={<ZoomOut20Regular />} aria-label="Thu nhỏ" />
</ButtonGroup>`,
        render: () => (
          <ButtonGroup orientation="vertical">
            <Button icon={<ZoomIn20Regular />} aria-label="Phóng to" />
            <Button icon={<ZoomOut20Regular />} aria-label="Thu nhỏ" />
          </ButtonGroup>
        ),
      },
      {
        title: "Vạch chia",
        description: "Nút primary không có viền — thêm ButtonGroupSeparator appearance=\"on-brand\" để tách.",
        code: `<ButtonGroup>
  <Button appearance="primary" icon={<Save20Regular />}>Lưu</Button>
  <ButtonGroupSeparator appearance="on-brand" />
  <Button appearance="primary">Lưu bản sao</Button>
</ButtonGroup>`,
        render: () => (
          <ButtonGroup>
            <Button appearance="primary" icon={<Save20Regular />}>
              Lưu
            </Button>
            <ButtonGroupSeparator appearance="on-brand" />
            <Button appearance="primary">Lưu bản sao</Button>
          </ButtonGroup>
        ),
      },
      {
        title: "Kết hợp SplitButton",
        description: "SplitButton đặt trong nhóm cũng được gộp bo góc.",
        code: `<ButtonGroup>
  <Button icon={<Add20Regular />}>Mới</Button>
  <SplitButton
    menu={
      <>
        <MenuItem>Tải lên tệp</MenuItem>
        <MenuItem>Tải lên thư mục</MenuItem>
      </>
    }
  >
    Tải lên
  </SplitButton>
</ButtonGroup>`,
        render: () => (
          <ButtonGroup>
            <Button icon={<Add20Regular />}>Mới</Button>
            <SplitButton
              menu={
                <>
                  <MenuItem>Tải lên tệp</MenuItem>
                  <MenuItem>Tải lên thư mục</MenuItem>
                </>
              }
            >
              Tải lên
            </SplitButton>
          </ButtonGroup>
        ),
      },
    ],
    dos: [
      "Chỉ nhóm các hành động liên quan chặt chẽ (hoàn tác/làm lại, phóng to/thu nhỏ).",
      "Dùng cùng appearance và size cho mọi nút trong nhóm.",
      "Thêm aria-label cho nút chỉ có icon.",
    ],
    donts: [
      "Không nhóm quá 5 nút — cân nhắc Toolbar hoặc Menu.",
      "Không trộn primary và secondary trong cùng một nhóm.",
    ],
    props: [
      { name: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng xếp nút; bo góc và viền giữa được gộp tự động." },
      { name: "children", type: "ReactNode", description: "Button, ToggleButton, SplitButton, ButtonGroupSeparator." },
      { name: "ButtonGroupSeparator.appearance", type: `"default" | "on-brand"`, defaultValue: `"default"`, description: "on-brand khi đặt giữa các nút primary." },
      { name: "ButtonGroupSeparator.orientation", type: `"vertical" | "horizontal"`, defaultValue: `"vertical"`, description: "Ngược với hướng của nhóm." },
    ],
  },

  /* ===== ToggleButton ===== */
  {
    slug: "togglebutton",
    name: "ToggleButton",
    category: "Hành động",
    lead: "ToggleButton là nút có hai trạng thái bật/tắt, dùng để bật hoặc tắt một tuỳ chọn ngay lập tức.",
    description:
      "Cùng appearance và size với Button. Khi bật: secondary chuyển nền đậm hơn, primary đổi sắc brand, outline viền dày, subtle/transparent tô brand cho icon/chữ. Có thể đổi icon theo trạng thái (icon → checkedIcon). Trình đọc màn hình nhận trạng thái qua aria-pressed.",
    importCode: `import { ToggleButton } from "@/components/ui";`,
    hero: {
      title: "ToggleButton",
      code: `<ToggleButton defaultChecked icon={<Star20Regular />} checkedIcon={<Star20Filled />}>
  Yêu thích
</ToggleButton>`,
      render: () => (
        <ToggleButton defaultChecked icon={<Star20Regular />} checkedIcon={<Star20Filled />}>
          Yêu thích
        </ToggleButton>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "Các nút dưới đây đang ở trạng thái bật — bấm để so sánh với trạng thái tắt.",
        code: `<ToggleButton defaultChecked>Secondary</ToggleButton>
<ToggleButton appearance="primary" defaultChecked>Primary</ToggleButton>
<ToggleButton appearance="outline" defaultChecked>Outline</ToggleButton>
<ToggleButton appearance="subtle" defaultChecked icon={<Pin20Regular />} checkedIcon={<Pin20Filled />}>
  Subtle
</ToggleButton>
<ToggleButton appearance="transparent" defaultChecked>Transparent</ToggleButton>`,
        render: () => (
          <>
            <ToggleButton defaultChecked>Secondary</ToggleButton>
            <ToggleButton appearance="primary" defaultChecked>
              Primary
            </ToggleButton>
            <ToggleButton appearance="outline" defaultChecked>
              Outline
            </ToggleButton>
            <ToggleButton appearance="subtle" defaultChecked icon={<Pin20Regular />} checkedIcon={<Pin20Filled />}>
              Subtle
            </ToggleButton>
            <ToggleButton appearance="transparent" defaultChecked>
              Transparent
            </ToggleButton>
          </>
        ),
      },
      {
        title: "Controlled & đổi icon",
        description: "checked / onCheckedChange; nhãn aria-label giữ cố định, trạng thái do aria-pressed truyền đạt.",
        code: `const [muted, setMuted] = useState(false);

<div className="flex items-center gap-2">
  <ToggleButton
    checked={muted}
    onCheckedChange={setMuted}
    icon={<Mic20Regular />}
    checkedIcon={<MicOff20Regular />}
    aria-label="Tắt tiếng"
  />
  <span className="text-body1 text-foreground-2">{muted ? "Đang tắt tiếng" : "Micro đang bật"}</span>
</div>`,
        render: () => <MuteDemo />,
      },
      {
        title: "Kích thước & disabled",
        description: "small, medium (mặc định), large.",
        code: `<ToggleButton size="small" defaultChecked>Small</ToggleButton>
<ToggleButton size="medium" defaultChecked>Medium</ToggleButton>
<ToggleButton size="large" defaultChecked>Large</ToggleButton>
<ToggleButton disabled defaultChecked>Disabled</ToggleButton>`,
        render: () => (
          <>
            <ToggleButton size="small" defaultChecked>
              Small
            </ToggleButton>
            <ToggleButton size="medium" defaultChecked>
              Medium
            </ToggleButton>
            <ToggleButton size="large" defaultChecked>
              Large
            </ToggleButton>
            <ToggleButton disabled defaultChecked>
              Disabled
            </ToggleButton>
          </>
        ),
      },
    ],
    dos: [
      "Dùng cho tuỳ chọn có hiệu lực ngay (ghim, tắt tiếng, in đậm).",
      "Đổi sang icon Filled khi bật để tăng tín hiệu thị giác.",
      "Giữ nhãn cố định; để aria-pressed mô tả trạng thái.",
    ],
    donts: [
      "Không đổi nhãn theo trạng thái (“Bật” ↔ “Tắt”) — gây nhầm lẫn với trình đọc màn hình.",
      "Không dùng cho thiết lập cần lưu/xác nhận — dùng Switch hoặc Checkbox trong form.",
    ],
    props: [
      { name: "appearance", type: `"secondary" | "primary" | "outline" | "subtle" | "transparent"`, defaultValue: `"secondary"`, description: "Kiểu hiển thị." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "shape", type: `"rounded" | "circular" | "square"`, defaultValue: `"rounded"`, description: "Bo góc." },
      { name: "checked / defaultChecked", type: "boolean", description: "Trạng thái bật (controlled / uncontrolled)." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Gọi khi người dùng bấm." },
      { name: "icon / checkedIcon", type: "ReactNode", description: "Icon khi tắt / khi bật." },
      { name: "iconPosition", type: `"before" | "after"`, defaultValue: `"before"`, description: "Vị trí icon." },
      { name: "disabled", type: "boolean", description: "Vô hiệu hoá." },
    ],
  },

  /* ===== ToggleGroup ===== */
  {
    slug: "togglegroup",
    name: "ToggleGroup",
    category: "Hành động",
    lead: "ToggleGroup gom các ToggleButton liên quan để chọn một hoặc nhiều tuỳ chọn trong cùng nhóm.",
    description:
      "type=\"single\" cho lựa chọn loại trừ (căn lề), type=\"multiple\" cho các tuỳ chọn độc lập (đậm, nghiêng, gạch chân). Secondary/outline ghép liền viền; subtle/transparent để rời. Điều hướng bằng phím mũi tên trong nhóm.",
    importCode: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui";`,
    hero: {
      title: "ToggleGroup",
      code: `<ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Định dạng chữ">
  <ToggleGroupItem value="bold" icon={<TextBold20Regular />} aria-label="In đậm" />
  <ToggleGroupItem value="italic" icon={<TextItalic20Regular />} aria-label="In nghiêng" />
  <ToggleGroupItem value="underline" icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
</ToggleGroup>`,
      render: () => (
        <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Định dạng chữ">
          <ToggleGroupItem value="bold" icon={<TextBold20Regular />} aria-label="In đậm" />
          <ToggleGroupItem value="italic" icon={<TextItalic20Regular />} aria-label="In nghiêng" />
          <ToggleGroupItem value="underline" icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
        </ToggleGroup>
      ),
    },
    examples: [
      {
        title: "Chọn một (single)",
        description: "Controlled; bỏ qua giá trị rỗng để luôn có một mục được chọn.",
        code: `const [align, setAlign] = useState("left");

<ToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)} aria-label="Căn lề">
  <ToggleGroupItem value="left" icon={<TextAlignLeft20Regular />} aria-label="Căn trái" />
  <ToggleGroupItem value="center" icon={<TextAlignCenter20Regular />} aria-label="Căn giữa" />
  <ToggleGroupItem value="right" icon={<TextAlignRight20Regular />} aria-label="Căn phải" />
</ToggleGroup>`,
        render: () => <AlignDemo />,
      },
      {
        title: "Subtle, có nhãn",
        description: "appearance=\"subtle\" — các mục để rời, mục bật có nền và icon brand.",
        code: `<ToggleGroup type="single" defaultValue="list" appearance="subtle" aria-label="Kiểu hiển thị">
  <ToggleGroupItem value="list" icon={<List20Regular />}>Danh sách</ToggleGroupItem>
  <ToggleGroupItem value="grid" icon={<Grid20Regular />}>Lưới</ToggleGroupItem>
</ToggleGroup>`,
        render: () => (
          <ToggleGroup type="single" defaultValue="list" appearance="subtle" aria-label="Kiểu hiển thị">
            <ToggleGroupItem value="list" icon={<List20Regular />}>
              Danh sách
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" icon={<Grid20Regular />}>
              Lưới
            </ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        title: "Outline, small",
        description: "Bộ chọn khoảng thời gian gọn.",
        code: `<ToggleGroup type="single" defaultValue="week" appearance="outline" size="small" aria-label="Khoảng thời gian">
  <ToggleGroupItem value="day">Ngày</ToggleGroupItem>
  <ToggleGroupItem value="week">Tuần</ToggleGroupItem>
  <ToggleGroupItem value="month">Tháng</ToggleGroupItem>
</ToggleGroup>`,
        render: () => (
          <ToggleGroup type="single" defaultValue="week" appearance="outline" size="small" aria-label="Khoảng thời gian">
            <ToggleGroupItem value="day">Ngày</ToggleGroupItem>
            <ToggleGroupItem value="week">Tuần</ToggleGroupItem>
            <ToggleGroupItem value="month">Tháng</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
    dos: [
      "Đặt aria-label cho cả nhóm và cho từng mục chỉ có icon.",
      "Dùng single cho lựa chọn loại trừ, multiple cho tuỳ chọn độc lập.",
    ],
    donts: [
      "Không dùng thay Tabs để chuyển nội dung trang.",
      "Không đặt quá ~6 mục; nhiều hơn hãy dùng Menu hoặc Select.",
    ],
    props: [
      { name: "type", type: `"single" | "multiple"`, description: "Bắt buộc. Chọn một hay nhiều." },
      { name: "value / defaultValue", type: "string | string[]", description: "Giá trị đang bật (string với single, mảng với multiple)." },
      { name: "onValueChange", type: "(value) => void", description: "Gọi khi thay đổi lựa chọn." },
      { name: "appearance", type: `"secondary" | "outline" | "subtle" | "transparent"`, defaultValue: `"secondary"`, description: "Secondary/outline ghép viền; subtle/transparent để rời." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Kích thước mục." },
      { name: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng nhóm và phím mũi tên." },
      { name: "ToggleGroupItem.value / icon", type: "string / ReactNode", description: "Giá trị và icon của mục." },
    ],
  },

  /* ===== Toolbar ===== */
  {
    slug: "toolbar",
    name: "Toolbar",
    category: "Hành động",
    lead: "Toolbar gom các lệnh thường dùng thành một thanh ngang hoặc dọc, điều hướng bằng phím mũi tên.",
    description:
      "Gồm ToolbarButton (subtle), ToolbarToggleButton, ToolbarDivider và ToolbarGroup. Roving focus: Tab vào toolbar một lần, mũi tên / Home / End di chuyển giữa các mục (vòng tròn). Ba kích thước small, medium, large ứng với Button.",
    importCode: `import { Toolbar, ToolbarButton, ToolbarToggleButton, ToolbarDivider, ToolbarGroup } from "@/components/ui";`,
    hero: {
      title: "Toolbar",
      code: `<Toolbar aria-label="Định dạng">
  <ToolbarToggleButton icon={<TextBold20Regular />} aria-label="In đậm" />
  <ToolbarToggleButton icon={<TextItalic20Regular />} aria-label="In nghiêng" />
  <ToolbarToggleButton icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
  <ToolbarDivider />
  <ToolbarButton icon={<Link20Regular />} aria-label="Chèn liên kết" />
  <ToolbarButton icon={<Image20Regular />} aria-label="Chèn ảnh" />
</Toolbar>`,
      render: () => (
        <Toolbar aria-label="Định dạng">
          <ToolbarToggleButton icon={<TextBold20Regular />} aria-label="In đậm" />
          <ToolbarToggleButton icon={<TextItalic20Regular />} aria-label="In nghiêng" />
          <ToolbarToggleButton icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
          <ToolbarDivider />
          <ToolbarButton icon={<Link20Regular />} aria-label="Chèn liên kết" />
          <ToolbarButton icon={<Image20Regular />} aria-label="Chèn ảnh" />
        </Toolbar>
      ),
    },
    examples: [
      {
        title: "Nhóm & menu tràn",
        description: "ToolbarGroup chia hai đầu; lệnh ít dùng đưa vào Menu.",
        code: `<Toolbar aria-label="Soạn thảo" className="w-full max-w-120 justify-between">
  <ToolbarGroup>
    <ToolbarButton icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} aria-label="Hoàn tác" />
    <ToolbarButton icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />} aria-label="Làm lại" />
    <ToolbarDivider />
    <ToolbarButton icon={<TextBulletListLtr20Regular />} aria-label="Danh sách dấu đầu dòng" />
    <ToolbarButton icon={<TextNumberListLtr20Regular />} aria-label="Danh sách số" />
  </ToolbarGroup>
  <ToolbarGroup>
    <ToolbarButton icon={<Share20Regular />}>Chia sẻ</ToolbarButton>
    <Menu>
      <MenuTrigger asChild>
        <ToolbarButton icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuItem icon={<Print20Regular />}>In</MenuItem>
        <MenuItem icon={<Save20Regular />}>Lưu bản sao</MenuItem>
      </MenuPopover>
    </Menu>
  </ToolbarGroup>
</Toolbar>`,
        render: () => (
          <Toolbar aria-label="Soạn thảo" className="w-full max-w-120 justify-between">
            <ToolbarGroup>
              <ToolbarButton icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} aria-label="Hoàn tác" />
              <ToolbarButton icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />} aria-label="Làm lại" />
              <ToolbarDivider />
              <ToolbarButton icon={<TextBulletListLtr20Regular />} aria-label="Danh sách dấu đầu dòng" />
              <ToolbarButton icon={<TextNumberListLtr20Regular />} aria-label="Danh sách số" />
            </ToolbarGroup>
            <ToolbarGroup>
              <ToolbarButton icon={<Share20Regular />}>Chia sẻ</ToolbarButton>
              <Menu>
                <MenuTrigger asChild>
                  <ToolbarButton icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
                </MenuTrigger>
                <MenuPopover align="end">
                  <MenuItem icon={<Print20Regular />}>In</MenuItem>
                  <MenuItem icon={<Save20Regular />}>Lưu bản sao</MenuItem>
                </MenuPopover>
              </Menu>
            </ToolbarGroup>
          </Toolbar>
        ),
      },
      {
        title: "Kích thước",
        description: "small và large (medium là mặc định).",
        code: `<div className="flex flex-col items-center gap-3">
  <Toolbar size="small" aria-label="Toolbar small">
    <ToolbarButton icon={<Cut20Regular />} aria-label="Cắt" />
    <ToolbarButton icon={<Copy20Regular />} aria-label="Sao chép" />
    <ToolbarButton icon={<ClipboardPaste20Regular />} aria-label="Dán" />
  </Toolbar>
  <Toolbar size="large" aria-label="Toolbar large">
    <ToolbarButton icon={<Cut20Regular />} aria-label="Cắt" />
    <ToolbarButton icon={<Copy20Regular />} aria-label="Sao chép" />
    <ToolbarButton icon={<ClipboardPaste20Regular />} aria-label="Dán" />
  </Toolbar>
</div>`,
        render: () => (
          <div className="flex flex-col items-center gap-3">
            <Toolbar size="small" aria-label="Toolbar small">
              <ToolbarButton icon={<Cut20Regular />} aria-label="Cắt" />
              <ToolbarButton icon={<Copy20Regular />} aria-label="Sao chép" />
              <ToolbarButton icon={<ClipboardPaste20Regular />} aria-label="Dán" />
            </Toolbar>
            <Toolbar size="large" aria-label="Toolbar large">
              <ToolbarButton icon={<Cut20Regular />} aria-label="Cắt" />
              <ToolbarButton icon={<Copy20Regular />} aria-label="Sao chép" />
              <ToolbarButton icon={<ClipboardPaste20Regular />} aria-label="Dán" />
            </Toolbar>
          </div>
        ),
      },
      {
        title: "Dọc",
        description: "orientation=\"vertical\" — dùng phím mũi tên lên / xuống.",
        code: `<Toolbar orientation="vertical" aria-label="Công cụ vẽ">
  <ToolbarButton icon={<Edit20Regular />} aria-label="Bút" />
  <ToolbarButton icon={<Image20Regular />} aria-label="Ảnh" />
  <ToolbarDivider />
  <ToolbarButton icon={<Delete20Regular />} aria-label="Xoá" />
</Toolbar>`,
        render: () => (
          <Toolbar orientation="vertical" aria-label="Công cụ vẽ">
            <ToolbarButton icon={<Edit20Regular />} aria-label="Bút" />
            <ToolbarButton icon={<Image20Regular />} aria-label="Ảnh" />
            <ToolbarDivider />
            <ToolbarButton icon={<Delete20Regular />} aria-label="Xoá" />
          </Toolbar>
        ),
      },
    ],
    dos: [
      "Luôn đặt aria-label cho Toolbar và cho mọi nút chỉ có icon.",
      "Nhóm lệnh liên quan bằng ToolbarDivider / ToolbarGroup.",
      "Đưa lệnh ít dùng vào menu “Thêm” ở cuối thanh.",
    ],
    donts: [
      "Không đặt ô nhập dài hay nội dung phức tạp vào toolbar.",
      "Không dùng appearance primary cho nhiều nút trong cùng thanh.",
    ],
    props: [
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Áp dụng cho mọi ToolbarButton bên trong." },
      { name: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng thanh và phím mũi tên." },
      { name: "aria-label", type: "string", description: "Tên của toolbar cho trình đọc màn hình." },
      { name: "ToolbarButton", type: "ButtonProps & { vertical?: boolean }", description: "Button mặc định appearance=\"subtle\"; vertical đặt icon trên chữ." },
      { name: "ToolbarToggleButton", type: "ToggleButtonProps", description: "ToggleButton subtle, có checked / onCheckedChange." },
      { name: "ToolbarDivider / ToolbarGroup", type: "HTMLAttributes", description: "Vạch chia 1px stroke-2 / nhóm mục." },
    ],
  },

  /* ===== Link ===== */
  {
    slug: "link",
    name: "Link",
    category: "Hành động",
    lead: "Link dẫn người dùng tới trang, tài nguyên hoặc vị trí khác, nằm trong đoạn văn hoặc đứng riêng.",
    description:
      "Appearance default dùng màu link brand, subtle dùng foreground-2; cả hai gạch chân khi hover. Link inline (trong câu) luôn gạch chân và kế thừa cỡ chữ. Hỗ trợ disabled, mở trang ngoài (icon + target=_blank) và asChild để bọc link của router.",
    importCode: `import { Link } from "@/components/ui";`,
    hero: {
      title: "Link",
      code: `<Link href="#/components/link">Xem tất cả tài liệu</Link>`,
      render: () => <Link href="#/components/link">Xem tất cả tài liệu</Link>,
    },
    examples: [
      {
        title: "Appearance & disabled",
        description: "default (brand), subtle (neutral), disabled.",
        code: `<Link href="#/components/link">Default</Link>
<Link href="#/components/link" appearance="subtle">Subtle</Link>
<Link href="#/components/link" disabled>Disabled</Link>`,
        render: () => (
          <>
            <Link href="#/components/link">Default</Link>
            <Link href="#/components/link" appearance="subtle">
              Subtle
            </Link>
            <Link href="#/components/link" disabled>
              Disabled
            </Link>
          </>
        ),
      },
      {
        title: "Inline trong đoạn văn",
        description: "inline luôn gạch chân để không chỉ dựa vào màu sắc.",
        code: `<p className="max-w-100 text-body1 text-foreground-1">
  Bằng việc tiếp tục, bạn đồng ý với <Link inline href="#/components/link">Điều khoản dịch vụ</Link> và{" "}
  <Link inline href="#/components/link">Chính sách quyền riêng tư</Link> của chúng tôi.
</p>`,
        render: () => (
          <p className="max-w-100 text-body1 text-foreground-1">
            Bằng việc tiếp tục, bạn đồng ý với <Link inline href="#/components/link">Điều khoản dịch vụ</Link> và{" "}
            <Link inline href="#/components/link">Chính sách quyền riêng tư</Link> của chúng tôi.
          </p>
        ),
      },
      {
        title: "Trang ngoài & asChild",
        description: "external thêm icon và mở tab mới; asChild giữ style khi bọc phần tử khác.",
        code: `<Link href="https://fluent2.microsoft.design" external>Fluent 2 Design System</Link>
<Link asChild>
  <a href="#/components/button">Đi tới Button</a>
</Link>`,
        render: () => (
          <>
            <Link href="https://fluent2.microsoft.design" external>
              Fluent 2 Design System
            </Link>
            <Link asChild>
              <a href="#/components/button">Đi tới Button</a>
            </Link>
          </>
        ),
      },
    ],
    dos: [
      "Nhãn mô tả đích đến (“Xem báo cáo quý”), không dùng “Bấm vào đây”.",
      "Dùng inline cho link trong câu để luôn có gạch chân.",
      "Báo trước khi link mở tab mới (external).",
    ],
    donts: [
      "Không dùng Link cho hành động thay đổi dữ liệu — dùng Button.",
      "Không tô màu brand cho chữ thường để giả làm link.",
    ],
    props: [
      { name: "appearance", type: `"default" | "subtle"`, defaultValue: `"default"`, description: "Màu brand hoặc neutral." },
      { name: "inline", type: "boolean", defaultValue: "false", description: "Trong đoạn văn: luôn gạch chân, kế thừa cỡ chữ." },
      { name: "disabled", type: "boolean", description: "Bỏ href, aria-disabled, chặn click." },
      { name: "external", type: "boolean", description: "Thêm icon mở ngoài, target=\"_blank\", rel=\"noopener noreferrer\"." },
      { name: "asChild", type: "boolean", description: "Áp style lên phần tử con (link của router)." },
      { name: "href, target, onClick…", type: "AnchorHTMLAttributes", description: "Truyền xuống thẻ <a>." },
    ],
  },

  /* ===== Kbd ===== */
  {
    slug: "kbd",
    name: "Kbd",
    category: "Hiển thị dữ liệu",
    lead: "Kbd hiển thị phím hoặc tổ hợp phím tắt để hướng dẫn người dùng thao tác bằng bàn phím.",
    description:
      "Chip phím dùng font mono, nền background-3, viền stroke-1 với cạnh dưới dày hơn như phím thật. KbdGroup ghép nhiều phím thành tổ hợp (Ctrl + K) và dùng thẻ <kbd> lồng nhau đúng ngữ nghĩa HTML.",
    importCode: `import { Kbd, KbdGroup } from "@/components/ui";`,
    hero: {
      title: "Kbd",
      code: `<KbdGroup>
  <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
</KbdGroup>`,
      render: () => (
        <KbdGroup>
          <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
        </KbdGroup>
      ),
    },
    examples: [
      {
        title: "Trong câu hướng dẫn",
        code: `<p className="text-body1 text-foreground-2">
  Nhấn <Kbd>/</Kbd> để tìm kiếm hoặc{" "}
  <KbdGroup>
    <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
  </KbdGroup>{" "}
  để mở bảng lệnh.
</p>`,
        render: () => (
          <p className="text-body1 text-foreground-2">
            Nhấn <Kbd>/</Kbd> để tìm kiếm hoặc{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
            </KbdGroup>{" "}
            để mở bảng lệnh.
          </p>
        ),
      },
      {
        title: "Kích thước & icon",
        description: "size small / medium; phím mũi tên dùng icon kèm chữ ẩn (sr-only) cho trình đọc màn hình.",
        code: `<Kbd size="small">Esc</Kbd>
<Kbd>Esc</Kbd>
<KbdGroup>
  <Kbd><ArrowUp16Regular /><span className="sr-only">Mũi tên lên</span></Kbd>
  <Kbd><ArrowDown16Regular /><span className="sr-only">Mũi tên xuống</span></Kbd>
</KbdGroup>`,
        render: () => (
          <>
            <Kbd size="small">Esc</Kbd>
            <Kbd>Esc</Kbd>
            <KbdGroup>
              <Kbd>
                <ArrowUp16Regular />
                <span className="sr-only">Mũi tên lên</span>
              </Kbd>
              <Kbd>
                <ArrowDown16Regular />
                <span className="sr-only">Mũi tên xuống</span>
              </Kbd>
            </KbdGroup>
          </>
        ),
      },
    ],
    dos: [
      "Viết tên phím đúng như in trên bàn phím (Ctrl, Shift, Enter).",
      "Hiện phím tắt cạnh lệnh tương ứng (menu, tooltip, nút).",
    ],
    donts: [
      "Không dùng Kbd để trang trí hoặc làm Badge.",
      "Không liệt kê tổ hợp quá 3 phím trong một dòng chữ.",
    ],
    props: [
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Cao 16 / 20px." },
      { name: "children", type: "ReactNode", description: "Tên phím hoặc icon (kèm chữ sr-only — <kbd> không nhận aria-label)." },
      { name: "KbdGroup", type: "HTMLAttributes", description: "Bọc các Kbd và dấu “+” của tổ hợp phím." },
    ],
  },

  /* ===== Breadcrumb ===== */
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    category: "Điều hướng",
    lead: "Breadcrumb cho biết vị trí hiện tại trong cấu trúc phân cấp và cho phép quay lại các cấp cha.",
    description:
      "Mục cuối là trang hiện tại: chữ semibold, aria-current=\"page\", không bấm được. Ba kích thước small, medium, large. Truyền items + maxDisplayedItems để tự gom các mục giữa vào menu “…”.",
    importCode: `import { Breadcrumb, BreadcrumbItem, BreadcrumbButton, BreadcrumbDivider } from "@/components/ui";`,
    hero: {
      title: "Breadcrumb",
      code: `<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbButton>Trang chủ</BreadcrumbButton>
  </BreadcrumbItem>
  <BreadcrumbDivider />
  <BreadcrumbItem>
    <BreadcrumbButton>Tài liệu</BreadcrumbButton>
  </BreadcrumbItem>
  <BreadcrumbDivider />
  <BreadcrumbItem>
    <BreadcrumbButton current>Báo cáo quý</BreadcrumbButton>
  </BreadcrumbItem>
</Breadcrumb>`,
      render: () => (
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbButton>Trang chủ</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton>Tài liệu</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton current>Báo cáo quý</BreadcrumbButton>
          </BreadcrumbItem>
        </Breadcrumb>
      ),
    },
    examples: [
      {
        title: "Kích thước & icon",
        description: "small, large; icon đặt ở mục gốc.",
        code: `<div className="flex flex-col items-center gap-3">
  <Breadcrumb size="small">
    <BreadcrumbItem>
      <BreadcrumbButton icon={<Home20Regular />}>Trang chủ</BreadcrumbButton>
    </BreadcrumbItem>
    <BreadcrumbDivider />
    <BreadcrumbItem>
      <BreadcrumbButton current>Cài đặt</BreadcrumbButton>
    </BreadcrumbItem>
  </Breadcrumb>
  <Breadcrumb size="large">
    <BreadcrumbItem>
      <BreadcrumbButton icon={<Home20Regular />}>Trang chủ</BreadcrumbButton>
    </BreadcrumbItem>
    <BreadcrumbDivider />
    <BreadcrumbItem>
      <BreadcrumbButton current>Cài đặt</BreadcrumbButton>
    </BreadcrumbItem>
  </Breadcrumb>
</div>`,
        render: () => (
          <div className="flex flex-col items-center gap-3">
            <Breadcrumb size="small">
              <BreadcrumbItem>
                <BreadcrumbButton icon={<Home20Regular />}>Trang chủ</BreadcrumbButton>
              </BreadcrumbItem>
              <BreadcrumbDivider />
              <BreadcrumbItem>
                <BreadcrumbButton current>Cài đặt</BreadcrumbButton>
              </BreadcrumbItem>
            </Breadcrumb>
            <Breadcrumb size="large">
              <BreadcrumbItem>
                <BreadcrumbButton icon={<Home20Regular />}>Trang chủ</BreadcrumbButton>
              </BreadcrumbItem>
              <BreadcrumbDivider />
              <BreadcrumbItem>
                <BreadcrumbButton current>Cài đặt</BreadcrumbButton>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        ),
      },
      {
        title: "Thu gọn mục giữa",
        description: "items + maxDisplayedItems: các mục vượt quá được gom vào menu “…”.",
        code: `<Breadcrumb
  maxDisplayedItems={3}
  items={[
    { label: "Trang chủ", icon: <Home20Regular /> },
    { label: "Dự án" },
    { label: "2026" },
    { label: "Thiết kế" },
    { label: "Fluent 2" },
    { label: "Breadcrumb" },
  ]}
/>`,
        render: () => (
          <Breadcrumb
            maxDisplayedItems={3}
            items={[
              { label: "Trang chủ", icon: <Home20Regular /> },
              { label: "Dự án" },
              { label: "2026" },
              { label: "Thiết kế" },
              { label: "Fluent 2" },
              { label: "Breadcrumb" },
            ]}
          />
        ),
      },
    ],
    dos: [
      "Đặt Breadcrumb ở đầu trang, phía trên tiêu đề.",
      "Thu gọn mục giữa khi đường dẫn dài; luôn giữ mục gốc và mục hiện tại.",
      "Nhãn mỗi mục khớp với tiêu đề trang đích.",
    ],
    donts: [
      "Không dùng Breadcrumb thay cho điều hướng chính.",
      "Không cho mục hiện tại bấm được.",
    ],
    props: [
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "items", type: "{ key?, label, href?, onClick?, icon? }[]", description: "Chế độ dữ liệu: tự chèn divider, mục cuối là trang hiện tại." },
      { name: "maxDisplayedItems", type: "number", description: "Số mục tối đa hiển thị (với items); phần giữa vào menu “…”." },
      { name: "overflowIndex", type: "number", defaultValue: "1", description: "Số mục đầu được giữ trước nút “…”." },
      { name: "BreadcrumbButton.current", type: "boolean", description: "Trang hiện tại: semibold, aria-current=\"page\", không bấm được." },
      { name: "BreadcrumbButton.href / icon / asChild", type: "string / ReactNode / boolean", description: "Có href → thẻ <a>, không có → <button>; asChild cho link router." },
      { name: "aria-label", type: "string", defaultValue: `"Đường dẫn điều hướng"`, description: "Nhãn của thẻ <nav>." },
    ],
  },

  /* ===== Pagination ===== */
  {
    slug: "pagination",
    name: "Pagination",
    category: "Điều hướng",
    lead: "Pagination chia nội dung dài thành nhiều trang và cho phép chuyển nhanh giữa các trang.",
    description:
      "Luôn hiện trang đầu, trang cuối và siblingCount trang quanh trang hiện tại; phần còn lại thu thành “…”. Trang hiện tại dùng nền tint brand với aria-current=\"page\". Hỗ trợ controlled (page / onPageChange) và uncontrolled (defaultPage).",
    importCode: `import { Pagination } from "@/components/ui";`,
    hero: {
      title: "Pagination",
      code: `<Pagination pageCount={10} defaultPage={4} />`,
      render: () => <Pagination pageCount={10} defaultPage={4} />,
    },
    examples: [
      {
        title: "Controlled",
        code: `const [page, setPage] = useState(1);

<div className="flex flex-col items-center gap-2">
  <Pagination page={page} pageCount={20} onPageChange={setPage} />
  <span className="text-caption1 text-foreground-3">Trang {page} / 20</span>
</div>`,
        render: () => <PaginationDemo />,
      },
      {
        title: "siblingCount & ít trang",
        description: "siblingCount={2} hiện thêm trang hai bên; khi ít trang, mọi trang đều hiển thị.",
        code: `<div className="flex flex-col items-center gap-3">
  <Pagination pageCount={50} defaultPage={25} siblingCount={2} />
  <Pagination pageCount={5} defaultPage={2} />
</div>`,
        render: () => (
          <div className="flex flex-col items-center gap-3">
            <Pagination pageCount={50} defaultPage={25} siblingCount={2} />
            <Pagination pageCount={5} defaultPage={2} />
          </div>
        ),
      },
      {
        title: "Small, chỉ icon",
        description: "size=\"small\" và showLabels={false} cho bảng dữ liệu gọn.",
        code: `<Pagination size="small" showLabels={false} pageCount={12} defaultPage={6} />`,
        render: () => <Pagination size="small" showLabels={false} pageCount={12} defaultPage={6} />,
      },
    ],
    dos: [
      "Đặt Pagination ngay dưới danh sách / bảng mà nó điều khiển.",
      "Giữ vị trí cố định để người dùng bấm liên tục không phải dời chuột.",
    ],
    donts: [
      "Không dùng cho luồng nội dung liên tục (feed) — cân nhắc tải thêm.",
      "Không hiển thị Pagination khi chỉ có một trang.",
    ],
    props: [
      { name: "page / defaultPage", type: "number", defaultValue: "— / 1", description: "Trang hiện tại, bắt đầu từ 1." },
      { name: "pageCount", type: "number", description: "Bắt buộc. Tổng số trang." },
      { name: "onPageChange", type: "(page: number) => void", description: "Gọi khi chọn trang khác." },
      { name: "siblingCount", type: "number", defaultValue: "1", description: "Số trang hiển thị mỗi bên trang hiện tại." },
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Nút 24 / 32px." },
      { name: "showLabels", type: "boolean", defaultValue: "true", description: "Hiện chữ “Trước” / “Sau”." },
      { name: "disabled", type: "boolean", description: "Vô hiệu hoá toàn bộ." },
    ],
  },

  /* ===== Nav ===== */
  {
    slug: "nav",
    name: "Nav",
    category: "Điều hướng",
    lead: "Nav là điều hướng dọc của ứng dụng, giúp người dùng chuyển giữa các khu vực chính.",
    description:
      "Gồm NavItem (icon + nhãn), NavCategory có thể thu gọn (NavCategoryItem + NavSubItemGroup + NavSubItem), NavSectionHeader và NavDivider. Mục chọn dùng nền tint brand, chữ brand-foreground-2 và thanh chỉ báo 4px ở mép đầu; category đang đóng nhưng chứa mục chọn cũng hiện chỉ báo.",
    importCode: `import {
  Nav, NavItem, NavCategory, NavCategoryItem, NavSubItemGroup, NavSubItem, NavSectionHeader, NavDivider,
} from "@/components/ui";`,
    hero: {
      title: "Nav",
      code: `<Nav defaultSelectedValue="home" aria-label="Ứng dụng" className="w-60">
  <NavItem value="home" icon={<Home20Regular />}>Trang chủ</NavItem>
  <NavItem value="calendar" icon={<CalendarLtr20Regular />}>Lịch</NavItem>
  <NavItem value="people" icon={<People20Regular />}>Mọi người</NavItem>
</Nav>`,
      render: () => (
        <Nav defaultSelectedValue="home" aria-label="Ứng dụng" className="w-60">
          <NavItem value="home" icon={<Home20Regular />}>
            Trang chủ
          </NavItem>
          <NavItem value="calendar" icon={<CalendarLtr20Regular />}>
            Lịch
          </NavItem>
          <NavItem value="people" icon={<People20Regular />}>
            Mọi người
          </NavItem>
        </Nav>
      ),
    },
    examples: [
      {
        title: "Category, section header & divider",
        description: "Controlled với selectedValue / onNavItemSelect; defaultOpenCategories mở sẵn nhóm.",
        code: `const [selected, setSelected] = useState("overview");

<Nav
  selectedValue={selected}
  onNavItemSelect={setSelected}
  defaultOpenCategories={["projects"]}
  aria-label="Quản lý"
  className="w-64"
>
  <NavItem value="overview" icon={<Board20Regular />}>Tổng quan</NavItem>
  <NavItem value="reports" icon={<ChartMultiple20Regular />}>Báo cáo</NavItem>
  <NavSectionHeader>Công việc</NavSectionHeader>
  <NavCategory value="projects">
    <NavCategoryItem icon={<Folder20Regular />}>Dự án</NavCategoryItem>
    <NavSubItemGroup>
      <NavSubItem value="active">Đang chạy</NavSubItem>
      <NavSubItem value="archived">Lưu trữ</NavSubItem>
    </NavSubItemGroup>
  </NavCategory>
  <NavCategory value="people">
    <NavCategoryItem icon={<People20Regular />}>Nhân sự</NavCategoryItem>
    <NavSubItemGroup>
      <NavSubItem value="members">Thành viên</NavSubItem>
      <NavSubItem value="roles">Vai trò</NavSubItem>
    </NavSubItemGroup>
  </NavCategory>
  <NavDivider />
  <NavItem value="settings" icon={<Settings20Regular />}>Cài đặt</NavItem>
</Nav>`,
        render: () => <NavDemo />,
      },
      {
        title: "Density small",
        description: "density=\"small\" — mục cao 32px cho không gian hẹp.",
        code: `<Nav density="small" defaultSelectedValue="inbox" aria-label="Thư" className="w-56">
  <NavItem value="inbox" icon={<Mail20Regular />}>Hộp thư đến</NavItem>
  <NavItem value="sent" icon={<Send20Regular className="rtl:-scale-x-100" />}>Đã gửi</NavItem>
  <NavItem value="drafts" icon={<Document20Regular />}>Bản nháp</NavItem>
  <NavItem value="deleted" icon={<Delete20Regular />}>Đã xoá</NavItem>
</Nav>`,
        render: () => (
          <Nav density="small" defaultSelectedValue="inbox" aria-label="Thư" className="w-56">
            <NavItem value="inbox" icon={<Mail20Regular />}>
              Hộp thư đến
            </NavItem>
            <NavItem value="sent" icon={<Send20Regular className="rtl:-scale-x-100" />}>
              Đã gửi
            </NavItem>
            <NavItem value="drafts" icon={<Document20Regular />}>
              Bản nháp
            </NavItem>
            <NavItem value="deleted" icon={<Delete20Regular />}>
              Đã xoá
            </NavItem>
          </Nav>
        ),
      },
    ],
    dos: [
      "Nhãn ngắn gọn, là danh từ chỉ khu vực (“Báo cáo”, “Cài đặt”).",
      "Dùng NavCategory để nhóm tối đa 1 cấp con.",
      "Đặt Nav trên nền shell-nav, chỉ tô brand cho mục đang chọn.",
    ],
    donts: [
      "Không phủ brand lên toàn bộ thanh điều hướng.",
      "Không lồng category quá một cấp.",
      "Không đặt hành động (Lưu, Xoá) vào Nav — Nav chỉ để điều hướng.",
    ],
    props: [
      { name: "selectedValue / defaultSelectedValue", type: "string", description: "Mục đang chọn." },
      { name: "onNavItemSelect", type: "(value: string, data: { categoryValue? }) => void", description: "Gọi khi chọn NavItem / NavSubItem." },
      { name: "openCategories / defaultOpenCategories", type: "string[]", defaultValue: "[]", description: "Các NavCategory đang mở." },
      { name: "onNavCategoryItemToggle", type: "(value: string, open: boolean) => void", description: "Gọi khi mở / đóng category." },
      { name: "multiple", type: "boolean", defaultValue: "true", description: "Cho phép mở nhiều category cùng lúc." },
      { name: "density", type: `"medium" | "small"`, defaultValue: `"medium"`, description: "Mục cao 40 / 32px." },
      { name: "NavItem.value / icon / href / asChild", type: "string / ReactNode / string / boolean", description: "Có href → thẻ <a>; asChild cho link router." },
      { name: "NavCategory.value", type: "string", description: "Khoá của nhóm (dùng trong openCategories)." },
    ],
  },

  /* ===== Menubar ===== */
  {
    slug: "menubar",
    name: "Menubar",
    category: "Điều hướng",
    lead: "Menubar là thanh menu ngang cố định, kiểu ứng dụng desktop, chứa nhóm lệnh Tệp, Sửa, Xem…",
    description:
      "Trigger là nút subtle (nền subtle-pressed khi mở). Bề mặt và mục menu dùng chung style với Menu: item cao 32px, icon, phím tắt (secondaryContent), checkbox, radio, label, divider và submenu. Mũi tên trái/phải chuyển giữa các menu khi đang mở.",
    importCode: `import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator,
  MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarLabel,
  MenubarSub, MenubarSubTrigger, MenubarSubContent,
} from "@/components/ui";`,
    hero: {
      title: "Menubar",
      code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Tệp</MenubarTrigger>
    <MenubarContent>
      <MenubarItem icon={<DocumentAdd20Regular />} secondaryContent="Ctrl+N">Tạo mới</MenubarItem>
      <MenubarItem icon={<FolderOpen20Regular />} secondaryContent="Ctrl+O">Mở</MenubarItem>
      <MenubarSeparator />
      <MenubarItem icon={<Print20Regular />} secondaryContent="Ctrl+P">In</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Sửa</MenubarTrigger>
    <MenubarContent>
      <MenubarItem icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+Z">Hoàn tác</MenubarItem>
      <MenubarItem icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+Y">Làm lại</MenubarItem>
      <MenubarSeparator />
      <MenubarItem icon={<Cut20Regular />} secondaryContent="Ctrl+X">Cắt</MenubarItem>
      <MenubarItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">Sao chép</MenubarItem>
      <MenubarItem icon={<ClipboardPaste20Regular />} secondaryContent="Ctrl+V">Dán</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Trợ giúp</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Tài liệu</MenubarItem>
      <MenubarItem>Phím tắt</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
      render: () => (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Tệp</MenubarTrigger>
            <MenubarContent>
              <MenubarItem icon={<DocumentAdd20Regular />} secondaryContent="Ctrl+N">
                Tạo mới
              </MenubarItem>
              <MenubarItem icon={<FolderOpen20Regular />} secondaryContent="Ctrl+O">
                Mở
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem icon={<Print20Regular />} secondaryContent="Ctrl+P">
                In
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Sửa</MenubarTrigger>
            <MenubarContent>
              <MenubarItem icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+Z">
                Hoàn tác
              </MenubarItem>
              <MenubarItem icon={<ArrowRedo20Regular className="rtl:-scale-x-100" />} secondaryContent="Ctrl+Y">
                Làm lại
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem icon={<Cut20Regular />} secondaryContent="Ctrl+X">
                Cắt
              </MenubarItem>
              <MenubarItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">
                Sao chép
              </MenubarItem>
              <MenubarItem icon={<ClipboardPaste20Regular />} secondaryContent="Ctrl+V">
                Dán
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Trợ giúp</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Tài liệu</MenubarItem>
              <MenubarItem>Phím tắt</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      ),
    },
    examples: [
      {
        title: "Checkbox, radio & submenu",
        description: "Trạng thái bật/tắt và lựa chọn loại trừ ngay trong menu; submenu lồng 1 cấp.",
        code: `const [ruler, setRuler] = useState(true);
const [grid, setGrid] = useState(false);
const [zoom, setZoom] = useState("100");

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Xem</MenubarTrigger>
    <MenubarContent>
      <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>Thước kẻ</MenubarCheckboxItem>
      <MenubarCheckboxItem checked={grid} onCheckedChange={setGrid} secondaryContent="Ctrl+'">Lưới</MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarLabel>Thu phóng</MenubarLabel>
      <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
        <MenubarRadioItem value="75">75%</MenubarRadioItem>
        <MenubarRadioItem value="100">100%</MenubarRadioItem>
        <MenubarRadioItem value="150">150%</MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Chia sẻ</MenubarTrigger>
    <MenubarContent>
      <MenubarSub>
        <MenubarSubTrigger icon={<Share20Regular />}>Gửi qua</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem icon={<Mail20Regular />}>Email</MenubarItem>
          <MenubarItem icon={<Link20Regular />}>Sao chép liên kết</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem disabled>Xuất bản</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
        render: () => <MenubarDemo />,
      },
    ],
    dos: [
      "Dùng cho ứng dụng soạn thảo / công cụ có nhiều lệnh phân nhóm.",
      "Hiện phím tắt bằng secondaryContent để người dùng học dần.",
      "Đặt Menubar cố định ở đầu vùng làm việc.",
    ],
    donts: [
      "Không dùng Menubar làm điều hướng website — dùng Nav hoặc Tabs.",
      "Không lồng submenu quá 1 cấp.",
    ],
    props: [
      { name: "Menubar.value / onValueChange", type: "string", description: "Menu đang mở (controlled)." },
      { name: "MenubarContent.align / sideOffset", type: `"start" | "center" | "end" / number`, defaultValue: `"start" / 6`, description: "Vị trí bề mặt so với trigger." },
      { name: "MenubarItem.icon / secondaryContent", type: "ReactNode", description: "Icon cỡ 20 và phím tắt bên phải." },
      { name: "MenubarItem.onSelect / disabled", type: "(e: Event) => void / boolean", description: "Xử lý chọn / vô hiệu hoá." },
      { name: "MenubarCheckboxItem.checked / onCheckedChange", type: "boolean", description: "Bật/tắt (controlled)." },
      { name: "MenubarRadioGroup.value / onValueChange", type: "string", description: "Lựa chọn loại trừ." },
      { name: "MenubarSub / MenubarSubTrigger / MenubarSubContent", type: "—", description: "Submenu; MenubarSubTrigger nhận icon." },
    ],
  },

  /* ===== ContextMenu ===== */
  {
    slug: "contextmenu",
    name: "ContextMenu",
    category: "Điều hướng",
    lead: "ContextMenu hiển thị các lệnh liên quan tới một vùng hoặc phần tử khi người dùng nhấp chuột phải.",
    description:
      "Mở bằng chuột phải, nhấn giữ trên màn hình cảm ứng hoặc phím Menu / Shift+F10. Dùng chung style bề mặt và mục với Menu: icon, phím tắt, checkbox, radio, label, divider, submenu.",
    importCode: `import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel,
  ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
} from "@/components/ui";`,
    hero: {
      title: "ContextMenu",
      code: `<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="flex h-36 w-72 items-center justify-center rounded-xlarge border border-dashed border-stroke-1 text-body1 text-foreground-3 select-none">
      Nhấp chuột phải vào đây
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem icon={<Cut20Regular />} secondaryContent="Ctrl+X">Cắt</ContextMenuItem>
    <ContextMenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">Sao chép</ContextMenuItem>
    <ContextMenuItem icon={<ClipboardPaste20Regular />} secondaryContent="Ctrl+V">Dán</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem icon={<Delete20Regular />}>Xoá</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
      render: () => (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex h-36 w-72 items-center justify-center rounded-xlarge border border-dashed border-stroke-1 text-body1 text-foreground-3 select-none">
              Nhấp chuột phải vào đây
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem icon={<Cut20Regular />} secondaryContent="Ctrl+X">
              Cắt
            </ContextMenuItem>
            <ContextMenuItem icon={<Copy20Regular />} secondaryContent="Ctrl+C">
              Sao chép
            </ContextMenuItem>
            <ContextMenuItem icon={<ClipboardPaste20Regular />} secondaryContent="Ctrl+V">
              Dán
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem icon={<Delete20Regular />}>Xoá</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ),
    },
    examples: [
      {
        title: "Checkbox, radio & submenu",
        code: `const [showGrid, setShowGrid] = useState(true);
const [sort, setSort] = useState("name");

<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="flex h-36 w-72 items-center justify-center rounded-xlarge border border-dashed border-stroke-1 text-body1 text-foreground-3 select-none">
      Nhấp chuột phải vào đây
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuSub>
      <ContextMenuSubTrigger icon={<Add20Regular />}>Tạo mới</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem icon={<Folder20Regular />}>Thư mục</ContextMenuItem>
        <ContextMenuItem icon={<Document20Regular />}>Tài liệu</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuItem icon={<ArrowClockwise20Regular />}>Làm mới</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>Hiện lưới</ContextMenuCheckboxItem>
    <ContextMenuSeparator />
    <ContextMenuLabel>Sắp xếp theo</ContextMenuLabel>
    <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
      <ContextMenuRadioItem value="name">Tên</ContextMenuRadioItem>
      <ContextMenuRadioItem value="date">Ngày sửa</ContextMenuRadioItem>
      <ContextMenuRadioItem value="size">Kích thước</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
  </ContextMenuContent>
</ContextMenu>`,
        render: () => <ContextMenuDemo />,
      },
    ],
    dos: [
      "Chỉ chứa lệnh liên quan trực tiếp tới phần tử được nhấp.",
      "Đảm bảo mọi lệnh trong ContextMenu cũng truy cập được bằng cách khác (toolbar, menu).",
    ],
    donts: [
      "Không giấu chức năng quan trọng chỉ trong ContextMenu.",
      "Không ghi đè menu chuột phải của trình duyệt trên vùng văn bản thông thường.",
    ],
    props: [
      { name: "ContextMenu.onOpenChange", type: "(open: boolean) => void", description: "Gọi khi mở / đóng." },
      { name: "ContextMenuTrigger.asChild", type: "boolean", description: "Gắn vào phần tử con làm vùng nhấp chuột phải." },
      { name: "ContextMenuItem.icon / secondaryContent", type: "ReactNode", description: "Icon cỡ 20 và phím tắt bên phải." },
      { name: "ContextMenuCheckboxItem.checked / onCheckedChange", type: "boolean", description: "Bật/tắt (controlled)." },
      { name: "ContextMenuRadioGroup.value / onValueChange", type: "string", description: "Lựa chọn loại trừ." },
      { name: "ContextMenuSub / ContextMenuSubTrigger / ContextMenuSubContent", type: "—", description: "Submenu; ContextMenuSubTrigger nhận icon." },
    ],
  },

  /* ===== Command ===== */
  {
    slug: "command",
    name: "Command",
    category: "Điều hướng",
    lead: "Command là bảng lệnh có ô tìm kiếm, giúp người dùng tìm và chạy lệnh hoặc điều hướng nhanh bằng bàn phím.",
    description:
      "Xây trên cmdk: lọc và sắp xếp theo độ khớp khi gõ, mũi tên lên/xuống để chọn, Enter để chạy. Gồm CommandInput, CommandList, CommandEmpty, CommandGroup (tiêu đề nhóm), CommandItem, CommandShortcut, CommandSeparator; CommandDialog đặt bảng lệnh trong Dialog, thường mở bằng Ctrl/⌘ + K.",
    importCode: `import {
  Command, CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut, CommandSeparator,
} from "@/components/ui";`,
    hero: {
      title: "Command",
      code: `<Command className="w-80 shadow-16">
  <CommandInput placeholder="Nhập lệnh hoặc tìm kiếm…" />
  <CommandList>
    <CommandEmpty>Không có kết quả.</CommandEmpty>
    <CommandGroup heading="Gợi ý">
      <CommandItem icon={<CalendarLtr20Regular />}>Lịch</CommandItem>
      <CommandItem icon={<Emoji20Regular />}>Tìm emoji</CommandItem>
      <CommandItem icon={<Calculator20Regular />}>Máy tính</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
      render: () => (
        <Command className="w-80 shadow-16">
          <CommandInput placeholder="Nhập lệnh hoặc tìm kiếm…" />
          <CommandList>
            <CommandEmpty>Không có kết quả.</CommandEmpty>
            <CommandGroup heading="Gợi ý">
              <CommandItem icon={<CalendarLtr20Regular />}>Lịch</CommandItem>
              <CommandItem icon={<Emoji20Regular />}>Tìm emoji</CommandItem>
              <CommandItem icon={<Calculator20Regular />}>Máy tính</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    },
    examples: [
      {
        title: "Nhóm, phím tắt & separator",
        description: "Gõ để lọc; mục disabled bị bỏ qua khi điều hướng.",
        code: `<Command className="w-96 shadow-16">
  <CommandInput placeholder="Tìm kiếm…" />
  <CommandList>
    <CommandEmpty>Không có kết quả.</CommandEmpty>
    <CommandGroup heading="Gợi ý">
      <CommandItem icon={<CalendarLtr20Regular />}>Lịch</CommandItem>
      <CommandItem icon={<Emoji20Regular />}>Tìm emoji</CommandItem>
      <CommandItem icon={<Calculator20Regular />} disabled>Máy tính</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Cài đặt">
      <CommandItem icon={<Person20Regular />}>
        Hồ sơ
        <CommandShortcut>Ctrl+P</CommandShortcut>
      </CommandItem>
      <CommandItem icon={<Mail20Regular />}>
        Thư
        <CommandShortcut>Ctrl+B</CommandShortcut>
      </CommandItem>
      <CommandItem icon={<Settings20Regular />}>
        Cài đặt
        <CommandShortcut>Ctrl+S</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
        render: () => (
          <Command className="w-96 shadow-16">
            <CommandInput placeholder="Tìm kiếm…" />
            <CommandList>
              <CommandEmpty>Không có kết quả.</CommandEmpty>
              <CommandGroup heading="Gợi ý">
                <CommandItem icon={<CalendarLtr20Regular />}>Lịch</CommandItem>
                <CommandItem icon={<Emoji20Regular />}>Tìm emoji</CommandItem>
                <CommandItem icon={<Calculator20Regular />} disabled>
                  Máy tính
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Cài đặt">
                <CommandItem icon={<Person20Regular />}>
                  Hồ sơ
                  <CommandShortcut>Ctrl+P</CommandShortcut>
                </CommandItem>
                <CommandItem icon={<Mail20Regular />}>
                  Thư
                  <CommandShortcut>Ctrl+B</CommandShortcut>
                </CommandItem>
                <CommandItem icon={<Settings20Regular />}>
                  Cài đặt
                  <CommandShortcut>Ctrl+S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        ),
      },
      {
        title: "CommandDialog (Ctrl/⌘ + K)",
        description: "Nhấn Ctrl + K (⌘ + K trên macOS) hoặc bấm nút để mở; Esc để đóng.",
        code: `const [open, setOpen] = useState(false);

useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, []);

<>
  <Button icon={<Search20Regular />} onClick={() => setOpen(true)}>
    Mở bảng lệnh
    <KbdGroup className="ms-1">
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  </Button>
  <CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput placeholder="Nhập lệnh hoặc tìm kiếm…" />
    <CommandList>
      <CommandEmpty>Không có kết quả.</CommandEmpty>
      <CommandGroup heading="Điều hướng">
        <CommandItem icon={<Home20Regular />} onSelect={() => setOpen(false)}>Trang chủ</CommandItem>
        <CommandItem icon={<Document20Regular />} onSelect={() => setOpen(false)}>Tài liệu</CommandItem>
        <CommandItem icon={<Settings20Regular />} onSelect={() => setOpen(false)}>Cài đặt</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Giao diện">
        <CommandItem icon={<WeatherSunny20Regular />} onSelect={() => setOpen(false)}>Chế độ sáng</CommandItem>
        <CommandItem icon={<WeatherMoon20Regular />} onSelect={() => setOpen(false)}>Chế độ tối</CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</>`,
        render: () => <CommandDialogDemo />,
      },
    ],
    dos: [
      "Nhóm lệnh theo ngữ cảnh với tiêu đề rõ ràng.",
      "Hiện phím tắt bằng CommandShortcut để người dùng ghi nhớ.",
      "Luôn có CommandEmpty để phản hồi khi không tìm thấy.",
    ],
    donts: [
      "Không dùng Command thay cho ô tìm kiếm nội dung trang (kết quả dài, phân trang).",
      "Không đặt nhiều phím tắt mở bảng lệnh khác nhau trong cùng ứng dụng.",
    ],
    props: [
      { name: "Command.label", type: "string", description: "Nhãn ẩn cho trình đọc màn hình." },
      { name: "Command.shouldFilter / filter", type: "boolean / (value, search, keywords?) => number", defaultValue: "true", description: "Tắt lọc tự động hoặc tự viết hàm chấm điểm." },
      { name: "Command.value / onValueChange", type: "string", description: "Mục đang được chọn (controlled)." },
      { name: "Command.loop", type: "boolean", defaultValue: "false", description: "Mũi tên quay vòng đầu ↔ cuối." },
      { name: "CommandInput.value / onValueChange", type: "string", description: "Chuỗi tìm kiếm (controlled)." },
      { name: "CommandGroup.heading", type: "ReactNode", description: "Tiêu đề nhóm (caption1 semibold, foreground-3)." },
      { name: "CommandItem.value / keywords / onSelect / disabled / icon", type: "string / string[] / (value) => void / boolean / ReactNode", description: "Giá trị lọc, từ khoá phụ, xử lý chọn, vô hiệu hoá, icon." },
      { name: "CommandDialog.open / onOpenChange / title", type: "boolean / (open) => void / string", defaultValue: `— / — / "Bảng lệnh"`, description: "Trạng thái dialog; title ẩn cho trình đọc màn hình." },
    ],
  },
];
