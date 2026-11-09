/** Fluent 2 Dropdown — https://fluent2.microsoft.design/components/web/react/core/dropdown/usage */
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Checkmark16Filled,
  ChevronDown16Regular,
  ChevronDown20Regular,
  ChevronDown24Regular,
  ChevronUp16Regular,
} from "../_internal/icons";
import { usePortalThemeProps, useComponentDefaults, COMPACT_SIZE } from "../YugenProvider/context";
import { cn } from "@/lib/cn";
import { popoverSurfaceClass } from "@/components/ui/Popover/Popover";
import { fieldAppearanceClass, type FieldAppearance } from "@/components/ui/Select/Select";

/**
 * Class nền dùng chung cho option trong listbox (Dropdown, Combobox, TagPicker).
 * Trạng thái highlight/disabled do từng component thêm (Radix: `data-highlighted`, Combobox / TagPicker: `data-selected=true`).
 */
export const listboxOptionClass =
  "relative flex min-h-8 cursor-pointer items-center gap-1 rounded-medium px-2 py-1.5 text-body1 text-foreground-1 outline-none select-none active:bg-background-1-pressed";

/** Class tiêu đề nhóm option. */
export const listboxGroupLabelClass = "flex h-8 items-center px-2 text-caption1 font-semibold text-foreground-3";

const TRIGGER_SIZE = {
  small: { root: "h-6 ps-2 pe-1.5 text-caption1", Icon: ChevronDown16Regular, icon: "size-4" },
  medium: { root: "h-8 ps-3 pe-2.5 text-body1", Icon: ChevronDown20Regular, icon: "size-5" },
  large: { root: "h-10 ps-3 pe-3 text-body2", Icon: ChevronDown24Regular, icon: "size-6" },
} as const;

export interface DropdownProps extends Omit<SelectPrimitive.SelectProps, "dir"> {
  placeholder?: React.ReactNode;
  appearance?: FieldAppearance;
  size?: "small" | "medium" | "large";
  /** Class cho nút trigger (đặt width ở đây). */
  className?: string;
  /** Class cho bề mặt listbox. */
  listboxClassName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/** Dropdown: listbox tuỳ biến (Radix Select) — chọn một giá trị trong danh sách, không cho gõ tự do. */
export function Dropdown(inProps: DropdownProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const {
    placeholder,
    appearance = "outline",
    size = "medium",
    className,
    listboxClassName,
    id,
    disabled,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    "aria-invalid": ariaInvalid,
    ref,
    ...props
  } = useComponentDefaults("Dropdown", inProps, COMPACT_SIZE);
  const s = TRIGGER_SIZE[size];
  const portalTheme = usePortalThemeProps();
  return (
    <SelectPrimitive.Root disabled={disabled} {...props}>
      <SelectPrimitive.Trigger
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid || undefined}
        data-invalid={ariaInvalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          fieldAppearanceClass[appearance],
          "group/dropdown inline-flex min-w-62.5 cursor-pointer items-center justify-between gap-1 text-start outline-none",
          "data-[state=open]:after:scale-x-100 data-[state=open]:after:duration-normal data-[state=open]:after:ease-decelerate-mid",
          "disabled:cursor-not-allowed",
          s.root,
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate group-data-placeholder/dropdown:text-foreground-4 group-disabled/dropdown:text-foreground-disabled">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon className="flex shrink-0 text-foreground-3 group-disabled/dropdown:text-foreground-disabled">
          <s.Icon className={s.icon} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          {...portalTheme}
          position="popper"
          sideOffset={2}
          className={cn(
            popoverSurfaceClass,
            "relative max-h-[min(var(--radix-select-content-available-height),80vh)] min-w-(--radix-select-trigger-width) overflow-hidden",
            listboxClassName,
          )}
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-foreground-3">
            <ChevronUp16Regular />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="flex flex-col p-1">{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-foreground-3">
            <ChevronDown16Regular />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export interface DropdownOptionProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /** Icon / Avatar trước nhãn. */
  media?: React.ReactNode;
}

export function DropdownOption({
  className,
  media,
  children,
  ref,
  ...props
}: DropdownOptionProps & { ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Item>> }) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        listboxOptionClass,
        "data-highlighted:bg-background-1-hover data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
        className,
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        <SelectPrimitive.ItemIndicator className="flex">
          <Checkmark16Filled className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {media && <span className="flex shrink-0 text-foreground-2 [&_svg]:size-5">{media}</span>}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export interface DropdownGroupProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {
  label: React.ReactNode;
}

/** Nhóm option có tiêu đề; các nhóm liền nhau tự có vạch chia. */
export function DropdownGroup({
  className,
  label,
  children,
  ref,
  ...props
}: DropdownGroupProps & { ref?: React.Ref<React.ComponentRef<typeof SelectPrimitive.Group>> }) {
  return (
    <SelectPrimitive.Group
      ref={ref}
      className={cn("flex flex-col not-last:mb-1 not-last:border-b not-last:border-stroke-2 not-last:pb-1", className)}
      {...props}
    >
      <SelectPrimitive.Label className={listboxGroupLabelClass}>{label}</SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  );
}

export function DropdownDivider({ className }: { className?: string }) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-stroke-2", className)} />;
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Dropdown: DropdownProps;
  }
}
