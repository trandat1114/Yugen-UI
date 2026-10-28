import * as React from "react";
import { ArrowClockwise16Regular } from "@fluentui/react-icons";
import { Switch, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/cn";
import { useLocale } from "../i18n";
import { PETAL, PETALS } from "../YugenMark";
import { Blossom, clamp, createProgress, InkEnso, LiveBrushStroke, PetalGradient, Tategaki, type ProgressSource } from "./ink";
import { kanji, MINCHO } from "./kanji";
import { LabStage } from "./LabStage";

// Phòng thử màn chờ khởi động (trang Yugen Labs "loading-screen"). Concept "Tategaki nét cọ" là bản đang chạy thật trong
// splash.{html,css,js}; các concept khác để so sánh trước khi đổi. Hai bộ bố cục: số Hán (kanji) và số Latin cho sản phẩm không
// dùng chữ Hán. Mọi concept chạy chung một lần tải mô phỏng để so ở cùng tiến độ; kích thước theo cqmin để xem toàn màn hình vẫn
// đúng tỉ lệ. Xong thì giữ ở khung cuối (bản thật mờ đi nhường trang) để còn nhìn được concept lúc đủ 100.

type Scenario = "fast" | "normal" | "slow" | "stalled";
type Script = "kanji" | "latin";

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
    script: "Kiểu số",
    status: (n: number, failed: boolean, done: boolean) =>
      failed ? "Lỗi sau khi treo" : done ? "Xong, giữ ở khung cuối" : `Đã tải ${n}%`,
    live: {
      name: "Tategaki nét cọ",
      note: "Đang dùng. Nét cọ ở giữa chạy theo tiến độ, số Hán viết dọc ở mép, logo vẽ bằng mực ở góc và nở hoa khi xong.",
    },
    concepts: [
      { name: "Tategaki", note: "Số viết dọc ở mép, vạch mực chảy xuống theo tiến độ." },
      { name: "Enso mực", note: "Bản trước. Mực chạy theo nét enso ở giữa, số Hán ở góc." },
      { name: "Nét cọ", note: "Một nét cọ ngang thay thanh tiến độ, số đi theo đầu bút." },
      { name: "Hoa nở", note: "Mỗi 20% nở một cánh; đủ năm cánh thì nhị hiện." },
    ],
    latinLive: {
      name: "Nét cọ Latin",
      note: "Bản Latin của concept đang dùng: nét cọ và chữ ở giữa, số lớn ở góc dưới đối diện logo.",
    },
    latin: [
      { name: "Số lớn", note: "Số 0–100 thật lớn ở giữa, nét cọ gạch chân chạy theo tiến độ." },
      { name: "Gáy sách", note: "Số và chữ xoay dọc theo mép như gáy sách, vạch mực chảy xuống." },
      { name: "Vòng enso", note: "Logo enso lớn ở giữa, số nằm trong vòng." },
      { name: "Đầu bút", note: "Nét cọ ngang, số đi theo đầu bút." },
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
    script: "Numerals",
    status: (n: number, failed: boolean, done: boolean) =>
      failed ? "Failed after stalling" : done ? "Done, holding the last frame" : `Loaded ${n}%`,
    live: {
      name: "Tategaki brush",
      note: "In use. A brush stroke in the middle follows progress, kanji numerals run down the edge, the mark is inked in the corner and blooms at the end.",
    },
    concepts: [
      { name: "Tategaki", note: "Numerals written vertically at the edge, an ink rule running down with progress." },
      { name: "Ink ensō", note: "Previous version. Ink follows the ensō in the middle, kanji numerals in the corner." },
      { name: "Brush stroke", note: "One horizontal brush stroke instead of a progress bar; the number rides the brush tip." },
      { name: "Bloom", note: "One petal opens every 20%; the stamens appear with the fifth." },
    ],
    latinLive: {
      name: "Latin brush",
      note: "The Latin counterpart of the live concept: brush stroke and label in the middle, a large number in the bottom corner across from the mark.",
    },
    latin: [
      { name: "Big counter", note: "A very large 0–100 in the middle, underlined by a brush stroke that follows progress." },
      { name: "Spine", note: "Number and label turned sideways along the edge like a book spine, with an ink rule running down." },
      { name: "Ensō ring", note: "A large ensō in the middle with the number inside the ring." },
      { name: "Brush tip", note: "A horizontal brush stroke with the number riding the brush tip." },
    ],
  },
};

/**
 * Mô phỏng đúng cách splash.js chạy: tiến độ đo được (tối đa 95%) làm mượt theo thời gian, render xong thì chạy nốt 400 ms.
 * Tiến độ liên tục đi qua `progress` (nét cọ, vạch mực đổi transform từng khung hình); state React chỉ đổi khi số % đổi — tối đa
 * 101 lần mỗi lần chạy thay vì 60 lần mỗi giây cho cả năm khung.
 */
function useBootSimulation(scenario: Scenario, reduced: boolean, run: number, progress: ProgressSource) {
  const [state, setState] = React.useState({ n: 0, failed: false });
  React.useEffect(() => {
    const { ms, stallAt } = SCENARIOS[scenario];
    const start = performance.now();
    let last = start;
    let shown = 0;
    let doneAt = 0;
    let from = 0;
    let frame = 0;
    let n = 0;
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
      progress.set(shown);
      const next = shown >= 1 ? 100 : Math.min(99, Math.floor(shown * 100));
      if (next !== n || failed) {
        n = next;
        setState({ n, failed });
      }
      if (shown < 1 && !failed) frame = requestAnimationFrame(tick);
    };
    progress.set(0);
    setState({ n: 0, failed: false });
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scenario, reduced, run, progress]);
  return state;
}

/* ----------------------------------------------------------------- concept */

interface FrameProps {
  /** Tiến độ theo từng % (state React): logo, số, hoa. */
  p: number;
  /** Tiến độ liên tục từng khung hình: nét cọ, vạch mực. */
  progress: ProgressSource;
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

/** Vạch mực chảy xuống theo tiến độ: scaleY theo `progress` từng khung hình (giảm chuyển động: theo từng %). */
function InkRule({ progress, p, reduced }: { progress: ProgressSource; p: number; reduced: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced) return;
    return progress.subscribe((value) => {
      if (ref.current) ref.current.style.transform = `scaleY(${value})`;
    });
  }, [progress, reduced]);
  return (
    <div
      ref={ref}
      className="h-full w-full origin-top rounded-circular bg-foreground-1 will-change-transform"
      style={{ transform: `scaleY(${reduced ? p : progress.value})` }}
    />
  );
}

function Numeral({ n, className, style }: { n: number; className?: string; style?: React.CSSProperties }) {
  return (
    <p className={cn("leading-none font-light text-foreground-3", className)} style={{ fontFamily: MINCHO, ...style }}>
      {kanji(n)}
    </p>
  );
}

/** Số Latin: chữ không chân nét mảnh, chữ số đều bề rộng để số không nhảy khi đổi; dấu % nhỏ treo ở đỉnh. */
function LatinNumber({ n, className, style }: { n: number; className?: string; style?: React.CSSProperties }) {
  return (
    <p className={cn("flex items-start leading-none font-extralight tracking-tight text-foreground-3 tabular-nums", className)} style={style}>
      {n}
      <span className="ms-[0.06em] mt-[0.1em] text-[0.26em] font-light tracking-normal">%</span>
    </p>
  );
}

/** Bản đang dùng (splash.html): nét cọ + chữ ở giữa, số dọc ở mép trên, logo ở góc dưới. */
function LiveFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      {!failed && <Tategaki className="absolute inset-e-[7cqmin] top-[7cqmin] text-[15cqmin]">{kanji(n)}</Tategaki>}
      <div className="flex w-[56%] flex-col items-center gap-[4cqmin]">
        <LiveBrushStroke progress={progress} p={p} reduced={reduced} className="w-full" />
        <Label failed={failed} reduced={reduced} text={text} className="text-center" />
      </div>
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[13cqmin]" />
      </div>
    </div>
  );
}

function TategakiFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="relative h-full">
      {!failed && <Tategaki className="absolute inset-e-[9cqmin] top-[7cqmin] text-[15cqmin]">{kanji(n)}</Tategaki>}
      <div className="absolute inset-e-[5cqmin] top-[7cqmin] bottom-[7cqmin] w-[0.6cqmin] rounded-circular bg-foreground-1/10">
        <InkRule progress={progress} p={p} reduced={reduced} />
      </div>
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin] flex items-center gap-[3cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[13cqmin]" />
        <Label failed={failed} reduced={reduced} text={text} />
      </div>
    </div>
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

function BrushFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative w-[78%]">
        {!failed && (
          <Numeral
            n={n}
            className="absolute bottom-full mb-[2cqmin] -translate-x-1/2 text-[11cqmin] whitespace-nowrap rtl:translate-x-1/2"
            // Số đi theo đầu bút; bút chạy từ đầu dòng nên vị trí theo hướng chữ.
            style={{ insetInlineStart: `${Math.min(94, -2 + 104 * p)}%` }}
          />
        )}
        <LiveBrushStroke progress={progress} p={p} reduced={reduced} className="w-full" />
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

/* ------------------------------------------------------------ bố cục Latin */

/** Bản Latin của concept đang dùng: số lớn ở góc dưới cuối dòng, đối diện logo. */
function LatinLiveFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex w-[56%] flex-col items-center gap-[4cqmin]">
        <LiveBrushStroke progress={progress} p={p} reduced={reduced} className="w-full" />
        <Label failed={failed} reduced={reduced} text={text} className="text-center" />
      </div>
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[13cqmin]" />
      </div>
      {!failed && <LatinNumber n={n} className="absolute inset-e-[6cqmin] bottom-[5cqmin] text-[20cqmin]" />}
    </div>
  );
}

function CounterFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex w-[64%] flex-col items-center gap-[5cqmin]">
        {!failed && <LatinNumber n={n} className="text-[34cqmin] text-foreground-1" />}
        <LiveBrushStroke progress={progress} p={p} reduced={reduced} className="w-[80%]" />
        <Label failed={failed} reduced={reduced} text={text} className="mt-[2cqmin] text-center" />
      </div>
      <div className="absolute inset-s-[6cqmin] bottom-[6cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[10cqmin]" />
      </div>
    </div>
  );
}

/** Chữ Latin xoay dọc như gáy sách (vertical-rl đặt chữ Latin nằm nghiêng); khung rộng 1em như Tategaki. */
function Spine({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-[1em]", className)}>
      <p className="leading-none [writing-mode:vertical-rl]">{children}</p>
    </div>
  );
}

function SpineFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="relative h-full">
      {!failed && (
        <Spine className="absolute inset-e-[9cqmin] top-[7cqmin] text-[15cqmin] font-extralight tracking-tight text-foreground-3 tabular-nums">
          {n}
        </Spine>
      )}
      <div className="absolute inset-e-[5cqmin] top-[7cqmin] bottom-[7cqmin] w-[0.6cqmin] rounded-circular bg-foreground-1/10">
        <InkRule progress={progress} p={p} reduced={reduced} />
      </div>
      {failed ? (
        <Label failed reduced={reduced} text={text} className="absolute inset-s-[7cqmin] top-[7cqmin]" />
      ) : (
        <Spine className="absolute inset-e-[9cqmin] bottom-[7cqmin] text-[max(8px,1.9cqmin)] tracking-[0.42em] text-foreground-3 uppercase">
          <span className={cn(!reduced && "animate-pulse")}>{text.loading}</span>
        </Spine>
      )}
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin]">
        <InkEnso p={p} reduced={reduced} className="w-[13cqmin]" />
      </div>
    </div>
  );
}

function RingFrame({ p, n, reduced, failed, text }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex flex-col items-center gap-[3cqmin]">
        <div className="relative">
          <InkEnso p={p} reduced={reduced} className="w-[40cqmin]" />
          {/* Tâm vòng enso ở (24, 25.5) trong hệ 48×48, hơi thấp hơn giữa khung. */}
          {!failed && (
            <LatinNumber n={n} className="absolute inset-s-1/2 top-[53%] -translate-1/2 text-[9cqmin] text-foreground-2 rtl:translate-x-1/2" />
          )}
        </div>
        <Label failed={failed} reduced={reduced} text={text} />
      </div>
    </div>
  );
}

function TipFrame({ p, n, reduced, failed, text, progress }: FrameProps) {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative w-[78%]">
        {!failed && (
          <LatinNumber
            n={n}
            className="absolute bottom-full mb-[2cqmin] -translate-x-1/2 text-[11cqmin] whitespace-nowrap rtl:translate-x-1/2"
            style={{ insetInlineStart: `${Math.min(94, -2 + 104 * p)}%` }}
          />
        )}
        <LiveBrushStroke progress={progress} p={p} reduced={reduced} className="w-full" />
        <Label failed={failed} reduced={reduced} text={text} className="mt-[5cqmin] text-center" />
      </div>
    </div>
  );
}

const SETS: Record<Script, { live: React.ComponentType<FrameProps>; frames: React.ComponentType<FrameProps>[] }> = {
  kanji: { live: LiveFrame, frames: [TategakiFrame, EnsoFrame, BrushFrame, BloomFrame] },
  latin: { live: LatinLiveFrame, frames: [CounterFrame, SpineFrame, RingFrame, TipFrame] },
};

/** Năm concept màn chờ (theo kiểu số) chạy cùng một lần tải mô phỏng, để so sánh ở cùng tiến độ. */
export function LoadingLab() {
  const { locale } = useLocale();
  const text = STRINGS[locale === "en" ? "en" : "vi"];
  const [script, setScript] = React.useState<Script>("kanji");
  const [scenario, setScenario] = React.useState<Scenario>("normal");
  const [reduced, setReduced] = React.useState(false);
  const [run, setRun] = React.useState(0);
  React.useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const progress = React.useMemo(createProgress, []);
  const { n, failed } = useBootSimulation(scenario, reduced, run, progress);
  const p = n / 100;
  const done = p >= 1;
  const frame = { p, n, reduced, failed, text, progress };

  const speed = (
    <ToggleGroup type="single" size="small" aria-label={text.scenario} value={scenario} onValueChange={(next) => next && setScenario(next as Scenario)}>
      {(Object.keys(SCENARIOS) as Scenario[]).map((key) => (
        <ToggleGroupItem key={key} value={key}>
          {text.scenarios[key]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
  const scriptToggle = (
    <ToggleGroup type="single" size="small" aria-label={text.script} value={script} onValueChange={(next) => next && setScript(next as Script)}>
      <ToggleGroupItem value="kanji">Kanji</ToggleGroupItem>
      <ToggleGroupItem value="latin">Latin</ToggleGroupItem>
    </ToggleGroup>
  );
  const replay = (
    <Button size="small" icon={<ArrowClockwise16Regular />} onClick={() => setRun((r) => r + 1)}>
      {text.replay}
    </Button>
  );
  const status = <p className="text-caption1 text-foreground-2 tabular-nums">{text.status(n, failed, done)}</p>;
  // Thanh nổi khi xem toàn màn hình: đủ để chạy lại và đổi tốc độ mà không phải thoát ra.
  const controls = (
    <>
      {speed}
      {replay}
      {status}
    </>
  );
  const { live: Live, frames } = SETS[script];
  const live = script === "kanji" ? text.live : text.latinLive;
  const notes = script === "kanji" ? text.concepts : text.latin;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {scriptToggle}
        {speed}
        <Switch label={text.reduce} checked={reduced} onCheckedChange={setReduced} />
        {replay}
        {status}
      </div>
      <LabStage {...live} controls={controls}>
        <Live {...frame} />
      </LabStage>
      <div className="grid gap-6 md:grid-cols-2">
        {frames.map((Frame, i) => (
          <LabStage key={`${script}-${i}`} {...notes[i]} controls={controls}>
            <Frame {...frame} />
          </LabStage>
        ))}
      </div>
    </div>
  );
}
