/**
 * Đo thời gian chạy cho các test hiệu năng (`*.perf.test.tsx`): trung vị và p95 qua nhiều lần chạy, sau vài lần làm nóng.
 * Trong CI các test này chỉ chặn hồi quy lớn (ngưỡng rộng, vì máy CI dao động); số liệu chi tiết in ra khi chạy
 * `npm run bench` (YUGEN_BENCH=1), kèm môi trường đo.
 */
import os from "node:os";

export interface PerfResult {
  median: number;
  p95: number;
  runs: number;
}

export function measure(run: () => void, { runs = 20, warmup = 3 }: { runs?: number; warmup?: number } = {}): PerfResult {
  for (let i = 0; i < warmup; i++) run();
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    run();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const at = (q: number) => times[Math.min(times.length - 1, Math.floor(q * (times.length - 1)))];
  return { median: at(0.5), p95: at(0.95), runs };
}

const rows: string[] = [];

/** Ghi kết quả; in bảng khi chạy `npm run bench`. */
export function report(name: string, result: PerfResult): PerfResult {
  rows.push(`${name.padEnd(56)} median ${result.median.toFixed(2).padStart(8)} ms · p95 ${result.p95.toFixed(2).padStart(8)} ms · ${result.runs} runs`);
  return result;
}

/** Gọi trong afterAll của file test hiệu năng. */
export function printReport(title: string) {
  if (!process.env.YUGEN_BENCH || rows.length === 0) return;
  const env = `${os.cpus()[0]?.model ?? "cpu"} · ${os.cpus().length} cores · Node ${process.version} · jsdom`;
  console.log([`\n${title} (${env})`, ...rows.splice(0)].join("\n"));
}
