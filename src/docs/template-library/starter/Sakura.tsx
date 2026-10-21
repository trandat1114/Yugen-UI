import type { CSSProperties } from "react";

/**
 * Trang trí hoa anh đào: cánh hoa rơi và bông hoa SVG. Thuần CSS (không thư viện), ẩn với trình đọc màn hình
 * và tắt hẳn khi người dùng bật "giảm chuyển động".
 */

/** Chữ Nhật dùng font Mincho (index.html chỉ tải đúng các ký tự có trong mã nguồn); thiếu font thì dùng font hệ thống. */
export const JP = "font-['Shippori_Mincho','Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif]";

const PETAL = "M10 1.5C11 3 12.2 2.4 13 1.6C17.5 5 18 11 10 19C2 11 2.5 5 7 1.6C7.8 2.4 9 3 10 1.5Z";

// Vị trí "ngẫu nhiên" nhưng cố định — server và client vẽ giống nhau, không nhảy khi hydrate.
const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  size: 10 + ((i * 5) % 13),
  duration: 11 + ((i * 3) % 9),
  delay: -((i * 1.9) % 14),
  drift: (i % 2 ? 1 : -1) * (24 + ((i * 11) % 48)),
  tone: i % 3 === 0 ? "#f48fb8" : "#fbc4d9",
}));

const KEYFRAMES = `
@keyframes yg-petal-fall {
  0%   { top: -6%;  transform: translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: .95; }
  100% { top: 104%; transform: translateX(var(--yg-drift)) rotate(var(--yg-spin)); opacity: 0; }
}
.yg-petal { position: absolute; animation: yg-petal-fall var(--yg-duration) linear var(--yg-delay) infinite; }
@media (prefers-reduced-motion: reduce) { .yg-petal { display: none; } }
`;

export function SakuraPetals({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <style>{KEYFRAMES}</style>
      {PETALS.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="yg-petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              "--yg-duration": `${p.duration}s`,
              "--yg-delay": `${p.delay}s`,
              "--yg-drift": `${p.drift}px`,
              "--yg-spin": `${i % 2 ? 540 : -480}deg`,
            } as CSSProperties
          }
        >
          <path d={PETAL} fill={p.tone} />
        </svg>
      ))}
    </div>
  );
}

/** Bông hoa năm cánh — mỗi cánh có vết khía ở đầu như hoa anh đào thật. */
export function SakuraBloom({ className = "" }: { className?: string }) {
  const petal = "M50 50C38 40 33 22 42 9C45 13 48 13 50 8C52 13 55 13 58 9C67 22 62 40 50 50Z";
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id="yg-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e2508e" />
          <stop offset="0.35" stopColor="#f6a6c7" />
          <stop offset="1" stopColor="#fde4ee" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((deg) => (
        <path key={deg} d={petal} fill="url(#yg-bloom)" transform={`rotate(${deg} 50 50)`} />
      ))}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="37" stroke="#c2347a" strokeWidth="0.8" />
          <circle cx="50" cy="36" r="1.4" fill="#f7d35c" />
        </g>
      ))}
      <circle cx="50" cy="50" r="3.2" fill="#c2347a" />
    </svg>
  );
}
