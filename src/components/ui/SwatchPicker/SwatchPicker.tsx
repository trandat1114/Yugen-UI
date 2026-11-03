/** Fluent 2 SwatchPicker — https://storybooks.fluentui.dev/react/?path=/docs/components-swatchpicker--docs */
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cva } from "class-variance-authority";
import { Prohibited16Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { useArrowNavigationGroup } from "../FocusManagement/FocusManagement";
import { useYugenMessages, useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";
import { swatchPickerMessagesEn } from "./messages";
import { useComposedRefs } from "../_internal/composeRefs";

export { swatchPickerMessages, swatchPickerMessagesVi, swatchPickerMessagesEn, type SwatchPickerMessages } from "./messages";

export type SwatchSize = "extra-small" | "small" | "medium" | "large";
export type SwatchShape = "square" | "rounded" | "circular";

interface SwatchPickerContextValue {
  selectedValue?: string;
  select: (value: string) => void;
  size: SwatchSize;
  shape: SwatchShape;
}

const SwatchPickerContext = React.createContext<SwatchPickerContextValue>({
  select: () => {},
  size: "medium",
  shape: "square",
});

export interface SwatchPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** row: một hàng (tự xuống dòng) · grid: lưới theo columnCount. */
  layout?: "row" | "grid";
  /** Số cột khi layout="grid". */
  columnCount?: number;
  size?: SwatchSize;
  shape?: SwatchShape;
  /** Khoảng cách giữa các ô: small 2px · medium 4px. */
  spacing?: "small" | "medium";
  selectedValue?: string;
  defaultSelectedValue?: string;
  onSelectionChange?: (value: string) => void;
}

export function SwatchPicker(inProps: SwatchPickerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    layout = "row",
    columnCount,
    size = "medium",
    shape = "square",
    spacing = "medium",
    selectedValue,
    defaultSelectedValue,
    onSelectionChange,
    className,
    style,
    onKeyDown,
    onFocus,
    onBlur,
    children,
    ref,
    ...props
  } = useComponentDefaults("SwatchPicker", inProps, COMPACT_SIZE);
  // onSelectionChange gọi cả khi bấm lại ô đang chọn (như Fluent), nên không giao cho hook (hook bỏ qua giá trị không đổi).
  const [current, setCurrent] = useControllableState({ value: selectedValue, defaultValue: defaultSelectedValue });
  const select = React.useCallback(
    (value: string) => {
      setCurrent(value);
      onSelectionChange?.(value);
    },
    [setCurrent, onSelectionChange],
  );

  const nav = useArrowNavigationGroup<HTMLDivElement>({ axis: layout === "grid" ? "grid" : "horizontal", circular: true });
  const navRef = nav.ref;
  const setRef = useComposedRefs(navRef, ref);

  const context = React.useMemo(() => ({ selectedValue: current, select, size, shape }), [current, select, size, shape]);
  const grid = layout === "grid" && columnCount !== undefined;

  return (
    <SwatchPickerContext.Provider value={context}>
      <div
        ref={setRef}
        role="radiogroup"
        data-focus-scope={nav["data-focus-scope"]}
        className={cn(grid ? "inline-grid" : "flex flex-wrap", spacing === "small" ? "gap-0.5" : "gap-1", className)}
        style={grid ? { gridTemplateColumns: `repeat(${columnCount}, max-content)`, ...style } : style}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          nav.onKeyDown(event);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          nav.onFocus(event);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          nav.onBlur(event);
        }}
        {...props}
      >
        {children}
      </div>
    </SwatchPickerContext.Provider>
  );
}

const swatchVariants = cva(
  [
    "group/swatch relative inline-flex shrink-0 cursor-pointer items-center justify-center p-0 align-middle",
    "disabled:pointer-events-none",
  ],
  {
    variants: {
      size: {
        "extra-small": "size-5",
        small: "size-6",
        medium: "size-7",
        large: "size-8",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-medium",
        circular: "rounded-circular",
      },
    },
    defaultVariants: { size: "medium", shape: "square" },
  },
);

interface SwatchBaseProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "color"> {
  value: string;
  /** Icon hiển thị chồng lên ô màu. */
  icon?: React.ReactNode;
}

/** Ô swatch dùng chung: lớp màu/ảnh + vòng chọn (2px brand-stroke ngoài, 2px background-1 bên trong). */
function SwatchBase({
  value,
  fill,
  icon,
  disabled,
  className,
  onClick,
  "aria-label": ariaLabel,
  ref,
  ...props
}: SwatchBaseProps & { fill: React.CSSProperties } & { ref?: React.Ref<HTMLButtonElement> }) {
  const { selectedValue, select, size, shape } = React.useContext(SwatchPickerContext);
  const selected = selectedValue === value;

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel ?? value}
      disabled={disabled}
      data-selected={selected || undefined}
      className={cn(swatchVariants({ size, shape }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] border border-stroke-accessible/40 bg-cover bg-center"
        style={fill}
      />
      {icon && <span className="relative flex [&_svg]:size-4">{icon}</span>}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent",
          "group-hover/swatch:border-stroke-accessible group-active/swatch:border-stroke-1-pressed",
          selected && "border-brand-stroke group-hover/swatch:border-brand-stroke group-active/swatch:border-brand-stroke",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-[inherit] border-2 border-transparent group-hover/swatch:border-background-1",
            selected && "border-background-1",
          )}
        />
      </span>
      {disabled && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background-1/60 text-foreground-disabled [&_svg]:size-4"
        >
          <Prohibited16Regular />
        </span>
      )}
    </button>
  );
}

export interface ColorSwatchProps extends SwatchBaseProps {
  /** Giá trị màu CSS bất kỳ (dữ liệu người dùng — được phép là HEX/rgb). */
  color: string;
}

export function ColorSwatch({ color, ref, ...props }: ColorSwatchProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <SwatchBase ref={ref} fill={{ backgroundColor: color }} {...props} />;
}

export interface ImageSwatchProps extends SwatchBaseProps {
  /** URL ảnh (hoạ tiết, chất liệu…). */
  src: string;
}

export function ImageSwatch({ src, ref, ...props }: ImageSwatchProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <SwatchBase ref={ref} fill={{ backgroundImage: `url(${JSON.stringify(src)})` }} {...props} />;
}

export type EmptySwatchProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Ô trống (viền đứt) — vd. nút "Thêm màu"; không tham gia lựa chọn. */
export function EmptySwatch({
  className,
  children,
  "aria-label": ariaLabel,
  ref,
  ...props
}: EmptySwatchProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { size, shape } = React.useContext(SwatchPickerContext);
  const msg = useYugenMessages("swatchPicker", swatchPickerMessagesEn);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel ?? msg.emptySwatch}
      className={cn(
        swatchVariants({ size, shape }),
        "border border-dashed border-stroke-accessible text-foreground-3 [&_svg]:size-4",
        "hover:bg-subtle-hover hover:text-foreground-2 active:bg-subtle-pressed",
        "disabled:border-stroke-disabled disabled:text-foreground-disabled",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    SwatchPicker: SwatchPickerProps;
  }
}
