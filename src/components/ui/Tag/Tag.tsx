/** Fluent 2 Tag — https://fluent2.microsoft.design/components/web/react/core/tag/usage */
import * as React from "react";
import { cva } from "class-variance-authority";
import { useDirection } from "@radix-ui/react-direction";
import { Dismiss12Regular, Dismiss16Regular, Dismiss20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

export type TagAppearance = "filled" | "outline" | "brand";
export type TagSize = "extra-small" | "small" | "medium";
export type TagShape = "rounded" | "circular";

interface TagGroupContextValue {
  size?: TagSize;
  appearance?: TagAppearance;
  disabled?: boolean;
  dismiss?: (value: string, target: HTMLElement) => void;
}

const TagGroupContext = React.createContext<TagGroupContextValue | null>(null);

const tagVariants = cva(
  "inline-flex max-w-full min-w-0 shrink-0 items-center border align-middle whitespace-nowrap select-none [&_svg]:shrink-0",
  {
    variants: {
      appearance: {
        filled: "border-transparent bg-background-3 text-foreground-2",
        outline: "border-stroke-1 bg-transparent text-foreground-2",
        brand: "border-transparent bg-brand-background-2 text-brand-foreground-2",
      },
      size: {
        medium: "h-8 ps-1.5 pe-1.5 text-body1 [&_svg]:size-5",
        small: "h-6 ps-1 pe-1 text-caption1 [&_svg]:size-4",
        "extra-small": "h-5 ps-1 pe-1 text-caption1 [&_svg]:size-3",
      },
      shape: {
        rounded: "rounded-medium",
        circular: "rounded-circular",
      },
      disabled: {
        true: "border-transparent bg-background-disabled text-foreground-disabled",
        false: "",
      },
    },
    compoundVariants: [{ appearance: "outline", disabled: true, class: "border-stroke-disabled bg-transparent" }],
    defaultVariants: { appearance: "filled", size: "medium", shape: "rounded", disabled: false },
  },
);

/** Màu nền khi hover / nhấn cho phần tử tag bấm được (InteractionTag). */
const INTERACTIVE = {
  filled: "enabled:hover:bg-background-6 enabled:active:bg-subtle-pressed",
  outline: "enabled:hover:border-stroke-1-hover enabled:hover:bg-subtle-hover enabled:active:bg-subtle-pressed",
  brand: "enabled:hover:bg-brand-background-2-hover enabled:active:bg-brand-background-2-pressed",
} as const;

const DISMISS_ICON = { medium: Dismiss20Regular, small: Dismiss16Regular, "extra-small": Dismiss12Regular } as const;
const MEDIA_PADDING = { medium: "ps-1", small: "ps-0.5", "extra-small": "ps-0.5" } as const;
const DISMISS_PADDING = { medium: "pe-1", small: "pe-0.5", "extra-small": "pe-0.5" } as const;

interface TagVisualProps {
  appearance?: TagAppearance;
  size?: TagSize;
  shape?: TagShape;
  /** Icon trước nhãn. */
  icon?: React.ReactNode;
  /** Avatar (hoặc media khác) trước nhãn, sát mép. */
  media?: React.ReactNode;
  /** Dòng phụ dưới nhãn (chỉ hợp với size medium). */
  secondaryText?: React.ReactNode;
  disabled?: boolean;
  /** Giá trị định danh — TagGroup dùng khi gọi onDismiss. */
  value?: string;
}

function TagContent({
  icon,
  media,
  secondaryText,
  children,
}: Pick<TagVisualProps, "icon" | "media" | "secondaryText"> & { children?: React.ReactNode }) {
  return (
    <>
      {media && <span className="flex shrink-0 items-center">{media}</span>}
      {icon && <span className="flex shrink-0 items-center ps-0.5">{icon}</span>}
      {secondaryText ? (
        <span className="flex min-w-0 flex-col px-0.5 text-start">
          <span className="truncate text-caption1">{children}</span>
          <span className="truncate text-caption2">{secondaryText}</span>
        </span>
      ) : (
        <span className="min-w-0 truncate px-0.5">{children}</span>
      )}
    </>
  );
}

function useTagContext(props: Pick<TagVisualProps, "size" | "appearance" | "disabled">) {
  const group = React.useContext(TagGroupContext);
  return {
    group,
    size: props.size ?? group?.size ?? "medium",
    appearance: props.appearance ?? group?.appearance ?? "filled",
    disabled: props.disabled ?? group?.disabled ?? false,
  };
}

/* ------------------------------------------------------------------ Tag */

export interface TagProps extends TagVisualProps, Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Tag thành nút: bấm, Delete hoặc Backspace để gỡ. */
  dismissible?: boolean;
  onDismiss?: (event: React.SyntheticEvent<HTMLElement>, value?: string) => void;
  /** Mô tả đọc cho trình đọc màn hình khi dismissible. */
  dismissLabel?: string;
}

export const Tag = React.forwardRef<HTMLElement, TagProps>(
  (
    {
      className,
      appearance: appearanceProp,
      size: sizeProp,
      shape = "rounded",
      icon,
      media,
      secondaryText,
      disabled: disabledProp,
      value,
      dismissible,
      onDismiss,
      dismissLabel = "Gỡ",
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const { group, size, appearance, disabled } = useTagContext({ size: sizeProp, appearance: appearanceProp, disabled: disabledProp });
    const classes = cn(
      tagVariants({ appearance, size, shape, disabled }),
      media && MEDIA_PADDING[size],
      dismissible && DISMISS_PADDING[size],
      className,
    );

    if (!dismissible) {
      return (
        <span ref={ref as React.Ref<HTMLSpanElement>} data-tag="" aria-disabled={disabled || undefined} className={classes} {...props}>
          <TagContent icon={icon} media={media} secondaryText={secondaryText}>
            {children}
          </TagContent>
        </span>
      );
    }

    const DismissIcon = DISMISS_ICON[size];
    const dismiss = (e: React.SyntheticEvent<HTMLElement>) => {
      onDismiss?.(e, value);
      if (value !== undefined) group?.dismiss?.(value, e.currentTarget);
    };

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        data-tag=""
        data-tag-focus=""
        disabled={disabled}
        className={cn("group/tag cursor-pointer disabled:cursor-not-allowed", classes)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) dismiss(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && (e.key === "Delete" || e.key === "Backspace")) {
            e.preventDefault();
            dismiss(e);
          }
        }}
        {...props}
      >
        <TagContent icon={icon} media={media} secondaryText={secondaryText}>
          {children}
        </TagContent>
        <span className="sr-only">, {dismissLabel}</span>
        <span
          aria-hidden
          className="flex shrink-0 items-center transition-colors duration-faster group-enabled/tag:group-hover/tag:text-brand-foreground-1 group-enabled/tag:group-active/tag:text-brand-foreground-2"
        >
          <DismissIcon />
        </span>
      </button>
    );
  },
);
Tag.displayName = "Tag";

/* ------------------------------------------------------- InteractionTag */

export interface InteractionTagProps
  extends TagVisualProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "value"> {
  /** Hiện nút X riêng ở bên phải. */
  dismissible?: boolean;
  onDismiss?: (event: React.MouseEvent<HTMLButtonElement>, value?: string) => void;
  /** aria-label của nút X. */
  dismissLabel?: string;
}

/** Tag có hành động chính (bấm vào nhãn) và nút gỡ riêng. */
export const InteractionTag = React.forwardRef<HTMLButtonElement, InteractionTagProps>(
  (
    {
      className,
      appearance: appearanceProp,
      size: sizeProp,
      shape = "rounded",
      icon,
      media,
      secondaryText,
      disabled: disabledProp,
      value,
      dismissible,
      onDismiss,
      dismissLabel,
      children,
      ...props
    },
    ref,
  ) => {
    const { group, size, appearance, disabled } = useTagContext({ size: sizeProp, appearance: appearanceProp, disabled: disabledProp });
    const DismissIcon = DISMISS_ICON[size];
    const base = tagVariants({ appearance, size, shape, disabled });
    const label = dismissLabel ?? (typeof children === "string" ? `Gỡ ${children}` : "Gỡ");

    return (
      <span data-tag="" className={cn("inline-flex max-w-full min-w-0 shrink-0 align-middle", className)}>
        <button
          ref={ref}
          type="button"
          data-tag-focus=""
          disabled={disabled}
          className={cn(
            base,
            "cursor-pointer transition-colors duration-faster ease-easy-ease disabled:cursor-not-allowed",
            INTERACTIVE[appearance],
            media && MEDIA_PADDING[size],
            dismissible && "rounded-e-none border-e-0 pe-0.5",
          )}
          {...props}
        >
          <TagContent icon={icon} media={media} secondaryText={secondaryText}>
            {children}
          </TagContent>
        </button>
        {dismissible && (
          <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={(e) => {
              onDismiss?.(e, value);
              if (value !== undefined) group?.dismiss?.(value, e.currentTarget);
            }}
            className={cn(
              base,
              "cursor-pointer rounded-s-none border-s-0 transition-colors duration-faster ease-easy-ease disabled:cursor-not-allowed",
              INTERACTIVE[appearance],
              DISMISS_PADDING[size],
              "ps-0.5",
            )}
          >
            <DismissIcon />
          </button>
        )}
      </span>
    );
  },
);
InteractionTag.displayName = "InteractionTag";

/* ------------------------------------------------------------- TagGroup */

const GROUP_GAP = { medium: "gap-2", small: "gap-1.5", "extra-small": "gap-1" } as const;

export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: TagSize;
  appearance?: TagAppearance;
  disabled?: boolean;
  /** Gọi khi một Tag / InteractionTag (có `value`) bị gỡ; focus tự chuyển sang tag kế bên. */
  onDismiss?: (value: string) => void;
}

/** Nhóm tag: xuống dòng tự động, điều hướng bằng phím mũi tên, quản lý focus khi gỡ. */
export const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, size = "medium", appearance, disabled, onDismiss, onKeyDown, children, ...props }, ref) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const dir = useDirection();
    const setRefs = (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const dismiss = React.useCallback(
      (value: string, target: HTMLElement) => {
        const root = rootRef.current;
        const tagEl = target.closest<HTMLElement>("[data-tag]");
        const index = root && tagEl ? Array.from(root.querySelectorAll<HTMLElement>("[data-tag]")).indexOf(tagEl) : -1;
        onDismiss?.(value);
        requestAnimationFrame(() => {
          if (!root || !tagEl || tagEl.isConnected || index < 0) return;
          const tags = Array.from(root.querySelectorAll<HTMLElement>("[data-tag]"));
          const next = tags[Math.min(index, tags.length - 1)];
          const focusable = next?.matches("[data-tag-focus]") ? next : next?.querySelector<HTMLElement>("[data-tag-focus]");
          focusable?.focus();
        });
      },
      [onDismiss],
    );

    const ctx = React.useMemo<TagGroupContextValue>(() => ({ size, appearance, disabled, dismiss }), [size, appearance, disabled, dismiss]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !rootRef.current) return;
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(e.key)) return;
      const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>("button:not(:disabled)"));
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (current < 0) return;
      const rtl = dir === "rtl";
      const step = (e.key === "ArrowRight") !== rtl ? 1 : -1;
      const nextIndex =
        e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : Math.min(items.length - 1, Math.max(0, current + step));
      e.preventDefault();
      items[nextIndex]?.focus();
    };

    return (
      <TagGroupContext.Provider value={ctx}>
        <div
          ref={setRefs}
          role={onDismiss ? "toolbar" : undefined}
          onKeyDown={handleKeyDown}
          className={cn("inline-flex flex-wrap items-center", GROUP_GAP[size], className)}
          {...props}
        >
          {children}
        </div>
      </TagGroupContext.Provider>
    );
  },
);
TagGroup.displayName = "TagGroup";
