import { useId } from "react";

// Vòng enso 310° + bông anh đào 5 cánh trong khoảng hở — 幽玄 (yūgen) × 桜 (sakura).
const ENSO = "M32 10.14 A16 16 0 1 1 18.53 8.96";
// Cánh hoa hướng lên từ tâm (0,0), đầu cánh có khía chữ V đặc trưng của hoa anh đào.
const PETAL = "M0 0 C-2.7 -1.4 -3.4 -5 -1.3 -6.6 L0 -5.6 L1.3 -6.6 C3.4 -5 2.7 -1.4 0 0Z";
const ANGLES = [0, 72, 144, 216, 288];
const CENTER = "translate(25.4 8.4)";

/** Logo Yugen UI. variant="mono" dùng màu chữ hiện tại. */
export function YugenMark({ size = 28, className, variant = "color" }: { size?: number; className?: string; variant?: "color" | "mono" }) {
  const id = useId().replace(/:/g, "");

  if (variant === "mono") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
        <path d={ENSO} fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        <g transform={CENTER}>
          {ANGLES.map((a) => (
            <path key={a} d={PETAL} transform={`rotate(${a})`} fill="currentColor" />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}ring`} x1="8" y1="42" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855c9" />
          <stop offset="0.45" stopColor="#c2347a" />
          <stop offset="1" stopColor="#f472a8" />
        </linearGradient>
        <radialGradient id={`${id}petal`} cx="0" cy="0" r="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e24a92" />
          <stop offset="0.45" stopColor="#fd8ebc" />
          <stop offset="1" stopColor="#ffd6e4" />
        </radialGradient>
      </defs>
      <path d={ENSO} fill="none" stroke={`url(#${id}ring)`} strokeWidth="5.5" strokeLinecap="round" />
      <path d={ENSO} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" transform="translate(-0.6 -0.6)" />
      <g transform={CENTER}>
        {ANGLES.map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a})`} fill={`url(#${id}petal)`} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.4" />
        ))}
        <circle r="1.1" fill="#fff4f8" />
      </g>
    </svg>
  );
}
