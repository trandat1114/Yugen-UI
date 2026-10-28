import * as React from "react";
import { Checkmark16Regular, Copy16Regular } from "@fluentui/react-icons";
import { copyText } from "../_internal/copyText";
import { Button } from "../Button/Button";
import { useYugenMessages } from "../YugenProvider/context";
import { descriptionListMessages } from "./messages";
import { cn } from "@/lib/cn";

export {
  descriptionListMessages,
  descriptionListMessagesEn,
  type DescriptionListMessages,
} from "./messages";

type Layout = "stacked" | "inline";

const ListContext = React.createContext<{ layout: Layout; divided: boolean; valueAlign: "start" | "end" }>({
  layout: "stacked",
  divided: false,
  valueAlign: "start",
});

/** Độ rộng tối thiểu của một cột trước khi lưới bớt cột (stacked / inline). */
const MIN_COLUMN = { stacked: "12rem", inline: "18rem" } as const;

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Số cột tối đa; khung hẹp tự bớt cột, không cần breakpoint. */
  columns?: 1 | 2 | 3 | 4;
  /** stacked: nhãn trên giá trị · inline: nhãn và giá trị cùng hàng. */
  layout?: Layout;
  /** Đường kẻ trên mỗi mục. */
  divided?: boolean;
  /** "end": đẩy giá trị về cuối hàng (layout inline) — tổng tiền, bảng tóm tắt. */
  valueAlign?: "start" | "end";
}

/** DescriptionList — các cặp nhãn / giá trị: chi tiết đơn hàng, hồ sơ, tóm tắt cài đặt. */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { columns = 1, layout = "stacked", divided = false, valueAlign = "start", className, style, ...props },
  ref,
) {
  const context = React.useMemo(() => ({ layout, divided, valueAlign }), [layout, divided, valueAlign]);
  // Lưới tự co: tối đa `columns` cột, mỗi cột không hẹp hơn MIN_COLUMN (gap-x-6 = 1.5rem).
  const template =
    columns > 1
      ? `repeat(auto-fill, minmax(max(${MIN_COLUMN[layout]}, calc((100% - ${columns - 1} * 1.5rem) / ${columns})), 1fr))`
      : undefined;
  return (
    <ListContext.Provider value={context}>
      <dl
        ref={ref}
        className={cn("grid min-w-0 gap-x-6", divided ? "gap-y-3" : layout === "inline" ? "gap-y-2" : "gap-y-4", className)}
        style={template ? { gridTemplateColumns: template, ...style } : style}
        {...props}
      />
    </ListContext.Provider>
  );
});

export interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  label: React.ReactNode;
  /** Giá trị. */
  children?: React.ReactNode;
  /** Nút sao chép giá trị: true = chép chữ đang hiển thị, chuỗi = chép đúng chuỗi đó. */
  copyable?: boolean | string;
  /** Chiếm cả hàng khi có nhiều cột (địa chỉ, ghi chú dài). */
  fullWidth?: boolean;
}

export const DescriptionItem = React.forwardRef<HTMLDivElement, DescriptionItemProps>(function DescriptionItem(
  { label, children, copyable, fullWidth, className, ...props },
  ref,
) {
  const { layout, divided, valueAlign } = React.useContext(ListContext);
  const labelId = React.useId();
  const valueRef = React.useRef<HTMLSpanElement>(null);
  const inline = layout === "inline";
  const end = inline && valueAlign === "end";

  return (
    <div
      ref={ref}
      className={cn(
        "min-w-0",
        inline ? "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-x-4" : "flex flex-col gap-0.5",
        end && "grid-cols-[minmax(0,1fr)_auto]",
        divided && "border-t border-stroke-2 pt-3",
        fullWidth && "col-span-full",
        className,
      )}
      {...props}
    >
      <dt id={labelId} className={cn("min-w-0", inline ? "text-body1 text-foreground-3" : "text-caption1 text-foreground-3")}>
        {label}
      </dt>
      <dd className={cn("flex min-w-0 items-center gap-1 text-body1 text-foreground-1", end && "justify-end text-end")}>
        <span ref={valueRef} className="min-w-0 wrap-break-word">
          {children}
        </span>
        {copyable && (
          <CopyButton labelId={labelId} getText={() => (typeof copyable === "string" ? copyable : (valueRef.current?.textContent ?? ""))} />
        )}
      </dd>
    </div>
  );
});

function CopyButton({ labelId, getText }: { labelId: string; getText: () => string }) {
  const msg = useYugenMessages("descriptionList", descriptionListMessages);
  const id = React.useId();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <Button
        id={id}
        size="small"
        appearance="subtle"
        aria-label={msg.copy}
        aria-labelledby={`${id} ${labelId}`}
        icon={copied ? <Checkmark16Regular className="text-success-foreground-1" /> : <Copy16Regular />}
        onClick={async () => {
          await copyText(getText());
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1600);
        }}
        className="-my-1 shrink-0 text-foreground-3"
      />
      <span role="status" className="sr-only">
        {copied ? msg.copied : ""}
      </span>
    </>
  );
}
