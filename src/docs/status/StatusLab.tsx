import * as React from "react";
import { ArrowClockwise16Regular, ChevronLeft16Regular, ChevronRight16Regular } from "@fluentui/react-icons";
import { Switch, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/cn";
import { useLocale } from "../i18n";
import { FLOWER, PETAL, PETALS } from "../YugenMark";
import { BrushStroke, clamp, InkEnso, Tategaki } from "../boot/ink";
import { kanjiDigits } from "../boot/kanji";
import { LabStage } from "../boot/LabStage";
import { STATUS_COPY, STATUSES, type StatusArt, type StatusDef, type StatusId } from "./catalog";

// Phòng thử trang trạng thái (trang Yugen Labs "status-pages", #238). Cùng bố cục với màn chờ khởi động: nét cọ và nội dung
// ở giữa, mã viết dọc ở mép trên, logo ở góc dưới — trang lỗi hiện ra ở đúng chỗ màn chờ vừa đứng.

type Numerals = "kanji" | "latin";

const STRINGS = {
  vi: {
    status: "Trạng thái",
    names: { offline: "Mất mạng", update: "Bản mới" } as Partial<Record<StatusId, string>>,
    numerals: "Kiểu số",
    kanji: "Kanji",
    latin: "Latin",
    reduce: "Giảm chuyển động",
    replay: "Chạy lại",
    prev: "Trạng thái trước",
    next: "Trạng thái sau",
    waiting: (action: string, s: number) => `${action} sau ${s} giây`,
  },
  en: {
    status: "Status",
    names: { offline: "Offline", update: "Update" } as Partial<Record<StatusId, string>>,
    numerals: "Numerals",
    kanji: "Kanji",
    latin: "Latin",
    reduce: "Reduce motion",
    replay: "Replay",
    prev: "Previous status",
    next: "Next status",
    waiting: (action: string, s: number) => `${action} in ${s}s`,
  },
};

/** Nét cọ vẽ vào trong chừng này ms khi mở trang; hoa nở trong BLOOM_MS sau khi hết thời gian chờ. */
const DRAW_MS = 900;
const BLOOM_MS = 500;

/** Thời gian từ lúc mở trang: nét cọ vẽ vào, đếm ngược (429 / 503) rồi hoa nở. Giảm chuyển động: nét có sẵn, hoa hiện ngay. */
function useTimeline(def: StatusDef, reduced: boolean, run: number) {
  const [state, setState] = React.useState({ draw: 0, wait: 0, bloom: 0, left: 0 });
  React.useEffect(() => {
    const wait = def.wait ?? 0;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      const draw = reduced ? 1 : 1 - (1 - clamp(t / DRAW_MS)) ** 3;
      const waited = wait ? clamp(t / wait) : 1;
      const bloom = wait ? (reduced ? (t >= wait ? 1 : 0) : clamp((t - wait) / BLOOM_MS)) : 1;
      setState({ draw, wait: waited, bloom, left: Math.max(0, Math.ceil((wait - t) / 1000)) });
      if (t < Math.max(DRAW_MS, wait + BLOOM_MS)) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [def, reduced, run]);
  return state;
}

/* ------------------------------------------------------------------ logo */

/** Cánh rụng nằm dưới enso: [x, y, góc] trong hệ 48×48, theo chỉ số cánh. */
const GROUND: [number, number, number][] = [
  [9.5, 46.4, -72],
  [17.5, 47.3, 84],
  [36.2, 46.6, 96],
  [27, 47.6, -100],
  [42.4, 46.2, 112],
];
/** 404: cánh rụng là cánh này; 410: rụng cả năm. Hằng ở module để effect của FallenPetals không chạy lại mỗi lần render. */
const LOST = 2;
const LOST_ONLY = [LOST];
const ALL_PETALS = [0, 1, 2, 3, 4];

const onFlower = (i: number) => `translate(30.5px, 10.5px) scale(0.95) rotate(${PETALS[i][0] - 8}deg) scale(${PETALS[i][1]})`;
const onGround = (i: number) => `translate(${GROUND[i][0]}px, ${GROUND[i][1]}px) rotate(${GROUND[i][2]}deg) scale(0.5)`;

/** Cánh hoa rơi từ bông xuống đất, lần lượt từng cánh (Web Animations; giảm chuyển động thì nằm sẵn dưới đất). */
function FallenPetals({ indices, fill, reduced, run }: { indices: number[]; fill: string; reduced: boolean; run: number }) {
  const refs = React.useRef<(SVGGElement | null)[]>([]);
  React.useEffect(() => {
    if (reduced) return;
    const animations = indices.map((petal, k) => {
      const [x, y, r] = GROUND[petal];
      const drift = `translate(${(30.5 + x) / 2 + 5}px, ${(10.5 + y) / 2}px) rotate(${(PETALS[petal][0] - 8 + r) / 2 + 120}deg) scale(0.72)`;
      return refs.current[k]?.animate([{ transform: onFlower(petal) }, { transform: drift, offset: 0.55 }, { transform: onGround(petal) }], {
        duration: 1700,
        delay: 400 + k * 220,
        easing: "cubic-bezier(0.33, 0, 0.67, 1)",
        fill: "backwards",
      });
    });
    return () => animations.forEach((a) => a?.cancel());
  }, [indices, reduced, run]);
  return (
    <>
      {indices.map((petal, k) => (
        <g key={petal} ref={(node) => void (refs.current[k] = node)} style={{ transform: onGround(petal) }}>
          <path d={PETAL} fill={fill} stroke="#d9588f" strokeOpacity="0.45" strokeWidth="0.35" />
        </g>
      ))}
    </>
  );
}

/** Nụ: năm cánh khép, cùng hướng lên. */
const BUD = [
  [-16, 0.5],
  [-7, 0.56],
  [0, 0.6],
  [7, 0.56],
  [16, 0.5],
];

function Bud({ fill }: { fill: string }) {
  return (
    <g transform={FLOWER}>
      {BUD.map(([a, s]) => (
        <path key={a} d={PETAL} transform={`rotate(${a}) scale(${s})`} fill={fill} stroke="#d9588f" strokeOpacity="0.45" strokeWidth="0.35" />
      ))}
    </g>
  );
}

/** Logo theo trạng thái. Hình tĩnh nên luôn vẽ đủ nét (không đổi theo giảm chuyển động); chỉ cánh rơi là chuyển động. */
function StatusMark({ art, bloom, reduced, run, className }: { art: StatusArt; bloom: number; reduced: boolean; run: number; className?: string }) {
  switch (art) {
    case "bloom":
      return <InkEnso p={0.9 + 0.1 * bloom} reduced={false} className={className} />;
    case "plain":
      return <InkEnso p={0.9} reduced={false} blossom={false} className={className} />;
    case "petal-fallen":
      return (
        <InkEnso p={1} reduced={false} petal={(i) => (i === LOST ? 0 : 1)} className={className}>
          {(fill) => <FallenPetals indices={LOST_ONLY} fill={fill} reduced={reduced} run={run} />}
        </InkEnso>
      );
    case "petals-fallen":
      return (
        <InkEnso p={0.9} reduced={false} blossom={false} className={className}>
          {(fill) => <FallenPetals indices={ALL_PETALS} fill={fill} reduced={reduced} run={run} />}
        </InkEnso>
      );
    case "bud":
      return (
        <InkEnso p={0.9} reduced={false} blossom={false} className={className}>
          {(fill) => <Bud fill={fill} />}
        </InkEnso>
      );
    case "broken":
      return <InkEnso p={0.5} reduced={false} blossom={false} className={className} />;
    case "stopped":
      return <InkEnso p={0.62} reduced={false} blossom={false} className={cn("opacity-50", className)} />;
    case "ghost":
      return <InkEnso p={0} reduced={false} blossom={false} className={className} />;
  }
}

/* ----------------------------------------------------------------- khung */

/** Nét cọ ở giữa theo trạng thái; `draw` 0–1 là lúc nét đang vẽ vào. */
function strokeOf(def: StatusDef, draw: number, wait: number): { segments: [number, number][]; opacity?: number } {
  switch (def.stroke) {
    case "full":
      return { segments: [[0, draw]] };
    case "broken":
      // Nét gãy: chạy gần nửa thì đứt, cách một quãng còn một mẩu ngắn.
      return { segments: [[0, 0.46 * clamp(draw / 0.8)], ...(draw > 0.85 ? [[0.53, 0.53 + 0.07 * clamp((draw - 0.85) / 0.15)] as [number, number]] : [])] };
    case "stopped":
      return { segments: [[0, 0.62 * draw]], opacity: 0.5 };
    case "ghost":
      return { segments: [] };
    case "wait":
      return { segments: [[0, wait]] };
  }
}

/** Nút trong hình minh hoạ (khung inert): chỉ để nhìn, cỡ theo cqmin như phần còn lại. */
function MockButton({ primary, disabled, children }: { primary?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[max(24px,5.4cqmin)] items-center rounded-medium border px-[max(8px,2.4cqmin)] text-[max(10px,1.9cqmin)] font-semibold whitespace-nowrap tabular-nums",
        disabled
          ? "border-stroke-disabled bg-background-disabled text-foreground-disabled"
          : primary
            ? "border-transparent bg-brand-background text-foreground-on-brand"
            : "border-stroke-1 bg-background-1 text-foreground-1",
      )}
    >
      {children}
    </span>
  );
}

function StatusFrame({ def, numerals, reduced, run, text }: { def: StatusDef; numerals: Numerals; reduced: boolean; run: number; text: (typeof STRINGS)["vi"] }) {
  const { locale } = useLocale();
  const copy = STATUS_COPY[locale === "en" ? "en" : "vi"][def.id];
  const { draw, wait, bloom, left } = useTimeline(def, reduced, run);
  const waiting = Boolean(def.wait) && left > 0;
  const stroke = strokeOf(def, draw, wait);

  return (
    <div className="grid h-full place-items-center">
      {/* Kanji: mã đọc từng chữ số, viết dọc ở mép. Latin: mã nằm ngang, nét mảnh; trạng thái không có mã thì để trống. */}
      {numerals === "kanji" ? (
        <Tategaki className="absolute inset-e-[7cqmin] top-[7cqmin] text-[13cqmin]">{def.code ? kanjiDigits(def.code) : def.word}</Tategaki>
      ) : (
        def.code && (
          <p className="absolute inset-e-[6cqmin] top-[5cqmin] text-[17cqmin] leading-none font-extralight tracking-tight text-foreground-3 tabular-nums">
            {def.code}
          </p>
        )
      )}
      <div className="flex w-[60%] flex-col items-center text-center">
        <BrushStroke {...stroke} className="w-[86%]" />
        <p
          className={cn(
            "mt-[3.5cqmin] ps-[0.32em] text-[max(8px,1.8cqmin)] tracking-[0.32em] text-foreground-3 uppercase",
            def.id === "offline" && !reduced && "animate-pulse",
          )}
        >
          {copy.eyebrow}
        </p>
        <p className="mt-[1.6cqmin] text-[max(14px,4.6cqmin)] leading-tight font-semibold text-balance text-foreground-1">{copy.title}</p>
        <p className="mt-[1.4cqmin] max-w-[64cqmin] text-[max(10px,2.2cqmin)] text-pretty text-foreground-2">{copy.description}</p>
        {copy.extra && <p className="mt-[1.2cqmin] font-mono text-[max(9px,1.8cqmin)] text-foreground-3">{copy.extra}</p>}
        <div className="mt-[3cqmin] flex flex-wrap justify-center gap-[1.6cqmin]">
          <MockButton primary disabled={waiting}>
            {waiting ? text.waiting(copy.primary, left) : copy.primary}
          </MockButton>
          {copy.secondary && <MockButton>{copy.secondary}</MockButton>}
        </div>
      </div>
      <div className="absolute inset-s-[7cqmin] bottom-[7cqmin]">
        <StatusMark art={def.art} bloom={bloom} reduced={reduced} run={run} className="w-[11cqmin]" />
      </div>
    </div>
  );
}

/** Một khung lớn cho từng trạng thái; chọn trạng thái, kiểu số, giảm chuyển động, chạy lại, xem toàn màn hình. */
export function StatusLab() {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en" : "vi";
  const text = STRINGS[lang];
  const [index, setIndex] = React.useState(STATUSES.findIndex((s) => s.id === "404"));
  const [numerals, setNumerals] = React.useState<Numerals>("kanji");
  const [reduced, setReduced] = React.useState(false);
  const [run, setRun] = React.useState(0);
  React.useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const def = STATUSES[index];
  const copy = STATUS_COPY[lang][def.id];
  const nameOf = (s: StatusDef) => text.names[s.id] ?? s.id;
  const step = (by: number) => setIndex((i) => (i + by + STATUSES.length) % STATUSES.length);

  const numeralToggle = (
    <ToggleGroup type="single" size="small" aria-label={text.numerals} value={numerals} onValueChange={(next) => next && setNumerals(next as Numerals)}>
      <ToggleGroupItem value="kanji">{text.kanji}</ToggleGroupItem>
      <ToggleGroupItem value="latin">{text.latin}</ToggleGroupItem>
    </ToggleGroup>
  );
  const replay = (
    <Button size="small" icon={<ArrowClockwise16Regular />} onClick={() => setRun((r) => r + 1)}>
      {text.replay}
    </Button>
  );
  // Toàn màn hình: chuyển trạng thái bằng trước / sau, không cần thoát ra.
  const controls = (
    <>
      <div className="flex items-center gap-1">
        <Button size="small" appearance="subtle" icon={<ChevronLeft16Regular className="rtl:-scale-x-100" />} aria-label={text.prev} title={text.prev} onClick={() => step(-1)} />
        <span className="min-w-16 text-center text-body1 font-semibold tabular-nums" aria-live="polite">
          {nameOf(def)}
        </span>
        <Button size="small" appearance="subtle" icon={<ChevronRight16Regular className="rtl:-scale-x-100" />} aria-label={text.next} title={text.next} onClick={() => step(1)} />
      </div>
      {numeralToggle}
      {replay}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        size="small"
        appearance="subtle"
        aria-label={text.status}
        value={def.id}
        onValueChange={(next) => next && setIndex(STATUSES.findIndex((s) => s.id === next))}
        className="flex-wrap"
      >
        {STATUSES.map((s) => (
          <ToggleGroupItem key={s.id} value={s.id} className="tabular-nums">
            {nameOf(s)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {numeralToggle}
        <Switch label={text.reduce} checked={reduced} onCheckedChange={setReduced} />
        {replay}
      </div>
      <LabStage name={copy.title} note={copy.when} controls={controls}>
        <StatusFrame key={`${def.id}-${run}`} def={def} numerals={numerals} reduced={reduced} run={run} text={text} />
      </LabStage>
    </div>
  );
}
