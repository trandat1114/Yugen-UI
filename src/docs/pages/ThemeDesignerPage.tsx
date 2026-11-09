import * as React from "react";
import { ArrowDownload20Regular, ArrowReset20Regular, Wand20Regular } from "@fluentui/react-icons";
import {
  Button,
  CodeTabs,
  Combobox,
  Field,
  Input,
  MessageBar,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  useYugenTheme,
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
  RADIUS_FACTOR,
  axesToCss,
  axesToParams,
  glassChecks,
  neutralChecks,
  neutralSwatches,
  paramsToAxes,
  sanitizeFontName,
  sharedVars,
  smallestTarget,
  themeVars,
  type ThemeAxes,
} from "../themeAxes";
import { useLocale } from "../i18n";
import {
  Checks,
  DensityVisual,
  DesignerSection,
  ElevationVisual,
  GlassVisual,
  LightDark,
  OptionTiles,
  Pane,
  RadiusVisual,
  StatusIcon,
  SwatchStrip,
  TintVisual,
  checkStatus,
  translator,
  type CheckItem,
  type CheckStatus,
  type PreviewTheme,
} from "./ThemeDesignerParts";
import { ColorSample, FullPreview, GlassSample, MotionSample, ShapeSample, SurfacesSample, TypeSample } from "./ThemeDesignerPreviews";

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

const DEFAULT_KEY = "#C2347A";
const DANGER = "#c50f1f";
const FONT_OPTIONS = FONTS.map((f) => ({ value: f.id, label: f.label }));
/** Khoảng cách giữa các vạch trong hình của ô Mật độ (phóng to để thấy khác biệt). */
const DENSITY_GAP = { compact: 2, default: 4, comfortable: 6 } as const;
const ELEVATION_STRENGTH = { flat: 0, subtle: 0.6, default: 1 } as const;

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
    key: isHexColor(hex) ? hex.toUpperCase() : DEFAULT_KEY,
    vibrancy: num("td-vibrancy", 100, 50, 150),
    torsion: num("td-torsion", 0, -30, 30),
    name: (params.get("td-name") ?? "").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "my-brand",
    axes: paramsToAxes(params),
  };
}

const ratio = (n: number) => `${n.toFixed(2)}:1`;
const worst = (items: CheckItem[]): CheckStatus =>
  items.some((c) => c.status === "fail") ? "fail" : items.some((c) => c.status === "warn") ? "warn" : "ok";

function scrollToSection(id: string) {
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
}

/** Section đang đọc, cho thanh điều hướng (cùng cách với mục lục của trang docs). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = React.useState(ids[0]);
  const key = ids.join();
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);
  return active;
}

function RampStrip({ ramp }: { ramp: string[] }) {
  return (
    <div className="flex overflow-hidden rounded-xlarge border border-stroke-2">
      {ramp.map((hex, i) => (
        <button
          key={RAMP_STEPS[i]}
          type="button"
          title={`Copy ${hex}`}
          onClick={() => navigator.clipboard.writeText(hex)}
          className="group/step flex h-20 min-w-0 flex-1 flex-col items-center justify-end gap-0.5 pb-2"
          // Nhãn 10px: chữ trắng hoặc đen — bên nào tương phản cao hơn luôn ≥ 4.58:1 (ngưỡng 3:1 cũ để lọt bậc 90 ~3.7:1).
          style={{ background: hex, color: contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#000000") ? "#ffffff" : "#000000" }}
        >
          <span className="font-mono text-[10px] font-semibold">{RAMP_STEPS[i]}</span>
          <span className="hidden font-mono text-[9px] opacity-80 group-hover/step:block">{hex.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}

export function ThemeDesignerPage() {
  const t = translator(useLocale().locale);
  const docsTheme = useYugenTheme().theme;
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

  // Áp thử cho cả trang: cùng CSS với bản xuất, scope :root (light / dark theo data-theme hiện tại của <html>).
  React.useEffect(() => {
    if (!applyGlobally) return;
    const style = Object.assign(document.createElement("style"), { textContent: axesToCss(":root", axes, key, rampToStyle(ramp)) });
    style.dataset.themeDesigner = "";
    document.head.append(style);
    return () => style.remove();
  }, [applyGlobally, axes, key, ramp]);

  const exportFiles = [
    { name: `${brandName}.css`, code: css, language: "css" as const },
    { name: `${brandName}.tokens.json`, code: JSON.stringify(rampToDesignTokens(brandName, ramp), null, 2), language: "json" as const },
    { name: `${brandName}.tokens-studio.json`, code: JSON.stringify(rampToTokensStudio(brandName, ramp), null, 2), language: "json" as const },
  ];

  const pickKey = (hex: string) => {
    setKey(hex);
    setHexInput(hex.toUpperCase());
  };
  // Một ô cho font: chọn font có sẵn, hoặc gõ tên bất kỳ (Enter / rời ô) để dùng làm font tự nhập.
  const pickFont = (value: string) => {
    const custom = sanitizeFontName(value);
    setAxes((a) =>
      FONTS.some((f) => f.id === value)
        ? { ...a, font: value }
        : custom
          ? { ...a, font: "custom", customFont: custom }
          : { ...a, font: DEFAULT_AXES.font, customFont: "" },
    );
  };
  const isDefault =
    key.toUpperCase() === DEFAULT_KEY && vibrancy[0] === 100 && torsion[0] === 0 && JSON.stringify(axes) === JSON.stringify(DEFAULT_AXES);
  const resetAll = () => {
    pickKey(DEFAULT_KEY);
    setVibrancy([100]);
    setTorsion([0]);
    setAxes(DEFAULT_AXES);
  };

  /* ---------- kiểm tra, mỗi nhóm nằm trong section của control gây ra nó ---------- */
  const onWhite = contrastRatio(ramp[7], "#ffffff");
  const darkButton = contrastRatio(ramp[6], "#ffffff");
  const tintText = contrastRatio(ramp[6], ramp[15]);
  const darkFg = contrastRatio(ramp[9], "#292929");
  const dangerGap = hueDistance(ramp[7], DANGER);
  const minNeutral = Math.min(...neutralChecks(axes, key).map((c) => c.ratio));
  const minGlass = Math.min(...glassChecks(axes, key, ramp).map((c) => c.ratio));

  const colorChecks: CheckItem[] = [
    { label: t("Chữ trắng trên nút primary (light)", "White text on the primary button (light)"), value: ratio(onWhite), status: checkStatus(onWhite >= 4.5) },
    { label: t("Chữ trắng trên nút primary (dark)", "White text on the primary button (dark)"), value: ratio(darkButton), status: checkStatus(darkButton >= 4.5) },
    { label: t("Chữ brand trên nền tint", "Brand text on the tint background"), value: ratio(tintText), status: checkStatus(tintText >= 4.5) },
    { label: t("Chữ brand trên nền tối", "Brand text on a dark background"), value: ratio(darkFg), status: checkStatus(darkFg >= 4.5) },
    {
      label: t("Khác hue so với danger", "Hue distance from danger"),
      value: `${dangerGap.toFixed(0)}°`,
      status: checkStatus(dangerGap >= 20, dangerGap >= 10),
    },
  ];
  const typeChecks: CheckItem[] = [
    { label: t("Vùng bấm nhỏ nhất (size small)", "Smallest target (size small)"), value: `${target}px`, status: checkStatus(target >= 24, true) },
  ];
  const surfaceChecks: CheckItem[] = [
    {
      label: t("Chữ trên nền trung tính (light, dark)", "Text on neutral backgrounds (light, dark)"),
      value: ratio(minNeutral),
      status: checkStatus(minNeutral >= 4.5),
    },
  ];
  const glassCheckItems: CheckItem[] = [
    {
      label: t("Chữ trên glass, nền sau đen hoặc trắng (light, dark)", "Text on glass over black or white (light, dark)"),
      value: ratio(minGlass),
      status: checkStatus(minGlass >= 4.5),
    },
  ];

  const sections: { id: string; nav: string; checks?: CheckItem[] }[] = [
    { id: "color", nav: t("Màu", "Color"), checks: colorChecks },
    { id: "shape", nav: t("Hình dáng", "Shape") },
    { id: "type", nav: t("Mật độ & chữ", "Density & type"), checks: typeChecks },
    { id: "surfaces", nav: t("Nền & độ nổi", "Surfaces"), checks: surfaceChecks },
    { id: "motion", nav: t("Chuyển động", "Motion") },
    { id: "glass", nav: "Glass", checks: glassCheckItems },
    { id: "preview", nav: t("Xem trước", "Preview") },
    { id: "export", nav: t("Xuất", "Export") },
  ];
  const active = useActiveSection(sections.map((s) => s.id));
  const allChecks = sections.flatMap((s) => s.checks ?? []);
  const attention = sections.filter((s) => s.checks && worst(s.checks) !== "ok");
  const checksTitle = t("Kiểm tra", "Checks");
  const checkTitle = t("Kiểm tra", "Check");

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow={t("Công cụ", "Tools")}
        title="Theme Designer"
        lead={t(
          "Tạo theme từ một màu key, rồi chọn bo góc, mật độ, chữ, màu trung tính, độ nổi và chuyển động. Các trục ngoài màu chỉ có vài bậc đã được kiểm tra; mỗi phần có bản xem trước và kiểm tra riêng, cuối trang là light, dark và high contrast cạnh nhau.",
          "Build a theme from one key color, then choose corner radius, density, type, neutral colors, elevation and motion. Apart from color, each axis has a few tested steps. Each part has its own preview and checks; at the end, light, dark and high contrast sit side by side.",
        )}
      />

      {/* ---------- Thanh điều hướng + thao tác chung (dính dưới TopBar từ lg) ---------- */}
      <div className="z-20 -mx-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-stroke-2 bg-shell/85 px-4 py-2 backdrop-blur-md md:-mx-12 md:px-12 lg:sticky lg:top-18.5">
        <nav aria-label={t("Các phần của Theme Designer", "Theme Designer sections")} className="-mx-1 min-w-0 flex-1 overflow-x-auto">
          <ul className="flex gap-0.5 px-1">
            {sections.map((s) => {
              const status = s.checks ? worst(s.checks) : "ok";
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={active === s.id || undefined}
                    onClick={() => scrollToSection(s.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-medium px-2.5 text-body1 whitespace-nowrap transition-colors duration-faster",
                      active === s.id ? "bg-brand-background-2 font-semibold text-brand-foreground-2" :"text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1",
                    )}
                  >
                    {s.nav}
                    {status !== "ok" && (
                      <span className={cn("inline-flex", status === "fail" ? "text-danger-foreground-1" : "text-warning-foreground-1")}>
                        <StatusIcon status={status} />
                        <span className="sr-only">{t("(cần xem lại)", "(needs attention)")}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Switch label={t("Thử trên cả trang", "Try on the whole page")} checked={applyGlobally} onCheckedChange={setApplyGlobally} />
          <Button size="small" icon={<ArrowReset20Regular />} disabled={isDefault} onClick={resetAll}>
            {t("Về mặc định", "Reset")}
          </Button>
          <CopyButton text={shareUrl} label={t("Copy link", "Copy link")} className="border border-stroke-1" />
        </div>
      </div>

      <div className="lg:*:scroll-mt-36">
        {/* ---------- 1. Màu ---------- */}
        <DesignerSection
          id="color"
          title={t("Màu", "Color")}
          description={t(
            "Màu key là brand80; 15 bậc còn lại sinh từ nó. Light và dark dùng các bậc khác nhau nên cả hai đều được kiểm tra.",
            "The key color is brand80; the other 15 steps are generated from it. Light and dark use different steps, so both are checked.",
          )}
          controls={
            <>
              <div>
                <p className="mb-2 text-body1 font-semibold">{t("Màu key (brand80)", "Key color (brand80)")}</p>
                <div className="flex items-end gap-2">
                  <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-large border border-stroke-1" style={{ background: key }}>
                    <span className="sr-only">{t("Chọn màu", "Pick a color")}</span>
                    <input type="color" value={key} onChange={(e) => pickKey(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
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
            </>
          }
        >
          <RampStrip ramp={ramp} />
          <LightDark style={previewStyle}>{() => <ColorSample />}</LightDark>
          <Checks title={checksTitle} items={colorChecks}>
            {onWhite < 4.5 && (
              <Button className="self-start" icon={<Wand20Regular />} onClick={() => pickKey(adjustKeyForContrast(key))}>
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
          </Checks>
        </DesignerSection>

        {/* ---------- 2. Hình dáng ---------- */}
        <DesignerSection
          id="shape"
          title={t("Hình dáng", "Shape")}
          description={t(
            "Cả ramp bo góc đổi cùng tỉ lệ để control, card và dialog giữ tương quan; nút tròn vẫn tròn.",
            "The whole radius ramp scales by one ratio, so controls, cards and dialogs keep their proportions. Circular buttons stay circular.",
          )}
          controls={
            <OptionTiles
              label={t("Bo góc", "Corner radius")}
              value={axes.radius}
              onChange={(v) => setAxis("radius", v)}
              options={(
                [
                  ["none", t("Không", "None")],
                  ["small", t("Nhỏ", "Small")],
                  ["medium", t("Vừa", "Medium")],
                  ["large", t("Lớn", "Large")],
                  ["full", t("Tròn", "Full")],
                ] as const
              ).map(([value, label]) => ({ value, label, visual: <RadiusVisual radius={10 * RADIUS_FACTOR[value]} /> }))}
            />
          }
        >
          <Pane theme={docsTheme} style={previewStyle(docsTheme)}>
            <ShapeSample axes={axes} />
          </Pane>
        </DesignerSection>

        {/* ---------- 3. Mật độ & chữ ---------- */}
        <DesignerSection
          id="type"
          title={t("Mật độ & chữ", "Density & type")}
          controls={
            <>
              <OptionTiles
                label={t("Mật độ", "Density")}
                note={t(
                  "Một hệ số cho spacing và chiều cao control. Ở bậc Gọn, đoạn YugenProvider phần Xuất thêm density và control mặc định size small.",
                  "One factor for spacing and control heights. At Compact, the YugenProvider snippet under Export adds density, and controls default to size small.",
                )}
                value={axes.density}
                onChange={(v) => setAxis("density", v)}
                options={(
                  [
                    ["compact", t("Gọn", "Compact")],
                    ["default", t("Mặc định", "Default")],
                    ["comfortable", t("Thoáng", "Comfortable")],
                  ] as const
                ).map(([value, label]) => ({ value, label, visual: <DensityVisual gap={DENSITY_GAP[value]} /> }))}
              />
              <Field
                label={t("Font chữ", "Font")}
                hint={t(
                  "Chọn trong danh sách hoặc gõ tên font rồi nhấn Enter. Stack nào cũng kết thúc bằng font hệ thống; font web không đi kèm CSS xuất ra.",
                  "Pick one from the list, or type a font name and press Enter. Every stack ends with system fonts; web fonts are not included in the exported CSS.",
                )}
              >
                <Combobox
                  freeform
                  options={FONT_OPTIONS}
                  value={axes.font === "custom" ? axes.customFont : axes.font}
                  onValueChange={pickFont}
                  placeholder="Atkinson Hyperlegible"
                />
              </Field>
              <OptionTiles
                label={t("Cỡ chữ gốc", "Base font size")}
                note={t(
                  "Cả type ramp nhân theo tỉ lệ; line height được tính lại, không chỉnh riêng.",
                  "The whole type ramp scales by the same ratio. Line heights are recalculated, not set one by one.",
                )}
                value={String(axes.baseSize) as "14" | "15" | "16"}
                onChange={(v) => setAxis("baseSize", Number(v) as ThemeAxes["baseSize"])}
                options={(["14", "15", "16"] as const).map((value) => ({
                  value,
                  label: `${value}px`,
                  visual: (
                    <span className="leading-none font-semibold text-foreground-1" style={{ fontSize: Number(value) * 1.25 }}>
                      Aa
                    </span>
                  ),
                }))}
              />
            </>
          }
        >
          <Pane theme={docsTheme} style={previewStyle(docsTheme)}>
            <TypeSample axes={axes} />
          </Pane>
          <Checks title={checkTitle} items={typeChecks}>
            {target < 24 && (
              <MessageBar intent="warning" layout="multiline" title={t("Control size small dưới 24px", "Size small controls are below 24px")}>
                {t(
                  `Ở mật độ gọn, control size small còn ${target}px. Dùng size medium cho control đứng sát nhau (WCAG 2.5.8).`,
                  `At compact density, size small controls are ${target}px. Use size medium for controls placed close together (WCAG 2.5.8).`,
                )}
              </MessageBar>
            )}
          </Checks>
        </DesignerSection>

        {/* ---------- 4. Nền & độ nổi ---------- */}
        <DesignerSection
          id="surfaces"
          title={t("Nền & độ nổi", "Surfaces & elevation")}
          description={t("Đổi ở light và dark; high contrast giữ nguyên.", "Applies to light and dark; high contrast stays unchanged.")}
          controls={
            <>
              <OptionTiles
                label={t("Màu trung tính", "Neutral colors")}
                note={t(
                  "Pha nhẹ một sắc vào thang xám; tương phản được kiểm tra lại.",
                  "Adds a slight tint to the gray scale, and contrast is checked again.",
                )}
                value={axes.neutrals}
                onChange={(v) => setAxis("neutrals", v)}
                options={(
                  [
                    ["pure", t("Xám", "Gray")],
                    ["warm", t("Ấm", "Warm")],
                    ["cool", t("Lạnh", "Cool")],
                    ["brand", t("Theo brand", "Brand")],
                  ] as const
                ).map(([value, label]) => ({ value, label, visual: <SwatchStrip colors={neutralSwatches(value, key)} /> }))}
              />
              <OptionTiles
                label={t("Độ nổi", "Elevation")}
                note={t(
                  "Cả thang bóng đổi cùng lúc. Phẳng vẫn giữ một nửa bóng cho Menu, Dialog để tách khỏi nền.",
                  "The whole shadow scale changes at once. Flat keeps half the shadow on Menu and Dialog so they stand out from the background.",
                )}
                value={axes.elevation}
                onChange={(v) => setAxis("elevation", v)}
                options={(
                  [
                    ["flat", t("Phẳng", "Flat")],
                    ["subtle", t("Nhẹ", "Subtle")],
                    ["default", t("Mặc định", "Default")],
                  ] as const
                ).map(([value, label]) => ({ value, label, visual: <ElevationVisual strength={ELEVATION_STRENGTH[value]} /> }))}
              />
            </>
          }
        >
          <LightDark style={previewStyle}>{() => <SurfacesSample />}</LightDark>
          <Checks title={checkTitle} items={surfaceChecks} />
        </DesignerSection>

        {/* ---------- 5. Chuyển động ---------- */}
        <DesignerSection
          id="motion"
          title={t("Chuyển động", "Motion")}
          description={t(
            "Nhân thời lượng ×0.75 / ×1 / ×1.25, tối đa 500ms. prefers-reduced-motion vẫn được ưu tiên.",
            "Multiplies durations by ×0.75 / ×1 / ×1.25, up to 500ms. prefers-reduced-motion still takes priority.",
          )}
          controls={
            <OptionTiles
              label={t("Chuyển động", "Motion")}
              value={axes.motion}
              onChange={(v) => setAxis("motion", v)}
              options={(
                [
                  ["reduced", t("Ít", "Less"), "×0.75"],
                  ["default", t("Mặc định", "Default"), "×1"],
                  ["expressive", t("Nhiều", "More"), "×1.25"],
                ] as const
              ).map(([value, label, factor]) => ({
                value,
                label,
                visual: <span className="font-mono text-body1 text-foreground-1">{factor}</span>,
              }))}
            />
          }
        >
          <Pane theme={docsTheme} style={previewStyle(docsTheme)}>
            <MotionSample axes={axes} />
          </Pane>
        </DesignerSection>

        {/* ---------- 6. Glass ---------- */}
        <DesignerSection
          id="glass"
          title="Glass"
          description={t(
            "Vật liệu glass của Yugen Labs. Blur, bão hoà và độ đục đi cùng nhau; độ đục không xuống dưới mức giữ chữ 4.5:1 trên nền đen hay trắng.",
            "The Yugen Labs glass material. Blur, saturation and opacity go together; opacity never goes below what keeps text at 4.5:1 over black or white.",
          )}
          controls={
            <>
              <OptionTiles
                label="Glass (Yugen Labs)"
                note={t(
                  `Blur ${GLASS[axes.glass].blur}px, bão hoà ${GLASS[axes.glass].saturation}%, độ đục ${GLASS[axes.glass].alpha.light} / ${GLASS[axes.glass].alpha.dark} (light / dark).`,
                  `Blur ${GLASS[axes.glass].blur}px, saturation ${GLASS[axes.glass].saturation}%, opacity ${GLASS[axes.glass].alpha.light} / ${GLASS[axes.glass].alpha.dark} (light / dark).`,
                )}
                value={axes.glass}
                onChange={(v) => setAxis("glass", v)}
                options={(
                  [
                    ["airy", t("Trong", "Airy")],
                    ["default", t("Mặc định", "Default")],
                    ["frosted", t("Mờ đục", "Frosted")],
                  ] as const
                ).map(([value, label]) => ({
                  value,
                  label,
                  visual: <GlassVisual blur={GLASS[value].blur} alpha={GLASS[value].alpha.light} />,
                }))}
              />
              <OptionTiles
                label={t("Sắc của glass", "Glass tint")}
                note={t(
                  "Theo brand: nền glass lấy bậc 160 (light) hoặc 20 (dark) của ramp. Cần trình duyệt có relative color syntax.",
                  "Brand: the glass takes step 160 (light) or 20 (dark) of the ramp. Needs a browser with relative color syntax.",
                )}
                value={axes.glassTint}
                onChange={(v) => setAxis("glassTint", v)}
                options={[
                  { value: "neutral", label: t("Trung tính", "Neutral"), visual: <TintVisual light="#ffffff" dark="#292929" /> },
                  { value: "brand", label: t("Theo brand", "Brand"), visual: <TintVisual light={ramp[15]} dark={ramp[1]} /> },
                ]}
              />
            </>
          }
        >
          <LightDark style={previewStyle}>{(theme) => <GlassSample theme={theme} />}</LightDark>
          <Checks title={checkTitle} items={glassCheckItems} />
        </DesignerSection>

        {/* ---------- 7. Xem trước tổng hợp: ba theme, ba cột, cùng một hàng ---------- */}
        <DocSection
          id="preview"
          title={t("Xem trước", "Preview")}
          description={t(
            "Component thật dùng theme vừa tạo, light, dark và high contrast cạnh nhau. Theme lồng nên không ảnh hưởng phần còn lại của trang.",
            "Real components with the new theme, light, dark and high contrast side by side. The theme is nested, so the rest of the page is not affected.",
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
              {attention.length === 0 ? (
                <p className="inline-flex items-center gap-1.5 text-body1 text-success-foreground-1">
                  <StatusIcon status="ok" />
                  {t(`Đạt cả ${allChecks.length} kiểm tra`, `All ${allChecks.length} checks pass`)}
                </p>
              ) : (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body1">
                  <span className={cn("inline-flex", worst(allChecks) === "fail" ? "text-danger-foreground-1" : "text-warning-foreground-1")}>
                    <StatusIcon status={worst(allChecks)} />
                  </span>
                  {t(
                    `Đạt ${allChecks.filter((c) => c.status === "ok").length}/${allChecks.length} kiểm tra. Xem lại:`,
                    `${allChecks.filter((c) => c.status === "ok").length} of ${allChecks.length} checks pass. Review:`,
                  )}
                  {attention.map((s) => (
                    <button key={s.id} type="button" onClick={() => scrollToSection(s.id)} className="text-link hover:underline">
                      {s.nav}
                    </button>
                  ))}
                </p>
              )}
            </div>
            <FullPreview style={previewStyle} dir={dir} />
          </div>
        </DocSection>

        {/* ---------- 8. Xuất ---------- */}
        <DocSection
          id="export"
          title={t("Xuất token", "Export tokens")}
          description={t(
            'CSS: dán vào file CSS chính của app, ngay sau @import "yugen-ui/theme.css", rồi đặt brand cho YugenProvider. Gồm brand ramp và mọi lựa chọn ở trên. JSON (chỉ brand ramp): nhập vào Figma (Tokens Studio, Variables) hoặc Style Dictionary.',
            'CSS: paste it into your app\'s main CSS file, right after @import "yugen-ui/theme.css", then set the brand on YugenProvider. It contains the brand ramp and every option above. JSON (brand ramp only): import it into Figma (Tokens Studio, Variables) or Style Dictionary.',
          )}
        >
          <div className="flex flex-col gap-3">
            <Field label={t("Tên brand", "Brand name")} hint={`${t("Dùng", "Use")}: <html data-brand="${brandName}">`} className="max-w-sm">
              <Input value={name} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} />
            </Field>
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
              code={`<YugenProvider applyToDocument brand="${brandName}" theme="light"${axes.density === "default" ? "" : ` density="${axes.density}"`}>
  <App />
</YugenProvider>`}
            />
          </div>
        </DocSection>
      </div>
    </div>
  );
}
