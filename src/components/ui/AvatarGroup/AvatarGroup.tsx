import * as React from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { Avatar, type AvatarProps } from "../Avatar/Avatar";
import { Popover, PopoverSurface, PopoverTrigger } from "../Popover/Popover";
import { useYugenMessages } from "../YugenProvider/context";
import { avatarGroupMessages } from "./messages";

export { avatarGroupMessages, avatarGroupMessagesEn, type AvatarGroupMessages } from "./messages";

/** Fluent 2 AvatarGroup — https://fluent2.microsoft.design/components/web/react/core/avatargroup/usage */
export type AvatarGroupSize = 20 | 24 | 32 | 40 | 48 | 64 | 96;
export type AvatarGroupLayout = "spread" | "stack" | "pie";

const BOX: Record<AvatarGroupSize, string> = {
  20: "size-5 text-caption2",
  24: "size-6 text-caption2",
  32: "size-8 text-caption1",
  40: "size-10 text-body1",
  48: "size-12 text-subtitle2",
  64: "size-16 text-subtitle1",
  96: "size-24 text-title2",
};

const SPREAD_GAP: Record<AvatarGroupSize, string> = {
  20: "gap-0.5",
  24: "gap-0.5",
  32: "gap-1",
  40: "gap-1",
  48: "gap-2",
  64: "gap-2",
  96: "gap-3",
};

const STACK_OVERLAP: Record<AvatarGroupSize, string> = {
  20: "[&>*+*]:-ms-0.5",
  24: "[&>*+*]:-ms-1",
  32: "[&>*+*]:-ms-1",
  40: "[&>*+*]:-ms-1.5",
  48: "[&>*+*]:-ms-2",
  64: "[&>*+*]:-ms-3",
  96: "[&>*+*]:-ms-4",
};

interface AvatarGroupContextValue {
  layout: AvatarGroupLayout;
  size: AvatarGroupSize;
  inPopover: boolean;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({ layout: "spread", size: 32, inPopover: false });

/* ------------------------------------------------------------------ AvatarGroupItem */
export interface AvatarGroupItemProps {
  name: string;
  src?: string;
  color?: AvatarProps["color"];
  className?: string;
}

export function AvatarGroupItem({ name, src, color = "colorful", className }: AvatarGroupItemProps) {
  const { layout, size, inPopover } = React.useContext(AvatarGroupContext);

  if (inPopover) {
    return (
      <li className={cn("flex items-center gap-2 rounded-medium px-2 py-1 text-body1 text-foreground-1", className)}>
        <Avatar name={name} src={src} color={color} size={24} />
        <span className="min-w-0 truncate">{name}</span>
      </li>
    );
  }

  return (
    <Avatar
      name={name}
      src={src}
      color={color}
      size={size}
      className={cn(layout === "stack" && "ring-2 ring-background-1", className)}
    />
  );
}

/* ------------------------------------------------------------------ AvatarGroup */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** spread: tách rời · stack: chồng lên nhau · pie: 2–3 avatar chia trong một vòng tròn. */
  layout?: AvatarGroupLayout;
  size?: AvatarGroupSize;
  /** Số ô hiển thị tối đa (tính cả nút "+N"). Không áp dụng cho pie. */
  maxAvatars?: number;
  /** Nút tràn hiện số đếm hay icon "…". */
  overflowIndicator?: "count" | "icon";
  /** aria-label cho nút mở danh sách đầy đủ. Mặc định lấy từ `messages.avatarGroup.viewAll` / `viewMore`. */
  overflowLabel?: string;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    { layout = "spread", size = 32, maxAvatars = 5, overflowIndicator = "count", overflowLabel, className, children, ...props },
    ref,
  ) => {
    const msg = useYugenMessages("avatarGroup", avatarGroupMessages);
    const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<AvatarGroupItemProps>[];
    const isPie = layout === "pie";
    const max = Math.max(1, maxAvatars);
    const overflowing = !isPie && items.length > max;
    const inline = isPie ? items.slice(0, 3) : overflowing ? items.slice(0, Math.max(1, max - 1)) : items;
    const overflow = isPie ? items : items.slice(inline.length);

    const popoverList = (
      <PopoverSurface size="small" align="start" className="w-56">
        <AvatarGroupContext.Provider value={{ layout, size, inPopover: true }}>
          <ul aria-label={msg.list} className="flex max-h-56 flex-col overflow-y-auto">
            {overflow}
          </ul>
        </AvatarGroupContext.Provider>
      </PopoverSurface>
    );

    if (isPie) {
      return (
        <div ref={ref} role="group" className={cn("inline-flex", className)} {...props}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "relative grid shrink-0 gap-px overflow-hidden rounded-circular bg-background-1",
                  BOX[size],
                  inline.length >= 2 && "grid-cols-2",
                  inline.length === 3 && "grid-rows-2",
                )}
              >
                {/* Tên lấy từ nội dung ẩn thay cho aria-label: chữ viết tắt trong ô ghép (aria-hidden) là hình, không phải
                    nhãn — tránh lệch "nhãn nhìn thấy ⊄ tên truy cập" (WCAG 2.5.3). sr-only nằm absolute, không chiếm ô grid. */}
                <span className="sr-only">{overflowLabel ?? msg.viewAll(items.length)}</span>
                {inline.map((item, index) => (
                  // Ô ghép chỉ để nhìn — tên nút đã có aria-label, chữ viết tắt không được lọt vào tên truy cập.
                  <span
                    key={item.key ?? index}
                    aria-hidden
                    className={cn("relative overflow-hidden", inline.length === 3 && index === 0 && "row-span-2")}
                  >
                    <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2">
                      <Avatar
                        name={item.props.name}
                        src={item.props.src}
                        color={item.props.color ?? "colorful"}
                        size={size}
                        className="rounded-none"
                      />
                    </span>
                  </span>
                ))}
              </button>
            </PopoverTrigger>
            {popoverList}
          </Popover>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "inline-flex items-center",
          layout === "spread" ? SPREAD_GAP[size] : STACK_OVERLAP[size],
          className,
        )}
        {...props}
      >
        <AvatarGroupContext.Provider value={{ layout, size, inPopover: false }}>{inline}</AvatarGroupContext.Provider>
        {overflow.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                // Số đếm hiển thị phải nằm trong tên accessibility (WCAG 2.5.3): "+2 Xem thêm 2 thành viên".
                aria-label={overflowIndicator === "icon" ? (overflowLabel ?? msg.viewMore(overflow.length)) : undefined}
                className={cn(
                  "relative inline-flex shrink-0 items-center justify-center rounded-circular border border-stroke-1 bg-background-1 font-normal text-foreground-1",
                  "transition-colors duration-faster ease-easy-ease hover:bg-background-1-hover active:bg-background-1-pressed",
                  "data-[state=open]:bg-background-1-pressed",
                  BOX[size],
                  layout === "stack" && "ring-2 ring-background-1",
                )}
              >
                {overflowIndicator === "icon" ? (
                  <MoreHorizontal20Regular className="size-1/2" />
                ) : (
                  <>
                    +{overflow.length}
                    <span className="sr-only"> {overflowLabel ?? msg.viewMore(overflow.length)}</span>
                  </>
                )}
              </button>
            </PopoverTrigger>
            {popoverList}
          </Popover>
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";
