import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** medium: body1 (14px) cho docs, ghi chú · large: body2 (16px) cho bài viết dài. */
  size?: "medium" | "large";
  /** Render vào phần tử con duy nhất (vd. `<article>`) thay cho `<div>`. */
  asChild?: boolean;
}

/**
 * Prose — kiểu chữ cho nội dung Markdown / HTML từ CMS (tiêu đề, danh sách, bảng, code, trích dẫn, ảnh) theo thang chữ
 * Yugen, qua utility `yugen-prose` (theme): selector độ ưu tiên 0, thoát bằng class `not-prose`. Không tự làm sạch HTML:
 * nội dung chưa tin cậy phải được sanitize trước khi đưa vào.
 */
export function Prose({
  size = "medium",
  asChild = false,
  className,
  ref,
  ...props
}: ProseProps & { ref?: React.Ref<HTMLDivElement> }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn(
        "yugen-prose flex min-w-0 flex-col text-foreground-2",
        // Cỡ chữ, line-height, khoảng cách khối đến từ biến --prose-* của yugen-prose; size chỉ đặt giá trị mặc định.
        "[--prose-flow-default:--spacing(4)]",
        size === "large"
          ? "[--prose-leading-default:var(--text-body2--line-height)] [--prose-size-default:var(--text-body2)]"
          : "[--prose-leading-default:var(--text-body1--line-height)] [--prose-size-default:var(--text-body1)]",
        className,
      )}
      {...props}
    />
  );
}
