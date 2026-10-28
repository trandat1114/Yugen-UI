import * as React from "react";
import { ArrowClockwise16Regular, FullScreenMaximize16Regular } from "@fluentui/react-icons";
import { Switch, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/cn";
import { useLocale } from "../i18n";
import { ENSO, FLOWER, KASURE, PETAL, PETALS, STAMENS } from "../YugenMark";
import { kanji, MINCHO } from "./kanji";

// Phòng thử màn chờ khởi động (trang Yugen Labs "loading-screen"). Concept "Enso mực" là bản đang chạy thật trong
// splash.{html,css,js}; các concept khác để so sánh trước khi đổi. Mọi kích thước theo cqmin để xem toàn màn hình vẫn đúng tỉ lệ.

/** Đường tâm nét enso cho mặt nạ mực, như #yb-brush trong splash.html. */
const BRUSH = "M31.10 10.94A16.2 16.2 0 1 1 20.63 9.65";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

type Scenario = "fast" | "normal" | "slow" | "stalled";

/** Thời gian tới khi App render (ms); "stalled" dừng ở 62% rồi báo lỗi — splash thật đợi 15 s, ở đây rút ngắn. */
const SCENARIOS: Record<Scenario, { ms: number; stallAt?: number }> = {
  fast: { ms: 800 },
  normal: { ms: 3000 },
  slow: { ms: 8000 },
  stalled: { ms: 6000, stallAt: 0.62 },
};

const STRINGS = {
  vi: {
    loading: "Đang tải",
    error: "Không tải được trang.",
    reload: "Tải lại",
    scenario: "Tốc độ tải",
    scenarios: { fast: "Nhanh", normal: "Vừa", slow: "Chậm", stalled: "Treo" } satisfies Record<Scenario, string>,
    reduce: "Giảm chuyển động",
    replay: "Chạy lại",
    fullscreen: (name: string) => `Xem ${name} toàn màn hình`,
    status: (n: number, failed: boolean, done: boolean) => (failed ? "Lỗi sau khi treo" : done ? "Trang đã sẵn sàng" : `Đã tải ${n}%`),
    concepts: [
      { name: "Enso mực", note: "Đang dùng. Mực chạy theo nét bút, số Hán ở góc, hoa nở ở cuối." },
      { name: "Tategaki", note: "Số viết dọc ở mép, vạch mực chảy xuống theo tiến độ." },
      { name: "Nét cọ", note: "Một nét cọ ngang thay thanh tiến độ, số đi theo đầu bút." },
      { name: "Hoa nở", note: "Mỗi 20% nở một cánh; đủ năm cánh thì nhị hiện." },
    ],
  },
  en: {
    loading: "Loading",
    error: "The page didn't load.",
    reload: "Reload",
    scenario: "Load speed",
    scenarios: { fast: "Fast", normal: "Medium", slow: "Slow", stalled: "Stalled" } satisfies Record<Scenario, string>,
    reduce: "Reduce motion",
    replay: "Replay",
    fullscreen: (name: string) => `View ${name} full screen`,
    status: (n: number, failed: boolean, done: boolean) => (failed ? "Failed after stalling" : done ? "Page ready" : `Loaded ${n}%`),
    concepts: [
      { name: "Ink ensō", note: "In use. Ink follows the brush stroke, kanji numerals in the corner, a blossom at the end." },
      { name: "Tategaki", note: "Numerals written vertically at the edge, an ink rule running down with progress." },
      { name: "Brush stroke", note: "One horizontal brush stroke instead of a progress bar; the number rides the brush tip." },
      { name: "Bloom", note: "One petal opens every 20%; the stamens appear with the fifth." },
    ],
  },
};

/** Mô phỏng đúng cách splash.js chạy: tiến độ đo được (tối đa 95%) làm mượt theo thời gian, render xong thì chạy nốt 400 ms. */
function useBootSimulation(scenario: Scenario, reduced: boolean, run: number) {
  const [state, setState] = React.useState({ p: 0, failed: false });
  React.useEffect(() => {
    const { ms, stallAt } = SCENARIOS[scenario];
    const start = performance.now();
    let last = start;
    let shown = 0;
    let doneAt = 0;
    let from = 0;
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      // Module về theo đợt: nhanh lúc đầu, chậm dần khi còn các file lớn.
      let measured = 0.95 * (1 - (1 - clamp(t / ms)) ** 2);
      if (stallAt !== undefined) measured = Math.min(measured, stallAt);
      if (!doneAt && stallAt === undefined && t >= ms) {
        doneAt = now;
        from = shown;
      }
      const dt = now - last;
      last = now;
      if (doneAt) shown = reduced ? 1 : from + (1 - from) * clamp((now - doneAt) / 400);
      else shown = Math.max(shown, shown + (measured - shown) * (1 - Math.exp(-dt / 220)));
      const failed = stallAt !== undefined && t > ms;
      setState({ p: shown, failed });
      if (shown < 1 && !failed) frame = requestAnimationFrame(tick);
    };
    setState({ p: 0, failed: false });
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scenario, reduced, run]);
  return state;
}

/* ------------------------------------------------------------------ hình vẽ */

function PetalGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0" cy="0" r="10" gradientUnits="userSpaceOnUse">
      <stop stopColor="#c02a6f" />
      <stop offset="0.3" stopColor="#ef77a9" />
      <stop offset="0.7" stopColor="#f8bcd4" />
      <stop offset="1" stopColor="#fde8f0" />
    </radialGradient>
  );
}

/** Bông anh đào của logo, mỗi cánh một độ mờ (`petal(i)` 0–1); `grow`: cánh nở từ nhỏ ra. */
function Blossom({ transform, fill, petal, heart, grow }: { transform?: string; fill: string; petal: (i: number) => number; heart: boolean; grow?: boolean }) {
  return (
    <g transform={transform}>
      {PETALS.map(([a, s], i) => {
        const o = petal(i);
        return (
          <path
            key={a}
            d={PETAL}
            transform={`rotate(${a - 8}) scale(${grow ? s * (0.55 + 0.45 * o) : s})`}
            fill={fill}
            stroke="#d9588f"
            strokeOpacity="0.45"
            strokeWidth="0.35"
            opacity={o}
          />
        );
      })}
      <g opacity={heart ? 1 : 0}>
        {STAMENS.map(([x, y], i) => (
          <g key={i}>
            <line x2={x} y2={y} stroke="#b8236a" strokeWidth="0.32" strokeLinecap="round" />
            <circle cx={x} cy={y} r="0.55" fill="#f3b33d" />
          </g>
        ))}
        <circle r="1.1" fill="#b8236a" />
      </g>
    </g>
  );
}

/** Mép nét mực loang nhẹ, như #yb-wet. */
function WetFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
      <feGaussianBlur stdDeviation="0.3" />
    </filter>
  );
}

/** Logo vẽ bằng mực theo tiến độ — bản React của SVG trong splash.html. */
export function InkEnso({ p, reduced, blossom = true, className }: { p: number; reduced: boolean; blossom?: boolean; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  const ink = clamp(p / 0.9);
  return (
    <svg viewBox="0 0 48 48" className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <WetFilter id={`${id}wet`} />
        <mask id={`${id}draw`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <path
            d={BRUSH}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={reduced ? 0 : 100 - 100 * ink}
            fill="none"
            stroke="#fff"
            strokeWidth="9"
            filter={`url(#${id}wet)`}
          />
        </mask>
        <mask id={`${id}dry`} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <rect width="48" height="48" fill="#fff" />
          {KASURE.map((d) => (
            <path key={d} d={d} fill="none" stroke="#000" strokeWidth="0.45" strokeLinecap="round" />
          ))}
        </mask>
        <PetalGradient id={`${id}p`} />
      </defs>
      <g mask={`url(#${id}dry)`} fill="currentColor">
        <path d={ENSO} opacity={0.1} />
        <path d={ENSO} mask={`url(#${id}draw)`} opacity={reduced ? 0.15 + 0.85 * ink : 1} />
      </g>
      {blossom && <Blossom transform={FLOWER} fill={`url(#${id}p)`} petal={(i) => clamp((p - 0.9 - i * 0.018) / 0.018)} heart={p >= 1} />}
    </svg>
  );
}

/* ----------------------------------------------------------------- concept */

interface FrameProps {
  p: number;
  n: number;
  reduced: boolean;
  failed: boolean;
  text: (typeof STRINGS)["vi"];
}

function Label({ failed, reduced, text, className }: Pick<FrameProps, "failed" | "reduced" | "text"> & { className?: string }) {
  if (failed) {
    return (
      <p className={cn("text-[max(11px,2.6cqmin)] text-foreground-1", className)}>
        {text.error} <span className="underline underline-offset-2">{text.reload}</span>
      </p>
    );
  }
  return (
    <p className={cn("ps-[0.42em] text-[max(8px,1.9cqmin)] tracking-[0.42em] text-foreground-3 uppercase", !reduced && "animate-pulse", className)}>
      {text.loading}
    </p>
  );
}

function Numeral({ n, className, vertical, style }: { n: number; className?: string; vertical?: boolean; style?: React.CSSProperties }) {
  return (
    <p className={cn("leading-none font-light text-foreground-3", className)} style={{ fontFamily: MINCHO, writingMode: vertical ? "vertical-rl" : undefined, ...style }}>
      {kanji(n)}
    </p>
  );
}

function EnsoFrame({ p, n, reduced, failed, text }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex flex-col items-center gap-[4cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[24cqmin]" />
        <Label failed={failed} reduced={reduced} text={text} />
      </div>
      {!failed && <Numeral n={n} className="absolute inset-s-[5cqmin] bottom-[4cqmin] text-[20cqmin]" />}
    </div>
  );
}

function TategakiFrame({ p, n, reduced, failed, text }: FrameProps) {
  return (
    <div className="relative h-full">
      {/* Vị trí đặt ở khung bọc: với chữ dọc, inset-inline của chính phần tử là trục dọc. */}
      {!failed && (
        <div className="absolute inset-e-[9cqmin] top-[7cqmin]">
          <Numeral vertical n={n} className="text-[15cqmin]" />
        </div>
      )}
      <div className="absolute inset-e-[5cqmin] top-[7cqmin] bottom-[7cqmin] w-[0.6cqmin] rounded-circular bg-foreground-1/10">
        <div className="w-full rounded-circular bg-foreground-1" style={{ height: `${p * 100}%` }} />
      </div>
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin] flex items-center gap-[3cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[13cqmin]" />
        <Label failed={failed} reduced={reduced} text={text} />
      </div>
    </div>
  );
}

function BrushFrame({ p, n, reduced, failed, text }: FrameProps) {
  const id = React.useId().replace(/:/g, "");
  const ink = clamp(p / 0.97);
  return (
    <div className="grid h-full place-items-center">
      <div className="relative w-[78%]">
        {!failed && (
          <Numeral
            n={n}
            className="absolute bottom-full mb-[2cqmin] -translate-x-1/2 text-[11cqmin] whitespace-nowrap rtl:translate-x-1/2"
            // Số đi theo đầu bút; bút chạy từ đầu dòng nên vị trí theo hướng chữ.
            style={{ insetInlineStart: `${4 + 92 * ink}%` }}
          />
        )}
        <svg viewBox="0 0 100 16" className="w-full overflow-visible text-foreground-1 rtl:-scale-x-100" aria-hidden>
          <defs>
            <WetFilter id={`${id}wet`} />
          </defs>
          <path d="M4 9.5C24 7 46 10.5 68 8.6S90 8.2 96 7.6" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M4 9.5C24 7 46 10.5 68 8.6S90 8.2 96 7.6"
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={reduced ? 0 : 100 - 100 * ink}
            opacity={reduced ? 0.15 + 0.85 * ink : 1}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            filter={`url(#${id}wet)`}
          />
        </svg>
        <Label failed={failed} reduced={reduced} text={text} className="mt-[5cqmin] text-center" />
      </div>
    </div>
  );
}

function BloomFrame({ p, n, reduced, failed, text }: FrameProps) {
  const id = React.useId().replace(/:/g, "");
  return (
    <div className="grid h-full place-items-center">
      <div className="flex flex-col items-center gap-[4cqmin]">
        <svg viewBox="-12 -12 24 24" className="w-[30cqmin] overflow-visible" aria-hidden>
          <defs>
            <PetalGradient id={`${id}p`} />
          </defs>
          {PETALS.map(([a, s]) => (
            <path key={a} d={PETAL} transform={`rotate(${a - 8}) scale(${s})`} fill="currentColor" className="text-foreground-1/5" />
          ))}
          <Blossom fill={`url(#${id}p)`} petal={(i) => clamp((p - i * 0.19) / 0.19)} heart={p >= 1} grow={!reduced} />
        </svg>
        <Label failed={failed} reduced={reduced} text={text} />
      </div>
      {!failed && <Numeral n={n} className="absolute inset-s-[5cqmin] bottom-[4cqmin] text-[14cqmin]" />}
    </div>
  );
}

const FRAMES = [EnsoFrame, TategakiFrame, BrushFrame, BloomFrame];

/** Khung trang giả nằm dưới màn chờ, để thấy lúc màn chờ mờ đi nhường chỗ. */
function MockPage() {
  return (
    <div className="flex h-full gap-[4cqmin] p-[5cqmin]">
      <div className="hidden w-[22%] flex-col gap-[2cqmin] @[28rem]:flex">
        {[70, 55, 80, 60, 45].map((w) => (
          <div key={w} className="h-[2.4cqmin] rounded-circular bg-background-4" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[3cqmin]">
        <div className="h-[6cqmin] w-1/2 rounded-medium bg-background-4" />
        <div className="h-[2.4cqmin] w-11/12 rounded-circular bg-background-3" />
        <div className="h-[2.4cqmin] w-4/5 rounded-circular bg-background-3" />
        <div className="mt-[2cqmin] flex-1 rounded-large bg-background-3" />
      </div>
    </div>
  );
}

function Stage({ name, note, done, reduced, fullscreenLabel, children }: { name: string; note: string; done: boolean; reduced: boolean; fullscreenLabel: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = React.useState(false);
  React.useEffect(() => setCanFullscreen(document.fullscreenEnabled), []);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        ref={ref}
        aria-hidden
        className="relative aspect-16/10 overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 @container-size [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
      >
        <MockPage />
        <div className={cn("absolute inset-0 bg-background-1 text-foreground-1", !reduced && "transition-opacity duration-slow", done && "opacity-0")}>{children}</div>
      </div>
      <figcaption className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body1 font-semibold text-foreground-1">{name}</p>
          <p className="text-caption1 text-foreground-2">{note}</p>
        </div>
        {canFullscreen && (
          <Button
            appearance="subtle"
            size="small"
            icon={<FullScreenMaximize16Regular />}
            aria-label={fullscreenLabel}
            title={fullscreenLabel}
            onClick={() => void ref.current?.requestFullscreen()}
          />
        )}
      </figcaption>
    </figure>
  );
}

/** Bốn concept màn chờ chạy cùng một lần tải mô phỏng, để so sánh ở cùng tiến độ. */
export function LoadingLab() {
  const { locale } = useLocale();
  const text = STRINGS[locale === "en" ? "en" : "vi"];
  const [scenario, setScenario] = React.useState<Scenario>("normal");
  const [reduced, setReduced] = React.useState(false);
  const [run, setRun] = React.useState(0);
  React.useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const { p, failed } = useBootSimulation(scenario, reduced, run);
  const n = p >= 1 ? 100 : Math.min(99, Math.floor(p * 100));
  const done = p >= 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ToggleGroup type="single" size="small" aria-label={text.scenario} value={scenario} onValueChange={(next) => next && setScenario(next as Scenario)}>
          {(Object.keys(SCENARIOS) as Scenario[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {text.scenarios[key]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Switch label={text.reduce} checked={reduced} onCheckedChange={setReduced} />
        <Button size="small" icon={<ArrowClockwise16Regular />} onClick={() => setRun((r) => r + 1)}>
          {text.replay}
        </Button>
        <p className="text-caption1 text-foreground-2 tabular-nums">{text.status(n, failed, done)}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {FRAMES.map((Frame, i) => (
          <Stage key={i} {...text.concepts[i]} done={done} reduced={reduced} fullscreenLabel={text.fullscreen(text.concepts[i].name)}>
            <Frame p={p} n={n} reduced={reduced} failed={failed} text={text} />
          </Stage>
        ))}
      </div>
    </div>
  );
}
