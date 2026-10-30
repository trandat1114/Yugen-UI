import { useId, useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { PETAL, PETALS, STAMENS } from "./YugenMark";
import "./contributors.css";

// Cành anh đào vẽ mực cho trang Người đóng góp (#248): mỗi bông hoa là một người, xếp từ gốc cành theo lần đóng góp đầu
// tiên; chỗ còn lại là nụ. Hình học tính sẵn từ các đường cong Bézier (không đo DOM) nên prerender ở Node ra đúng hình.

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

const W = 1200;
const H = 260;

function at([a, b, c, d]: Cubic, t: number): Pt {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]];
}

/** Pháp tuyến đơn vị (bên trái theo chiều đi của nét). */
function normal([a, b, c, d]: Cubic, t: number): Pt {
  const u = 1 - t;
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
}

interface Limb {
  curve: Cubic;
  /** Bề rộng nét ở gốc và ở ngọn. */
  w0: number;
  w1: number;
  /** Đoạn (theo tỉ lệ độ dài) được nở hoa: gốc cành chính quá dày, không đặt hoa. */
  from: number;
}

const MAIN: Cubic = [
  [-40, 214],
  [250, 236],
  [560, 96],
  [1190, 112],
];
const mainWidth = (t: number) => 2.5 + 34 * (1 - t) ** 1.35;

/** Cành con mọc từ cành chính tại `t`: đi dốc lúc đầu rồi ngả dần về ngọn. */
function twig(t: number, end: Pt): Limb {
  const s = at(MAIN, t);
  const dx = end[0] - s[0];
  const dy = end[1] - s[1];
  return {
    curve: [s, [s[0] + 0.15 * dx, s[1] + 0.55 * dy], [s[0] + 0.6 * dx, s[1] + 0.95 * dy], end],
    w0: Math.max(4, mainWidth(t) * 0.5),
    w1: 1.4,
    from: 0.3,
  };
}

const LIMBS: Limb[] = [
  { curve: MAIN, w0: mainWidth(0), w1: mainWidth(1), from: 0.2 },
  twig(0.2, [300, 92]),
  twig(0.36, [520, 228]),
  twig(0.5, [640, 40]),
  twig(0.64, [830, 204]),
  twig(0.78, [1000, 36]),
  twig(0.9, [1170, 170]),
];

const SAMPLES = 64;

/** Điểm mẫu của một cành: vị trí, pháp tuyến, bề rộng, độ dài cộng dồn. */
function sample(limb: Limb) {
  const points: { p: Pt; n: Pt; w: number; s: number }[] = [];
  let s = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const p = at(limb.curve, t);
    if (i > 0) s += Math.hypot(p[0] - points[i - 1].p[0], p[1] - points[i - 1].p[1]);
    points.push({ p, n: normal(limb.curve, t), w: limb.w0 + (limb.w1 - limb.w0) * t ** 0.9, s });
  }
  return points;
}

const SAMPLED = LIMBS.map(sample);

const f = (n: number) => n.toFixed(1);

/** Nét cọ thuôn: hai mép lệch theo pháp tuyến, bề rộng dao động nhẹ như nét mực thật. */
function brush(points: ReturnType<typeof sample>, seed: number, scale = 1) {
  const left: string[] = [];
  const right: string[] = [];
  points.forEach(({ p, n, w }, i) => {
    const half = (w * scale * (1 + 0.07 * Math.sin((i / SAMPLES) * 19 + seed))) / 2;
    left.push(`${f(p[0] + n[0] * half)} ${f(p[1] + n[1] * half)}`);
    right.push(`${f(p[0] - n[0] * half)} ${f(p[1] - n[1] * half)}`);
  });
  return `M${left.join("L")}L${right.reverse().join("L")}Z`;
}

const INK = SAMPLED.map((points, i) => brush(points, i * 2.3));
const WASH = brush(SAMPLED[0], 0, 2.4);

/** Vệt bút khô (kasure): vài sợi mảnh dọc nửa gốc cành chính, khoét vào mực qua mask. */
const KASURE = [-0.22, 0.05, 0.26].map((k, i) => {
  const points = SAMPLED[0].slice(4 + i * 3, 30 + i * 5);
  return points.map(({ p, n, w }, j) => `${j ? "L" : "M"}${f(p[0] + n[0] * w * k)} ${f(p[1] + n[1] * w * k)}`).join("");
});

/** Nụ: giọt khép kín, gốc ở (0,0), hướng lên; đài mực ở gốc. */
const BUD = "M0 0C2.8 -2 3.6 -6.2 0 -10.5C-3.6 -6.2 -2.8 -2 0 0Z";
const SEPAL = "M-2.6 -1.2Q0 1.6 2.6 -1.2Q1.2 -3.6 0 -2.2Q-1.2 -3.6 -2.6 -1.2Z";

interface Spot {
  x: number;
  y: number;
  /** Góc (độ) của hướng ra ngoài cành, 0 = hướng lên. */
  angle: number;
  /** Nửa bề rộng cành tại đó. */
  half: number;
}

/** `count` chỗ đặt hoa / nụ rải đều theo độ dài mọi cành, xếp từ gốc (trái) ra ngọn. */
function spotsFor(count: number): Spot[] {
  const total = SAMPLED.reduce((sum, points, i) => sum + points[SAMPLES].s * (1 - LIMBS[i].from), 0);
  const step = total / count;
  const spots: Spot[] = [];
  SAMPLED.forEach((points, i) => {
    const length = points[SAMPLES].s;
    for (let s = length * LIMBS[i].from + step / 2; s < length; s += step) {
      const k = points.findIndex((pt) => pt.s >= s);
      const { p, n, w } = points[Math.max(0, k)];
      // Xen kẽ hai bên cành.
      const side = spots.length % 2 ? 1 : -1;
      const out: Pt = [n[0] * side, n[1] * side];
      spots.push({ x: p[0] + out[0] * (w / 2), y: p[1] + out[1] * (w / 2), angle: (Math.atan2(out[1], out[0]) * 180) / Math.PI + 90, half: w / 2 });
    }
  });
  return spots.sort((a, b) => a.x - b.x).slice(0, count);
}

export interface BranchPerson {
  login: string;
  maintainer?: boolean;
}

/**
 * Cành hoa: người thứ i nở ở chỗ thứ i tính từ gốc, phần còn lại là nụ. `active` làm bông của người đó nở to, các bông
 * khác nhạt đi (thẻ người đóng góp đang được trỏ / focus). `elapsed`: giây animation đã chạy trên HTML prerender.
 */
export function SakuraBranch({ people, active, elapsed = 0, className }: { people: BranchPerson[]; active?: string | null; elapsed?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const count = Math.max(26, people.length + 6);
  const spots = useMemo(() => spotsFor(count), [count]);
  const size = Math.min(2.2, Math.max(1, 2.2 * Math.sqrt(26 / count)));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMinYMid slice"
      aria-hidden
      focusable="false"
      data-dim={active ? "" : undefined}
      className={cn("cb-art text-foreground-1 rtl:-scale-x-100", className)}
      style={{ "--cb-elapsed": `${elapsed}s` } as CSSProperties}
    >
      <defs>
        <radialGradient id={`${id}p`} cx="0" cy="0" r="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c02a6f" />
          <stop offset="0.3" stopColor="#ef77a9" />
          <stop offset="0.7" stopColor="#f8bcd4" />
          <stop offset="1" stopColor="#fde8f0" />
        </radialGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="-10.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8bcd4" />
          <stop offset="1" stopColor="#e0558f" />
        </linearGradient>
        {/* Mực chảy từ gốc ra ngọn: dải trắng (hiện) có mép mềm trượt qua cành. */}
        <linearGradient id={`${id}r`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="0.56" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-100" y="-40" width={W + 200} height={H + 80}>
          <rect className="cb-reveal" x={-W - 200} y="-40" width={2 * W + 400} height={H + 80} fill={`url(#${id}r)`} />
          {KASURE.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#000" strokeWidth={1.4 - i * 0.3} strokeLinecap="round" opacity="0.7" />
          ))}
        </mask>
        {/* Mực đậm ở gốc, nhạt dần ra ngọn. */}
        <linearGradient id={`${id}i`} x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.62" />
        </linearGradient>
      </defs>

      <g mask={`url(#${id}m)`}>
        <path d={WASH} fill="currentColor" opacity="0.06" />
        {INK.map((d, i) => (
          <path key={i} d={d} fill={`url(#${id}i)`} />
        ))}
        {spots.slice(people.length).map((spot, i) => (
          <g key={i} transform={`translate(${f(spot.x)} ${f(spot.y)}) rotate(${f(spot.angle)}) scale(${f(size * 0.85)})`}>
            <path d={BUD} fill={`url(#${id}b)`} stroke="#d9588f" strokeOpacity="0.5" strokeWidth="0.4" />
            <path d={SEPAL} fill="currentColor" opacity="0.88" />
          </g>
        ))}
      </g>

      {people.map((person, i) => {
        const spot = spots[i];
        const scale = size * (person.maintainer ? 1.25 : 1);
        // Tâm hoa lệch khỏi cành một chút, cánh vẫn chạm cành.
        const lift = spot.half + 5 * scale;
        const rad = ((spot.angle - 90) * Math.PI) / 180;
        return (
          <g key={person.login} transform={`translate(${f(spot.x + Math.cos(rad) * lift)} ${f(spot.y + Math.sin(rad) * lift)})`}>
            <g className="cb-bloom" style={{ "--cb-delay": `${0.9 + Math.min(i, 24) * 0.12}s` } as CSSProperties}>
              <g className="cb-flower" data-active={active === person.login ? "" : undefined}>
                <g transform={`rotate(${(i * 47) % 72}) scale(${f(scale)})`}>
                  {PETALS.map(([a, s]) => (
                    <path
                      key={a}
                      d={PETAL}
                      transform={`rotate(${a - 8}) scale(${s})`}
                      fill={`url(#${id}p)`}
                      stroke="#d9588f"
                      strokeOpacity="0.45"
                      strokeWidth="0.35"
                    />
                  ))}
                  {STAMENS.map(([x, y], k) => (
                    <g key={k}>
                      <line x1="0" y1="0" x2={x} y2={y} stroke="#b8236a" strokeWidth="0.32" strokeLinecap="round" />
                      <circle cx={x} cy={y} r="0.55" fill="#f3b33d" />
                    </g>
                  ))}
                  <circle r="1.1" fill="#b8236a" />
                </g>
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
