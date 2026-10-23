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
  axesToCss,
  axesToParams,
  neutralChecks,
  paramsToAxes,
  sharedVars,
  smallestTarget,
  themeVars,
  type ThemeAxes,
} from "../themeAxes";
import { docsPath } from "../router";

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
        <Badge appearance="tint">Mới</Badge>
      </div>
      <Card className="gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
            <Home20Regular />
          </span>
          <div>
            <p className="text-body1 font-semibold">Không gian làm việc</p>
            <p className="text-caption1 text-foreground-3">
              Đã đồng bộ · <a className="text-link hover:underline" href={docsPath("/theme-designer")}>Xem chi tiết</a>
            </p>
          </div>
        </div>
        <Tabs defaultValue="a">
          <TabsList size="small">
            <TabsTrigger value="a">Tổng quan</TabsTrigger>
            <TabsTrigger value="b">Hoạt động</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input placeholder="Click để thấy thanh brand" />
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox label="Đã chọn" defaultChecked />
          <Switch label="Bật" defaultChecked />
        </div>
        <Slider aria-label="Mẫu slider" defaultValue={[60]} />
        <ProgressBar value={0.62} thickness="large" aria-label="Tiến độ" />
        <div className="flex flex-wrap gap-2">
          <Button appearance="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button appearance="subtle" icon={<Settings20Regular />} aria-label="Cài đặt" />
        </div>
      </Card>
      {/* Bề mặt nổi vẽ tại chỗ (Dialog / Toast thật render qua portal, ra ngoài theme lồng của bản xem trước). */}
      <div className="rounded-xlarge bg-background-1 p-5 shadow-64">
        <p className="text-subtitle1 font-semibold">Mời thành viên</p>
        <p className="mt-1 text-body1 text-foreground-2">Lời mời được gửi qua email trong vài phút.</p>
        <Field label="Email" className="mt-3">
          <Input type="email" placeholder="ten@congty.vn" />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button>Huỷ</Button>
          <Button appearance="primary">Gửi lời mời</Button>
        </div>
      </div>
      <Card className="p-0">
        <Table aria-label={`Hoá đơn (${PREVIEW_LABEL[theme]})`}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Hoá đơn</TableHeaderCell>
              <TableHeaderCell>Trạng thái</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>HD-1024</TableCell>
              <TableCell>
                <Badge appearance="tint" color="success">
                  Đã thanh toán
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HD-1025</TableCell>
              <TableCell>
                <Badge appearance="tint" color="warning">
                  Chờ duyệt
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      <div className="flex items-start gap-3 rounded-medium bg-background-1 p-3 shadow-8">
        <CheckmarkCircle20Filled className="shrink-0 text-success-foreground-1" />
        <div>
          <p className="text-body1 font-semibold">Đã lưu thay đổi</p>
          <p className="text-caption1 text-foreground-3">Đã đồng bộ với các thiết bị khác.</p>
        </div>
      </div>
    </div>
  );
}

export function ThemeDesignerPage() {
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
        eyebrow="Công cụ"
        title="Theme Designer"
        lead="Tạo theme từ một màu key, rồi chọn bo góc, mật độ, chữ, màu trung tính, độ nổi và chuyển động. Mỗi lựa chọn chỉ có vài bậc đã được kiểm tra; xem trước trên component thật rồi copy CSS."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* ---------- Controls ---------- */}
        <div className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
          <Card size="large" className="gap-4 rounded-2xlarge p-5">
            <div>
              <p className="mb-2 text-body1 font-semibold">Màu key (brand80)</p>
              <div className="flex items-end gap-2">
                <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-large border border-stroke-1" style={{ background: key }}>
                  <span className="sr-only">Chọn màu</span>
                  <input
                    type="color"
                    value={key}
                    onChange={(e) => pickKey(e.target.value)}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
                <Input
                  aria-label="Mã HEX"
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
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Màu có sẵn">
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

            <Slider label="Độ rực (vibrancy)" showValue value={vibrancy} onValueChange={setVibrancy} min={50} max={150} step={5} />
            <Slider label="Xoắn hue (°)" showValue value={torsion} onValueChange={setTorsion} min={-30} max={30} step={1} />

            <Field label="Tên brand" hint={`Dùng: <html data-brand="${name || "my-brand"}">`}>
              <Input value={name} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} />
            </Field>

            <Switch label="Áp dụng thử cho toàn trang" checked={applyGlobally} onCheckedChange={setApplyGlobally} />
          </Card>

          <Card size="large" className="gap-4 rounded-2xlarge p-5">
            <p className="text-body1 font-semibold">Hình dáng & nhịp</p>
            <Axis
              label="Bo góc"
              note="Cả ramp đổi cùng tỉ lệ để control, card và dialog giữ tương quan; nút tròn vẫn tròn."
              value={axes.radius}
              onChange={(v) => setAxis("radius", v)}
              options={[
                { value: "none", label: "Không" },
                { value: "small", label: "Nhỏ" },
                { value: "medium", label: "Vừa" },
                { value: "large", label: "Lớn" },
                { value: "full", label: "Tròn" },
              ]}
            />
            <Axis
              label="Mật độ"
              note="Một hệ số cho spacing và chiều cao control. Gọn quá thì vùng bấm dưới 24px."
              value={axes.density}
              onChange={(v) => setAxis("density", v)}
              options={[
                { value: "compact", label: "Gọn" },
                { value: "default", label: "Mặc định" },
                { value: "comfortable", label: "Thoáng" },
              ]}
            />
            <div className="flex flex-col gap-1.5">
              <Field label="Font chữ" hint="Stack nào cũng kết thúc bằng font hệ thống. Font web không đi kèm CSS xuất ra.">
                <Select value={axes.font} onChange={(e) => setAxis("font", e.target.value)}>
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                  <option value="custom">Tự nhập…</option>
                </Select>
              </Field>
              {axes.font === "custom" && (
                <Input aria-label="Tên font" placeholder="Atkinson Hyperlegible" value={axes.customFont} onChange={(e) => setAxis("customFont", e.target.value)} />
              )}
            </div>
            <Axis
              label="Cỡ chữ gốc"
              note="Cả type ramp nhân theo tỉ lệ; line height được tính lại, không chỉnh riêng."
              value={String(axes.baseSize) as "14" | "15" | "16"}
              onChange={(v) => setAxis("baseSize", Number(v) as ThemeAxes["baseSize"])}
              options={[
                { value: "14", label: "14px" },
                { value: "15", label: "15px" },
                { value: "16", label: "16px" },
              ]}
            />
            <Axis
              label="Màu trung tính"
              note="Pha nhẹ một sắc vào thang xám ở light và dark; tương phản được kiểm tra lại. High contrast giữ nguyên."
              value={axes.neutrals}
              onChange={(v) => setAxis("neutrals", v)}
              options={[
                { value: "pure", label: "Xám" },
                { value: "warm", label: "Ấm" },
                { value: "cool", label: "Lạnh" },
                { value: "brand", label: "Theo brand" },
              ]}
            />
            <Axis
              label="Độ nổi"
              note="Cả thang bóng đổi cùng lúc. Phẳng vẫn giữ một nửa bóng cho Menu, Dialog để tách khỏi nền."
              value={axes.elevation}
              onChange={(v) => setAxis("elevation", v)}
              options={[
                { value: "flat", label: "Phẳng" },
                { value: "subtle", label: "Nhẹ" },
                { value: "default", label: "Mặc định" },
              ]}
            />
            <Axis
              label="Chuyển động"
              note="Nhân thời lượng ×0.75 / ×1 / ×1.25, tối đa 500ms. prefers-reduced-motion vẫn được ưu tiên."
              value={axes.motion}
              onChange={(v) => setAxis("motion", v)}
              options={[
                { value: "reduced", label: "Ít" },
                { value: "default", label: "Mặc định" },
                { value: "expressive", label: "Nhiều" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="small" disabled={JSON.stringify(axes) === JSON.stringify(DEFAULT_AXES)} onClick={() => setAxes(DEFAULT_AXES)}>
                Về mặc định
              </Button>
              <CopyButton text={shareUrl} className="border border-stroke-1" />
              <span className="text-caption1 text-foreground-3">Copy link chứa mọi lựa chọn</span>
            </div>
          </Card>

          <Card size="large" className="gap-2 rounded-2xlarge p-5">
            <p className="text-body1 font-semibold">Kiểm tra</p>
            <ul>
              <Check ok={onWhite >= 4.5} label="Chữ trắng trên nút primary (light)" value={`${onWhite.toFixed(2)}:1`} />
              <Check ok={darkButton >= 4.5} label="Chữ trắng trên nút primary (dark)" value={`${darkButton.toFixed(2)}:1`} />
              <Check ok={tintText >= 4.5} label="Chữ brand trên nền tint" value={`${tintText.toFixed(2)}:1`} />
              <Check ok={darkFg >= 4.5} label="Chữ brand trên nền tối" value={`${darkFg.toFixed(2)}:1`} />
              <Check ok={dangerGap >= 20} warn={dangerGap >= 10} label="Khác hue so với danger" value={`${dangerGap.toFixed(0)}°`} />
              <Check ok={target >= 24} warn label="Vùng bấm nhỏ nhất (size small)" value={`${target}px`} />
              {axes.neutrals !== "pure" && (
                <Check ok={minNeutral >= 4.5} label="Chữ trên nền trung tính (light, dark)" value={`${minNeutral.toFixed(2)}:1`} />
              )}
            </ul>
            {target < 24 && (
              <MessageBar intent="warning" layout="multiline" title="Control size small dưới 24px">
                Ở mật độ gọn, control size small còn {target}px. Dùng size medium cho control đứng sát nhau (WCAG 2.5.8).
              </MessageBar>
            )}
            {onWhite < 4.5 && (
              <Button icon={<Wand20Regular />} onClick={() => pickKey(adjustKeyForContrast(key))}>
                Tự chỉnh key để đạt 4.5:1
              </Button>
            )}
            {dangerGap < 20 && (
              <MessageBar intent="warning" layout="multiline" title="Brand gần màu danger">
                Nút chính dễ bị nhầm với hành động phá huỷ. Nên chọn hue lệch ≥ 20° so với đỏ #C50F1F.
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

          <DocSection id="preview" title="Xem trước" description="Component thật dùng theme vừa tạo — theme lồng nên không ảnh hưởng phần còn lại của trang.">
            <div className="flex flex-col gap-4">
              <ToggleGroup type="single" size="small" aria-label="Hướng chữ của bản xem trước" value={dir} onValueChange={(v) => v && setDir(v as "ltr" | "rtl")}>
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
            title="Xuất token"
            description="CSS: dán vào file CSS chính của app, ngay sau @import &quot;yugen-ui/theme.css&quot;, rồi đặt brand cho YugenProvider. Gồm brand ramp và mọi lựa chọn ở Hình dáng & nhịp. JSON (chỉ brand ramp): nhập vào Figma (Tokens Studio, Variables) hoặc Style Dictionary."
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
