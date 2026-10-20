import * as React from "react";
import { cn } from "@/lib/cn";

/** Fluent 2 Text (Typography) — https://fluent2.microsoft.design/components/web/react/core/text/usage */
export type TextSize = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextFont = "base" | "monospace" | "numeric";
export type TextAlign = "start" | "center" | "end" | "justify";
export type TextElement =
  | "span"
  | "p"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "pre"
  | "code"
  | "strong"
  | "b"
  | "em"
  | "i"
  | "label"
  | "time"
  | "blockquote";

/** fontSizeBase100 … fontSizeHero1000 → type ramp utility (cỡ chữ + line-height). */
const SIZE: Record<TextSize, string> = {
  100: "text-caption2",
  200: "text-caption1",
  300: "text-body1",
  400: "text-body2",
  500: "text-subtitle1",
  600: "text-title3",
  700: "text-title2",
  800: "text-title1",
  900: "text-large-title",
  1000: "text-display",
};

const WEIGHT: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const FONT: Record<TextFont, string> = {
  base: "font-sans",
  monospace: "font-mono",
  // Fluent dùng fontFamilyNumeric (Bahnschrift); repo chưa có token này → chữ base + số đều cột.
  numeric: "font-sans tabular-nums",
};

const ALIGN: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
  justify: "text-justify",
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Phần tử HTML render ra. */
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  font?: TextFont;
  align?: TextAlign;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** Cắt chữ bằng dấu "…" (dùng kèm `wrap={false}` và `block`). */
  truncate?: boolean;
  /** `false` → không xuống dòng. */
  wrap?: boolean;
  /** `display: block` thay vì inline. */
  block?: boolean;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as = "span",
      size = 300,
      weight = "regular",
      font = "base",
      align = "start",
      italic = false,
      underline = false,
      strikethrough = false,
      truncate = false,
      wrap = true,
      block = false,
      className,
      ...props
    },
    ref,
  ) => {
    const Element = as as React.ElementType;
    return (
      <Element
        ref={ref}
        className={cn(
          "m-0",
          SIZE[size],
          WEIGHT[weight],
          FONT[font],
          font === "base" && size >= 500 && "font-display",
          ALIGN[align],
          block ? "block" : "inline",
          wrap ? "whitespace-normal" : "overflow-hidden whitespace-nowrap",
          truncate && "overflow-hidden text-ellipsis",
          italic && "italic",
          underline && strikethrough
            ? "[text-decoration-line:underline_line-through]"
            : underline
              ? "underline"
              : strikethrough && "line-through",
          className,
        )}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

/* ------------------------------------------------------------------ Presets */
export type TextPresetProps = Omit<TextProps, "size" | "weight" | "font">;

function createPreset(displayName: string, size: TextSize, weight: TextWeight) {
  const Preset = React.forwardRef<HTMLElement, TextPresetProps>((props, ref) => (
    <Text ref={ref} size={size} weight={weight} {...props} />
  ));
  Preset.displayName = displayName;
  return Preset;
}

export const Display = createPreset("Display", 1000, "semibold");
export const LargeTitle = createPreset("LargeTitle", 900, "semibold");
export const Title1 = createPreset("Title1", 800, "semibold");
export const Title2 = createPreset("Title2", 700, "semibold");
export const Title3 = createPreset("Title3", 600, "semibold");
export const Subtitle1 = createPreset("Subtitle1", 500, "semibold");
export const Subtitle2 = createPreset("Subtitle2", 400, "semibold");
export const Body1 = createPreset("Body1", 300, "regular");
export const Body1Strong = createPreset("Body1Strong", 300, "semibold");
export const Body2 = createPreset("Body2", 400, "regular");
export const Caption1 = createPreset("Caption1", 200, "regular");
export const Caption1Strong = createPreset("Caption1Strong", 200, "semibold");
export const Caption2 = createPreset("Caption2", 100, "regular");
