import * as React from "react";
import { cn } from "@/lib/cn";
import { COLORS, type ArtKind, type ColorId, type Product } from "./products";

/**
 * Flat drawings of the goods, so the template ships without photos. Each one fills a 200 × 200 box; the body takes the
 * product colour, shading is white or black at low opacity, so it reads on every theme. Swap this component for
 * <img> tags when you have product photos.
 */

/** Paper, labels and unglazed clay: material colours, like the product colours. */
const PAPER = "#f8f2e4";
const CLAY = "#d8c3a0";

const shade = (opacity: number) => ({ fill: "black", fillOpacity: opacity });
const light = (opacity: number) => ({ fill: "white", fillOpacity: opacity });

function Ground({ cx = 100, cy, rx }: { cx?: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={6} fill="currentColor" fillOpacity={0.1} />;
}

function Shape({ kind, color }: { kind: ArtKind; color: string }) {
  const c = color;
  switch (kind) {
    case "tin":
      return (
        <g>
          <Ground cy={168} rx={52} />
          <rect x={58} y={62} width={84} height={104} rx={6} fill={c} />
          <rect x={54} y={46} width={92} height={24} rx={5} fill={c} />
          <rect x={54} y={46} width={92} height={24} rx={5} {...shade(0.18)} />
          <rect x={58} y={70} width={84} height={4} {...shade(0.12)} />
          <rect x={70} y={90} width={60} height={56} rx={3} fill={PAPER} />
          <circle cx={100} cy={112} r={11} fill={c} />
          <rect x={84} y={130} width={32} height={4} rx={2} fill={c} fillOpacity={0.6} />
          <rect x={64} y={78} width={6} height={82} rx={3} {...light(0.3)} />
        </g>
      );
    case "pouch":
      return (
        <g>
          <Ground cy={172} rx={54} />
          <path d="M62 52h76l8 112a6 6 0 0 1-6 6H60a6 6 0 0 1-6-6z" fill={c} />
          <rect x={62} y={44} width={76} height={14} rx={2} fill={c} />
          <rect x={62} y={44} width={76} height={14} rx={2} {...shade(0.2)} />
          <rect x={74} y={88} width={52} height={50} rx={3} fill={PAPER} />
          <path d="M88 108c6-10 18-10 24 0c-6 10-18 10-24 0z" fill={c} />
          <rect x={86} y={124} width={28} height={4} rx={2} fill={c} fillOpacity={0.6} />
          <path d="M66 66l-5 92" stroke="white" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    case "teapot":
      return (
        <g>
          <Ground cx={98} cy={164} rx={54} />
          <path d="M50 114l-32-14a5 5 0 0 0-4 9l34 18z" fill={c} />
          <path d="M50 114l-32-14a5 5 0 0 0-4 9l34 18z" {...shade(0.2)} />
          <path d="M138 114l34-22a4 4 0 0 1 6 5l-28 32z" fill={c} />
          <ellipse cx={96} cy={122} rx={50} ry={40} fill={c} />
          <ellipse cx={96} cy={86} rx={30} ry={8} fill={c} />
          <ellipse cx={96} cy={86} rx={30} ry={8} {...shade(0.16)} />
          <circle cx={96} cy={76} r={7} fill={c} />
          <path d="M64 112a34 30 0 0 1 20-20" fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "cup":
      return (
        <g>
          <Ground cy={170} rx={42} />
          <rect x={80} y={156} width={40} height={10} rx={3} fill={CLAY} />
          <path d="M66 58h68l-6 98a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8z" fill={c} />
          <path d="M67 84q8 10 16 0t16 0t16 0t17 0l-1 16H68z" {...light(0.22)} />
          <ellipse cx={100} cy={58} rx={34} ry={8} fill={c} />
          <ellipse cx={100} cy={58} rx={29} ry={5.5} {...shade(0.28)} />
          <rect x={76} y={70} width={6} height={80} rx={3} {...light(0.3)} />
        </g>
      );
    case "bowl":
      return (
        <g>
          <Ground cy={166} rx={50} />
          <rect x={80} y={150} width={40} height={12} rx={3} fill={CLAY} />
          <path d="M38 92h124q-2 62-62 64q-60-2-62-64z" fill={c} />
          <ellipse cx={100} cy={92} rx={62} ry={13} fill={c} />
          <ellipse cx={100} cy={92} rx={56} ry={9} {...shade(0.22)} />
          <ellipse cx={100} cy={93} rx={44} ry={6} fill={COLORS.matcha} />
          <ellipse cx={92} cy={92} rx={18} ry={2.5} {...light(0.35)} />
          <path d="M52 106q6 30 30 42" fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "plate":
      return (
        <g>
          <Ground cy={152} rx={70} />
          <ellipse cx={100} cy={134} rx={72} ry={24} fill={c} />
          <ellipse cx={100} cy={134} rx={72} ry={24} {...shade(0.22)} />
          <ellipse cx={100} cy={122} rx={72} ry={24} fill={c} />
          <ellipse cx={100} cy={122} rx={50} ry={15} {...shade(0.12)} />
          {/* A flower on the plate, flattened to the plate's perspective. */}
          <g transform="matrix(1 0 0 0.45 0 67.1)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse key={angle} cx={100} cy={112} rx={5} ry={9} transform={`rotate(${angle} 100 122)`} {...light(0.55)} />
            ))}
          </g>
          <path d="M42 116q22-14 54-16" fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "notebook":
      return (
        <g>
          <Ground cy={170} rx={52} />
          <rect x={62} y={40} width={88} height={126} rx={5} fill={PAPER} />
          <rect x={54} y={36} width={88} height={128} rx={5} fill={c} />
          <rect x={54} y={36} width={12} height={128} rx={4} {...shade(0.18)} />
          <rect x={80} y={62} width={46} height={22} rx={2} fill={PAPER} />
          <rect x={86} y={69} width={34} height={3} rx={1.5} fill={c} fillOpacity={0.7} />
          <rect x={86} y={75} width={22} height={3} rx={1.5} fill={c} fillOpacity={0.7} />
          <rect x={128} y={36} width={5} height={128} {...shade(0.35)} />
          <rect x={70} y={44} width={4} height={112} rx={2} {...light(0.25)} />
        </g>
      );
    case "pen":
      return (
        <g>
          <Ground cy={174} rx={46} />
          <g transform="rotate(40 100 100)">
            <rect x={88} y={28} width={24} height={64} rx={11} fill={c} />
            <rect x={106} y={34} width={4} height={44} rx={2} {...light(0.55)} />
            <rect x={88} y={86} width={24} height={6} {...shade(0.3)} />
            <rect x={90} y={92} width={20} height={56} rx={8} fill={c} />
            <path d="M92 146h16l-3 12h-10z" fill={COLORS.ink} />
            <path d="M95 158h10l-5 22z" fill={COLORS.gold} />
            <path d="M100 162v13" stroke="black" strokeOpacity={0.45} strokeWidth={1} />
            <rect x={93} y={34} width={4} height={50} rx={2} {...light(0.35)} />
          </g>
        </g>
      );
    case "tape":
      return (
        <g>
          <Ground cy={174} rx={62} />
          {[
            { cx: 128, cy: 92, r: 34, tint: 0.45 },
            { cx: 76, cy: 112, r: 34, tint: 0 },
            { cx: 126, cy: 140, r: 30, tint: 0.25 },
          ].map((roll) => (
            <g key={roll.cx + roll.cy}>
              <circle cx={roll.cx} cy={roll.cy} r={roll.r} fill={c} />
              {roll.tint > 0 && <circle cx={roll.cx} cy={roll.cy} r={roll.r} {...light(roll.tint)} />}
              <circle
                cx={roll.cx}
                cy={roll.cy}
                r={roll.r * 0.74}
                fill="none"
                stroke="white"
                strokeOpacity={0.5}
                strokeWidth={3}
                strokeDasharray="4 6"
              />
              <circle cx={roll.cx} cy={roll.cy} r={roll.r * 0.46} fill={CLAY} />
              <circle cx={roll.cx} cy={roll.cy} r={roll.r * 0.32} className="fill-background-3" />
            </g>
          ))}
        </g>
      );
    case "letter":
      return (
        <g>
          <Ground cy={166} rx={64} />
          <rect x={58} y={38} width={84} height={80} rx={2} fill={PAPER} />
          {[52, 62, 72, 82].map((y) => (
            <rect key={y} x={68} y={y} width={64} height={2} {...shade(0.12)} />
          ))}
          <rect x={40} y={76} width={120} height={84} rx={4} fill={c} />
          <path d="M40 80l60 44l60-44v76a4 4 0 0 1-4 4H44a4 4 0 0 1-4-4z" {...shade(0.08)} />
          <path d="M42 158l46-36M158 158l-46-36" stroke="black" strokeOpacity={0.15} strokeWidth={2} />
          <circle cx={100} cy={124} r={9} fill={COLORS.rust} />
        </g>
      );
  }
}

/** Square crop of the close-up picture, in the 200 × 200 box. */
const DETAIL: Record<ArtKind, string> = {
  tin: "60 80 80 80",
  pouch: "62 76 76 76",
  teapot: "56 62 88 88",
  cup: "60 44 80 80",
  bowl: "40 66 92 92",
  plate: "50 80 100 100",
  notebook: "70 46 72 72",
  pen: "26 118 64 64",
  tape: "40 74 76 76",
  letter: "56 70 88 88",
};

export type ArtView = "front" | "detail" | "colors";

export interface ProductArtProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color"> {
  product: Product;
  color?: ColorId;
  view?: ArtView;
  /** Text alternative; without it the picture is decorative (the product name is next to it). */
  label?: string;
}

export function ProductArt({ product, color = product.colors[0], view = "front", label, className, ...props }: ProductArtProps) {
  const n = product.colors.length;
  const scale = n === 2 ? 0.56 : 0.42;
  const step = n === 2 ? 84 : 60;
  return (
    <svg
      viewBox={view === "detail" ? DETAIL[product.art] : "0 0 200 200"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("size-full text-foreground-1", className)}
      {...props}
    >
      {view === "colors" ? (
        product.colors.map((id, i) => (
          <g key={id} transform={`translate(${100 - ((n - 1) * step) / 2 + i * step - 100 * scale} ${100 - 100 * scale}) scale(${scale})`}>
            <Shape kind={product.art} color={COLORS[id]} />
          </g>
        ))
      ) : (
        <Shape kind={product.art} color={COLORS[color]} />
      )}
    </svg>
  );
}
