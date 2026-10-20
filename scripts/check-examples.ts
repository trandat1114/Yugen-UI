/**
 * Typecheck mọi ví dụ trong docs đúng như người dùng sẽ chép / mở trên StackBlitz:
 * mỗi `code` → App.tsx (src/docs/stackblitz.ts) với `import … from "yugen-ui"` → tsc strict.
 * Bắt được code mẫu lệch so với API thật (prop đổi tên, export thiếu, JSX hỏng).
 *
 *   npm run check:examples
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadAllComponentDocs } from "../src/docs/registry";
import { exampleToApp, sampleAssetsSource } from "../src/docs/stackblitz";

const COMPONENTS = await loadAllComponentDocs();

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "node_modules", ".cache", "yugen-examples");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "src"), { recursive: true });

const origin = new Map<string, string>();
let count = 0;
for (const doc of COMPONENTS) {
  [doc.hero, ...doc.examples].forEach((example, i) => {
    const file = `${doc.slug}--${i}.tsx`;
    origin.set(file, `${doc.slug} › ${i === 0 ? "hero" : example.title}`);
    fs.writeFileSync(path.join(out, "src", file), exampleToApp(example.code, example.setup));
    count++;
  });
}
fs.writeFileSync(path.join(out, "src", "sample-assets.ts"), sampleAssetsSource);

const posix = (p: string) => p.split(path.sep).join("/");
fs.writeFileSync(
  path.join(out, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        isolatedModules: true,
        allowImportingTsExtensions: true,
        types: [],
        paths: {
          "yugen-ui": [posix(path.join(root, "src", "lib.ts"))],
          "@/*": [posix(path.join(root, "src")) + "/*"],
        },
      },
      include: ["src"],
    },
    null,
    2,
  ),
);

const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
let output = "";
try {
  execFileSync(process.execPath, [tsc, "-p", path.join(out, "tsconfig.json"), "--pretty", "false"], { encoding: "utf8", stdio: "pipe" });
} catch (error) {
  output = String((error as { stdout?: string }).stdout ?? error);
}

const failures = new Map<string, string[]>();
for (const line of output.split(/\r?\n/)) {
  const m = line.match(/src[\\/]([^\\/()]+\.tsx)\((\d+),(\d+)\): error (TS\d+: .*)$/);
  if (!m) continue;
  const key = origin.get(m[1]) ?? m[1];
  failures.set(key, [...(failures.get(key) ?? []), `  ${m[1]}:${m[2]} ${m[4]}`]);
}

if (failures.size === 0 && output.trim()) {
  console.error(output);
  process.exit(1);
}
if (failures.size > 0) {
  for (const [key, lines] of failures) console.error(`✗ ${key}\n${lines.join("\n")}`);
  console.error(`\ncheck-examples: ${failures.size}/${count} ví dụ lỗi — file sinh ra ở ${posix(path.relative(root, out))}/src`);
  process.exit(1);
}
console.log(`check-examples: OK — ${count} ví dụ của ${COMPONENTS.length} trang component typecheck được khi import từ "yugen-ui".`);
