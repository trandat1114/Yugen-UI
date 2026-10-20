import { lazy, Suspense, useEffect, useState, type ComponentType, type FormEvent, type LazyExoticComponent } from "react";
import {
  ArrowClockwise20Regular,
  ArrowSync20Regular,
  CloudOff24Regular,
  Delete20Regular,
  Heart20Filled,
  Heart20Regular,
  Search24Regular,
  Send20Regular,
} from "@fluentui/react-icons";
import {
  Avatar,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Spinner,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import {
  AsyncContent,
  createPageProgress,
  ErrorState,
  LoadingOverlay,
  PageProgress,
  PageProgressFallback,
  useOptimisticList,
  useSpinDelay,
  type AsyncStatus,
} from "@/components/ui/Loading/Loading";
import { SkeletonAvatar, SkeletonCard, SkeletonList, SkeletonTable, SkeletonText } from "@/components/ui/Skeleton/Skeleton";
import type { ComponentDoc } from "../types";
import RAW from "./labs-wait.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa dấu `#region <tên>` và `#endregion`), nên luôn trùng từng
 * ký tự với component / JSX mà `render` hiển thị. Ví dụ có trạng thái = toàn bộ mã nguồn component demo
 * (kèm phần giả lập mạng dùng chung).
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}` || line.trim() === `{/* #region ${name} */}`);
      const end = LINES.findIndex((line, i) => i > start && (line.trim() === "// #endregion" || line.trim() === "{/* #endregion */}"));
      if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
      const block = LINES.slice(start + 1, end);
      const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length));
      return block
        .map((line) => line.slice(indent))
        .join("\n")
        .trim();
    })
    .join("\n\n");
}

// #region network
type Network = "fast" | "slow" | "error";

/** Giả lập request: nhanh 150ms · chậm 2s · lỗi sau 1,2s. */
function fakeRequest<T>(network: Network, value: T): Promise<T> {
  const ms = network === "fast" ? 150 : network === "slow" ? 2000 : 1200;
  return new Promise((resolve, reject) =>
    window.setTimeout(() => (network === "error" ? reject(new Error("Mất kết nối")) : resolve(value)), ms),
  );
}

function NetworkToggle({ value, onChange }: { value: Network; onChange: (value: Network) => void }) {
  return (
    <ToggleGroup
      type="single"
      size="small"
      aria-label="Tốc độ mạng giả lập"
      value={value}
      onValueChange={(next) => next && onChange(next as Network)}
    >
      <ToggleGroupItem value="fast">Nhanh · 150ms</ToggleGroupItem>
      <ToggleGroupItem value="slow">Chậm · 2s</ToggleGroupItem>
      <ToggleGroupItem value="error">Lỗi</ToggleGroupItem>
    </ToggleGroup>
  );
}
// #endregion

/* ------------------------------------------------------------------ loading */

// #region OverlayDemo
const ORDERS = [
  { id: "DH-1024", customer: "Nguyễn An", total: "1.250.000 ₫" },
  { id: "DH-1025", customer: "Trần Bình", total: "860.000 ₫" },
  { id: "DH-1026", customer: "Lê Chi", total: "2.040.000 ₫" },
];

function OverlayDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toLocaleTimeString("vi-VN"));

  async function refresh() {
    if (loading) return;
    setLoading(true);
    try {
      await fakeRequest(network, null);
      setUpdatedAt(new Date().toLocaleTimeString("vi-VN"));
    } catch {
      toast({ intent: "error", title: "Không làm mới được", body: "Đang hiển thị dữ liệu cũ.", timeout: -1 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-M">
      <div className="flex flex-wrap items-center justify-between gap-S">
        <NetworkToggle value={network} onChange={setNetwork} />
        <Button icon={<ArrowClockwise20Regular />} onClick={refresh}>
          Làm mới
        </Button>
      </div>
      <LoadingOverlay
        loading={loading}
        delay={300}
        label="Đang làm mới…"
        className="rounded-xlarge border border-stroke-2 bg-background-1"
      >
        <ul className="flex flex-col">
          {ORDERS.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-M border-b border-stroke-2 px-L py-M">
              <span className="text-body1 text-foreground-1">
                {order.id} · {order.customer}
              </span>
              <span className="text-body1 font-semibold text-foreground-1">{order.total}</span>
            </li>
          ))}
        </ul>
        <p className="px-L py-S text-caption1 text-foreground-3">Cập nhật lúc {updatedAt}</p>
      </LoadingOverlay>
    </div>
  );
}
// #endregion

// #region SpinDelayDemo
function SpinDelayDemo() {
  const [network, setNetwork] = useState<Network>("fast");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const delayed = useSpinDelay(loading, { delay: 300, minDuration: 500 });

  async function load() {
    if (loading) return;
    setLoading(true);
    await fakeRequest(network, null).catch(() => null);
    setLoading(false);
    setCount((n) => n + 1);
  }

  const panels = [
    { title: "Hiện spinner ngay", busy: loading },
    { title: "useSpinDelay", busy: delayed },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-M">
      <div className="flex flex-wrap items-center justify-between gap-S">
        <NetworkToggle value={network} onChange={setNetwork} />
        <Button appearance="primary" onClick={load}>
          Tải
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-M">
        {panels.map((panel) => (
          <div
            key={panel.title}
            className="flex h-28 flex-col items-center justify-center gap-S rounded-xlarge border border-stroke-2 bg-background-1 p-M"
          >
            <span className="text-caption1 font-semibold text-foreground-3">{panel.title}</span>
            {panel.busy ? <Spinner size="small" /> : <span className="text-body1 text-foreground-1">Đã tải {count} lần</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
// #endregion

// #region AutosaveDemo
function AutosaveDemo() {
  const [network, setNetwork] = useState<Network>("fast");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const showSaving = useSpinDelay(saving);

  async function change(next: boolean) {
    setEnabled(next);
    setSaving(true);
    try {
      await fakeRequest(network, next);
      setFailed(false);
    } catch {
      setEnabled(!next);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-M">
      <NetworkToggle value={network} onChange={setNetwork} />
      <div className="flex flex-wrap items-center justify-between gap-M rounded-xlarge border border-stroke-2 bg-background-1 px-L py-S">
        <Switch label="Gửi thông báo qua email" checked={enabled} onCheckedChange={change} />
        <span role="status" className="flex items-center gap-XS text-caption1 text-foreground-3">
          {showSaving ? (
            <>
              <Spinner size="extra-tiny" aria-hidden />
              Đang lưu…
            </>
          ) : failed ? (
            <span className="text-danger-foreground-1">Chưa lưu được, đã hoàn tác</span>
          ) : (
            "Đã lưu"
          )}
        </span>
      </div>
    </div>
  );
}
// #endregion

/* ------------------------------------------------------------- pageprogress */

// #region RouteDemo
const PAGES = ["Tổng quan", "Đơn hàng", "Báo cáo"];

function RouteDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [page, setPage] = useState(PAGES[0]);
  const [navigating, setNavigating] = useState(false);
  const [failed, setFailed] = useState(false);

  async function go(next: string) {
    setNavigating(true);
    setFailed(false);
    try {
      await fakeRequest(network, null);
      setPage(next);
    } catch {
      setFailed(true);
    } finally {
      setNavigating(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-M">
      <NetworkToggle value={network} onChange={setNetwork} />
      <div className="relative overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
        <PageProgress position="absolute" active={navigating} label="Đang chuyển trang" />
        <nav aria-label="Trang mẫu" className="flex gap-XS border-b border-stroke-2 p-S">
          {PAGES.map((name) => (
            <Button
              key={name}
              size="small"
              appearance={name === page ? "secondary" : "subtle"}
              aria-current={name === page ? "page" : undefined}
              onClick={() => go(name)}
            >
              {name}
            </Button>
          ))}
        </nav>
        <div className="flex flex-col gap-XS p-L">
          <h3 className="text-subtitle2 font-semibold text-foreground-1">{page}</h3>
          <p className="text-body1 text-foreground-3">
            {failed
              ? "Không mở được trang — bạn vẫn ở trang cũ, bấm lại để thử."
              : "Nội dung trang cũ ở nguyên chỗ trong lúc trang mới tải."}
          </p>
        </div>
      </div>
    </div>
  );
}
// #endregion

// #region UploadDemo
function UploadDemo() {
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => setValue((v) => Math.min(1, v + 0.08 + Math.random() * 0.12)), 300);
    return () => window.clearInterval(timer);
  }, [uploading]);

  useEffect(() => {
    if (value >= 1) setUploading(false);
  }, [value]);

  function start() {
    setValue(0);
    setUploading(true);
  }

  return (
    <div className="relative flex w-full max-w-sm flex-col items-center gap-S overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 p-XL">
      <PageProgress position="absolute" thickness="large" active={uploading} value={value} label="Đang tải tệp lên" />
      <Button appearance="primary" loading={uploading} loadingText="Đang tải lên…" onClick={start}>
        Tải tệp lên
      </Button>
      <span className="text-caption1 text-foreground-3 tabular-nums">
        {uploading ? `${Math.round(value * 100)}%` : value >= 1 ? "Đã tải xong" : "Chưa có tệp"}
      </span>
    </div>
  );
}
// #endregion

// #region StoreDemo
const syncProgress = createPageProgress();

function StoreDemo() {
  const [network, setNetwork] = useState<Network>("slow");

  async function sync() {
    syncProgress.start();
    try {
      await fakeRequest(network, null);
      toast({ intent: "success", title: "Đã đồng bộ" });
    } catch {
      toast({ intent: "error", title: "Đồng bộ thất bại", body: "Kiểm tra kết nối rồi thử lại.", timeout: -1 });
    } finally {
      syncProgress.done();
    }
  }

  return (
    <div className="flex max-w-sm flex-col items-center gap-M text-center">
      <PageProgress controller={syncProgress} />
      <NetworkToggle value={network} onChange={setNetwork} />
      <Button appearance="primary" icon={<ArrowSync20Regular />} onClick={sync}>
        Đồng bộ
      </Button>
      <p className="text-caption1 text-foreground-3">
        Thanh chạy ở mép trên cửa sổ. Bấm nhiều lần: thanh chỉ hoàn tất khi mọi lần đồng bộ đã xong.
      </p>
    </div>
  );
}
// #endregion

// #region SuspenseDemo
const routeProgress = createPageProgress();

function Article() {
  return (
    <p className="max-w-xs text-center text-body1 text-foreground-2">
      Bài viết đã tải xong. Trong lúc chờ, thanh ở mép trên chạy thay cho spinner giữa trang.
    </p>
  );
}

function SuspenseDemo() {
  const [Page, setPage] = useState<LazyExoticComponent<ComponentType> | null>(null);

  function open() {
    setPage(() =>
      lazy(
        () =>
          new Promise<{ default: ComponentType }>((resolve) =>
            window.setTimeout(() => resolve({ default: Article }), 1500),
          ),
      ),
    );
  }

  return (
    <div className="flex flex-col items-center gap-M">
      <PageProgress controller={routeProgress} />
      <Button onClick={open}>Mở bài viết</Button>
      <Suspense fallback={<PageProgressFallback controller={routeProgress} />}>{Page && <Page />}</Suspense>
    </div>
  );
}
// #endregion

/* ------------------------------------------------------------- asynccontent */

// #region AsyncContentDemo
type Member = { id: number; name: string; role: string };

const MEMBERS: Member[] = [
  { id: 1, name: "Nguyễn An", role: "Thiết kế" },
  { id: 2, name: "Trần Bình", role: "Kỹ sư frontend" },
  { id: 3, name: "Lê Chi", role: "Quản lý sản phẩm" },
];

function AsyncContentDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [empty, setEmpty] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [members, setMembers] = useState<Member[]>([]);

  async function load() {
    setStatus("loading");
    try {
      const data = await fakeRequest(network, empty ? [] : MEMBERS);
      setMembers(data);
      setStatus(data.length ? "success" : "empty");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-M">
      <div className="flex flex-wrap items-center gap-M">
        <NetworkToggle value={network} onChange={setNetwork} />
        <Switch label="Trả về rỗng" checked={empty} onCheckedChange={setEmpty} />
      </div>
      <Button appearance="primary" className="self-start" onClick={load}>
        Tải thành viên
      </Button>
      <AsyncContent
        status={status}
        onRetry={load}
        skeleton={<SkeletonList rows={3} />}
        idle={<p className="text-body1 text-foreground-3">Bấm “Tải thành viên” để bắt đầu.</p>}
        className="min-h-48 rounded-xlarge border border-stroke-2 bg-background-1 p-L"
      >
        <ul className="flex flex-col gap-L">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-M">
              <Avatar name={member.name} size={40} color="colorful" />
              <div className="flex flex-col">
                <span className="text-body1 font-semibold text-foreground-1">{member.name}</span>
                <span className="text-caption1 text-foreground-3">{member.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </AsyncContent>
    </div>
  );
}
// #endregion

// #region RetryDemo
function RetryDemo() {
  const [network, setNetwork] = useState<Network>("slow");

  return (
    <div className="flex w-full flex-col items-center gap-S">
      <NetworkToggle value={network} onChange={setNetwork} />
      <ErrorState
        icon={<CloudOff24Regular />}
        title="Mất kết nối"
        description="Không tải được bình luận. Kiểm tra mạng rồi thử lại."
        onRetry={() =>
          fakeRequest(network, null).then(
            () => toast({ intent: "success", title: "Đã tải lại bình luận" }),
            () => toast({ intent: "error", title: "Vẫn chưa kết nối được", timeout: -1 }),
          )
        }
        secondaryAction={<Button appearance="subtle">Báo lỗi</Button>}
      />
    </div>
  );
}
// #endregion

/* ---------------------------------------------------------- skeletonpresets */

// #region FidelityDemo
function FidelityDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [status, setStatus] = useState<AsyncStatus>("success");

  async function reload() {
    setStatus("loading");
    try {
      await fakeRequest(network, null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex w-72 flex-col gap-M">
      <NetworkToggle value={network} onChange={setNetwork} />
      <Button icon={<ArrowClockwise20Regular />} className="self-start" onClick={reload}>
        Tải lại thẻ
      </Button>
      <AsyncContent status={status} onRetry={reload} skeleton={<SkeletonCard header lines={2} actions={2} />}>
        <Card>
          <CardHeader image={<Avatar name="Hoa Anh Đào" />} header="Hoa Anh Đào" description="2 giờ trước" />
          <div className="aspect-video rounded-medium bg-gradient-sakura" />
          <div className="flex flex-col gap-S">
            <p className="text-subtitle1 font-semibold text-foreground-1">Mùa hoa Đà Lạt</p>
            <CardContent>Mai anh đào nở rộ quanh hồ Xuân Hương, đẹp nhất vào sáng sớm.</CardContent>
          </div>
          <CardFooter>
            <Button appearance="primary">Xem</Button>
            <Button>Chia sẻ</Button>
          </CardFooter>
        </Card>
      </AsyncContent>
    </div>
  );
}
// #endregion

/* ---------------------------------------------------------------- optimistic */

// #region TodoDemo
type Todo = { id: string; title: string; done: boolean };

function TodoDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const { items, mutate, pending } = useOptimisticList<Todo>([
    { id: "1", title: "Duyệt thiết kế trang chủ", done: true },
    { id: "2", title: "Viết tài liệu Wait UX", done: false },
    { id: "3", title: "Chuẩn bị demo thứ Sáu", done: false },
  ]);
  const saving = useSpinDelay(pending);

  const toggle = (id: string) =>
    mutate(
      (list) => list.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
      () => fakeRequest(network, null),
      { errorTitle: "Không cập nhật được công việc" },
    );

  const remove = (id: string) =>
    mutate(
      (list) => list.filter((todo) => todo.id !== id),
      () => fakeRequest(network, null),
      { errorTitle: "Không xoá được công việc" },
    );

  return (
    <div className="flex w-full max-w-md flex-col gap-M">
      <div className="flex flex-wrap items-center justify-between gap-S">
        <NetworkToggle value={network} onChange={setNetwork} />
        <span role="status" className="text-caption1 text-foreground-3">
          {saving ? "Đang lưu…" : "Mọi thay đổi đã được lưu"}
        </span>
      </div>
      <ul className="flex flex-col rounded-xlarge border border-stroke-2 bg-background-1">
        {items.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between gap-S border-b border-stroke-2 px-M py-XS last:border-b-0">
            <Checkbox label={todo.title} checked={todo.done} onCheckedChange={() => toggle(todo.id)} />
            <Button
              appearance="subtle"
              size="small"
              icon={<Delete20Regular />}
              aria-label={`Xoá “${todo.title}”`}
              onClick={() => remove(todo.id)}
            />
          </li>
        ))}
        {items.length === 0 && <li className="px-M py-L text-center text-body1 text-foreground-3">Không còn việc nào.</li>}
      </ul>
    </div>
  );
}
// #endregion

// #region CompareDemo
function CompareDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const { items, mutate } = useOptimisticList<string>([]);
  const optimisticLiked = items.includes("post-1");

  async function likeAndWait() {
    setSaving(true);
    try {
      await fakeRequest(network, null);
      setLiked((v) => !v);
    } catch {
      toast({ intent: "error", title: "Chưa thích được bài viết", timeout: -1 });
    } finally {
      setSaving(false);
    }
  }

  const likeOptimistic = () =>
    mutate(
      (ids) => (ids.includes("post-1") ? ids.filter((id) => id !== "post-1") : [...ids, "post-1"]),
      () => fakeRequest(network, null),
      { errorTitle: "Chưa thích được bài viết" },
    );

  return (
    <div className="flex w-full flex-col items-center gap-M">
      <NetworkToggle value={network} onChange={setNetwork} />
      <div className="grid w-full max-w-sm grid-cols-2 gap-M">
        <div className="flex flex-col items-center gap-S rounded-xlarge border border-stroke-2 bg-background-1 p-L">
          <span className="text-caption1 font-semibold text-foreground-3">Chờ server</span>
          <Button
            aria-pressed={liked}
            icon={liked ? <Heart20Filled className="text-brand-foreground-1" /> : <Heart20Regular />}
            loading={saving}
            onClick={likeAndWait}
          >
            Thích
          </Button>
        </div>
        <div className="flex flex-col items-center gap-S rounded-xlarge border border-stroke-2 bg-background-1 p-L">
          <span className="text-caption1 font-semibold text-foreground-3">Lạc quan</span>
          <Button
            aria-pressed={optimisticLiked}
            icon={optimisticLiked ? <Heart20Filled className="text-brand-foreground-1" /> : <Heart20Regular />}
            onClick={likeOptimistic}
          >
            Thích
          </Button>
        </div>
      </div>
    </div>
  );
}
// #endregion

// #region CommentDemo
type Comment = { id: string; text: string };

function CommentDemo() {
  const [network, setNetwork] = useState<Network>("fast");
  const [draft, setDraft] = useState("");
  const { items, mutate } = useOptimisticList<Comment>([
    { id: "c1", text: "Màu hồng này đẹp quá!" },
    { id: "c2", text: "Năm nay hoa nở sớm hơn mọi năm." },
  ]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const comment = { id: String(Date.now()), text };
    const ok = await mutate((list) => [...list, comment], () => fakeRequest(network, null), {
      errorTitle: "Chưa gửi được bình luận",
      errorBody: "Nội dung đã được trả lại ô nhập.",
    });
    if (!ok) setDraft((current) => current || text);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-M">
      <NetworkToggle value={network} onChange={setNetwork} />
      <ul className="flex flex-col gap-S">
        {items.map((comment) => (
          <li key={comment.id} className="rounded-xlarge bg-background-1 px-M py-S text-body1 text-foreground-1 shadow-2">
            {comment.text}
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex items-center gap-S">
        <Input
          aria-label="Bình luận"
          placeholder="Viết bình luận…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rootClassName="flex-1"
        />
        <Button type="submit" appearance="primary" icon={<Send20Regular className="rtl:-scale-x-100" />} aria-label="Gửi" />
      </form>
    </div>
  );
}
// #endregion

/* ------------------------------------------------------------------ registry */

const SPIN_DELAY_PROP = {
  name: "delay / minDuration",
  type: "number",
  defaultValue: "300 / 500",
  description: "Chờ bao lâu mới hiện loader / đã hiện thì giữ tối thiểu bao lâu (ms) — xem useSpinDelay.",
};

export const docs: ComponentDoc[] = [
  {
    slug: "loading",
    category: "Yugen Labs",
    name: "LoadingOverlay & useSpinDelay",
    lead: "Hiện loader đúng lúc: không nháy với phản hồi nhanh, không chập chờn với phản hồi chậm — và chỉ phủ đúng vùng đang tải.",
    description:
      "useSpinDelay(loading, { delay, minDuration }) chỉ bật loader khi việc chờ kéo dài quá delay (mặc định 300ms) và một khi đã hiện thì giữ ít nhất minDuration (500ms). LoadingOverlay dựng trên hook này: phủ một vùng bằng bề mặt mờ + Spinner + nhãn, nội dung cũ vẫn giữ chỗ bên dưới, vùng có aria-busy và nhãn được đọc qua live region.",
    importCode: `import { LoadingOverlay, useSpinDelay } from "@/components/ui";`,
    hero: {
      title: "LoadingOverlay",
      description: "Đổi tốc độ mạng rồi bấm Làm mới: mạng nhanh không có lớp phủ nào nháy lên; mạng chậm phủ sau 300ms.",
      code: source("network", "OverlayDemo"),
      render: () => <OverlayDemo />,
    },
    examples: [
      {
        title: "Có và không có useSpinDelay",
        description: "Chọn “Nhanh” rồi bấm Tải vài lần: bên trái nháy spinner 150ms, bên phải đứng yên. Chọn “Chậm”: bên phải trễ 300ms rồi giữ ổn định.",
        code: source("network", "SpinDelayDemo"),
        render: () => <SpinDelayDemo />,
      },
      {
        title: "Giữ nội dung cũ dưới lớp phủ",
        description: "Khi làm mới dữ liệu đã có, phủ mờ thay vì thay bằng khung xương — người dùng vẫn đọc được số cũ.",
        code: source("staticOverlay"),
        render: () => (
          // #region staticOverlay
          <LoadingOverlay loading label="Đang cập nhật…" className="w-72 rounded-xlarge border border-stroke-2 bg-background-1 p-L">
            <p className="text-caption1 text-foreground-3">Doanh thu tháng 10</p>
            <p className="text-title2 font-semibold text-foreground-1">128,4 triệu ₫</p>
            <p className="text-caption1 text-foreground-3">Tăng 12% so với tháng trước</p>
          </LoadingOverlay>
          // #endregion
        ),
      },
      {
        title: "Chỉ báo nhỏ cũng cần delay",
        description: "Dòng “Đang lưu…” của thao tác tự lưu dùng chung useSpinDelay — lưu nhanh thì chỉ thấy “Đã lưu”.",
        code: source("network", "AutosaveDemo"),
        render: () => <AutosaveDemo />,
      },
    ],
    dos: [
      "Bọc mọi loader (spinner, overlay, “Đang lưu…”) bằng useSpinDelay để phản hồi dưới 300ms không gây nháy.",
      "Phủ đúng vùng đang tải và giữ nội dung cũ khi làm mới dữ liệu đã có.",
      "Đặt aria-busy lên vùng đang tải và nói bằng chữ việc đang làm (“Đang làm mới…”).",
    ],
    donts: [
      "Không phủ cả trang cho một thao tác cục bộ.",
      "Không tắt loader ngay khi vừa hiện được vài chục mili-giây — giữ minDuration.",
      "Không chuyển focus vào lớp phủ; focus ở nguyên chỗ người dùng đang thao tác.",
    ],
    props: [
      { name: "useSpinDelay(loading, options)", type: "(boolean, SpinDelayOptions) => boolean", description: "Trả về true khi nên hiện loader." },
      { name: "options.delay", type: "number", defaultValue: "300", description: "Chờ (ms) trước khi hiện; xong sớm hơn thì không hiện gì." },
      { name: "options.minDuration", type: "number", defaultValue: "500", description: "Đã hiện thì giữ tối thiểu (ms)." },
      { name: "LoadingOverlay.loading", type: "boolean", description: "Vùng đang tải; aria-busy cập nhật ngay, lớp phủ theo delay." },
      { name: "label", type: "ReactNode", defaultValue: `"Đang tải…"`, description: "Nhãn dưới Spinner; chuỗi được đọc qua live region khi lớp phủ hiện." },
      { name: "delay / minDuration", type: "number", defaultValue: "0 / 500 khi có delay", description: "Truyền cho useSpinDelay." },
      { name: "spinnerSize", type: "SpinnerSize", defaultValue: `"medium"`, description: "Cỡ Spinner." },
      { name: "overlayClassName", type: "string", description: "Class cho lớp phủ (độ trong, padding…)." },
    ],
  },

  {
    slug: "pageprogress",
    category: "Yugen Labs",
    name: "PageProgress",
    lead: "Thanh tiến trình mảnh màu brand ở mép trên trang: báo ứng dụng đang làm việc khi chuyển route hay tải nền, mà không che nội dung đang đọc.",
    description:
      "Hai chế độ: xác định (value 0–1) khi biết tiến độ thật, và trickle (active) tự nhích dần tới ~94% rồi chạy nốt 100% và mờ đi khi xong. Bộ điều khiển mệnh lệnh pageProgress.start() / .done() / .set(n) gọi được ở bất kỳ đâu (router, lớp bọc fetch) mà không cần context; start/done được đếm nên nhiều tác vụ chồng nhau vẫn kết thúc đúng lúc. Tôn trọng prefers-reduced-motion: không chuyển động độ rộng, không fade.",
    importCode: `import { PageProgress, PageProgressFallback, pageProgress, usePageProgress } from "@/components/ui";`,
    hero: {
      title: "PageProgress",
      description: "Chuyển trang trong khung mẫu. Mạng chậm: thanh nhích dần trong khi nội dung cũ vẫn đọc được.",
      code: source("network", "RouteDemo"),
      render: () => <RouteDemo />,
    },
    examples: [
      {
        title: "Xác định (value)",
        description: "Biết tiến độ thật (tải tệp lên) thì truyền value; kèm active để thanh chỉ hiện trong lúc tải.",
        code: source("UploadDemo"),
        render: () => <UploadDemo />,
      },
      {
        title: "Bộ điều khiển mệnh lệnh",
        description:
          "Trong ứng dụng: gắn một <PageProgress /> ở gốc rồi gọi pageProgress.start() / .done(). Ví dụ dùng createPageProgress() riêng để không đụng thanh của trang docs.",
        code: source("network", "StoreDemo"),
        render: () => <StoreDemo />,
      },
      {
        title: "Suspense & route lazy",
        description: "PageProgressFallback làm fallback của Suspense: thanh chạy suốt lúc chunk đang tải, không spinner giữa trang.",
        code: source("SuspenseDemo"),
        render: () => <SuspenseDemo />,
      },
    ],
    dos: [
      "Gắn một PageProgress ở gốc ứng dụng và điều khiển bằng pageProgress hoặc PageProgressFallback.",
      "Dùng value khi có tiến độ thật; trickle khi chỉ biết “đang chạy”.",
      "Giữ nội dung trang cũ trong lúc tải trang mới.",
    ],
    donts: [
      "Không dùng PageProgress cho thao tác cục bộ trong một vùng — dùng LoadingOverlay hoặc Button loading.",
      "Không quên gọi done() trong finally — thanh sẽ dừng ở ~94% mãi.",
      "Không đặt thanh dày hay màu trạng thái; đây là tín hiệu nền, không phải thông báo.",
    ],
    props: [
      { name: "value", type: "number", description: "0–1, chế độ xác định; ≥ 1 → hoàn tất rồi mờ đi." },
      { name: "active", type: "boolean", description: "true → hiện (trickle nếu không có value); false → chạy tới 100% rồi mờ đi." },
      { name: "controller", type: "PageProgressController", defaultValue: "pageProgress", description: "Bộ điều khiển dùng khi không truyền value / active." },
      { name: "position", type: `"fixed" | "absolute"`, defaultValue: `"fixed"`, description: "fixed: mép trên khung nhìn (portal, z-50) · absolute: mép trên phần tử cha relative." },
      { name: "thickness", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "2px / 4px." },
      { name: "label", type: "string", defaultValue: `"Đang tải trang"`, description: "aria-label của progressbar." },
      { name: "pageProgress.start() / .done() / .set(n) / .reset()", type: "PageProgressController", description: "Điều khiển mệnh lệnh; start/done được đếm. createPageProgress() tạo bộ riêng." },
      { name: "PageProgressFallback / usePageProgress(active?)", type: "component / hook", description: "Chạy thanh suốt lúc mount (fallback của Suspense) hoặc trong lúc active." },
    ],
  },

  {
    slug: "asynccontent",
    category: "Yugen Labs",
    name: "AsyncContent & ErrorState",
    lead: "Một chỗ cho mọi trạng thái của dữ liệu bất đồng bộ — chưa tải, đang tải, có dữ liệu, rỗng, lỗi — với khung xương không nháy và lỗi luôn có lối thoát.",
    description:
      "AsyncContent nhận status và hiển thị đúng một trạng thái. Đang tải dùng useSpinDelay: phản hồi nhanh hơn 300ms thì giữ nguyên trạng thái trước, không có khung xương nháy lên. Lỗi mặc định là ErrorState (role=\"alert\") với nút Thử lại tự vào trạng thái loading; rỗng mặc định là Empty. Nếu nút đang được focus bị thay, focus ở lại trong vùng thay vì rơi về đầu trang.",
    importCode: `import { AsyncContent, ErrorState, type AsyncStatus } from "@/components/ui";`,
    hero: {
      title: "AsyncContent",
      description: "Thử cả ba tốc độ mạng và công tắc “Trả về rỗng”.",
      code: source("network", "AsyncContentDemo"),
      render: () => <AsyncContentDemo />,
    },
    examples: [
      {
        title: "ErrorState với thử lại",
        description: "onRetry trả về Promise → nút Thử lại tự hiện spinner tới khi xong; focus không rời nút.",
        code: source("network", "RetryDemo"),
        render: () => <RetryDemo />,
      },
      {
        title: "ErrorState gọn",
        description: "size=\"small\" cho thẻ, panel, dòng trong danh sách.",
        code: source("smallError"),
        render: () => (
          // #region smallError
          <ErrorState
            size="small"
            title="Không tải được biểu đồ"
            description="Dữ liệu tuần này tạm thời chưa có."
            onRetry={() => undefined}
            className="w-full max-w-md rounded-xlarge border border-stroke-2 bg-background-1"
          />
          // #endregion
        ),
      },
      {
        title: "Trạng thái rỗng tuỳ biến",
        description: "Rỗng không phải lỗi: nói vì sao trống và gợi ý bước tiếp theo.",
        code: source("customEmpty"),
        render: () => (
          // #region customEmpty
          <AsyncContent
            status="empty"
            className="w-full max-w-sm"
            empty={
              <Empty variant="outline">
                <EmptyHeader>
                  <EmptyMedia>
                    <Search24Regular />
                  </EmptyMedia>
                  <EmptyTitle>Không có kết quả</EmptyTitle>
                  <EmptyDescription>Thử từ khoá khác hoặc bỏ bớt bộ lọc.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          />
          // #endregion
        ),
      },
    ],
    dos: [
      "Phân biệt rõ rỗng và lỗi — rỗng là kết quả hợp lệ, lỗi cần lối thoát.",
      "Lỗi nói chuyện gì đã xảy ra và cho thử lại ngay tại chỗ.",
      "Truyền skeleton khớp bố cục nội dung thật.",
    ],
    donts: [
      "Không để vùng trắng trơn khi lỗi hoặc rỗng.",
      "Không hiện thông báo kỹ thuật (mã lỗi, stack) làm tiêu đề.",
      "Không dùng role=\"alert\" cho lỗi tải lần đầu của nhiều vùng cùng lúc — sẽ đọc dồn dập.",
    ],
    props: [
      { name: "status", type: `"idle" | "loading" | "success" | "error" | "empty"`, description: "Trạng thái cần hiển thị." },
      { name: "children", type: "ReactNode | () => ReactNode", description: "Nội dung khi success; dạng hàm chỉ được gọi khi success." },
      { name: "skeleton", type: "ReactNode", defaultValue: "SkeletonText 3 dòng", description: "Hiển thị khi loading (sau delay)." },
      { name: "error", type: "ReactNode | ({ retry, retrying }) => ReactNode", defaultValue: "ErrorState", description: "Thay giao diện lỗi." },
      { name: "empty / idle", type: "ReactNode", description: "Giao diện rỗng (mặc định Empty) / chưa tải (mặc định trống)." },
      { name: "onRetry", type: "() => void | Promise", description: "Truyền cho nút Thử lại của ErrorState mặc định." },
      SPIN_DELAY_PROP,
      { name: "loadingLabel", type: "string", defaultValue: `"Đang tải…"`, description: "Câu đọc cho trình đọc màn hình khi khung xương hiện." },
      { name: "ErrorState.title / description / icon", type: "ReactNode", description: "Nội dung lỗi; có giá trị mặc định tiếng Việt." },
      { name: "ErrorState.onRetry / retrying / retryLabel", type: "() => void | Promise · boolean · ReactNode", description: "Nút Thử lại; Promise hoặc retrying → nút ở trạng thái loading." },
      { name: "ErrorState.secondaryAction", type: "ReactNode", description: "Hành động phụ (Báo lỗi, Quay lại…)." },
      { name: "ErrorState.variant / size", type: `"default" | "alert" · "small" | "medium"`, defaultValue: `"default" · "medium"`, description: "alert thêm role=\"alert\"; small là một dòng gọn." },
    ],
  },

  {
    slug: "skeletonpresets",
    category: "Yugen Labs",
    name: "Skeleton presets",
    lead: "Khung xương dựng sẵn cho đoạn văn, avatar, thẻ, danh sách và bảng — cùng kích thước, bo góc và khoảng cách với component thật.",
    description:
      "Các preset dựng trên SkeletonItem và kế thừa animation (wave / pulse) cùng appearance (opaque / translucent). Đứng một mình, mỗi preset là một Skeleton (role=\"progressbar\", aria-busy); lồng trong nhau thì không lặp thông báo cho trình đọc màn hình. Dùng làm prop skeleton của AsyncContent.",
    importCode: `import { SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonList, SkeletonTable } from "@/components/ui";`,
    hero: {
      title: "Skeleton presets",
      code: source("heroSkeleton"),
      render: () => (
        <>
          {/* #region heroSkeleton */}
          <SkeletonCard className="w-72" />
          <SkeletonList rows={3} className="w-72" />
          {/* #endregion */}
        </>
      ),
    },
    examples: [
      {
        title: "SkeletonText",
        description: "lines dòng, dòng cuối ngắn hơn; size small 12 · medium 16 · large 20px.",
        code: source("skeletonText"),
        render: () => (
          // #region skeletonText
          <div className="flex w-64 flex-col gap-L">
            <SkeletonText lines={2} size="small" />
            <SkeletonText lines={3} />
            <SkeletonText lines={2} size="large" animation="pulse" />
          </div>
          // #endregion
        ),
      },
      {
        title: "SkeletonAvatar",
        description: "Dùng đúng size của Avatar sẽ thay thế.",
        code: source("skeletonAvatar"),
        render: () => (
          <>
            {/* #region skeletonAvatar */}
            <SkeletonAvatar size={24} />
            <SkeletonAvatar />
            <SkeletonAvatar size={48} />
            <SkeletonAvatar size={48} shape="square" />
            {/* #endregion */}
          </>
        ),
      },
      {
        title: "SkeletonTable",
        description: "rows × columns, dòng cao 44px như Table size medium.",
        code: source("skeletonTable"),
        render: () => (
          // #region skeletonTable
          <SkeletonTable rows={4} columns={4} className="max-w-lg" />
          // #endregion
        ),
      },
      {
        title: "Khung xương khớp nội dung thật",
        description: "SkeletonCard header + 2 dòng + 2 nút trùng khít Card bên dưới — lúc đổi không có gì nhảy chỗ.",
        code: source("network", "FidelityDemo"),
        render: () => <FidelityDemo />,
      },
    ],
    dos: [
      "Khớp bố cục thật: cùng số cột, cỡ avatar, chiều cao dòng và vị trí nút.",
      "Chỉ dựng khung cho phần chắc chắn sẽ có; giữ số dòng gần với dữ liệu thường gặp.",
      "Dùng translucent trên bề mặt có màu, pulse khi wave gây rối mắt.",
    ],
    donts: [
      "Không dựng khung cho nội dung đã có sẵn (tiêu đề trang, nhãn tĩnh).",
      "Không dùng khung xương cho thao tác dưới 300ms — để AsyncContent / useSpinDelay lo.",
      "Không lồng thêm Spinner vào giữa khung xương.",
    ],
    props: [
      { name: "SkeletonText.lines / size", type: `number · "small" | "medium" | "large"`, defaultValue: `3 · "medium"`, description: "Số dòng (dòng cuối 60%) và chiều cao dòng." },
      { name: "SkeletonAvatar.size / shape", type: `SkeletonItemSize · "circular" | "square"`, defaultValue: `32 · "circular"`, description: "Cạnh (px) và hình." },
      { name: "SkeletonCard.header / media / lines / actions", type: "boolean · boolean · number · number", defaultValue: "false · true · 2 · 2", description: "Các phần của thẻ." },
      { name: "SkeletonList.rows / avatarSize / avatarShape", type: `number · SkeletonItemSize · "circular" | "square"`, defaultValue: `3 · 40 · "circular"`, description: "Số dòng và avatar mỗi dòng." },
      { name: "SkeletonTable.rows / columns / header", type: "number · number · boolean", defaultValue: "5 · 4 · true", description: "Kích thước bảng." },
      { name: "animation / appearance", type: `"wave" | "pulse" · "opaque" | "translucent"`, defaultValue: `"wave" · "opaque"`, description: "Như Skeleton; preset lồng nhau kế thừa từ preset ngoài." },
    ],
  },

  {
    slug: "optimistic",
    category: "Yugen Labs",
    name: "useOptimisticList",
    lead: "Cập nhật lạc quan cho danh sách: giao diện đổi ngay khi bấm, gửi lên server phía sau; thất bại thì hoàn tác đúng thay đổi đó và báo bằng toast.",
    description:
      "mutate(update, commit, options) áp update lên danh sách ngay, chờ commit(); thành công thì gộp vào dữ liệu gốc, thất bại thì gỡ riêng thay đổi đó — các thay đổi khác đang chờ vẫn giữ — rồi hiện toast lỗi (không tự đóng) có nút Thử lại. update phải là hàm thuần dựa trên id vì nó được áp lại lên dữ liệu mới nhất. Trả về true / false để xử lý tiếp (vd. trả lại nội dung cho ô nhập).",
    importCode: `import { useOptimisticList } from "@/components/ui";`,
    hero: {
      title: "useOptimisticList",
      description: "Chọn “Lỗi” rồi tích / xoá vài mục liên tiếp: từng thay đổi được hoàn tác riêng, kèm toast.",
      code: source("network", "TodoDemo"),
      render: () => <TodoDemo />,
    },
    examples: [
      {
        title: "Chờ server và lạc quan",
        description: "Với mạng chậm, nút bên trái quay 2 giây; nút bên phải đổi ngay và chỉ quay về khi lỗi.",
        code: source("network", "CompareDemo"),
        render: () => <CompareDemo />,
      },
      {
        title: "Thêm mục và trả lại nội dung khi lỗi",
        description: "mutate trả về false khi thất bại — đưa bình luận lại vào ô nhập để người dùng không mất chữ.",
        code: source("network", "CommentDemo"),
        render: () => <CommentDemo />,
      },
    ],
    dos: [
      "Dùng cho thao tác gần như luôn thành công và dễ hoàn tác: thích, tích việc, sắp xếp, đổi tên.",
      "Viết update theo id, không theo vị trí.",
      "Báo lỗi rõ ràng khi hoàn tác và cho thử lại.",
    ],
    donts: [
      "Không dùng cho thanh toán, xoá vĩnh viễn hay thao tác không hoàn tác được — hãy chờ server.",
      "Không lặng lẽ hoàn tác mà không báo.",
      "Không khoá cả danh sách trong lúc chờ — đó là việc của cách làm bi quan.",
    ],
    props: [
      { name: "useOptimisticList(initial)", type: "T[] | () => T[]", description: "Dữ liệu ban đầu (đã xác nhận)." },
      { name: "items", type: "T[]", description: "Dữ liệu gốc + mọi thay đổi đang chờ." },
      { name: "mutate(update, commit, options?)", type: "(T[] => T[], () => Promise, OptimisticOptions) => Promise<boolean>", description: "Áp update ngay, chờ commit; true khi thành công." },
      { name: "options.errorTitle / errorBody", type: "ReactNode", defaultValue: `"Không lưu được thay đổi"`, description: "Nội dung toast khi thất bại." },
      { name: "options.toast / onError", type: "boolean · (error) => void", defaultValue: "true", description: "Tắt toast mặc định / tự xử lý lỗi." },
      { name: "setItems", type: "Dispatch<SetStateAction<T[]>>", description: "Thay dữ liệu gốc (vd. sau khi tải lại từ server)." },
      { name: "pending", type: "boolean", description: "Còn thay đổi đang chờ — kết hợp useSpinDelay cho dòng “Đang lưu…”." },
    ],
  },
];
