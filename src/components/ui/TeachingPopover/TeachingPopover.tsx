/** Fluent 2 TeachingPopover — https://storybooks.fluentui.dev/react/?path=/docs/components-teachingpopover--docs */
import * as React from "react";
import { Dismiss16Regular, Lightbulb16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { Popover, PopoverClose, PopoverSurface, PopoverTrigger, type PopoverSurfaceProps } from "../Popover/Popover";

export type TeachingPopoverAppearance = "normal" | "brand";

const TeachingPopoverContext = React.createContext<{ appearance: TeachingPopoverAppearance }>({ appearance: "normal" });

function useTeachingAppearance() {
  return React.useContext(TeachingPopoverContext).appearance;
}

/** Class nút theo appearance: trên nền brand, nút chính đảo sang nền sáng chữ brand. */
function useTeachingButtons() {
  const brand = useTeachingAppearance() === "brand";
  return {
    brand,
    primary: {
      appearance: brand ? ("secondary" as const) : ("primary" as const),
      className: brand
        ? "border-transparent text-brand-foreground-1 hover:border-transparent active:border-transparent"
        : undefined,
    },
    secondary: {
      appearance: brand ? ("outline" as const) : ("secondary" as const),
      className: brand
        ? cn(
            "border-foreground-on-brand text-foreground-on-brand",
            "hover:border-foreground-on-brand hover:bg-brand-background-hover active:border-foreground-on-brand active:bg-brand-background-pressed",
          )
        : undefined,
    },
  };
}

export interface TeachingPopoverProps extends React.ComponentPropsWithoutRef<typeof Popover> {
  /** normal: bề mặt neutral · brand: nền brand chữ on-brand. */
  appearance?: TeachingPopoverAppearance;
}

/** Popover hướng dẫn (coachmark / onboarding) — giới thiệu tính năng mới, gắn với phần tử trigger. */
export function TeachingPopover({ appearance = "normal", ...props }: TeachingPopoverProps) {
  const value = React.useMemo(() => ({ appearance }), [appearance]);
  return (
    <TeachingPopoverContext.Provider value={value}>
      <Popover {...props} />
    </TeachingPopoverContext.Provider>
  );
}

export const TeachingPopoverTrigger = PopoverTrigger;

export type TeachingPopoverSurfaceProps = Omit<PopoverSurfaceProps, "appearance">;

export const TeachingPopoverSurface = React.forwardRef<React.ElementRef<typeof PopoverSurface>, TeachingPopoverSurfaceProps>(
  ({ className, withArrow = true, ...props }, ref) => {
    const appearance = useTeachingAppearance();
    return <PopoverSurface ref={ref} appearance={appearance} withArrow={withArrow} className={cn("w-80", className)} {...props} />;
  },
);
TeachingPopoverSurface.displayName = "TeachingPopoverSurface";

export interface TeachingPopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon trước tiêu đề; null để ẩn. Mặc định bóng đèn. */
  icon?: React.ReactNode;
  /** Hiện nút đóng. Mặc định true. */
  dismissible?: boolean;
  dismissLabel?: string;
}

export function TeachingPopoverHeader({
  icon = <Lightbulb16Regular />,
  dismissible = true,
  dismissLabel = "Đóng",
  className,
  children,
  ...props
}: TeachingPopoverHeaderProps) {
  const brand = useTeachingAppearance() === "brand";
  return (
    <div
      className={cn(
        "mb-2 flex min-h-6 items-center gap-1 text-caption1 font-semibold",
        brand ? "text-foreground-on-brand" : "text-brand-foreground-1",
        className,
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="flex shrink-0 [&_svg]:size-4">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {dismissible && (
        <PopoverClose asChild>
          <Button
            appearance="transparent"
            size="small"
            icon={<Dismiss16Regular />}
            aria-label={dismissLabel}
            className={cn(
              "-me-1",
              brand
                ? "text-foreground-on-brand hover:bg-brand-background-hover hover:text-foreground-on-brand active:bg-brand-background-pressed active:text-foreground-on-brand"
                : "text-foreground-2 hover:text-foreground-1 active:text-foreground-1",
            )}
          />
        </PopoverClose>
      )}
    </div>
  );
}

export interface TeachingPopoverBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ảnh / minh hoạ phía trên nội dung. */
  media?: React.ReactNode;
}

export function TeachingPopoverBody({ media, className, children, ...props }: TeachingPopoverBodyProps) {
  return (
    <div className={cn("text-body1", className)} {...props}>
      {media && <div className="mb-3 overflow-hidden rounded-medium [&_img]:block [&_img]:w-full">{media}</div>}
      {children}
    </div>
  );
}

export function TeachingPopoverTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("mb-1 text-subtitle2 font-semibold", className)} {...props} />;
}

export interface TeachingPopoverFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Nhãn nút chính. */
  primary: React.ReactNode;
  /** Nhãn nút phụ — bấm sẽ đóng popover. */
  secondary?: React.ReactNode;
  onPrimaryClick?: React.MouseEventHandler<HTMLButtonElement>;
  onSecondaryClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Đóng popover sau khi bấm nút chính. Mặc định false. */
  closeOnPrimary?: boolean;
  /** horizontal: hai nút cạnh nhau ở cuối · vertical: xếp chồng, rộng hết. */
  layout?: "horizontal" | "vertical";
}

export function TeachingPopoverFooter({
  primary,
  secondary,
  onPrimaryClick,
  onSecondaryClick,
  closeOnPrimary = false,
  layout = "horizontal",
  className,
  ...props
}: TeachingPopoverFooterProps) {
  const buttons = useTeachingButtons();
  const vertical = layout === "vertical";
  const primaryButton = (
    <Button
      appearance={buttons.primary.appearance}
      className={cn(buttons.primary.className, vertical && "w-full")}
      onClick={onPrimaryClick}
    >
      {primary}
    </Button>
  );

  return (
    <div className={cn("mt-4 flex gap-2", vertical ? "flex-col" : "justify-end", className)} {...props}>
      {vertical && (closeOnPrimary ? <PopoverClose asChild>{primaryButton}</PopoverClose> : primaryButton)}
      {secondary != null && (
        <PopoverClose asChild>
          <Button
            appearance={buttons.secondary.appearance}
            className={cn(buttons.secondary.className, vertical && "w-full")}
            onClick={onSecondaryClick}
          >
            {secondary}
          </Button>
        </PopoverClose>
      )}
      {!vertical && (closeOnPrimary ? <PopoverClose asChild>{primaryButton}</PopoverClose> : primaryButton)}
    </div>
  );
}

export interface TeachingPopoverCarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Bước hiện tại (bắt đầu từ 0) — controlled. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Bấm "Hoàn tất" ở bước cuối (popover tự đóng). */
  onFinish?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  finishLabel?: string;
  /** Nút phụ ở bước đầu (đóng popover). */
  dismissLabel?: string;
  /** Mỗi phần tử con là một bước. */
  children: React.ReactNode;
}

/** Nhiều bước trong một TeachingPopover: số bước "1/3", chấm điều hướng, Quay lại / Tiếp / Hoàn tất. */
export function TeachingPopoverCarousel({
  step,
  defaultStep = 0,
  onStepChange,
  onFinish,
  nextLabel = "Tiếp",
  previousLabel = "Quay lại",
  finishLabel = "Hoàn tất",
  dismissLabel = "Để sau",
  className,
  children,
  ...props
}: TeachingPopoverCarouselProps) {
  const steps = React.Children.toArray(children);
  const count = steps.length;
  const [uncontrolled, setUncontrolled] = React.useState(defaultStep);
  const current = Math.min(Math.max(step ?? uncontrolled, 0), Math.max(count - 1, 0));
  const buttons = useTeachingButtons();
  const brand = buttons.brand;

  const go = (next: number) => {
    if (step === undefined) setUncontrolled(next);
    onStepChange?.(next);
  };

  const first = current === 0;
  const last = current === count - 1;

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div aria-live="polite">
        <div
          key={current}
          role="group"
          aria-roledescription="bước"
          aria-label={`Bước ${current + 1}/${count}`}
          className="animate-fade-in motion-reduce:animate-none"
        >
          {steps[current]}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={cn("text-caption1 tabular-nums", brand ? "text-foreground-on-brand" : "text-foreground-3")}>
          {current + 1}/{count}
        </span>
        <div className="flex items-center">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Đến bước ${index + 1}`}
              aria-current={index === current ? "step" : undefined}
              onClick={() => go(index)}
              className="group/dot flex size-4 items-center justify-center rounded-circular"
            >
              <span
                className={cn(
                  "size-2 rounded-circular transition-colors duration-faster ease-easy-ease",
                  index === current
                    ? brand
                      ? "bg-foreground-on-brand"
                      : "bg-brand-background"
                    : brand
                      ? "bg-foreground-on-brand/40 group-hover/dot:bg-foreground-on-brand/70"
                      : "bg-stroke-accessible group-hover/dot:bg-foreground-2",
                )}
              />
            </button>
          ))}
        </div>
        <div className="ms-auto flex gap-2">
          {first ? (
            <PopoverClose asChild>
              <Button appearance={buttons.secondary.appearance} className={cn("min-w-0", buttons.secondary.className)}>
                {dismissLabel}
              </Button>
            </PopoverClose>
          ) : (
            <Button
              appearance={buttons.secondary.appearance}
              className={cn("min-w-0", buttons.secondary.className)}
              onClick={() => go(current - 1)}
            >
              {previousLabel}
            </Button>
          )}
          {last ? (
            <PopoverClose asChild>
              <Button appearance={buttons.primary.appearance} className={cn("min-w-0", buttons.primary.className)} onClick={onFinish}>
                {finishLabel}
              </Button>
            </PopoverClose>
          ) : (
            <Button
              appearance={buttons.primary.appearance}
              className={cn("min-w-0", buttons.primary.className)}
              onClick={() => go(current + 1)}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
