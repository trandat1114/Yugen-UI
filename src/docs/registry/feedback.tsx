import { useEffect, useState } from "react";
import {
  Add20Regular,
  ChevronDown20Regular,
  Dismiss24Regular,
  Filter20Regular,
  FolderOpen24Regular,
  Link16Regular,
  Location16Regular,
  Mail20Regular,
  Navigation20Regular,
  Payment20Regular,
  Person20Regular,
  SearchInfo24Regular,
  ShieldLock20Regular,
} from "@fluentui/react-icons";
import type { DateRange } from "react-day-picker";
import { Avatar, Button, Checkbox, Input } from "@/components/ui";
import { Field } from "@/components/ui/Field/Field";
import { ProgressBar } from "@/components/ui/ProgressBar/ProgressBar";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Skeleton, SkeletonItem } from "@/components/ui/Skeleton/Skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/Empty/Empty";
import { Toaster, useToast, type ToastPosition } from "@/components/ui/Toast/Toast";
import { InfoLabel } from "@/components/ui/InfoLabel/InfoLabel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/HoverCard/HoverCard";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  DrawerTrigger,
  InlineDrawer,
  OverlayDrawer,
  type DrawerPosition,
} from "@/components/ui/Drawer/Drawer";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from "@/components/ui/Accordion/Accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/Collapsible/Collapsible";
import { Calendar } from "@/components/ui/Calendar/Calendar";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker/DatePicker";
import type { ComponentDoc } from "../types";

/* ------------------------------------------------------------------ demos */

function UploadDemo() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((v) => Math.min(v + 0.1, 1)), 400);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (value >= 1) setRunning(false);
  }, [value]);

  const done = value >= 1;

  return (
    <div className="flex w-72 flex-col gap-M">
      <ProgressBar
        value={value}
        color={done ? "success" : "brand"}
        label="Báo cáo Q3.pdf"
        description={done ? "Hoàn tất" : Math.round(value * 100) + "%"}
      />
      <Button
        size="small"
        className="self-start"
        disabled={running}
        onClick={() => {
          setValue(0);
          setRunning(true);
        }}
      >
        {done ? "Tải lại" : "Bắt đầu tải lên"}
      </Button>
    </div>
  );
}

function ToastDemo() {
  const { dispatchToast } = useToast("docs-toast");
  return (
    <>
      <Toaster toasterId="docs-toast" />
      <Button
        appearance="primary"
        onClick={() =>
          dispatchToast({
            intent: "success",
            title: "Đã lưu thay đổi",
            body: "Tài liệu “Kế hoạch Q4” đã được lưu lên đám mây.",
            action: { label: "Hoàn tác" },
          })
        }
      >
        Lưu tài liệu
      </Button>
    </>
  );
}

function ToastIntentDemo() {
  const { dispatchToast } = useToast("docs-toast-intent");
  return (
    <>
      <Toaster toasterId="docs-toast-intent" />
      <Button onClick={() => dispatchToast({ intent: "info", title: "Có bản cập nhật mới", body: "Tải lại trang để dùng phiên bản mới nhất." })}>
        Info
      </Button>
      <Button onClick={() => dispatchToast({ intent: "success", title: "Đã gửi lời mời", body: "3 thành viên sẽ nhận email trong ít phút." })}>
        Success
      </Button>
      <Button onClick={() => dispatchToast({ intent: "warning", title: "Dung lượng sắp đầy", body: "Bạn đã dùng 92% dung lượng lưu trữ." })}>
        Warning
      </Button>
      <Button onClick={() => dispatchToast({ intent: "error", title: "Không thể tải tệp lên", body: "Tệp vượt quá giới hạn 25 MB." })}>
        Error
      </Button>
    </>
  );
}

const TOAST_POSITIONS: ToastPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function ToastPositionDemo() {
  const [position, setPosition] = useState<ToastPosition>("top-end");
  const { dispatchToast } = useToast("docs-toast-position");
  return (
    <>
      <Toaster toasterId="docs-toast-position" position={position} />
      {TOAST_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            dispatchToast({ title: "Vị trí " + p, body: "Vuốt sang ngang (hoặc dọc) để đóng." });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}

function PersistentToastDemo() {
  const { dispatchToast, dismissToast } = useToast("docs-toast-persistent");
  const [id, setId] = useState<string | null>(null);
  return (
    <>
      <Toaster toasterId="docs-toast-persistent" />
      <Button
        onClick={() =>
          setId(
            dispatchToast({
              intent: "warning",
              title: "Mất kết nối mạng",
              body: "Đang thử kết nối lại…",
              timeout: -1,
              onDismiss: () => setId(null),
            }),
          )
        }
      >
        Hiện toast
      </Button>
      <Button appearance="outline" disabled={!id} onClick={() => id && dismissToast(id)}>
        Đóng bằng code
      </Button>
    </>
  );
}

function InlineDrawerDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-80 w-full max-w-2xl overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <InlineDrawer open={open} separator>
        <DrawerHeader>
          <DrawerHeaderTitle>Điều hướng</DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav className="flex flex-col gap-XXS">
            {["Trang chủ", "Tệp của tôi", "Đã chia sẻ", "Thùng rác"].map((item) => (
              <a
                key={item}
                href="#/components/drawer"
                className="rounded-medium px-S py-SNudge text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1"
              >
                {item}
              </a>
            ))}
          </nav>
        </DrawerBody>
      </InlineDrawer>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-M p-L">
        <Button icon={<Navigation20Regular />} onClick={() => setOpen((v) => !v)}>
          {open ? "Ẩn điều hướng" : "Hiện điều hướng"}
        </Button>
        <p className="text-body1 text-foreground-2">Nội dung chính co giãn theo drawer, không bị lớp phủ che.</p>
      </div>
    </div>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button icon={<Filter20Regular />}>Bộ lọc</Button>
      </DrawerTrigger>
      <DrawerSurface position="end" size="small">
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <DrawerClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
              </DrawerClose>
            }
          >
            Bộ lọc
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-M">
            <Checkbox label="Chỉ tệp của tôi" defaultChecked />
            <Checkbox label="Được chia sẻ với tôi" />
            <Checkbox label="Đã gắn sao" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button appearance="primary" onClick={() => setOpen(false)}>
            Áp dụng
          </Button>
          <DrawerClose asChild>
            <Button>Huỷ</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerSurface>
    </Drawer>
  );
}

function DrawerPositionDemo() {
  const [position, setPosition] = useState<DrawerPosition>("start");
  const [open, setOpen] = useState(false);
  const show = (next: DrawerPosition) => {
    setPosition(next);
    setOpen(true);
  };
  return (
    <>
      <Button onClick={() => show("start")}>start</Button>
      <Button onClick={() => show("end")}>end</Button>
      <Button onClick={() => show("bottom")}>bottom</Button>
      <OverlayDrawer open={open} onOpenChange={setOpen} position={position} size={position === "bottom" ? "small" : "medium"}>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <DrawerClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
              </DrawerClose>
            }
          >
            Drawer “{position}”
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-foreground-2">
            Drawer trượt vào từ cạnh {position}. Nhấn Esc hoặc bấm lớp phủ để đóng.
          </p>
        </DrawerBody>
      </OverlayDrawer>
    </>
  );
}

function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-72">
      <ul className="flex flex-col gap-XS text-body1">
        <li className="rounded-medium bg-background-3 px-M py-S">Báo cáo Q3.docx</li>
        <li className="rounded-medium bg-background-3 px-M py-S">Kế hoạch 2027.xlsx</li>
      </ul>
      <CollapsibleContent>
        <ul className="flex flex-col gap-XS pt-XS text-body1">
          <li className="rounded-medium bg-background-3 px-M py-S">Biên bản họp.docx</li>
          <li className="rounded-medium bg-background-3 px-M py-S">Ngân sách.xlsx</li>
          <li className="rounded-medium bg-background-3 px-M py-S">Thiết kế.fig</li>
        </ul>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button
          appearance="transparent"
          className="mt-S"
          iconPosition="after"
          icon={<ChevronDown20Regular className={open ? "rotate-180" : undefined} />}
        >
          {open ? "Thu gọn" : "Hiện thêm 3 mục"}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-medium bg-background-1 p-S shadow-4"
    />
  );
}

function CalendarRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + 4);
    return { from, to };
  });
  return <Calendar mode="range" selected={range} onSelect={setRange} />;
}

function CalendarMultipleDemo() {
  const [days, setDays] = useState<Date[] | undefined>([]);
  return (
    <div className="flex flex-col items-center gap-S">
      <Calendar mode="multiple" selected={days} onSelect={setDays} disabled={{ dayOfWeek: [0, 6] }} />
      <span className="text-caption1 text-foreground-3">Đã chọn {days?.length ?? 0} ngày làm việc</span>
    </div>
  );
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Field label="Ngày bắt đầu" hint="Định dạng dd/MM/yyyy" className="w-72">
      <DatePicker value={date ?? null} onSelectDate={setDate} clearable />
    </Field>
  );
}

function DeliveryDateDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Field
      label="Ngày giao hàng"
      required
      validationState={date ? "success" : "error"}
      validationMessage={date ? "Có thể giao vào ngày này." : "Vui lòng chọn ngày giao (từ hôm nay trở đi)."}
      className="w-72"
    >
      <DatePicker value={date ?? null} onSelectDate={setDate} minDate={new Date()} />
    </Field>
  );
}

/* ------------------------------------------------------------------ docs */

const FEEDBACK: Record<string, ComponentDoc> = {
  progressbar: {
    slug: "progressbar",
    name: "ProgressBar",
    category: "Phản hồi",
    lead: "ProgressBar cho biết tiến độ của một tác vụ đang chạy, dạng xác định (biết phần trăm) hoặc không xác định.",
    description:
      "Dùng cho tác vụ kéo dài hơn vài giây như tải tệp, cài đặt, đồng bộ. Khi biết tổng khối lượng, truyền `value` (0 → max); nếu chưa biết, bỏ `value` để thanh chạy liên tục. Màu ngữ nghĩa (success/warning/error) chỉ dùng để báo kết quả, luôn kèm chữ mô tả.",
    importCode: `import { ProgressBar } from "@/components/ui";`,
    hero: {
      title: "ProgressBar",
      code: `<ProgressBar value={0.6} label="Đang tải tệp lên" description="6 / 10 tệp · còn khoảng 1 phút" rootClassName="w-72" />`,
      render: () => (
        <ProgressBar value={0.6} label="Đang tải tệp lên" description="6 / 10 tệp · còn khoảng 1 phút" rootClassName="w-72" />
      ),
    },
    examples: [
      {
        title: "Không xác định",
        description: "Bỏ `value` khi chưa biết tổng thời gian.",
        code: `<ProgressBar label="Đang đồng bộ thư mục…" rootClassName="w-72" />`,
        render: () => <ProgressBar label="Đang đồng bộ thư mục…" rootClassName="w-72" />,
      },
      {
        title: "Màu, độ dày & hình dạng",
        description: "thickness medium (2px) / large (4px); shape rounded / square.",
        code: `<div className="flex w-72 flex-col gap-L">
  <ProgressBar value={0.4} />
  <ProgressBar value={0.4} thickness="large" />
  <ProgressBar value={1} color="success" thickness="large" />
  <ProgressBar value={0.85} color="warning" thickness="large" />
  <ProgressBar value={0.3} color="error" thickness="large" shape="square" />
</div>`,
        render: () => (
          <div className="flex w-72 flex-col gap-L">
            <ProgressBar value={0.4} />
            <ProgressBar value={0.4} thickness="large" />
            <ProgressBar value={1} color="success" thickness="large" />
            <ProgressBar value={0.85} color="warning" thickness="large" />
            <ProgressBar value={0.3} color="error" thickness="large" shape="square" />
          </div>
        ),
      },
      {
        title: "Cập nhật theo thời gian",
        description: "Đổi sang success khi hoàn tất và cập nhật mô tả tương ứng.",
        code: `function UploadDemo() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((v) => Math.min(v + 0.1, 1)), 400);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (value >= 1) setRunning(false);
  }, [value]);

  const done = value >= 1;

  return (
    <div className="flex w-72 flex-col gap-M">
      <ProgressBar
        value={value}
        color={done ? "success" : "brand"}
        label="Báo cáo Q3.pdf"
        description={done ? "Hoàn tất" : Math.round(value * 100) + "%"}
      />
      <Button
        size="small"
        className="self-start"
        disabled={running}
        onClick={() => {
          setValue(0);
          setRunning(true);
        }}
      >
        {done ? "Tải lại" : "Bắt đầu tải lên"}
      </Button>
    </div>
  );
}`,
        render: () => <UploadDemo />,
      },
    ],
    dos: [
      "Kèm nhãn mô tả tác vụ và (nếu được) thời gian / số lượng còn lại.",
      "Dùng dạng xác định ngay khi biết tổng khối lượng công việc.",
      "Chuyển màu success / error khi tác vụ kết thúc, kèm chữ giải thích.",
    ],
    donts: [
      "Không dùng cho tác vụ dưới 1–2 giây — dùng Spinner hoặc không hiển thị gì.",
      "Không cho thanh lùi lại hay đứng yên lâu ở 99%.",
      "Không dùng màu làm tín hiệu duy nhất cho lỗi.",
    ],
    props: [
      { name: "value", type: "number", description: "Giá trị 0 → max. Bỏ trống = indeterminate." },
      { name: "max", type: "number", defaultValue: "1", description: "Giá trị tối đa." },
      { name: "thickness", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Độ dày 2px / 4px." },
      { name: "shape", type: `"rounded" | "square"`, defaultValue: `"rounded"`, description: "Bo tròn hay vuông hai đầu." },
      { name: "color", type: `"brand" | "success" | "warning" | "error"`, defaultValue: `"brand"`, description: "Màu thanh tiến độ." },
      { name: "label / description", type: "ReactNode", description: "Nhãn phía trên và mô tả phía dưới (tự gắn aria)." },
      { name: "rootClassName", type: "string", description: "Class cho khối ngoài khi có label / description." },
    ],
  },

  spinner: {
    slug: "spinner",
    name: "Spinner",
    category: "Phản hồi",
    lead: "Spinner cho biết hệ thống đang xử lý một tác vụ chưa rõ thời gian hoàn tất.",
    description:
      "Dùng khi nội dung đang tải hoặc một hành động đang chờ phản hồi. Có 8 kích thước từ 16 tới 44px, nhãn đặt trước / sau / trên / dưới, và bản inverted cho nền tối hoặc nền brand.",
    importCode: `import { Spinner } from "@/components/ui";`,
    hero: {
      title: "Spinner",
      code: `<Spinner label="Đang tải dữ liệu…" />`,
      render: () => <Spinner label="Đang tải dữ liệu…" />,
    },
    examples: [
      {
        title: "Kích thước",
        description: "extra-tiny 16 → huge 44px.",
        code: `<Spinner size="extra-tiny" />
<Spinner size="tiny" />
<Spinner size="extra-small" />
<Spinner size="small" />
<Spinner size="medium" />
<Spinner size="large" />
<Spinner size="extra-large" />
<Spinner size="huge" />`,
        render: () => (
          <>
            <Spinner size="extra-tiny" />
            <Spinner size="tiny" />
            <Spinner size="extra-small" />
            <Spinner size="small" />
            <Spinner size="medium" />
            <Spinner size="large" />
            <Spinner size="extra-large" />
            <Spinner size="huge" />
          </>
        ),
      },
      {
        title: "Vị trí nhãn",
        description: "before, after (mặc định), above, below.",
        code: `<Spinner size="small" label="Trước" labelPosition="before" />
<Spinner size="small" label="Sau" labelPosition="after" />
<Spinner size="small" label="Trên" labelPosition="above" />
<Spinner size="small" label="Dưới" labelPosition="below" />`,
        render: () => (
          <>
            <Spinner size="small" label="Trước" labelPosition="before" />
            <Spinner size="small" label="Sau" labelPosition="after" />
            <Spinner size="small" label="Trên" labelPosition="above" />
            <Spinner size="small" label="Dưới" labelPosition="below" />
          </>
        ),
      },
      {
        title: "Inverted",
        description: "Dùng trên nền brand hoặc nền tối.",
        code: `<div className="flex items-center rounded-medium bg-brand-background px-L py-M">
  <Spinner appearance="inverted" size="tiny" label="Đang gửi…" />
</div>`,
        render: () => (
          <div className="flex items-center rounded-medium bg-brand-background px-L py-M">
            <Spinner appearance="inverted" size="tiny" label="Đang gửi…" />
          </div>
        ),
      },
    ],
    dos: [
      "Đặt Spinner gần vùng nội dung đang tải.",
      "Thêm nhãn ngắn mô tả việc đang làm khi chờ lâu hơn vài giây.",
      "Chọn kích thước tương xứng với vùng chứa (nút nhỏ → tiny, cả trang → large).",
    ],
    donts: [
      "Không hiển thị nhiều Spinner cùng lúc trên một màn hình.",
      "Không dùng khi biết tiến độ — dùng ProgressBar.",
      "Không dùng bản inverted trên nền sáng.",
    ],
    props: [
      {
        name: "size",
        type: `"extra-tiny" | "tiny" | "extra-small" | "small" | "medium" | "large" | "extra-large" | "huge"`,
        defaultValue: `"medium"`,
        description: "16 / 20 / 24 / 28 / 32 / 36 / 40 / 44px.",
      },
      { name: "appearance", type: `"primary" | "inverted"`, defaultValue: `"primary"`, description: "Màu cung và rãnh." },
      { name: "label", type: "ReactNode", description: "Nhãn (liên kết aria-labelledby). Không có nhãn → aria-label “Đang tải”." },
      { name: "labelPosition", type: `"before" | "after" | "above" | "below"`, defaultValue: `"after"`, description: "Vị trí nhãn." },
    ],
  },

  skeleton: {
    slug: "skeleton",
    name: "Skeleton",
    category: "Phản hồi",
    lead: "Skeleton là bản phác hình khối của nội dung sắp hiển thị, giúp giảm cảm giác chờ đợi khi tải.",
    description:
      "Skeleton bọc các SkeletonItem và phát tín hiệu aria-busy. Ghép SkeletonItem (rectangle / circle / square, cao 8 → 128px) theo đúng bố cục nội dung thật. Hiệu ứng wave hoặc pulse tự tắt khi người dùng bật giảm chuyển động.",
    importCode: `import { Skeleton, SkeletonItem } from "@/components/ui";`,
    hero: {
      title: "Skeleton",
      code: `<Skeleton className="w-80" aria-label="Đang tải bài viết">
  <div className="flex items-center gap-M">
    <SkeletonItem shape="circle" size={40} />
    <div className="flex flex-1 flex-col gap-S">
      <SkeletonItem size={12} className="w-1/2" />
      <SkeletonItem size={12} className="w-1/3" />
    </div>
  </div>
  <SkeletonItem size={96} />
  <SkeletonItem size={12} />
  <SkeletonItem size={12} className="w-4/5" />
</Skeleton>`,
      render: () => (
        <Skeleton className="w-80" aria-label="Đang tải bài viết">
          <div className="flex items-center gap-M">
            <SkeletonItem shape="circle" size={40} />
            <div className="flex flex-1 flex-col gap-S">
              <SkeletonItem size={12} className="w-1/2" />
              <SkeletonItem size={12} className="w-1/3" />
            </div>
          </div>
          <SkeletonItem size={96} />
          <SkeletonItem size={12} />
          <SkeletonItem size={12} className="w-4/5" />
        </Skeleton>
      ),
    },
    examples: [
      {
        title: "Pulse",
        description: "Nhấp nháy độ mờ thay cho dải sáng.",
        code: `<Skeleton animation="pulse" className="w-72">
  <SkeletonItem size={16} className="w-2/3" />
  <SkeletonItem size={12} />
  <SkeletonItem size={12} className="w-5/6" />
</Skeleton>`,
        render: () => (
          <Skeleton animation="pulse" className="w-72">
            <SkeletonItem size={16} className="w-2/3" />
            <SkeletonItem size={12} />
            <SkeletonItem size={12} className="w-5/6" />
          </Skeleton>
        ),
      },
      {
        title: "Hình dạng",
        description: "circle, square, rectangle.",
        code: `<Skeleton className="flex-row items-center gap-L">
  <SkeletonItem shape="circle" size={48} />
  <SkeletonItem shape="square" size={48} />
  <SkeletonItem shape="rectangle" size={48} className="w-32" />
</Skeleton>`,
        render: () => (
          <Skeleton className="flex-row items-center gap-L">
            <SkeletonItem shape="circle" size={48} />
            <SkeletonItem shape="square" size={48} />
            <SkeletonItem shape="rectangle" size={48} className="w-32" />
          </Skeleton>
        ),
      },
      {
        title: "Translucent",
        description: "Bán trong suốt, dùng trên bề mặt có màu nền.",
        code: `<div className="rounded-xlarge bg-background-4 p-L">
  <Skeleton appearance="translucent" className="w-64">
    <SkeletonItem shape="square" size={64} />
    <SkeletonItem size={12} />
    <SkeletonItem size={12} className="w-3/4" />
  </Skeleton>
</div>`,
        render: () => (
          <div className="rounded-xlarge bg-background-4 p-L">
            <Skeleton appearance="translucent" className="w-64">
              <SkeletonItem shape="square" size={64} />
              <SkeletonItem size={12} />
              <SkeletonItem size={12} className="w-3/4" />
            </Skeleton>
          </div>
        ),
      },
    ],
    dos: [
      "Mô phỏng sát bố cục thật (avatar tròn, dòng tiêu đề ngắn hơn dòng nội dung).",
      "Đặt aria-label mô tả nội dung đang tải trên Skeleton.",
    ],
    donts: [
      "Không dùng Skeleton cho thao tác của người dùng (lưu, gửi) — dùng Spinner.",
      "Không để Skeleton hiển thị mãi khi tải lỗi — thay bằng thông báo lỗi.",
      "Không trộn wave và pulse trong cùng một vùng.",
    ],
    props: [
      { name: "Skeleton.animation", type: `"wave" | "pulse"`, defaultValue: `"wave"`, description: "Hiệu ứng cho mọi SkeletonItem con." },
      { name: "Skeleton.appearance", type: `"opaque" | "translucent"`, defaultValue: `"opaque"`, description: "Nền đặc hay bán trong suốt." },
      { name: "SkeletonItem.shape", type: `"rectangle" | "circle" | "square"`, defaultValue: `"rectangle"`, description: "Hình dạng khối." },
      {
        name: "SkeletonItem.size",
        type: "8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128",
        defaultValue: "16",
        description: "Chiều cao (rectangle) hoặc cạnh (circle / square), px.",
      },
      { name: "SkeletonItem.animation / appearance", type: "—", description: "Ghi đè giá trị của Skeleton cha." },
    ],
  },

  empty: {
    slug: "empty",
    name: "Empty",
    category: "Phản hồi",
    lead: "Empty hiển thị trạng thái trống khi chưa có dữ liệu, kèm lời giải thích và hành động tiếp theo.",
    description:
      "Ghép từ EmptyHeader, EmptyMedia (icon trong ô 48px hoặc Avatar), EmptyTitle, EmptyDescription và EmptyContent chứa hành động. Bản outline có viền nét đứt, hợp với vùng nội dung trống trong trang hoặc vùng thả tệp.",
    importCode: `import {
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent,
} from "@/components/ui";`,
    hero: {
      title: "Empty",
      code: `<Empty variant="outline" className="max-w-md">
  <EmptyHeader>
    <EmptyMedia>
      <FolderOpen24Regular />
    </EmptyMedia>
    <EmptyTitle>Chưa có dự án nào</EmptyTitle>
    <EmptyDescription>Bạn chưa tạo dự án nào. Hãy bắt đầu bằng dự án đầu tiên hoặc nhập từ tệp có sẵn.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button appearance="primary" icon={<Add20Regular />}>Tạo dự án</Button>
    <Button>Nhập dự án</Button>
  </EmptyContent>
</Empty>`,
      render: () => (
        <Empty variant="outline" className="max-w-md">
          <EmptyHeader>
            <EmptyMedia>
              <FolderOpen24Regular />
            </EmptyMedia>
            <EmptyTitle>Chưa có dự án nào</EmptyTitle>
            <EmptyDescription>Bạn chưa tạo dự án nào. Hãy bắt đầu bằng dự án đầu tiên hoặc nhập từ tệp có sẵn.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button appearance="primary" icon={<Add20Regular />}>
              Tạo dự án
            </Button>
            <Button>Nhập dự án</Button>
          </EmptyContent>
        </Empty>
      ),
    },
    examples: [
      {
        title: "Không có kết quả",
        description: "Biến thể default (không viền) trong trang tìm kiếm.",
        code: `<Empty>
  <EmptyHeader>
    <EmptyMedia>
      <SearchInfo24Regular />
    </EmptyMedia>
    <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
    <EmptyDescription>Thử từ khoá khác hoặc bỏ bớt bộ lọc đang áp dụng.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button appearance="subtle">Xoá bộ lọc</Button>
  </EmptyContent>
</Empty>`,
        render: () => (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <SearchInfo24Regular />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
              <EmptyDescription>Thử từ khoá khác hoặc bỏ bớt bộ lọc đang áp dụng.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button appearance="subtle">Xoá bộ lọc</Button>
            </EmptyContent>
          </Empty>
        ),
      },
      {
        title: "Với Avatar",
        description: "EmptyMedia variant=\"default\" để đặt Avatar hoặc ảnh minh hoạ.",
        code: `<Empty>
  <EmptyHeader>
    <EmptyMedia variant="default">
      <Avatar name="Nguyễn Minh Anh" size={64} color="colorful" />
    </EmptyMedia>
    <EmptyTitle>Minh Anh đang ngoại tuyến</EmptyTitle>
    <EmptyDescription>Để lại lời nhắn, bạn ấy sẽ thấy khi quay lại.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button icon={<Mail20Regular />}>Để lại lời nhắn</Button>
  </EmptyContent>
</Empty>`,
        render: () => (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="default">
                <Avatar name="Nguyễn Minh Anh" size={64} color="colorful" />
              </EmptyMedia>
              <EmptyTitle>Minh Anh đang ngoại tuyến</EmptyTitle>
              <EmptyDescription>Để lại lời nhắn, bạn ấy sẽ thấy khi quay lại.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button icon={<Mail20Regular />}>Để lại lời nhắn</Button>
            </EmptyContent>
          </Empty>
        ),
      },
    ],
    dos: [
      "Giải thích vì sao trống và người dùng nên làm gì tiếp theo.",
      "Đưa ra tối đa 1 hành động chính (primary) và 1 hành động phụ.",
      "Dùng icon gợi đúng ngữ cảnh (thư mục, tìm kiếm, hộp thư…).",
    ],
    donts: [
      "Không chỉ ghi “Không có dữ liệu” mà không có hướng dẫn.",
      "Không dùng màu brand hay gradient lớn cho ô icon.",
      "Không dùng Empty cho lỗi tải — dùng MessageBar intent error.",
    ],
    props: [
      { name: "Empty.variant", type: `"default" | "outline"`, defaultValue: `"default"`, description: "outline: viền nét đứt stroke-1, bo 12px." },
      { name: "EmptyMedia.variant", type: `"icon" | "default"`, defaultValue: `"icon"`, description: "icon: ô 48px nền background-4; default: giữ nguyên (Avatar, ảnh)." },
      { name: "EmptyTitle", type: "ReactNode", description: "Tiêu đề subtitle1 semibold." },
      { name: "EmptyDescription", type: "ReactNode", description: "Mô tả body1 foreground-3; link bên trong tự tô màu link." },
      { name: "EmptyContent", type: "ReactNode", description: "Vùng hành động (Button, Link)." },
    ],
  },

  toast: {
    slug: "toast",
    name: "Toast",
    category: "Phản hồi",
    lead: "Toast là thông báo ngắn, không chặn thao tác, xuất hiện ở góc màn hình rồi tự biến mất.",
    description:
      "Đặt `<Toaster />` một lần ở gốc ứng dụng, rồi gọi `dispatchToast` từ `useToast()` (hoặc helper `toast()`). Mỗi toast có intent (info / success / warning / error) với icon giống MessageBar, tiêu đề, nội dung, một hành động và nút đóng. Vuốt để đóng; trỏ chuột vào sẽ tạm dừng đếm giờ; F8 để focus vùng thông báo.",
    importCode: `import { Toaster, useToast, toast } from "@/components/ui";`,
    hero: {
      title: "Toast",
      code: `function ToastDemo() {
  const { dispatchToast } = useToast("docs-toast");
  return (
    <>
      <Toaster toasterId="docs-toast" />
      <Button
        appearance="primary"
        onClick={() =>
          dispatchToast({
            intent: "success",
            title: "Đã lưu thay đổi",
            body: "Tài liệu “Kế hoạch Q4” đã được lưu lên đám mây.",
            action: { label: "Hoàn tác" },
          })
        }
      >
        Lưu tài liệu
      </Button>
    </>
  );
}`,
      render: () => <ToastDemo />,
    },
    examples: [
      {
        title: "Intent",
        description: "info, success, warning, error — cùng icon và màu với MessageBar.",
        code: `function ToastIntentDemo() {
  const { dispatchToast } = useToast("docs-toast-intent");
  return (
    <>
      <Toaster toasterId="docs-toast-intent" />
      <Button onClick={() => dispatchToast({ intent: "info", title: "Có bản cập nhật mới", body: "Tải lại trang để dùng phiên bản mới nhất." })}>
        Info
      </Button>
      <Button onClick={() => dispatchToast({ intent: "success", title: "Đã gửi lời mời", body: "3 thành viên sẽ nhận email trong ít phút." })}>
        Success
      </Button>
      <Button onClick={() => dispatchToast({ intent: "warning", title: "Dung lượng sắp đầy", body: "Bạn đã dùng 92% dung lượng lưu trữ." })}>
        Warning
      </Button>
      <Button onClick={() => dispatchToast({ intent: "error", title: "Không thể tải tệp lên", body: "Tệp vượt quá giới hạn 25 MB." })}>
        Error
      </Button>
    </>
  );
}`,
        render: () => <ToastIntentDemo />,
      },
      {
        title: "Vị trí",
        description: "Toaster position: top-start, top, top-end, bottom-start, bottom, bottom-end (mặc định).",
        code: `const TOAST_POSITIONS: ToastPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function ToastPositionDemo() {
  const [position, setPosition] = useState<ToastPosition>("top-end");
  const { dispatchToast } = useToast("docs-toast-position");
  return (
    <>
      <Toaster toasterId="docs-toast-position" position={position} />
      {TOAST_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            dispatchToast({ title: "Vị trí " + p, body: "Vuốt sang ngang (hoặc dọc) để đóng." });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}`,
        render: () => <ToastPositionDemo />,
      },
      {
        title: "Không tự đóng & đóng bằng code",
        description: "timeout: -1 giữ toast tới khi người dùng hoặc code đóng.",
        code: `function PersistentToastDemo() {
  const { dispatchToast, dismissToast } = useToast("docs-toast-persistent");
  const [id, setId] = useState<string | null>(null);
  return (
    <>
      <Toaster toasterId="docs-toast-persistent" />
      <Button
        onClick={() =>
          setId(
            dispatchToast({
              intent: "warning",
              title: "Mất kết nối mạng",
              body: "Đang thử kết nối lại…",
              timeout: -1,
              onDismiss: () => setId(null),
            }),
          )
        }
      >
        Hiện toast
      </Button>
      <Button appearance="outline" disabled={!id} onClick={() => id && dismissToast(id)}>
        Đóng bằng code
      </Button>
    </>
  );
}`,
        render: () => <PersistentToastDemo />,
      },
    ],
    dos: [
      "Dùng cho phản hồi ngắn sau hành động: đã lưu, đã gửi, đã xoá (kèm Hoàn tác).",
      "Giữ tiêu đề ngắn gọn; nội dung tối đa 1–2 dòng.",
      "Lỗi cần xử lý ngay nên để timeout -1 hoặc dùng MessageBar / Dialog.",
    ],
    donts: [
      "Không đặt thông tin quan trọng duy nhất trong toast — nó sẽ biến mất.",
      "Không hiển thị dồn dập nhiều toast cho cùng một sự kiện.",
      "Không đặt form hay nhiều hành động trong toast.",
    ],
    props: [
      { name: "Toaster.position", type: `"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"`, defaultValue: `"bottom-end"`, description: "Vị trí vùng thông báo." },
      { name: "Toaster.toasterId", type: "string", description: "Định danh khi có nhiều Toaster; dùng cùng useToast(toasterId)." },
      { name: "Toaster.limit", type: "number", defaultValue: "5", description: "Số toast hiển thị cùng lúc." },
      { name: "useToast(toasterId?)", type: "{ dispatchToast, dismissToast, dismissAllToasts }", description: "API mệnh lệnh; dispatchToast trả về id." },
      { name: "intent", type: `"info" | "success" | "warning" | "error"`, defaultValue: `"info"`, description: "Icon và màu icon." },
      { name: "title / body", type: "ReactNode", description: "Tiêu đề (body1 semibold) và nội dung." },
      { name: "action", type: "{ label: string; altText?: string; onClick?: () => void }", description: "Hành động dạng link ở góc phải tiêu đề." },
      { name: "timeout", type: "number", defaultValue: "3000", description: "Thời gian tự đóng (ms); -1 = không tự đóng." },
      { name: "toastId / onDismiss / hideDismiss", type: "string / () => void / boolean", description: "id cố định, callback khi đóng, ẩn nút X." },
    ],
  },

  infolabel: {
    slug: "infolabel",
    name: "InfoLabel",
    category: "Phản hồi",
    lead: "InfoLabel là nhãn kèm nút thông tin nhỏ, mở Popover giải thích thêm cho trường nhập liệu.",
    description:
      "Dùng khi trường cần giải thích ngắn nhưng không muốn chiếm chỗ bằng hint cố định. Nút (i) bật Popover khi bấm hoặc nhấn Enter / Space, icon chuyển sang dạng filled khi hover hoặc đang mở.",
    importCode: `import { InfoLabel } from "@/components/ui";`,
    hero: {
      title: "InfoLabel",
      code: `<div className="flex w-72 flex-col gap-XS">
  <InfoLabel htmlFor="infolabel-email" info="Email này dùng để khôi phục mật khẩu và nhận cảnh báo bảo mật.">
    Email khôi phục
  </InfoLabel>
  <Input id="infolabel-email" type="email" placeholder="ten@congty.vn" />
</div>`,
      render: () => (
        <div className="flex w-72 flex-col gap-XS">
          <InfoLabel htmlFor="infolabel-email" info="Email này dùng để khôi phục mật khẩu và nhận cảnh báo bảo mật.">
            Email khôi phục
          </InfoLabel>
          <Input id="infolabel-email" type="email" placeholder="ten@congty.vn" />
        </div>
      ),
    },
    examples: [
      {
        title: "Kích thước & độ đậm",
        description: "small, medium (mặc định), large; weight regular / semibold.",
        code: `<InfoLabel size="small" info="Nhãn cỡ small.">Small</InfoLabel>
<InfoLabel info="Nhãn cỡ medium (mặc định).">Medium</InfoLabel>
<InfoLabel size="large" weight="semibold" info="Nhãn cỡ large, chữ đậm.">Large semibold</InfoLabel>`,
        render: () => (
          <>
            <InfoLabel size="small" info="Nhãn cỡ small.">
              Small
            </InfoLabel>
            <InfoLabel info="Nhãn cỡ medium (mặc định).">Medium</InfoLabel>
            <InfoLabel size="large" weight="semibold" info="Nhãn cỡ large, chữ đậm.">
              Large semibold
            </InfoLabel>
          </>
        ),
      },
      {
        title: "Bắt buộc & nội dung có link",
        description: "info nhận ReactNode, có thể chứa liên kết.",
        code: `<InfoLabel
  required
  info={
    <>
      Mã số thuế gồm 10 hoặc 13 chữ số.{" "}
      <a href="#/components/infolabel" className="text-link underline hover:text-link-hover">
        Tìm hiểu thêm
      </a>
    </>
  }
>
  Mã số thuế
</InfoLabel>`,
        render: () => (
          <InfoLabel
            required
            info={
              <>
                Mã số thuế gồm 10 hoặc 13 chữ số.{" "}
                <a href="#/components/infolabel" className="text-link underline hover:text-link-hover">
                  Tìm hiểu thêm
                </a>
              </>
            }
          >
            Mã số thuế
          </InfoLabel>
        ),
      },
    ],
    dos: [
      "Giữ nội dung Popover ngắn (1–3 câu), bổ sung cho nhãn chứ không lặp lại.",
      "Dùng htmlFor để nhãn vẫn liên kết với ô nhập.",
    ],
    donts: [
      "Không đặt thông tin bắt buộc phải đọc mới điền được vào Popover — dùng hint.",
      "Không đặt form hay nhiều hành động trong nội dung info.",
    ],
    props: [
      { name: "info", type: "ReactNode", description: "Nội dung Popover." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ nhãn và nút." },
      { name: "weight", type: `"regular" | "semibold"`, defaultValue: `"regular"`, description: "Độ đậm nhãn." },
      { name: "required / disabled", type: "boolean", description: "Dấu * đỏ; chữ disabled." },
      { name: "infoButtonLabel", type: "string", defaultValue: `"Thông tin"`, description: "aria-label cho nút (i)." },
      { name: "htmlFor, …", type: "LabelHTMLAttributes", description: "Truyền cho phần tử <label>." },
    ],
  },

  hovercard: {
    slug: "hovercard",
    name: "HoverCard",
    category: "Bề mặt & overlay",
    lead: "HoverCard hiển thị bản xem trước nội dung phía sau một liên kết khi người dùng trỏ chuột vào.",
    description:
      "Dành cho người dùng chuột muốn xem nhanh hồ sơ, kho mã, tài liệu… trước khi mở. Bề mặt dùng chung class với Popover (shadow-16, rounded-medium). Nội dung chỉ mang tính bổ sung vì người dùng bàn phím / cảm ứng có thể không thấy.",
    importCode: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui";`,
    hero: {
      title: "HoverCard",
      code: `<div className="text-body1 text-foreground-2">
  Bản thiết kế đã được duyệt bởi{" "}
  <HoverCard>
    <HoverCardTrigger asChild>
      <a href="#/components/hovercard" className="font-semibold text-link hover:text-link-hover hover:underline">
        @minhanh
      </a>
    </HoverCardTrigger>
    <HoverCardContent>
      <div className="flex gap-M">
        <Avatar name="Nguyễn Minh Anh" size={48} color="colorful" presence="available" />
        <div className="flex min-w-0 flex-col gap-XXS">
          <span className="text-subtitle2 font-semibold text-foreground-1">Nguyễn Minh Anh</span>
          <span className="text-caption1 text-foreground-3">Trưởng nhóm thiết kế · Yugen Studio</span>
          <p className="mt-XS text-body1 text-foreground-2">Phụ trách hệ thống thiết kế và thư viện component cho sản phẩm web.</p>
          <span className="mt-XS flex items-center gap-XS text-caption1 text-foreground-3">
            <Location16Regular /> Hà Nội, Việt Nam
          </span>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</div>`,
      render: () => (
        <div className="text-body1 text-foreground-2">
          Bản thiết kế đã được duyệt bởi{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <a href="#/components/hovercard" className="font-semibold text-link hover:text-link-hover hover:underline">
                @minhanh
              </a>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex gap-M">
                <Avatar name="Nguyễn Minh Anh" size={48} color="colorful" presence="available" />
                <div className="flex min-w-0 flex-col gap-XXS">
                  <span className="text-subtitle2 font-semibold text-foreground-1">Nguyễn Minh Anh</span>
                  <span className="text-caption1 text-foreground-3">Trưởng nhóm thiết kế · Yugen Studio</span>
                  <p className="mt-XS text-body1 text-foreground-2">
                    Phụ trách hệ thống thiết kế và thư viện component cho sản phẩm web.
                  </p>
                  <span className="mt-XS flex items-center gap-XS text-caption1 text-foreground-3">
                    <Location16Regular /> Hà Nội, Việt Nam
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      ),
    },
    examples: [
      {
        title: "Độ trễ, vị trí & mũi tên",
        description: "openDelay / closeDelay (ms), side, withArrow.",
        code: `<HoverCard openDelay={200} closeDelay={100}>
  <HoverCardTrigger asChild>
    <a href="#/components/hovercard" className="inline-flex items-center gap-XS text-body1 text-link hover:text-link-hover hover:underline">
      <Link16Regular /> yugen-ui/components
    </a>
  </HoverCardTrigger>
  <HoverCardContent side="top" withArrow className="w-72">
    <div className="flex flex-col gap-XS">
      <span className="text-body1 font-semibold">yugen-ui/components</span>
      <span className="text-caption1 text-foreground-3">Thư viện component React theo Fluent 2 · cập nhật 2 ngày trước.</span>
    </div>
  </HoverCardContent>
</HoverCard>`,
        render: () => (
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <a
                href="#/components/hovercard"
                className="inline-flex items-center gap-XS text-body1 text-link hover:text-link-hover hover:underline"
              >
                <Link16Regular /> yugen-ui/components
              </a>
            </HoverCardTrigger>
            <HoverCardContent side="top" withArrow className="w-72">
              <div className="flex flex-col gap-XS">
                <span className="text-body1 font-semibold">yugen-ui/components</span>
                <span className="text-caption1 text-foreground-3">
                  Thư viện component React theo Fluent 2 · cập nhật 2 ngày trước.
                </span>
              </div>
            </HoverCardContent>
          </HoverCard>
        ),
      },
    ],
    dos: [
      "Dùng cho xem trước nội dung của liên kết (hồ sơ, tài liệu, kho mã).",
      "Giữ nội dung ngắn, có thể đọc lướt.",
    ],
    donts: [
      "Không đặt hành động quan trọng chỉ có trong HoverCard — bàn phím / cảm ứng khó truy cập.",
      "Không dùng thay cho Tooltip (nhãn ngắn) hay Popover (nội dung tương tác khi bấm).",
    ],
    props: [
      { name: "HoverCard.openDelay / closeDelay", type: "number", defaultValue: "700 / 300", description: "Độ trễ mở / đóng (ms)." },
      { name: "HoverCard.open / onOpenChange", type: "boolean / (open) => void", description: "Điều khiển trạng thái." },
      { name: "HoverCardContent.side / align", type: `"top" | "right" | "bottom" | "left" / "start" | "center" | "end"`, defaultValue: `"bottom" / "center"`, description: "Vị trí so với trigger." },
      { name: "HoverCardContent.withArrow", type: "boolean", defaultValue: "false", description: "Hiện mũi tên." },
    ],
  },

  drawer: {
    slug: "drawer",
    name: "Drawer",
    category: "Bề mặt & overlay",
    lead: "Drawer là bề mặt trượt vào từ cạnh màn hình, chứa điều hướng, bộ lọc hoặc nội dung phụ của trang.",
    description:
      "Có hai kiểu: overlay (modal, có lớp phủ, dựng trên Radix Dialog — Drawer + DrawerSurface hoặc OverlayDrawer) và InlineDrawer nằm trong bố cục, đẩy nội dung bên cạnh. Vị trí start / end / bottom; kích thước small 320, medium 592, large 940 hoặc full. Bên trong dùng DrawerHeader, DrawerHeaderTitle, DrawerBody (cuộn) và DrawerFooter.",
    importCode: `import {
  Drawer, DrawerTrigger, DrawerClose, DrawerSurface, OverlayDrawer, InlineDrawer,
  DrawerHeader, DrawerHeaderTitle, DrawerBody, DrawerFooter,
} from "@/components/ui";`,
    hero: {
      title: "InlineDrawer",
      code: `function InlineDrawerDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-80 w-full max-w-2xl overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <InlineDrawer open={open} separator>
        <DrawerHeader>
          <DrawerHeaderTitle>Điều hướng</DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav className="flex flex-col gap-XXS">
            {["Trang chủ", "Tệp của tôi", "Đã chia sẻ", "Thùng rác"].map((item) => (
              <a
                key={item}
                href="#/components/drawer"
                className="rounded-medium px-S py-SNudge text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1"
              >
                {item}
              </a>
            ))}
          </nav>
        </DrawerBody>
      </InlineDrawer>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-M p-L">
        <Button icon={<Navigation20Regular />} onClick={() => setOpen((v) => !v)}>
          {open ? "Ẩn điều hướng" : "Hiện điều hướng"}
        </Button>
        <p className="text-body1 text-foreground-2">Nội dung chính co giãn theo drawer, không bị lớp phủ che.</p>
      </div>
    </div>
  );
}`,
      render: () => <InlineDrawerDemo />,
    },
    examples: [
      {
        title: "Overlay drawer",
        description: "Modal, có lớp phủ; nút chính đặt trước nút Huỷ ở footer.",
        code: `function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button icon={<Filter20Regular />}>Bộ lọc</Button>
      </DrawerTrigger>
      <DrawerSurface position="end" size="small">
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <DrawerClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
              </DrawerClose>
            }
          >
            Bộ lọc
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-M">
            <Checkbox label="Chỉ tệp của tôi" defaultChecked />
            <Checkbox label="Được chia sẻ với tôi" />
            <Checkbox label="Đã gắn sao" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button appearance="primary" onClick={() => setOpen(false)}>
            Áp dụng
          </Button>
          <DrawerClose asChild>
            <Button>Huỷ</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerSurface>
    </Drawer>
  );
}`,
        render: () => <DrawerDemo />,
      },
      {
        title: "Vị trí & kích thước",
        description: "OverlayDrawer gộp Drawer + DrawerSurface; position start / end / bottom.",
        code: `function DrawerPositionDemo() {
  const [position, setPosition] = useState<DrawerPosition>("start");
  const [open, setOpen] = useState(false);
  const show = (next: DrawerPosition) => {
    setPosition(next);
    setOpen(true);
  };
  return (
    <>
      <Button onClick={() => show("start")}>start</Button>
      <Button onClick={() => show("end")}>end</Button>
      <Button onClick={() => show("bottom")}>bottom</Button>
      <OverlayDrawer open={open} onOpenChange={setOpen} position={position} size={position === "bottom" ? "small" : "medium"}>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <DrawerClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
              </DrawerClose>
            }
          >
            Drawer “{position}”
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-foreground-2">
            Drawer trượt vào từ cạnh {position}. Nhấn Esc hoặc bấm lớp phủ để đóng.
          </p>
        </DrawerBody>
      </OverlayDrawer>
    </>
  );
}`,
        render: () => <DrawerPositionDemo />,
      },
    ],
    dos: [
      "Dùng overlay cho tác vụ tạm thời (bộ lọc, chi tiết bản ghi); inline cho điều hướng / panel luôn cần thấy.",
      "Luôn có tiêu đề và cách đóng rõ ràng (nút X, Huỷ, Esc).",
      "Chọn kích thước vừa nội dung; full chỉ cho màn hình nhỏ.",
    ],
    donts: [
      "Không mở drawer chồng lên drawer khác.",
      "Không dùng drawer cho xác nhận ngắn — dùng Dialog.",
      "Không đặt nhiều hơn 2–3 hành động ở footer.",
    ],
    props: [
      { name: "DrawerSurface / OverlayDrawer.position", type: `"start" | "end" | "bottom"`, defaultValue: `"end"`, description: "Cạnh trượt vào." },
      { name: "size", type: `"small" | "medium" | "large" | "full"`, defaultValue: `"small"`, description: "320 / 592 / 940px / toàn màn hình (rộng, hoặc cao khi bottom)." },
      { name: "DrawerSurface.modalType", type: `"modal" | "alert"`, defaultValue: `"modal"`, description: "alert: không đóng khi bấm lớp phủ / Esc." },
      { name: "OverlayDrawer.open / onOpenChange", type: "boolean / (open) => void", description: "Điều khiển trạng thái (Drawer root cũng nhận các prop này)." },
      { name: "InlineDrawer.open / position / size", type: "boolean / DrawerPosition / DrawerSize", defaultValue: `false / "start" / "small"`, description: "Drawer trong bố cục, chuyển động độ rộng." },
      { name: "InlineDrawer.separator", type: "boolean", defaultValue: "false", description: "Vạch ngăn stroke-2 với nội dung." },
      { name: "DrawerHeaderTitle.action", type: "ReactNode", description: "Phần tử bên phải tiêu đề (thường là nút đóng)." },
    ],
  },

  accordion: {
    slug: "accordion",
    name: "Accordion",
    category: "Bố cục",
    lead: "Accordion xếp nội dung thành các mục có thể mở rộng / thu gọn để giảm tải thông tin trên trang.",
    description:
      "Mở một mục (type=\"single\", có thể collapsible) hoặc nhiều mục (type=\"multiple\"). Ba appearance: flush (liền mạch, mặc định), separated (mỗi mục là một thẻ bo 8px, shadow-2) và outline (khung viền chung, vạch chia giữa các mục). Header có thể kèm icon và dòng mô tả; Accordion lồng trong panel tự thừa hưởng cỡ của cha và có đường dẫn dọc thể hiện cấp bậc. Panel chuyển động chiều cao mượt, tôn trọng giảm chuyển động.",
    importCode: `import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from "@/components/ui";`,
    hero: {
      title: "Accordion",
      code: `<Accordion type="single" collapsible defaultValue="1" className="w-full max-w-96">
  <AccordionItem value="1">
    <AccordionHeader>Yugen UI là gì?</AccordionHeader>
    <AccordionPanel>Thư viện component React + Tailwind CSS v4 theo ngôn ngữ thiết kế Microsoft Fluent 2.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="2">
    <AccordionHeader>Có hỗ trợ dark mode không?</AccordionHeader>
    <AccordionPanel>Có. Mọi màu đều lấy từ token và tự đổi theo thuộc tính data-theme.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="3">
    <AccordionHeader>Đổi màu thương hiệu thế nào?</AccordionHeader>
    <AccordionPanel>Đặt data-brand="teams" (hoặc brand riêng) trên phần tử gốc.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
      render: () => (
        <Accordion type="single" collapsible defaultValue="1" className="w-full max-w-96">
          <AccordionItem value="1">
            <AccordionHeader>Yugen UI là gì?</AccordionHeader>
            <AccordionPanel>Thư viện component React + Tailwind CSS v4 theo ngôn ngữ thiết kế Microsoft Fluent 2.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionHeader>Có hỗ trợ dark mode không?</AccordionHeader>
            <AccordionPanel>Có. Mọi màu đều lấy từ token và tự đổi theo thuộc tính data-theme.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionHeader>Đổi màu thương hiệu thế nào?</AccordionHeader>
            <AccordionPanel>Đặt data-brand="teams" (hoặc brand riêng) trên phần tử gốc.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      ),
    },
    examples: [
      {
        title: "Separated — thẻ có icon & mô tả",
        description: "appearance=\"separated\": mỗi mục là một thẻ; description là dòng phụ dưới tiêu đề (được đọc như mô tả của nút).",
        code: `<Accordion type="single" collapsible appearance="separated" defaultValue="account" className="w-full max-w-96">
  <AccordionItem value="account">
    <AccordionHeader icon={<Person20Regular />} description="Tên hiển thị, ảnh đại diện, ngôn ngữ">
      Tài khoản
    </AccordionHeader>
    <AccordionPanel>Thay đổi được áp dụng cho mọi thiết bị đã đăng nhập.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="security">
    <AccordionHeader icon={<ShieldLock20Regular />} description="Mật khẩu, xác thực hai lớp">
      Bảo mật
    </AccordionHeader>
    <AccordionPanel>Bật xác thực hai lớp để tài khoản vẫn an toàn khi lộ mật khẩu.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="billing">
    <AccordionHeader icon={<Payment20Regular />} description="Phương thức thanh toán, hoá đơn">
      Thanh toán
    </AccordionHeader>
    <AccordionPanel>Hoá đơn được gửi qua email vào ngày 1 hằng tháng.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
        render: () => (
          <Accordion type="single" collapsible appearance="separated" defaultValue="account" className="w-full max-w-96">
            <AccordionItem value="account">
              <AccordionHeader icon={<Person20Regular />} description="Tên hiển thị, ảnh đại diện, ngôn ngữ">
                Tài khoản
              </AccordionHeader>
              <AccordionPanel>Thay đổi được áp dụng cho mọi thiết bị đã đăng nhập.</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionHeader icon={<ShieldLock20Regular />} description="Mật khẩu, xác thực hai lớp">
                Bảo mật
              </AccordionHeader>
              <AccordionPanel>Bật xác thực hai lớp để tài khoản vẫn an toàn khi lộ mật khẩu.</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="billing">
              <AccordionHeader icon={<Payment20Regular />} description="Phương thức thanh toán, hoá đơn">
                Thanh toán
              </AccordionHeader>
              <AccordionPanel>Hoá đơn được gửi qua email vào ngày 1 hằng tháng.</AccordionPanel>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        title: "Outline, nhiều mục & chevron cuối",
        description: "appearance=\"outline\" — khung viền chung, vạch chia stroke-2; type=\"multiple\", expandIconPosition=\"end\", mục disabled.",
        code: `<Accordion type="multiple" appearance="outline" expandIconPosition="end" defaultValue={["shipping"]} className="w-full max-w-96">
  <AccordionItem value="shipping">
    <AccordionHeader icon={<Mail20Regular />}>Giao hàng</AccordionHeader>
    <AccordionPanel>Miễn phí cho đơn từ 500.000 ₫, nhận hàng trong 2–4 ngày.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="returns">
    <AccordionHeader icon={<ShieldLock20Regular />}>Đổi trả</AccordionHeader>
    <AccordionPanel>Đổi trả trong 30 ngày, giữ nguyên tem và hoá đơn.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="invoice" disabled>
    <AccordionHeader icon={<Payment20Regular />}>Xuất hoá đơn VAT (sắp có)</AccordionHeader>
    <AccordionPanel>Tính năng đang phát triển.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
        render: () => (
          <Accordion type="multiple" appearance="outline" expandIconPosition="end" defaultValue={["shipping"]} className="w-full max-w-96">
            <AccordionItem value="shipping">
              <AccordionHeader icon={<Mail20Regular />}>Giao hàng</AccordionHeader>
              <AccordionPanel>Miễn phí cho đơn từ 500.000 ₫, nhận hàng trong 2–4 ngày.</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionHeader icon={<ShieldLock20Regular />}>Đổi trả</AccordionHeader>
              <AccordionPanel>Đổi trả trong 30 ngày, giữ nguyên tem và hoá đơn.</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="invoice" disabled>
              <AccordionHeader icon={<Payment20Regular />}>Xuất hoá đơn VAT (sắp có)</AccordionHeader>
              <AccordionPanel>Tính năng đang phát triển.</AccordionPanel>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        title: "Lồng nhau",
        description: "Accordion đặt trong AccordionPanel thừa hưởng size / expandIconPosition của cha và có đường dẫn dọc ở mép đầu dòng.",
        code: `<Accordion type="single" collapsible appearance="outline" defaultValue="docs" className="w-full max-w-96">
  <AccordionItem value="docs">
    <AccordionHeader>Tài liệu</AccordionHeader>
    <AccordionPanel>
      <Accordion type="single" collapsible defaultValue="start">
        <AccordionItem value="start">
          <AccordionHeader>Bắt đầu</AccordionHeader>
          <AccordionPanel>Cài đặt, YugenProvider và component đầu tiên.</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="theming">
          <AccordionHeader>Theming</AccordionHeader>
          <AccordionPanel>Theme, brand và hướng chữ.</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </AccordionPanel>
  </AccordionItem>
  <AccordionItem value="blocks">
    <AccordionHeader>Block mẫu</AccordionHeader>
    <AccordionPanel>Bố cục dựng sẵn, copy được nguyên file.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
        render: () => (
          <Accordion type="single" collapsible appearance="outline" defaultValue="docs" className="w-full max-w-96">
            <AccordionItem value="docs">
              <AccordionHeader>Tài liệu</AccordionHeader>
              <AccordionPanel>
                <Accordion type="single" collapsible defaultValue="start">
                  <AccordionItem value="start">
                    <AccordionHeader>Bắt đầu</AccordionHeader>
                    <AccordionPanel>Cài đặt, YugenProvider và component đầu tiên.</AccordionPanel>
                  </AccordionItem>
                  <AccordionItem value="theming">
                    <AccordionHeader>Theming</AccordionHeader>
                    <AccordionPanel>Theme, brand và hướng chữ.</AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="blocks">
              <AccordionHeader>Block mẫu</AccordionHeader>
              <AccordionPanel>Bố cục dựng sẵn, copy được nguyên file.</AccordionPanel>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        title: "Kích thước",
        description: "small, medium (mặc định), large, extra-large.",
        code: `<div className="flex w-full max-w-96 flex-col">
  <Accordion type="single" collapsible size="small">
    <AccordionItem value="s">
      <AccordionHeader>Small</AccordionHeader>
      <AccordionPanel>Nội dung cỡ small.</AccordionPanel>
    </AccordionItem>
  </Accordion>
  <Accordion type="single" collapsible>
    <AccordionItem value="m">
      <AccordionHeader>Medium</AccordionHeader>
      <AccordionPanel>Nội dung cỡ medium.</AccordionPanel>
    </AccordionItem>
  </Accordion>
  <Accordion type="single" collapsible size="large">
    <AccordionItem value="l">
      <AccordionHeader>Large</AccordionHeader>
      <AccordionPanel>Nội dung cỡ large.</AccordionPanel>
    </AccordionItem>
  </Accordion>
  <Accordion type="single" collapsible size="extra-large">
    <AccordionItem value="xl">
      <AccordionHeader>Extra large</AccordionHeader>
      <AccordionPanel>Nội dung cỡ extra-large.</AccordionPanel>
    </AccordionItem>
  </Accordion>
</div>`,
        render: () => (
          <div className="flex w-full max-w-96 flex-col">
            <Accordion type="single" collapsible size="small">
              <AccordionItem value="s">
                <AccordionHeader>Small</AccordionHeader>
                <AccordionPanel>Nội dung cỡ small.</AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="m">
                <AccordionHeader>Medium</AccordionHeader>
                <AccordionPanel>Nội dung cỡ medium.</AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible size="large">
              <AccordionItem value="l">
                <AccordionHeader>Large</AccordionHeader>
                <AccordionPanel>Nội dung cỡ large.</AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible size="extra-large">
              <AccordionItem value="xl">
                <AccordionHeader>Extra large</AccordionHeader>
                <AccordionPanel>Nội dung cỡ extra-large.</AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        ),
      },
    ],
    dos: [
      "Tiêu đề ngắn, mô tả rõ nội dung bên trong; dùng description cho tóm tắt một dòng.",
      "Dùng separated cho trang cài đặt / FAQ nổi trên nền; outline khi Accordion nằm trên bề mặt cùng màu.",
      "Mở sẵn mục quan trọng nhất (defaultValue); dùng type=\"multiple\" khi cần so sánh nhiều mục.",
    ],
    donts: [
      "Không giấu thông tin bắt buộc phải đọc trong mục thu gọn.",
      "Không lồng quá 2 cấp — phân cấp sâu hơn dùng Tree.",
      "Không trộn nhiều appearance trong cùng một nhóm mục.",
    ],
    props: [
      { name: "type", type: `"single" | "multiple"`, description: "Một hay nhiều mục mở cùng lúc (bắt buộc)." },
      { name: "collapsible", type: "boolean", defaultValue: "false", description: "type=\"single\": cho phép đóng mục đang mở." },
      { name: "value / defaultValue / onValueChange", type: "string | string[]", description: "Mục đang mở." },
      { name: "appearance", type: `"flush" | "separated" | "outline"`, defaultValue: `"flush"`, description: "Liền mạch · thẻ rời (rounded-xlarge, shadow-2) · khung viền có vạch chia." },
      { name: "size", type: `"small" | "medium" | "large" | "extra-large"`, defaultValue: `"medium"`, description: "Cỡ header; Accordion lồng mặc định theo cha." },
      { name: "expandIconPosition", type: `"start" | "end"`, defaultValue: `"start"`, description: "Vị trí chevron; Accordion lồng mặc định theo cha." },
      { name: "AccordionItem.value / disabled", type: "string / boolean", description: "Định danh mục; vô hiệu hoá." },
      { name: "AccordionHeader.icon", type: "ReactNode", description: "Icon cỡ 20 trước tiêu đề." },
      { name: "AccordionHeader.description", type: "ReactNode", description: "Dòng mô tả phụ (caption) dưới tiêu đề, gắn qua aria-describedby." },
    ],
  },

  collapsible: {
    slug: "collapsible",
    name: "Collapsible",
    category: "Bố cục",
    lead: "Collapsible ẩn / hiện một vùng nội dung bằng một nút điều khiển, có chuyển động chiều cao.",
    description:
      "Khối đơn lẻ (khác Accordion là nhóm nhiều mục). Nội dung đóng bị ẩn khỏi trình đọc màn hình và thứ tự Tab; chuyển động dùng grid-template-rows, tự tắt khi bật giảm chuyển động.",
    importCode: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui";`,
    hero: {
      title: "Collapsible",
      code: `function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-72">
      <ul className="flex flex-col gap-XS text-body1">
        <li className="rounded-medium bg-background-3 px-M py-S">Báo cáo Q3.docx</li>
        <li className="rounded-medium bg-background-3 px-M py-S">Kế hoạch 2027.xlsx</li>
      </ul>
      <CollapsibleContent>
        <ul className="flex flex-col gap-XS pt-XS text-body1">
          <li className="rounded-medium bg-background-3 px-M py-S">Biên bản họp.docx</li>
          <li className="rounded-medium bg-background-3 px-M py-S">Ngân sách.xlsx</li>
          <li className="rounded-medium bg-background-3 px-M py-S">Thiết kế.fig</li>
        </ul>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button
          appearance="transparent"
          className="mt-S"
          iconPosition="after"
          icon={<ChevronDown20Regular className={open ? "rotate-180" : undefined} />}
        >
          {open ? "Thu gọn" : "Hiện thêm 3 mục"}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}`,
      render: () => <CollapsibleDemo />,
    },
    examples: [
      {
        title: "Mở sẵn, nút icon",
        description: "Không cần state: chevron xoay theo data-state của trigger.",
        code: `<Collapsible defaultOpen className="w-80 rounded-medium bg-background-1 shadow-4">
  <div className="flex items-center justify-between gap-S py-XS ps-M pe-XS">
    <span className="text-body1 font-semibold">Chi tiết đơn hàng #1024</span>
    <CollapsibleTrigger asChild>
      <Button
        appearance="subtle"
        size="small"
        aria-label="Thu gọn / mở rộng"
        className="group/trigger"
        icon={<ChevronDown20Regular className="transition-transform duration-normal group-data-[state=open]/trigger:rotate-180" />}
      />
    </CollapsibleTrigger>
  </div>
  <CollapsibleContent className="flex flex-col gap-XS px-M pb-M text-body1 text-foreground-2">
    <span>2 × Bàn phím cơ — 3.200.000 ₫</span>
    <span>1 × Chuột không dây — 650.000 ₫</span>
    <span className="font-semibold text-foreground-1">Tổng: 3.850.000 ₫</span>
  </CollapsibleContent>
</Collapsible>`,
        render: () => (
          <Collapsible defaultOpen className="w-80 rounded-medium bg-background-1 shadow-4">
            <div className="flex items-center justify-between gap-S py-XS ps-M pe-XS">
              <span className="text-body1 font-semibold">Chi tiết đơn hàng #1024</span>
              <CollapsibleTrigger asChild>
                <Button
                  appearance="subtle"
                  size="small"
                  aria-label="Thu gọn / mở rộng"
                  className="group/trigger"
                  icon={
                    <ChevronDown20Regular className="transition-transform duration-normal group-data-[state=open]/trigger:rotate-180" />
                  }
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-XS px-M pb-M text-body1 text-foreground-2">
              <span>2 × Bàn phím cơ — 3.200.000 ₫</span>
              <span>1 × Chuột không dây — 650.000 ₫</span>
              <span className="font-semibold text-foreground-1">Tổng: 3.850.000 ₫</span>
            </CollapsibleContent>
          </Collapsible>
        ),
      },
    ],
    dos: [
      "Nhãn nút nói rõ điều sẽ xảy ra (“Hiện thêm 3 mục”, “Thu gọn”).",
      "Dùng cho nội dung phụ, chi tiết mở rộng của một khối.",
    ],
    donts: [
      "Không dùng nhiều Collapsible liền nhau như danh sách — dùng Accordion.",
      "Không ẩn hành động chính trong vùng thu gọn.",
    ],
    props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Trạng thái mở." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Khoá trigger." },
      { name: "CollapsibleTrigger.asChild", type: "boolean", description: "Dùng Button của bạn làm trigger (nhận data-state)." },
      { name: "CollapsibleContent.className", type: "string", description: "Áp cho khối bên trong — đặt padding / layout ở đây." },
    ],
  },

  calendar: {
    slug: "calendar",
    name: "Calendar",
    category: "Nhập liệu",
    lead: "Calendar hiển thị lưới ngày theo tháng để chọn một ngày, nhiều ngày hoặc một khoảng ngày.",
    description:
      "Dựng trên react-day-picker v10 với giao diện Fluent: ô ngày 32px bo 4px, hôm nay chữ brand đậm kèm vạch dưới, ngày chọn nền brand, khoảng giữa tint brand-background-2. Mặc định tiếng Việt, tuần bắt đầu Thứ Hai; nhận mọi prop của DayPicker (mode, selected, onSelect, disabled, numberOfMonths…).",
    importCode: `import { Calendar } from "@/components/ui";`,
    hero: {
      title: "Calendar",
      code: `function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-medium bg-background-1 p-S shadow-4"
    />
  );
}`,
      render: () => <CalendarDemo />,
    },
    examples: [
      {
        title: "Chọn khoảng",
        description: "mode=\"range\": ngày đầu / cuối nền brand, khoảng giữa tint brand.",
        code: `function CalendarRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + 4);
    return { from, to };
  });
  return <Calendar mode="range" selected={range} onSelect={setRange} />;
}`,
        render: () => <CalendarRangeDemo />,
      },
      {
        title: "Nhiều ngày & ngày bị khoá",
        description: "mode=\"multiple\"; disabled={{ dayOfWeek: [0, 6] }} khoá cuối tuần.",
        code: `function CalendarMultipleDemo() {
  const [days, setDays] = useState<Date[] | undefined>([]);
  return (
    <div className="flex flex-col items-center gap-S">
      <Calendar mode="multiple" selected={days} onSelect={setDays} disabled={{ dayOfWeek: [0, 6] }} />
      <span className="text-caption1 text-foreground-3">Đã chọn {days?.length ?? 0} ngày làm việc</span>
    </div>
  );
}`,
        render: () => <CalendarMultipleDemo />,
      },
    ],
    dos: [
      "Dùng Calendar trực tiếp khi lịch là nội dung chính (đặt lịch, chọn khoảng nghỉ).",
      "Khoá ngày không hợp lệ bằng disabled thay vì báo lỗi sau khi chọn.",
    ],
    donts: [
      "Không dùng Calendar để nhập ngày sinh xa hiện tại — cho phép gõ hoặc dùng dropdown năm (captionLayout=\"dropdown\").",
      "Không hiển thị quá 2 tháng cạnh nhau trên màn hình hẹp.",
    ],
    props: [
      { name: "mode", type: `"single" | "multiple" | "range"`, description: "Kiểu chọn." },
      { name: "selected / onSelect", type: "Date | Date[] | DateRange", description: "Giá trị theo mode." },
      { name: "disabled", type: "Matcher | Matcher[]", description: "Ngày bị khoá (Date, { before }, { after }, { dayOfWeek }…)." },
      { name: "numberOfMonths", type: "number", defaultValue: "1", description: "Số tháng hiển thị." },
      { name: "showOutsideDays", type: "boolean", defaultValue: "true", description: "Hiện ngày của tháng trước / sau (foreground-4)." },
      { name: "locale", type: "DayPickerLocale", defaultValue: "vi", description: "Ngôn ngữ; nhập từ react-day-picker/locale." },
      { name: "…", type: "DayPickerProps", description: "Mọi prop khác của react-day-picker v10." },
    ],
  },

  datepicker: {
    slug: "datepicker",
    name: "DatePicker",
    category: "Nhập liệu",
    lead: "DatePicker là ô nhập dạng Fluent mở Calendar trong popover để chọn ngày, hiển thị dd/MM/yyyy.",
    description:
      "Trigger dùng chung kiểu viền với Input (viền đáy accessible, thanh brand khi focus), icon lịch bên phải, có nút xoá (clearable). Đặt trong `<Field>` để có nhãn, hint và thông báo lỗi. DateRangePicker chọn khoảng ngày với hai tháng cạnh nhau.",
    importCode: `import { DatePicker, DateRangePicker, Field } from "@/components/ui";`,
    hero: {
      title: "DatePicker",
      code: `function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Field label="Ngày bắt đầu" hint="Định dạng dd/MM/yyyy" className="w-72">
      <DatePicker value={date ?? null} onSelectDate={setDate} clearable />
    </Field>
  );
}`,
      render: () => <DatePickerDemo />,
    },
    examples: [
      {
        title: "Giới hạn ngày & validation",
        description: "minDate khoá các ngày trước hôm nay; Field hiển thị lỗi / thành công.",
        code: `function DeliveryDateDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Field
      label="Ngày giao hàng"
      required
      validationState={date ? "success" : "error"}
      validationMessage={date ? "Có thể giao vào ngày này." : "Vui lòng chọn ngày giao (từ hôm nay trở đi)."}
      className="w-72"
    >
      <DatePicker value={date ?? null} onSelectDate={setDate} minDate={new Date()} />
    </Field>
  );
}`,
        render: () => <DeliveryDateDemo />,
      },
      {
        title: "Khoảng ngày",
        description: "DateRangePicker: popover tự đóng khi đã chọn đủ ngày đầu và ngày cuối.",
        code: `<Field label="Thời gian nghỉ phép" className="w-80">
  <DateRangePicker clearable />
</Field>`,
        render: () => (
          <Field label="Thời gian nghỉ phép" className="w-80">
            <DateRangePicker clearable />
          </Field>
        ),
      },
      {
        title: "Kích thước & disabled",
        description: "small 24px, medium 32px, large 40px.",
        code: `<div className="flex w-64 flex-col gap-M">
  <DatePicker size="small" aria-label="Ngày (small)" />
  <DatePicker aria-label="Ngày (medium)" />
  <DatePicker size="large" aria-label="Ngày (large)" />
  <DatePicker disabled aria-label="Ngày (disabled)" defaultValue={new Date(2026, 0, 1)} />
</div>`,
        render: () => (
          <div className="flex w-64 flex-col gap-M">
            <DatePicker size="small" aria-label="Ngày (small)" />
            <DatePicker aria-label="Ngày (medium)" />
            <DatePicker size="large" aria-label="Ngày (large)" />
            <DatePicker disabled aria-label="Ngày (disabled)" defaultValue={new Date(2026, 0, 1)} />
          </div>
        ),
      },
    ],
    dos: [
      "Luôn có nhãn (Field label hoặc aria-label) và gợi ý định dạng khi cần.",
      "Dùng minDate / maxDate để chặn ngày không hợp lệ.",
      "Bật clearable cho trường không bắt buộc.",
    ],
    donts: [
      "Không dùng DatePicker cho ngày rất xa hiện tại (ngày sinh) mà không có cách nhảy năm nhanh.",
      "Không tự định dạng ngày khác nhau giữa các màn hình — giữ dd/MM/yyyy.",
    ],
    props: [
      { name: "value / defaultValue", type: "Date | null", description: "Ngày đã chọn (controlled / uncontrolled)." },
      { name: "onSelectDate", type: "(date: Date | undefined) => void", description: "Gọi khi chọn hoặc xoá." },
      { name: "placeholder", type: "string", defaultValue: `"Chọn ngày…"`, description: "Chữ gợi ý khi trống." },
      { name: "clearable", type: "boolean", defaultValue: "false", description: "Hiện nút xoá khi có giá trị." },
      { name: "minDate / maxDate", type: "Date", description: "Giới hạn ngày chọn được." },
      { name: "formatDate", type: "(date: Date) => string", defaultValue: "dd/MM/yyyy", description: "Định dạng hiển thị." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 24 / 32 / 40px." },
      { name: "disabled / required / id / aria-*", type: "—", description: "Field tự truyền khi bọc trong <Field>." },
      { name: "DateRangePicker.value / onSelectRange", type: "DateRange | null", description: "Khoảng { from, to }; numberOfMonths mặc định 2." },
    ],
  },
};

export const docs: ComponentDoc[] = Object.values(FEEDBACK);
