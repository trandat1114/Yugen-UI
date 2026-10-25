import { describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setMediaQueries } from "@/test/matchMedia";
import { Toaster } from "../Toast/Toast";
import { createPageProgress, ErrorState, errorStateMessagesEn, useOptimisticList, useSpinDelay, type SpinDelayOptions } from "./Loading";
import { YugenProvider } from "../YugenProvider/YugenProvider";

/* ================================================================ useSpinDelay */

function renderSpinDelay(initial: boolean, options?: SpinDelayOptions) {
  return renderHook(({ loading }) => useSpinDelay(loading, options), { initialProps: { loading: initial } });
}

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("useSpinDelay", () => {
  it("phản hồi nhanh hơn delay → loader không bao giờ hiện", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderSpinDelay(true, { delay: 300, minDuration: 500 });
    expect(result.current).toBe(false);
    advance(200);
    expect(result.current).toBe(false);
    rerender({ loading: false });
    expect(result.current).toBe(false);
    advance(1000);
    expect(result.current).toBe(false);
  });

  it("chờ quá delay → hiện; đã hiện thì giữ ít nhất minDuration dù dữ liệu về ngay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderSpinDelay(true, { delay: 300, minDuration: 500 });
    advance(299);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);

    // Dữ liệu về 50ms sau khi loader hiện → vẫn giữ tới đủ 500ms.
    advance(50);
    rerender({ loading: false });
    expect(result.current).toBe(true);
    advance(400);
    expect(result.current).toBe(true);
    advance(50);
    expect(result.current).toBe(false);
  });

  it("vẫn đang tải sau minDuration → tiếp tục hiện tới khi xong", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderSpinDelay(true, { delay: 100, minDuration: 200 });
    advance(100);
    expect(result.current).toBe(true);
    advance(5000);
    expect(result.current).toBe(true);
    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it("delay = 0 → hiện ngay từ lần render đầu", () => {
    vi.useFakeTimers();
    const { result } = renderSpinDelay(true, { delay: 0, minDuration: 300 });
    expect(result.current).toBe(true);
  });

  it("bắt đầu tải lại sau khi đã ẩn → chạy lại chu kỳ delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderSpinDelay(false, { delay: 300, minDuration: 500 });
    expect(result.current).toBe(false);
    rerender({ loading: true });
    advance(300);
    expect(result.current).toBe(true);
    advance(500);
    rerender({ loading: false });
    expect(result.current).toBe(false);
    rerender({ loading: true });
    expect(result.current).toBe(false);
    advance(300);
    expect(result.current).toBe(true);
  });

  it("dùng mặc định delay 300 / minDuration 500", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderSpinDelay(true);
    advance(299);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
    rerender({ loading: false });
    advance(499);
    expect(result.current).toBe(true);
    advance(1);
    expect(result.current).toBe(false);
  });
});

/* ================================================================ createPageProgress */

describe("createPageProgress", () => {
  it("bắt đầu ở idle", () => {
    const progress = createPageProgress();
    expect(progress.getSnapshot()).toEqual({ status: "idle", value: 0, trickling: false });
  });

  it("start → running + trickle tăng dần nhưng không vượt 94%", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    expect(progress.getSnapshot()).toEqual({ status: "running", value: 0.08, trickling: true });
    vi.advanceTimersByTime(250);
    const v1 = progress.getSnapshot().value;
    expect(v1).toBeGreaterThan(0.08);
    vi.advanceTimersByTime(250 * 200);
    const v2 = progress.getSnapshot().value;
    expect(v2).toBeGreaterThan(v1);
    expect(v2).toBeLessThanOrEqual(0.94);
    expect(v2).toBeGreaterThan(0.9);
    progress.reset();
  });

  it("prefers-reduced-motion → trickle chậm lại 4 lần", () => {
    vi.useFakeTimers();
    setMediaQueries({ "prefers-reduced-motion": true });
    const progress = createPageProgress();
    progress.start();
    vi.advanceTimersByTime(999);
    expect(progress.getSnapshot().value).toBe(0.08);
    vi.advanceTimersByTime(1);
    expect(progress.getSnapshot().value).toBeGreaterThan(0.08);
    progress.reset();
  });

  it("done → complete (100%) rồi về idle sau 300ms", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    progress.done();
    expect(progress.getSnapshot()).toEqual({ status: "complete", value: 1, trickling: false });
    vi.advanceTimersByTime(299);
    expect(progress.getSnapshot().status).toBe("complete");
    vi.advanceTimersByTime(1);
    expect(progress.getSnapshot().status).toBe("idle");
  });

  it("đếm tác vụ: chỉ hoàn tất khi mọi start đều đã done", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    progress.start();
    progress.done();
    expect(progress.getSnapshot().status).toBe("running");
    progress.done();
    expect(progress.getSnapshot().status).toBe("complete");
    // done thừa không làm gì.
    progress.done();
    expect(progress.getSnapshot().status).toBe("complete");
  });

  it("done khi chưa start không làm gì", () => {
    const progress = createPageProgress();
    progress.done();
    expect(progress.getSnapshot().status).toBe("idle");
  });

  it("set(value) → chế độ xác định, tắt trickle; set ≥ 1 → hoàn tất", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    progress.set(0.5);
    expect(progress.getSnapshot()).toEqual({ status: "running", value: 0.5, trickling: false });
    // Trickle đã dừng.
    vi.advanceTimersByTime(2000);
    expect(progress.getSnapshot().value).toBe(0.5);
    progress.set(-0.2);
    expect(progress.getSnapshot().value).toBe(0);
    progress.set(Number.NaN);
    expect(progress.getSnapshot().value).toBe(0);
    progress.set(1);
    expect(progress.getSnapshot()).toEqual({ status: "complete", value: 1, trickling: false });
  });

  it("set(≥ 1) khi đang idle không bật thanh", () => {
    const progress = createPageProgress();
    progress.set(1.5);
    expect(progress.getSnapshot().status).toBe("idle");
  });

  it("start lại trong lúc đang chạy nốt (complete) → chạy lại từ đầu, huỷ hẹn giờ ẩn", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    progress.done();
    progress.start();
    expect(progress.getSnapshot()).toEqual({ status: "running", value: 0.08, trickling: true });
    vi.advanceTimersByTime(1000);
    expect(progress.getSnapshot().status).toBe("running");
    progress.reset();
  });

  it("start sau set → bật lại trickle, giữ giá trị hiện tại", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.set(0.3);
    progress.start();
    expect(progress.getSnapshot()).toEqual({ status: "running", value: 0.3, trickling: true });
    progress.reset();
  });

  it("reset → idle ngay, không chạy tới 100%, dừng mọi hẹn giờ", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    progress.start();
    vi.advanceTimersByTime(500);
    progress.reset();
    expect(progress.getSnapshot()).toEqual({ status: "idle", value: 0, trickling: false });
    vi.advanceTimersByTime(5000);
    expect(progress.getSnapshot()).toEqual({ status: "idle", value: 0, trickling: false });
  });

  it("subscribe nhận thông báo mỗi lần đổi; snapshot giữ nguyên tham chiếu khi không đổi", () => {
    vi.useFakeTimers();
    const progress = createPageProgress();
    const listener = vi.fn();
    const unsubscribe = progress.subscribe(listener);
    const before = progress.getSnapshot();
    expect(progress.getSnapshot()).toBe(before);

    progress.start();
    expect(listener).toHaveBeenCalledTimes(1);
    const snapshots = [progress.getSnapshot()];
    vi.advanceTimersByTime(250);
    expect(listener).toHaveBeenCalledTimes(2);
    snapshots.push(progress.getSnapshot());
    expect(snapshots[1]).not.toBe(snapshots[0]);

    unsubscribe();
    progress.done();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(progress.getSnapshot().status).toBe("complete");
  });
});

/* ================================================================ useOptimisticList */

interface Todo {
  id: number;
  title: string;
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useOptimisticList", () => {
  const initial: Todo[] = [{ id: 1, title: "Một" }];
  const add = (todo: Todo) => (items: Todo[]) => [...items, todo];

  it("áp thay đổi ngay; commit xong → giữ thay đổi, hết pending", async () => {
    const { result } = renderHook(() => useOptimisticList<Todo>(initial));
    const server = deferred();
    let outcome: Promise<boolean> | undefined;
    act(() => {
      outcome = result.current.mutate(add({ id: 2, title: "Hai" }), () => server.promise);
    });
    expect(result.current.items.map((t) => t.id)).toEqual([1, 2]);
    expect(result.current.pending).toBe(true);

    await act(async () => {
      server.resolve();
      await outcome;
    });
    await expect(outcome).resolves.toBe(true);
    expect(result.current.items.map((t) => t.id)).toEqual([1, 2]);
    expect(result.current.pending).toBe(false);
  });

  it("commit lỗi → hoàn tác đúng thay đổi đó, gọi onError, trả về false", async () => {
    const { result } = renderHook(() => useOptimisticList<Todo>(initial));
    const server = deferred();
    const onError = vi.fn();
    let outcome: Promise<boolean> | undefined;
    act(() => {
      outcome = result.current.mutate(add({ id: 2, title: "Hai" }), () => server.promise, { toast: false, onError });
    });
    expect(result.current.items).toHaveLength(2);

    const error = new Error("mạng lỗi");
    await act(async () => {
      server.reject(error);
      await outcome;
    });
    await expect(outcome).resolves.toBe(false);
    expect(result.current.items.map((t) => t.id)).toEqual([1]);
    expect(result.current.pending).toBe(false);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it("nhiều thay đổi song song: một cái lỗi chỉ gỡ đúng cái đó", async () => {
    const { result } = renderHook(() => useOptimisticList<Todo>(initial));
    const a = deferred();
    const b = deferred();
    let pa: Promise<boolean> | undefined;
    let pb: Promise<boolean> | undefined;
    act(() => {
      pa = result.current.mutate(add({ id: 2, title: "Hai" }), () => a.promise, { toast: false });
      pb = result.current.mutate(add({ id: 3, title: "Ba" }), () => b.promise, { toast: false });
    });
    expect(result.current.items.map((t) => t.id)).toEqual([1, 2, 3]);

    await act(async () => {
      a.reject(new Error("x"));
      await pa;
    });
    expect(result.current.items.map((t) => t.id)).toEqual([1, 3]);
    expect(result.current.pending).toBe(true);

    await act(async () => {
      b.resolve();
      await pb;
    });
    expect(result.current.items.map((t) => t.id)).toEqual([1, 3]);
    expect(result.current.pending).toBe(false);
  });

  it("thay đổi áp lên dữ liệu mới nhất (setItems trong lúc đang chờ)", async () => {
    const { result } = renderHook(() => useOptimisticList<Todo>(() => initial));
    const server = deferred();
    let outcome: Promise<boolean> | undefined;
    act(() => {
      outcome = result.current.mutate((items) => items.filter((t) => t.id !== 1), () => server.promise);
    });
    expect(result.current.items).toEqual([]);
    act(() => result.current.setItems([...initial, { id: 9, title: "Từ server" }]));
    expect(result.current.items.map((t) => t.id)).toEqual([9]);
    await act(async () => {
      server.resolve();
      await outcome;
    });
    expect(result.current.items.map((t) => t.id)).toEqual([9]);
  });

  it("lỗi → toast lỗi có nút Thử lại; Thử lại chạy lại thao tác", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    const commit = () => {
      attempts += 1;
      return attempts === 1 ? Promise.reject(new Error("lỗi")) : Promise.resolve();
    };

    function Demo() {
      const { items, mutate } = useOptimisticList<Todo>(initial);
      return (
        <>
          <button type="button" onClick={() => void mutate(add({ id: 2, title: "Hai" }), commit)}>
            Thêm
          </button>
          <ul aria-label="Việc">
            {items.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
          <Toaster />
        </>
      );
    }

    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(await screen.findByText("Không lưu được thay đổi")).toBeInTheDocument();
    expect(screen.getByText("Thay đổi đã được hoàn tác.")).toBeInTheDocument();
    expect(screen.queryByText("Hai")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Thử lại/ }));
    await waitFor(() => expect(screen.getByText("Hai")).toBeInTheDocument());
    expect(attempts).toBe(2);
  });
});

describe("Loading messages", () => {
  it("errorStateMessagesEn; description={null} vẫn ẩn mô tả", () => {
    render(
      <YugenProvider messages={{ errorState: errorStateMessagesEn }}>
        <ErrorState onRetry={() => {}} />
        <ErrorState title="Riêng" description={null} />
      </YugenProvider>,
    );
    expect(screen.getByRole("heading", { name: "Couldn't load content" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Riêng" }).nextElementSibling).toBeNull();
  });
});
