import * as React from "react";
import {
  CheckmarkCircle20Filled,
  Delete20Regular,
  Home20Regular,
  Play20Regular,
  Settings20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  ProgressBar,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarButton,
} from "@/components/ui";
import { DENSITY_FACTOR, FONTS, sharedToken, type ThemeAxes } from "../themeAxes";
import { docsPath } from "../router";
import { PHOTOS } from "../template-library/glass/photos";
import { useLocale } from "../i18n";
import { PREVIEW_LABEL, Pane, translator, type PreviewTheme } from "./ThemeDesignerParts";

const useT = () => translator(useLocale().locale);

/** Nhãn nhỏ "tên token · giá trị" dưới một mẫu. */
const Meta = ({ children }: { children: React.ReactNode }) => <span className="font-mono text-caption2 text-foreground-3">{children}</span>;

/* ------------------------------------------------------------------ 1. Màu */

/** Mẫu cho các cặp màu được kiểm tra: chữ trắng trên primary, primary cạnh danger, chữ brand trên tint và trên nền. */
export function ColorSample() {
  const t = useT();
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button appearance="primary">Primary</Button>
        <Button appearance="danger" icon={<Delete20Regular />}>
          {t("Xoá", "Delete")}
        </Button>
      </div>
      <div className="rounded-medium bg-brand-background-2 px-3 py-2 text-body1 font-semibold text-brand-foreground-2">
        {t("Chữ brand trên nền tint", "Brand text on tint")}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-medium bg-background-1 px-3 py-2">
        <span className="text-body1 font-semibold text-brand-foreground-1">{t("Chữ brand", "Brand text")}</span>
        <a className="text-body1 text-link hover:underline" href={docsPath("/theme-designer")}>
          {t("Xem chi tiết", "View details")}
        </a>
        <Badge appearance="tint">{t("Mới", "New")}</Badge>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ 2. Hình dáng */

export function ShapeSample({ axes }: { axes: ThemeAxes }) {
  const t = useT();
  const radius = (name: string, label: string) => `${label} ${sharedToken(axes, name)}`;
  return (
    <div className="@container">
      <div className="grid gap-4 @md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button appearance="primary">Primary</Button>
            <Button>Secondary</Button>
            <Button shape="circular" icon={<Settings20Regular />} aria-label={t("Cài đặt", "Settings")} />
          </div>
          <Input placeholder={t("Tìm kiếm", "Search")} aria-label={t("Tìm kiếm (mẫu)", "Search (sample)")} />
          <div className="flex flex-wrap gap-2">
            <Badge appearance="tint">{t("Nhãn", "Badge")}</Badge>
            <Badge appearance="outline" shape="rounded">
              {t("Bo vừa", "Rounded")}
            </Badge>
          </div>
          <Meta>{radius("borderRadiusMedium", "control")}</Meta>
        </div>
        <div className="flex flex-col gap-3">
          <Card className="flex-row items-center gap-3">
            <Avatar name="Alex Chen" size={32} />
            <div className="min-w-0">
              <p className="truncate text-body1 font-semibold">Alex Chen</p>
              <p className="truncate text-caption1 text-foreground-3">{t("Thiết kế", "Design")}</p>
            </div>
          </Card>
          <div className="rounded-xlarge bg-background-1 p-4 shadow-16">
            <p className="text-body1 font-semibold">{t("Lưu thay đổi?", "Save changes?")}</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="small">{t("Huỷ", "Cancel")}</Button>
              <Button size="small" appearance="primary">
                {t("Lưu", "Save")}
              </Button>
            </div>
          </div>
          <Meta>
            {radius("borderRadiusLarge", "card")} · {radius("borderRadiusXLarge", "dialog")}
          </Meta>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 3. Mật độ & chữ */

const TYPE_RAMP = [
  { className: "text-title3 font-semibold", token: "Base600", vi: "Tiêu đề", en: "Title" },
  { className: "text-subtitle1 font-semibold", token: "Base500", vi: "Tiêu đề phụ", en: "Subtitle" },
  { className: "text-body1", token: "Base300", vi: "Nội dung chính của trang", en: "Body text of the page" },
  { className: "text-caption1 text-foreground-3", token: "Base200", vi: "Chú thích", en: "Caption" },
] as const;

const px = (n: number) => `${Number(n.toFixed(2))}px`;

export function TypeSample({ axes }: { axes: ThemeAxes }) {
  const t = useT();
  const d = DENSITY_FACTOR[axes.density];
  const font = axes.font === "custom" ? axes.customFont || "Segoe UI" : (FONTS.find((f) => f.id === axes.font)?.label ?? "Segoe UI");
  return (
    <div className="@container">
      <div className="grid gap-5 @md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Meta>{font}</Meta>
          {TYPE_RAMP.map((row) => (
            <div key={row.token} className="flex min-w-0 flex-col">
              <span className={row.className}>{t(row.vi, row.en)}</span>
              <Meta>
                {sharedToken(axes, `fontSize${row.token}`)} / {sharedToken(axes, `lineHeight${row.token}`)}
              </Meta>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {(["small", "medium"] as const).map((size) => (
            <div key={size} className="flex flex-col gap-2">
              <Meta>
                size {size} · {px((size === "small" ? 24 : 32) * d)}
              </Meta>
              <div className="flex flex-wrap items-center gap-2">
                <Button size={size} appearance="primary">
                  {t("Lưu", "Save")}
                </Button>
                <Button size={size}>{t("Huỷ", "Cancel")}</Button>
              </div>
              <Input size={size} placeholder={t("Tên dự án", "Project name")} aria-label={`${t("Tên dự án", "Project name")} (${size})`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 4. Nền & độ nổi */

const LAYERS = ["bg-background-1", "bg-background-2", "bg-background-3", "bg-background-4"] as const;
const SHADOWS = [
  { className: "shadow-4", vi: "Card", en: "Card" },
  { className: "shadow-16", vi: "Menu", en: "Menu" },
  { className: "shadow-64", vi: "Dialog", en: "Dialog" },
] as const;

export function SurfacesSample() {
  const t = useT();
  return (
    <>
      <div className="grid grid-cols-4 overflow-hidden rounded-medium border border-stroke-2">
        {LAYERS.map((bg, i) => (
          <span key={bg} className={`${bg} flex h-10 items-end px-2 pb-1 text-caption1 text-foreground-3`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-0.5 rounded-medium bg-background-1 px-3 py-2 text-body1">
        <span className="text-foreground-1">{t("Chữ chính", "Primary text")}</span>
        <span className="text-foreground-2">{t("Chữ phụ", "Secondary text")}</span>
        <span className="text-foreground-3">{t("Chữ mờ", "Tertiary text")}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-1 pb-2">
        {SHADOWS.map((s) => (
          <span key={s.className} className={`${s.className} rounded-medium bg-background-1 px-2 py-3 text-center text-caption1`}>
            {t(s.vi, s.en)}
          </span>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ 5. Chuyển động */

const DURATIONS = [
  { token: "durationFaster", vi: "Nhanh", en: "Faster" },
  { token: "durationNormal", vi: "Vừa", en: "Normal" },
  { token: "durationSlower", vi: "Chậm", en: "Slower" },
] as const;

export function MotionSample({ axes }: { axes: ThemeAxes }) {
  const t = useT();
  const [on, setOn] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button icon={<Play20Regular />} onClick={() => setOn((v) => !v)}>
          {t("Chạy thử", "Play")}
        </Button>
        <Switch label={t("Switch thật", "Real switch")} checked={on} onCheckedChange={setOn} />
      </div>
      {DURATIONS.map((d) => (
        <div key={d.token} className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3">
          <span className="flex flex-col">
            <span className="text-body1">{t(d.vi, d.en)}</span>
            <Meta>{sharedToken(axes, d.token)}</Meta>
          </span>
          <span className="h-2 overflow-hidden rounded-circular bg-background-3">
            <span
              className="block h-full rounded-circular bg-brand-background transition-[width] ease-decelerate-mid motion-reduce:transition-none"
              style={{ width: on ? "100%" : "10%", transitionDuration: `var(--${d.token})` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ 6. Glass */

export function GlassSample({ theme }: { theme: PreviewTheme }) {
  const t = useT();
  return (
    <div className="relative isolate flex h-32 items-end overflow-hidden rounded-large p-3">
      <img src={PHOTOS.gionWeeping.small} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <Toolbar material="glass" aria-label={`Glass (${PREVIEW_LABEL[theme]})`} className="w-full">
        <span className="px-2 text-body1 font-semibold">{t("Thanh glass", "Glass bar")}</span>
        <ToolbarButton icon={<Home20Regular />} aria-label={t("Trang chủ", "Home")} className="ms-auto" />
        <ToolbarButton icon={<Settings20Regular />} aria-label={t("Cài đặt", "Settings")} />
      </Toolbar>
    </div>
  );
}

/* ------------------------------------------------------------------ 7. Xem trước tổng hợp */

/** Số hàng của một cột: mỗi khối là một hàng của subgrid, để cùng khối ở ba theme thẳng hàng. */
const PREVIEW_ROWS = 6;

function PreviewColumn({ theme, style, dir }: { theme: PreviewTheme; style: React.CSSProperties; dir: "ltr" | "rtl" }) {
  const t = useT();
  return (
    <Pane theme={theme} style={style} dir={dir} className="row-span-6 grid snap-start grid-rows-subgrid gap-4 rounded-2xlarge p-4">
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{PREVIEW_LABEL[theme]}</span>
        <Badge appearance="tint">{t("Mới", "New")}</Badge>
      </div>
      <Card className="gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
            <Home20Regular />
          </span>
          <div className="min-w-0">
            <p className="text-body1 font-semibold">{t("Không gian làm việc", "Workspace")}</p>
            <p className="text-caption1 text-foreground-3">
              {t("Đã đồng bộ", "Synced")} ·{" "}
              <a className="text-link hover:underline" href={docsPath("/theme-designer")}>
                {t("Xem chi tiết", "View details")}
              </a>
            </p>
          </div>
        </div>
        <Tabs defaultValue="a">
          <TabsList size="small">
            <TabsTrigger value="a">{t("Tổng quan", "Overview")}</TabsTrigger>
            <TabsTrigger value="b">{t("Hoạt động", "Activity")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input placeholder={t("Click để thấy thanh brand", "Click to see the brand underline")} />
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox label={t("Đã chọn", "Checked")} defaultChecked />
          <Switch label={t("Bật", "On")} defaultChecked />
        </div>
        <Slider aria-label={t("Mẫu slider", "Sample slider")} defaultValue={[60]} />
        <ProgressBar value={0.62} thickness="large" aria-label={t("Tiến độ", "Progress")} />
        <div className="flex flex-wrap gap-2">
          <Button appearance="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button appearance="subtle" icon={<Settings20Regular />} aria-label={t("Cài đặt", "Settings")} />
        </div>
      </Card>
      {/* Bề mặt nổi vẽ tại chỗ (Dialog / Toast thật render qua portal, ra ngoài theme lồng của bản xem trước). */}
      <div className="rounded-xlarge bg-background-1 p-4 shadow-64">
        <p className="text-subtitle1 font-semibold">{t("Mời thành viên", "Invite members")}</p>
        <p className="mt-1 text-body1 text-foreground-2">
          {t("Lời mời được gửi qua email trong vài phút.", "The invitation arrives by email within a few minutes.")}
        </p>
        <Field label="Email" className="mt-3">
          <Input type="email" placeholder={t("ten@congty.vn", "name@company.com")} />
        </Field>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button>{t("Huỷ", "Cancel")}</Button>
          <Button appearance="primary">{t("Gửi lời mời", "Send invitation")}</Button>
        </div>
      </div>
      <Card className="p-0">
        <Table aria-label={`${t("Hoá đơn", "Invoices")} (${PREVIEW_LABEL[theme]})`}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>{t("Hoá đơn", "Invoice")}</TableHeaderCell>
              <TableHeaderCell>{t("Trạng thái", "Status")}</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{t("HD-1024", "INV-1024")}</TableCell>
              <TableCell>
                <Badge appearance="tint" color="success">
                  {t("Đã thanh toán", "Paid")}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("HD-1025", "INV-1025")}</TableCell>
              <TableCell>
                <Badge appearance="tint" color="warning">
                  {t("Chờ duyệt", "Pending")}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {/* Glass trên ảnh: blur, bão hoà và độ đục theo trục Glass (high contrast: nền đặc). */}
      <GlassSample theme={theme} />
      <div className="flex items-start gap-3 rounded-medium bg-background-1 p-3 shadow-8">
        <CheckmarkCircle20Filled className="shrink-0 text-success-foreground-1" />
        <div>
          <p className="text-body1 font-semibold">{t("Đã lưu thay đổi", "Changes saved")}</p>
          <p className="text-caption1 text-foreground-3">{t("Đã đồng bộ với các thiết bị khác.", "Synced to your other devices.")}</p>
        </div>
      </div>
    </Pane>
  );
}

/**
 * Light, Dark và High contrast là ba cột trên cùng một hàng. Hàng hẹp hơn ba cột tối thiểu thì vẫn là một hàng, cuộn ngang
 * theo từng cột (snap) thay vì xếp chồng ba bản xem trước dài.
 */
export function FullPreview({ style, dir }: { style: (theme: PreviewTheme) => React.CSSProperties; dir: "ltr" | "rtl" }) {
  return (
    <div
      data-preview-row=""
      className="grid snap-x snap-mandatory auto-cols-[minmax(min(16.5rem,85%),1fr)] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain pb-2"
      style={{ gridTemplateRows: `repeat(${PREVIEW_ROWS}, auto)` }}
    >
      {(["light", "dark", "high-contrast"] as const).map((theme) => (
        <PreviewColumn key={theme} theme={theme} style={style(theme)} dir={dir} />
      ))}
    </div>
  );
}
