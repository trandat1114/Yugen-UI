import { useState } from "react";
import {
  Add20Regular,
  ArrowDownload20Regular,
  Calendar20Regular,
  Delete20Regular,
  Edit20Regular,
  Mail20Regular,
  MoreHorizontal20Regular,
  People20Regular,
  Person20Regular,
  Search20Regular,
  Send20Regular,
  Settings20Regular,
  Share20Regular,
  Star20Filled,
} from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardPreview,
  Checkbox,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  MessageBar,
  SimpleTooltip,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { ComponentDoc } from "../types";


/* ------------------------------------------------------------------ demos */

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<Delete20Regular />}>Xoá tệp</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>Xoá "Báo cáo Q3.docx"?</DialogTitle>
        <DialogDescription>
          Tệp sẽ được chuyển vào Thùng rác và tự động xoá vĩnh viễn sau 30 ngày.
        </DialogDescription>
        <DialogActions>
          <DialogClose asChild>
            <Button>Huỷ</Button>
          </DialogClose>
          <Button appearance="primary" onClick={() => setOpen(false)}>
            Xoá
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

function AlertDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="outline">Phiên sắp hết hạn</Button>
      </DialogTrigger>
      <DialogSurface modalType="alert">
        <DialogTitle action={null}>Phiên làm việc sắp hết hạn</DialogTitle>
        <DialogDescription>Bạn sẽ bị đăng xuất sau 60 giây. Tiếp tục làm việc?</DialogDescription>
        <DialogActions>
          <DialogClose asChild>
            <Button appearance="primary">Tiếp tục</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

function DismissibleMessageBarDemo() {
  const [visible, setVisible] = useState(true);
  if (!visible)
    return (
      <Button size="small" onClick={() => setVisible(true)}>
        Hiện lại
      </Button>
    );
  return (
    <MessageBar intent="warning" title="Sắp hết dung lượng" onDismiss={() => setVisible(false)}>
      Bạn đã dùng 95% dung lượng lưu trữ.
    </MessageBar>
  );
}

function ButtonLoadingDemo() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 2000);
  }

  return (
    <>
      <Button appearance="primary" loading={saving} onClick={save}>
        Lưu thay đổi
      </Button>
      <Button icon={<ArrowDownload20Regular />} loading={saving} onClick={save}>
        Tải xuống
      </Button>
      <Button appearance="outline" loading={saving} loadingText="Đang gửi…" onClick={save}>
        Gửi
      </Button>
    </>
  );
}

/* --------------------------------------------------------------- registry */

export const docs: ComponentDoc[] = [
  {
    slug: "button",
    category: "Hành động",
    name: "Button",
    lead: "Button kích hoạt một hành động hoặc sự kiện duy nhất.",
    description:
      "Dùng Button cho các hành động quan trọng như gửi phản hồi, xác nhận thay đổi hoặc chuyển sang bước tiếp theo. Để điều hướng sang trang khác, hãy dùng link.",
    importCode: `import { Button } from "@/components/ui";`,
    hero: {
      title: "Button",
      code: `<Button appearance="primary">Lưu thay đổi</Button>
<Button>Huỷ</Button>`,
      render: () => (
        <>
          <Button appearance="primary">Lưu thay đổi</Button>
          <Button>Huỷ</Button>
        </>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "primary cho hành động chính, secondary (mặc định), outline, subtle và transparent cho mức nhấn mạnh thấp dần.",
        code: `<Button appearance="primary">Primary</Button>
<Button>Secondary</Button>
<Button appearance="outline">Outline</Button>
<Button appearance="subtle">Subtle</Button>
<Button appearance="transparent">Transparent</Button>`,
        render: () => (
          <>
            <Button appearance="primary">Primary</Button>
            <Button>Secondary</Button>
            <Button appearance="outline">Outline</Button>
            <Button appearance="subtle">Subtle</Button>
            <Button appearance="transparent">Transparent</Button>
          </>
        ),
      },
      {
        title: "Kích thước",
        description: "small (24px), medium (32px — mặc định), large (40px).",
        code: `<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>`,
        render: () => (
          <>
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </>
        ),
      },
      {
        title: "Kèm icon",
        description: "Icon đứng trước nhãn để bổ nghĩa; icon-only bắt buộc có aria-label.",
        code: `<Button appearance="primary" icon={<Send20Regular className="rtl:-scale-x-100" />}>Gửi</Button>
<Button icon={<ArrowDownload20Regular />}>Tải xuống</Button>
<Button appearance="subtle" icon={<Edit20Regular />} aria-label="Sửa" />
<Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />`,
        render: () => (
          <>
            <Button appearance="primary" icon={<Send20Regular className="rtl:-scale-x-100" />}>
              Gửi
            </Button>
            <Button icon={<ArrowDownload20Regular />}>Tải xuống</Button>
            <Button appearance="subtle" icon={<Edit20Regular />} aria-label="Sửa" />
            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />
          </>
        ),
      },
      {
        title: "Shape",
        description: "rounded (mặc định), circular dùng cho FAB / thanh công cụ nổi, square cho toolbar sát cạnh.",
        code: `<Button shape="rounded">Rounded</Button>
<Button shape="circular">Circular</Button>
<Button shape="square">Square</Button>
<Button appearance="primary" shape="circular" icon={<Add20Regular />} aria-label="Tạo mới" />`,
        render: () => (
          <>
            <Button shape="rounded">Rounded</Button>
            <Button shape="circular">Circular</Button>
            <Button shape="square">Square</Button>
            <Button appearance="primary" shape="circular" icon={<Add20Regular />} aria-label="Tạo mới" />
          </>
        ),
      },
      {
        title: "Disabled",
        description: "Chỉ disable khi người dùng hiểu được lý do; nếu không, hãy để bật và báo lỗi khi bấm.",
        code: `<Button appearance="primary" disabled>Primary</Button>
<Button disabled>Secondary</Button>
<Button appearance="subtle" disabled>Subtle</Button>`,
        render: () => (
          <>
            <Button appearance="primary" disabled>
              Primary
            </Button>
            <Button disabled>Secondary</Button>
            <Button appearance="subtle" disabled>
              Subtle
            </Button>
          </>
        ),
      },
      {
        title: "Danger",
        description: "Phần mở rộng của bộ này (không có trong Fluent gốc) cho hành động phá huỷ không thể hoàn tác.",
        code: `<Button appearance="danger" icon={<Delete20Regular />}>Xoá vĩnh viễn</Button>`,
        render: () => (
          <Button appearance="danger" icon={<Delete20Regular />}>
            Xoá vĩnh viễn
          </Button>
        ),
      },
      {
        title: "Đang xử lý (loading)",
        description:
          "Bấm một nút: Spinner thay chỗ icon (nút không icon: Spinner ở giữa), độ rộng giữ nguyên, nút vẫn focus được nhưng bỏ qua click; loadingText đổi nhãn mà không xê dịch bố cục.",
        code: `function ButtonLoadingDemo() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 2000);
  }

  return (
    <>
      <Button appearance="primary" loading={saving} onClick={save}>
        Lưu thay đổi
      </Button>
      <Button icon={<ArrowDownload20Regular />} loading={saving} onClick={save}>
        Tải xuống
      </Button>
      <Button appearance="outline" loading={saving} loadingText="Đang gửi…" onClick={save}>
        Gửi
      </Button>
    </>
  );
}`,
        render: () => <ButtonLoadingDemo />,
      },
    ],
    dos: [
      "Mỗi vùng/màn hình chỉ có tối đa một Button primary.",
      "Nhãn là động từ ngắn gọn mô tả kết quả: “Lưu”, “Gửi lời mời”.",
      "Đặt hành động chính bên trái (hoặc bên phải trong Dialog, theo thứ tự đọc).",
    ],
    donts: [
      "Không dùng Button để điều hướng — hãy dùng link.",
      "Không tự đổi màu nền Button bằng className; dùng appearance.",
      "Không để icon-only Button thiếu aria-label hoặc Tooltip.",
    ],
    props: [
      { name: "appearance", type: `"secondary" | "primary" | "outline" | "subtle" | "transparent" | "danger"`, defaultValue: `"secondary"`, description: "Mức độ nhấn mạnh của hành động." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "shape", type: `"rounded" | "circular" | "square"`, defaultValue: `"rounded"`, description: "Bo góc." },
      { name: "icon", type: "ReactNode", description: "Icon Fluent (@fluentui/react-icons, cỡ 20)." },
      { name: "iconPosition", type: `"before" | "after"`, defaultValue: `"before"`, description: "Vị trí icon so với nhãn." },
      { name: "iconOnly", type: "boolean", defaultValue: "tự suy ra", description: "Tự bật khi có icon mà không có children." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Render vào phần tử con (vd <a>) thay vì <button>." },
      { name: "loading", type: "boolean", defaultValue: "false", description: "Đang xử lý: Spinner thay icon (hoặc ở giữa nút), giữ độ rộng, aria-busy + aria-disabled, bỏ qua click nhưng vẫn focus được." },
      { name: "loadingText", type: "ReactNode", description: "Nhãn khi đang xử lý (vd. “Đang lưu…”); nút luôn rộng bằng nhãn dài hơn nên không xê dịch." },
    ],
  },

  {
    slug: "badge",
    category: "Hiển thị dữ liệu",
    name: "Badge",
    lead: "Badge là chỉ báo trực quan truyền đạt một thông tin nhỏ: trạng thái, số lượng hoặc nhãn phân loại.",
    description: "Badge không tương tác. Chọn màu theo ý nghĩa ngữ nghĩa (danger, success, warning…) chứ không vì thẩm mỹ.",
    importCode: `import { Badge } from "@/components/ui";`,
    hero: {
      title: "Badge",
      code: `<Badge>Mới</Badge>
<Badge appearance="tint" color="success">Đang hoạt động</Badge>
<Badge color="danger">12</Badge>`,
      render: () => (
        <>
          <Badge>Mới</Badge>
          <Badge appearance="tint" color="success">
            Đang hoạt động
          </Badge>
          <Badge color="danger">12</Badge>
        </>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "filled (mặc định), tint, outline, ghost.",
        code: `<Badge appearance="filled">Filled</Badge>
<Badge appearance="tint">Tint</Badge>
<Badge appearance="outline">Outline</Badge>
<Badge appearance="ghost">Ghost</Badge>`,
        render: () => (
          <>
            <Badge appearance="filled">Filled</Badge>
            <Badge appearance="tint">Tint</Badge>
            <Badge appearance="outline">Outline</Badge>
            <Badge appearance="ghost">Ghost</Badge>
          </>
        ),
      },
      {
        title: "Màu ngữ nghĩa",
        description: "brand, danger, success, warning, informative, subtle.",
        code: `<Badge color="brand">Brand</Badge>
<Badge color="danger">Danger</Badge>
<Badge color="success">Success</Badge>
<Badge color="warning">Warning</Badge>
<Badge color="informative">Informative</Badge>
<Badge color="subtle">Subtle</Badge>`,
        render: () => (
          <>
            <Badge color="brand">Brand</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="informative">Informative</Badge>
            <Badge color="subtle">Subtle</Badge>
          </>
        ),
      },
      {
        title: "Tint theo trạng thái",
        description: "Ít tương phản hơn filled — phù hợp cho bảng/danh sách dày đặc.",
        code: `<Badge appearance="tint" color="success">Đã duyệt</Badge>
<Badge appearance="tint" color="warning">Chờ xử lý</Badge>
<Badge appearance="tint" color="danger">Bị từ chối</Badge>
<Badge appearance="tint" color="informative">Nháp</Badge>`,
        render: () => (
          <>
            <Badge appearance="tint" color="success">
              Đã duyệt
            </Badge>
            <Badge appearance="tint" color="warning">
              Chờ xử lý
            </Badge>
            <Badge appearance="tint" color="danger">
              Bị từ chối
            </Badge>
            <Badge appearance="tint" color="informative">
              Nháp
            </Badge>
          </>
        ),
      },
      {
        title: "Kích thước & shape",
        description: "small → extra-large; circular (mặc định), rounded, square.",
        code: `<Badge size="small">5</Badge>
<Badge size="medium">12</Badge>
<Badge size="large" shape="rounded">99+</Badge>
<Badge size="extra-large" shape="rounded" icon={<Star20Filled />}>Nổi bật</Badge>`,
        render: () => (
          <>
            <Badge size="small">5</Badge>
            <Badge size="medium">12</Badge>
            <Badge size="large" shape="rounded">
              99+
            </Badge>
            <Badge size="extra-large" shape="rounded" icon={<Star20Filled />}>
              Nổi bật
            </Badge>
          </>
        ),
      },
    ],
    dos: ["Giữ nội dung Badge cực ngắn (1–2 từ hoặc một số).", "Đặt Badge cạnh đối tượng mà nó mô tả."],
    donts: ["Không dùng Badge làm nút bấm.", "Không dùng màu danger/success chỉ để trang trí."],
    props: [
      { name: "appearance", type: `"filled" | "tint" | "outline" | "ghost"`, defaultValue: `"filled"`, description: "Kiểu hiển thị." },
      { name: "color", type: `"brand" | "danger" | "success" | "warning" | "informative" | "subtle"`, defaultValue: `"brand"`, description: "Màu ngữ nghĩa." },
      { name: "size", type: `"small" | "medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "Chiều cao 16 / 20 / 24 / 32px." },
      { name: "shape", type: `"circular" | "rounded" | "square"`, defaultValue: `"circular"`, description: "Bo góc." },
      { name: "icon", type: "ReactNode", description: "Icon đặt trước nội dung." },
    ],
  },

  {
    slug: "avatar",
    category: "Hiển thị dữ liệu",
    name: "Avatar",
    lead: "Avatar đại diện cho một người hoặc một thực thể bằng ảnh, chữ cái đầu hoặc icon.",
    description: "Luôn truyền name thật — dùng để sinh chữ cái đầu, màu (colorful) và nhãn cho trình đọc màn hình.",
    importCode: `import { Avatar } from "@/components/ui";`,
    hero: {
      title: "Avatar",
      code: `<Avatar name="Nguyễn Văn An" size={48} color="colorful" presence="available" />
<Avatar name="Trần Thị Bình" size={48} color="colorful" presence="busy" />
<Avatar name="Lê Hoàng" size={48} color="colorful" presence="away" />`,
      render: () => (
        <>
          <Avatar name="Nguyễn Văn An" size={48} color="colorful" presence="available" />
          <Avatar name="Trần Thị Bình" size={48} color="colorful" presence="busy" />
          <Avatar name="Lê Hoàng" size={48} color="colorful" presence="away" />
        </>
      ),
    },
    examples: [
      {
        title: "Kích thước",
        description: "20, 24, 32 (mặc định), 40, 48, 64, 96.",
        code: `<Avatar name="Phạm Minh" size={24} />
<Avatar name="Phạm Minh" size={32} />
<Avatar name="Phạm Minh" size={40} />
<Avatar name="Phạm Minh" size={48} />
<Avatar name="Phạm Minh" size={64} />`,
        render: () => (
          <>
            <Avatar name="Phạm Minh" size={24} />
            <Avatar name="Phạm Minh" size={32} />
            <Avatar name="Phạm Minh" size={40} />
            <Avatar name="Phạm Minh" size={48} />
            <Avatar name="Phạm Minh" size={64} />
          </>
        ),
      },
      {
        title: "Màu",
        description: "neutral (mặc định), brand, colorful (màu ổn định theo hash của name).",
        code: `<Avatar name="Đỗ Quang" size={40} />
<Avatar name="Đỗ Quang" size={40} color="brand" />
<Avatar name="Vũ Thu" size={40} color="colorful" />
<Avatar name="Hà My" size={40} color="colorful" />
<Avatar name="Bùi Khánh" size={40} color="colorful" />`,
        render: () => (
          <>
            <Avatar name="Đỗ Quang" size={40} />
            <Avatar name="Đỗ Quang" size={40} color="brand" />
            <Avatar name="Vũ Thu" size={40} color="colorful" />
            <Avatar name="Hà My" size={40} color="colorful" />
            <Avatar name="Bùi Khánh" size={40} color="colorful" />
          </>
        ),
      },
      {
        title: "Presence",
        description: "available, busy, away, offline.",
        code: `<Avatar name="Ngô Lan" size={40} color="colorful" presence="available" />
<Avatar name="Ngô Lan" size={40} color="colorful" presence="busy" />
<Avatar name="Ngô Lan" size={40} color="colorful" presence="away" />
<Avatar name="Ngô Lan" size={40} color="colorful" presence="offline" />`,
        render: () => (
          <>
            <Avatar name="Ngô Lan" size={40} color="colorful" presence="available" />
            <Avatar name="Ngô Lan" size={40} color="colorful" presence="busy" />
            <Avatar name="Ngô Lan" size={40} color="colorful" presence="away" />
            <Avatar name="Ngô Lan" size={40} color="colorful" presence="offline" />
          </>
        ),
      },
      {
        title: "Shape",
        description: "circular cho người; square cho nhóm, ứng dụng, bot.",
        code: `<Avatar name="Nhóm Thiết kế" size={48} shape="square" color="brand" />
<Avatar name="Bot Hỗ trợ" size={48} shape="square" color="colorful" />`,
        render: () => (
          <>
            <Avatar name="Nhóm Thiết kế" size={48} shape="square" color="brand" />
            <Avatar name="Bot Hỗ trợ" size={48} shape="square" color="colorful" />
          </>
        ),
      },
    ],
    dos: ["Dùng color=\"colorful\" khi có nhiều người cạnh nhau để dễ phân biệt.", "Dùng square cho thực thể không phải người."],
    donts: ["Không truyền name rỗng hoặc giả.", "Không tự đặt màu nền avatar bằng className."],
    props: [
      { name: "name", type: "string", description: "Bắt buộc. Sinh initials, màu và aria-label." },
      { name: "src", type: "string", description: "Ảnh đại diện; fallback về initials nếu lỗi." },
      { name: "size", type: "20 | 24 | 32 | 40 | 48 | 64 | 96", defaultValue: "32", description: "Kích thước px." },
      { name: "color", type: `"neutral" | "brand" | "colorful"`, defaultValue: `"neutral"`, description: "Bảng màu." },
      { name: "shape", type: `"circular" | "square"`, defaultValue: `"circular"`, description: "Hình dạng." },
      { name: "presence", type: `"available" | "busy" | "away" | "offline"`, description: "Chấm trạng thái." },
    ],
  },

  {
    slug: "card",
    category: "Bề mặt & overlay",
    name: "Card",
    lead: "Card là bề mặt gom nhóm thông tin và hành động liên quan đến một chủ đề duy nhất.",
    description: "Card trong Fluent 2 dùng elevation (shadow4) thay vì viền để tách khỏi nền. Ghép từ CardHeader, CardPreview, CardContent, CardFooter.",
    importCode: `import { Card, CardHeader, CardPreview, CardContent, CardFooter } from "@/components/ui";`,
    hero: {
      title: "Card",
      code: `<Card className="w-80">
  <CardHeader
    image={<Avatar name="Lê Hằng" color="colorful" />}
    header="Lê Hằng đã chia sẻ một tệp"
    description="5 phút trước"
    action={<Button appearance="transparent" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />}
  />
  <CardContent>Kế hoạch ra mắt sản phẩm quý IV — vui lòng xem và góp ý trước thứ Sáu.</CardContent>
  <CardFooter>
    <Button appearance="primary" icon={<Share20Regular />}>Mở</Button>
    <Button>Bỏ qua</Button>
  </CardFooter>
</Card>`,
      render: () => (
        <Card className="w-80">
          <CardHeader
            image={<Avatar name="Lê Hằng" color="colorful" />}
            header="Lê Hằng đã chia sẻ một tệp"
            description="5 phút trước"
            action={<Button appearance="transparent" icon={<MoreHorizontal20Regular />} aria-label="Thêm" />}
          />
          <CardContent>Kế hoạch ra mắt sản phẩm quý IV — vui lòng xem và góp ý trước thứ Sáu.</CardContent>
          <CardFooter>
            <Button appearance="primary" icon={<Share20Regular />}>
              Mở
            </Button>
            <Button>Bỏ qua</Button>
          </CardFooter>
        </Card>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "filled (mặc định), filled-alternative, outline, subtle.",
        code: `<Card className="w-36"><CardContent>Filled</CardContent></Card>
<Card appearance="filled-alternative" className="w-36"><CardContent>Filled alt</CardContent></Card>
<Card appearance="outline" className="w-36"><CardContent>Outline</CardContent></Card>
<Card appearance="subtle" className="w-36"><CardContent>Subtle</CardContent></Card>`,
        render: () => (
          <>
            <Card className="w-36">
              <CardContent>Filled</CardContent>
            </Card>
            <Card appearance="filled-alternative" className="w-36">
              <CardContent>Filled alt</CardContent>
            </Card>
            <Card appearance="outline" className="w-36">
              <CardContent>Outline</CardContent>
            </Card>
            <Card appearance="subtle" className="w-36">
              <CardContent>Subtle</CardContent>
            </Card>
          </>
        ),
      },
      {
        title: "Interactive",
        description: "Card bấm được: tăng elevation khi hover. Bọc nội dung trong <a>/<button> để có ngữ nghĩa đúng.",
        code: `<Card interactive className="w-64" onClick={() => {}}>
  <CardHeader
    image={<Avatar name="Báo cáo" shape="square" color="brand" />}
    header="Báo cáo doanh thu"
    description="Cập nhật hôm qua"
  />
</Card>`,
        render: () => (
          <Card interactive className="w-64" onClick={() => {}}>
            <CardHeader
              image={<Avatar name="Báo cáo" shape="square" color="brand" />}
              header="Báo cáo doanh thu"
              description="Cập nhật hôm qua"
            />
          </Card>
        ),
      },
      {
        title: "Với preview",
        description: "CardPreview tràn sát hai cạnh Card để hiển thị ảnh/thumbnail.",
        code: `<Card className="w-64">
  <CardPreview>
    <div className="h-28 bg-brand-background-2" />
  </CardPreview>
  <CardHeader header="Thiết kế hệ thống" description="Figma · 12 trang" />
</Card>`,
        render: () => (
          <Card className="w-64">
            <CardPreview>
              <div className="h-28 bg-brand-background-2" />
            </CardPreview>
            <CardHeader header="Thiết kế hệ thống" description="Figma · 12 trang" />
          </Card>
        ),
      },
    ],
    dos: ["Mỗi Card chỉ nói về một chủ đề.", "Dùng outline khi Card đặt trên nền đã có màu/elevation."],
    donts: ["Không lồng Card trong Card.", "Không thêm nhiều hơn 2 Button trong CardFooter."],
    props: [
      { name: "appearance", type: `"filled" | "filled-alternative" | "outline" | "subtle"`, defaultValue: `"filled"`, description: "Kiểu bề mặt." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Padding & gap 8 / 12 / 16px." },
      { name: "interactive", type: "boolean", defaultValue: "false", description: "Bật trạng thái hover/pressed." },
      { name: "CardHeader.image / header / description / action", type: "ReactNode", description: "Các slot của header." },
    ],
  },

  {
    slug: "input",
    category: "Nhập liệu",
    name: "Input",
    lead: "Input cho phép người dùng nhập và chỉnh sửa văn bản trên một dòng.",
    description: "Input đã tích hợp sẵn Field: label, dấu bắt buộc, hint và validation message. Khi focus, thanh brand chạy ra từ giữa đáy — đặc trưng của Fluent 2.",
    importCode: `import { Input } from "@/components/ui";`,
    hero: {
      title: "Input",
      code: `<Input
  label="Email công việc"
  placeholder="ten@congty.vn"
  hint="Chúng tôi sẽ gửi liên kết xác minh đến email này."
  rootClassName="w-80"
/>`,
      render: () => (
        <Input
          label="Email công việc"
          placeholder="ten@congty.vn"
          hint="Chúng tôi sẽ gửi liên kết xác minh đến email này."
          rootClassName="w-80"
        />
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "outline (mặc định), underline, filled-darker, filled-lighter.",
        code: `<Input placeholder="Outline" />
<Input appearance="underline" placeholder="Underline" />
<Input appearance="filled-darker" placeholder="Filled darker" />
<Input appearance="filled-lighter" placeholder="Filled lighter" />`,
        render: () => (
          <div className="grid w-full max-w-xs gap-3">
            <Input placeholder="Outline" />
            <Input appearance="underline" placeholder="Underline" />
            <Input appearance="filled-darker" placeholder="Filled darker" />
            <Input appearance="filled-lighter" placeholder="Filled lighter" />
          </div>
        ),
      },
      {
        title: "Validation",
        description: "validationState + validationMessage. Lỗi luôn phải nói rõ cách sửa.",
        code: `<Input
  label="Mật khẩu"
  type="password"
  required
  defaultValue="123"
  validationState="error"
  validationMessage="Mật khẩu cần ít nhất 8 ký tự."
  rootClassName="w-64"
/>
<Input
  label="Tên người dùng"
  defaultValue="an.nguyen"
  validationState="success"
  validationMessage="Tên này khả dụng."
  rootClassName="w-64"
/>`,
        render: () => (
          <>
            <Input
              label="Mật khẩu"
              type="password"
              required
              defaultValue="123"
              validationState="error"
              validationMessage="Mật khẩu cần ít nhất 8 ký tự."
              rootClassName="w-64"
            />
            <Input
              label="Tên người dùng"
              defaultValue="an.nguyen"
              validationState="success"
              validationMessage="Tên này khả dụng."
              rootClassName="w-64"
            />
          </>
        ),
      },
      {
        title: "Content before / after",
        description: "Icon hoặc đơn vị đặt trong ô nhập.",
        code: `<Input contentBefore={<Search20Regular />} placeholder="Tìm kiếm" rootClassName="w-64" />
<Input contentBefore={<Person20Regular />} contentAfter={<span className="text-caption1">@congty.vn</span>} placeholder="ten" rootClassName="w-64" />`,
        render: () => (
          <>
            <Input contentBefore={<Search20Regular />} placeholder="Tìm kiếm" rootClassName="w-64" />
            <Input
              contentBefore={<Person20Regular />}
              contentAfter={<span className="text-caption1">@congty.vn</span>}
              placeholder="ten"
              rootClassName="w-64"
            />
          </>
        ),
      },
      {
        title: "Kích thước & disabled",
        description: "small (24px), medium (32px), large (40px).",
        code: `<Input size="small" placeholder="Small" rootClassName="w-40" />
<Input size="medium" placeholder="Medium" rootClassName="w-40" />
<Input size="large" placeholder="Large" rootClassName="w-40" />
<Input disabled placeholder="Disabled" rootClassName="w-40" />`,
        render: () => (
          <>
            <Input size="small" placeholder="Small" rootClassName="w-40" />
            <Input size="medium" placeholder="Medium" rootClassName="w-40" />
            <Input size="large" placeholder="Large" rootClassName="w-40" />
            <Input disabled placeholder="Disabled" rootClassName="w-40" />
          </>
        ),
      },
    ],
    dos: ["Luôn có label hiển thị.", "Dùng hint cho định dạng mong đợi (vd: DD/MM/YYYY).", "Đánh dấu trường bắt buộc bằng required."],
    donts: ["Không dùng placeholder thay cho label.", "Không báo lỗi chung chung như “Không hợp lệ”."],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn liên kết với input qua htmlFor." },
      { name: "appearance", type: `"outline" | "underline" | "filled-darker" | "filled-lighter"`, defaultValue: `"outline"`, description: "Kiểu ô nhập." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "validationState", type: `"none" | "error" | "warning" | "success"`, defaultValue: `"none"`, description: "Trạng thái kiểm tra." },
      { name: "validationMessage", type: "ReactNode", description: "Thông điệp đi kèm validationState." },
      { name: "hint", type: "ReactNode", description: "Gợi ý bên dưới ô nhập." },
      { name: "contentBefore / contentAfter", type: "ReactNode", description: "Nội dung trong ô, trước/sau text." },
      { name: "rootClassName", type: "string", description: "Class cho khối Field bao ngoài (đặt width ở đây)." },
    ],
  },

  {
    slug: "checkbox",
    category: "Nhập liệu",
    name: "Checkbox",
    lead: "Checkbox cho phép chọn một hoặc nhiều lựa chọn độc lập trong một tập hợp.",
    description: "Hỗ trợ trạng thái indeterminate cho checkbox “chọn tất cả” khi chỉ một phần mục con được chọn.",
    importCode: `import { Checkbox } from "@/components/ui";`,
    hero: {
      title: "Checkbox",
      code: `<Checkbox label="Ghi nhớ đăng nhập" defaultChecked />`,
      render: () => <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />,
    },
    examples: [
      {
        title: "Trạng thái",
        description: "unchecked, checked, indeterminate, disabled.",
        code: `<Checkbox label="Chưa chọn" />
<Checkbox label="Đã chọn" defaultChecked />
<Checkbox label="Một phần" checked="indeterminate" />
<Checkbox label="Disabled" disabled />`,
        render: () => (
          <div className="flex flex-col">
            <Checkbox label="Chưa chọn" />
            <Checkbox label="Đã chọn" defaultChecked />
            <Checkbox label="Một phần" checked="indeterminate" />
            <Checkbox label="Disabled" disabled />
          </div>
        ),
      },
      {
        title: "Kích thước & vị trí label",
        description: "medium (16px), large (20px); label trước hoặc sau.",
        code: `<Checkbox label="Large" size="large" defaultChecked />
<Checkbox label="Label trước" labelPosition="before" />`,
        render: () => (
          <div className="flex flex-col">
            <Checkbox label="Large" size="large" defaultChecked />
            <Checkbox label="Label trước" labelPosition="before" />
          </div>
        ),
      },
    ],
    dos: ["Xếp danh sách checkbox theo chiều dọc.", "Label mô tả trạng thái khi được chọn."],
    donts: ["Không dùng Checkbox cho thay đổi có hiệu lực tức thì — dùng Switch.", "Không dùng cho lựa chọn loại trừ nhau — dùng RadioGroup."],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn bấm được." },
      { name: "checked / defaultChecked", type: `boolean | "indeterminate"`, description: "Controlled / uncontrolled." },
      { name: "onCheckedChange", type: `(checked: boolean | "indeterminate") => void`, description: "Callback khi đổi." },
      { name: "size", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Ô 16 / 20px." },
      { name: "labelPosition", type: `"after" | "before"`, defaultValue: `"after"`, description: "Vị trí label." },
    ],
  },

  {
    slug: "switch",
    category: "Nhập liệu",
    name: "Switch",
    lead: "Switch bật hoặc tắt một trạng thái, có hiệu lực ngay lập tức.",
    description: "Dùng cho cài đặt hệ thống/ứng dụng không cần bấm Lưu.",
    importCode: `import { Switch } from "@/components/ui";`,
    hero: {
      title: "Switch",
      code: `<Switch label="Nhận thông báo" defaultChecked />`,
      render: () => <Switch label="Nhận thông báo" defaultChecked />,
    },
    examples: [
      {
        title: "Trạng thái",
        description: "off, on, disabled.",
        code: `<Switch label="Tắt" />
<Switch label="Bật" defaultChecked />
<Switch label="Disabled" disabled />
<Switch label="Disabled bật" disabled defaultChecked />`,
        render: () => (
          <div className="flex flex-col">
            <Switch label="Tắt" />
            <Switch label="Bật" defaultChecked />
            <Switch label="Disabled" disabled />
            <Switch label="Disabled bật" disabled defaultChecked />
          </div>
        ),
      },
      {
        title: "Label trước",
        description: "Phù hợp cho danh sách cài đặt căn phải.",
        code: `<Switch label="Chế độ máy bay" labelPosition="before" />`,
        render: () => <Switch label="Chế độ máy bay" labelPosition="before" />,
      },
    ],
    dos: ["Label mô tả thứ được bật, không mô tả hành động (“Wi-Fi”, không phải “Bật Wi-Fi”)."],
    donts: ["Không dùng Switch trong form cần bấm Gửi — dùng Checkbox."],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn." },
      { name: "checked / defaultChecked", type: "boolean", description: "Controlled / uncontrolled." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Callback khi đổi." },
      { name: "labelPosition", type: `"after" | "before"`, defaultValue: `"after"`, description: "Vị trí label." },
    ],
  },

  {
    slug: "tabs",
    category: "Điều hướng",
    name: "Tabs",
    lead: "TabList chuyển đổi giữa các khung nội dung cùng cấp mà không rời trang.",
    description: "Tab đang chọn được đánh dấu bằng chữ đậm và thanh brand 3px ở đáy; hover hiện thanh xám.",
    importCode: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";`,
    hero: {
      title: "Tabs",
      code: `<Tabs defaultValue="mail">
  <TabsList>
    <TabsTrigger value="mail" icon={<Mail20Regular />}>Thư</TabsTrigger>
    <TabsTrigger value="calendar" icon={<Calendar20Regular />}>Lịch</TabsTrigger>
    <TabsTrigger value="people" icon={<People20Regular />}>Danh bạ</TabsTrigger>
    <TabsTrigger value="settings" icon={<Settings20Regular />} disabled>Cài đặt</TabsTrigger>
  </TabsList>
  <TabsContent value="mail">Bạn có 3 thư chưa đọc.</TabsContent>
  <TabsContent value="calendar">Không có sự kiện hôm nay.</TabsContent>
  <TabsContent value="people">128 liên hệ.</TabsContent>
</Tabs>`,
      render: () => (
        <Tabs defaultValue="mail">
          <TabsList>
            <TabsTrigger value="mail" icon={<Mail20Regular />}>
              Thư
            </TabsTrigger>
            <TabsTrigger value="calendar" icon={<Calendar20Regular />}>
              Lịch
            </TabsTrigger>
            <TabsTrigger value="people" icon={<People20Regular />}>
              Danh bạ
            </TabsTrigger>
            <TabsTrigger value="settings" icon={<Settings20Regular />} disabled>
              Cài đặt
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mail">Bạn có 3 thư chưa đọc.</TabsContent>
          <TabsContent value="calendar">Không có sự kiện hôm nay.</TabsContent>
          <TabsContent value="people">128 liên hệ.</TabsContent>
        </Tabs>
      ),
    },
    examples: [
      {
        title: "Appearance subtle",
        description: "Có nền khi hover — dùng trên thanh công cụ.",
        code: `<Tabs defaultValue="a">
  <TabsList appearance="subtle">
    <TabsTrigger value="a">Tổng quan</TabsTrigger>
    <TabsTrigger value="b">Hoạt động</TabsTrigger>
    <TabsTrigger value="c">Thành viên</TabsTrigger>
  </TabsList>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="a">
            <TabsList appearance="subtle">
              <TabsTrigger value="a">Tổng quan</TabsTrigger>
              <TabsTrigger value="b">Hoạt động</TabsTrigger>
              <TabsTrigger value="c">Thành viên</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        title: "Kích thước",
        description: "small, medium (mặc định), large.",
        code: `<Tabs defaultValue="a">
  <TabsList size="small">
    <TabsTrigger value="a">Small</TabsTrigger>
    <TabsTrigger value="b">Tab</TabsTrigger>
  </TabsList>
</Tabs>
<Tabs defaultValue="a">
  <TabsList size="large">
    <TabsTrigger value="a">Large</TabsTrigger>
    <TabsTrigger value="b">Tab</TabsTrigger>
  </TabsList>
</Tabs>`,
        render: () => (
          <div className="flex flex-col items-center gap-2">
            <Tabs defaultValue="a">
              <TabsList size="small">
                <TabsTrigger value="a">Small</TabsTrigger>
                <TabsTrigger value="b">Tab</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="a">
              <TabsList size="large">
                <TabsTrigger value="a">Large</TabsTrigger>
                <TabsTrigger value="b">Tab</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ),
      },
      {
        title: "Dọc",
        description: "orientation=\"vertical\" cho điều hướng phụ trong trang cài đặt.",
        code: `<Tabs defaultValue="a" orientation="vertical">
  <TabsList>
    <TabsTrigger value="a">Tài khoản</TabsTrigger>
    <TabsTrigger value="b">Bảo mật</TabsTrigger>
    <TabsTrigger value="c">Thanh toán</TabsTrigger>
  </TabsList>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="a" orientation="vertical">
            <TabsList>
              <TabsTrigger value="a">Tài khoản</TabsTrigger>
              <TabsTrigger value="b">Bảo mật</TabsTrigger>
              <TabsTrigger value="c">Thanh toán</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
    ],
    dos: ["Nhãn tab ngắn (1–2 từ).", "Giữ tối đa ~6 tab trên một hàng."],
    donts: ["Không dùng Tabs cho các bước tuần tự — dùng wizard/stepper.", "Không lồng Tabs trong Tabs."],
    props: [
      { name: "Tabs.defaultValue / value", type: "string", description: "Tab đang chọn." },
      { name: "Tabs.orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng." },
      { name: "TabsList.appearance", type: `"transparent" | "subtle"`, defaultValue: `"transparent"`, description: "Nền khi hover." },
      { name: "TabsList.size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Kích thước tab." },
      { name: "TabsTrigger.icon", type: "ReactNode", description: "Icon trước nhãn (tô màu brand khi active)." },
    ],
  },

  {
    slug: "tooltip",
    category: "Bề mặt & overlay",
    name: "Tooltip",
    lead: "Tooltip hiển thị thông tin bổ sung ngắn gọn khi người dùng hover hoặc focus vào một phần tử.",
    description: "Đặc biệt cần cho Button chỉ có icon. Bao ứng dụng bằng <TooltipProvider> một lần ở gốc.",
    importCode: `import { SimpleTooltip, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui";`,
    hero: {
      title: "Tooltip",
      code: `<SimpleTooltip content="Chia sẻ với người khác">
  <Button appearance="subtle" icon={<Share20Regular />} aria-label="Chia sẻ" />
</SimpleTooltip>
<SimpleTooltip content="Tải xuống bản PDF" appearance="inverted">
  <Button appearance="subtle" icon={<ArrowDownload20Regular />} aria-label="Tải xuống" />
</SimpleTooltip>`,
      render: () => (
        <>
          <SimpleTooltip content="Chia sẻ với người khác">
            <Button appearance="subtle" icon={<Share20Regular />} aria-label="Chia sẻ" />
          </SimpleTooltip>
          <SimpleTooltip content="Tải xuống bản PDF" appearance="inverted">
            <Button appearance="subtle" icon={<ArrowDownload20Regular />} aria-label="Tải xuống" />
          </SimpleTooltip>
        </>
      ),
    },
    examples: [
      {
        title: "Vị trí",
        description: "side: top (mặc định), right, bottom, left.",
        code: `<SimpleTooltip content="Trên" side="top"><Button>Top</Button></SimpleTooltip>
<SimpleTooltip content="Phải" side="right"><Button>Right</Button></SimpleTooltip>
<SimpleTooltip content="Dưới" side="bottom"><Button>Bottom</Button></SimpleTooltip>
<SimpleTooltip content="Trái" side="left"><Button>Left</Button></SimpleTooltip>`,
        render: () => (
          <>
            <SimpleTooltip content="Trên" side="top">
              <Button>Top</Button>
            </SimpleTooltip>
            <SimpleTooltip content="Phải" side="right">
              <Button>Right</Button>
            </SimpleTooltip>
            <SimpleTooltip content="Dưới" side="bottom">
              <Button>Bottom</Button>
            </SimpleTooltip>
            <SimpleTooltip content="Trái" side="left">
              <Button>Left</Button>
            </SimpleTooltip>
          </>
        ),
      },
      {
        title: "Không mũi tên",
        description: "withArrow={false} khi tooltip nằm sát phần tử nhỏ.",
        code: `<SimpleTooltip content="Gửi thư" withArrow={false}>
  <Button appearance="primary" icon={<Send20Regular className="rtl:-scale-x-100" />} aria-label="Gửi" />
</SimpleTooltip>`,
        render: () => (
          <SimpleTooltip content="Gửi thư" withArrow={false}>
            <Button appearance="primary" icon={<Send20Regular className="rtl:-scale-x-100" />} aria-label="Gửi" />
          </SimpleTooltip>
        ),
      },
    ],
    dos: ["Nội dung tooltip ngắn, không quá một câu.", "Luôn thêm tooltip cho Button chỉ có icon."],
    donts: ["Không đặt link/nút trong tooltip — dùng Popover.", "Không giấu thông tin quan trọng chỉ trong tooltip."],
    props: [
      { name: "content", type: "ReactNode", description: "(SimpleTooltip) Nội dung." },
      { name: "appearance", type: `"normal" | "inverted"`, defaultValue: `"normal"`, description: "Nền sáng hoặc đảo màu." },
      { name: "side", type: `"top" | "right" | "bottom" | "left"`, defaultValue: `"top"`, description: "Vị trí so với trigger." },
      { name: "withArrow", type: "boolean", defaultValue: "true", description: "Hiện mũi tên." },
    ],
  },

  {
    slug: "dialog",
    category: "Bề mặt & overlay",
    name: "Dialog",
    lead: "Dialog là cửa sổ modal yêu cầu người dùng xác nhận hoặc cung cấp thông tin trước khi tiếp tục.",
    description: "modalType=\"modal\" đóng được bằng Esc / click nền; modalType=\"alert\" bắt buộc người dùng chọn một hành động.",
    importCode: `import {
  Dialog, DialogTrigger, DialogSurface, DialogTitle,
  DialogDescription, DialogContent, DialogActions, DialogClose,
} from "@/components/ui";`,
    hero: {
      title: "Dialog",
      code: `const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button icon={<Delete20Regular />}>Xoá tệp</Button>
  </DialogTrigger>
  <DialogSurface>
    <DialogTitle>Xoá "Báo cáo Q3.docx"?</DialogTitle>
    <DialogDescription>
      Tệp sẽ được chuyển vào Thùng rác và tự động xoá vĩnh viễn sau 30 ngày.
    </DialogDescription>
    <DialogActions>
      <DialogClose asChild>
        <Button>Huỷ</Button>
      </DialogClose>
      <Button appearance="primary" onClick={() => setOpen(false)}>Xoá</Button>
    </DialogActions>
  </DialogSurface>
</Dialog>`,
      render: () => <DialogDemo />,
    },
    examples: [
      {
        title: "Alert dialog",
        description: "Không có nút X, không đóng bằng Esc/click nền.",
        code: `<Dialog>
  <DialogTrigger asChild>
    <Button appearance="outline">Phiên sắp hết hạn</Button>
  </DialogTrigger>
  <DialogSurface modalType="alert">
    <DialogTitle action={null}>Phiên làm việc sắp hết hạn</DialogTitle>
    <DialogDescription>Bạn sẽ bị đăng xuất sau 60 giây. Tiếp tục làm việc?</DialogDescription>
    <DialogActions>
      <DialogClose asChild>
        <Button appearance="primary">Tiếp tục</Button>
      </DialogClose>
    </DialogActions>
  </DialogSurface>
</Dialog>`,
        render: () => <AlertDialogDemo />,
      },
    ],
    dos: ["Tiêu đề nêu rõ câu hỏi/hành động.", "Nút chính dùng động từ cụ thể (“Xoá”, không phải “OK”).", "Đặt nút chính bên phải nút Huỷ."],
    donts: ["Không mở Dialog chồng Dialog.", "Không dùng Dialog cho thông báo không cần phản hồi — dùng MessageBar/Toast."],
    props: [
      { name: "Dialog.open / onOpenChange", type: "boolean / (open) => void", description: "Điều khiển trạng thái." },
      { name: "DialogSurface.modalType", type: `"modal" | "alert"`, defaultValue: `"modal"`, description: "Cách đóng dialog." },
      { name: "DialogTitle.action", type: "ReactNode | null", defaultValue: "nút X", description: "Truyền null để ẩn nút đóng." },
      { name: "DialogActions", type: "—", description: "Hàng nút căn phải ở cuối." },
    ],
  },

  {
    slug: "messagebar",
    category: "Phản hồi",
    name: "MessageBar",
    lead: "MessageBar truyền đạt thông tin quan trọng về trạng thái của toàn bộ trang hoặc một khu vực.",
    description: "MessageBar tồn tại cho đến khi người dùng đóng hoặc tình huống được giải quyết — khác với Toast tự biến mất.",
    importCode: `import { MessageBar } from "@/components/ui";`,
    hero: {
      title: "MessageBar",
      code: `<MessageBar intent="success" title="Đã lưu">Thay đổi của bạn đã được đồng bộ.</MessageBar>`,
      render: () => (
        <div className="w-full max-w-xl">
          <MessageBar intent="success" title="Đã lưu">
            Thay đổi của bạn đã được đồng bộ.
          </MessageBar>
        </div>
      ),
    },
    examples: [
      {
        title: "Intent",
        description: "info, success, warning, error.",
        code: `<MessageBar intent="info" title="Mẹo">Nhấn Ctrl+K để tìm nhanh.</MessageBar>
<MessageBar intent="success" title="Thành công">Đã gửi lời mời.</MessageBar>
<MessageBar intent="warning" title="Chú ý">Phiên bản này sắp ngừng hỗ trợ.</MessageBar>
<MessageBar intent="error" title="Lỗi">Không thể kết nối máy chủ.</MessageBar>`,
        render: () => (
          <div className="flex w-full flex-col gap-2">
            <MessageBar intent="info" title="Mẹo">
              Nhấn Ctrl+K để tìm nhanh.
            </MessageBar>
            <MessageBar intent="success" title="Thành công">
              Đã gửi lời mời.
            </MessageBar>
            <MessageBar intent="warning" title="Chú ý">
              Phiên bản này sắp ngừng hỗ trợ.
            </MessageBar>
            <MessageBar intent="error" title="Lỗi">
              Không thể kết nối máy chủ.
            </MessageBar>
          </div>
        ),
      },
      {
        title: "Có hành động & đóng",
        description: "actions cho nút xử lý; onDismiss hiện nút đóng.",
        code: `const [visible, setVisible] = useState(true);

<MessageBar intent="warning" title="Sắp hết dung lượng" onDismiss={() => setVisible(false)}>
  Bạn đã dùng 95% dung lượng lưu trữ.
</MessageBar>`,
        render: () => (
          <div className="w-full">
            <DismissibleMessageBarDemo />
          </div>
        ),
      },
      {
        title: "Multiline",
        description: "layout=\"multiline\" khi nội dung dài; actions xuống dòng dưới.",
        code: `<MessageBar
  intent="error"
  layout="multiline"
  title="Thanh toán thất bại"
  actions={<><Button size="small" appearance="primary">Thử lại</Button><Button size="small">Đổi thẻ</Button></>}
>
  Ngân hàng từ chối giao dịch. Kiểm tra số dư hoặc dùng phương thức thanh toán khác.
</MessageBar>`,
        render: () => (
          <div className="w-full">
            <MessageBar
              intent="error"
              layout="multiline"
              title="Thanh toán thất bại"
              actions={
                <>
                  <Button size="small" appearance="primary">
                    Thử lại
                  </Button>
                  <Button size="small">Đổi thẻ</Button>
                </>
              }
            >
              Ngân hàng từ chối giao dịch. Kiểm tra số dư hoặc dùng phương thức thanh toán khác.
            </MessageBar>
          </div>
        ),
      },
    ],
    dos: ["Đặt MessageBar ở đầu khu vực mà nó mô tả.", "Nêu nguyên nhân và cách khắc phục."],
    donts: ["Không hiện nhiều hơn 2–3 MessageBar cùng lúc.", "Không dùng intent error cho thông tin trung tính."],
    props: [
      { name: "intent", type: `"info" | "success" | "warning" | "error"`, defaultValue: `"info"`, description: "Mức độ nghiêm trọng." },
      { name: "title", type: "ReactNode", description: "Tiêu đề đậm." },
      { name: "actions", type: "ReactNode", description: "Nút hành động (size small)." },
      { name: "onDismiss", type: "() => void", description: "Hiện nút đóng." },
      { name: "layout", type: `"singleline" | "multiline"`, defaultValue: `"singleline"`, description: "Bố cục." },
    ],
  },
];

