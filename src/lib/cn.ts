import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Dạy tailwind-merge các scale tuỳ biến; thiếu bước này, `text-body1` bị coi là màu chữ
// và bị xoá khi đi cùng `text-foreground-1`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Alias spacing viết hoa (deprecated từ 0.10, bỏ ở 1.0 — #42); thang số đã có sẵn trong tailwind-merge.
      spacing: ["XXS", "XS", "SNudge", "S", "MNudge", "M", "L", "XL", "XXL", "XXXL"],
      borderRadius: ["small", "medium", "large", "xlarge", "2xlarge", "3xlarge", "4xlarge", "circular"],
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
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
