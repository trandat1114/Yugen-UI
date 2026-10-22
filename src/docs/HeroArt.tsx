import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { GEN, KANA_GE, KANA_N, KANA_U, KANA_YU, SAKURA, YU } from "./kanji";
import { PETAL, SakuraBlossom } from "./YugenMark";
import "./hero.css";

const KANA = [KANA_YU, KANA_U, KANA_GE, KANA_N];

/**
 * 幽玄 viết dọc kèm furigana ゆうげん và ấn 桜. Chữ hiện dần từ trên xuống (mặt nạ gradient trượt), ấn đóng xuống sau cùng.
 * Trang trí thuần tuý: aria-hidden, tắt chuyển động khi prefers-reduced-motion.
 */
export function YugenKanji({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-270 -20 1570 2020" className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.9" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}ink`} maskUnits="userSpaceOnUse" x="-300" y="-4700" width="1700" height="7400">
          <rect className="yg-ink" x="-300" y="-4600" width="1700" height="4600" fill={`url(#${id}fade)`} />
        </mask>
      </defs>
      {/* Hoa neo ở góc trên của 幽 (vẽ trước để nằm sau chữ), tránh cột furigana bên trái. */}
      <g className="yg-bloom">
        <SakuraBlossom transform="translate(980 40) scale(68) rotate(-10)" stamenWidth={0.14} />
      </g>
      <g className="yg-kana fill-foreground-2">
        {KANA.map((d, i) => (
          <path key={i} d={d} transform={`translate(-250 ${30 + i * 190}) scale(0.17)`} />
        ))}
      </g>
      <g mask={`url(#${id}ink)`} className="fill-foreground-1">
        <path d={YU} />
        <path d={GEN} transform="translate(0 980)" />
      </g>
      <g data-brand="sakura" className="yg-stamp">
        <rect x="1040" y="1640" width="250" height="250" rx="14" fill="none" strokeWidth="16" className="stroke-brand-foreground-1" />
        <path d={SAKURA} transform="translate(1068 1668) scale(0.194)" className="fill-brand-foreground-1" />
      </g>
    </svg>
  );
}

// Vị trí xuất phát (% bề ngang vùng hoa), thời gian rơi, độ trễ, độ lệch ngang, cỡ; y = chỗ đứng yên khi giảm chuyển động.
const PETALS = [
  { x: 62, d: 13, delay: 0, dx: -140, size: 14, y: 220 },
  { x: 78, d: 16, delay: 3.5, dx: -90, size: 11, y: 120 },
  { x: 88, d: 12, delay: 7, dx: -180, size: 16, y: 330 },
  { x: 70, d: 18, delay: 9.5, dx: -60, size: 10, y: 60 },
  { x: 95, d: 15, delay: 5, dx: -120, size: 12, y: 260 },
];

/** Vài cánh anh đào rơi chậm qua hero. */
export function FallingPetals({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="yg-petal"
          style={{ insetInlineStart: `${p.x}%`, "--d": `${p.d}s`, "--delay": `${p.delay}s`, "--dx": `${p.dx}px`, "--y": `${p.y}px` } as CSSProperties}
        >
          <svg viewBox="-5 -10.5 10 11" width={p.size} height={p.size} className="yg-sway">
            <path d={PETAL} fill="#f49ac1" />
          </svg>
        </span>
      ))}
    </div>
  );
}
