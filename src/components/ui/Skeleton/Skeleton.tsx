import * as React from "react";
import { cn } from "@/lib/cn";

/** Fluent 2 Skeleton — https://fluent2.microsoft.design/components/web/react/core/skeleton/usage */
type SkeletonAnimation = "wave" | "pulse";
type SkeletonAppearance = "opaque" | "translucent";

const SkeletonContext = React.createContext<{ animation: SkeletonAnimation; appearance: SkeletonAppearance }>({
  animation: "wave",
  appearance: "opaque",
});

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** wave: dải sáng chạy ngang · pulse: nhấp nháy độ mờ. Áp dụng cho mọi SkeletonItem con. */
  animation?: SkeletonAnimation;
  /** opaque: nền stencil đặc · translucent: nền bán trong suốt, dùng trên bề mặt có màu. */
  appearance?: SkeletonAppearance;
}

/** true khi đang nằm trong một Skeleton — preset lồng bên trong không tạo thêm role="progressbar". */
const SkeletonRootContext = React.createContext(false);

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ animation = "wave", appearance = "opaque", className, ...props }, ref) => (
    <SkeletonContext.Provider value={{ animation, appearance }}>
      <SkeletonRootContext.Provider value>
        <div
          ref={ref}
          role="progressbar"
          aria-busy="true"
          aria-label="Đang tải nội dung"
          className={cn("flex flex-col gap-S", className)}
          {...props}
        />
      </SkeletonRootContext.Provider>
    </SkeletonContext.Provider>
  ),
);
Skeleton.displayName = "Skeleton";

/** Chiều cao (rectangle) hoặc cạnh (circle / square) theo px → class Tailwind. */
const SIZE = {
  8: { h: "h-2", box: "size-2" },
  12: { h: "h-3", box: "size-3" },
  16: { h: "h-4", box: "size-4" },
  20: { h: "h-5", box: "size-5" },
  24: { h: "h-6", box: "size-6" },
  28: { h: "h-7", box: "size-7" },
  32: { h: "h-8", box: "size-8" },
  36: { h: "h-9", box: "size-9" },
  40: { h: "h-10", box: "size-10" },
  48: { h: "h-12", box: "size-12" },
  56: { h: "h-14", box: "size-14" },
  64: { h: "h-16", box: "size-16" },
  72: { h: "h-18", box: "size-18" },
  96: { h: "h-24", box: "size-24" },
  120: { h: "h-30", box: "size-30" },
  128: { h: "h-32", box: "size-32" },
} as const;

export type SkeletonItemSize = keyof typeof SIZE;

const ANIMATION: Record<SkeletonAppearance, Record<SkeletonAnimation, string>> = {
  opaque: {
    wave: cn(
      "bg-stencil-1 bg-size-[300%_100%] animate-shimmer",
      "bg-[linear-gradient(to_right,var(--colorNeutralStencil1)_0%,var(--colorNeutralStencil2)_50%,var(--colorNeutralStencil1)_100%)]",
      // Sóng chạy theo chiều đọc: RTL chạy ngược keyframe (phải → trái).
      "rtl:[animation-direction:reverse] motion-reduce:animate-none motion-reduce:bg-none",
    ),
    pulse: "bg-stencil-1 animate-pulse motion-reduce:animate-none",
  },
  // Không có token Stencil*Alpha → dùng chính stencil với độ mờ 50%.
  translucent: {
    wave: cn(
      "bg-stencil-1 bg-size-[300%_100%] opacity-50 animate-shimmer",
      "bg-[linear-gradient(to_right,var(--colorNeutralStencil1)_0%,var(--colorNeutralStencil2)_50%,var(--colorNeutralStencil1)_100%)]",
      "rtl:[animation-direction:reverse] motion-reduce:animate-none motion-reduce:bg-none",
    ),
    pulse: "bg-stencil-1 opacity-50 animate-pulse motion-reduce:animate-none",
  },
};

export interface SkeletonItemProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "rectangle" | "circle" | "square";
  /** Chiều cao (rectangle) hoặc kích thước cạnh (circle / square), đơn vị px. */
  size?: SkeletonItemSize;
  /** Ghi đè animation của Skeleton cha. */
  animation?: SkeletonAnimation;
  /** Ghi đè appearance của Skeleton cha. */
  appearance?: SkeletonAppearance;
}

export const SkeletonItem = React.forwardRef<HTMLDivElement, SkeletonItemProps>(
  ({ shape = "rectangle", size = 16, animation, appearance, className, ...props }, ref) => {
    const ctx = React.useContext(SkeletonContext);
    const anim = ANIMATION[appearance ?? ctx.appearance][animation ?? ctx.animation];
    const sizeClass = SIZE[size] ?? SIZE[16];

    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(
          "shrink-0",
          anim,
          shape === "rectangle" && cn("w-full rounded-medium", sizeClass.h),
          shape === "square" && cn("rounded-medium", sizeClass.box),
          shape === "circle" && cn("rounded-circular", sizeClass.box),
          className,
        )}
        {...props}
      />
    );
  },
);
SkeletonItem.displayName = "SkeletonItem";

/* ================================================================ Preset (Yugen Labs) */

export interface SkeletonPresetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ghi đè animation (mặc định "wave", hoặc theo Skeleton cha). */
  animation?: SkeletonAnimation;
  /** Ghi đè appearance (mặc định "opaque", hoặc theo Skeleton cha). */
  appearance?: SkeletonAppearance;
}

/**
 * Gốc của mọi preset: đứng một mình → là một Skeleton (role="progressbar", aria-busy);
 * lồng trong Skeleton / preset khác → chỉ là khối bố cục, không lặp thông báo cho trình đọc màn hình.
 */
const SkeletonPresetRoot = React.forwardRef<HTMLDivElement, SkeletonPresetProps>(
  ({ animation, appearance, className, ...props }, ref) => {
    const nested = React.useContext(SkeletonRootContext);
    const ctx = React.useContext(SkeletonContext);
    if (!nested) return <Skeleton ref={ref} animation={animation} appearance={appearance} className={className} {...props} />;
    return (
      <SkeletonContext.Provider
        value={{ animation: animation ?? ctx.animation, appearance: appearance ?? ctx.appearance }}
      >
        <div ref={ref} className={cn("flex flex-col gap-S", className)} {...props} />
      </SkeletonContext.Provider>
    );
  },
);
SkeletonPresetRoot.displayName = "SkeletonPresetRoot";

const count = (n: number, min = 0) => Math.max(min, Math.floor(n));

/** Độ rộng xoay vòng cho các dòng để khung xương trông như chữ thật, không phải các thanh bằng nhau. */
const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-2/5"] as const;

const TEXT_SIZE = {
  small: { item: 12, gap: "gap-S" },
  medium: { item: 16, gap: "gap-S" },
  large: { item: 20, gap: "gap-M" },
} as const satisfies Record<string, { item: SkeletonItemSize; gap: string }>;

export interface SkeletonTextProps extends SkeletonPresetProps {
  /** Số dòng. Dòng cuối ngắn hơn (60%) như đoạn văn thật. */
  lines?: number;
  /** small 12px · medium 16px · large 20px mỗi dòng. */
  size?: keyof typeof TEXT_SIZE;
}

/** Đoạn văn n dòng. */
export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, size = "medium", className, ...props }, ref) => {
    const s = TEXT_SIZE[size];
    const n = count(lines, 1);
    return (
      <SkeletonPresetRoot ref={ref} className={cn("w-full", s.gap, className)} {...props}>
        {Array.from({ length: n }, (_, i) => (
          <SkeletonItem key={i} size={s.item} className={n > 1 && i === n - 1 ? "w-3/5" : undefined} />
        ))}
      </SkeletonPresetRoot>
    );
  },
);
SkeletonText.displayName = "SkeletonText";

export interface SkeletonAvatarProps extends SkeletonPresetProps {
  /** Cạnh, đơn vị px — dùng đúng size của Avatar sẽ thay thế (24, 32, 40, 48…). */
  size?: SkeletonItemSize;
  shape?: "circular" | "square";
}

/** Chỗ cho Avatar / ảnh đại diện. */
export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 32, shape = "circular", className, ...props }, ref) => (
    <SkeletonPresetRoot ref={ref} className={cn("inline-flex", className)} {...props}>
      <SkeletonItem shape={shape === "square" ? "square" : "circle"} size={size} />
    </SkeletonPresetRoot>
  ),
);
SkeletonAvatar.displayName = "SkeletonAvatar";

export interface SkeletonCardProps extends SkeletonPresetProps {
  /** Dòng đầu: avatar + tên + mô tả (như CardHeader). */
  header?: boolean;
  /** Vùng ảnh 16:9. */
  media?: boolean;
  /** Số dòng mô tả dưới tiêu đề (0 = không có). */
  lines?: number;
  /** Số nút ở chân thẻ (0 = không có). */
  actions?: number;
}

/** Thẻ: (header) + ảnh + tiêu đề + mô tả + nút — cùng bề mặt, bo góc và khoảng cách với Card. */
export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ header = false, media = true, lines = 2, actions = 2, className, ...props }, ref) => (
    <SkeletonPresetRoot
      ref={ref}
      className={cn(
        "w-full gap-M overflow-hidden rounded-medium border border-transparent bg-background-1 p-M shadow-4",
        className,
      )}
      {...props}
    >
      {header && (
        <div className="flex items-center gap-M">
          <SkeletonItem shape="circle" size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-XS">
            <SkeletonItem size={12} className="w-1/2" />
            <SkeletonItem size={8} className="w-1/3" />
          </div>
        </div>
      )}
      {media && <SkeletonItem className="aspect-video h-auto" />}
      <div className="flex flex-col gap-S">
        <SkeletonItem size={20} className="w-3/5" />
        {count(lines) > 0 && <SkeletonText lines={lines} size="small" />}
      </div>
      {count(actions) > 0 && (
        <div className="flex items-center gap-S">
          {Array.from({ length: count(actions) }, (_, i) => (
            <SkeletonItem key={i} size={32} className="w-24" />
          ))}
        </div>
      )}
    </SkeletonPresetRoot>
  ),
);
SkeletonCard.displayName = "SkeletonCard";

export interface SkeletonListProps extends SkeletonPresetProps {
  /** Số dòng. */
  rows?: number;
  /** Cỡ avatar, khớp với Avatar thật của danh sách. */
  avatarSize?: SkeletonItemSize;
  avatarShape?: "circular" | "square";
}

/** Danh sách: mỗi dòng gồm avatar + tiêu đề + mô tả. */
export const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ rows = 3, avatarSize = 40, avatarShape = "circular", className, ...props }, ref) => (
    <SkeletonPresetRoot ref={ref} className={cn("w-full gap-L", className)} {...props}>
      {Array.from({ length: count(rows) }, (_, i) => (
        <div key={i} className="flex items-center gap-M">
          <SkeletonItem shape={avatarShape === "square" ? "square" : "circle"} size={avatarSize} />
          <div className="flex min-w-0 flex-1 flex-col gap-SNudge">
            <SkeletonItem size={16} className={WIDTHS[(i + 1) % WIDTHS.length]} />
            <SkeletonItem size={12} className={WIDTHS[(i + 3) % WIDTHS.length]} />
          </div>
        </div>
      ))}
    </SkeletonPresetRoot>
  ),
);
SkeletonList.displayName = "SkeletonList";

export interface SkeletonTableProps extends SkeletonPresetProps {
  /** Số dòng dữ liệu. */
  rows?: number;
  /** Số cột. */
  columns?: number;
  /** Có dòng tiêu đề. */
  header?: boolean;
}

/** Bảng rows × cols — cao 44px mỗi dòng và cùng viền với Table size medium. */
export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, header = true, className, ...props }, ref) => {
    const cols = count(columns, 1);
    // Số cột là dữ liệu runtime → không thể là class tĩnh.
    const grid: React.CSSProperties = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
    return (
      <SkeletonPresetRoot ref={ref} className={cn("w-full gap-0", className)} {...props}>
        {header && (
          <div style={grid} className="grid h-11 items-center gap-L border-b border-stroke-2 px-S">
            {Array.from({ length: cols }, (_, c) => (
              <SkeletonItem key={c} size={12} className="w-1/2" />
            ))}
          </div>
        )}
        {Array.from({ length: count(rows) }, (_, r) => (
          <div key={r} style={grid} className="grid h-11 items-center gap-L border-b border-stroke-3 px-S">
            {Array.from({ length: cols }, (_, c) => (
              <SkeletonItem key={c} size={12} className={WIDTHS[(r + c) % WIDTHS.length]} />
            ))}
          </div>
        ))}
      </SkeletonPresetRoot>
    );
  },
);
SkeletonTable.displayName = "SkeletonTable";
