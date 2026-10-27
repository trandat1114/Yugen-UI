import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Dạy tailwind-merge các scale tuỳ biến; thiếu bước này, `text-body1` bị coi là màu chữ
// và bị xoá khi đi cùng `text-foreground-1`. Khoá theme (spacing, radius) theo namespace biến của Tailwind v4 (tailwind-merge 3).
const twMerge = extendTailwindMerge<"glass">({
  extend: {
    theme: {
      // Alias spacing viết hoa (deprecated từ 0.10, bỏ ở 1.0 — #42); thang số đã có sẵn trong tailwind-merge.
      spacing: ["XXS", "XS", "SNudge", "S", "MNudge", "M", "L", "XL", "XXL", "XXXL"],
      radius: ["small", "medium", "large", "xlarge", "2xlarge", "3xlarge", "4xlarge", "circular", "concentric"],
    },
    classGroups: {
      "font-size": [
        {
          text: [
            "caption2",
            "caption1",
            "body1",
            "body2",
            "subtitle2",
            "subtitle1",
            "title3",
            "title2",
            "title1",
            "large-title",
            "display",
          ],
        },
      ],
      shadow: [{ shadow: ["2", "4", "8", "16", "28", "64"] }],
      "bg-image": [{ bg: ["gradient-sakura", "gradient-dusk", "gradient-sunset", "gradient-aurora", "gradient-brand", "hero-glow"] }],
      duration: [{ duration: ["ultra-fast", "faster", "fast", "normal", "gentle", "slow"] }],
      // Vật liệu glass (Yugen Labs) đặt cả màu nền: thay cho bg-* đứng trước và ngược lại.
      glass: ["glass", "glass-clear", "glass-tinted"],
    },
    conflictingClassGroups: {
      glass: ["bg-color"],
      "bg-color": ["glass"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
