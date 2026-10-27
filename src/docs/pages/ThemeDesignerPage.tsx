import * as React from "react";
import {
  ArrowDownload20Regular,
  CheckmarkCircle16Filled,
  CheckmarkCircle20Filled,
  DismissCircle16Filled,
  Warning16Filled,
  Wand20Regular,
  Home20Regular,
  Settings20Regular,
} from "@fluentui/react-icons";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  CodeTabs,
  Field,
  Input,
  MessageBar,
  ProgressBar,
  Select,
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
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  RAMP_STEPS,
  adjustKeyForContrast,
  contrastRatio,
  generateBrandRamp,
  hueDistance,
  isHexColor,
  rampToStyle,
} from "@/lib/brandRamp";
import { rampToDesignTokens, rampToTokensStudio } from "@/lib/tokenExport";
import { DocSection, PageHeader } from "../blocks";
import { CodeBlock, CopyButton } from "../CodeBlock";
import {
  DEFAULT_AXES,
  FONTS,
  GLASS,
  axesToCss,
  axesToParams,
  glassChecks,
  neutralChecks,
  paramsToAxes,
  sharedVars,
  smallestTarget,
  themeVars,
  type ThemeAxes,
} from "../themeAxes";
import { docsPath } from "../router";
import { PHOTOS } from "../template-library/glass/photos";
import { useLocale, type Locale } from "../i18n";

/** Chữ hiển thị theo ngôn ngữ: tiếng Việt mặc định, tiếng Anh khi locale = "en". CSS / JSON xuất ra không đổi theo ngôn ngữ. */
const translator = (locale: Locale) => (vi: string, en: string) => (locale === "en" ? en : vi);

/** Tải chuỗi về máy thành file (CSS / JSON). */
function download(fileName: string, text: string) {
  const type = fileName.endsWith(".json") ? "application/json" : "text/css";
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
  a.click();
  URL.revokeObjectURL(url);
}

const PRESETS = [
  { name: "Sakura", hex: "#C2347A" },
  { name: "Fluent Blue", hex: "#0F6CBD" },
  { name: "Teams", hex: "#5B5FC7" },
  { name: "Grape", hex: "#881798" },
  { name: "Teal", hex: "#03787C" },
  { name: "Forest", hex: "#107C10" },
  { name: "Steel", hex: "#005B70" },
  { name: "Pumpkin", hex: "#BC4B09" },
];

const DANGER = "#c50f1f";

function Check({ ok, warn, label, value }: { ok: boolean; warn?: boolean; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-stroke-3 py-2 first:border-t-0">
      <span className="text-body1">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-caption1 font-semibold tabular-nums",
          ok ? "text-success-foreground-1" : warn ? "text-warning-foreground-1" : "text-danger-foreground-1",
        )}
      >
        {ok ? <CheckmarkCircle16Filled /> : warn ? <Warning16Filled /> : <DismissCircle16Filled />}
        {value}
      </span>
    </li>
  );
}

type PreviewTheme = "light" | "dark" | "high-contrast";
const PREVIEW_LABEL: Record<PreviewTheme, string> = { light: "Light", dark: "Dark", "high-contrast": "High contrast" };

/** Một trục: vài bậc có tên (không slider) và một dòng giải thích vì sao bị giới hạn. */
function Axis<T extends string>({
  label,
  note,
  value,
  options,
  onChange,
}: {
  label: string;
  note: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <p id={id} className="text-body1 font-semibold">
        {label}
      </p>
      <ToggleGroup type="single" size="small" aria-labelledby={id} value={value} onValueChange={(v) => v && onChange(v as T)}>
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value}>
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-caption1 text-foreground-3">{note}</p>
    </div>
  );
}

/** Giá trị ban đầu: query `td-*` của link chia sẻ, thiếu hoặc sai thì dùng mặc định. */
function initialState() {
  // Prerender không có URL: giá trị mặc định (link chia sẻ ?td-… áp khi trang chạy trên trình duyệt).
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const hex = `#${params.get("td-key") ?? ""}`;
  const num = (name: string, fallback: number, min: number, max: number) => {
    const value = Number(params.get(name));
    return params.has(name) && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  };
  return {
    key: isHexColor(hex) ? hex.toUpperCase() : "#C2347A",
    vibrancy: num("td-vibrancy", 100, 50, 150),
    torsion: num("td-torsion", 0, -30, 30),
    name: (params.get("td-name") ?? "").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "my-brand",
    axes: paramsToAxes(params),
  };
}

function Preview({ theme, style, dir }: { theme: PreviewTheme; style: React.CSSProperties; dir: "ltr" | "rtl" }) {
  const t = translator(useLocale().locale);
  return (
    <div
      data-theme={theme}
      data-brand="custom"
      dir={dir}
      style={style}
      // font-sans: font-family của <html> chỉ được kế thừa dạng giá trị đã tính, nên phải đặt lại để biến font mới có hiệu lực.
      className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 bg-background-2 p-5 font-sans"
    >
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{PREVIEW_LABEL[theme]}</span>
        <Badge appearance="tint">{t("Mới", "New")}</Badge>
      </div>
      <Card className="gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
            <Home20Regular />
          </span>
          <div>
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
      <div className="rounded-xlarge bg-background-1 p-5 shadow-64">
        <p className="text-subtitle1 font-semibold">{t("Mời thành viên", "Invite members")}</p>
        <p className="mt-1 text-body1 text-foreground-2">
          {t("Lời mời được gửi qua email trong vài phút.", "The invitation arrives by email within a few minutes.")}
        </p>
        <Field label="Email" className="mt-3">
          <Input type="email" placeholder={t("ten@congty.vn", "name@company.com")} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
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
      <div className="relative isolate flex h-32 items-end overflow-hidden rounded-xlarge p-3">
        <img src={PHOTOS.gionWeeping.small} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
        <Toolbar material="glass" aria-label={`Glass (${PREVIEW_LABEL[theme]})`} className="w-full">
          <span className="px-2 text-body1 font-semibold">{t("Thanh glass", "Glass bar")}</span>
          <ToolbarButton icon={<Home20Regular />} aria-label={t("Trang chủ", "Home")} className="ms-auto" />
          <ToolbarButton icon={<Settings20Regular />} aria-label={t("Cài đặt", "Settings")} />
        </Toolbar>
      </div>
      <div className="flex items-start gap-3 rounded-medium bg-background-1 p-3 shadow-8">
        <CheckmarkCircle20Filled className="shrink-0 text-success-foreground-1" />
        <div>
          <p className="text-body1 font-semibold">{t("Đã lưu thay đổi", "Changes saved")}</p>
          <p className="text-caption1 text-foreground-3">{t("Đã đồng bộ với các thiết bị khác.", "Synced to your other devices.")}</p>
        </div>
      </div>
    </div>
  );
}

export function ThemeDesignerPage() {
  const t = translator(useLocale().locale);
  const [initial] = React.useState(initialState);
  const [key, setKey] = React.useState(initial.key);
  const [hexInput, setHexInput] = React.useState(initial.key);
  const [name, setName] = React.useState(initial.name);
  const [vibrancy, setVibrancy] = React.useState([initial.vibrancy]);
  const [torsion, setTorsion] = React.useState([initial.torsion]);
  const [axes, setAxes] = React.useState<ThemeAxes>(initial.axes);
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr");
  const [applyGlobally, setApplyGlobally] = React.useState(false);
  const setAxis = <K extends keyof ThemeAxes>(axis: K, value: ThemeAxes[K]) => setAxes((a) => ({ ...a, [axis]: value }));

  const ramp = React.useMemo(
    () => generateBrandRamp(key, { vibrancy: vibrancy[0] / 100, hueTorsion: torsion[0] }),
    [key, vibrancy, torsion],
  );
  const previewStyle = (theme: PreviewTheme) =>
    ({ ...rampToStyle(ramp), ...sharedVars(axes), ...(theme === "high-contrast" ? {} : themeVars(axes, theme, key)) }) as React.CSSProperties;
  const brandName = name || "my-brand";
  const css = axesToCss(`[data-brand="${brandName}"]`, axes, key, rampToStyle(ramp));
  const neutral = neutralChecks(axes, key);
  const minNeutral = Math.min(...neutral.map((c) => c.ratio));
  const minGlass = Math.min(...glassChecks(axes, key, ramp).map((c) => c.ratio));
  const target = smallestTarget(axes.density);

  const shareUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    for (const k of [...params.keys()]) if (k.startsWith("td-")) params.delete(k);
    params.set("td-key", key.replace("#", "").toUpperCase());
    if (vibrancy[0] !== 100) params.set("td-vibrancy", String(vibrancy[0]));
    if (torsion[0] !== 0) params.set("td-torsion", String(torsion[0]));
    if (brandName !== "my-brand") params.set("td-name", brandName);
    axesToParams(axes, params);
    return `${window.location.origin}${window.location.pathname}?${params}`;
  }, [key, vibrancy, torsion, brandName, axes]);

  // Font từ Google Fonts chỉ nạp khi được chọn để xem trước; CSS xuất ra không kèm font.
  React.useEffect(() => {
    const font = FONTS.find((f) => f.id === axes.font);
    if (!font?.google || document.getElementById(`td-font-${font.id}`)) return;
    const link = Object.assign(document.createElement("link"), {
      id: `td-font-${font.id}`,
      rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`,
    });
    document.head.append(link);
  }, [axes.font]);
  const exportFiles = [
    { name: `${brandName}.css`, code: css, language: "css" as const },
    { name: `${brandName}.tokens.json`, code: JSON.stringify(rampToDesignTokens(brandName, ramp), null, 2), language: "json" as const },
    { name: `${brandName}.tokens-studio.json`, code: JSON.stringify(rampToTokensStudio(brandName, ramp), null, 2), language: "json" as const },
  ];

  const onWhite = contrastRatio(ramp[7], "#ffffff");
  const tintText = contrastRatio(ramp[6], ramp[15]);
  const darkFg = contrastRatio(ramp[9], "#292929");
  const darkButton = contrastRatio(ramp[6], "#ffffff");
  const dangerGap = hueDistance(ramp[7], DANGER);

  // Áp thử cho cả trang: cùng CSS với bản xuất, scope :root (light / dark theo data-theme hiện tại của <html>).
  React.useEffect(() => {
    if (!applyGlobally) return;
    const style = Object.assign(document.createElement("style"), { textContent: axesToCss(":root", axes, key, rampToStyle(ramp)) });
    style.dataset.themeDesigner = "";
    document.head.append(style);
    return () => style.remove();
  }, [applyGlobally, axes, key, ramp]);

  const pickKey = (hex: string) => {
    setKey(hex);
    setHexInput(hex.toUpperCase());
  };

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow={t("Công cụ", "Tools")}
        title="Theme Designer"
        lead={t(
          "Tạo theme từ một màu key, rồi chọn bo góc, mật độ, chữ, màu trung tính, độ nổi và chuyển động. Các trục ngoài màu chỉ có vài bậc đã được kiểm tra; xem trước trên component thật rồi copy CSS.",
          "Build a theme from one key color, then choose corner radius, density, type, neutral colors, elevation and motion. Apart from color, each axis has a few tested steps. Preview them on real components, then copy the CSS.",
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* ---------- Controls ---------- */}
        <div className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
          <Card size="large" className="gap-4 rounded-2xlarge p-5">
            <div>
              <p className="mb-2 text-body1 font-semibold">{t("Màu key (brand80)", "Key color (brand80)")}</p>
              <div className="flex items-end gap-2">
                <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-large border border-stroke-1" style={{ background: key }}>
                  <span className="sr-only">{t("Chọn màu", "Pick a color")}</span>
                  <input
                    type="color"
                    value={key}
                    onChange={(e) => pickKey(e.target.value)}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
                <Input
                  aria-label={t("Mã HEX", "HEX code")}
                  value={hexInput}
                  rootClassName="flex-1"
                  validationState={isHexColor(hexInput) ? "none" : "error"}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    setHexInput(v);
                    if (isHexColor(v)) setKey(v);
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t("Màu có sẵn", "Preset colors")}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    role="radio"
                    aria-checked={key.toLowerCase() === p.hex.toLowerCase()}
                    aria-label={p.name}
                    title={p.name}
                    onClick={() => pickKey(p.hex)}
                    className={cn(
                      "size-7 rounded-circular border-2 border-background-1 ring-1 ring-stroke-1 transition-shadow duration-faster",
                      key.toLowerCase() === p.hex.toLowerCase() && "ring-2 ring-brand-stroke",
                    )}
                    style={{ background: p.hex }}
                  />
                ))}
              </div>
            </div>

            <Slider label={t("Độ rực (vibrancy)", "Vibrancy")} showValue value={vibrancy} onValueChange={setVibrancy} min={50} max={150} step={5} />
            <Slider label={t("Xoắn hue (°)", "Hue torsion (°)")} showValue value={torsion} onValueChange={setTorsion} min={-30} max={30} step={1} />

            <Field label={t("Tên brand", "Brand name")} hint={`${t("Dùng", "Use")}: <html data-brand="${name || "my-brand"}">`}>
              <Input value={name} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} />
            </Field>

            <Switch label={t("Áp dụng thử cho toàn trang", "Try it on the whole page")} checked={applyGlobally} onCheckedChange={setApplyGlobally} />
          </Card>

          <Card size="large" className="gap-4 rounded-2xlarge p-5">
            <p className="text-body1 font-semibold">{t("Hình dáng & nhịp", "Shape & rhythm")}</p>
            <Axis
              label={t("Bo góc", "Corner radius")}
              note={t(
                "Cả ramp đổi cùng tỉ lệ để control, card và dialog giữ tương quan; nút tròn vẫn tròn.",
                "The whole ramp scales by one ratio, so controls, cards and dialogs keep their proportions. Circular buttons stay circular.",
              )}
              value={axes.radius}
              onChange={(v) => setAxis("radius", v)}
              options={[
                { value: "none", label: t("Không", "None") },
                { value: "small", label: t("Nhỏ", "Small") },
                { value: "medium", label: t("Vừa", "Medium") },
                { value: "large", label: t("Lớn", "Large") },
                { value: "full", label: t("Tròn", "Full") },
              ]}
            />
            <Axis
              label={t("Mật độ", "Density")}
              note={t(
                "Một hệ số cho spacing và chiều cao control. Bậc Gọn đưa vùng bấm nhỏ nhất xuống dưới 24px.",
                "One factor for spacing and control heights. Compact puts the smallest targets below 24px.",
              )}
              value={axes.density}
              onChange={(v) => setAxis("density", v)}
              options={[
                { value: "compact", label: t("Gọn", "Compact") },
                { value: "default", label: t("Mặc định", "Default") },
                { value: "comfortable", label: t("Thoáng", "Comfortable") },
              ]}
            />
            <div className="flex flex-col gap-1.5">
              <Field
                label={t("Font chữ", "Font")}
                hint={t(
                  "Stack nào cũng kết thúc bằng font hệ thống. Font web không đi kèm CSS xuất ra.",
                  "Every stack ends with system fonts. Web fonts are not included in the exported CSS.",
                )}
              >
                <Select value={axes.font} onChange={(e) => setAxis("font", e.target.value)}>
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                  <option value="custom">{t("Tự nhập…", "Custom…")}</option>
                </Select>
              </Field>
              {axes.font === "custom" && (
                <Input
                  aria-label={t("Tên font", "Font name")}
                  placeholder="Atkinson Hyperlegible"
                  value={axes.customFont}
                  onChange={(e) => setAxis("customFont", e.target.value)}
                />
              )}
            </div>
            <Axis
              label={t("Cỡ chữ gốc", "Base font size")}
              note={t(
                "Cả type ramp nhân theo tỉ lệ; line height được tính lại, không chỉnh riêng.",
                "The whole type ramp scales by the same ratio. Line heights are recalculated, not set one by one.",
              )}
              value={String(axes.baseSize) as "14" | "15" | "16"}
              onChange={(v) => setAxis("baseSize", Number(v) as ThemeAxes["baseSize"])}
              options={[
                { value: "14", label: "14px" },
                { value: "15", label: "15px" },
                { value: "16", label: "16px" },
              ]}
            />
            <Axis
              label={t("Màu trung tính", "Neutral colors")}
              note={t(
                "Pha nhẹ một sắc vào thang xám ở light và dark; tương phản được kiểm tra lại. High contrast giữ nguyên.",
                "Adds a slight tint to the gray scale in light and dark, and contrast is checked again. High contrast stays unchanged.",
              )}
              value={axes.neutrals}
              onChange={(v) => setAxis("neutrals", v)}
              options={[
                { value: "pure", label: t("Xám", "Gray") },
                { value: "warm", label: t("Ấm", "Warm") },
                { value: "cool", label: t("Lạnh", "Cool") },
                { value: "brand", label: t("Theo brand", "Brand") },
              ]}
            />
            <Axis
              label={t("Độ nổi", "Elevation")}
              note={t(
                "Cả thang bóng đổi cùng lúc. Phẳng vẫn giữ một nửa bóng cho Menu, Dialog để tách khỏi nền.",
                "The whole shadow scale changes at once. Flat keeps half the shadow on Menu and Dialog so they stand out from the background.",
              )}
              value={axes.elevation}
              onChange={(v) => setAxis("elevation", v)}
              options={[
                { value: "flat", label: t("Phẳng", "Flat") },
                { value: "subtle", label: t("Nhẹ", "Subtle") },
                { value: "default", label: t("Mặc định", "Default") },
              ]}
            />
            <Axis
              label={t("Chuyển động", "Motion")}
              note={t(
                "Nhân thời lượng ×0.75 / ×1 / ×1.25, tối đa 500ms. prefers-reduced-motion vẫn được ưu tiên.",
                "Multiplies durations by ×0.75 / ×1 / ×1.25, up to 500ms. prefers-reduced-motion still takes priority.",
              )}
              value={axes.motion}
              onChange={(v) => setAxis("motion", v)}
              options={[
                { value: "reduced", label: t("Ít", "Less") },
                { value: "default", label: t("Mặc định", "Default") },
                { value: "expressive", label: t("Nhiều", "More") },
              ]}
            />
            <Axis
              label="Glass (Yugen Labs)"
              note={t(
                `Blur ${GLASS[axes.glass].blur}px, bão hoà ${GLASS[axes.glass].saturation}%, độ đục ${GLASS[axes.glass].alpha.light} / ${GLASS[axes.glass].alpha.dark} (light / dark). Độ đục không xuống dưới mức giữ chữ 4.5:1 trên nền đen hay trắng.`,
                `Blur ${GLASS[axes.glass].blur}px, saturation ${GLASS[axes.glass].saturation}%, opacity ${GLASS[axes.glass].alpha.light} / ${GLASS[axes.glass].alpha.dark} (light / dark). Opacity never goes below what keeps text at 4.5:1 over black or white.`,
              )}
              value={axes.glass}
              onChange={(v) => setAxis("glass", v)}
              options={[
                { value: "airy", label: t("Trong", "Airy") },
                { value: "default", label: t("Mặc định", "Default") },
                { value: "frosted", label: t("Mờ đục", "Frosted") },
              ]}
            />
            <Axis
              label={t("Sắc của glass", "Glass tint")}
              note={t(
                "Theo brand: nền glass lấy bậc 160 (light) hoặc 20 (dark) của ramp. Cần trình duyệt có relative color syntax.",
                "Brand: the glass takes step 160 (light) or 20 (dark) of the ramp. Needs a browser with relative color syntax.",
              )}
              value={axes.glassTint}
              onChange={(v) => setAxis("glassTint", v)}
              options={[
                { value: "neutral", label: t("Trung tính", "Neutral") },
                { value: "brand", label: t("Theo brand", "Brand") },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="small" disabled={JSON.stringify(axes) === JSON.stringify(DEFAULT_AXES)} onClick={() => setAxes(DEFAULT_AXES)}>
                {t("Về mặc định", "Reset to default")}
              </Button>
              <CopyButton text={shareUrl} className="border border-stroke-1" />
              <span className="text-caption1 text-foreground-3">{t("Copy link chứa mọi lựa chọn", "Copy a link with all your choices")}</span>
            </div>
          </Card>

          <Card size="large" className="gap-2 rounded-2xlarge p-5">
            <p className="text-body1 font-semibold">{t("Kiểm tra", "Checks")}</p>
            <ul>
              <Check
                ok={onWhite >= 4.5}
                label={t("Chữ trắng trên nút primary (light)", "White text on the primary button (light)")}
                value={`${onWhite.toFixed(2)}:1`}
              />
              <Check
                ok={darkButton >= 4.5}
                label={t("Chữ trắng trên nút primary (dark)", "White text on the primary button (dark)")}
                value={`${darkButton.toFixed(2)}:1`}
              />
              <Check ok={tintText >= 4.5} label={t("Chữ brand trên nền tint", "Brand text on the tint background")} value={`${tintText.toFixed(2)}:1`} />
              <Check ok={darkFg >= 4.5} label={t("Chữ brand trên nền tối", "Brand text on a dark background")} value={`${darkFg.toFixed(2)}:1`} />
              <Check
                ok={dangerGap >= 20}
                warn={dangerGap >= 10}
                label={t("Khác hue so với danger", "Hue distance from danger")}
                value={`${dangerGap.toFixed(0)}°`}
              />
              <Check ok={target >= 24} warn label={t("Vùng bấm nhỏ nhất (size small)", "Smallest target (size small)")} value={`${target}px`} />
              {axes.neutrals !== "pure" && (
                <Check
                  ok={minNeutral >= 4.5}
                  label={t("Chữ trên nền trung tính (light, dark)", "Text on neutral backgrounds (light, dark)")}
                  value={`${minNeutral.toFixed(2)}:1`}
                />
              )}
              <Check
                ok={minGlass >= 4.5}
                label={t("Chữ trên glass, nền sau đen hoặc trắng (light, dark)", "Text on glass over black or white (light, dark)")}
                value={`${minGlass.toFixed(2)}:1`}
              />
            </ul>
            {target < 24 && (
              <MessageBar intent="warning" layout="multiline" title={t("Control size small dưới 24px", "Size small controls are below 24px")}>
                {t(
                  `Ở mật độ gọn, control size small còn ${target}px. Dùng size medium cho control đứng sát nhau (WCAG 2.5.8).`,
                  `At compact density, size small controls are ${target}px. Use size medium for controls placed close together (WCAG 2.5.8).`,
                )}
              </MessageBar>
            )}
            {onWhite < 4.5 && (
              <Button icon={<Wand20Regular />} onClick={() => pickKey(adjustKeyForContrast(key))}>
                {t("Tự chỉnh key để đạt 4.5:1", "Adjust the key to reach 4.5:1")}
              </Button>
            )}
            {dangerGap < 20 && (
              <MessageBar intent="warning" layout="multiline" title={t("Brand gần màu danger", "Brand is close to danger")}>
                {t(
                  "Nút chính dễ bị nhầm với hành động phá huỷ. Nên chọn hue lệch ≥ 20° so với đỏ #C50F1F.",
                  "The primary button can be mistaken for a destructive action. Pick a hue at least 20° away from the red #C50F1F.",
                )}
              </MessageBar>
            )}
          </Card>
        </div>

        {/* ---------- Output ---------- */}
        <div className="min-w-0">
          <DocSection id="ramp" title="Brand ramp">
            <div className="flex overflow-hidden rounded-2xlarge border border-stroke-2">
              {ramp.map((hex, i) => (
                <button
                  key={RAMP_STEPS[i]}
                  type="button"
                  title={`Copy ${hex}`}
                  onClick={() => navigator.clipboard.writeText(hex)}
                  className="group/step flex h-28 flex-1 flex-col items-center justify-end gap-0.5 pb-2"
                  // Nhãn 10px: chữ trắng hoặc đen — bên nào tương phản cao hơn luôn ≥ 4.58:1 (ngưỡng 3:1 cũ để lọt bậc 90 ~3.7:1).
                  style={{ background: hex, color: contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#000000") ? "#ffffff" : "#000000" }}
                >
                  <span className="font-mono text-[10px] font-semibold">{RAMP_STEPS[i]}</span>
                  <span className="hidden font-mono text-[9px] opacity-80 group-hover/step:block">{hex.slice(1)}</span>
                </button>
              ))}
            </div>
          </DocSection>

          <DocSection
            id="preview"
            title={t("Xem trước", "Preview")}
            description={t(
              "Component thật dùng theme vừa tạo — theme lồng nên không ảnh hưởng phần còn lại của trang.",
              "Real components with the new theme. The theme is nested, so the rest of the page is not affected.",
            )}
          >
            <div className="flex flex-col gap-4">
              <ToggleGroup
                type="single"
                size="small"
                aria-label={t("Hướng chữ của bản xem trước", "Preview text direction")}
                value={dir}
                onValueChange={(v) => v && setDir(v as "ltr" | "rtl")}
              >
                <ToggleGroupItem value="ltr">LTR</ToggleGroupItem>
                <ToggleGroupItem value="rtl">RTL</ToggleGroupItem>
              </ToggleGroup>
              <div className="grid gap-4 lg:grid-cols-2">
                {(["light", "dark", "high-contrast"] as const).map((theme) => (
                  <Preview key={theme} theme={theme} style={previewStyle(theme)} dir={dir} />
                ))}
              </div>
            </div>
          </DocSection>

          <DocSection
            id="export"
            title={t("Xuất token", "Export tokens")}
            description={t(
              'CSS: dán vào file CSS chính của app, ngay sau @import "yugen-ui/theme.css", rồi đặt brand cho YugenProvider. Gồm brand ramp và mọi lựa chọn ở Hình dáng & nhịp. JSON (chỉ brand ramp): nhập vào Figma (Tokens Studio, Variables) hoặc Style Dictionary.',
              'CSS: paste it into your app\'s main CSS file, right after @import "yugen-ui/theme.css", then set the brand on YugenProvider. It contains the brand ramp and every option under Shape & rhythm. JSON (brand ramp only): import it into Figma (Tokens Studio, Variables) or Style Dictionary.',
            )}
          >
            <div className="flex flex-col gap-3">
              <CodeTabs files={exportFiles} maxHeight={360} />
              <div className="flex flex-wrap justify-end gap-2">
                {exportFiles.map((f) => (
                  <Button key={f.name} size="small" icon={<ArrowDownload20Regular />} onClick={() => download(f.name, f.code)}>
                    {f.name}
                  </Button>
                ))}
                <CopyButton text={css} className="border border-stroke-1" />
              </div>
              <CodeBlock
                code={`<YugenProvider applyToDocument brand="${brandName}" theme="light">
  <App />
</YugenProvider>`}
              />
            </div>
          </DocSection>
        </div>
      </div>
    </div>
  );
}
