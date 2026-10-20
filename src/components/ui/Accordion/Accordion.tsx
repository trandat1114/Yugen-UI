import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronRight20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

/** Fluent 2 Accordion — https://fluent2.microsoft.design/components/web/react/core/accordion/usage */
type AccordionSize = "small" | "medium" | "large" | "extra-large";
type ExpandIconPosition = "start" | "end";
export type AccordionAppearance = "flush" | "separated" | "outline";

interface AccordionContextValue {
  size: AccordionSize;
  expandIconPosition: ExpandIconPosition;
  appearance: AccordionAppearance;
  /** 0 = ngoài mọi Accordion, 1 = Accordion gốc, 2+ = lồng trong panel. */
  level: number;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  size: "medium",
  expandIconPosition: "start",
  appearance: "flush",
  level: 0,
});

const ROOT_APPEARANCE: Record<AccordionAppearance, string> = {
  flush: "",
  separated: "gap-S",
  // overflow-hidden để hover bo theo góc khung → focus ring của header vẽ vào trong (-outline-offset-2).
  outline: "divide-y divide-stroke-2 overflow-hidden rounded-xlarge border border-stroke-1 bg-background-1",
};

const ITEM_APPEARANCE: Record<AccordionAppearance, string> = {
  flush: "",
  separated: "rounded-xlarge bg-background-1 shadow-2",
  outline: "",
};

const TRIGGER_APPEARANCE: Record<AccordionAppearance, string> = {
  flush: "rounded-medium ps-MNudge pe-M",
  separated: "rounded-xlarge ps-M pe-L data-[state=open]:rounded-b-none",
  outline: "rounded-none ps-M pe-L focus-visible:-outline-offset-2",
};

const PANEL_APPEARANCE: Record<AccordionAppearance, string> = {
  flush: "px-M pt-XS pb-M",
  separated: "px-L pt-XS pb-L",
  outline: "px-L pt-XS pb-L",
};

export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  /** Cỡ header. Accordion lồng mặc định theo cỡ của Accordion cha. */
  size?: AccordionSize;
  /** Vị trí chevron: trước (mặc định) hoặc sau tiêu đề. */
  expandIconPosition?: ExpandIconPosition;
  /** flush: liền mạch (mặc định) · separated: mỗi mục là một thẻ · outline: khung viền chung, vạch chia giữa các mục. */
  appearance?: AccordionAppearance;
};

export const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ size, expandIconPosition, appearance = "flush", className, ...props }, ref) => {
    const parent = React.useContext(AccordionContext);
    const level = parent.level + 1;
    const nested = level > 1;
    const value = React.useMemo<AccordionContextValue>(
      () => ({
        size: size ?? (nested ? parent.size : "medium"),
        expandIconPosition: expandIconPosition ?? (nested ? parent.expandIconPosition : "start"),
        appearance,
        level,
      }),
      [size, expandIconPosition, appearance, level, nested, parent.size, parent.expandIconPosition],
    );
    return (
      <AccordionContext.Provider value={value}>
        <AccordionPrimitive.Root
          ref={ref}
          data-appearance={appearance}
          data-level={level}
          className={cn(
            "flex flex-col",
            ROOT_APPEARANCE[appearance],
            // Accordion lồng (flush): đường dẫn dọc stroke-2 ở mép đầu dòng thể hiện cấp bậc.
            nested && appearance === "flush" && "border-s border-stroke-2 ps-XS",
            className,
          )}
          {...props}
        />
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { appearance } = React.useContext(AccordionContext);
  return <AccordionPrimitive.Item ref={ref} className={cn(ITEM_APPEARANCE[appearance], className)} {...props} />;
});
AccordionItem.displayName = "AccordionItem";

const HEADER_SIZE: Record<AccordionSize, string> = {
  small: "min-h-8 text-caption1",
  medium: "min-h-11 text-body1",
  large: "min-h-11 text-body2",
  "extra-large": "min-h-11 text-subtitle1",
};

export interface AccordionHeaderProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Icon trước tiêu đề (cỡ 20). */
  icon?: React.ReactNode;
  /** Dòng mô tả phụ dưới tiêu đề (caption, foreground-3) — được đọc như mô tả của nút. */
  description?: React.ReactNode;
}

export const AccordionHeader = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, AccordionHeaderProps>(
  ({ className, icon, description, children, ...props }, ref) => {
    const { size, expandIconPosition, appearance } = React.useContext(AccordionContext);
    const id = React.useId();
    const chevron = (
      <ChevronRight20Regular
        aria-hidden
        className={cn(
          "size-5 shrink-0 text-foreground-2 transition-transform duration-normal ease-easy-ease motion-reduce:transition-none",
          "group-data-disabled/acc:text-foreground-disabled",
          // Chevron ở đầu chỉ sang ngang khi đóng → lật theo chiều đọc; scale áp trước rotate nên RTL xoay ngược chiều.
          expandIconPosition === "start"
            ? "rtl:-scale-x-100 group-data-[state=open]/acc:rotate-90 rtl:group-data-[state=open]/acc:-rotate-90"
            : "rotate-90 group-data-[state=open]/acc:-rotate-90",
        )}
      />
    );

    return (
      <AccordionPrimitive.Header className="m-0 flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          aria-labelledby={description ? `${id}-title` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          className={cn(
            "group/acc flex w-full flex-1 items-center gap-S py-S text-start text-foreground-1",
            "transition-colors duration-faster ease-easy-ease hover:bg-subtle-hover active:bg-subtle-pressed",
            "disabled:pointer-events-none disabled:text-foreground-disabled",
            HEADER_SIZE[size],
            TRIGGER_APPEARANCE[appearance],
            className,
          )}
          {...props}
        >
          {expandIconPosition === "start" && chevron}
          {icon && (
            <span className="flex shrink-0 text-foreground-2 group-data-disabled/acc:text-foreground-disabled [&_svg]:size-5">
              {icon}
            </span>
          )}
          {description ? (
            <span className="flex min-w-0 flex-1 flex-col gap-XXS">
              <span id={`${id}-title`}>{children}</span>
              <span
                id={`${id}-description`}
                className="text-caption1 font-normal text-foreground-3 group-data-disabled/acc:text-foreground-disabled"
              >
                {description}
              </span>
            </span>
          ) : (
            <span className="min-w-0 flex-1">{children}</span>
          )}
          {expandIconPosition === "end" && chevron}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionHeader.displayName = "AccordionHeader";

/** Panel luôn được mount để chuyển động chiều cao bằng grid-template-rows (0fr ↔ 1fr). */
export const AccordionPanel = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>, "forceMount">
>(({ className, children, ...props }, ref) => {
  const { appearance } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Content
      ref={ref}
      forceMount
      className={cn(
        "grid transition-[grid-template-rows,visibility] duration-normal ease-easy-ease motion-reduce:transition-none",
        "data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]",
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn("text-body1 text-foreground-2", PANEL_APPEARANCE[appearance], className)}>{children}</div>
      </div>
    </AccordionPrimitive.Content>
  );
});
AccordionPanel.displayName = "AccordionPanel";
