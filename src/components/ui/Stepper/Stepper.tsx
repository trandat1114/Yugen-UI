import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Checkmark16Regular,
  Checkmark20Regular,
  ErrorCircle16Filled,
  Important16Filled,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { useSpinDelay } from "../Loading/Loading";
import { ProgressBar } from "../ProgressBar/ProgressBar";

/* ------------------------------------------------------------------------------------------------
 * Stepper + Step
 * ---------------------------------------------------------------------------------------------- */

export type StepStatus = "complete" | "current" | "upcoming" | "error";
export type StepperOrientation = "horizontal" | "vertical";

interface StepperContextValue {
  activeStep: number;
  total: number;
  orientation: StepperOrientation;
  linear: boolean;
  onStepChange?: (index: number) => void;
}

const StepperContext = React.createContext<StepperContextValue>({ activeStep: 0, total: 1, orientation: "horizontal", linear: false });
const StepIndexContext = React.createContext(0);

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: "đã hoàn thành",
  current: "bước hiện tại",
  upcoming: "chưa thực hiện",
  error: "có lỗi",
};

const INDICATOR: Record<StepStatus, string> = {
  complete: "border-brand-background bg-brand-background text-foreground-on-brand",
  current: "border-2 border-brand-stroke bg-background-1 text-brand-foreground-1",
  upcoming: "border-stroke-accessible bg-background-1 text-foreground-2",
  error: "border-danger-background-3 bg-danger-background-3 text-foreground-on-brand",
};

const TITLE: Record<StepStatus, string> = {
  complete: "text-foreground-1",
  current: "font-semibold text-foreground-1",
  upcoming: "text-foreground-2",
  error: "font-semibold text-danger-foreground-1",
};

export interface StepProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Mặc định tự suy từ vị trí: trước `activeStep` = complete, đúng = current, sau = upcoming. */
  status?: StepStatus;
  /** Hiện "(Tuỳ chọn)" dưới tiêu đề. */
  optional?: boolean;
  /** Không cho chuyển tới bước này. */
  disabled?: boolean;
  /** Nội dung riêng của bước — chỉ hiện ở Stepper dọc, thụt vào thẳng cột chữ. */
  children?: React.ReactNode;
}

/** Một bước trong `Stepper`. Chỉ số, trạng thái tự động và `aria-current="step"` lấy từ Stepper cha. */
export const Step = React.forwardRef<HTMLLIElement, StepProps>(
  ({ title, description, status: statusProp, optional, disabled, children, className, ...props }, ref) => {
    const { activeStep, total, orientation, linear, onStepChange } = React.useContext(StepperContext);
    const index = React.useContext(StepIndexContext);
    const isCurrent = index === activeStep;
    const status: StepStatus = statusProp ?? (index < activeStep ? "complete" : isCurrent ? "current" : "upcoming");
    const reachable = !disabled && (!linear || index <= activeStep || status === "complete");
    const interactive = !!onStepChange;
    const horizontal = orientation === "horizontal";
    const last = index === total - 1;
    const tabStop = Math.min(Math.max(activeStep, 0), total - 1);

    const content = (
      <>
        <span
          aria-hidden
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-circular border text-caption1 font-semibold",
            "transition-colors duration-normal ease-easy-ease",
            INDICATOR[status],
          )}
        >
          {status === "complete" ? <Checkmark16Regular /> : status === "error" ? <Important16Filled /> : index + 1}
        </span>
        <span className={cn("flex min-w-0 flex-col text-start", !horizontal && "pt-XXS")}>
          <span className={cn("text-body1", horizontal && "truncate", TITLE[status], disabled && "text-foreground-disabled")}>
            <span className="sr-only">{`Bước ${index + 1}:`}</span> {title}
            <span className="sr-only">{`, ${STATUS_TEXT[status]}`}</span>
          </span>
          {(description || optional) && (
            <span className={cn("text-caption1 text-foreground-3", horizontal && "truncate")}>
              {description}
              {optional && (description ? " · Tuỳ chọn" : "Tuỳ chọn")}
            </span>
          )}
        </span>
      </>
    );

    const triggerClass = cn(
      "flex min-w-0 gap-S rounded-medium p-XS",
      horizontal ? "items-center" : "w-full items-start",
      interactive && "focus-visible:outline-2 focus-visible:outline-stroke-focus",
      interactive && reachable && !isCurrent && "cursor-pointer hover:bg-subtle-hover active:bg-subtle-pressed",
      interactive && !reachable && "cursor-not-allowed",
    );

    return (
      <li
        ref={ref}
        data-status={status}
        className={cn(
          horizontal ? cn("flex min-w-0 items-center gap-S", last ? "flex-none" : "flex-1") : "relative pb-L last:pb-0",
          className,
        )}
        {...props}
      >
        {interactive ? (
          <button
            type="button"
            data-stepper-trigger=""
            aria-current={isCurrent ? "step" : undefined}
            aria-disabled={!reachable || undefined}
            tabIndex={index === tabStop ? 0 : -1}
            className={triggerClass}
            onClick={() => {
              if (reachable && !isCurrent) onStepChange(index);
            }}
          >
            {content}
          </button>
        ) : (
          <div aria-current={isCurrent ? "step" : undefined} className={triggerClass}>
            {content}
          </div>
        )}
        {!last &&
          (horizontal ? (
            <span
              aria-hidden
              className={cn("h-0.5 min-w-L flex-1 rounded-circular", status === "complete" ? "bg-brand-background" : "bg-stroke-2")}
            />
          ) : (
            <span
              aria-hidden
              className={cn(
                "absolute inset-s-4.25 top-9 bottom-0 w-0.5 rounded-circular",
                status === "complete" ? "bg-brand-background" : "bg-stroke-2",
              )}
            />
          ))}
        {!horizontal && children && <div className="ps-10 pt-XS">{children}</div>}
      </li>
    );
  },
);
Step.displayName = "Step";

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Chỉ số bước hiện tại (bắt đầu từ 0). */
  activeStep?: number;
  /** Có → các bước thành nút bấm (roving focus, mũi tên / Home / End). */
  onStepChange?: (index: number) => void;
  orientation?: StepperOrientation;
  /** Chặn nhảy tới bước sau bước hiện tại (chỉ được quay lại hoặc tới bước đã `complete`). */
  linear?: boolean;
  /** Ngang + container hẹp (< 32rem) → thu gọn thành "Bước 2/4 · Tên bước" + ProgressBar. Mặc định `true`. */
  responsive?: boolean;
  children: React.ReactNode;
}

/**
 * Chỉ báo tiến trình nhiều bước (danh sách có thứ tự). Bước hiện tại có `aria-current="step"`, chỉ báo số / dấu tích /
 * dấu chấm than luôn kèm chữ ẩn ("đã hoàn thành", "có lỗi"…). Đường nối dùng flex + thuộc tính logic nên tự đảo trong RTL.
 */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    { activeStep = 0, onStepChange, orientation = "horizontal", linear = false, responsive = true, className, children, "aria-label": ariaLabel, ...props },
    ref,
  ) => {
    const dir = useDirection();
    const steps = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<StepProps>[];
    const total = steps.length;
    const horizontal = orientation === "horizontal";
    const collapse = horizontal && responsive;
    const shown = Math.min(Math.max(activeStep, 0), Math.max(total - 1, 0));

    const context = React.useMemo<StepperContextValue>(
      () => ({ activeStep, total, orientation, linear, onStepChange }),
      [activeStep, total, orientation, linear, onStepChange],
    );

    const onKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
      const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-stepper-trigger]"));
      const from = triggers.indexOf(event.target as HTMLElement);
      if (from < 0) return;
      const forward = horizontal ? (dir === "rtl" ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
      const backward = horizontal ? (dir === "rtl" ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
      const to =
        event.key === forward
          ? Math.min(from + 1, triggers.length - 1)
          : event.key === backward
            ? Math.max(from - 1, 0)
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? triggers.length - 1
                : -1;
      if (to < 0) return;
      event.preventDefault();
      triggers[to].focus();
    };

    return (
      <StepperContext.Provider value={context}>
        <div ref={ref} className={cn(collapse && "@container", className)} {...props}>
          {collapse && total > 0 && (
            <div className="flex flex-col gap-S @lg:hidden">
              <p className="truncate text-body1 text-foreground-1">
                <span className="font-semibold">{`Bước ${shown + 1}/${total}`}</span>
                {" · "}
                {steps[shown]?.props.title}
              </p>
              <ProgressBar value={shown + 1} max={total} aria-label={`Bước ${shown + 1} trên ${total}`} />
            </div>
          )}
          <ol
            aria-label={ariaLabel ?? "Các bước"}
            data-orientation={horizontal ? "horizontal" : "vertical"}
            className={cn(horizontal ? "items-center gap-S" : "flex-col", collapse ? "hidden @lg:flex" : "flex")}
            onKeyDown={onStepChange ? onKeyDown : undefined}
          >
            {steps.map((step, index) => (
              <StepIndexContext.Provider key={step.key ?? index} value={index}>
                {step}
              </StepIndexContext.Provider>
            ))}
          </ol>
        </div>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = "Stepper";

/* ------------------------------------------------------------------------------------------------
 * Wizard
 * ---------------------------------------------------------------------------------------------- */

/** Kết quả kiểm tra: `true` / `undefined` = qua; `false` = chặn với thông báo chung; chuỗi = chặn với thông báo đó. */
export type WizardValidateResult = boolean | string | void | undefined;

export interface WizardStep {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  content: React.ReactNode;
  /** Chạy khi bấm Tiếp tục / Hoàn tất. Trả Promise → nút hiện `loading` tới khi xong. */
  validate?: () => WizardValidateResult | Promise<WizardValidateResult>;
}

export interface WizardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  steps: WizardStep[];
  /** Bước hiện tại (điều khiển). */
  activeStep?: number;
  /** Bước ban đầu (không điều khiển). Mặc định 0. */
  defaultActiveStep?: number;
  onStepChange?: (index: number) => void;
  /** Gọi sau khi bước cuối qua `validate`. Trả Promise → nút Hoàn tất `loading`. */
  onFinish?: () => void | Promise<void>;
  orientation?: StepperOrientation;
  /** Mặc định `true`: chỉ đi tới bằng nút Tiếp tục (đã kiểm tra). */
  linear?: boolean;
  backLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  finishLabel?: React.ReactNode;
}

const DEFAULT_INVALID = "Vui lòng kiểm tra lại thông tin ở bước này.";
const VALIDATE_FAILED = "Không kiểm tra được bước này. Hãy thử lại.";

function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return !!value && typeof (value as PromiseLike<T>).then === "function";
}

/**
 * Stepper + vùng nội dung từng bước + nút Quay lại / Tiếp tục / Hoàn tất. `validate` của mỗi bước có thể đồng bộ hoặc
 * bất đồng bộ (sau 300ms nút hiện Spinner, giữ nguyên độ rộng); lỗi hiện `role="alert"` và bước đó chuyển trạng thái `error`.
 * Đổi bước bằng nút → focus vào vùng nội dung để trình đọc màn hình đọc bước mới.
 */
export const Wizard = React.forwardRef<HTMLDivElement, WizardProps>(
  (
    {
      steps,
      activeStep: activeProp,
      defaultActiveStep = 0,
      onStepChange,
      onFinish,
      orientation = "horizontal",
      linear = true,
      backLabel = "Quay lại",
      nextLabel = "Tiếp tục",
      finishLabel = "Hoàn tất",
      className,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const [innerActive, setInnerActive] = React.useState(defaultActiveStep);
    const active = activeProp ?? innerActive;
    const [completed, setCompleted] = React.useState<ReadonlySet<number>>(() => new Set());
    const [error, setError] = React.useState<{ index: number; message: string } | null>(null);
    const [pending, setPending] = React.useState(false);
    const pendingRef = React.useRef(false);
    // Wait UX: Spinner trên nút chỉ hiện khi chờ > 300ms và giữ ≥ 500ms; `pending` vẫn chặn thao tác ngay lập tức.
    const showSpinner = useSpinDelay(pending);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const focusPanel = React.useRef(false);

    const total = steps.length;
    const step = steps[active];
    const isFirst = active <= 0;
    const isLast = active >= total - 1;

    React.useEffect(() => {
      if (!focusPanel.current) return;
      focusPanel.current = false;
      panelRef.current?.focus();
    }, [active]);

    const goTo = (index: number) => {
      if (pendingRef.current || index === active || index < 0 || index >= total) return;
      setError(null);
      focusPanel.current = true;
      if (activeProp === undefined) setInnerActive(index);
      onStepChange?.(index);
    };

    /** Chạy hàm có thể trả Promise; chỉ bật `pending` khi thật sự bất đồng bộ (không chớp loader cho validate đồng bộ). */
    const settle = async <T,>(run: () => T | PromiseLike<T>): Promise<T> => {
      const value = run();
      if (!isThenable<T>(value)) return value;
      pendingRef.current = true;
      setPending(true);
      try {
        return await value;
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    };

    const next = async () => {
      if (pendingRef.current || !step) return;
      setError(null);
      let result: WizardValidateResult;
      try {
        result = step.validate ? await settle(step.validate) : true;
      } catch {
        result = VALIDATE_FAILED;
      }
      if (result === false || typeof result === "string") {
        setError({ index: active, message: typeof result === "string" ? result : DEFAULT_INVALID });
        return;
      }
      setCompleted((prev) => new Set(prev).add(active));
      if (isLast) {
        if (onFinish) await settle(onFinish);
      } else {
        goTo(active + 1);
      }
    };

    const labelId = `${autoId}-panel-label`;

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-L", orientation === "vertical" && "@container", className)}
        {...props}
      >
        <div className={cn("flex flex-col gap-L", orientation === "vertical" && "@2xl:flex-row @2xl:gap-XXL")}>
          <Stepper
            activeStep={active}
            onStepChange={goTo}
            orientation={orientation}
            linear={linear}
            className={cn(orientation === "vertical" && "@2xl:w-56 @2xl:shrink-0")}
          >
            {steps.map((item, index) => (
              <Step
                key={item.id ?? index}
                title={item.title}
                description={item.description}
                optional={item.optional}
                status={error?.index === index ? "error" : completed.has(index) && index !== active ? "complete" : undefined}
              />
            ))}
          </Stepper>
          <div
            ref={panelRef}
            role="group"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-busy={pending || undefined}
            className="flex min-w-0 flex-1 flex-col gap-M rounded-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus"
          >
            <span id={labelId} className="sr-only">
              {`Bước ${Math.min(active + 1, total)}/${total}: `}
              {step?.title}
            </span>
            {step?.content}
          </div>
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-XS text-body1 text-danger-foreground-1">
            <ErrorCircle16Filled aria-hidden className="shrink-0" />
            {error.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-S border-t border-stroke-2 pt-M">
          <Button
            appearance="secondary"
            icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />}
            disabled={isFirst || pending}
            onClick={() => goTo(active - 1)}
          >
            {backLabel}
          </Button>
          <Button
            appearance="primary"
            loading={showSpinner}
            icon={isLast ? <Checkmark20Regular /> : <ArrowRight20Regular className="rtl:-scale-x-100" />}
            iconPosition={isLast ? "before" : "after"}
            onClick={() => void next()}
          >
            {isLast ? finishLabel : nextLabel}
          </Button>
        </div>
      </div>
    );
  },
);
Wizard.displayName = "Wizard";
