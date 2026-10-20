import * as React from "react";
import {
  CheckmarkCircle16Filled,
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
  Field,
  Input,
  MessageBar,
  ProgressBar,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  RAMP_STEPS,
  adjustKeyForContrast,
  contrastRatio,
  generateBrandRamp,
  hueDistance,
  isHexColor,
  rampToCss,
  rampToStyle,
} from "@/lib/brandRamp";
import { DocSection, PageHeader } from "../blocks";
import { CodeBlock, CopyButton } from "../CodeBlock";

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
    <li className="flex items-center justify-between gap-M border-t border-stroke-3 py-S first:border-t-0">
      <span className="text-body1">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-XS text-caption1 font-semibold tabular-nums",
          ok ? "text-success-foreground-1" : warn ? "text-warning-foreground-1" : "text-danger-foreground-1",
        )}
      >
        {ok ? <CheckmarkCircle16Filled /> : warn ? <Warning16Filled /> : <DismissCircle16Filled />}
        {value}
      </span>
    </li>
  );
}

function Preview({ theme, style }: { theme: "light" | "dark"; style: React.CSSProperties }) {
  return (
    <div data-theme={theme} data-brand="custom" style={style} className="flex flex-col gap-L rounded-2xlarge border border-stroke-2 bg-background-2 p-XL">
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{theme === "light" ? "Light" : "Dark"}</span>
        <Badge appearance="tint">Mới</Badge>
      </div>
      <Card className="gap-M">
        <div className="flex items-center gap-S">
          <span className="inline-flex size-9 items-center justify-center rounded-circular bg-brand-background-2 text-brand-foreground-2">
            <Home20Regular />
          </span>
          <div>
            <p className="text-body1 font-semibold">Không gian làm việc</p>
            <p className="text-caption1 text-foreground-3">
              Đã đồng bộ · <a className="text-link hover:underline" href="#/theme-designer">Xem chi tiết</a>
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
        <div className="flex flex-wrap items-center gap-L">
          <Checkbox label="Đã chọn" defaultChecked />
          <Switch label="Bật" defaultChecked />
        </div>
        <Slider aria-label="Mẫu slider" defaultValue={[60]} />
        <ProgressBar value={0.62} thickness="large" aria-label="Tiến độ" />
        <div className="flex flex-wrap gap-S">
          <Button appearance="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button appearance="subtle" icon={<Settings20Regular />} aria-label="Cài đặt" />
        </div>
      </Card>
    </div>
  );
}

export function ThemeDesignerPage() {
  const [key, setKey] = React.useState("#C2347A");
  const [hexInput, setHexInput] = React.useState("#C2347A");
  const [name, setName] = React.useState("my-brand");
  const [vibrancy, setVibrancy] = React.useState([100]);
  const [torsion, setTorsion] = React.useState([0]);
  const [applyGlobally, setApplyGlobally] = React.useState(false);

  const ramp = React.useMemo(
    () => generateBrandRamp(key, { vibrancy: vibrancy[0] / 100, hueTorsion: torsion[0] }),
    [key, vibrancy, torsion],
  );
  const style = React.useMemo(() => rampToStyle(ramp) as React.CSSProperties, [ramp]);
  const css = rampToCss(name || "my-brand", ramp);

  const onWhite = contrastRatio(ramp[7], "#ffffff");
  const tintText = contrastRatio(ramp[6], ramp[15]);
  const darkFg = contrastRatio(ramp[9], "#292929");
  const darkButton = contrastRatio(ramp[6], "#ffffff");
  const dangerGap = hueDistance(ramp[7], DANGER);

  React.useEffect(() => {
    const root = document.documentElement;
    const vars = rampToStyle(ramp);
    if (applyGlobally) Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return () => Object.keys(vars).forEach((k) => root.style.removeProperty(k));
  }, [applyGlobally, ramp]);

  const pickKey = (hex: string) => {
    setKey(hex);
    setHexInput(hex.toUpperCase());
  };

  return (
    <div className="pb-XXXL">
      <PageHeader
        eyebrow="Công cụ"
        title="Theme Designer"
        lead="Tạo brand ramp 16 bậc từ một màu key — cùng thuật toán đã sinh ra Sakura. Xem trước trên component thật ở Light/Dark, kiểm tra tương phản rồi copy CSS vào tokens.css."
      />

      <div className="grid gap-XXL xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* ---------- Controls ---------- */}
        <div className="flex flex-col gap-L xl:sticky xl:top-24 xl:self-start">
          <Card size="large" className="gap-L rounded-2xlarge p-XL">
            <div>
              <p className="mb-S text-body1 font-semibold">Màu key (brand80)</p>
              <div className="flex items-end gap-S">
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
              <div className="mt-M flex flex-wrap gap-S" role="radiogroup" aria-label="Màu có sẵn">
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

          <Card size="large" className="gap-S rounded-2xlarge p-XL">
            <p className="text-body1 font-semibold">Kiểm tra</p>
            <ul>
              <Check ok={onWhite >= 4.5} label="Chữ trắng trên nút primary (light)" value={`${onWhite.toFixed(2)}:1`} />
              <Check ok={darkButton >= 4.5} label="Chữ trắng trên nút primary (dark)" value={`${darkButton.toFixed(2)}:1`} />
              <Check ok={tintText >= 4.5} label="Chữ brand trên nền tint" value={`${tintText.toFixed(2)}:1`} />
              <Check ok={darkFg >= 4.5} label="Chữ brand trên nền tối" value={`${darkFg.toFixed(2)}:1`} />
              <Check ok={dangerGap >= 20} warn={dangerGap >= 10} label="Khác hue so với danger" value={`${dangerGap.toFixed(0)}°`} />
            </ul>
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
                  className="group/step flex h-28 flex-1 flex-col items-center justify-end gap-XXS pb-S"
                  style={{ background: hex, color: contrastRatio(hex, "#ffffff") >= 3 ? "#ffffff" : "#242424" }}
                >
                  <span className="font-mono text-[10px] font-semibold">{RAMP_STEPS[i]}</span>
                  <span className="hidden font-mono text-[9px] opacity-80 group-hover/step:block">{hex.slice(1)}</span>
                </button>
              ))}
            </div>
          </DocSection>

          <DocSection id="preview" title="Xem trước" description="Component thật dùng ramp vừa tạo — theme lồng nên không ảnh hưởng phần còn lại của trang.">
            <div className="grid gap-L lg:grid-cols-2">
              <Preview theme="light" style={style} />
              <Preview theme="dark" style={style} />
            </div>
          </DocSection>

          <DocSection id="export" title="Xuất CSS" description="Dán vào src/styles/tokens.css (sau các block brand có sẵn), rồi đặt data-brand trên <html> hoặc YugenProvider.">
            <div className="flex flex-col gap-M">
              <CodeBlock code={css} />
              <CodeBlock
                code={`<YugenProvider applyToDocument brand="${name || "my-brand"}" theme="light">
  <App />
</YugenProvider>`}
              />
              <div className="flex justify-end">
                <CopyButton text={css} className="border border-stroke-1" />
              </div>
            </div>
          </DocSection>
        </div>
      </div>
    </div>
  );
}
