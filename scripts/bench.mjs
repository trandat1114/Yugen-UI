/**
 * Chạy các test hiệu năng (`*.perf.test.tsx`) và in trung vị / p95 của từng phép đo, kèm môi trường đo.
 *
 *   npm run bench            # mọi file *.perf.test.tsx
 *   npm run bench -- Radar   # chỉ file có "Radar" trong tên
 *
 * Trong `npm test` / CI các test này vẫn chạy, nhưng chỉ chặn hồi quy lớn và không in bảng.
 */
import { spawnSync } from "node:child_process";

const filter = process.argv.slice(2);
const args = ["vitest", "run", "--reporter=dot", ...(filter.length ? filter.map((f) => `${f}.perf`) : ["perf.test"])];
const result = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, YUGEN_BENCH: "1" } });
process.exit(result.status ?? 1);
