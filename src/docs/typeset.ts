import { FONTS, type FontOption } from "./themeAxes";

/**
 * Typeset (#244): trạng thái của trang /typeset và phần xuất ra (CSS preset, đoạn bọc Prose, link font). Trang chỉ đặt các
 * biến mà `yugen-prose` đọc: --prose-font-body / -heading / -mono, --prose-size, --prose-leading, --prose-flow. Độ rộng dòng
 * (measure) là `max-w` của khung bọc, không nằm trong CSS.
 */
export type TypesetPreset = "docs" | "article" | "chat" | "compact";

export interface TypesetState {
  preset: TypesetPreset;
  /** id trong BODY_FONTS ("inherit" = font của app). */
  body: string;
  /** id trong BODY_FONTS, hoặc "body" = cùng font chữ thân. */
  heading: string;
  /** id trong MONO_FONTS ("inherit" = font mono của theme). */
  mono: string;
  /** Cỡ chữ (px). */
  size: number;
  /** Line-height (không đơn vị). */
  leading: number;
  /** Khoảng cách giữa các khối (em). */
  flow: number;
  /** Độ rộng dòng tối đa (ch). */
  measure: number;
}

/** Giá trị của từng preset — cùng nhịp với các class yugen-prose-* trong theme (body1 14/20px, body2 16px…). */
export const PRESET_VALUES: Record<TypesetPreset, Pick<TypesetState, "size" | "leading" | "flow" | "measure">> = {
  docs: { size: 14, leading: 1.43, flow: 1.15, measure: 72 },
  article: { size: 16, leading: 1.75, flow: 1.25, measure: 68 },
  chat: { size: 14, leading: 1.43, flow: 0.85, measure: 64 },
  compact: { size: 12, leading: 1.33, flow: 0.65, measure: 60 },
};

export const PRESETS = Object.keys(PRESET_VALUES) as TypesetPreset[];

const SERIF = 'Georgia, Cambria, "Times New Roman", serif';
const MONO = 'ui-monospace, "Cascadia Code", Consolas, monospace';

/** Font chữ thân / tiêu đề: font của Theme Designer (trừ Segoe = font mặc định của app) cộng vài font serif cho bài viết. */
export const BODY_FONTS: FontOption[] = [
  { id: "inherit", label: "App font", stack: null },
  ...FONTS.filter((f) => f.id !== "segoe"),
  { id: "source-serif", label: "Source Serif 4", stack: `"Source Serif 4", ${SERIF}`, google: "Source+Serif+4:wght@400;600" },
  { id: "lora", label: "Lora", stack: `"Lora", ${SERIF}`, google: "Lora:wght@400;600" },
];

export const MONO_FONTS: FontOption[] = [
  { id: "inherit", label: "Theme mono", stack: null },
  { id: "jetbrains", label: "JetBrains Mono", stack: `"JetBrains Mono", ${MONO}`, google: "JetBrains+Mono:wght@400;600" },
  { id: "plex-mono", label: "IBM Plex Mono", stack: `"IBM Plex Mono", ${MONO}`, google: "IBM+Plex+Mono:wght@400;600" },
  { id: "source-code", label: "Source Code Pro", stack: `"Source Code Pro", ${MONO}`, google: "Source+Code+Pro:wght@400;600" },
];

export const DEFAULT_TYPESET: TypesetState = { preset: "docs", body: "inherit", heading: "body", mono: "inherit", ...PRESET_VALUES.docs };

export const LIMITS = {
  size: { min: 12, max: 22, step: 1 },
  leading: { min: 1.2, max: 2, step: 0.05 },
  flow: { min: 0.5, max: 2, step: 0.05 },
  measure: { min: 45, max: 90, step: 1 },
} as const;

const round = (n: number, digits = 2) => Number(n.toFixed(digits));
const clamp = (n: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, n));
const fontById = (list: FontOption[], id: string) => list.find((f) => f.id === id);

/** Áp một preset: đổi nhịp (cỡ, line-height, khoảng cách, độ rộng), giữ font. */
export const applyPreset = (state: TypesetState, preset: TypesetPreset): TypesetState => ({ ...state, preset, ...PRESET_VALUES[preset] });

/** Biến CSS cho khung xem trước / CSS xuất ra. Font "inherit" không đặt biến (Prose dùng font của app / theme). */
export function typesetVars(state: TypesetState): Record<string, string> {
  const vars: Record<string, string> = {};
  const body = fontById(BODY_FONTS, state.body)?.stack;
  const heading = state.heading === "body" ? null : fontById(BODY_FONTS, state.heading)?.stack;
  const mono = fontById(MONO_FONTS, state.mono)?.stack;
  if (body) vars["--prose-font-body"] = body;
  if (heading) vars["--prose-font-heading"] = heading;
  if (mono) vars["--prose-font-mono"] = mono;
  vars["--prose-size"] = `${round(state.size / 16, 4)}rem`;
  vars["--prose-leading"] = String(round(state.leading));
  vars["--prose-flow"] = `${round(state.flow)}em`;
  return vars;
}

/** Tên class cho preset tự tạo: chữ thường, số, gạch ngang. */
export const sanitizeClassName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "my-prose";

/** CSS của preset: một class chỉ đặt biến, dùng cạnh `<Prose>` (hoặc class yugen-prose). */
export function typesetCss(state: TypesetState, className = "my-prose"): string {
  const lines = Object.entries(typesetVars(state)).map(([k, v]) => `  ${k}: ${v};`);
  return `.${sanitizeClassName(className)} {\n${lines.join("\n")}\n}\n`;
}

/** Đoạn bọc nội dung: preset + độ rộng dòng. */
export function typesetSnippet(state: TypesetState, className = "my-prose"): string {
  return `<Prose className="${sanitizeClassName(className)} max-w-[${state.measure}ch]">\n  <Markdown>{text}</Markdown>\n</Prose>\n`;
}

/** Font web cần nạp (Google Fonts), theo thứ tự chữ thân → tiêu đề → mono, không trùng. */
export function typesetFonts(state: TypesetState): FontOption[] {
  const picked = [fontById(BODY_FONTS, state.body), state.heading === "body" ? undefined : fontById(BODY_FONTS, state.heading), fontById(MONO_FONTS, state.mono)];
  return picked.filter((f, i): f is FontOption => Boolean(f?.google) && picked.findIndex((g) => g?.id === f!.id) === i);
}

/** Thẻ <link> cho index.html (Vite); null nếu không cần font web. */
export function typesetFontLink(state: TypesetState): string | null {
  const fonts = typesetFonts(state);
  if (!fonts.length) return null;
  const families = fonts.map((f) => `family=${f.google}`).join("&");
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families}&display=swap" />\n`;
}

/** Trạng thái → query `ts-*` của link chia sẻ (chỉ ghi giá trị khác mặc định của preset). */
export function typesetToParams(state: TypesetState, params = new URLSearchParams()): URLSearchParams {
  const base = { ...DEFAULT_TYPESET, ...PRESET_VALUES[state.preset] };
  if (state.preset !== DEFAULT_TYPESET.preset) params.set("ts-preset", state.preset);
  for (const key of ["body", "heading", "mono", "size", "leading", "flow", "measure"] as const) {
    if (state[key] !== base[key]) params.set(`ts-${key}`, String(state[key]));
  }
  return params;
}

/** Query `ts-*` → trạng thái; giá trị thiếu, lạ hoặc ngoài giới hạn dùng mặc định của preset. */
export function paramsToTypeset(params: URLSearchParams): TypesetState {
  const preset = PRESETS.includes(params.get("ts-preset") as TypesetPreset) ? (params.get("ts-preset") as TypesetPreset) : DEFAULT_TYPESET.preset;
  const base: TypesetState = { ...DEFAULT_TYPESET, ...PRESET_VALUES[preset], preset };
  const font = (key: "body" | "heading" | "mono", list: FontOption[], extra: string[] = []) => {
    const id = params.get(`ts-${key}`);
    return id && (list.some((f) => f.id === id) || extra.includes(id)) ? id : base[key];
  };
  const num = (key: "size" | "leading" | "flow" | "measure") => {
    const value = Number(params.get(`ts-${key}`));
    return params.has(`ts-${key}`) && Number.isFinite(value) ? round(clamp(value, LIMITS[key])) : base[key];
  };
  return {
    preset,
    body: font("body", BODY_FONTS),
    heading: font("heading", BODY_FONTS, ["body"]),
    mono: font("mono", MONO_FONTS),
    size: num("size"),
    leading: num("leading"),
    flow: num("flow"),
    measure: num("measure"),
  };
}

