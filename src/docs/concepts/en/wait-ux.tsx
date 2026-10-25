import * as React from "react";
import type { ReactNode } from "react";
import { ArrowRight16Regular, CloudOff24Regular, Star20Filled, Star20Regular } from "@fluentui/react-icons";
import {
  Avatar,
  ProgressBar,
  Spinner,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import { ErrorState, LoadingOverlay, useOptimisticList, useSpinDelay } from "@/components/ui/Loading/Loading";
import { Skeleton, SkeletonItem, SkeletonList, SkeletonText } from "@/components/ui/Skeleton/Skeleton";
import { cn } from "@/lib/cn";
import { DocSection, DoDont, PropsTable } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

/* ------------------------------------------------------------------ helpers */

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold whitespace-nowrap text-foreground-1" : "px-4 py-3 text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-center gap-4 rounded-2xlarge border border-stroke-2 bg-background-2 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 basis-56 flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <span className="text-caption1 font-semibold text-foreground-3">{title}</span>
      {children}
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <ToggleGroup type="single" size="small" aria-label={label} value={value} onValueChange={(next) => next && onChange(next as T)}>
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/* --------------------------------------------------------------- thresholds */

type Tier = "instant" | "subtle" | "skeleton" | "progress" | "background";

const SCENARIOS = [
  { value: "80", label: "80ms" },
  { value: "600", label: "600ms" },
  { value: "2000", label: "2s" },
  { value: "6000", label: "6s" },
  { value: "12000", label: "12s" },
];

function tierOf(ms: number): Tier {
  if (ms < 100) return "instant";
  if (ms < 1000) return "subtle";
  if (ms <= 3000) return "skeleton";
  if (ms <= 10000) return "progress";
  return "background";
}

function ThresholdDemo() {
  const [scenario, setScenario] = React.useState("2000");
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<string | null>(null);
  const ms = Number(scenario);
  const tier = tierOf(ms);
  const delayed = useSpinDelay(running);

  React.useEffect(() => {
    if (!running) return;
    const startAt = performance.now();
    const tick = window.setInterval(() => setProgress(Math.min(1, (performance.now() - startAt) / ms)), 100);
    const finish = window.setTimeout(() => {
      setRunning(false);
      setResult(`The report is ready (after ${SCENARIOS.find((s) => s.value === scenario)?.label}).`);
      if (tier === "background") toast({ intent: "success", title: "The report is ready", body: "Open Downloads to view it." });
    }, ms);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(finish);
    };
  }, [running, ms, scenario, tier]);

  function run() {
    if (running) return;
    setResult(null);
    setProgress(0);
    setRunning(true);
    if (tier === "background") {
      toast({
        intent: "info",
        title: "Generating the report in the background",
        body: "You can keep working. We'll let you know when it's done.",
      });
    }
  }

  let waiting: ReactNode = null;
  if (running) {
    if (tier === "skeleton") waiting = delayed ? <SkeletonText lines={3} /> : null;
    if (tier === "progress")
      waiting = (
        <ProgressBar
          value={progress}
          label="Aggregating data from 12 branches"
          description={`${Math.round(progress * 100)}% · about ${Math.max(1, Math.ceil(((1 - progress) * ms) / 1000))}s left`}
        />
      );
    if (tier === "background")
      waiting = (
        <p className="flex items-center gap-2 text-body1 text-foreground-2">
          <Spinner size="extra-tiny" aria-hidden />
          Running in the background. You can leave this page.
        </p>
      );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Choice label="Response time" value={scenario} options={SCENARIOS} onChange={setScenario} />
      </div>
      <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
        <Button appearance="primary" className="self-start" loading={tier === "subtle" && delayed} onClick={run}>
          Generate report
        </Button>
        <div className="flex min-h-16 flex-col justify-center gap-2">
          {waiting}
          <p role="status" className="text-body1 text-foreground-1">
            {!running && result}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ delay */

const DURATIONS = [
  { value: "120", label: "120ms" },
  { value: "350", label: "350ms" },
  { value: "700", label: "700ms" },
  { value: "2000", label: "2s" },
];

/** Measures how long the loader was visible in the latest run. */
function useShownFor(visible: boolean, run: number) {
  const [ms, setMs] = React.useState<number | null>(null);
  const since = React.useRef<number | null>(null);
  React.useEffect(() => setMs(null), [run]);
  React.useEffect(() => {
    if (visible) since.current = performance.now();
    else if (since.current !== null) {
      setMs(Math.round(performance.now() - since.current));
      since.current = null;
    }
  }, [visible]);
  return ms;
}

function DelayCompareDemo() {
  const [duration, setDuration] = React.useState("120");
  const [loading, setLoading] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const delayed = useSpinDelay(loading, { delay: 300, minDuration: 500 });
  const rawShown = useShownFor(loading, run);
  const delayedShown = useShownFor(delayed, run);
  const d = Number(duration);

  React.useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), d);
    return () => window.clearTimeout(id);
  }, [loading, d]);

  function start() {
    if (loading) return;
    setRun((n) => n + 1);
    setLoading(true);
  }

  // Illustrative timeline: [start, end] of the visible loader, in ms.
  const scale = Math.max(d, 800) + 200;
  const rows = [
    { label: "Request", from: 0, to: d, className: "bg-background-6" },
    { label: "Immediate", from: 0, to: d, className: "bg-brand-background" },
    { label: "useSpinDelay", from: 300, to: d > 300 ? Math.max(d, 800) : 300, className: "bg-brand-background" },
  ];

  const panels = [
    { title: "Immediate", busy: loading, shown: rawShown },
    { title: "useSpinDelay(300, 500)", busy: delayed, shown: delayedShown },
  ];

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Choice label="Response time" value={duration} options={DURATIONS} onChange={setDuration} />
        <Button appearance="primary" onClick={start}>
          Load data
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {panels.map((panel) => (
          <div key={panel.title} className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <span className="text-caption1 font-semibold text-foreground-3">{panel.title}</span>
            <div className="flex h-16 items-center">
              {panel.busy ? (
                <SkeletonText lines={2} />
              ) : (
                <p className="text-body1 text-foreground-1">{run ? `Data from load ${run}` : "Not loaded"}</p>
              )}
            </div>
            <span className="text-caption1 text-foreground-3">
              {!run || loading || panel.busy
                ? "—"
                : panel.shown === null
                  ? "Loader not shown, no flash"
                  : panel.shown < 300
                    ? `Loader shown for ${panel.shown}ms: a flash`
                    : `Loader shown for ${panel.shown}ms`}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2" aria-hidden>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
            <span className="text-caption1 text-foreground-3">{row.label}</span>
            <div className="relative h-2 rounded-circular bg-background-3">
              {row.to > row.from && (
                <div
                  className={cn("absolute inset-y-0 rounded-circular", row.className)}
                  style={{ insetInlineStart: `${(row.from / scale) * 100}%`, width: `${((row.to - row.from) / scale) * 100}%` }}
                />
              )}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
          <span />
          <div className="flex justify-between text-caption2 text-foreground-4 tabular-nums">
            <span>0</span>
            <span>{scale}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SPIN_DELAY_CODE = `import { useSpinDelay, Spinner } from "@/components/ui";

function Orders({ query }: { query: Query }) {
  const { data, isFetching } = useOrders(query);
  // < 300ms: never shown · once shown: kept for ≥ 500ms
  const showSpinner = useSpinDelay(isFetching, { delay: 300, minDuration: 500 });

  return (
    <section aria-busy={isFetching}>
      {showSpinner && <Spinner size="tiny" label="Updating…" />}
      <OrderTable rows={data} />
    </section>
  );
}`;

/* --------------------------------------------------------------- skeleton */

const PEOPLE = [
  { name: "An Nguyen", role: "Designer" },
  { name: "Binh Tran", role: "Frontend engineer" },
  { name: "Chi Le", role: "Product manager" },
];

function FidelityCompare() {
  return (
    <Stage>
      <Tile title="Real content">
        <ul className="flex flex-col gap-4">
          {PEOPLE.map((p) => (
            <li key={p.name} className="flex items-center gap-3">
              <Avatar name={p.name} size={40} color="colorful" />
              <div className="flex flex-col">
                <span className="text-body1 font-semibold text-foreground-1">{p.name}</span>
                <span className="text-caption1 text-foreground-3">{p.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </Tile>
      <Tile title="Do: match the layout">
        <SkeletonList rows={3} />
      </Tile>
      <Tile title="Don't: generic blocks">
        <Skeleton className="gap-3">
          <SkeletonItem size={64} />
          <SkeletonItem size={64} className="w-4/5" />
        </Skeleton>
      </Tile>
    </Stage>
  );
}

/* -------------------------------------------------------------- optimistic */

type Photo = { id: string; title: string; starred: boolean };

function StarDemo() {
  const [fail, setFail] = React.useState(false);
  const { items, mutate } = useOptimisticList<Photo>([
    { id: "a", title: "Xuan Huong Lake at dawn", starred: false },
    { id: "b", title: "Cau Dat tea hills", starred: true },
    { id: "c", title: "Cherry blossoms on the slope", starred: false },
  ]);

  const toggle = (id: string) =>
    mutate(
      (list) => list.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
      () =>
        new Promise((resolve, reject) =>
          window.setTimeout(() => (fail ? reject(new Error("Connection lost")) : resolve(null)), 1200),
        ),
      { errorTitle: "Couldn't star the photo" },
    );

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Switch label="Simulate a network error" checked={fail} onCheckedChange={setFail} />
      <ul className="flex flex-col rounded-xlarge border border-stroke-2 bg-background-1">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 border-b border-stroke-2 py-1 ps-4 pe-2 last:border-b-0">
            <span className="text-body1 text-foreground-1">{p.title}</span>
            <Button
              appearance="subtle"
              aria-pressed={p.starred}
              aria-label={`Star “${p.title}”`}
              icon={p.starred ? <Star20Filled className="text-marigold-active" /> : <Star20Regular />}
              onClick={() => toggle(p.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const OPTIMISTIC_CODE = `import { useOptimisticList } from "@/components/ui";

const { items, mutate, pending } = useOptimisticList<Photo>(initialPhotos);

// 1. update is applied to the UI at once; write it by id, not by position
// 2. commit runs in the background; on error only this change is rolled back and a toast with a retry button appears
const ok = await mutate(
  (list) => list.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
  () => api.photos.star(id),
  { errorTitle: "Couldn't star the photo" },
);`;

/* ------------------------------------------------------------------ cancel */

type ExportState = "idle" | "running" | "done" | "cancelled" | "timeout";

/** Simulated task that can be cancelled with an AbortSignal. */
function fakeExport(signal: AbortSignal, ms: number, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const startAt = performance.now();
    const tick = window.setInterval(() => {
      const value = Math.min(1, (performance.now() - startAt) / ms);
      onProgress(value);
      if (value >= 1) {
        window.clearInterval(tick);
        resolve();
      }
    }, 100);
    signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(tick);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function CancelDemo() {
  const [state, setState] = React.useState<ExportState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [limit, setLimit] = React.useState(false);
  const controller = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => controller.current?.abort(), []);

  async function start() {
    const ctrl = new AbortController();
    controller.current = ctrl;
    const timer = limit ? window.setTimeout(() => ctrl.abort(new DOMException("Timed out", "TimeoutError")), 3000) : 0;
    setProgress(0);
    setState("running");
    try {
      await fakeExport(ctrl.signal, 6000, setProgress);
      setState("done");
    } catch (error) {
      setState(error instanceof DOMException && error.name === "TimeoutError" ? "timeout" : "cancelled");
    } finally {
      window.clearTimeout(timer);
    }
  }

  const message: Record<ExportState, string> = {
    idle: "Export 12,480 orders to a CSV file (about 6 seconds).",
    running: `Exporting… ${Math.round(progress * 100)}%`,
    done: "Export finished. The file is downloading.",
    cancelled: "Cancelled. No file was created.",
    timeout: "Not finished after 3 seconds, so it was stopped. Try again, or export in the background and get notified when it's done.",
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <Switch label="Limit the wait to 3 seconds" checked={limit} onCheckedChange={setLimit} disabled={state === "running"} />
      <ProgressBar value={state === "running" || state === "done" ? progress : 0} label="Data export" description={message[state]} />
      <div className="flex gap-2">
        {state === "running" ? (
          <Button onClick={() => controller.current?.abort(new DOMException("Cancelled by the user", "AbortError"))}>Cancel</Button>
        ) : (
          <Button appearance="primary" onClick={start}>
            {state === "idle" ? "Export CSV" : "Export again"}
          </Button>
        )}
      </div>
    </div>
  );
}

const CANCEL_CODE = `useEffect(() => {
  const controller = new AbortController();
  // Cancel when the user leaves the screen or changes the filter, and stop on its own after 10 seconds.
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]);

  fetch(\`/api/orders?q=\${query}\`, { signal })
    .then((res) => res.json())
    .then(setOrders)
    .catch((error) => {
      if (error.name === "AbortError") return;            // cancelled on purpose: stay silent
      if (error.name === "TimeoutError") setStatus("timeout"); // say that it took too long
      else setStatus("error");
    });

  return () => controller.abort();
}, [query]);`;

/* ------------------------------------------------------------------ errors */

function RetryOnceDemo() {
  const attempts = React.useRef(0);
  const [status, setStatus] = React.useState<"error" | "success">("error");

  const retry = () =>
    new Promise<void>((resolve) => {
      attempts.current += 1;
      window.setTimeout(() => {
        if (attempts.current >= 2) setStatus("success");
        else toast({ intent: "error", title: "Still can't connect", body: "The next attempt will succeed. Try once more.", timeout: -1 });
        resolve();
      }, 1200);
    });

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-subtitle2 font-semibold text-foreground-1">Loaded 24 comments</p>
        <Button
          onClick={() => {
            attempts.current = 0;
            setStatus("error");
          }}
        >
          Show the error state again
        </Button>
      </div>
    );
  }

  return (
    <ErrorState
      icon={<CloudOff24Regular />}
      title="Connection lost"
      description="Couldn't load the comments. The post itself is still readable."
      onRetry={retry}
      secondaryAction={<Button appearance="subtle">Report a problem</Button>}
    />
  );
}

const RETRY_CODE = `// Automatic retry for transient errors (network, 5xx, 429), with backoff and a limit.
async function withRetry<T>(task: () => Promise<T>, { retries = 3, base = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries || !isTransient(error)) throw error;
      const wait = base * 2 ** attempt * (0.5 + Math.random()); // 500 → 1000 → 2000ms, with jitter
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// Automatic retries used up → hand control to the user
<AsyncContent status={status} onRetry={reload} skeleton={<SkeletonList rows={5} />}>
  {() => <MemberList members={data!} />}
</AsyncContent>`;

/* -------------------------------------------------------------------- a11y */

const A11Y_CODE = `{/* 1. Loading region: aria-busy so assistive technology waits for the update before reading */}
<section aria-busy={isLoading}>…</section>

{/* 2. Announce in words when the wait is long enough to show a loader (LoadingOverlay and AsyncContent do this) */}
const { announce } = useAnnounce();
announce("Loading orders…");
announce(\`Loaded \${count} orders\`, { batchId: "orders" });

{/* 3. A busy button keeps focus: aria-busy + aria-disabled, not disabled */}
<Button appearance="primary" loading={saving} loadingText="Saving…">Save</Button>

{/* 4. An error after an action the user is waiting on: role="alert" */}
<ErrorState variant="alert" onRetry={retry} />`;

/* -------------------------------------------------------------------- page */

export default function Page() {
  return (
    <>
      <DocSection
        id="thresholds"
        title="Perception thresholds"
        description="Users don't measure milliseconds; they perceive time. Each duration needs its own kind of signal. A strong signal for a fast task is as bad as silence for a slow one."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Duration", "How it feels", "What to show", "In Yugen"]}
            rows={[
              ["< 100ms", "Instant, like flipping a switch.", "Nothing; show the result directly.", "Hover / pressed states of controls."],
              ["100ms – 1s", "A delay, but the train of thought holds.", "No loader, or a light in-place signal (after a delay).", <C key="a">useSpinDelay</C>],
              ["1 – 3s", "The wait becomes noticeable.", "An in-place spinner, or a skeleton if the layout is known.", <C key="a">Button loading · AsyncContent · Skeleton presets</C>],
              ["3 – 10s", "Attention starts to drift.", "Determinate progress, plus what is happening and how long is left; allow cancel.", <C key="a">ProgressBar · PageProgress value</C>],
              ["> 10s", "The user moves on to something else.", "Run in the background, let them leave, notify when done.", <C key="a">toast · useAnnounce</C>],
            ]}
          />
          <Stage>
            <ThresholdDemo />
          </Stage>
          <P>
            Pick a duration and press “Generate report”. At 80ms the result appears at once; at 600ms there is only a small spinner in the
            button (shown after 300ms); at 2s a skeleton; at 6s a progress bar with the time left; at 12s the work moves to the background and
            a toast reports when it is done.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="decision"
        title="Choose an indicator"
        description="Go from the top and stop at the first “yes”. The options can be combined: Button loading for the button just pressed, PageProgress for the page that is loading."
      >
        <ol className="flex max-w-3xl flex-col gap-2">
          {[
            ["Does the action almost always succeed, and can it be undone (like, check off a task, rename)?", "Optimistic UI", "useOptimisticList"],
            ["Do you know the real progress (bytes sent, steps completed)?", "Determinate progress", "ProgressBar · PageProgress value"],
            ["Is a page navigation or an app-wide background load in progress?", "Top edge bar", "PageProgress · pageProgress.start()"],
            ["Do you know the layout of the content that is coming (list, cards, table)?", "Skeleton", "AsyncContent + Skeleton presets"],
            ["Is the wait tied to a control that was just pressed?", "In-place loading", "Button loading"],
            ["Anything else", "Spinner + label, after a delay", "LoadingOverlay · Spinner + useSpinDelay"],
          ].map(([question, answer, tool], i, all) => (
            <li key={question} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-circular bg-background-4 text-caption1 font-semibold text-foreground-1">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 px-4 py-3">
                <span className="text-body1 font-semibold text-foreground-1">{question}</span>
                <span className="flex flex-wrap items-center gap-2 text-body1 text-foreground-2">
                  {i < all.length - 1 && <span className="text-caption1 font-semibold text-success-foreground-1">Yes</span>}
                  <ArrowRight16Regular aria-hidden className="shrink-0 text-foreground-3 rtl:-scale-x-100" />
                  <span className="font-semibold text-foreground-1">{answer}</span>
                  <C>{tool}</C>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection
        id="delay"
        title="Delay & minimum duration"
        description="The two most common loader bugs: it flashes on and off for fast responses, and it flickers when the data arrives just after the loader appears. useSpinDelay fixes both."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <DelayCompareDemo />
          </Stage>
          <P>
            At 120ms, the left column flashes the skeleton for an instant: the eye sees that something jumped but has no time to read it. At
            350ms, the right column waits 300ms before it shows and then <strong className="font-semibold">stays for the full 500ms</strong>,
            so although the data arrives at 350ms, the user sees one complete transition instead of a blink. From 700ms up, both columns show
            the loader, but the right one never shows it for less than 500ms.
          </P>
          <PropsTable
            props={[
              { name: "loading", type: "boolean", description: "The actual (raw) loading state." },
              { name: "delay", type: "number", defaultValue: "300", description: "If the response arrives before this, the loader never shows." },
              { name: "minDuration", type: "number", defaultValue: "500", description: "Once the loader shows, it stays at least this long." },
              { name: "(returns)", type: "boolean", description: "true when the loader should be rendered." },
            ]}
          />
          <CodeBlock code={SPIN_DELAY_CODE} />
          <P>
            While the delay runs, keep the previous UI in place instead of replacing it with an empty area. <C>AsyncContent</C> does this for
            you, and <C>LoadingOverlay</C> takes a <C>delay</C> so it only covers the old content when the refresh is actually slow.
          </P>
          <Stage>
            <LoadingOverlay loading label="Updating…" className="w-72 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <p className="text-caption1 text-foreground-3">October revenue</p>
              <p className="text-title2 font-semibold text-foreground-1">₫128.4M</p>
              <p className="text-caption1 text-foreground-3">Up 12% from last month</p>
            </LoadingOverlay>
          </Stage>
        </div>
      </DocSection>

      <DocSection
        id="skeleton"
        title="Skeleton fidelity"
        description="A skeleton promises the layout that is coming. If the promise is wrong (a different column count, a bigger avatar, a button somewhere else), everything jumps when the content arrives, which is worse than no skeleton at all."
      >
        <div className="flex flex-col gap-4">
          <FidelityCompare />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Same shape and size: a 40px avatar gets a 40px SkeletonAvatar; 44px table rows get a SkeletonTable with 44px rows.</li>
            <li>Roughly the same count: 3–5 rows are enough. Don&apos;t draw 50 rows for a list that usually has 8 items.</li>
            <li>Only stand in for what is missing. Show the page title, column labels and navigation buttons you already know right away.</li>
            <li>Don&apos;t put a spinner on top of a skeleton. Use one or the other.</li>
            <li>Under 300ms no skeleton is needed: let AsyncContent / useSpinDelay skip it.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="optimistic"
        title="Optimistic UI & undo"
        description="For actions that almost always succeed, don't make the user wait for the server. Change the UI at once, send the request in the background, and roll back only if it fails, with an explanation."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <StarDemo />
          </Stage>
          <P>
            Turn on “Simulate a network error” and star a few photos in a row. The star changes at once; after 1.2 seconds each failed change
            is rolled back on its own (the other changes stay), and a toast that does not close by itself explains what happened and offers a
            retry button.
          </P>
          <CodeBlock code={OPTIMISTIC_CODE} />
          <SimpleTable
            head={["Good fit for optimistic UI", "Must wait for the server"]}
            rows={[
              ["Like, star, check off a to-do", "Payments, money transfers, bookings"],
              ["Reorder, rename, tag", "Permanent delete, actions that can't be undone"],
              ["Send a comment or message (show “sending”)", "Results the server decides (stock checks, authentication)"],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="cancel"
        title="Cancel & timeout"
        description="A long wait must be cancelable and must not go on forever. When the user cancels, stay silent; on a timeout, say that it took too long and offer a next step."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <CancelDemo />
          </Stage>
          <CodeBlock code={CANCEL_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>From about 3 seconds up, always put a Cancel button next to the progress indicator.</li>
            <li>Cancel the old request when the user changes a filter or keeps typing, so a late result never overwrites a newer one.</li>
            <li>
              A timeout is its own state, not an “unknown error”: suggest trying again or running in the background. <C>AbortSignal.any</C> and{" "}
              <C>AbortSignal.timeout</C> have been available in all evergreen browsers since 2024.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="Errors & retry"
        description="Any wait can end in an error. A good error state answers three questions: what happened, whether any data was lost, and what to do next."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <div className="w-full max-w-md rounded-xlarge border border-stroke-2 bg-background-1">
              <RetryOnceDemo />
            </div>
          </Stage>
          <P>
            The retry button, labelled “Thử lại” (Retry) by default, takes a Promise and goes into its loading state by itself; focus
            stays on the button the whole time. The first retry still fails (a toast explains why), the second one succeeds.
          </P>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Keep the old data when a refresh fails, and report the error with a toast or MessageBar instead of clearing the screen.</li>
            <li>Retry transient errors automatically 2–3 times with backoff and jitter; show ErrorState only after the retries run out.</li>
            <li>Keep the error inside the broken area. One failing widget should not take down the whole page.</li>
            <li>Write the title in the user&apos;s language; technical error codes (if needed) go in the description or behind “Report a problem”.</li>
          </ul>
          <CodeBlock code={RETRY_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Accessibility"
        description="Screen reader users don't see a spinner turning. The wait has to be announced, briefly and at the right moment, and must never take focus away."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Principle", "How", "Built into"]}
            rows={[
              ["Mark the busy region", <span key="a">Set <C>aria-busy=&quot;true&quot;</C> on the region being updated and remove it when done.</span>, "LoadingOverlay, AsyncContent, Skeleton"],
              ["Announce waits that last", "A polite announcement, “Đang tải…” (Loading…), when the loader actually shows (after the delay); nothing for fast responses.", "LoadingOverlay, AsyncContent (useAnnounce)"],
              ["Read errors right away", <span key="a"><C>role=&quot;alert&quot;</C> for an error after an action the user is waiting on.</span>, "ErrorState variant=\"alert\" (the default in AsyncContent)"],
              ["Don't move focus", "A busy button stays focusable (aria-disabled, not disabled); when content is replaced, focus stays in the region.", "Button loading, AsyncContent"],
              ["Respect reduced motion", "No shimmer, no width animation and no fade with prefers-reduced-motion.", "Skeleton, PageProgress, LoadingOverlay"],
            ]}
          />
          <CodeBlock code={A11Y_CODE} />
          <P>
            A progress bar only exposes <C>aria-valuenow</C> when the progress is real. In trickle (estimated) mode, PageProgress leaves the
            value empty so screen readers don&apos;t read out a made-up number.
          </P>
        </div>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Pick the signal by the expected wait: nothing · in place · skeleton · progress · background.",
            "Wrap every loader in useSpinDelay (300ms / 500ms).",
            "Keep the old content and the layout still while waiting.",
            "Let users cancel long waits, set a timeout, and always offer a way out after an error.",
          ]}
          donts={[
            "Blocking the whole page with an overlay for a local action.",
            "An indeterminate spinner for work whose progress you know.",
            "Rolling back an optimistic change without telling the user.",
            "Moving focus to the loader, or disabling the button that is busy.",
          ]}
        />
      </DocSection>
    </>
  );
}
