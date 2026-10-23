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
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

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
  { value: "2000", label: "2 giây" },
  { value: "6000", label: "6 giây" },
  { value: "12000", label: "12 giây" },
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
      setResult(`Báo cáo đã sẵn sàng (sau ${SCENARIOS.find((s) => s.value === scenario)?.label}).`);
      if (tier === "background") toast({ intent: "success", title: "Báo cáo đã sẵn sàng", body: "Mở mục Tải xuống để xem." });
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
        title: "Đang tạo báo cáo ở chế độ nền",
        body: "Bạn cứ tiếp tục làm việc — chúng tôi sẽ báo khi xong.",
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
          label="Đang tổng hợp dữ liệu 12 chi nhánh"
          description={`${Math.round(progress * 100)}% · còn khoảng ${Math.max(1, Math.ceil(((1 - progress) * ms) / 1000))} giây`}
        />
      );
    if (tier === "background")
      waiting = (
        <p className="flex items-center gap-2 text-body1 text-foreground-2">
          <Spinner size="extra-tiny" aria-hidden />
          Đang chạy nền — bạn có thể rời trang này.
        </p>
      );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Choice label="Thời gian phản hồi" value={scenario} options={SCENARIOS} onChange={setScenario} />
      </div>
      <div className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
        <Button appearance="primary" className="self-start" loading={tier === "subtle" && delayed} onClick={run}>
          Tạo báo cáo
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
  { value: "2000", label: "2 giây" },
];

/** Đo loader hiện bao lâu trong lần chạy gần nhất. */
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

  // Dòng thời gian minh hoạ: [bắt đầu, kết thúc] loader hiện, theo ms.
  const scale = Math.max(d, 800) + 200;
  const rows = [
    { label: "Request", from: 0, to: d, className: "bg-background-6" },
    { label: "Hiện ngay", from: 0, to: d, className: "bg-brand-background" },
    { label: "useSpinDelay", from: 300, to: d > 300 ? Math.max(d, 800) : 300, className: "bg-brand-background" },
  ];

  const panels = [
    { title: "Hiện ngay", busy: loading, shown: rawShown },
    { title: "useSpinDelay(300, 500)", busy: delayed, shown: delayedShown },
  ];

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Choice label="Thời gian phản hồi" value={duration} options={DURATIONS} onChange={setDuration} />
        <Button appearance="primary" onClick={start}>
          Tải dữ liệu
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
                <p className="text-body1 text-foreground-1">{run ? `Dữ liệu lần ${run}` : "Chưa tải"}</p>
              )}
            </div>
            <span className="text-caption1 text-foreground-3">
              {!run || loading || panel.busy
                ? "—"
                : panel.shown === null
                  ? "Loader không hiện — không nháy"
                  : panel.shown < 300
                    ? `Loader hiện ${panel.shown}ms — nháy`
                    : `Loader hiện ${panel.shown}ms`}
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
  // < 300ms: không bao giờ hiện · đã hiện: giữ ≥ 500ms
  const showSpinner = useSpinDelay(isFetching, { delay: 300, minDuration: 500 });

  return (
    <section aria-busy={isFetching}>
      {showSpinner && <Spinner size="tiny" label="Đang cập nhật…" />}
      <OrderTable rows={data} />
    </section>
  );
}`;

/* --------------------------------------------------------------- skeleton */

const PEOPLE = [
  { name: "Nguyễn An", role: "Thiết kế" },
  { name: "Trần Bình", role: "Kỹ sư frontend" },
  { name: "Lê Chi", role: "Quản lý sản phẩm" },
];

function FidelityCompare() {
  return (
    <Stage>
      <Tile title="Nội dung thật">
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
      <Tile title="Nên — khớp bố cục">
        <SkeletonList rows={3} />
      </Tile>
      <Tile title="Không nên — khối chung chung">
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
    { id: "a", title: "Hồ Xuân Hương lúc bình minh", starred: false },
    { id: "b", title: "Đồi chè Cầu Đất", starred: true },
    { id: "c", title: "Mai anh đào trên dốc", starred: false },
  ]);

  const toggle = (id: string) =>
    mutate(
      (list) => list.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
      () =>
        new Promise((resolve, reject) =>
          window.setTimeout(() => (fail ? reject(new Error("Mất kết nối")) : resolve(null)), 1200),
        ),
      { errorTitle: "Không đánh dấu được ảnh" },
    );

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Switch label="Giả lập lỗi mạng" checked={fail} onCheckedChange={setFail} />
      <ul className="flex flex-col rounded-xlarge border border-stroke-2 bg-background-1">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 border-b border-stroke-2 py-1 ps-4 pe-2 last:border-b-0">
            <span className="text-body1 text-foreground-1">{p.title}</span>
            <Button
              appearance="subtle"
              aria-pressed={p.starred}
              aria-label={`Đánh dấu “${p.title}”`}
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

// 1. update áp ngay lên giao diện — viết theo id, không theo vị trí
// 2. commit chạy phía sau; lỗi → chỉ thay đổi này bị gỡ, toast "Thử lại" hiện ra
const ok = await mutate(
  (list) => list.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
  () => api.photos.star(id),
  { errorTitle: "Không đánh dấu được ảnh" },
);`;

/* ------------------------------------------------------------------ cancel */

type ExportState = "idle" | "running" | "done" | "cancelled" | "timeout";

/** Tác vụ giả lập có thể huỷ bằng AbortSignal. */
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
    const timer = limit ? window.setTimeout(() => ctrl.abort(new DOMException("Hết thời gian chờ", "TimeoutError")), 3000) : 0;
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
    idle: "Xuất 12.480 đơn hàng ra tệp CSV (khoảng 6 giây).",
    running: `Đang xuất… ${Math.round(progress * 100)}%`,
    done: "Đã xuất xong — tệp đang được tải xuống.",
    cancelled: "Đã huỷ. Không có tệp nào được tạo.",
    timeout: "Quá 3 giây chưa xong — đã dừng. Thử lại, hoặc xuất ở chế độ nền và nhận thông báo khi xong.",
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <Switch label="Giới hạn thời gian chờ 3 giây" checked={limit} onCheckedChange={setLimit} disabled={state === "running"} />
      <ProgressBar value={state === "running" || state === "done" ? progress : 0} label="Xuất dữ liệu" description={message[state]} />
      <div className="flex gap-2">
        {state === "running" ? (
          <Button onClick={() => controller.current?.abort(new DOMException("Người dùng huỷ", "AbortError"))}>Huỷ</Button>
        ) : (
          <Button appearance="primary" onClick={start}>
            {state === "idle" ? "Xuất CSV" : "Xuất lại"}
          </Button>
        )}
      </div>
    </div>
  );
}

const CANCEL_CODE = `useEffect(() => {
  const controller = new AbortController();
  // Huỷ khi rời màn hình / đổi bộ lọc, và tự dừng nếu quá 10 giây.
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]);

  fetch(\`/api/orders?q=\${query}\`, { signal })
    .then((res) => res.json())
    .then(setOrders)
    .catch((error) => {
      if (error.name === "AbortError") return;            // huỷ chủ động: im lặng
      if (error.name === "TimeoutError") setStatus("timeout"); // nói rõ là quá lâu
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
        else toast({ intent: "error", title: "Vẫn chưa kết nối được", body: "Lần sau sẽ thành công — thử thêm lần nữa.", timeout: -1 });
        resolve();
      }, 1200);
    });

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-subtitle2 font-semibold text-foreground-1">Đã tải 24 bình luận</p>
        <Button
          onClick={() => {
            attempts.current = 0;
            setStatus("error");
          }}
        >
          Xem lại trạng thái lỗi
        </Button>
      </div>
    );
  }

  return (
    <ErrorState
      icon={<CloudOff24Regular />}
      title="Mất kết nối"
      description="Không tải được bình luận. Bài viết vẫn đọc được bình thường."
      onRetry={retry}
      secondaryAction={<Button appearance="subtle">Báo lỗi</Button>}
    />
  );
}

const RETRY_CODE = `// Thử lại tự động cho lỗi tạm thời (mạng, 5xx, 429) — lùi dần và có giới hạn.
async function withRetry<T>(task: () => Promise<T>, { retries = 3, base = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries || !isTransient(error)) throw error;
      const wait = base * 2 ** attempt * (0.5 + Math.random()); // 500 → 1000 → 2000ms, có jitter
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// Hết lượt tự động → trao quyền cho người dùng
<AsyncContent status={status} onRetry={reload} skeleton={<SkeletonList rows={5} />}>
  {() => <MemberList members={data!} />}
</AsyncContent>`;

/* -------------------------------------------------------------------- a11y */

const A11Y_CODE = `{/* 1. Vùng đang tải: aria-busy để công nghệ hỗ trợ chờ cập nhật xong mới đọc */}
<section aria-busy={isLoading}>…</section>

{/* 2. Nói bằng lời khi chờ đủ lâu để thấy loader (LoadingOverlay, AsyncContent tự làm) */}
const { announce } = useAnnounce();
announce("Đang tải đơn hàng…");
announce(\`Đã tải \${count} đơn hàng\`, { batchId: "orders" });

{/* 3. Nút đang xử lý vẫn giữ focus: aria-busy + aria-disabled, không dùng disabled */}
<Button appearance="primary" loading={saving} loadingText="Đang lưu…">Lưu</Button>

{/* 4. Lỗi sau thao tác người dùng đang chờ: role="alert" */}
<ErrorState variant="alert" onRetry={retry} />`;

/* -------------------------------------------------------------------- page */

export default function Page() {
  return (
    <>
      <DocSection
        id="thresholds"
        title="Ngưỡng cảm nhận"
        description="Người dùng không đo mili-giây, họ cảm nhận. Mỗi khoảng thời gian cần một loại tín hiệu khác nhau — tín hiệu quá mạnh cho việc nhanh cũng tệ như im lặng cho việc chậm."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Thời gian", "Cảm nhận", "Nên hiển thị", "Trong Yugen"]}
            rows={[
              ["< 100ms", "Tức thì — như bấm công tắc.", "Không gì cả; cập nhật thẳng kết quả.", "Trạng thái hover / pressed của control."],
              ["100ms – 1s", "Có độ trễ nhưng dòng suy nghĩ không đứt.", "Không loader, hoặc tín hiệu nhẹ tại chỗ (sau delay).", <C key="a">useSpinDelay</C>],
              ["1 – 3s", "Bắt đầu thấy chờ.", "Spinner tại chỗ hoặc khung xương nếu biết bố cục.", <C key="a">Button loading · AsyncContent · Skeleton presets</C>],
              ["3 – 10s", "Sự chú ý bắt đầu trôi.", "Tiến trình xác định + giải thích đang làm gì, còn bao lâu; cho huỷ.", <C key="a">ProgressBar · PageProgress value</C>],
              ["> 10s", "Người dùng sẽ làm việc khác.", "Chạy nền, cho rời đi, báo khi xong.", <C key="a">toast · useAnnounce</C>],
            ]}
          />
          <Stage>
            <ThresholdDemo />
          </Stage>
          <P>
            Chọn từng mốc rồi bấm “Tạo báo cáo”: 80ms ra kết quả ngay; 600ms chỉ có spinner nhỏ trong nút (hiện sau 300ms); 2 giây có
            khung xương; 6 giây có thanh tiến trình kèm thời gian còn lại; 12 giây chuyển sang chạy nền và báo bằng toast khi xong.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="decision"
        title="Chọn loại chỉ báo"
        description="Đi từ trên xuống, dừng ở câu trả lời “có” đầu tiên. Các lựa chọn kết hợp được: Button loading cho nút vừa bấm, PageProgress cho trang đang tải."
      >
        <ol className="flex max-w-3xl flex-col gap-2">
          {[
            ["Thao tác gần như luôn thành công và hoàn tác được (thích, tích việc, đổi tên)?", "Optimistic UI", "useOptimisticList"],
            ["Biết tiến độ thật (byte đã gửi, số bước đã xong)?", "Tiến trình xác định", "ProgressBar · PageProgress value"],
            ["Đang chuyển trang hoặc tải nền toàn ứng dụng?", "Thanh mép trên", "PageProgress · pageProgress.start()"],
            ["Biết trước bố cục nội dung sắp hiện (danh sách, thẻ, bảng)?", "Khung xương", "AsyncContent + Skeleton presets"],
            ["Việc chờ gắn với một control vừa bấm?", "Loading tại chỗ", "Button loading"],
            ["Còn lại", "Spinner + nhãn, sau delay", "LoadingOverlay · Spinner + useSpinDelay"],
          ].map(([question, answer, tool], i, all) => (
            <li key={question} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-circular bg-background-4 text-caption1 font-semibold text-foreground-1">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 px-4 py-3">
                <span className="text-body1 font-semibold text-foreground-1">{question}</span>
                <span className="flex flex-wrap items-center gap-2 text-body1 text-foreground-2">
                  {i < all.length - 1 && <span className="text-caption1 font-semibold text-success-foreground-1">Có</span>}
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
        title="Delay & thời gian tối thiểu"
        description="Hai lỗi phổ biến nhất của loader: nháy lên rồi tắt ngay với phản hồi nhanh, và chập chờn khi dữ liệu về ngay sau lúc loader vừa hiện. useSpinDelay sửa cả hai."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <DelayCompareDemo />
          </Stage>
          <P>
            Với 120ms, cột trái nháy khung xương một thoáng — mắt thấy “có gì đó vừa giật” mà không kịp đọc. Với 350ms, cột phải đợi
            300ms mới hiện rồi <strong className="font-semibold">giữ đủ 500ms</strong>, nên dù dữ liệu về ở 350ms, người dùng thấy một
            chuyển động trọn vẹn thay vì một cái chớp. Từ 700ms trở lên, cả hai cột đều hiện loader — nhưng cột phải không bao giờ dưới
            500ms.
          </P>
          <PropsTable
            props={[
              { name: "loading", type: "boolean", description: "Trạng thái tải thật (thô)." },
              { name: "delay", type: "number", defaultValue: "300", description: "Phản hồi về trước mốc này → loader không bao giờ hiện." },
              { name: "minDuration", type: "number", defaultValue: "500", description: "Loader đã hiện thì giữ ít nhất chừng này." },
              { name: "(trả về)", type: "boolean", description: "true khi nên vẽ loader." },
            ]}
          />
          <CodeBlock code={SPIN_DELAY_CODE} />
          <P>
            Trong lúc chờ delay, giữ nguyên giao diện trước đó — đừng thay bằng vùng trống. <C>AsyncContent</C> làm sẵn việc này; và{" "}
            <C>LoadingOverlay</C> nhận <C>delay</C> để phủ lên nội dung cũ chỉ khi việc làm mới thật sự chậm.
          </P>
          <Stage>
            <LoadingOverlay loading label="Đang cập nhật…" className="w-72 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <p className="text-caption1 text-foreground-3">Doanh thu tháng 10</p>
              <p className="text-title2 font-semibold text-foreground-1">128,4 triệu ₫</p>
              <p className="text-caption1 text-foreground-3">Tăng 12% so với tháng trước</p>
            </LoadingOverlay>
          </Stage>
        </div>
      </DocSection>

      <DocSection
        id="skeleton"
        title="Độ trung thực của khung xương"
        description="Khung xương hứa hẹn bố cục sắp tới. Hứa sai — số cột khác, avatar to hơn, nút nằm chỗ khác — thì lúc nội dung về mọi thứ nhảy chỗ, tệ hơn cả không có khung."
      >
        <div className="flex flex-col gap-4">
          <FidelityCompare />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Cùng hình dáng và kích thước: avatar 40 thì SkeletonAvatar 40; dòng bảng 44px thì SkeletonTable cũng 44px.</li>
            <li>Cùng số lượng gần đúng: 3–5 dòng là đủ, đừng vẽ 50 dòng cho danh sách thường có 8 mục.</li>
            <li>Chỉ dựng phần chưa có; tiêu đề trang, nhãn cột, nút điều hướng đã biết thì hiển thị thật ngay.</li>
            <li>Không chồng spinner lên khung xương — chọn một trong hai.</li>
            <li>Dưới 300ms không cần khung xương: để AsyncContent / useSpinDelay bỏ qua.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="optimistic"
        title="Optimistic UI & hoàn tác"
        description="Với thao tác gần như luôn thành công, đừng bắt người dùng chờ server: đổi giao diện ngay, gửi phía sau, và chỉ quay lại khi thất bại — kèm lời giải thích."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <StarDemo />
          </Stage>
          <P>
            Bật “Giả lập lỗi mạng” rồi đánh dấu vài ảnh liên tiếp: ngôi sao đổi ngay, sau 1,2 giây từng thay đổi lỗi bị gỡ riêng (các
            thay đổi khác vẫn giữ) và một toast không tự đóng giải thích chuyện gì đã xảy ra, kèm nút Thử lại.
          </P>
          <CodeBlock code={OPTIMISTIC_CODE} />
          <SimpleTable
            head={["Hợp với optimistic", "Phải chờ server"]}
            rows={[
              ["Thích, đánh dấu sao, tích việc cần làm", "Thanh toán, chuyển tiền, đặt chỗ"],
              ["Sắp xếp lại, đổi tên, gắn nhãn", "Xoá vĩnh viễn, thao tác không hoàn tác được"],
              ["Gửi bình luận, tin nhắn (hiện “đang gửi”)", "Kết quả do server quyết định (kiểm tra tồn kho, xác thực)"],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="cancel"
        title="Huỷ & timeout"
        description="Việc chờ dài phải huỷ được, và không được chờ vô hạn. Huỷ chủ động thì im lặng; quá thời gian thì nói rõ là quá lâu, kèm lựa chọn tiếp theo."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <CancelDemo />
          </Stage>
          <CodeBlock code={CANCEL_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Từ khoảng 3 giây trở lên, luôn có nút Huỷ cạnh chỉ báo tiến trình.</li>
            <li>Huỷ request cũ khi người dùng đổi bộ lọc / gõ tiếp — kết quả về muộn không được ghi đè kết quả mới.</li>
            <li>
              Timeout là một trạng thái riêng, không phải “lỗi không rõ”: gợi ý thử lại hoặc chạy nền. <C>AbortSignal.any</C> và{" "}
              <C>AbortSignal.timeout</C> có trên mọi trình duyệt evergreen từ 2024.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="Lỗi & thử lại"
        description="Mọi trạng thái chờ đều có thể kết thúc bằng lỗi. Một trạng thái lỗi tốt trả lời ba câu: chuyện gì đã xảy ra, dữ liệu có mất không, và làm gì tiếp theo."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <div className="w-full max-w-md rounded-xlarge border border-stroke-2 bg-background-1">
              <RetryOnceDemo />
            </div>
          </Stage>
          <P>
            Nút Thử lại nhận Promise và tự vào trạng thái loading — focus nằm yên trên nút suốt lúc thử. Lần đầu vẫn lỗi (toast giải
            thích), lần hai thành công.
          </P>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Giữ lại dữ liệu cũ khi làm mới thất bại; báo lỗi bằng toast hoặc MessageBar thay vì xoá trắng màn hình.</li>
            <li>Tự thử lại 2–3 lần với lùi dần (backoff + jitter) cho lỗi tạm thời; hết lượt mới hiện ErrorState.</li>
            <li>Lỗi khu trú tại vùng hỏng — một widget lỗi không kéo sập cả trang.</li>
            <li>Tiêu đề bằng ngôn ngữ người dùng; mã lỗi kỹ thuật (nếu cần) để ở mô tả hoặc trong “Báo lỗi”.</li>
          </ul>
          <CodeBlock code={RETRY_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Khả năng tiếp cận"
        description="Người dùng trình đọc màn hình không thấy spinner quay. Trạng thái chờ phải được nói ra — vừa đủ, đúng lúc — và không bao giờ được cướp focus."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Nguyên tắc", "Cách làm", "Có sẵn trong"]}
            rows={[
              ["Đánh dấu vùng bận", <span key="a">Đặt <C>aria-busy=&quot;true&quot;</C> lên vùng đang cập nhật, bỏ khi xong.</span>, "LoadingOverlay, AsyncContent, Skeleton"],
              ["Nói khi chờ đủ lâu", "Thông báo polite “Đang tải…” khi loader thực sự hiện (sau delay), không thông báo cho phản hồi nhanh.", "LoadingOverlay, AsyncContent (useAnnounce)"],
              ["Lỗi được đọc ngay", <span key="a"><C>role=&quot;alert&quot;</C> cho lỗi sau thao tác người dùng đang chờ.</span>, "ErrorState variant=\"alert\" (mặc định trong AsyncContent)"],
              ["Không di chuyển focus", "Nút đang xử lý vẫn focus được (aria-disabled, không disabled); nội dung bị thay thì focus ở lại vùng.", "Button loading, AsyncContent"],
              ["Tôn trọng giảm chuyển động", "Không shimmer, không chạy độ rộng, không fade khi prefers-reduced-motion.", "Skeleton, PageProgress, LoadingOverlay"],
            ]}
          />
          <CodeBlock code={A11Y_CODE} />
          <P>
            Thanh tiến trình chỉ công bố <C>aria-valuenow</C> khi tiến độ là thật; ở chế độ trickle (ước lượng) PageProgress để trống
            giá trị để trình đọc màn hình không đọc con số bịa.
          </P>
        </div>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Chọn tín hiệu theo thời gian chờ dự kiến: không gì · tại chỗ · khung xương · tiến trình · chạy nền.",
            "Bọc mọi loader bằng useSpinDelay (300ms / 500ms).",
            "Giữ nội dung cũ và bố cục đứng yên trong lúc chờ.",
            "Cho huỷ việc chờ dài, đặt timeout, và luôn có lối thoát khi lỗi.",
          ]}
          donts={[
            "Không chặn cả trang bằng overlay cho một thao tác cục bộ.",
            "Không dùng spinner vô hạn cho việc biết được tiến độ.",
            "Không tự hoàn tác thay đổi optimistic mà không báo.",
            "Không chuyển focus vào loader, không disable nút đang xử lý.",
          ]}
        />
      </DocSection>
    </>
  );
}
