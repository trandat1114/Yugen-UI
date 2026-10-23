import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { ChevronLeft20Regular, ChevronRight20Regular, Pause20Regular, Play20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { Button } from "../Button/Button";

/** Fluent 2 Carousel — https://fluent2.microsoft.design/components/web/react/core/carousel/usage (+ Yugen Labs: progress, peek, thumbnails) */
export type CarouselGap = "none" | "XS" | "S" | "M" | "L" | "XL";
type PauseReason = "hover" | "focus";

interface CarouselContextValue {
  activeIndex: number;
  count: number;
  setCount: (count: number) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  circular: boolean;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
  /** Tương thích ngược: tạm dừng / chạy tiếp (lý do "hover"). */
  setPaused: (paused: boolean) => void;
  setPauseReason: (reason: PauseReason, active: boolean) => void;
  /** Đang tự chạy thật sự (autoplay bật và không bị tạm dừng). */
  rotating: boolean;
  /** Gắn phần tử hiển thị tiến độ autoplay (nhận biến CSS --carousel-progress 0…1). */
  registerProgress: (element: HTMLElement) => () => void;
  slidesPerView?: number;
  gap: CarouselGap;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  onViewportScroll: () => void;
  cancelProgrammaticScroll: () => void;
  baseId: string;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const SlideIndexContext = React.createContext(0);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error("Carousel components phải nằm trong <Carousel>.");
  return ctx;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function isRtl(element: HTMLElement) {
  return getComputedStyle(element).direction === "rtl";
}

/**
 * Khoảng cách (px) theo chiều đọc từ mép đầu viewport tới mép đầu slide — RTL đo từ mép phải.
 * Dùng rect thay cho offsetLeft/scrollLeft để không phụ thuộc quy ước scrollLeft âm của RTL.
 */
function inlineOffset(track: HTMLElement, slide: HTMLElement, rtl: boolean) {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  const innerStart = trackRect.left + track.clientLeft;
  return rtl ? innerStart + track.clientWidth - slideRect.right : slideRect.left - innerStart;
}

const GAP_CLASS: Record<CarouselGap, string> = {
  none: "gap-0",
  XS: "gap-1",
  S: "gap-2",
  M: "gap-3",
  L: "gap-4",
  XL: "gap-5",
};
const GAP_VALUE: Record<CarouselGap, string> = {
  none: "0px",
  XS: "var(--spacingXS)",
  S: "var(--spacingS)",
  M: "var(--spacingM)",
  L: "var(--spacingL)",
  XL: "var(--spacingXL)",
};

/** Bàn phím cho tablist (chấm / thumbnail): mũi tên theo hướng chữ, Home / End. Trả về chỉ mục đích hoặc null. */
function tabTarget(event: React.KeyboardEvent, ctx: CarouselContextValue, dir: "ltr" | "rtl") {
  const last = ctx.count - 1;
  const step = dir === "rtl" ? -1 : 1;
  let index: number;
  switch (event.key) {
    case "ArrowRight":
      index = ctx.activeIndex + step;
      break;
    case "ArrowLeft":
      index = ctx.activeIndex - step;
      break;
    case "Home":
      index = 0;
      break;
    case "End":
      index = last;
      break;
    default:
      return null;
  }
  event.preventDefault();
  event.stopPropagation();
  return ctx.circular ? (index + ctx.count) % ctx.count : Math.max(0, Math.min(last, index));
}

/* ------------------------------------------------------------------ Carousel */
export interface CarouselProps extends React.HTMLAttributes<HTMLElement> {
  /** Vòng lặp: từ slide cuối bấm "tiếp" (hoặc phím mũi tên) về slide đầu và ngược lại. */
  loop?: boolean;
  /** Tên cũ của `loop` (giữ để tương thích). */
  circular?: boolean;
  /** Tự chạy (controlled). Dùng kèm `onAutoplayChange`. */
  autoplay?: boolean;
  /** Bật tự chạy ngay từ đầu (uncontrolled) — bị bỏ qua khi người dùng bật giảm chuyển động. */
  defaultAutoplay?: boolean;
  onAutoplayChange?: (autoplay: boolean) => void;
  /** Thời gian mỗi slide khi tự chạy (ms). */
  autoplayInterval?: number;
  /** Số slide thấy cùng lúc; số lẻ để lộ một phần slide kế (vd. 1.15). Bỏ trống = mỗi slide rộng 100%. */
  slidesPerView?: number;
  /** Khoảng cách giữa các slide (token spacing). */
  gap?: CarouselGap;
  onActiveIndexChange?: (index: number) => void;
}

export const Carousel = React.forwardRef<HTMLElement, CarouselProps>(
  (
    {
      loop,
      circular: circularProp,
      autoplay: autoplayProp,
      defaultAutoplay = false,
      onAutoplayChange,
      autoplayInterval = 4000,
      slidesPerView,
      gap = "S",
      onActiveIndexChange,
      className,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const circular = loop ?? circularProp ?? false;
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const dir = useDirection();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [innerAutoplay, setInnerAutoplay] = React.useState(() => defaultAutoplay && !prefersReducedMotion());
    const autoplay = autoplayProp ?? innerAutoplay;
    const [reasons, setReasons] = React.useState<Record<PauseReason, boolean>>({ hover: false, focus: false });
    const [hidden, setHidden] = React.useState(false);
    // Cuộn khỏi màn hình thì dừng tự chạy (không tốn CPU cho thứ không ai thấy), quay lại thì chạy tiếp từ chỗ dừng.
    const [offscreen, setOffscreen] = React.useState(false);
    // Số vạch tiến độ đang hiện: không có vạch nào thì đồng hồ chỉ cần một setTimeout tới lần chuyển slide.
    const [progressCount, setProgressCount] = React.useState(0);
    const paused = reasons.hover || reasons.focus || hidden || offscreen;
    const rotating = autoplay && !paused && count > 1;
    const baseId = React.useId();
    const activeRef = React.useRef(0);
    const targetRef = React.useRef<number | null>(null);
    const frameRef = React.useRef(0);
    const elapsedRef = React.useRef(0);
    // Lúc đồng hồ được đặt lại (đổi slide): đồng hồ setTimeout chỉ tính thời gian từ mốc này.
    const resetAtRef = React.useRef(0);
    const progressEls = React.useRef(new Set<HTMLElement>());
    const callbacks = React.useRef({ onActiveIndexChange, onAutoplayChange });
    useIsomorphicLayoutEffect(() => {
      callbacks.current = { onActiveIndexChange, onAutoplayChange };
    });

    const paintProgress = React.useCallback(() => {
      const value = autoplay ? Math.min(1, elapsedRef.current / autoplayInterval) : 1;
      progressEls.current.forEach((el) => el.style.setProperty("--carousel-progress", String(value)));
    }, [autoplay, autoplayInterval]);

    const registerProgress = React.useCallback(
      (element: HTMLElement) => {
        progressEls.current.add(element);
        setProgressCount(progressEls.current.size);
        paintProgress();
        return () => {
          progressEls.current.delete(element);
          setProgressCount(progressEls.current.size);
        };
      },
      [paintProgress],
    );

    const updateActive = React.useCallback((index: number) => {
      if (index === activeRef.current) return;
      activeRef.current = index;
      elapsedRef.current = 0; // slide mới → đồng hồ autoplay chạy lại từ đầu
      resetAtRef.current = performance.now();
      setActiveIndex(index);
      callbacks.current.onActiveIndexChange?.(index);
    }, []);

    const goTo = React.useCallback(
      (index: number) => {
        const track = viewportRef.current;
        if (!track || count === 0) return;
        const i = circular ? (index + count) % count : Math.max(0, Math.min(count - 1, index));
        const slide = track.children[i] as HTMLElement | undefined;
        if (!slide) return;
        targetRef.current = i;
        // RTL: scrollLeft bằng 0 ở đầu và âm dần khi tiến về sau.
        const rtl = isRtl(track);
        const offset = inlineOffset(track, slide, rtl);
        track.scrollTo({ left: track.scrollLeft + (rtl ? -offset : offset), behavior: prefersReducedMotion() ? "auto" : "smooth" });
        updateActive(i);
      },
      [count, circular, updateActive],
    );

    const next = React.useCallback(() => goTo(activeRef.current + 1), [goTo]);
    const prev = React.useCallback(() => goTo(activeRef.current - 1), [goTo]);

    const setAutoplay = React.useCallback(
      (value: boolean) => {
        if (autoplayProp === undefined) setInnerAutoplay(value);
        elapsedRef.current = 0;
        callbacks.current.onAutoplayChange?.(value);
      },
      [autoplayProp],
    );

    const setPauseReason = React.useCallback((reason: PauseReason, active: boolean) => {
      setReasons((current) => (current[reason] === active ? current : { ...current, [reason]: active }));
    }, []);
    const setPaused = React.useCallback((value: boolean) => setPauseReason("hover", value), [setPauseReason]);

    const onViewportScroll = React.useCallback(() => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const track = viewportRef.current;
        if (!track) return;
        const slides = Array.from(track.children) as HTMLElement[];
        if (slides.length === 0) return;
        let best = 0;
        const rtl = isRtl(track);
        if (Math.abs(track.scrollLeft) + track.clientWidth >= track.scrollWidth - 2) {
          best = slides.length - 1;
        } else {
          let min = Number.POSITIVE_INFINITY;
          slides.forEach((slide, i) => {
            const distance = Math.abs(inlineOffset(track, slide, rtl));
            if (distance < min) {
              min = distance;
              best = i;
            }
          });
        }
        // Đang cuộn tới slide do nút / chấm yêu cầu: bỏ qua các vị trí trung gian.
        if (targetRef.current !== null) {
          if (best !== targetRef.current) return;
          targetRef.current = null;
        }
        updateActive(best);
      });
    }, [updateActive]);

    const cancelProgrammaticScroll = React.useCallback(() => {
      targetRef.current = null;
    }, []);

    React.useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    // Tab bị ẩn (chuyển tab, khoá máy) → dừng tự chạy.
    React.useEffect(() => {
      const sync = () => setHidden(document.hidden);
      sync();
      document.addEventListener("visibilitychange", sync);
      return () => document.removeEventListener("visibilitychange", sync);
    }, []);

    React.useEffect(() => {
      const el = viewportRef.current;
      if (!el || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // Đồng hồ autoplay: tạm dừng giữ nguyên tiến độ, chạy tiếp từ chỗ dừng. Có vạch tiến độ thì cập nhật mỗi frame
    // (requestAnimationFrame); không có thì một setTimeout cho phần thời gian còn lại, không chạy vòng lặp 60 lần/giây.
    React.useEffect(() => {
      paintProgress();
      if (!rotating) return;
      let last = performance.now();
      let frame = 0;
      let timer = 0;
      const tick = (now: number) => {
        elapsedRef.current += now - Math.max(last, resetAtRef.current);
        last = now;
        if (elapsedRef.current >= autoplayInterval) {
          elapsedRef.current = 0;
          goTo(activeRef.current + 1 >= count ? 0 : activeRef.current + 1);
        }
        paintProgress();
        schedule();
      };
      const schedule = () => {
        if (progressCount > 0) frame = requestAnimationFrame(tick);
        else timer = window.setTimeout(() => tick(performance.now()), Math.max(0, autoplayInterval - elapsedRef.current));
      };
      schedule();
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        // Giữ phần thời gian đã chạy tới lúc dừng (vd. hover giữa chừng).
        elapsedRef.current += performance.now() - Math.max(last, resetAtRef.current);
      };
    }, [rotating, count, autoplayInterval, goTo, paintProgress, progressCount]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const tag = (event.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const prevKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (event.key === nextKey) {
        event.preventDefault();
        next();
      } else if (event.key === prevKey) {
        event.preventDefault();
        prev();
      }
    };

    const context = React.useMemo<CarouselContextValue>(
      () => ({
        activeIndex,
        count,
        setCount,
        goTo,
        next,
        prev,
        circular,
        autoplay,
        setAutoplay,
        setPaused,
        setPauseReason,
        rotating,
        registerProgress,
        slidesPerView,
        gap,
        viewportRef,
        onViewportScroll,
        cancelProgrammaticScroll,
        baseId,
      }),
      [
        activeIndex,
        count,
        goTo,
        next,
        prev,
        circular,
        autoplay,
        setAutoplay,
        setPaused,
        setPauseReason,
        rotating,
        registerProgress,
        slidesPerView,
        gap,
        onViewportScroll,
        cancelProgrammaticScroll,
        baseId,
      ],
    );

    return (
      <CarouselContext.Provider value={context}>
        <section
          ref={ref}
          aria-roledescription="carousel"
          className={cn("relative flex min-w-0 flex-col gap-3", className)}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
          <div aria-live={rotating ? "off" : "polite"} aria-atomic className="sr-only">
            {count > 0 ? `Slide ${activeIndex + 1} / ${count}` : ""}
          </div>
        </section>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

/* ------------------------------------------------------------------ CarouselViewport */
/** Track cuộn ngang (CSS scroll-snap); mỗi con trực tiếp là một CarouselCard. */
export const CarouselViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (
    { className, style, children, onScroll, onPointerDown, onWheel, onTouchStart, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props },
    ref,
  ) => {
    const ctx = useCarousel();
    const slides = React.Children.toArray(children).filter(React.isValidElement);
    const total = slides.length;
    const { setCount, viewportRef, setPauseReason } = ctx;

    React.useEffect(() => setCount(total), [total, setCount]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, viewportRef],
    );

    return (
      <div
        ref={setRefs}
        tabIndex={0}
        className={cn(
          "relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xlarge",
          "scrollbar-none [&::-webkit-scrollbar]:hidden",
          GAP_CLASS[ctx.gap],
          className,
        )}
        style={{ "--carousel-gap": GAP_VALUE[ctx.gap], ...style } as React.CSSProperties}
        onScroll={(event) => {
          onScroll?.(event);
          ctx.onViewportScroll();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          ctx.cancelProgrammaticScroll();
        }}
        onWheel={(event) => {
          onWheel?.(event);
          ctx.cancelProgrammaticScroll();
        }}
        onTouchStart={(event) => {
          onTouchStart?.(event);
          ctx.cancelProgrammaticScroll();
        }}
        // Tạm dừng autoplay khi người dùng đang xem / thao tác với slide.
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setPauseReason("hover", true);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          setPauseReason("hover", false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setPauseReason("focus", true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPauseReason("focus", false);
        }}
        {...props}
      >
        {slides.map((child, index) => (
          <SlideIndexContext.Provider key={child.key ?? index} value={index}>
            {child}
          </SlideIndexContext.Provider>
        ))}
      </div>
    );
  },
);
CarouselViewport.displayName = "CarouselViewport";

/* ------------------------------------------------------------------ CarouselCard */
/**
 * Một slide. Mặc định rộng 100% viewport; đặt `slidesPerView` trên Carousel (vd. 1.15) hoặc
 * `className="basis-4/5"` để lộ một phần slide kế.
 */
export const CarouselCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    const ctx = useCarousel();
    const index = React.useContext(SlideIndexContext);
    const perView = ctx.slidesPerView;
    const basis =
      perView && perView > 0
        ? { flexBasis: `calc((100% - var(--carousel-gap) * ${Math.max(0, Math.ceil(perView) - 1)}) / ${perView})` }
        : undefined;
    return (
      <div
        ref={ref}
        id={`${ctx.baseId}-slide-${index}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${index + 1} / ${ctx.count}`}
        className={cn("min-w-0 shrink-0 grow-0 basis-full snap-start", className)}
        style={basis ? { ...basis, ...style } : style}
        {...props}
      />
    );
  },
);
CarouselCard.displayName = "CarouselCard";

/* ------------------------------------------------------------------ Progress fill */
/**
 * Vạch tiến độ autoplay: co giãn theo --carousel-progress (0…1) bằng scaleX (không layout lại mỗi frame), mọc từ mép đầu
 * dòng (origin trái ở LTR, phải ở RTL).
 */
function ProgressFill({ className }: { className?: string }) {
  const { registerProgress } = useCarousel();
  const fillRef = React.useRef<HTMLSpanElement>(null);
  useIsomorphicLayoutEffect(() => {
    if (fillRef.current) return registerProgress(fillRef.current);
  }, [registerProgress]);
  return (
    <span
      ref={fillRef}
      aria-hidden
      className={cn(
        "absolute inset-0 origin-left scale-x-(--carousel-progress,1) bg-brand-background rtl:origin-right",
        className,
      )}
    />
  );
}

/* ------------------------------------------------------------------ CarouselNavContainer */
export interface CarouselNavContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hiện nút bật / tắt tự chạy. */
  autoplay?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

/** Nút trước / sau + chấm điều hướng (tablist) + nút autoplay tuỳ chọn. Chấm đang chọn hiện tiến độ autoplay. */
export function CarouselNavContainer({
  autoplay: showAutoplay = false,
  prevLabel = "Slide trước",
  nextLabel = "Slide tiếp theo",
  className,
  ...props
}: CarouselNavContainerProps) {
  const ctx = useCarousel();
  const dir = useDirection();
  const dotRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const atStart = !ctx.circular && ctx.activeIndex === 0;
  const atEnd = !ctx.circular && ctx.activeIndex >= ctx.count - 1;

  const onDotsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = tabTarget(event, ctx, dir);
    if (target === null) return;
    ctx.goTo(target);
    dotRefs.current[target]?.focus();
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      {showAutoplay && (
        <Button
          appearance="subtle"
          shape="circular"
          icon={ctx.autoplay ? <Pause20Regular /> : <Play20Regular />}
          aria-label="Tự động chạy"
          aria-pressed={ctx.autoplay}
          onClick={() => ctx.setAutoplay(!ctx.autoplay)}
        />
      )}
      <Button
        appearance="secondary"
        shape="circular"
        icon={<ChevronLeft20Regular className="rtl:-scale-x-100" />}
        aria-label={prevLabel}
        disabled={atStart}
        onClick={ctx.prev}
      />
      <div role="tablist" aria-label="Chọn slide" className="flex items-center" onKeyDown={onDotsKeyDown}>
        {Array.from({ length: ctx.count }, (_, i) => {
          const active = i === ctx.activeIndex;
          return (
            <button
              key={i}
              ref={(node) => {
                dotRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${ctx.baseId}-slide-${i}`}
              aria-label={`Slide ${i + 1} / ${ctx.count}`}
              tabIndex={active ? 0 : -1}
              onClick={() => ctx.goTo(i)}
              className="group/dot flex h-6 cursor-pointer items-center justify-center rounded-circular px-1"
            >
              <span
                className={cn(
                  "relative block h-2 overflow-hidden rounded-circular transition-[width,background-color] duration-normal ease-easy-ease motion-reduce:transition-none",
                  active
                    ? cn(ctx.autoplay ? "w-6 bg-stroke-accessible" : "w-4 bg-brand-background")
                    : "w-2 bg-stroke-accessible group-hover/dot:bg-foreground-2",
                )}
              >
                {active && ctx.autoplay && <ProgressFill />}
              </span>
            </button>
          );
        })}
      </div>
      <Button
        appearance="secondary"
        shape="circular"
        icon={<ChevronRight20Regular className="rtl:-scale-x-100" />}
        aria-label={nextLabel}
        disabled={atEnd}
        onClick={ctx.next}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ CarouselThumbnails */
const ThumbnailIndexContext = React.createContext(0);
const ThumbnailRefsContext = React.createContext<React.MutableRefObject<(HTMLButtonElement | null)[]> | null>(null);

export type CarouselThumbnailsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Điều hướng bằng ảnh thu nhỏ (tablist). Mỗi con trực tiếp là một CarouselThumbnail theo đúng thứ tự slide.
 * Dùng thay cho chấm của CarouselNavContainer, không dùng cả hai.
 */
export const CarouselThumbnails = React.forwardRef<HTMLDivElement, CarouselThumbnailsProps>(
  ({ className, children, onKeyDown, "aria-label": ariaLabel = "Chọn slide", ...props }, ref) => {
    const ctx = useCarousel();
    const dir = useDirection();
    const stripRef = React.useRef<HTMLDivElement | null>(null);
    const thumbRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const items = React.Children.toArray(children).filter(React.isValidElement);

    // Giữ thumbnail đang chọn trong vùng nhìn của dải (chỉ cuộn dải, không cuộn trang).
    React.useEffect(() => {
      const strip = stripRef.current;
      const thumb = thumbRefs.current[ctx.activeIndex];
      if (!strip || !thumb) return;
      const s = strip.getBoundingClientRect();
      const t = thumb.getBoundingClientRect();
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
      if (t.left < s.left) strip.scrollBy({ left: t.left - s.left, behavior });
      else if (t.right > s.right) strip.scrollBy({ left: t.right - s.right, behavior });
    }, [ctx.activeIndex]);

    return (
      <div
        ref={(node) => {
          stripRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="tablist"
        aria-label={ariaLabel}
        className={cn("flex gap-2 overflow-x-auto p-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const target = tabTarget(event, ctx, dir);
          if (target === null) return;
          ctx.goTo(target);
          thumbRefs.current[target]?.focus();
        }}
        {...props}
      >
        <ThumbnailRefsContext.Provider value={thumbRefs}>
          {items.map((child, index) => (
            <ThumbnailIndexContext.Provider key={child.key ?? index} value={index}>
              {child}
            </ThumbnailIndexContext.Provider>
          ))}
        </ThumbnailRefsContext.Provider>
      </div>
    );
  },
);
CarouselThumbnails.displayName = "CarouselThumbnails";

/** Một ảnh thu nhỏ (role="tab"). Con thường là `<Image fit="cover">` (lấp đầy khung); nhãn mặc định "Slide x / n". */
export const CarouselThumbnail = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const ctx = useCarousel();
    const index = React.useContext(ThumbnailIndexContext);
    const refs = React.useContext(ThumbnailRefsContext);
    const active = index === ctx.activeIndex;
    return (
      <button
        ref={(node) => {
          if (refs) refs.current[index] = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={`${ctx.baseId}-slide-${index}`}
        aria-label={`Slide ${index + 1} / ${ctx.count}`}
        tabIndex={active ? 0 : -1}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) ctx.goTo(index);
        }}
        className={cn(
          "relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-medium border-2 bg-background-3",
          "transition-[border-color,opacity] duration-faster ease-easy-ease motion-reduce:transition-none",
          active ? "border-brand-stroke" : "border-transparent opacity-70 hover:border-stroke-1-hover hover:opacity-100",
          className,
        )}
        {...props}
      >
        {children}
        {active && ctx.autoplay && (
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-stroke-accessible">
            <ProgressFill />
          </span>
        )}
      </button>
    );
  },
);
CarouselThumbnail.displayName = "CarouselThumbnail";
