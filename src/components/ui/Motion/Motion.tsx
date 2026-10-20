/** Fluent 2 Motion components (Fade, Scale, Slide, Collapse, Blur, Rotate, Stagger) — https://storybooks.fluentui.dev/react/?path=/docs/motion-components-fade--docs */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

/** Thời lượng theo token `--duration*` (faster 100 · fast 150 · normal 200 · gentle 250 · slow 300 ms). */
export type MotionDuration = "faster" | "fast" | "normal" | "gentle" | "slow";
export type MotionStatus = "entering" | "entered" | "exiting" | "exited";
export type MotionDirection = "enter" | "exit";

const DURATION_TOKEN: Record<MotionDuration, string> = {
  faster: "--durationFaster",
  fast: "--durationFast",
  normal: "--durationNormal",
  gentle: "--durationGentle",
  slow: "--durationSlow",
};

const DURATION_CLASS: Record<MotionDuration, string> = {
  faster: "duration-faster",
  fast: "duration-fast",
  normal: "duration-normal",
  gentle: "duration-gentle",
  slow: "duration-slow",
};

const durationCache = new Map<string, number>();

/** Đọc token `--duration*` (vd. "200ms") thành số ms để hẹn giờ kết thúc pha chuyển động. */
function getDurationMs(duration: MotionDuration): number {
  if (typeof window === "undefined") return 0;
  const name = DURATION_TOKEN[duration];
  const cached = durationCache.get(name);
  if (cached !== undefined) return cached;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return 0;
  const value = parseFloat(raw);
  const ms = Number.isFinite(value) ? (raw.endsWith("ms") ? value : value * 1000) : 0;
  durationCache.set(name, ms);
  return ms;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ================================================================ usePresence */

export interface UsePresenceOptions {
  /** Chạy chuyển động vào ngay lần render đầu khi visible = true. */
  appear?: boolean;
  /** Gỡ phần tử khỏi DOM sau khi thoát xong. */
  unmountOnExit?: boolean;
  /** Thời lượng pha thoát (ms); mặc định bằng durationMs. */
  exitDurationMs?: number;
  onFinish?: (direction: MotionDirection) => void;
}

export interface UsePresenceResult {
  status: MotionStatus;
  /** false khi đã thoát và unmountOnExit — không render phần tử. */
  mounted: boolean;
  /** true ở entering / entered — áp style "đích" (hiện). */
  active: boolean;
}

/**
 * Máy trạng thái presence: exited → entering → entered → exiting → exited.
 * Khi vào từ exited, phần tử được gắn với style "xuất phát" trước một khung hình rồi mới chuyển sang entering
 * để CSS transition chạy. Tôn trọng prefers-reduced-motion (nhảy thẳng tới trạng thái cuối).
 */
export function usePresence(visible: boolean, durationMs: number, options: UsePresenceOptions = {}): UsePresenceResult {
  const { appear = false, unmountOnExit = false, exitDurationMs = durationMs, onFinish } = options;
  const [status, setStatusState] = React.useState<MotionStatus>(() => (visible && !appear ? "entered" : "exited"));
  const [mounted, setMounted] = React.useState(visible || !unmountOnExit);
  const statusRef = React.useRef(status);
  const latest = React.useRef({ durationMs, exitDurationMs, unmountOnExit, onFinish });
  latest.current = { durationMs, exitDurationMs, unmountOnExit, onFinish };

  const setStatus = React.useCallback((next: MotionStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  React.useEffect(() => {
    const current = statusRef.current;
    const opts = latest.current;
    const reduce = prefersReducedMotion();
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0;

    if (visible) {
      if (current === "entering" || current === "entered") return;
      if (!mounted) {
        // Gắn phần tử trước (style xuất phát); effect chạy lại khi mounted đổi.
        setMounted(true);
        return;
      }
      if (reduce || opts.durationMs <= 0) {
        setStatus("entered");
        opts.onFinish?.("enter");
        return;
      }
      const start = () => {
        setStatus("entering");
        timer = window.setTimeout(() => {
          setStatus("entered");
          latest.current.onFinish?.("enter");
        }, latest.current.durationMs);
      };
      if (current === "exiting") start();
      else raf1 = requestAnimationFrame(() => (raf2 = requestAnimationFrame(start)));
    } else {
      if (current === "exited") {
        if (mounted && opts.unmountOnExit) setMounted(false);
        return;
      }
      if (current === "exiting") return;
      const done = () => {
        setStatus("exited");
        if (latest.current.unmountOnExit) setMounted(false);
        latest.current.onFinish?.("exit");
      };
      if (reduce || opts.exitDurationMs <= 0) {
        done();
        return;
      }
      setStatus("exiting");
      timer = window.setTimeout(done, opts.exitDurationMs);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [visible, mounted, setStatus]);

  return { status, mounted, active: status === "entering" || status === "entered" };
}

/* ================================================================ Presence components */

export interface PresenceMotionProps {
  /** Hiện (chạy chuyển động vào) hay ẩn (chạy chuyển động ra). */
  visible: boolean;
  appear?: boolean;
  unmountOnExit?: boolean;
  /** Thời lượng pha vào. Mặc định "normal". */
  duration?: MotionDuration;
  /** Thời lượng pha ra. Mặc định bằng duration. */
  exitDuration?: MotionDuration;
  onMotionFinish?: (direction: MotionDirection) => void;
  className?: string;
  style?: React.CSSProperties;
  /** Một phần tử duy nhất — nhận class chuyển động (Radix Slot). */
  children: React.ReactElement;
}

type MotionTimingProps = Omit<PresenceMotionProps, "children" | "className" | "style">;

interface MotionRecipe {
  /** Utility transition-property. */
  property: string;
  /** Style lúc ẩn (xuất phát khi vào, đích khi ra). */
  from: string;
  /** Style lúc hiện. */
  to: string;
}

function usePresenceMotion(props: MotionTimingProps, recipe: MotionRecipe) {
  const { visible, appear, unmountOnExit, duration = "normal", exitDuration = duration, onMotionFinish } = props;
  const presence = usePresence(visible, getDurationMs(duration), {
    appear,
    unmountOnExit,
    exitDurationMs: getDurationMs(exitDuration),
    onFinish: onMotionFinish,
  });
  const className = cn(
    recipe.property,
    "motion-reduce:transition-none",
    presence.active
      ? [DURATION_CLASS[duration], "ease-decelerate-mid", recipe.to]
      : [DURATION_CLASS[exitDuration], "ease-accelerate-mid", recipe.from],
    presence.status === "exiting" && "pointer-events-none",
    presence.status === "exited" && "invisible",
  );
  return { ...presence, className };
}

const PresenceSlot = React.forwardRef<HTMLElement, PresenceMotionProps & { recipe: MotionRecipe }>(
  ({ recipe, className, style, children, ...timing }, ref) => {
    const motion = usePresenceMotion(timing, recipe);
    if (!motion.mounted) return null;
    return (
      <Slot ref={ref} data-motion={motion.status} className={cn(motion.className, className)} style={style}>
        {children}
      </Slot>
    );
  },
);
PresenceSlot.displayName = "PresenceSlot";

const FADE: MotionRecipe = { property: "transition-opacity", from: "opacity-0", to: "opacity-100" };

/** Fade — mờ dần vào / ra. */
export const Fade = React.forwardRef<HTMLElement, PresenceMotionProps>((props, ref) => (
  <PresenceSlot ref={ref} recipe={FADE} {...props} />
));
Fade.displayName = "Fade";

export interface ScaleProps extends PresenceMotionProps {
  /** Kết hợp mờ dần. Mặc định true. */
  animateOpacity?: boolean;
}

/** Scale — phóng từ 90% lên 100%. */
export const Scale = React.forwardRef<HTMLElement, ScaleProps>(({ animateOpacity = true, ...props }, ref) => (
  <PresenceSlot
    ref={ref}
    recipe={{
      property: "transition-[opacity,scale]",
      from: cn("scale-90", animateOpacity && "opacity-0"),
      to: "scale-100 opacity-100",
    }}
    {...props}
  />
));
Scale.displayName = "Scale";

export type SlideFrom = "start" | "end" | "top" | "bottom";

/** start/end là hướng logic: tự đảo trong RTL. */
const SLIDE_FROM: Record<SlideFrom, string> = {
  start: "-translate-x-XL rtl:translate-x-XL",
  end: "translate-x-XL rtl:-translate-x-XL",
  top: "-translate-y-XL",
  bottom: "translate-y-XL",
};

export interface SlideProps extends PresenceMotionProps {
  /** Phía phần tử trượt vào. Mặc định "bottom". */
  from?: SlideFrom;
  animateOpacity?: boolean;
}

/** Slide — trượt vào từ một cạnh (start/end theo hướng chữ). */
export const Slide = React.forwardRef<HTMLElement, SlideProps>(({ from = "bottom", animateOpacity = true, ...props }, ref) => (
  <PresenceSlot
    ref={ref}
    recipe={{
      property: "transition-[opacity,translate]",
      from: cn(SLIDE_FROM[from], animateOpacity && "opacity-0"),
      to: "translate-x-0 translate-y-0 opacity-100",
    }}
    {...props}
  />
));
Slide.displayName = "Slide";

export interface BlurProps extends PresenceMotionProps {
  animateOpacity?: boolean;
}

/** Blur — từ nhoè sang rõ. */
export const Blur = React.forwardRef<HTMLElement, BlurProps>(({ animateOpacity = true, ...props }, ref) => (
  <PresenceSlot
    ref={ref}
    recipe={{ property: "transition-[opacity,filter]", from: cn("blur-md", animateOpacity && "opacity-0"), to: "opacity-100" }}
    {...props}
  />
));
Blur.displayName = "Blur";

export interface RotateProps extends PresenceMotionProps {
  animateOpacity?: boolean;
}

/** Rotate — xoay từ -90° về 0° (đảo chiều trong RTL). */
export const Rotate = React.forwardRef<HTMLElement, RotateProps>(({ animateOpacity = true, ...props }, ref) => (
  <PresenceSlot
    ref={ref}
    recipe={{
      property: "transition-[opacity,rotate]",
      from: cn("-rotate-90 rtl:rotate-90", animateOpacity && "opacity-0"),
      to: "rotate-0 opacity-100",
    }}
    {...props}
  />
));
Rotate.displayName = "Rotate";

export interface CollapseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<PresenceMotionProps, "children" | "className" | "style"> {
  /** vertical: thu/giãn chiều cao (mặc định); horizontal: chiều rộng. */
  orientation?: "vertical" | "horizontal";
  animateOpacity?: boolean;
  children?: React.ReactNode;
}

/** Collapse — giãn chiều cao bằng kỹ thuật grid-template-rows 0fr → 1fr (không cần đo chiều cao). */
export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      visible,
      appear,
      unmountOnExit,
      duration,
      exitDuration,
      onMotionFinish,
      orientation = "vertical",
      animateOpacity = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const vertical = orientation === "vertical";
    const motion = usePresenceMotion(
      { visible, appear, unmountOnExit, duration, exitDuration, onMotionFinish },
      {
        property: vertical ? "transition-[grid-template-rows,opacity]" : "transition-[grid-template-columns,opacity]",
        from: cn(vertical ? "grid-rows-[0fr]" : "grid-cols-[0fr]", animateOpacity && "opacity-0"),
        to: cn(vertical ? "grid-rows-[1fr]" : "grid-cols-[1fr]", "opacity-100"),
      },
    );
    if (!motion.mounted) return null;
    return (
      <div ref={ref} data-motion={motion.status} className={cn(vertical ? "grid" : "inline-grid", motion.className, className)} {...props}>
        <div className={cn(vertical ? "min-h-0" : "min-w-0", motion.status !== "entered" && "overflow-hidden")}>{children}</div>
      </div>
    );
  },
);
Collapse.displayName = "Collapse";

const PRESENCE_COMPONENTS = new Set<unknown>([Fade, Scale, Slide, Blur, Rotate, Collapse]);

/* ================================================================ Stagger */

export interface StaggerProps {
  visible: boolean;
  /** Độ trễ giữa hai phần tử liên tiếp. Mặc định "faster". */
  itemDelay?: MotionDuration;
  /** Chạy lần lượt ngay lần render đầu khi visible = true. */
  appear?: boolean;
  /** Truyền cho từng phần tử con (nếu con chưa tự đặt). */
  unmountOnExit?: boolean;
  /**
   * Phần tử con là Fade / Scale / Slide / Blur / Rotate / Collapse sẽ được điều khiển `visible`;
   * phần tử thường được bọc tự động trong <Fade>.
   */
  children: React.ReactNode;
}

/** Stagger — các phần tử con xuất hiện lần lượt; khi ẩn thì biến mất theo thứ tự ngược lại. */
export function Stagger({ visible, itemDelay = "faster", appear = false, unmountOnExit = false, children }: StaggerProps) {
  const items = React.Children.toArray(children).filter((child): child is React.ReactElement => React.isValidElement(child));
  const count = items.length;
  const [shown, setShown] = React.useState(() => (visible && !appear ? count : 0));
  const shownRef = React.useRef(shown);

  React.useEffect(() => {
    const target = visible ? count : 0;
    const set = (n: number) => {
      shownRef.current = n;
      setShown(n);
    };
    if (shownRef.current === target) return;
    const delay = getDurationMs(itemDelay);
    if (prefersReducedMotion() || delay <= 0) {
      set(target);
      return;
    }
    let timer = 0;
    const step = () => {
      const current = shownRef.current;
      if (current === target) return;
      set(current + (current < target ? 1 : -1));
      if (shownRef.current !== target) timer = window.setTimeout(step, delay);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [visible, count, itemDelay]);

  return (
    <>
      {items.map((child, index) => {
        const itemVisible = index < shown;
        if (PRESENCE_COMPONENTS.has(child.type)) {
          const own = child.props as Partial<PresenceMotionProps>;
          return React.cloneElement(child as React.ReactElement<Partial<PresenceMotionProps>>, {
            visible: itemVisible,
            unmountOnExit: own.unmountOnExit ?? unmountOnExit,
          });
        }
        return (
          <Fade key={child.key ?? index} visible={itemVisible} unmountOnExit={unmountOnExit}>
            {child}
          </Fade>
        );
      })}
    </>
  );
}
