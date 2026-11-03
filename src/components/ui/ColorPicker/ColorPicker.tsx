/** Fluent 2 ColorPicker — https://storybooks.fluentui.dev/react/?path=/docs/components-colorpicker--docs */
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Eyedropper20Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { fieldControlClass } from "@/components/ui/Field/Field";
import { Select } from "@/components/ui/Select/Select";
import { ColorSwatch, SwatchPicker } from "@/components/ui/SwatchPicker/SwatchPicker";
import { useYugenMessages } from "../YugenProvider/context";
import { colorPickerMessagesEn } from "./messages";

export { colorPickerMessagesVi, colorPickerMessagesEn, type ColorPickerMessages } from "./messages";

/* ------------------------------------------------------------------ Chuyển đổi màu */

/** r, g, b: 0–255 · a: 0–1. */
export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
/** h: 0–360 · s, l: 0–100 · a: 0–1. */
export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}
/** h: 0–360 · s, v: 0–100 · a: 0–1. */
export interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, digits = 0) => Math.round(n * 10 ** digits) / 10 ** digits;

function hsvToRgb({ h, s, v, a }: HsvaColor): RgbaColor {
  const sv = s / 100;
  const vv = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (vv - vv * sv * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return { r: f(5), g: f(3), b: f(1), a };
}

/** RGB → HSV; màu xám (không có sắc độ) giữ `hue` cũ để thanh sắc độ không nhảy về 0. */
function rgbToHsv({ r, g, b, a }: RgbaColor, hue = 0): HsvaColor {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const d = max - Math.min(rr, gg, bb);
  let h = hue;
  if (d) {
    h = max === rr ? ((gg - bb) / d) % 6 : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? (d / max) * 100 : 0, v: max * 100, a };
}

function hsvToHsl({ h, s, v, a }: HsvaColor): HslaColor {
  const sv = s / 100;
  const vv = v / 100;
  const l = vv * (1 - sv / 2);
  const sl = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100, a };
}

function hslToHsv({ h, s, l, a }: HslaColor): HsvaColor {
  const sl = s / 100;
  const ll = l / 100;
  const v = ll + sl * Math.min(ll, 1 - ll);
  return { h, s: v === 0 ? 0 : 2 * (1 - ll / v) * 100, v: v * 100, a };
}

const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

/** "#rrggbb", hoặc "#rrggbbaa" khi `a` < 1. */
function toHex({ r, g, b, a }: RgbaColor) {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;
}

const NUMBER = String.raw`([-+]?\d*\.?\d+)`;
const RGB_RE = new RegExp(String.raw`^rgba?\(\s*${NUMBER}[\s,]+${NUMBER}[\s,]+${NUMBER}(?:[\s,/]+${NUMBER}(%?))?\s*\)$`, "i");
const HSL_RE = new RegExp(String.raw`^hsla?\(\s*${NUMBER}(?:deg)?[\s,]+${NUMBER}%?[\s,]+${NUMBER}%?(?:[\s,/]+${NUMBER}(%?))?\s*\)$`, "i");

const alphaOf = (value: string | undefined, percent: string | undefined) =>
  value === undefined ? 1 : clamp(Number(value) / (percent ? 100 : 1), 0, 1);

/** Đọc màu dạng hex (#rgb, #rgba, #rrggbb, #rrggbbaa), `rgb()` / `rgba()` hoặc `hsl()` / `hsla()`. `null` nếu không hiểu. */
export function parseColor(input: string): RgbaColor | null {
  const text = input.trim();
  const hex = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? round(n(6) / 255, 3) : 1 };
  }
  const rgb = RGB_RE.exec(text);
  if (rgb) return { r: clamp(Number(rgb[1]), 0, 255), g: clamp(Number(rgb[2]), 0, 255), b: clamp(Number(rgb[3]), 0, 255), a: alphaOf(rgb[4], rgb[5]) };
  const hsl = HSL_RE.exec(text);
  if (hsl) {
    const color: HslaColor = { h: ((Number(hsl[1]) % 360) + 360) % 360, s: clamp(Number(hsl[2]), 0, 100), l: clamp(Number(hsl[3]), 0, 100), a: alphaOf(hsl[4], hsl[5]) };
    return hsvToRgb(hslToHsv(color));
  }
  return null;
}

/** Màu đã chọn ở mọi dạng: `hex` ("#rrggbb" / "#rrggbbaa") và số đã làm tròn. */
export interface ColorPickerChangeData {
  hex: string;
  rgb: RgbaColor;
  hsl: HslaColor;
  hsv: HsvaColor;
}

function dataOf(hsv: HsvaColor): ColorPickerChangeData {
  const rgb = hsvToRgb(hsv);
  const hsl = hsvToHsl(hsv);
  const a = round(hsv.a, 2);
  return {
    hex: toHex(rgb),
    rgb: { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b), a },
    hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l), a },
    hsv: { h: Math.round(hsv.h), s: Math.round(hsv.s), v: Math.round(hsv.v), a },
  };
}

/* ------------------------------------------------------------------ Phần con */

/** Nền ô vuông cho màu trong suốt (token, không phải màu cứng). */
const checkerClass =
  "bg-[repeating-conic-gradient(var(--colorNeutralBackground4)_0_25%,var(--colorNeutralBackground1)_0_50%)] bg-size-[--spacing(2)_--spacing(2)]";

/** Viền trắng + bóng: thấy rõ trên mọi màu nền. */
const thumbClass = cn(
  "block rounded-circular border-2 border-background-1 shadow-4 ring-1 ring-stroke-accessible",
  "cursor-grab active:cursor-grabbing data-disabled:cursor-not-allowed",
);

// Dải màu là dữ liệu (không gian màu), không phải màu giao diện: luôn đỏ → vàng → … → đỏ, trắng / đen tuyệt đối.
const HUE_TRACK = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => `hsl(${h} 100% 50%)`).join(", ")})`;

interface ColorSliderProps {
  label: string;
  value: number;
  max: number;
  valueText: string;
  track: string;
  thumbColor: string;
  checker?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** Thanh sắc độ / độ đục: Radix Slider (bàn phím, kéo, aria) với dải màu làm track. Luôn trái → phải như phổ màu. */
function ColorSlider({ label, value, max, valueText, track, thumbColor, checker, disabled, onChange }: ColorSliderProps) {
  return (
    <SliderPrimitive.Root
      dir="ltr"
      min={0}
      max={max}
      step={1}
      value={[value]}
      disabled={disabled}
      onValueChange={([v]) => onChange(v)}
      className="relative flex h-5 w-full touch-none items-center select-none data-disabled:opacity-50"
    >
      <SliderPrimitive.Track className={cn("relative h-3 grow overflow-hidden rounded-circular", checker && checkerClass)}>
        <span aria-hidden className="absolute inset-0 rounded-circular ring-1 ring-stroke-1 ring-inset" style={{ background: track }} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb aria-label={label} aria-valuetext={valueText} className={cn(thumbClass, "size-5")} style={{ backgroundColor: thumbColor }} />
    </SliderPrimitive.Root>
  );
}

interface ColorAreaProps {
  hsv: HsvaColor;
  label: string;
  valueText: string;
  disabled?: boolean;
  onChange: (next: { s: number; v: number }) => void;
}

/** Vùng 2 chiều: ngang = độ bão hoà, dọc = độ sáng. Mũi tên trái / phải đổi bão hoà, lên / xuống đổi sáng (Shift ×10). */
function ColorArea({ hsv, label, valueText, disabled, onChange }: ColorAreaProps) {
  const areaRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);

  const fromPointer = (event: React.PointerEvent) => {
    const rect = areaRef.current!.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    onChange({
      s: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp((1 - (event.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowRight: [step, 0],
      ArrowLeft: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
      PageUp: [0, 10],
      PageDown: [0, -10],
      Home: [-100, 0],
      End: [100, 0],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange({ s: clamp(Math.round(hsv.s) + move[0], 0, 100), v: clamp(Math.round(hsv.v) + move[1], 0, 100) });
  };

  return (
    <div
      ref={areaRef}
      dir="ltr"
      data-disabled={disabled || undefined}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        fromPointer(event);
        thumbRef.current?.focus();
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) fromPointer(event);
      }}
      className="relative h-40 w-full shrink-0 cursor-crosshair touch-none rounded-medium ring-1 ring-stroke-1 ring-inset select-none data-disabled:cursor-not-allowed data-disabled:opacity-50"
      style={{
        // Không gian màu HSV của sắc độ hiện tại: trắng → màu thuần theo chiều ngang, đen phủ từ dưới lên.
        background: `linear-gradient(to top, rgb(0 0 0), transparent), linear-gradient(to right, rgb(255 255 255), transparent), hsl(${hsv.h} 100% 50%)`,
      }}
    >
      <div
        ref={thumbRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s)}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : onKeyDown}
        className={cn(thumbClass, "absolute size-4 -translate-x-1/2 -translate-y-1/2")}
        style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: toHex(hsvToRgb({ ...hsv, a: 1 })) }}
      />
    </div>
  );
}

interface ChannelInputProps {
  label: string;
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}

/** Ô số của một kênh màu: gõ là áp dụng khi hợp lệ; mũi tên lên / xuống ±1 (Shift ±10); rời ô trả về giá trị thật. */
function ChannelInput({ label, value, min = 0, max, disabled, onCommit }: ChannelInputProps) {
  const id = React.useId();
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={draft ?? String(value)}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          if (/^\d+$/.test(text)) onCommit(clamp(Number(text), min, max));
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          setDraft(null);
          onCommit(clamp(value + (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1), min, max));
        }}
        onBlur={() => setDraft(null)}
        className={cn(fieldControlClass, "h-8 w-full min-w-0 px-2 text-center text-body1 tabular-nums outline-none")}
      />
      <label htmlFor={id} className="truncate text-center text-caption2 text-foreground-3">
        {label}
      </label>
    </div>
  );
}

function HexInput({ label, hex, disabled, onCommit }: { label: string; hex: string; disabled?: boolean; onCommit: (rgb: RgbaColor) => void }) {
  const id = React.useId();
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <div className="flex min-w-0 flex-2 flex-col gap-0.5">
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        dir="ltr"
        disabled={disabled}
        value={draft ?? hex}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          // Áp dụng khi đã đủ 6 / 8 chữ số (3 chữ số chỉ khi rời ô hoặc Enter, để gõ tiếp không bị cắt).
          const digits = text.replace(/^#/, "");
          if (/^([\da-f]{6}|[\da-f]{8})$/i.test(digits)) onCommit(parseColor(digits)!);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || draft === null) return;
          const parsed = parseColor(draft);
          if (parsed) onCommit(parsed);
          setDraft(null);
        }}
        onBlur={() => {
          const parsed = draft !== null ? parseColor(draft) : null;
          if (parsed) onCommit(parsed);
          setDraft(null);
        }}
        className={cn(fieldControlClass, "h-8 w-full min-w-0 px-2 font-mono text-body1 uppercase outline-none")}
      />
      <label htmlFor={id} className="text-center text-caption2 text-foreground-3">
        {label}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ ColorPicker */

export type ColorPickerFormat = "hex" | "rgb" | "hsl";

export interface ColorSwatchOption {
  color: string;
  /** Tên màu cho trình đọc màn hình; mặc định là chính giá trị màu. */
  label?: string;
}

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Màu đã chọn (controlled): hex, `rgb()` hoặc `hsl()`. Màu phát ra luôn là hex. */
  value?: string;
  /** Màu ban đầu (uncontrolled). Mặc định đen. */
  defaultValue?: string;
  /** Gọi khi màu đổi: `value` dạng "#rrggbb" ("#rrggbbaa" khi độ đục < 100%), `data` có rgb / hsl / hsv. */
  onValueChange?: (value: string, data: ColorPickerChangeData) => void;
  /** Hiện thanh và ô độ đục (alpha). */
  alpha?: boolean;
  /** Màu có sẵn hiện thành SwatchPicker dưới bộ chọn. */
  swatches?: (string | ColorSwatchOption)[];
  /** Định dạng các ô nhập lúc đầu. */
  defaultFormat?: ColorPickerFormat;
  /** Nút lấy màu trên màn hình — chỉ hiện khi trình duyệt có EyeDropper API (Chromium). */
  eyeDropper?: boolean;
  disabled?: boolean;
}

interface EyeDropperLike {
  open: () => Promise<{ sRGBHex: string }>;
}

/**
 * ColorPicker: vùng độ bão hoà / độ sáng, thanh sắc độ và độ đục, ô nhập HEX / RGB / HSL, nút lấy màu trên màn hình
 * (nơi trình duyệt hỗ trợ) và màu có sẵn qua SwatchPicker. Đặt trong Popover để làm ô chọn màu.
 */
export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  alpha = false,
  swatches,
  defaultFormat = "hex",
  eyeDropper = true,
  disabled,
  className,
  ref,
  ...props
}: ColorPickerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("colorPicker", colorPickerMessagesEn);
  const toHsv = (text: string | undefined, hue?: number) => {
    const rgb = (text && parseColor(text)) || { r: 0, g: 0, b: 0, a: 1 };
    return rgbToHsv(alpha ? rgb : { ...rgb, a: 1 }, hue);
  };
  const [hsv, setHsv] = React.useState<HsvaColor>(() => toHsv(value ?? defaultValue));
  const [format, setFormat] = React.useState<ColorPickerFormat>(defaultFormat);
  const [canPick, setCanPick] = React.useState(false);
  const data = dataOf(hsv);

  // `value` đổi từ bên ngoài (khác màu đang có): đọc lại, giữ sắc độ nếu màu mới là xám.
  const [syncedValue, setSyncedValue] = React.useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== undefined) {
      const next = toHsv(value, hsv.h);
      if (dataOf(next).hex !== data.hex) setHsv(next);
    }
  }

  React.useEffect(() => {
    setCanPick(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  const update = (patch: Partial<HsvaColor>) => {
    const next = { ...hsv, ...patch };
    setHsv(next);
    const nextData = dataOf(next);
    if (nextData.hex !== data.hex) onValueChange?.(nextData.hex, nextData);
  };
  const updateRgb = (rgb: RgbaColor) => update(rgbToHsv(alpha ? rgb : { ...rgb, a: 1 }, hsv.h));

  const pick = async () => {
    const Ctor = (window as unknown as { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      const rgb = parseColor(result.sRGBHex);
      if (rgb) updateRgb({ ...rgb, a: hsv.a });
    } catch {
      // Người dùng bấm Esc — giữ màu cũ.
    }
  };

  const opaque = toHex({ ...data.rgb, a: 1 });
  const alphaPercent = Math.round(hsv.a * 100);
  const swatchList = swatches?.map((s) => (typeof s === "string" ? { color: s } : s));
  const selectedSwatch = swatchList?.find((s) => parseColor(s.color) && toHex(parseColor(s.color)!) === data.hex)?.color;

  return (
    <div ref={ref} role="group" aria-disabled={disabled || undefined} className={cn("flex w-72 max-w-full flex-col gap-3", className)} {...props}>
      <ColorArea
        hsv={hsv}
        label={msg.area}
        valueText={msg.areaValue(Math.round(hsv.s), Math.round(hsv.v))}
        disabled={disabled}
        onChange={update}
      />
      <div className="flex items-center gap-3">
        {eyeDropper && canPick && (
          <button
            type="button"
            aria-label={msg.eyeDropper}
            disabled={disabled}
            onClick={pick}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-medium text-foreground-2",
              "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover hover:text-foreground-1 active:bg-subtle-pressed",
              "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-foreground-disabled",
            )}
          >
            <Eyedropper20Regular aria-hidden className="size-5" />
          </button>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ColorSlider
            label={msg.hue}
            value={Math.round(hsv.h)}
            max={360}
            valueText={`${Math.round(hsv.h)}°`}
            track={HUE_TRACK}
            thumbColor={`hsl(${hsv.h} 100% 50%)`}
            disabled={disabled}
            onChange={(h) => update({ h })}
          />
          {alpha && (
            <ColorSlider
              label={msg.alpha}
              value={alphaPercent}
              max={100}
              valueText={`${alphaPercent}%`}
              track={`linear-gradient(to right, transparent, ${opaque})`}
              thumbColor={data.hex}
              checker
              disabled={disabled}
              onChange={(a) => update({ a: a / 100 })}
            />
          )}
        </div>
        <span aria-hidden className={cn("relative size-10 shrink-0 overflow-hidden rounded-medium ring-1 ring-stroke-1", checkerClass)}>
          <span className="absolute inset-0" style={{ backgroundColor: data.hex }} />
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Select
          aria-label={msg.format}
          value={format}
          disabled={disabled}
          onChange={(event) => setFormat(event.target.value as ColorPickerFormat)}
          className="w-20 shrink-0"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </Select>
        {format === "hex" && <HexInput label={msg.hex} hex={opaque} disabled={disabled} onCommit={(rgb) => updateRgb(alpha && rgb.a < 1 ? rgb : { ...rgb, a: hsv.a })} />}
        {format === "rgb" && (
          <>
            <ChannelInput label={msg.red} value={data.rgb.r} max={255} disabled={disabled} onCommit={(r) => updateRgb({ ...data.rgb, r, a: hsv.a })} />
            <ChannelInput label={msg.green} value={data.rgb.g} max={255} disabled={disabled} onCommit={(g) => updateRgb({ ...data.rgb, g, a: hsv.a })} />
            <ChannelInput label={msg.blue} value={data.rgb.b} max={255} disabled={disabled} onCommit={(b) => updateRgb({ ...data.rgb, b, a: hsv.a })} />
          </>
        )}
        {format === "hsl" && (
          <>
            <ChannelInput label={msg.hue} value={data.hsl.h} max={360} disabled={disabled} onCommit={(h) => update(hslToHsv({ ...data.hsl, h, a: hsv.a }))} />
            <ChannelInput
              label={msg.saturation}
              value={data.hsl.s}
              max={100}
              disabled={disabled}
              onCommit={(s) => update(hslToHsv({ ...data.hsl, h: hsv.h, s, a: hsv.a }))}
            />
            <ChannelInput
              label={msg.lightness}
              value={data.hsl.l}
              max={100}
              disabled={disabled}
              onCommit={(l) => update(hslToHsv({ ...data.hsl, h: hsv.h, l, a: hsv.a }))}
            />
          </>
        )}
        {alpha && <ChannelInput label={msg.alpha} value={alphaPercent} max={100} disabled={disabled} onCommit={(a) => update({ a: a / 100 })} />}
      </div>
      {swatchList && swatchList.length > 0 && (
        <SwatchPicker
          aria-label={msg.swatches}
          size="small"
          shape="rounded"
          selectedValue={selectedSwatch ?? ""}
          onSelectionChange={(color) => {
            const rgb = parseColor(color);
            if (rgb) updateRgb(alpha ? rgb : { ...rgb, a: 1 });
          }}
        >
          {swatchList.map((s) => (
            <ColorSwatch key={s.color} value={s.color} color={s.color} aria-label={s.label ?? s.color} disabled={disabled} />
          ))}
        </SwatchPicker>
      )}
    </div>
  );
}
