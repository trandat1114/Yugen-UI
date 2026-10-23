import * as React from "react";
import { Dismiss24Regular, Play16Filled } from "@fluentui/react-icons";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  DrawerTrigger,
  Fade,
  Field,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Select,
  SimpleTooltip,
  SkeletonText,
  Stagger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DocSection, DoDont, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { useLocale, type Locale } from "../i18n";
import "../motion-preview.css";

/**
 * Foundations › Motion (#45): token, utility, chuyển động của từng component (demo thật), playground, xem trước giảm
 * chuyển động, phối hợp, hiệu năng. Viết song ngữ ngay trong trang (các trang Foundations khác chỉ có tiếng Việt).
 */

type Text = Record<Locale, string>;
const pick = (locale: Locale, text: Text) => text[locale];

export const MOTION_SECTIONS: Record<Locale, { id: string; label: string }[]> = {
  vi: [
    { id: "tokens", label: "Token" },
    { id: "utilities", label: "Utility & keyframe" },
    { id: "patterns", label: "Theo component" },
    { id: "playground", label: "Playground" },
    { id: "reduced-motion", label: "Giảm chuyển động" },
    { id: "choreography", label: "Phối hợp" },
    { id: "performance", label: "Hiệu năng" },
    { id: "do-dont", label: "Nên & không nên" },
  ],
  en: [
    { id: "tokens", label: "Tokens" },
    { id: "utilities", label: "Utilities & keyframes" },
    { id: "patterns", label: "By component" },
    { id: "playground", label: "Playground" },
    { id: "reduced-motion", label: "Reduced motion" },
    { id: "choreography", label: "Choreography" },
    { id: "performance", label: "Performance" },
    { id: "do-dont", label: "Do and don't" },
  ],
};

function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-body1 text-foreground-2">{children}</p>;
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
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

/* ---------------------------------------------------------------- tokens */
const DURATIONS = [
  { token: "durationUltraFast", utility: "duration-ultra-fast", ms: 50 },
  { token: "durationFaster", utility: "duration-faster", ms: 100 },
  { token: "durationFast", utility: "duration-fast", ms: 150 },
  { token: "durationNormal", utility: "duration-normal", ms: 200 },
  { token: "durationGentle", utility: "duration-gentle", ms: 250 },
  { token: "durationSlow", utility: "duration-slow", ms: 300 },
] as const;

const DURATION_USE: Record<(typeof DURATIONS)[number]["utility"], Text> = {
  "duration-ultra-fast": { vi: "Phản hồi tức thì (nhấn)", en: "Instant feedback (press)" },
  "duration-faster": { vi: "Hover, đổi màu, icon", en: "Hover, color, icons" },
  "duration-fast": { vi: "Bề mặt rời đi", en: "Surfaces leaving" },
  "duration-normal": { vi: "Mở / đóng nội dung tại chỗ", en: "Expanding content in place" },
  "duration-gentle": { vi: "Bề mặt đi vào (Dialog, Drawer)", en: "Surfaces entering (Dialog, Drawer)" },
  "duration-slow": { vi: "Chuyển động lớn, hiếm", en: "Large, rare movement" },
};

const CURVES = [
  { token: "curveDecelerateMid", utility: "ease-decelerate-mid", use: { vi: "Phần tử đi vào", en: "Elements entering" } },
  { token: "curveAccelerateMid", utility: "ease-accelerate-mid", use: { vi: "Phần tử rời đi", en: "Elements leaving" } },
  { token: "curveEasyEase", utility: "ease-easy-ease", use: { vi: "Đổi trạng thái tại chỗ", en: "State change in place" } },
  { token: "curveDecelerateMax", utility: "ease-decelerate-max", use: { vi: "Đi vào, quãng dài", en: "Entering over a long distance" } },
  { token: "curveAccelerateMax", utility: "ease-accelerate-max", use: { vi: "Rời đi, quãng dài", en: "Leaving over a long distance" } },
  { token: "curveEasyEaseMax", utility: "ease-easy-ease-max", use: { vi: "Đổi chỗ trên màn hình", en: "Moving across the screen" } },
  { token: "curveLinear", utility: "ease-linear", use: { vi: "Progress, xoay vòng", en: "Progress, spinners" } },
] as const;

function MotionRow({ label, sub, note, duration, curve }: { label: string; sub: string; note?: string; duration: string; curve: string }) {
  const { locale } = useLocale();
  const [on, setOn] = React.useState(false);
  return (
    <div className="flex flex-col gap-2 border-b border-stroke-3 px-4 py-3 last:border-b-0 md:flex-row md:items-center md:gap-4">
      <div className="w-56 shrink-0">
        <p className="font-mono text-[13px] font-semibold">{label}</p>
        <p className="font-mono text-caption1 text-brand-foreground-1">{sub}</p>
        {note && <p className="text-caption1 text-foreground-3">{note}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-label={locale === "en" ? `Play ${label}` : `Chạy ${label}`}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-circular bg-brand-background text-foreground-on-brand hover:bg-brand-background-hover"
      >
        <Play16Filled />
      </button>
      <div className="relative h-6 flex-1 rounded-circular bg-background-3">
        <span
          className="absolute top-1 size-4 rounded-circular bg-brand-background transition-[inset-inline-start]"
          style={{ insetInlineStart: on ? "calc(100% - 20px)" : "4px", transitionDuration: duration, transitionTimingFunction: curve }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- utilities */
const ANIMATIONS: { utility: string; keyframes: Text; timing: string }[] = [
  { utility: "animate-fade-in", keyframes: { vi: "opacity 0 → 1", en: "opacity 0 → 1" }, timing: "200ms · decelerate-mid" },
  { utility: "animate-fade-out", keyframes: { vi: "opacity 1 → 0", en: "opacity 1 → 0" }, timing: "150ms · accelerate-mid" },
  { utility: "animate-surface-in", keyframes: { vi: "opacity 0 → 1, scale 0.96 → 1", en: "opacity 0 → 1, scale 0.96 → 1" }, timing: "250ms · decelerate-mid" },
  { utility: "animate-surface-out", keyframes: { vi: "opacity 1 → 0", en: "opacity 1 → 0" }, timing: "150ms · accelerate-mid" },
  {
    utility: "animate-slide-in-start / -end / -bottom",
    keyframes: { vi: "trượt vào từ mép đầu / cuối / đáy (lật theo RTL)", en: "slides in from the start / end / bottom edge (mirrored in RTL)" },
    timing: "250ms · decelerate-mid",
  },
  {
    utility: "animate-slide-out-start / -end / -bottom",
    keyframes: { vi: "trượt ra về mép đó", en: "slides out to that edge" },
    timing: "150ms · accelerate-mid",
  },
  { utility: "animate-shimmer", keyframes: { vi: "dải sáng chạy ngang (Skeleton)", en: "light sweep (Skeleton)" }, timing: "1.8s · linear · ∞" },
  { utility: "animate-indeterminate", keyframes: { vi: "thanh chạy (ProgressBar không xác định)", en: "moving bar (indeterminate ProgressBar)" }, timing: "3s · linear · ∞" },
];

/* ---------------------------------------------------------------- patterns */
function PatternCard({ name, enter, exit, reduced, children }: { name: string; enter: string; exit: string; reduced: string; children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <p className="text-subtitle2 font-semibold text-foreground-1">{name}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption1">
        <dt className="text-foreground-3">{locale === "en" ? "Enter" : "Vào"}</dt>
        <dd className="font-mono text-foreground-2">{enter}</dd>
        <dt className="text-foreground-3">{locale === "en" ? "Exit" : "Ra"}</dt>
        <dd className="font-mono text-foreground-2">{exit}</dd>
        <dt className="text-foreground-3">{locale === "en" ? "Reduced" : "Giảm"}</dt>
        <dd className="text-foreground-2">{reduced}</dd>
      </dl>
      <div className="mt-auto flex min-h-10 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Patterns() {
  const { locale } = useLocale();
  const en = locale === "en";
  const t = (vi: string, enText: string) => (en ? enText : vi);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PatternCard
        name="Dialog"
        enter="surface-in 250ms · fade-in (backdrop)"
        exit="fade-out 150ms"
        reduced={t("Giữ nguyên: chỉ mờ và thu nhỏ 4%.", "Unchanged: only a fade and a 4% scale.")}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>{t("Mở Dialog", "Open dialog")}</Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogTitle>{t("Lưu thay đổi?", "Save changes?")}</DialogTitle>
            <DialogDescription>{t("Bề mặt vào 250ms, ra 150ms.", "The surface enters in 250ms and leaves in 150ms.")}</DialogDescription>
            <DialogActions>
              <DialogClose asChild>
                <Button appearance="primary">{t("Đóng", "Close")}</Button>
              </DialogClose>
            </DialogActions>
          </DialogSurface>
        </Dialog>
      </PatternCard>

      <PatternCard
        name="Drawer / Sheet"
        enter="slide-in-start | end | bottom 250ms"
        exit="slide-out-* 150ms"
        reduced={t("Không trượt: hiện và ẩn ngay; nền phủ vẫn mờ dần.", "No slide: appears and hides at once; the backdrop still fades.")}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button>{t("Mở Drawer", "Open drawer")}</Button>
          </DrawerTrigger>
          <DrawerSurface position="end" size="small">
            <DrawerHeader>
              <DrawerHeaderTitle
                action={
                  <DrawerClose asChild>
                    <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label={t("Đóng", "Close")} />
                  </DrawerClose>
                }
              >
                Drawer
              </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
              <p className="text-body1 text-foreground-2">
                {t("Trượt vào từ mép cuối; ở RTL là mép trái.", "Slides in from the end edge; in RTL that is the left edge.")}
              </p>
            </DrawerBody>
          </DrawerSurface>
        </Drawer>
      </PatternCard>

      <PatternCard
        name="Menu / Popover"
        enter="surface-in 250ms"
        exit="fade-out 150ms"
        reduced={t("Giữ nguyên.", "Unchanged.")}
      >
        <Menu>
          <MenuTrigger asChild>
            <Button>Menu</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuItem>{t("Đổi tên", "Rename")}</MenuItem>
            <MenuItem>{t("Nhân bản", "Duplicate")}</MenuItem>
          </MenuPopover>
        </Menu>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Popover</Button>
          </PopoverTrigger>
          <PopoverSurface size="small">{t("Mở cạnh nút bấm.", "Opens next to its trigger.")}</PopoverSurface>
        </Popover>
      </PatternCard>

      <PatternCard name="Tooltip" enter="fade-in 200ms" exit="fade-out 150ms" reduced={t("Giữ nguyên.", "Unchanged.")}>
        <SimpleTooltip content={t("Chỉ mờ dần, không di chuyển", "Fades only, no movement")}>
          <Button>{t("Rê chuột hoặc focus", "Hover or focus")}</Button>
        </SimpleTooltip>
      </PatternCard>

      <PatternCard
        name="Toast"
        enter={t("slide-in-end (góc cuối) · surface-in (giữa)", "slide-in-end (end corners) · surface-in (centre)")}
        exit={t("slide-out-end · vuốt để đóng", "slide-out-end · swipe to dismiss")}
        reduced={t("Không trượt: hiện và ẩn ngay.", "No slide: appears and hides at once.")}
      >
        <Button
          onClick={() =>
            toast({ intent: "success", title: t("Đã lưu", "Saved"), body: t("Toast vào từ mép cuối.", "The toast enters from the end edge.") })
          }
        >
          {t("Hiện Toast", "Show toast")}
        </Button>
      </PatternCard>

      <PatternCard
        name="Accordion"
        enter="grid-template-rows 200ms · easy-ease"
        exit="grid-template-rows 200ms · easy-ease"
        reduced={t("Mở / đóng ngay, chevron không xoay.", "Opens and closes at once; the chevron does not rotate.")}
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="1">
            <AccordionHeader>{t("Chiều cao đổi tại chỗ", "Height changes in place")}</AccordionHeader>
            <AccordionPanel>{t("Nội dung bên dưới được đẩy xuống cùng nhịp.", "Content below moves down at the same pace.")}</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </PatternCard>

      <PatternCard
        name="Tabs"
        enter={t("màu vạch chỉ báo 100ms · easy-ease", "indicator color 100ms · easy-ease")}
        exit={t("không trượt giữa các tab", "no slide between tabs")}
        reduced={t("Giữ nguyên (chỉ đổi màu).", "Unchanged (color only).")}
      >
        <Tabs defaultValue="a" className="w-full">
          <TabsList>
            <TabsTrigger value="a">{t("Tổng quan", "Overview")}</TabsTrigger>
            <TabsTrigger value="b">{t("Hoạt động", "Activity")}</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="pt-2 text-caption1 text-foreground-3">
            {t("Nội dung đổi ngay.", "Content switches at once.")}
          </TabsContent>
          <TabsContent value="b" className="pt-2 text-caption1 text-foreground-3">
            {t("Không có hiệu ứng chuyển trang.", "No transition between panels.")}
          </TabsContent>
        </Tabs>
      </PatternCard>
    </div>
  );
}

/** Bật / tắt xem trước giảm chuyển động: <html data-motion-preview="reduce"> (xem motion-preview.css). */
function ReducedPreviewSwitch() {
  const { locale } = useLocale();
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    if (on) root.setAttribute("data-motion-preview", "reduce");
    else root.removeAttribute("data-motion-preview");
    return () => root.removeAttribute("data-motion-preview");
  }, [on]);
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label={locale === "en" ? "Preview reduced motion on this page" : "Xem trước giảm chuyển động trên trang này"}
    />
  );
}

/* ---------------------------------------------------------------- playground */
const PROPERTIES = {
  opacity: { label: { vi: "Độ mờ", en: "Opacity" }, transition: "transition-opacity", from: "opacity-0", to: "opacity-100" },
  translate: {
    label: { vi: "Dịch chuyển", en: "Translate" },
    transition: "transition-[translate]",
    from: "translate-x-0",
    to: "translate-x-16 rtl:-translate-x-16",
  },
  scale: { label: { vi: "Tỉ lệ", en: "Scale" }, transition: "transition-[scale]", from: "scale-50", to: "scale-100" },
  height: { label: { vi: "Chiều cao", en: "Height" }, transition: "transition-[height]", from: "h-4", to: "h-16" },
} as const;
type Property = keyof typeof PROPERTIES;

interface Setting {
  duration: (typeof DURATIONS)[number]["utility"];
  curve: (typeof CURVES)[number]["utility"];
}

function SettingControls({ name, value, onChange }: { name: string; value: Setting; onChange: (next: Setting) => void }) {
  const { locale } = useLocale();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${name} · ${locale === "en" ? "Duration" : "Thời lượng"}`}>
        <Select value={value.duration} onChange={(e) => onChange({ ...value, duration: e.target.value as Setting["duration"] })}>
          {DURATIONS.map((d) => (
            <option key={d.utility} value={d.utility}>
              {d.ms}ms · {d.utility.replace("duration-", "")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={`${name} · ${locale === "en" ? "Curve" : "Đường cong"}`}>
        <Select value={value.curve} onChange={(e) => onChange({ ...value, curve: e.target.value as Setting["curve"] })}>
          {CURVES.map((c) => (
            <option key={c.utility} value={c.utility}>
              {c.utility.replace("ease-", "")}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function Stage({ property, setting, on, label }: { property: Property; setting: Setting; on: boolean; label: string }) {
  const p = PROPERTIES[property];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption1 font-semibold text-foreground-3">{label}</p>
      <div className="flex h-24 items-center rounded-large bg-background-3 px-4" aria-hidden>
        <span
          className={cn(
            "block w-12 rounded-medium bg-brand-background",
            property !== "height" && "h-12",
            p.transition,
            setting.duration,
            setting.curve,
            on ? p.to : p.from,
          )}
        />
      </div>
    </div>
  );
}

function Playground() {
  const { locale } = useLocale();
  const en = locale === "en";
  const [property, setProperty] = React.useState<Property>("translate");
  const [a, setA] = React.useState<Setting>({ duration: "duration-gentle", curve: "ease-decelerate-mid" });
  const [b, setB] = React.useState<Setting>({ duration: "duration-gentle", curve: "ease-linear" });
  const [on, setOn] = React.useState(false);
  const transition = PROPERTIES[property].transition;
  const code = [`/* A */ ${transition} ${a.duration} ${a.curve}`, `/* B */ ${transition} ${b.duration} ${b.curve}`].join("\n");

  return (
    <div className="flex flex-col gap-4 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label={en ? "Property" : "Thuộc tính"} className="w-48">
          <Select value={property} onChange={(e) => setProperty(e.target.value as Property)}>
            {(Object.keys(PROPERTIES) as Property[]).map((key) => (
              <option key={key} value={key}>
                {pick(locale, PROPERTIES[key].label)}
              </option>
            ))}
          </Select>
        </Field>
        <Button appearance="primary" icon={<Play16Filled />} onClick={() => setOn((v) => !v)}>
          {on ? (en ? "Reverse" : "Chạy ngược") : en ? "Play" : "Chạy"}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SettingControls name="A" value={a} onChange={setA} />
          <Stage property={property} setting={a} on={on} label="A" />
        </div>
        <div className="flex flex-col gap-3">
          <SettingControls name="B" value={b} onChange={setB} />
          <Stage property={property} setting={b} on={on} label="B" />
        </div>
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

/* ---------------------------------------------------------------- choreography */
function StaggerDemo() {
  const { locale } = useLocale();
  const [visible, setVisible] = React.useState(true);
  const items = locale === "en" ? ["Inbox", "Drafts", "Sent", "Archive"] : ["Hộp thư", "Bản nháp", "Đã gửi", "Lưu trữ"];
  return (
    <div className="flex flex-col gap-3">
      <Button className="self-start" onClick={() => setVisible((v) => !v)}>
        {visible ? (locale === "en" ? "Hide list" : "Ẩn danh sách") : locale === "en" ? "Show list" : "Hiện danh sách"}
      </Button>
      <ul className="flex min-h-40 flex-col gap-1">
        <Stagger visible={visible}>
          {items.map((item) => (
            <li key={item} className="rounded-medium bg-background-3 px-3 py-2 text-body1">
              {item}
            </li>
          ))}
        </Stagger>
      </ul>
    </div>
  );
}

function SkeletonDemo() {
  const { locale } = useLocale();
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Button className="self-start" onClick={() => setLoaded((v) => !v)}>
        {loaded ? (locale === "en" ? "Load again" : "Tải lại") : locale === "en" ? "Finish loading" : "Tải xong"}
      </Button>
      <div className="grid min-h-24">
        {loaded ? (
          <Fade visible appear>
            <p className="text-body1 text-foreground-2">
              {locale === "en"
                ? "Content fades in where the placeholder was, at the same size, so nothing below jumps."
                : "Nội dung mờ dần vào đúng chỗ khung xương, cùng kích thước, nên phần bên dưới không bị đẩy."}
            </p>
          </Fade>
        ) : (
          <SkeletonText lines={3} />
        )}
      </div>
    </div>
  );
}

function CollapseDemo() {
  const { locale } = useLocale();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Button className="self-start" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? (locale === "en" ? "Fewer options" : "Ít tuỳ chọn hơn") : locale === "en" ? "More options" : "Thêm tuỳ chọn"}
      </Button>
      <Collapse visible={open}>
        <div className="rounded-medium bg-background-3 p-3 text-body1 text-foreground-2">
          {locale === "en" ? "Collapse animates the height; keep it for small regions." : "Collapse animate chiều cao; chỉ dùng cho vùng nhỏ."}
        </div>
      </Collapse>
    </div>
  );
}

/* ---------------------------------------------------------------- page */
export function MotionPage() {
  const { locale } = useLocale();
  const en = locale === "en";
  const t = (vi: string, enText: string) => (en ? enText : vi);

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Motion"
        lead={t(
          "Chuyển động ngắn và có lý do: cho biết thứ gì vừa xuất hiện, từ đâu tới và đi đâu. Vào chậm dần, ra nhanh dần.",
          "Short motion with a reason: it shows what appeared, where it came from and where it went. Enter by slowing down, leave by speeding up.",
        )}
      >
        {t(
          "Control nhỏ dùng 100–150ms, bề mặt lớn 200–250ms. Chiều ra luôn ngắn hơn chiều vào.",
          "Small controls use 100–150ms, large surfaces 200–250ms. Exits are always shorter than entrances.",
        )}
      </PageHeader>

      <DocSection id="tokens" title={t("Token", "Tokens")} description={t("Bấm ▶ để chạy. Minh hoạ thời lượng chậm ×4 để dễ quan sát.", "Press ▶ to play. The duration demos run 4× slower so they are easier to follow.")}>
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            {DURATIONS.map((d) => (
              <MotionRow
                key={d.token}
                label={d.token}
                sub={`${d.utility} · ${d.ms}ms`}
                note={pick(locale, DURATION_USE[d.utility])}
                duration={`${d.ms * 4}ms`}
                curve="var(--curveEasyEase)"
              />
            ))}
          </div>
          <div className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            {CURVES.map((c) => (
              <MotionRow key={c.token} label={c.token} sub={c.utility} note={pick(locale, c.use)} duration="1000ms" curve={`var(--${c.token})`} />
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection
        id="utilities"
        title={t("Utility & keyframe", "Utilities & keyframes")}
        description={t(
          "duration-* đặt transition-duration, ease-* đặt transition-timing-function. Các animate-* dưới đây có sẵn trong theme.css.",
          "duration-* sets transition-duration and ease-* sets transition-timing-function. The animate-* utilities below ship in theme.css.",
        )}
      >
        <Table
          head={["Utility", t("Chuyển động", "Motion"), t("Thời lượng · đường cong", "Duration · curve")]}
          rows={ANIMATIONS.map((a) => [<C key="u">{a.utility}</C>, pick(locale, a.keyframes), <span key="t" className="font-mono text-caption1">{a.timing}</span>])}
        />
      </DocSection>

      <DocSection
        id="patterns"
        title={t("Theo component", "By component")}
        description={t(
          "Cặp vào / ra mà mỗi component dùng, kèm component thật. Bật xem trước để thấy chúng khi người dùng chọn giảm chuyển động.",
          "The enter / exit pair each component uses, next to the real component. Turn on the preview to see them with reduced motion.",
        )}
      >
        <div className="flex flex-col gap-4">
          <ReducedPreviewSwitch />
          <Patterns />
        </div>
      </DocSection>

      <DocSection
        id="playground"
        title="Playground"
        description={t(
          "Chọn thuộc tính, rồi thời lượng và đường cong cho hai phương án; chạy để so sánh và chép class.",
          "Pick a property, then a duration and a curve for two options; play them side by side and copy the classes.",
        )}
      >
        <Playground />
      </DocSection>

      <DocSection
        id="reduced-motion"
        title={t("Giảm chuyển động", "Reduced motion")}
        description={t(
          "Khi hệ điều hành bật prefers-reduced-motion, component bỏ trượt, xoay và vòng lặp; mờ dần ngắn vẫn giữ để thấy được thay đổi.",
          "With prefers-reduced-motion on, components drop slides, rotation and loops; short fades stay so changes remain visible.",
        )}
      >
        <div className="flex flex-col gap-4">
          <Table
            head={[t("Component", "Component"), t("Khi giảm chuyển động", "With reduced motion")]}
            rows={[
              ["Drawer, Sheet, Toast", t("Không trượt; nền phủ vẫn mờ dần.", "No slide; the backdrop still fades.")],
              ["Accordion, Collapse, Fade, Slide, Scale", t("Đổi trạng thái ngay.", "Change state at once.")],
              ["Carousel", t("Không tự chạy, chuyển slide không cuộn mượt.", "No autoplay; slides change without smooth scrolling.")],
              ["Skeleton, ProgressBar, Spinner, Chart", t("Không chạy vòng lặp hay hiệu ứng vẽ.", "No looping shimmer or drawing animation.")],
              ["Stagger, Tour", t("Hiện cùng lúc, không lần lượt.", "Show together instead of one by one.")],
              ["Dialog, Menu, Popover, Tooltip", t("Giữ nguyên: mờ dần 150–250ms, không di chuyển.", "Unchanged: a 150–250ms fade without movement.")],
            ]}
          />
          <P>
            {t(
              "Công tắc ở phần Theo component áp đúng các class motion-reduce:* mà component khai báo. Hành vi viết bằng JavaScript (Carousel, Stagger, Tour) chỉ đổi khi bật thật trong hệ điều hành hoặc trong DevTools (Rendering › Emulate CSS media feature prefers-reduced-motion).",
              "The switch under By component applies the motion-reduce:* classes the components declare. Behaviour written in JavaScript (Carousel, Stagger, Tour) only changes with the real setting, in the operating system or in DevTools (Rendering › Emulate CSS media feature prefers-reduced-motion).",
            )}
          </P>
          <P>
            {t("Khi tự viết chuyển động, thêm ", "When you write your own motion, add ")}
            <C>motion-reduce:transition-none</C> {t("hoặc", "or")} <C>motion-reduce:animate-none</C>
            {t(" ngay cạnh class chuyển động.", " right next to the motion class.")}
          </P>
        </div>
      </DocSection>

      <DocSection
        id="choreography"
        title={t("Phối hợp", "Choreography")}
        description={t(
          "Nhiều thứ cùng đổi thì cho chúng đi theo một thứ tự, cùng một hướng. Chỉ animate khi chuyển động giúp người dùng theo kịp thay đổi.",
          "When several things change, give them one order and one direction. Animate only when the motion helps people follow the change.",
        )}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <p className="text-subtitle2 font-semibold">{t("Danh sách lần lượt", "Staggered list")}</p>
            <p className="text-caption1 text-foreground-3">{t("Stagger: cách nhau 100ms, ẩn theo thứ tự ngược lại.", "Stagger: 100ms apart, hidden in reverse order.")}</p>
            <StaggerDemo />
          </div>
          <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <p className="text-subtitle2 font-semibold">{t("Khung xương → nội dung", "Skeleton → content")}</p>
            <p className="text-caption1 text-foreground-3">{t("Fade tại chỗ, không trượt.", "Fade in place, no slide.")}</p>
            <SkeletonDemo />
          </div>
          <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <p className="text-subtitle2 font-semibold">{t("Bố cục thay đổi", "Layout change")}</p>
            <p className="text-caption1 text-foreground-3">{t("Collapse / Accordion đẩy nội dung bên dưới cùng nhịp.", "Collapse / Accordion move the content below at the same pace.")}</p>
            <CollapseDemo />
          </div>
        </div>
        <ul className="mt-4 flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body1 text-foreground-2">
          <li>{t("Chuyển trang trong docs và trong app: không animate cả trang; thanh PageProgress là đủ.", "Page changes: do not animate the whole page; the PageProgress bar is enough.")}</li>
          <li>{t("Không animate khi dữ liệu cập nhật liên tục (bảng, log, chat đang stream).", "Do not animate data that updates continuously (tables, logs, streaming chat).")}</li>
          <li>{t("Bề mặt mở ra từ nút bấm thì xuất hiện cạnh nút đó (Menu, Popover).", "Surfaces opened by a button appear next to that button (Menu, Popover).")}</li>
        </ul>
      </DocSection>

      <DocSection id="performance" title={t("Hiệu năng", "Performance")}>
        <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body1 text-foreground-2">
          <li>
            {t("Animate ", "Animate ")}
            <C>transform</C> / <C>translate</C> / <C>scale</C> {t("và", "and")} <C>opacity</C>
            {t(": trình duyệt chạy chúng trên compositor, không tính lại bố cục.", ": browsers run them on the compositor without recalculating layout.")}
          </li>
          <li>
            {t("Tránh animate ", "Avoid animating ")}
            <C>width</C>, <C>height</C>, <C>top</C>, <C>left</C>, <C>margin</C>
            {t(
              ". Accordion và Collapse là ngoại lệ có chủ ý: vùng nhỏ, 200ms, dùng grid-template-rows.",
              ". Accordion and Collapse are deliberate exceptions: small regions, 200ms, using grid-template-rows.",
            )}
          </li>
          <li>
            <C>will-change</C>
            {t(
              " chỉ đặt ngay trước chuyển động và bỏ sau đó; đặt lâu dài tốn bộ nhớ GPU.",
              " only right before the motion, removed afterwards; leaving it on costs GPU memory.",
            )}
          </li>
          <li>
            {t(
              "Chuyển động chạy lâu (shimmer, indeterminate) dùng CSS animation thay vì requestAnimationFrame, để không chiếm luồng chính.",
              "Long-running motion (shimmer, indeterminate) uses CSS animations rather than requestAnimationFrame, so it stays off the main thread.",
            )}
          </li>
        </ul>
      </DocSection>

      <DocSection id="do-dont" title={t("Nên & không nên", "Do and don't")}>
        <DoDont
          dos={
            en
              ? [
                  "Leave faster than you enter (150ms out, 250ms in).",
                  "Slide from the edge the surface is attached to, and mirror it in RTL.",
                  "Use the duration-* and ease-* tokens so motion stays consistent.",
                ]
              : [
                  "Ra nhanh hơn vào (ra 150ms, vào 250ms).",
                  "Trượt từ mép mà bề mặt gắn vào, và lật theo RTL.",
                  "Dùng token duration-* và ease-* để chuyển động đồng nhất.",
                ]
          }
          donts={
            en
              ? [
                  "Bounce or overshoot on UI chrome.",
                  "Animate on every hover or every data update.",
                  "Go past 300ms for anything people wait on.",
                ]
              : [
                  "Nảy hay vượt đích trên khung giao diện.",
                  "Animate mỗi lần hover hay mỗi lần dữ liệu cập nhật.",
                  "Quá 300ms cho thứ người dùng phải chờ.",
                ]
          }
        />
      </DocSection>
    </>
  );
}
