import { useState } from "react";
import {
  Add16Regular,
  Add20Regular,
  Alert20Regular,
  ArrowClockwise20Regular,
  ArrowDownload24Regular,
  ArrowSort20Regular,
  Bookmark20Regular,
  CalendarMonth28Regular,
  Cart20Regular,
  Checkmark20Regular,
  CheckmarkCircle20Regular,
  Dismiss16Regular,
  Document20Regular,
  DocumentAdd24Regular,
  Folder20Regular,
  Grid20Regular,
  Heart20Regular,
  Mic24Regular,
  MoreHorizontal20Regular,
  Navigation20Regular,
  Pause20Regular,
  People24Regular,
  Play20Regular,
  Rocket24Regular,
  Share20Regular,
  Sparkle16Regular,
  TextAlignLeft20Regular,
  TextBold20Regular,
  TextItalic20Regular,
  TextUnderline20Regular,
  Video24Regular,
} from "@fluentui/react-icons";
import { Avatar, Button, Link, MenuItem, SearchBox } from "@/components/ui";
import { CompoundButton } from "@/components/ui/CompoundButton/CompoundButton";
import { MenuButton } from "@/components/ui/MenuButton/MenuButton";
import { CounterBadge } from "@/components/ui/CounterBadge/CounterBadge";
import { PresenceBadge } from "@/components/ui/PresenceBadge/PresenceBadge";
import { ColorSwatch, EmptySwatch, ImageSwatch, SwatchPicker } from "@/components/ui/SwatchPicker/SwatchPicker";
import {
  TeachingPopover,
  TeachingPopoverBody,
  TeachingPopoverCarousel,
  TeachingPopoverFooter,
  TeachingPopoverHeader,
  TeachingPopoverSurface,
  TeachingPopoverTitle,
  TeachingPopoverTrigger,
} from "@/components/ui/TeachingPopover/TeachingPopover";
import { Blur, Collapse, Fade, Rotate, Scale, Slide, Stagger } from "@/components/ui/Motion/Motion";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden/VisuallyHidden";
import { AriaLiveAnnouncer, useAnnounce } from "@/components/ui/AriaLive/AriaLive";
import { useArrowNavigationGroup, useFocusableGroup } from "@/components/ui/FocusManagement/FocusManagement";
import type { ComponentDoc, PropDoc } from "../types";
import { fabric, illustration, marble, wood } from "../sample-assets";

/* ================================================================== Dữ liệu mẫu */

// wood, marble, fabric, illustration: URL ảnh bất kỳ (ở đây là SVG sinh sẵn — xem ../sample-assets).

const colors = [
  { value: "#C2347A", label: "Hồng anh đào" },
  { value: "#A855C9", label: "Tím phong lan" },
  { value: "#6A5AE0", label: "Chàm" },
  { value: "#0F6CBD", label: "Xanh dương" },
  { value: "#23A99B", label: "Ngọc lam" },
  { value: "#EAA300", label: "Vàng cúc" },
  { value: "#D4704A", label: "Cam đào" },
];

const palette = [
  { value: "#FDEDF3", label: "Hồng 160" },
  { value: "#FFA7C9", label: "Hồng 130" },
  { value: "#E24A92", label: "Hồng 90" },
  { value: "#C2347A", label: "Hồng 80" },
  { value: "#61213F", label: "Hồng 40" },
  { value: "#EBF3FC", label: "Xanh 160" },
  { value: "#96C6FA", label: "Xanh 130" },
  { value: "#2886DE", label: "Xanh 90" },
  { value: "#0F6CBD", label: "Xanh 80" },
  { value: "#0E4775", label: "Xanh 40" },
];

const tasks = ["Thiết kế token", "Dựng component", "Viết tài liệu", "Kiểm thử RTL", "Phát hành"];

const fruits = ["Táo", "Chuối", "Cam", "Xoài", "Dứa", "Nho", "Ổi", "Mận", "Mít", "Lê"];

/** Props dùng chung của các presence motion component. */
const PRESENCE_PROPS: PropDoc[] = [
  { name: "visible", type: "boolean", description: "true: chạy chuyển động vào; false: chạy chuyển động ra." },
  { name: "appear", type: "boolean", defaultValue: "false", description: "Chạy chuyển động vào ngay lần render đầu (khi visible = true)." },
  { name: "unmountOnExit", type: "boolean", defaultValue: "false", description: "Gỡ phần tử khỏi DOM khi thoát xong; nếu false phần tử được ẩn (visibility: hidden)." },
  {
    name: "duration",
    type: `"faster" | "fast" | "normal" | "gentle" | "slow"`,
    defaultValue: `"normal"`,
    description: "Thời lượng pha vào — map tới token --durationFaster … --durationSlow; easing --curveDecelerateMid.",
  },
  { name: "exitDuration", type: "như duration", defaultValue: "= duration", description: "Thời lượng pha ra; easing --curveAccelerateMid." },
  { name: "onMotionFinish", type: `(direction: "enter" | "exit") => void`, description: "Gọi khi một pha chuyển động kết thúc." },
  { name: "children", type: "ReactElement", description: "Một phần tử duy nhất — nhận class chuyển động qua Slot." },
];

/* ================================================================== Demo có state */

function ControlledMenuButtonDemo() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("Lưới");
  return (
    <div className="flex items-center gap-3">
      <MenuButton
        open={open}
        onOpenChange={setOpen}
        icon={<Grid20Regular />}
        menu={
          <>
            <MenuItem onSelect={() => setView("Lưới")}>Lưới</MenuItem>
            <MenuItem onSelect={() => setView("Danh sách")}>Danh sách</MenuItem>
          </>
        }
      >
        Chế độ xem: {view}
      </MenuButton>
      <span className="text-caption1 text-foreground-3">Menu {open ? "đang mở" : "đã đóng"}</span>
    </div>
  );
}

function NotificationBadgeDemo() {
  const [count, setCount] = useState(3);
  return (
    <div className="flex items-center gap-4">
      <span className="relative inline-flex">
        <Button appearance="subtle" icon={<Alert20Regular />} aria-label="Thông báo" />
        <CounterBadge count={count} size="small" color="danger" className="absolute -inset-e-1 -top-1" />
      </span>
      <Button onClick={() => setCount((c) => c + 1)}>Thêm</Button>
      <Button appearance="subtle" onClick={() => setCount(0)}>
        Đánh dấu đã đọc
      </Button>
    </div>
  );
}

function SwatchPickerDemo() {
  const [color, setColor] = useState("#C2347A");
  const current = colors.find((c) => c.value === color);
  return (
    <div className="flex flex-col items-start gap-3">
      <SwatchPicker aria-label="Màu nhấn" selectedValue={color} onSelectionChange={setColor}>
        {colors.map((c) => (
          <ColorSwatch key={c.value} value={c.value} color={c.value} aria-label={c.label} />
        ))}
      </SwatchPicker>
      <span className="flex items-center gap-2 text-body1 text-foreground-2">
        <span className="size-4 rounded-circular" style={{ backgroundColor: color }} />
        Đã chọn: {current?.label}
      </span>
    </div>
  );
}

function FadeDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Fade visible={visible}>
        <div className="size-24 rounded-xlarge bg-brand-background shadow-8" />
      </Fade>
    </div>
  );
}

function FadeDurationDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-3">
        <Fade visible={visible} duration="faster">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">faster</div>
        </Fade>
        <Fade visible={visible} duration="normal">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">normal</div>
        </Fade>
        <Fade visible={visible} duration="slow">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">slow</div>
        </Fade>
      </div>
    </div>
  );
}

function FadeUnmountDemo() {
  const [visible, setVisible] = useState(false);
  const [log, setLog] = useState("Chưa chạy");
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Fade
        visible={visible}
        unmountOnExit
        onMotionFinish={(direction) => setLog(direction === "enter" ? "Đã vào xong" : "Đã ra xong — phần tử đã gỡ khỏi DOM")}
      >
        <div className="rounded-medium bg-background-1 px-4 py-3 text-body1 shadow-16">Bản nháp đã được lưu</div>
      </Fade>
      <span className="text-caption1 text-foreground-3">{log}</span>
    </div>
  );
}

function ScaleDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Scale visible={visible}>
        <div className="flex w-56 flex-col gap-1 rounded-xlarge bg-background-1 p-4 shadow-16">
          <span className="text-subtitle2 font-semibold">Hộp thoại nhỏ</span>
          <span className="text-body1 text-foreground-2">Scale phóng từ 90% kèm mờ dần.</span>
        </div>
      </Scale>
    </div>
  );
}

function ScaleOptionsDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-3">
        <Scale visible={visible} duration="gentle" exitDuration="fast">
          <div className="flex size-24 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
            gentle / fast
          </div>
        </Scale>
        <Scale visible={visible} animateOpacity={false}>
          <div className="flex size-24 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
            không opacity
          </div>
        </Scale>
      </div>
    </div>
  );
}

function ScaleAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <Scale key={run} visible appear duration="gentle">
        <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle1 font-semibold shadow-8">
          桜
        </div>
      </Scale>
    </div>
  );
}

function SlideDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="grid grid-cols-4 gap-3">
        {(["start", "end", "top", "bottom"] as const).map((from) => (
          <Slide key={from} visible={visible} from={from}>
            <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-body1 font-semibold shadow-8">
              {from}
            </div>
          </Slide>
        ))}
      </div>
    </div>
  );
}

function SlideRtlDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div dir="rtl" className="flex gap-3">
        <Slide visible={visible} from="start">
          <div className="flex h-16 w-32 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">
            start → từ phải
          </div>
        </Slide>
        <Slide visible={visible} from="end">
          <div className="flex h-16 w-32 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">
            end → từ trái
          </div>
        </Slide>
      </div>
    </div>
  );
}

function SlideNoticeDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex h-40 w-80 flex-col items-center justify-between">
      <Button appearance="primary" onClick={() => setVisible(true)}>
        Lưu thay đổi
      </Button>
      <Slide visible={visible} from="bottom" unmountOnExit>
        <div className="flex w-full items-center gap-2 rounded-medium bg-background-1 p-3 text-body1 shadow-16">
          <CheckmarkCircle20Regular className="shrink-0 text-success-foreground-1" />
          <span className="flex-1">Đã lưu thay đổi.</span>
          <Button
            appearance="transparent"
            size="small"
            icon={<Dismiss16Regular />}
            aria-label="Đóng"
            onClick={() => setVisible(false)}
          />
        </div>
      </Slide>
    </div>
  );
}

function CollapseDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-80 flex-col items-start gap-2">
      <Button aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Thu gọn" : "Xem chi tiết"}
      </Button>
      <Collapse visible={open}>
        <div className="rounded-medium bg-background-1 p-3 text-body1 text-foreground-2 shadow-4">
          Collapse dùng kỹ thuật grid-template-rows 0fr → 1fr nên không cần đo chiều cao nội dung — văn bản dài, ảnh
          hay danh sách đều giãn mượt.
        </div>
      </Collapse>
    </div>
  );
}

function CollapseHorizontalDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-40 items-start gap-2">
      <Button
        icon={<Navigation20Regular />}
        aria-label={open ? "Thu gọn điều hướng" : "Mở điều hướng"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
      <Collapse visible={open} orientation="horizontal" className="h-full">
        <nav className="flex h-full w-48 flex-col gap-1 rounded-medium bg-background-1 p-2 text-body1 shadow-4">
          <span className="px-2 py-1">Trang chủ</span>
          <span className="px-2 py-1">Tài liệu</span>
          <span className="px-2 py-1">Cài đặt</span>
        </nav>
      </Collapse>
    </div>
  );
}

function CollapseSlowDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex w-80 flex-col items-start gap-2">
      <Button aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Thu gọn" : "Mở rộng"}
      </Button>
      <Collapse visible={open} animateOpacity={false} duration="slow" exitDuration="fast">
        <ul className="flex flex-col gap-1 rounded-medium bg-background-1 p-3 text-body1 shadow-4">
          <li>Mở: slow (300ms), giảm tốc</li>
          <li>Đóng: fast (150ms), tăng tốc</li>
          <li>Không đổi opacity</li>
        </ul>
      </Collapse>
    </div>
  );
}

function BlurRotateDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-4">
        <Blur visible={visible}>
          <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle2 font-semibold shadow-8">
            Blur
          </div>
        </Blur>
        <Rotate visible={visible}>
          <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle2 font-semibold shadow-8">
            Rotate
          </div>
        </Rotate>
      </div>
    </div>
  );
}

function RotateIconDemo() {
  const [playing, setPlaying] = useState(false);
  return (
    <Button
      appearance="primary"
      iconOnly
      aria-label={playing ? "Tạm dừng" : "Phát"}
      onClick={() => setPlaying((p) => !p)}
      icon={
        <span className="grid *:col-start-1 *:row-start-1">
          <Rotate visible={!playing} duration="fast">
            <Play20Regular />
          </Rotate>
          <Rotate visible={playing} duration="fast">
            <Pause20Regular />
          </Rotate>
        </span>
      }
    />
  );
}

function BlurAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <Blur key={run} visible appear duration="slow">
        <p className="max-w-xs text-center text-subtitle1 font-semibold">幽玄 — vẻ đẹp sâu lắng, khó nắm bắt.</p>
      </Blur>
    </div>
  );
}

function StaggerDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex w-64 flex-col gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn danh sách" : "Hiện danh sách"}</Button>
      <div className="flex flex-col gap-1">
        <Stagger visible={visible}>
          {tasks.map((task) => (
            <div key={task} className="rounded-medium bg-background-1 px-3 py-2 text-body1 shadow-2">
              {task}
            </div>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

function StaggerSlideDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-2">
        <Stagger visible={visible} itemDelay="fast">
          {["桜", "幽", "玄", "和", "風"].map((ch) => (
            <Slide key={ch} visible from="bottom">
              <div className="flex size-12 items-center justify-center rounded-large bg-brand-background-2 text-title3 text-brand-foreground-2">
                {ch}
              </div>
            </Slide>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

function StaggerAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <div key={run} className="grid grid-cols-4 gap-2">
        <Stagger visible appear itemDelay="faster">
          {Array.from({ length: 8 }, (_, i) => (
            <Scale key={i} visible>
              <div className="size-12 rounded-medium bg-background-1 shadow-4" />
            </Scale>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

function AnnounceDemo() {
  const { announce } = useAnnounce();
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <Button
          appearance="primary"
          icon={<Cart20Regular />}
          onClick={() => {
            const next = count + 1;
            setCount(next);
            announce("Đã thêm vào giỏ. Giỏ hàng có " + next + " sản phẩm.", { batchId: "cart" });
          }}
        >
          Thêm vào giỏ ({count})
        </Button>
        <Button onClick={() => announce("Không thể kết nối máy chủ.", { politeness: "assertive" })}>Báo lỗi</Button>
      </div>
      <span className="text-caption1 text-foreground-3">Bật trình đọc màn hình (Narrator: Ctrl + Win + Enter) để nghe.</span>
    </div>
  );
}

function SaveStatus() {
  const { announce } = useAnnounce();
  const [saved, setSaved] = useState(false);
  return (
    <Button
      icon={<Checkmark20Regular />}
      onClick={() => {
        setSaved(true);
        announce("Đã lưu bản nháp lúc " + new Date().toLocaleTimeString("vi-VN"));
      }}
    >
      {saved ? "Đã lưu" : "Lưu bản nháp"}
    </Button>
  );
}

function AnnouncerProviderDemo() {
  return (
    <AriaLiveAnnouncer>
      <SaveStatus />
    </AriaLiveAnnouncer>
  );
}

function SearchAnnounceDemo() {
  const { announce } = useAnnounce();
  const [query, setQuery] = useState("");
  const results = fruits.filter((f) => f.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="flex w-72 flex-col gap-2">
      <SearchBox
        aria-label="Tìm trái cây"
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          const count = fruits.filter((f) => f.toLowerCase().includes(value.trim().toLowerCase())).length;
          announce(count + " kết quả", { batchId: "search" });
        }}
      />
      <span className="text-caption1 text-foreground-3">
        {results.length} kết quả: {results.join(", ")}
      </span>
    </div>
  );
}

function ArrowNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "horizontal", circular: true });
  return (
    <div {...nav} role="toolbar" aria-label="Định dạng" className="flex gap-1 rounded-medium bg-background-1 p-1 shadow-4">
      <Button appearance="subtle" icon={<TextBold20Regular />} aria-label="Đậm" />
      <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label="Nghiêng" />
      <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
      <Button appearance="subtle" icon={<TextAlignLeft20Regular />} aria-label="Căn trái" />
    </div>
  );
}

function GridNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "grid", memorizeCurrent: true });
  return (
    <div {...nav} role="group" aria-label="Ứng dụng" className="grid grid-cols-3 gap-2">
      {["Thư", "Lịch", "Danh bạ", "Tệp", "Ghi chú", "Việc cần làm", "Ảnh", "Bản đồ", "Cài đặt"].map((app) => (
        <Button key={app} className="w-28">
          {app}
        </Button>
      ))}
    </div>
  );
}

function VerticalNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "vertical", circular: true });
  return (
    <div {...nav} role="group" aria-label="Thư mục" className="flex w-56 flex-col gap-0.5 rounded-medium bg-background-1 p-1 shadow-4">
      {["Hộp thư đến", "Đã gửi", "Bản nháp", "Lưu trữ"].map((folder) => (
        <Button key={folder} appearance="subtle" className="justify-start">
          {folder}
        </Button>
      ))}
    </div>
  );
}

function FocusableCard({ title }: { title: string }) {
  const group = useFocusableGroup({ tabBehavior: "limited-trap-focus" });
  return (
    <div {...group} role="listitem" aria-label={title} className="flex w-56 flex-col gap-2 rounded-medium bg-background-1 p-3 shadow-4">
      <span className="text-subtitle2 font-semibold">{title}</span>
      <div className="flex gap-1">
        <Button size="small" icon={<Heart20Regular />}>
          Thích
        </Button>
        <Button size="small" icon={<Share20Regular />}>
          Chia sẻ
        </Button>
      </div>
    </div>
  );
}

function CardGroupDemo() {
  const nav = useArrowNavigationGroup({ axis: "horizontal" });
  return (
    <div {...nav} role="list" aria-label="Bài viết" className="flex gap-3">
      {["Ra mắt Yugen UI", "Bảng màu Sakura"].map((title) => (
        <FocusableCard key={title} title={title} />
      ))}
    </div>
  );
}

/* ================================================================== Registry */

const EXTRAS: ComponentDoc[] = [
  /* ------------------------------------------------------------ CompoundButton */
  {
    slug: "compoundbutton",
    name: "CompoundButton",
    category: "Hành động",
    lead: "CompoundButton là nút lớn có icon và hai dòng chữ: nhãn chính và một dòng mô tả giải thích hành động.",
    description:
      "Dùng chung appearance/size/shape với Button nhưng cao tự do, icon 32px (small) hoặc 40px (medium, large). Dòng phụ dùng caption, màu foreground-2 (trên nền primary là foreground-on-brand). Hỗ trợ asChild, iconPosition và icon-only.",
    importCode: `import { CompoundButton } from "@/components/ui";`,
    hero: {
      title: "CompoundButton",
      code: `<CompoundButton appearance="primary" icon={<CalendarMonth28Regular />} secondaryContent="Gửi lời mời cho cả nhóm">
  Tạo cuộc họp
</CompoundButton>`,
      render: () => (
        <CompoundButton appearance="primary" icon={<CalendarMonth28Regular />} secondaryContent="Gửi lời mời cho cả nhóm">
          Tạo cuộc họp
        </CompoundButton>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "secondary (mặc định), primary, outline, subtle, transparent.",
        code: `<CompoundButton icon={<Video24Regular />} secondaryContent="Mặc định">Secondary</CompoundButton>
<CompoundButton appearance="primary" icon={<Video24Regular />} secondaryContent="Hành động chính">Primary</CompoundButton>
<CompoundButton appearance="outline" icon={<Video24Regular />} secondaryContent="Viền, nền trong suốt">Outline</CompoundButton>
<CompoundButton appearance="subtle" icon={<Video24Regular />} secondaryContent="Nền khi hover">Subtle</CompoundButton>
<CompoundButton appearance="transparent" icon={<Video24Regular />} secondaryContent="Chỉ đổi màu chữ">Transparent</CompoundButton>`,
        render: () => (
          <>
            <CompoundButton icon={<Video24Regular />} secondaryContent="Mặc định">
              Secondary
            </CompoundButton>
            <CompoundButton appearance="primary" icon={<Video24Regular />} secondaryContent="Hành động chính">
              Primary
            </CompoundButton>
            <CompoundButton appearance="outline" icon={<Video24Regular />} secondaryContent="Viền, nền trong suốt">
              Outline
            </CompoundButton>
            <CompoundButton appearance="subtle" icon={<Video24Regular />} secondaryContent="Nền khi hover">
              Subtle
            </CompoundButton>
            <CompoundButton appearance="transparent" icon={<Video24Regular />} secondaryContent="Chỉ đổi màu chữ">
              Transparent
            </CompoundButton>
          </>
        ),
      },
      {
        title: "Kích thước",
        description: "small (icon 32px), medium và large (icon 40px).",
        code: `<CompoundButton size="small" icon={<Mic24Regular />} secondaryContent="Icon 32px">Small</CompoundButton>
<CompoundButton size="medium" icon={<Mic24Regular />} secondaryContent="Icon 40px">Medium</CompoundButton>
<CompoundButton size="large" icon={<Mic24Regular />} secondaryContent="Icon 40px, chữ lớn">Large</CompoundButton>`,
        render: () => (
          <>
            <CompoundButton size="small" icon={<Mic24Regular />} secondaryContent="Icon 32px">
              Small
            </CompoundButton>
            <CompoundButton size="medium" icon={<Mic24Regular />} secondaryContent="Icon 40px">
              Medium
            </CompoundButton>
            <CompoundButton size="large" icon={<Mic24Regular />} secondaryContent="Icon 40px, chữ lớn">
              Large
            </CompoundButton>
          </>
        ),
      },
      {
        title: "Vị trí icon, chỉ icon & disabled",
        description: "iconPosition=\"after\"; bỏ children để thành nút chỉ icon (bắt buộc aria-label).",
        code: `<CompoundButton icon={<ArrowDownload24Regular />} iconPosition="after" secondaryContent="PDF · 2,4 MB">
  Tải báo cáo
</CompoundButton>
<CompoundButton icon={<DocumentAdd24Regular />} aria-label="Tài liệu mới" />
<CompoundButton disabled icon={<People24Regular />} secondaryContent="Cần quyền quản trị">
  Mời thành viên
</CompoundButton>`,
        render: () => (
          <>
            <CompoundButton icon={<ArrowDownload24Regular />} iconPosition="after" secondaryContent="PDF · 2,4 MB">
              Tải báo cáo
            </CompoundButton>
            <CompoundButton icon={<DocumentAdd24Regular />} aria-label="Tài liệu mới" />
            <CompoundButton disabled icon={<People24Regular />} secondaryContent="Cần quyền quản trị">
              Mời thành viên
            </CompoundButton>
          </>
        ),
      },
      {
        title: "Liên kết (asChild)",
        description: "Giữ giao diện CompoundButton nhưng render thẻ <a>.",
        code: `<CompoundButton asChild appearance="outline" icon={<Rocket24Regular />} secondaryContent="Mở trang tài liệu Button">
  <a href="#/components/button">Xem Button</a>
</CompoundButton>`,
        render: () => (
          <CompoundButton asChild appearance="outline" icon={<Rocket24Regular />} secondaryContent="Mở trang tài liệu Button">
            <a href="#/components/button">Xem Button</a>
          </CompoundButton>
        ),
      },
    ],
    dos: [
      "Dùng khi dòng mô tả giúp người dùng hiểu hậu quả của hành động.",
      "Giữ dòng phụ ngắn — một dòng, không chấm câu.",
      "Dùng icon 24/28 (tự phóng lên 32/40) cho cân với chiều cao nút.",
    ],
    donts: [
      "Không dùng trong thanh công cụ hay hàng nút dày đặc — dùng Button.",
      "Không đặt nhiều CompoundButton primary cạnh nhau.",
      "Không nhồi đoạn văn dài vào secondaryContent.",
    ],
    props: [
      { name: "secondaryContent", type: "ReactNode", description: "Dòng mô tả thứ hai (caption, foreground-2)." },
      { name: "icon", type: "ReactNode", description: "Icon lớn: 32px (small) / 40px (medium, large)." },
      { name: "iconPosition", type: `"before" | "after"`, defaultValue: `"before"`, description: "Vị trí icon." },
      {
        name: "appearance",
        type: `"secondary" | "primary" | "outline" | "subtle" | "transparent"`,
        defaultValue: `"secondary"`,
        description: "Giống Button.",
      },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Padding, cỡ chữ, cỡ icon." },
      { name: "shape", type: `"rounded" | "circular" | "square"`, defaultValue: `"rounded"`, description: "Bo góc." },
      { name: "iconOnly", type: "boolean", description: "Tự bật khi có icon mà không có children/secondaryContent." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Gộp vào phần tử con (vd. <a>)." },
    ],
  },

  /* ------------------------------------------------------------ MenuButton */
  {
    slug: "menubutton",
    name: "MenuButton",
    category: "Hành động",
    lead: "MenuButton là nút có chevron ở cuối, bấm vào để mở một Menu các lựa chọn.",
    description:
      "Nhận mọi prop của Button cộng thêm `menu` (nội dung MenuPopover). Chevron xoay 180° khi menu mở (data-[state=open]); nút giữ sắc pressed trong lúc mở. Khác SplitButton: toàn bộ nút chỉ mở menu, không có hành động mặc định.",
    importCode: `import { MenuButton, MenuItem } from "@/components/ui";`,
    hero: {
      title: "MenuButton",
      code: `<MenuButton
  icon={<ArrowSort20Regular />}
  menu={
    <>
      <MenuItem>Mới nhất</MenuItem>
      <MenuItem>Cũ nhất</MenuItem>
      <MenuItem>Theo tên</MenuItem>
    </>
  }
>
  Sắp xếp
</MenuButton>`,
      render: () => (
        <MenuButton
          icon={<ArrowSort20Regular />}
          menu={
            <>
              <MenuItem>Mới nhất</MenuItem>
              <MenuItem>Cũ nhất</MenuItem>
              <MenuItem>Theo tên</MenuItem>
            </>
          }
        >
          Sắp xếp
        </MenuButton>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "primary, secondary (mặc định), outline, subtle, transparent.",
        code: `<MenuButton appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Primary</MenuButton>
<MenuButton menu={<MenuItem>Tuỳ chọn</MenuItem>}>Secondary</MenuButton>
<MenuButton appearance="outline" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Outline</MenuButton>
<MenuButton appearance="subtle" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Subtle</MenuButton>
<MenuButton appearance="transparent" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Transparent</MenuButton>`,
        render: () => (
          <>
            <MenuButton appearance="primary" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Primary
            </MenuButton>
            <MenuButton menu={<MenuItem>Tuỳ chọn</MenuItem>}>Secondary</MenuButton>
            <MenuButton appearance="outline" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Outline
            </MenuButton>
            <MenuButton appearance="subtle" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Subtle
            </MenuButton>
            <MenuButton appearance="transparent" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Transparent
            </MenuButton>
          </>
        ),
      },
      {
        title: "Kích thước",
        description: "small, medium, large.",
        code: `<MenuButton size="small" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Small</MenuButton>
<MenuButton size="medium" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Medium</MenuButton>
<MenuButton size="large" menu={<MenuItem>Tuỳ chọn</MenuItem>}>Large</MenuButton>`,
        render: () => (
          <>
            <MenuButton size="small" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Small
            </MenuButton>
            <MenuButton size="medium" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Medium
            </MenuButton>
            <MenuButton size="large" menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Large
            </MenuButton>
          </>
        ),
      },
      {
        title: "Chỉ icon, menuIcon & disabled",
        description: "Không có nhãn → nút gọn gồm icon + chevron (cần aria-label). menuIcon thay chevron mặc định.",
        code: `<MenuButton
  aria-label="Thêm mới"
  icon={<Add20Regular />}
  menu={
    <>
      <MenuItem icon={<Document20Regular />}>Tài liệu</MenuItem>
      <MenuItem icon={<Folder20Regular />}>Thư mục</MenuItem>
    </>
  }
/>
<MenuButton appearance="subtle" menuIcon={<MoreHorizontal20Regular />} menu={<MenuItem>Đổi tên</MenuItem>}>
  Thao tác
</MenuButton>
<MenuButton disabled menu={<MenuItem>Tuỳ chọn</MenuItem>}>Không khả dụng</MenuButton>`,
        render: () => (
          <>
            <MenuButton
              aria-label="Thêm mới"
              icon={<Add20Regular />}
              menu={
                <>
                  <MenuItem icon={<Document20Regular />}>Tài liệu</MenuItem>
                  <MenuItem icon={<Folder20Regular />}>Thư mục</MenuItem>
                </>
              }
            />
            <MenuButton appearance="subtle" menuIcon={<MoreHorizontal20Regular />} menu={<MenuItem>Đổi tên</MenuItem>}>
              Thao tác
            </MenuButton>
            <MenuButton disabled menu={<MenuItem>Tuỳ chọn</MenuItem>}>
              Không khả dụng
            </MenuButton>
          </>
        ),
      },
      {
        title: "Điều khiển trạng thái mở",
        description: "open / onOpenChange để đồng bộ với state bên ngoài.",
        code: `function ControlledMenuButtonDemo() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("Lưới");
  return (
    <div className="flex items-center gap-3">
      <MenuButton
        open={open}
        onOpenChange={setOpen}
        icon={<Grid20Regular />}
        menu={
          <>
            <MenuItem onSelect={() => setView("Lưới")}>Lưới</MenuItem>
            <MenuItem onSelect={() => setView("Danh sách")}>Danh sách</MenuItem>
          </>
        }
      >
        Chế độ xem: {view}
      </MenuButton>
      <span className="text-caption1 text-foreground-3">Menu {open ? "đang mở" : "đã đóng"}</span>
    </div>
  );
}`,
        render: () => <ControlledMenuButtonDemo />,
      },
    ],
    dos: [
      "Nhãn mô tả nhóm lựa chọn (Sắp xếp, Xuất, Chế độ xem…).",
      "Dùng khi các lựa chọn ngang hàng, không có cái nào là mặc định.",
      "Nút chỉ icon luôn có aria-label.",
    ],
    donts: [
      "Không dùng khi có một hành động mặc định rõ ràng — dùng SplitButton.",
      "Không đặt form phức tạp trong menu — dùng Popover.",
    ],
    props: [
      { name: "menu", type: "ReactNode", description: "Nội dung MenuPopover: MenuItem, MenuItemRadio, MenuDivider…" },
      { name: "menuIcon", type: "ReactNode", defaultValue: "<ChevronDown20Regular />", description: "Icon ở cuối, xoay 180° khi mở." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / (open: boolean) => void", description: "Điều khiển trạng thái menu." },
      { name: "align", type: `"start" | "center" | "end"`, defaultValue: `"start"`, description: "Căn menu theo nút." },
      { name: "appearance / size / shape / icon / disabled…", type: "ButtonProps", description: "Truyền cho Button bên trong." },
    ],
  },

  /* ------------------------------------------------------------ CounterBadge */
  {
    slug: "counterbadge",
    name: "CounterBadge",
    category: "Hiển thị dữ liệu",
    lead: "CounterBadge hiển thị số lượng (thông báo, tin chưa đọc) hoặc một chấm báo có mục mới.",
    description:
      "Ẩn khi count = 0 (trừ khi showZero); vượt overflowCount thì hiện \"99+\". Chế độ dot luôn hiện chấm tròn. Số hiển thị được ẩn với trình đọc màn hình và thay bằng nhãn thân thiện như \"5 thông báo\" (đổi bằng prop label).",
    importCode: `import { CounterBadge } from "@/components/ui";`,
    hero: {
      title: "CounterBadge",
      code: `<CounterBadge count={5} />
<CounterBadge count={120} color="danger" />
<CounterBadge count={0} showZero color="informative" />
<CounterBadge dot />`,
      render: () => (
        <>
          <CounterBadge count={5} />
          <CounterBadge count={120} color="danger" />
          <CounterBadge count={0} showZero color="informative" />
          <CounterBadge dot />
        </>
      ),
    },
    examples: [
      {
        title: "Appearance & màu",
        description: "filled (mặc định) / ghost × brand, danger, important, informative.",
        code: `<CounterBadge count={5} />
<CounterBadge count={5} color="danger" />
<CounterBadge count={5} color="important" />
<CounterBadge count={5} color="informative" />
<CounterBadge count={5} appearance="ghost" />
<CounterBadge count={5} appearance="ghost" color="danger" />`,
        render: () => (
          <>
            <CounterBadge count={5} />
            <CounterBadge count={5} color="danger" />
            <CounterBadge count={5} color="important" />
            <CounterBadge count={5} color="informative" />
            <CounterBadge count={5} appearance="ghost" />
            <CounterBadge count={5} appearance="ghost" color="danger" />
          </>
        ),
      },
      {
        title: "Kích thước & hình dạng",
        description: "small, medium, large, extra-large; shape circular (mặc định) hoặc rounded.",
        code: `<CounterBadge count={8} size="small" />
<CounterBadge count={8} size="medium" />
<CounterBadge count={8} size="large" />
<CounterBadge count={8} size="extra-large" />
<CounterBadge count={8} size="large" shape="rounded" />`,
        render: () => (
          <>
            <CounterBadge count={8} size="small" />
            <CounterBadge count={8} size="medium" />
            <CounterBadge count={8} size="large" />
            <CounterBadge count={8} size="extra-large" />
            <CounterBadge count={8} size="large" shape="rounded" />
          </>
        ),
      },
      {
        title: "Tràn số, số 0 & chấm",
        description: "overflowCount mặc định 99; showZero để vẫn hiện số 0; dot chỉ là chấm.",
        code: `<CounterBadge count={100} />
<CounterBadge count={1000} overflowCount={999} />
<CounterBadge count={0} showZero color="informative" />
<CounterBadge dot color="danger" />`,
        render: () => (
          <>
            <CounterBadge count={100} />
            <CounterBadge count={1000} overflowCount={999} />
            <CounterBadge count={0} showZero color="informative" />
            <CounterBadge dot color="danger" />
          </>
        ),
      },
      {
        title: "Gắn lên nút icon",
        description: "Đặt badge tuyệt đối ở góc trên-cuối (logical: -end-XS) để tự đảo trong RTL.",
        code: `function NotificationBadgeDemo() {
  const [count, setCount] = useState(3);
  return (
    <div className="flex items-center gap-4">
      <span className="relative inline-flex">
        <Button appearance="subtle" icon={<Alert20Regular />} aria-label="Thông báo" />
        <CounterBadge count={count} size="small" color="danger" className="absolute -inset-e-1 -top-1" />
      </span>
      <Button onClick={() => setCount((c) => c + 1)}>Thêm</Button>
      <Button appearance="subtle" onClick={() => setCount(0)}>Đánh dấu đã đọc</Button>
    </div>
  );
}`,
        render: () => <NotificationBadgeDemo />,
      },
    ],
    dos: [
      "Dùng danger cho việc cần xử lý gấp, brand cho số đếm thông thường.",
      "Đặt overflowCount phù hợp để badge không phình to.",
      "Kèm nhãn đọc rõ nghĩa (label) khi đơn vị không phải \"thông báo\".",
    ],
    donts: [
      "Không dùng CounterBadge cho nhãn chữ — dùng Badge.",
      "Không hiện số 0 trừ khi số 0 mang thông tin.",
    ],
    props: [
      { name: "count", type: "number", defaultValue: "0", description: "Số đếm." },
      { name: "overflowCount", type: "number", defaultValue: "99", description: "Vượt ngưỡng hiển thị \"N+\"." },
      { name: "showZero", type: "boolean", defaultValue: "false", description: "Vẫn hiện khi count = 0." },
      { name: "dot", type: "boolean", defaultValue: "false", description: "Chỉ hiện chấm tròn (luôn hiện)." },
      { name: "appearance", type: `"filled" | "ghost"`, defaultValue: `"filled"`, description: "Nền đặc hoặc chỉ chữ." },
      { name: "color", type: `"brand" | "danger" | "important" | "informative"`, defaultValue: `"brand"`, description: "important = nền đảo (foreground-1)." },
      { name: "shape", type: `"circular" | "rounded"`, defaultValue: `"circular"`, description: "Hình dạng." },
      { name: "size", type: `"small" | "medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "Như Badge." },
      { name: "label", type: "string", description: "Nhãn cho trình đọc màn hình; mặc định \"{count} thông báo\"." },
    ],
  },

  /* ------------------------------------------------------------ PresenceBadge */
  {
    slug: "presencebadge",
    name: "PresenceBadge",
    category: "Hiển thị dữ liệu",
    lead: "PresenceBadge cho biết trạng thái hiện diện của một người: có mặt, bận, vắng mặt, ngoại tuyến…",
    description:
      "Dùng icon presence của Fluent (đặc cho trạng thái thường, viền khi outOfOffice) và màu theo token trạng thái. role=\"img\" với aria-label tiếng Việt. Thêm `ring` khi đặt chồng lên Avatar để tách khỏi ảnh.",
    importCode: `import { PresenceBadge } from "@/components/ui";`,
    hero: {
      title: "PresenceBadge",
      code: `<PresenceBadge size="large" status="available" />
<PresenceBadge size="large" status="away" />
<PresenceBadge size="large" status="busy" />
<PresenceBadge size="large" status="do-not-disturb" />
<PresenceBadge size="large" status="offline" />
<PresenceBadge size="large" status="out-of-office" />`,
      render: () => (
        <>
          <PresenceBadge size="large" status="available" />
          <PresenceBadge size="large" status="away" />
          <PresenceBadge size="large" status="busy" />
          <PresenceBadge size="large" status="do-not-disturb" />
          <PresenceBadge size="large" status="offline" />
          <PresenceBadge size="large" status="out-of-office" />
        </>
      ),
    },
    examples: [
      {
        title: "Trạng thái",
        description: "Tám trạng thái; luôn kèm chữ khi không gian cho phép (không chỉ dựa vào màu).",
        code: `<div className="grid grid-cols-2 gap-x-5 gap-y-2 text-body1">
  <span className="flex items-center gap-2"><PresenceBadge status="available" />Có mặt</span>
  <span className="flex items-center gap-2"><PresenceBadge status="away" />Vắng mặt</span>
  <span className="flex items-center gap-2"><PresenceBadge status="busy" />Bận</span>
  <span className="flex items-center gap-2"><PresenceBadge status="do-not-disturb" />Không làm phiền</span>
  <span className="flex items-center gap-2"><PresenceBadge status="offline" />Ngoại tuyến</span>
  <span className="flex items-center gap-2"><PresenceBadge status="out-of-office" />Không ở văn phòng</span>
  <span className="flex items-center gap-2"><PresenceBadge status="blocked" />Đã chặn</span>
  <span className="flex items-center gap-2"><PresenceBadge status="unknown" />Không xác định</span>
</div>`,
        render: () => (
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-body1">
            <span className="flex items-center gap-2">
              <PresenceBadge status="available" />
              Có mặt
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="away" />
              Vắng mặt
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="busy" />
              Bận
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="do-not-disturb" />
              Không làm phiền
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="offline" />
              Ngoại tuyến
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="out-of-office" />
              Không ở văn phòng
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="blocked" />
              Đã chặn
            </span>
            <span className="flex items-center gap-2">
              <PresenceBadge status="unknown" />
              Không xác định
            </span>
          </div>
        ),
      },
      {
        title: "Out of office",
        description: "outOfOffice đổi sang icon viền, giữ màu trạng thái (away/offline chuyển tím).",
        code: `<PresenceBadge size="large" outOfOffice status="available" />
<PresenceBadge size="large" outOfOffice status="away" />
<PresenceBadge size="large" outOfOffice status="busy" />
<PresenceBadge size="large" outOfOffice status="do-not-disturb" />
<PresenceBadge size="large" outOfOffice status="offline" />`,
        render: () => (
          <>
            <PresenceBadge size="large" outOfOffice status="available" />
            <PresenceBadge size="large" outOfOffice status="away" />
            <PresenceBadge size="large" outOfOffice status="busy" />
            <PresenceBadge size="large" outOfOffice status="do-not-disturb" />
            <PresenceBadge size="large" outOfOffice status="offline" />
          </>
        ),
      },
      {
        title: "Kích thước",
        description: "tiny 6px · extra-small 10 · small 12 · medium 16 (mặc định) · large 20 · extra-large 28.",
        code: `<PresenceBadge size="tiny" />
<PresenceBadge size="extra-small" />
<PresenceBadge size="small" />
<PresenceBadge size="medium" />
<PresenceBadge size="large" />
<PresenceBadge size="extra-large" />`,
        render: () => (
          <>
            <PresenceBadge size="tiny" />
            <PresenceBadge size="extra-small" />
            <PresenceBadge size="small" />
            <PresenceBadge size="medium" />
            <PresenceBadge size="large" />
            <PresenceBadge size="extra-large" />
          </>
        ),
      },
      {
        title: "Trên Avatar",
        description: "ring tạo viền 2px màu nền; định vị bằng thuộc tính logical (-end-px) để đúng cả RTL.",
        code: `<span className="relative inline-flex">
  <Avatar name="Nguyễn Văn An" size={48} color="colorful" />
  <PresenceBadge status="available" ring className="absolute -inset-e-px -bottom-px" />
</span>
<span className="relative inline-flex">
  <Avatar name="Trần Thị Bình" size={48} color="colorful" />
  <PresenceBadge status="busy" ring className="absolute -inset-e-px -bottom-px" />
</span>
<span className="relative inline-flex">
  <Avatar name="Lê Hoàng Cường" size={48} color="colorful" />
  <PresenceBadge status="away" outOfOffice ring className="absolute -inset-e-px -bottom-px" />
</span>`,
        render: () => (
          <>
            <span className="relative inline-flex">
              <Avatar name="Nguyễn Văn An" size={48} color="colorful" />
              <PresenceBadge status="available" ring className="absolute -inset-e-px -bottom-px" />
            </span>
            <span className="relative inline-flex">
              <Avatar name="Trần Thị Bình" size={48} color="colorful" />
              <PresenceBadge status="busy" ring className="absolute -inset-e-px -bottom-px" />
            </span>
            <span className="relative inline-flex">
              <Avatar name="Lê Hoàng Cường" size={48} color="colorful" />
              <PresenceBadge status="away" outOfOffice ring className="absolute -inset-e-px -bottom-px" />
            </span>
          </>
        ),
      },
    ],
    dos: [
      "Chọn size tương ứng với Avatar (Avatar 32 → small, 48 → medium, 64+ → large).",
      "Bật ring khi đặt chồng lên ảnh/Avatar.",
      "Hiện kèm chữ trạng thái ở danh sách, hồ sơ người dùng.",
    ],
    donts: [
      "Không đổi màu trạng thái theo brand.",
      "Không dùng PresenceBadge cho trạng thái hệ thống (online/offline của máy chủ) — dùng Badge hoặc MessageBar.",
    ],
    props: [
      {
        name: "status",
        type: `"available" | "away" | "busy" | "do-not-disturb" | "offline" | "out-of-office" | "blocked" | "unknown"`,
        defaultValue: `"available"`,
        description: "Trạng thái hiện diện.",
      },
      { name: "outOfOffice", type: "boolean", defaultValue: "false", description: "Đang nghỉ — icon viền, nhãn thêm \"không ở văn phòng\"." },
      {
        name: "size",
        type: `"tiny" | "extra-small" | "small" | "medium" | "large" | "extra-large"`,
        defaultValue: `"medium"`,
        description: "6 / 10 / 12 / 16 / 20 / 28px.",
      },
      { name: "ring", type: "boolean", defaultValue: "false", description: "Viền ring-2 ring-background-1 khi đặt trên Avatar." },
      { name: "label", type: "string", description: "Ghi đè aria-label (mặc định: \"Có mặt\", \"Bận\"…)." },
    ],
  },

  /* ------------------------------------------------------------ SwatchPicker */
  {
    slug: "swatchpicker",
    name: "SwatchPicker",
    category: "Nhập liệu",
    lead: "SwatchPicker cho phép chọn một màu (hoặc chất liệu) trong bảng ô mẫu.",
    description:
      "Gồm ColorSwatch (màu CSS bất kỳ — đây là dữ liệu nên được phép dùng HEX), ImageSwatch (ảnh hoạ tiết) và EmptySwatch (ô trống, vd. \"Thêm màu\"). Ô đang chọn có vòng 2px brand-stroke với khe background-1 bên trong. Bàn phím: mũi tên di chuyển focus (tự đảo trong RTL), Enter/Space để chọn; Tab vào/ra nhóm một lần.",
    importCode: `import { SwatchPicker, ColorSwatch, ImageSwatch, EmptySwatch } from "@/components/ui";`,
    hero: {
      title: "SwatchPicker",
      code: `const colors = [
  { value: "#C2347A", label: "Hồng anh đào" },
  { value: "#A855C9", label: "Tím phong lan" },
  { value: "#6A5AE0", label: "Chàm" },
  { value: "#0F6CBD", label: "Xanh dương" },
  { value: "#23A99B", label: "Ngọc lam" },
  { value: "#EAA300", label: "Vàng cúc" },
  { value: "#D4704A", label: "Cam đào" },
];

function SwatchPickerDemo() {
  const [color, setColor] = useState("#C2347A");
  const current = colors.find((c) => c.value === color);
  return (
    <div className="flex flex-col items-start gap-3">
      <SwatchPicker aria-label="Màu nhấn" selectedValue={color} onSelectionChange={setColor}>
        {colors.map((c) => (
          <ColorSwatch key={c.value} value={c.value} color={c.value} aria-label={c.label} />
        ))}
      </SwatchPicker>
      <span className="flex items-center gap-2 text-body1 text-foreground-2">
        <span className="size-4 rounded-circular" style={{ backgroundColor: color }} />
        Đã chọn: {current?.label}
      </span>
    </div>
  );
}`,
      render: () => <SwatchPickerDemo />,
    },
    examples: [
      {
        title: "Lưới",
        description: "layout=\"grid\" + columnCount; ↑/↓ đi theo cột, ←/→ theo thứ tự.",
        code: `const palette = [
  { value: "#FDEDF3", label: "Hồng 160" },
  { value: "#FFA7C9", label: "Hồng 130" },
  { value: "#E24A92", label: "Hồng 90" },
  { value: "#C2347A", label: "Hồng 80" },
  { value: "#61213F", label: "Hồng 40" },
  { value: "#EBF3FC", label: "Xanh 160" },
  { value: "#96C6FA", label: "Xanh 130" },
  { value: "#2886DE", label: "Xanh 90" },
  { value: "#0F6CBD", label: "Xanh 80" },
  { value: "#0E4775", label: "Xanh 40" },
];

<SwatchPicker layout="grid" columnCount={5} shape="rounded" aria-label="Bảng màu" defaultSelectedValue="#0F6CBD">
  {palette.map((c) => (
    <ColorSwatch key={c.value} value={c.value} color={c.value} aria-label={c.label} />
  ))}
</SwatchPicker>`,
        render: () => (
          <SwatchPicker layout="grid" columnCount={5} shape="rounded" aria-label="Bảng màu" defaultSelectedValue="#0F6CBD">
            {palette.map((c) => (
              <ColorSwatch key={c.value} value={c.value} color={c.value} aria-label={c.label} />
            ))}
          </SwatchPicker>
        ),
      },
      {
        title: "Kích thước & hình dạng",
        description: "size extra-small 20 · small 24 · medium 28 · large 32px; shape square, rounded, circular.",
        code: `<div className="flex flex-col gap-3">
  <SwatchPicker size="extra-small" shape="circular" aria-label="Extra small" defaultSelectedValue="#C2347A">
    <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
    <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
    <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
  </SwatchPicker>
  <SwatchPicker size="small" shape="rounded" aria-label="Small" defaultSelectedValue="#6A5AE0">
    <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
    <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
    <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
  </SwatchPicker>
  <SwatchPicker size="medium" aria-label="Medium" defaultSelectedValue="#23A99B">
    <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
    <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
    <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
  </SwatchPicker>
  <SwatchPicker size="large" shape="circular" aria-label="Large" defaultSelectedValue="#C2347A">
    <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
    <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
    <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
  </SwatchPicker>
</div>`,
        render: () => (
          <div className="flex flex-col gap-3">
            <SwatchPicker size="extra-small" shape="circular" aria-label="Extra small" defaultSelectedValue="#C2347A">
              <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
              <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
              <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
            </SwatchPicker>
            <SwatchPicker size="small" shape="rounded" aria-label="Small" defaultSelectedValue="#6A5AE0">
              <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
              <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
              <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
            </SwatchPicker>
            <SwatchPicker size="medium" aria-label="Medium" defaultSelectedValue="#23A99B">
              <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
              <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
              <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
            </SwatchPicker>
            <SwatchPicker size="large" shape="circular" aria-label="Large" defaultSelectedValue="#C2347A">
              <ColorSwatch value="#C2347A" color="#C2347A" aria-label="Hồng anh đào" />
              <ColorSwatch value="#6A5AE0" color="#6A5AE0" aria-label="Chàm" />
              <ColorSwatch value="#23A99B" color="#23A99B" aria-label="Ngọc lam" />
            </SwatchPicker>
          </div>
        ),
      },
      {
        title: "Ảnh, ô trống & disabled",
        description: "ImageSwatch cho chất liệu; ô disabled bị bỏ qua khi điều hướng; EmptySwatch làm nút thêm.",
        code: `// wood, marble, fabric: URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
<SwatchPicker size="large" shape="rounded" aria-label="Chất liệu" defaultSelectedValue="go">
  <ImageSwatch value="go" src={wood} aria-label="Gỗ" />
  <ImageSwatch value="da" src={marble} aria-label="Đá cẩm thạch" />
  <ImageSwatch value="vai" src={fabric} aria-label="Vải" />
  <ColorSwatch value="den" color="#242424" aria-label="Đen (hết hàng)" disabled />
  <EmptySwatch aria-label="Thêm chất liệu">
    <Add16Regular />
  </EmptySwatch>
</SwatchPicker>`,
        render: () => (
          <SwatchPicker size="large" shape="rounded" aria-label="Chất liệu" defaultSelectedValue="go">
            <ImageSwatch value="go" src={wood} aria-label="Gỗ" />
            <ImageSwatch value="da" src={marble} aria-label="Đá cẩm thạch" />
            <ImageSwatch value="vai" src={fabric} aria-label="Vải" />
            <ColorSwatch value="den" color="#242424" aria-label="Đen (hết hàng)" disabled />
            <EmptySwatch aria-label="Thêm chất liệu">
              <Add16Regular />
            </EmptySwatch>
          </SwatchPicker>
        ),
      },
    ],
    dos: [
      "Mỗi ô có aria-label là tên màu dễ hiểu (\"Hồng anh đào\"), không chỉ mã HEX.",
      "Hiện tên màu đang chọn ở gần để không chỉ dựa vào màu.",
      "Nhóm màu cùng họ theo hàng/cột trong layout grid.",
    ],
    donts: [
      "Không dùng SwatchPicker cho lựa chọn không phải màu/chất liệu — dùng RadioGroup.",
      "Không đặt quá nhiều ô (>40) — cân nhắc ColorPicker hoặc ô nhập HEX.",
    ],
    props: [
      { name: "selectedValue / defaultSelectedValue", type: "string", description: "Giá trị đang chọn (controlled / uncontrolled)." },
      { name: "onSelectionChange", type: "(value: string) => void", description: "Gọi khi chọn ô mới (click, Enter, Space)." },
      { name: "layout", type: `"row" | "grid"`, defaultValue: `"row"`, description: "Hàng (tự xuống dòng) hoặc lưới." },
      { name: "columnCount", type: "number", description: "Số cột khi layout=\"grid\"." },
      { name: "size", type: `"extra-small" | "small" | "medium" | "large"`, defaultValue: `"medium"`, description: "20 / 24 / 28 / 32px." },
      { name: "shape", type: `"square" | "rounded" | "circular"`, defaultValue: `"square"`, description: "Hình dạng ô." },
      { name: "spacing", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Khoảng cách 2 / 4px." },
      { name: "ColorSwatch.color / value", type: "string", description: "Màu CSS (dữ liệu) và giá trị trả về." },
      { name: "ImageSwatch.src", type: "string", description: "URL ảnh hoạ tiết." },
      { name: "*.disabled / aria-label / icon", type: "boolean / string / ReactNode", description: "Vô hiệu hoá, nhãn đọc, icon chồng lên ô." },
    ],
  },

  /* ------------------------------------------------------------ TeachingPopover */
  {
    slug: "teachingpopover",
    name: "TeachingPopover",
    category: "Bề mặt & overlay",
    lead: "TeachingPopover giới thiệu tính năng mới hoặc hướng dẫn từng bước, gắn ngay cạnh phần tử liên quan.",
    description:
      "Dựng trên Popover (shadow-16, có mũi tên). Gồm Header (icon + tiêu đề nhỏ + nút đóng), Body (ảnh minh hoạ tuỳ chọn, tiêu đề, nội dung), Footer (nút chính + nút phụ) và Carousel cho nhiều bước (\"1/3\", chấm điều hướng, Quay lại / Tiếp / Hoàn tất). appearance=\"brand\" phủ nền brand cho bề mặt nhỏ này.",
    importCode: `import {
  TeachingPopover, TeachingPopoverTrigger, TeachingPopoverSurface, TeachingPopoverHeader,
  TeachingPopoverBody, TeachingPopoverTitle, TeachingPopoverFooter, TeachingPopoverCarousel,
} from "@/components/ui";`,
    hero: {
      title: "TeachingPopover",
      code: `<TeachingPopover>
  <TeachingPopoverTrigger asChild>
    <Button appearance="primary">Xem mẹo</Button>
  </TeachingPopoverTrigger>
  <TeachingPopoverSurface>
    <TeachingPopoverHeader>Mẹo</TeachingPopoverHeader>
    <TeachingPopoverBody>
      <TeachingPopoverTitle>Ghim trang hay dùng</TeachingPopoverTitle>
      Bấm biểu tượng ghim để trang luôn nằm ở đầu thanh điều hướng.
    </TeachingPopoverBody>
    <TeachingPopoverFooter primary="Thử ngay" secondary="Để sau" closeOnPrimary />
  </TeachingPopoverSurface>
</TeachingPopover>`,
      render: () => (
        <TeachingPopover>
          <TeachingPopoverTrigger asChild>
            <Button appearance="primary">Xem mẹo</Button>
          </TeachingPopoverTrigger>
          <TeachingPopoverSurface>
            <TeachingPopoverHeader>Mẹo</TeachingPopoverHeader>
            <TeachingPopoverBody>
              <TeachingPopoverTitle>Ghim trang hay dùng</TeachingPopoverTitle>
              Bấm biểu tượng ghim để trang luôn nằm ở đầu thanh điều hướng.
            </TeachingPopoverBody>
            <TeachingPopoverFooter primary="Thử ngay" secondary="Để sau" closeOnPrimary />
          </TeachingPopoverSurface>
        </TeachingPopover>
      ),
    },
    examples: [
      {
        title: "Brand & ảnh minh hoạ",
        description: "appearance=\"brand\" trên TeachingPopover; media hiển thị phía trên nội dung.",
        code: `// illustration: URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
<TeachingPopover appearance="brand">
  <TeachingPopoverTrigger asChild>
    <Button icon={<Sparkle16Regular />}>Tính năng mới</Button>
  </TeachingPopoverTrigger>
  <TeachingPopoverSurface>
    <TeachingPopoverHeader icon={<Sparkle16Regular />}>Mới</TeachingPopoverHeader>
    <TeachingPopoverBody media={<img src={illustration} alt="" />}>
      <TeachingPopoverTitle>Chủ đề Sakura</TeachingPopoverTitle>
      Đổi brand và chế độ sáng/tối cho từng vùng giao diện bằng YugenProvider.
    </TeachingPopoverBody>
    <TeachingPopoverFooter primary="Khám phá" secondary="Bỏ qua" closeOnPrimary />
  </TeachingPopoverSurface>
</TeachingPopover>`,
        render: () => (
          <TeachingPopover appearance="brand">
            <TeachingPopoverTrigger asChild>
              <Button icon={<Sparkle16Regular />}>Tính năng mới</Button>
            </TeachingPopoverTrigger>
            <TeachingPopoverSurface>
              <TeachingPopoverHeader icon={<Sparkle16Regular />}>Mới</TeachingPopoverHeader>
              <TeachingPopoverBody media={<img src={illustration} alt="" />}>
                <TeachingPopoverTitle>Chủ đề Sakura</TeachingPopoverTitle>
                Đổi brand và chế độ sáng/tối cho từng vùng giao diện bằng YugenProvider.
              </TeachingPopoverBody>
              <TeachingPopoverFooter primary="Khám phá" secondary="Bỏ qua" closeOnPrimary />
            </TeachingPopoverSurface>
          </TeachingPopover>
        ),
      },
      {
        title: "Footer dọc",
        description: "layout=\"vertical\" xếp hai nút rộng hết bề mặt — hợp với nhãn dài.",
        code: `<TeachingPopover>
  <TeachingPopoverTrigger asChild>
    <Button icon={<Bookmark20Regular />}>Lưu</Button>
  </TeachingPopoverTrigger>
  <TeachingPopoverSurface side="bottom" align="start">
    <TeachingPopoverHeader>Mẹo</TeachingPopoverHeader>
    <TeachingPopoverBody>
      <TeachingPopoverTitle>Bộ sưu tập</TeachingPopoverTitle>
      Mục đã lưu được gom vào Bộ sưu tập và đồng bộ trên mọi thiết bị.
    </TeachingPopoverBody>
    <TeachingPopoverFooter layout="vertical" primary="Mở Bộ sưu tập" secondary="Đã hiểu" closeOnPrimary />
  </TeachingPopoverSurface>
</TeachingPopover>`,
        render: () => (
          <TeachingPopover>
            <TeachingPopoverTrigger asChild>
              <Button icon={<Bookmark20Regular />}>Lưu</Button>
            </TeachingPopoverTrigger>
            <TeachingPopoverSurface side="bottom" align="start">
              <TeachingPopoverHeader>Mẹo</TeachingPopoverHeader>
              <TeachingPopoverBody>
                <TeachingPopoverTitle>Bộ sưu tập</TeachingPopoverTitle>
                Mục đã lưu được gom vào Bộ sưu tập và đồng bộ trên mọi thiết bị.
              </TeachingPopoverBody>
              <TeachingPopoverFooter layout="vertical" primary="Mở Bộ sưu tập" secondary="Đã hiểu" closeOnPrimary />
            </TeachingPopoverSurface>
          </TeachingPopover>
        ),
      },
      {
        title: "Nhiều bước (Carousel)",
        description: "Mỗi phần tử con của TeachingPopoverCarousel là một bước; bước đầu có \"Để sau\", bước cuối \"Hoàn tất\".",
        code: `<TeachingPopover>
  <TeachingPopoverTrigger asChild>
    <Button appearance="primary">Bắt đầu tham quan</Button>
  </TeachingPopoverTrigger>
  <TeachingPopoverSurface>
    <TeachingPopoverHeader>Làm quen</TeachingPopoverHeader>
    <TeachingPopoverCarousel>
      <TeachingPopoverBody>
        <TeachingPopoverTitle>Tìm nhanh</TeachingPopoverTitle>
        Gõ tên component vào ô tìm kiếm trên thanh trên cùng để tới thẳng trang tài liệu.
      </TeachingPopoverBody>
      <TeachingPopoverBody>
        <TeachingPopoverTitle>Đổi giao diện</TeachingPopoverTitle>
        Chọn Yugen, Web hoặc Teams và chế độ sáng/tối ngay trong khung ví dụ.
      </TeachingPopoverBody>
      <TeachingPopoverBody>
        <TeachingPopoverTitle>Sao chép mã</TeachingPopoverTitle>
        Mỗi ví dụ đều có nút hiện mã để sao chép nguyên khối JSX.
      </TeachingPopoverBody>
    </TeachingPopoverCarousel>
  </TeachingPopoverSurface>
</TeachingPopover>`,
        render: () => (
          <TeachingPopover>
            <TeachingPopoverTrigger asChild>
              <Button appearance="primary">Bắt đầu tham quan</Button>
            </TeachingPopoverTrigger>
            <TeachingPopoverSurface>
              <TeachingPopoverHeader>Làm quen</TeachingPopoverHeader>
              <TeachingPopoverCarousel>
                <TeachingPopoverBody>
                  <TeachingPopoverTitle>Tìm nhanh</TeachingPopoverTitle>
                  Gõ tên component vào ô tìm kiếm trên thanh trên cùng để tới thẳng trang tài liệu.
                </TeachingPopoverBody>
                <TeachingPopoverBody>
                  <TeachingPopoverTitle>Đổi giao diện</TeachingPopoverTitle>
                  Chọn Yugen, Web hoặc Teams và chế độ sáng/tối ngay trong khung ví dụ.
                </TeachingPopoverBody>
                <TeachingPopoverBody>
                  <TeachingPopoverTitle>Sao chép mã</TeachingPopoverTitle>
                  Mỗi ví dụ đều có nút hiện mã để sao chép nguyên khối JSX.
                </TeachingPopoverBody>
              </TeachingPopoverCarousel>
            </TeachingPopoverSurface>
          </TeachingPopover>
        ),
      },
    ],
    dos: [
      "Chỉ hiện một TeachingPopover tại một thời điểm, gắn với đúng phần tử được giới thiệu.",
      "Tiêu đề ngắn, nội dung 1–2 câu; luôn có cách đóng (nút X hoặc nút phụ).",
      "Giới hạn hướng dẫn nhiều bước ở 3–5 bước.",
    ],
    donts: [
      "Không dùng cho thông báo lỗi hay xác nhận — dùng MessageBar / Dialog.",
      "Không tự bật lại sau khi người dùng đã bỏ qua.",
      "Không đặt form hay nội dung dài trong bề mặt.",
    ],
    props: [
      { name: "TeachingPopover.appearance", type: `"normal" | "brand"`, defaultValue: `"normal"`, description: "Áp cho bề mặt, header, nút." },
      { name: "TeachingPopover.open / onOpenChange", type: "boolean / (open) => void", description: "Điều khiển hiển thị (Radix Popover)." },
      { name: "TeachingPopoverSurface.side / align / withArrow", type: "Popover props", defaultValue: "withArrow = true", description: "Vị trí bề mặt (rộng 320px)." },
      { name: "TeachingPopoverHeader.icon / dismissible", type: "ReactNode / boolean", defaultValue: "bóng đèn / true", description: "Icon trước tiêu đề; nút đóng." },
      { name: "TeachingPopoverBody.media", type: "ReactNode", description: "Ảnh minh hoạ phía trên." },
      { name: "TeachingPopoverFooter.primary / secondary", type: "ReactNode", description: "Nhãn hai nút; nút phụ đóng popover." },
      { name: "TeachingPopoverFooter.closeOnPrimary / layout", type: `boolean / "horizontal" | "vertical"`, description: "Đóng khi bấm nút chính; bố cục nút." },
      { name: "TeachingPopoverCarousel.step / defaultStep / onStepChange", type: "number", description: "Bước hiện tại (bắt đầu từ 0)." },
      { name: "TeachingPopoverCarousel.onFinish / *Label", type: "() => void / string", description: "Bấm Hoàn tất; đổi nhãn Tiếp / Quay lại / Hoàn tất / Để sau." },
    ],
  },

  /* ------------------------------------------------------------ Fade */
  {
    slug: "fade",
    name: "Fade",
    category: "Chuyển động",
    lead: "Fade làm phần tử mờ dần vào và ra — chuyển động presence nhẹ nhàng nhất.",
    description:
      "Mọi presence component (Fade, Scale, Slide, Collapse, Blur, Rotate) dùng chung máy trạng thái usePresence (exited → entering → entered → exiting) với CSS transition; thời lượng theo token --duration*, vào dùng --curveDecelerateMid, ra dùng --curveAccelerateMid. Bỏ qua chuyển động khi người dùng bật prefers-reduced-motion. Phần tử con nhận class qua Slot nên phải là một element duy nhất.",
    importCode: `import { Fade } from "@/components/ui";`,
    hero: {
      title: "Fade",
      code: `function FadeDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Fade visible={visible}>
        <div className="size-24 rounded-xlarge bg-brand-background shadow-8" />
      </Fade>
    </div>
  );
}`,
      render: () => <FadeDemo />,
    },
    examples: [
      {
        title: "Thời lượng",
        description: "duration: faster (100ms), fast, normal (mặc định, 200ms), gentle, slow (300ms).",
        code: `function FadeDurationDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-3">
        <Fade visible={visible} duration="faster">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">faster</div>
        </Fade>
        <Fade visible={visible} duration="normal">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">normal</div>
        </Fade>
        <Fade visible={visible} duration="slow">
          <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">slow</div>
        </Fade>
      </div>
    </div>
  );
}`,
        render: () => <FadeDurationDemo />,
      },
      {
        title: "unmountOnExit & onMotionFinish",
        description: "Gỡ phần tử khỏi DOM sau khi ra xong; callback báo pha nào vừa kết thúc.",
        code: `function FadeUnmountDemo() {
  const [visible, setVisible] = useState(false);
  const [log, setLog] = useState("Chưa chạy");
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Fade
        visible={visible}
        unmountOnExit
        onMotionFinish={(direction) => setLog(direction === "enter" ? "Đã vào xong" : "Đã ra xong — phần tử đã gỡ khỏi DOM")}
      >
        <div className="rounded-medium bg-background-1 px-4 py-3 text-body1 shadow-16">Bản nháp đã được lưu</div>
      </Fade>
      <span className="text-caption1 text-foreground-3">{log}</span>
    </div>
  );
}`,
        render: () => <FadeUnmountDemo />,
      },
    ],
    dos: [
      "Dùng Fade cho nội dung xuất hiện tại chỗ (thông báo nhỏ, placeholder, ảnh tải xong).",
      "Giữ thời lượng ngắn (faster–normal) cho phần tử nhỏ.",
    ],
    donts: [
      "Không bọc nhiều phần tử con trực tiếp — Fade nhận đúng một element.",
      "Không dùng Fade để báo trạng thái quan trọng mà không có chữ/icon đi kèm.",
    ],
    props: [
      ...PRESENCE_PROPS,
      {
        name: "usePresence(visible, durationMs, options)",
        type: "hook",
        description: "Máy trạng thái dùng chung — trả về { status, mounted, active } để tự dựng chuyển động riêng.",
      },
    ],
  },

  /* ------------------------------------------------------------ Scale */
  {
    slug: "scale",
    name: "Scale",
    category: "Chuyển động",
    lead: "Scale phóng phần tử từ 90% lên kích thước thật, kèm mờ dần — hợp với bề mặt nổi nhỏ.",
    description:
      "Chuyển động transform scale + opacity; tắt mờ bằng animateOpacity={false}. Dùng appear để chạy ngay khi gắn vào trang.",
    importCode: `import { Scale } from "@/components/ui";`,
    hero: {
      title: "Scale",
      code: `function ScaleDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <Scale visible={visible}>
        <div className="flex w-56 flex-col gap-1 rounded-xlarge bg-background-1 p-4 shadow-16">
          <span className="text-subtitle2 font-semibold">Hộp thoại nhỏ</span>
          <span className="text-body1 text-foreground-2">Scale phóng từ 90% kèm mờ dần.</span>
        </div>
      </Scale>
    </div>
  );
}`,
      render: () => <ScaleDemo />,
    },
    examples: [
      {
        title: "Thời lượng vào/ra & animateOpacity",
        description: "Vào chậm hơn ra (gentle / fast); hoặc chỉ scale, không đổi opacity.",
        code: `function ScaleOptionsDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-3">
        <Scale visible={visible} duration="gentle" exitDuration="fast">
          <div className="flex size-24 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
            gentle / fast
          </div>
        </Scale>
        <Scale visible={visible} animateOpacity={false}>
          <div className="flex size-24 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
            không opacity
          </div>
        </Scale>
      </div>
    </div>
  );
}`,
        render: () => <ScaleOptionsDemo />,
      },
      {
        title: "appear",
        description: "Chạy chuyển động vào ngay lần gắn đầu tiên (đổi key để chạy lại).",
        code: `function ScaleAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <Scale key={run} visible appear duration="gentle">
        <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle1 font-semibold shadow-8">
          桜
        </div>
      </Scale>
    </div>
  );
}`,
        render: () => <ScaleAppearDemo />,
      },
    ],
    dos: ["Dùng cho bề mặt nhỏ bật lên: popover tuỳ biến, thẻ xem nhanh, hình minh hoạ.", "Kết hợp exitDuration ngắn hơn duration."],
    donts: ["Không scale bề mặt lớn (trang, drawer) — dùng Slide.", "Không phóng chữ thân bài liên tục để gây chú ý."],
    props: [
      ...PRESENCE_PROPS,
      { name: "animateOpacity", type: "boolean", defaultValue: "true", description: "Kèm mờ dần." },
    ],
  },

  /* ------------------------------------------------------------ Slide */
  {
    slug: "slide",
    name: "Slide",
    category: "Chuyển động",
    lead: "Slide trượt phần tử vào từ một cạnh — start, end, top hoặc bottom.",
    description:
      "start/end là hướng logic: trong RTL, start là cạnh phải (tự đảo qua biến thể rtl:). Khoảng trượt 20px (spacingXL) kèm mờ dần; dùng cho thông báo, thanh hành động, nội dung chuyển bước.",
    importCode: `import { Slide } from "@/components/ui";`,
    hero: {
      title: "Slide",
      code: `function SlideDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="grid grid-cols-4 gap-3">
        {(["start", "end", "top", "bottom"] as const).map((from) => (
          <Slide key={from} visible={visible} from={from}>
            <div className="flex size-20 items-center justify-center rounded-xlarge bg-background-1 text-body1 font-semibold shadow-8">
              {from}
            </div>
          </Slide>
        ))}
      </div>
    </div>
  );
}`,
      render: () => <SlideDemo />,
    },
    examples: [
      {
        title: "Hướng logic trong RTL",
        description: "Cùng from=\"start\" nhưng trong vùng dir=\"rtl\" phần tử trượt vào từ bên phải.",
        code: `function SlideRtlDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div dir="rtl" className="flex gap-3">
        <Slide visible={visible} from="start">
          <div className="flex h-16 w-32 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">
            start → từ phải
          </div>
        </Slide>
        <Slide visible={visible} from="end">
          <div className="flex h-16 w-32 items-center justify-center rounded-xlarge bg-background-1 text-caption1 shadow-8">
            end → từ trái
          </div>
        </Slide>
      </div>
    </div>
  );
}`,
        render: () => <SlideRtlDemo />,
      },
      {
        title: "Thông báo trượt vào",
        description: "from=\"bottom\" + unmountOnExit cho thông báo tạm thời.",
        code: `function SlideNoticeDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex h-40 w-80 flex-col items-center justify-between">
      <Button appearance="primary" onClick={() => setVisible(true)}>
        Lưu thay đổi
      </Button>
      <Slide visible={visible} from="bottom" unmountOnExit>
        <div className="flex w-full items-center gap-2 rounded-medium bg-background-1 p-3 text-body1 shadow-16">
          <CheckmarkCircle20Regular className="shrink-0 text-success-foreground-1" />
          <span className="flex-1">Đã lưu thay đổi.</span>
          <Button
            appearance="transparent"
            size="small"
            icon={<Dismiss16Regular />}
            aria-label="Đóng"
            onClick={() => setVisible(false)}
          />
        </div>
      </Slide>
    </div>
  );
}`,
        render: () => <SlideNoticeDemo />,
      },
    ],
    dos: ["Trượt từ phía phần tử sẽ \"neo\" vào (thông báo từ dưới, panel từ cạnh).", "Dùng start/end thay cho left/right để đúng RTL."],
    donts: ["Không trượt nhiều phần tử theo các hướng khác nhau cùng lúc.", "Không dùng Slide cho tooltip, menu — đã có animation riêng."],
    props: [
      ...PRESENCE_PROPS,
      { name: "from", type: `"start" | "end" | "top" | "bottom"`, defaultValue: `"bottom"`, description: "Cạnh trượt vào (start/end theo hướng chữ)." },
      { name: "animateOpacity", type: "boolean", defaultValue: "true", description: "Kèm mờ dần." },
    ],
  },

  /* ------------------------------------------------------------ Collapse */
  {
    slug: "collapse",
    name: "Collapse",
    category: "Chuyển động",
    lead: "Collapse giãn hoặc thu chiều cao (hoặc chiều rộng) của một vùng nội dung một cách mượt mà.",
    description:
      "Dùng kỹ thuật CSS grid-template-rows 0fr → 1fr nên không phải đo chiều cao bằng JavaScript. Collapse tự render phần tử bọc nên children có thể là bất kỳ nội dung nào. Khác Collapsible (Bố cục): Collapse chỉ là chuyển động, không có trigger hay trạng thái riêng.",
    importCode: `import { Collapse } from "@/components/ui";`,
    hero: {
      title: "Collapse",
      code: `function CollapseDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-80 flex-col items-start gap-2">
      <Button aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Thu gọn" : "Xem chi tiết"}
      </Button>
      <Collapse visible={open}>
        <div className="rounded-medium bg-background-1 p-3 text-body1 text-foreground-2 shadow-4">
          Collapse dùng kỹ thuật grid-template-rows 0fr → 1fr nên không cần đo chiều cao nội dung — văn bản dài, ảnh
          hay danh sách đều giãn mượt.
        </div>
      </Collapse>
    </div>
  );
}`,
      render: () => <CollapseDemo />,
    },
    examples: [
      {
        title: "Chiều ngang",
        description: "orientation=\"horizontal\" thu/giãn chiều rộng — vd. bảng điều hướng thu gọn.",
        code: `function CollapseHorizontalDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-40 items-start gap-2">
      <Button
        icon={<Navigation20Regular />}
        aria-label={open ? "Thu gọn điều hướng" : "Mở điều hướng"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
      <Collapse visible={open} orientation="horizontal" className="h-full">
        <nav className="flex h-full w-48 flex-col gap-1 rounded-medium bg-background-1 p-2 text-body1 shadow-4">
          <span className="px-2 py-1">Trang chủ</span>
          <span className="px-2 py-1">Tài liệu</span>
          <span className="px-2 py-1">Cài đặt</span>
        </nav>
      </Collapse>
    </div>
  );
}`,
        render: () => <CollapseHorizontalDemo />,
      },
      {
        title: "Thời lượng & không opacity",
        description: "Mở chậm (slow), đóng nhanh (fast); animateOpacity={false} chỉ đổi kích thước.",
        code: `function CollapseSlowDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex w-80 flex-col items-start gap-2">
      <Button aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Thu gọn" : "Mở rộng"}
      </Button>
      <Collapse visible={open} animateOpacity={false} duration="slow" exitDuration="fast">
        <ul className="flex flex-col gap-1 rounded-medium bg-background-1 p-3 text-body1 shadow-4">
          <li>Mở: slow (300ms), giảm tốc</li>
          <li>Đóng: fast (150ms), tăng tốc</li>
          <li>Không đổi opacity</li>
        </ul>
      </Collapse>
    </div>
  );
}`,
        render: () => <CollapseSlowDemo />,
      },
    ],
    dos: ["Đặt aria-expanded trên nút điều khiển.", "Dùng cho nội dung phụ: chi tiết, bộ lọc nâng cao, ghi chú."],
    donts: [
      "Không đặt nội dung bắt buộc phải đọc trong vùng thu gọn mặc định.",
      "Không lồng nhiều Collapse chạy cùng lúc gây giật bố cục.",
    ],
    props: [
      ...PRESENCE_PROPS.filter((p) => p.name !== "children"),
      { name: "orientation", type: `"vertical" | "horizontal"`, defaultValue: `"vertical"`, description: "Thu/giãn chiều cao hoặc chiều rộng." },
      { name: "animateOpacity", type: "boolean", defaultValue: "true", description: "Kèm mờ dần." },
      { name: "children", type: "ReactNode", description: "Nội dung bất kỳ (Collapse tự bọc)." },
      { name: "className / …div props", type: "HTMLAttributes<HTMLDivElement>", description: "Truyền cho phần tử bọc ngoài." },
    ],
  },

  /* ------------------------------------------------------------ Blur & Rotate */
  {
    slug: "blurrotate",
    name: "Blur & Rotate",
    category: "Chuyển động",
    lead: "Blur chuyển từ nhoè sang rõ; Rotate xoay phần tử từ -90° về vị trí — hai chuyển động presence nhấn mạnh.",
    description:
      "Cùng API với Fade (visible, appear, unmountOnExit, duration…). Blur dùng filter blur-md; Rotate dùng thuộc tính rotate và đảo chiều trong RTL. Hợp để đổi icon tại chỗ (phát/tạm dừng) hay làm nổi minh hoạ khi tải xong.",
    importCode: `import { Blur, Rotate } from "@/components/ui";`,
    hero: {
      title: "Blur & Rotate",
      code: `function BlurRotateDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-4">
        <Blur visible={visible}>
          <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle2 font-semibold shadow-8">
            Blur
          </div>
        </Blur>
        <Rotate visible={visible}>
          <div className="flex size-24 items-center justify-center rounded-xlarge bg-background-1 text-subtitle2 font-semibold shadow-8">
            Rotate
          </div>
        </Rotate>
      </div>
    </div>
  );
}`,
      render: () => <BlurRotateDemo />,
    },
    examples: [
      {
        title: "Đổi icon bằng Rotate",
        description: "Hai Rotate chồng lên nhau trong một ô lưới: icon cũ xoay ra, icon mới xoay vào.",
        code: `function RotateIconDemo() {
  const [playing, setPlaying] = useState(false);
  return (
    <Button
      appearance="primary"
      iconOnly
      aria-label={playing ? "Tạm dừng" : "Phát"}
      onClick={() => setPlaying((p) => !p)}
      icon={
        <span className="grid *:col-start-1 *:row-start-1">
          <Rotate visible={!playing} duration="fast">
            <Play20Regular />
          </Rotate>
          <Rotate visible={playing} duration="fast">
            <Pause20Regular />
          </Rotate>
        </span>
      }
    />
  );
}`,
        render: () => <RotateIconDemo />,
      },
      {
        title: "Blur khi xuất hiện",
        description: "appear + duration=\"slow\" để chữ lớn hiện dần từ nhoè sang rõ.",
        code: `function BlurAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <Blur key={run} visible appear duration="slow">
        <p className="max-w-xs text-center text-subtitle1 font-semibold">幽玄 — vẻ đẹp sâu lắng, khó nắm bắt.</p>
      </Blur>
    </div>
  );
}`,
        render: () => <BlurAppearDemo />,
      },
    ],
    dos: ["Dùng tiết kiệm — một điểm nhấn chuyển động mỗi khung nhìn.", "Giữ thời lượng fast khi đổi icon trong nút."],
    donts: ["Không blur văn bản người dùng cần đọc ngay.", "Không xoay phần tử lớn hoặc chứa nhiều chữ."],
    props: [
      ...PRESENCE_PROPS,
      { name: "animateOpacity", type: "boolean", defaultValue: "true", description: "Kèm mờ dần (cả Blur và Rotate)." },
    ],
  },

  /* ------------------------------------------------------------ Stagger */
  {
    slug: "stagger",
    name: "Stagger",
    category: "Chuyển động",
    lead: "Stagger cho các phần tử con xuất hiện lần lượt, cách nhau một độ trễ ngắn.",
    description:
      "Khi visible bật, Stagger lần lượt bật visible cho từng con; khi tắt thì ẩn theo thứ tự ngược lại. Con là Fade/Scale/Slide/Blur/Rotate/Collapse được điều khiển trực tiếp; phần tử thường được bọc tự động trong Fade. Stagger render fragment — đặt nó bên trong phần tử bố cục (flex, grid).",
    importCode: `import { Stagger } from "@/components/ui";`,
    hero: {
      title: "Stagger",
      code: `const tasks = ["Thiết kế token", "Dựng component", "Viết tài liệu", "Kiểm thử RTL", "Phát hành"];

function StaggerDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex w-64 flex-col gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn danh sách" : "Hiện danh sách"}</Button>
      <div className="flex flex-col gap-1">
        <Stagger visible={visible}>
          {tasks.map((task) => (
            <div key={task} className="rounded-medium bg-background-1 px-3 py-2 text-body1 shadow-2">
              {task}
            </div>
          ))}
        </Stagger>
      </div>
    </div>
  );
}`,
      render: () => <StaggerDemo />,
    },
    examples: [
      {
        title: "Với Slide",
        description: "Con là presence component nên giữ được kiểu chuyển động riêng; itemDelay=\"fast\".",
        code: `function StaggerSlideDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible((v) => !v)}>{visible ? "Ẩn" : "Hiện"}</Button>
      <div className="flex gap-2">
        <Stagger visible={visible} itemDelay="fast">
          {["桜", "幽", "玄", "和", "風"].map((ch) => (
            <Slide key={ch} visible from="bottom">
              <div className="flex size-12 items-center justify-center rounded-large bg-brand-background-2 text-title3 text-brand-foreground-2">
                {ch}
              </div>
            </Slide>
          ))}
        </Stagger>
      </div>
    </div>
  );
}`,
        render: () => <StaggerSlideDemo />,
      },
      {
        title: "appear với Scale",
        description: "Lưới ô lần lượt phóng ra ngay khi gắn vào trang.",
        code: `function StaggerAppearDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button icon={<ArrowClockwise20Regular />} onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </Button>
      <div key={run} className="grid grid-cols-4 gap-2">
        <Stagger visible appear itemDelay="faster">
          {Array.from({ length: 8 }, (_, i) => (
            <Scale key={i} visible>
              <div className="size-12 rounded-medium bg-background-1 shadow-4" />
            </Scale>
          ))}
        </Stagger>
      </div>
    </div>
  );
}`,
        render: () => <StaggerAppearDemo />,
      },
    ],
    dos: ["Dùng cho danh sách ngắn (≤ 10 mục) để tạo nhịp khi nội dung xuất hiện.", "Giữ itemDelay ngắn (faster/fast)."],
    donts: ["Không stagger danh sách dài hoặc dữ liệu cập nhật liên tục.", "Không bắt người dùng chờ animation xong mới thao tác được."],
    props: [
      { name: "visible", type: "boolean", description: "Bật/tắt toàn bộ nhóm." },
      { name: "itemDelay", type: `"faster" | "fast" | "normal" | "gentle" | "slow"`, defaultValue: `"faster"`, description: "Độ trễ giữa hai phần tử (token --duration*)." },
      { name: "appear", type: "boolean", defaultValue: "false", description: "Chạy lần lượt ngay lần gắn đầu." },
      { name: "unmountOnExit", type: "boolean", defaultValue: "false", description: "Truyền cho từng con (nếu con chưa tự đặt)." },
      { name: "children", type: "ReactNode", description: "Presence component hoặc phần tử thường (tự bọc Fade)." },
    ],
  },

  /* ------------------------------------------------------------ VisuallyHidden */
  {
    slug: "visuallyhidden",
    name: "VisuallyHidden",
    category: "Tiện ích",
    lead: "VisuallyHidden ẩn nội dung khỏi màn hình nhưng vẫn để trình đọc màn hình đọc được.",
    description:
      "Áp class sr-only. Dùng asChild để gộp vào phần tử có sẵn; focusable để hiện lại khi nhận focus (skip link). Hằng visuallyHiddenClass dùng được trực tiếp trong className.",
    importCode: `import { VisuallyHidden } from "@/components/ui";`,
    hero: {
      title: "VisuallyHidden",
      code: `<Button iconOnly icon={<Heart20Regular />}>
  <VisuallyHidden>Thêm vào yêu thích</VisuallyHidden>
</Button>`,
      render: () => (
        <Button iconOnly icon={<Heart20Regular />}>
          <VisuallyHidden>Thêm vào yêu thích</VisuallyHidden>
        </Button>
      ),
    },
    examples: [
      {
        title: "Skip link (focusable)",
        description: "Nhấn Tab vào khung ví dụ: nút ẩn hiện ra khi nhận focus.",
        code: `<div className="flex flex-col items-start gap-2">
  <VisuallyHidden asChild focusable>
    <Button appearance="primary">Bỏ qua tới nội dung chính</Button>
  </VisuallyHidden>
  <span className="text-body1 text-foreground-2">Nhấn Tab để thấy nút ẩn.</span>
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-2">
            <VisuallyHidden asChild focusable>
              <Button appearance="primary">Bỏ qua tới nội dung chính</Button>
            </VisuallyHidden>
            <span className="text-body1 text-foreground-2">Nhấn Tab để thấy nút ẩn.</span>
          </div>
        ),
      },
      {
        title: "Bổ sung ngữ cảnh cho liên kết",
        description: "Người nhìn thấy \"Đọc thêm\"; trình đọc màn hình nghe \"Đọc thêm về bản phát hành 2.0\".",
        code: `<p className="text-body1 text-foreground-2">
  Bản phát hành 2.0 đã có.{" "}
  <Link href="#/components/visuallyhidden">
    Đọc thêm<VisuallyHidden> về bản phát hành 2.0</VisuallyHidden>
  </Link>
</p>`,
        render: () => (
          <p className="text-body1 text-foreground-2">
            Bản phát hành 2.0 đã có.{" "}
            <Link href="#/components/visuallyhidden">
              Đọc thêm<VisuallyHidden> về bản phát hành 2.0</VisuallyHidden>
            </Link>
          </p>
        ),
      },
    ],
    dos: ["Dùng cho nhãn của nút chỉ icon, chú thích bảng, ngữ cảnh liên kết.", "Đặt focusable cho skip link."],
    donts: ["Không ẩn nội dung tương tác (trừ skip link focusable).", "Không dùng thay cho aria-label khi phần tử đã hỗ trợ."],
    props: [
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Gộp class sr-only vào phần tử con thay vì render <span>." },
      { name: "focusable", type: "boolean", defaultValue: "false", description: "Hiện lại khi phần tử (hoặc con) nhận focus." },
      { name: "visuallyHiddenClass", type: `"sr-only"`, description: "Hằng class để dùng trực tiếp." },
    ],
  },

  /* ------------------------------------------------------------ AriaLive */
  {
    slug: "arialive",
    name: "AriaLiveAnnouncer",
    category: "Tiện ích",
    lead: "AriaLiveAnnouncer và useAnnounce đọc thông báo động cho người dùng trình đọc màn hình.",
    description:
      "AriaLiveAnnouncer render hai vùng live ẩn (polite và assertive) — gắn một lần ở gốc ứng dụng. useAnnounce() trả về { announce } với announce(message, { politeness, batchId }); thông báo xếp hàng, batchId gộp các thông báo liên tục thành thông báo mới nhất. Không có provider, useAnnounce tự tạo vùng live ở <body>.",
    importCode: `import { AriaLiveAnnouncer, useAnnounce } from "@/components/ui";`,
    hero: {
      title: "useAnnounce",
      code: `function AnnounceDemo() {
  const { announce } = useAnnounce();
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <Button
          appearance="primary"
          icon={<Cart20Regular />}
          onClick={() => {
            const next = count + 1;
            setCount(next);
            announce("Đã thêm vào giỏ. Giỏ hàng có " + next + " sản phẩm.", { batchId: "cart" });
          }}
        >
          Thêm vào giỏ ({count})
        </Button>
        <Button onClick={() => announce("Không thể kết nối máy chủ.", { politeness: "assertive" })}>Báo lỗi</Button>
      </div>
      <span className="text-caption1 text-foreground-3">Bật trình đọc màn hình (Narrator: Ctrl + Win + Enter) để nghe.</span>
    </div>
  );
}`,
      render: () => <AnnounceDemo />,
    },
    examples: [
      {
        title: "Gắn provider ở gốc",
        description: "Bọc ứng dụng trong AriaLiveAnnouncer; mọi component con dùng useAnnounce.",
        code: `function SaveStatus() {
  const { announce } = useAnnounce();
  const [saved, setSaved] = useState(false);
  return (
    <Button
      icon={<Checkmark20Regular />}
      onClick={() => {
        setSaved(true);
        announce("Đã lưu bản nháp lúc " + new Date().toLocaleTimeString("vi-VN"));
      }}
    >
      {saved ? "Đã lưu" : "Lưu bản nháp"}
    </Button>
  );
}

function AnnouncerProviderDemo() {
  return (
    <AriaLiveAnnouncer>
      <SaveStatus />
    </AriaLiveAnnouncer>
  );
}`,
        render: () => <AnnouncerProviderDemo />,
      },
      {
        title: "batchId — gộp thông báo liên tục",
        description: "Gõ nhanh vào ô tìm kiếm: chỉ số kết quả mới nhất được đọc.",
        code: `const fruits = ["Táo", "Chuối", "Cam", "Xoài", "Dứa", "Nho", "Ổi", "Mận", "Mít", "Lê"];

function SearchAnnounceDemo() {
  const { announce } = useAnnounce();
  const [query, setQuery] = useState("");
  const results = fruits.filter((f) => f.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="flex w-72 flex-col gap-2">
      <SearchBox
        aria-label="Tìm trái cây"
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          const count = fruits.filter((f) => f.toLowerCase().includes(value.trim().toLowerCase())).length;
          announce(count + " kết quả", { batchId: "search" });
        }}
      />
      <span className="text-caption1 text-foreground-3">
        {results.length} kết quả: {results.join(", ")}
      </span>
    </div>
  );
}`,
        render: () => <SearchAnnounceDemo />,
      },
    ],
    dos: [
      "Dùng polite cho phản hồi thường (đã lưu, số kết quả); assertive chỉ cho lỗi khẩn.",
      "Thông báo ngắn, đủ nghĩa khi nghe riêng.",
      "Dùng batchId cho sự kiện lặp nhanh (gõ phím, kéo slider).",
    ],
    donts: [
      "Không announce mọi thay đổi nhỏ trên giao diện.",
      "Không dùng thay cho nội dung hiển thị — người nhìn cũng cần thấy phản hồi.",
    ],
    props: [
      { name: "AriaLiveAnnouncer.children", type: "ReactNode", description: "Cây ứng dụng; render kèm hai vùng live ẩn." },
      { name: "useAnnounce()", type: "() => { announce }", description: "Lấy hàm announce (fallback vùng live ở <body> nếu không có provider)." },
      { name: "announce(message, options?)", type: "(string, AnnounceOptions) => void", description: "Đưa thông báo vào hàng đợi." },
      { name: "options.politeness", type: `"polite" | "assertive"`, defaultValue: `"polite"`, description: "Mức ưu tiên đọc." },
      { name: "options.batchId", type: "string", description: "Thông báo cùng batchId đang chờ bị thay bằng thông báo mới." },
    ],
  },

  /* ------------------------------------------------------------ Focus management */
  {
    slug: "focusmanagement",
    name: "Focus management",
    category: "Tiện ích",
    lead: "useArrowNavigationGroup và useFocusableGroup quản lý focus bằng bàn phím cho nhóm phần tử, như Tabster của Fluent.",
    description:
      "useArrowNavigationGroup: roving tabindex — Tab vào/ra nhóm một lần, mũi tên di chuyển giữa các phần tử (axis horizontal / vertical / both / grid), Home/End tới đầu/cuối, circular quay vòng, memorizeCurrent nhớ vị trí; ←/→ tự đảo trong RTL. useFocusableGroup: biến phần tử chứa thành một điểm dừng Tab — Enter để vào trong, Esc để ra; kết hợp hai hook để điều hướng giữa các thẻ. Trải toàn bộ kết quả hook lên phần tử chứa.",
    importCode: `import { useArrowNavigationGroup, useFocusableGroup } from "@/components/ui";`,
    hero: {
      title: "useArrowNavigationGroup",
      code: `function ArrowNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "horizontal", circular: true });
  return (
    <div {...nav} role="toolbar" aria-label="Định dạng" className="flex gap-1 rounded-medium bg-background-1 p-1 shadow-4">
      <Button appearance="subtle" icon={<TextBold20Regular />} aria-label="Đậm" />
      <Button appearance="subtle" icon={<TextItalic20Regular />} aria-label="Nghiêng" />
      <Button appearance="subtle" icon={<TextUnderline20Regular />} aria-label="Gạch chân" />
      <Button appearance="subtle" icon={<TextAlignLeft20Regular />} aria-label="Căn trái" />
    </div>
  );
}`,
      render: () => <ArrowNavDemo />,
    },
    examples: [
      {
        title: "Lưới (grid) & memorizeCurrent",
        description: "↑/↓ đi theo cột thị giác, ←/→ theo thứ tự; Tab ra rồi vào lại sẽ về ô vừa rời.",
        code: `function GridNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "grid", memorizeCurrent: true });
  return (
    <div {...nav} role="group" aria-label="Ứng dụng" className="grid grid-cols-3 gap-2">
      {["Thư", "Lịch", "Danh bạ", "Tệp", "Ghi chú", "Việc cần làm", "Ảnh", "Bản đồ", "Cài đặt"].map((app) => (
        <Button key={app} className="w-28">
          {app}
        </Button>
      ))}
    </div>
  );
}`,
        render: () => <GridNavDemo />,
      },
      {
        title: "Dọc, quay vòng",
        description: "axis=\"vertical\" + circular: ↓ ở mục cuối quay về mục đầu.",
        code: `function VerticalNavDemo() {
  const nav = useArrowNavigationGroup({ axis: "vertical", circular: true });
  return (
    <div {...nav} role="group" aria-label="Thư mục" className="flex w-56 flex-col gap-0.5 rounded-medium bg-background-1 p-1 shadow-4">
      {["Hộp thư đến", "Đã gửi", "Bản nháp", "Lưu trữ"].map((folder) => (
        <Button key={folder} appearance="subtle" className="justify-start">
          {folder}
        </Button>
      ))}
    </div>
  );
}`,
        render: () => <VerticalNavDemo />,
      },
      {
        title: "useFocusableGroup trong nhóm mũi tên",
        description: "←/→ giữa các thẻ; Enter vào trong thẻ, Tab xoay vòng giữa các nút (limited-trap-focus), Esc trở lại thẻ.",
        code: `function FocusableCard({ title }: { title: string }) {
  const group = useFocusableGroup({ tabBehavior: "limited-trap-focus" });
  return (
    <div {...group} role="listitem" aria-label={title} className="flex w-56 flex-col gap-2 rounded-medium bg-background-1 p-3 shadow-4">
      <span className="text-subtitle2 font-semibold">{title}</span>
      <div className="flex gap-1">
        <Button size="small" icon={<Heart20Regular />}>Thích</Button>
        <Button size="small" icon={<Share20Regular />}>Chia sẻ</Button>
      </div>
    </div>
  );
}

function CardGroupDemo() {
  const nav = useArrowNavigationGroup({ axis: "horizontal" });
  return (
    <div {...nav} role="list" aria-label="Bài viết" className="flex gap-3">
      {["Ra mắt Yugen UI", "Bảng màu Sakura"].map((title) => (
        <FocusableCard key={title} title={title} />
      ))}
    </div>
  );
}`,
        render: () => <CardGroupDemo />,
      },
    ],
    dos: [
      "Dùng arrow navigation cho toolbar, danh sách, lưới ô — mọi nhóm có nhiều phần tử cùng loại.",
      "Đặt role và aria-label phù hợp trên phần tử chứa (toolbar, group, list).",
      "Kết hợp useFocusableGroup cho thẻ có nhiều nút bên trong.",
    ],
    donts: [
      "Không bọc ô nhập văn bản trong nhóm mũi tên (mũi tên dành cho con trỏ).",
      "Không tự đặt tabIndex cho phần tử con — hook đã quản lý roving tabindex.",
    ],
    props: [
      { name: "axis", type: `"horizontal" | "vertical" | "both" | "grid"`, defaultValue: `"vertical"`, description: "Phím mũi tên được dùng." },
      { name: "circular", type: "boolean", defaultValue: "false", description: "Quay vòng ở hai đầu." },
      { name: "memorizeCurrent", type: "boolean", defaultValue: "false", description: "Tab quay lại nhóm về phần tử focus gần nhất." },
      { name: "tabbable", type: "boolean", defaultValue: "false", description: "Giữ mọi phần tử trong thứ tự Tab (tắt roving tabindex)." },
      { name: "role", type: "AriaRole", description: "Trả kèm role trong object props." },
      {
        name: "useFocusableGroup({ tabBehavior })",
        type: `"limited" | "limited-trap-focus" | "unlimited"`,
        defaultValue: `"limited"`,
        description: "limited: Enter vào, Esc ra · trap: Tab xoay vòng bên trong · unlimited: Tab đi xuyên qua.",
      },
      { name: "Kết quả hook", type: "{ ref, onKeyDown, onFocus, onBlur, … }", description: "Trải lên phần tử chứa; tự gộp nếu cần thêm handler riêng." },
    ],
  },
];

export const docs: ComponentDoc[] = EXTRAS;
