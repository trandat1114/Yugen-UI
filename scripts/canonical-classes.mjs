#!/usr/bin/env node
/**
 * Quét (và sửa) class Tailwind chưa ở dạng canonical — cùng logic với cảnh báo
 * "suggestCanonicalClasses" của Tailwind CSS IntelliSense (vd. `start-4` → `inset-s-4`), thêm luật riêng của repo:
 * spacing viết hoa (`p-M`, `gap-XL`, alias theo tên Fluent, deprecated) → thang số (`p-3`, `gap-5`) — #42.
 *
 *   node scripts/canonical-classes.mjs          # chỉ báo cáo, exit 1 nếu có vi phạm
 *   node scripts/canonical-classes.mjs --fix    # tự sửa tại chỗ
 *   node scripts/canonical-classes.mjs src/components/ui/Button   # giới hạn thư mục/file
 */
import fs from "node:fs";
import path from "node:path";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";

const root = process.cwd();
const fix = process.argv.includes("--fix");
const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const scanRoots = targets.length ? targets : ["src"];

const css = fs.readFileSync(path.join(root, "src/index.css"), "utf8");
const ds = await __unstable__loadDesignSystem(css, { base: path.join(root, "src") });

function walk(p, out = []) {
  const stat = fs.statSync(p);
  if (stat.isFile()) {
    if (/\.(tsx?|jsx?|html)$/.test(p) && !p.endsWith(".d.ts")) out.push(p);
    return out;
  }
  for (const name of fs.readdirSync(p)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    walk(path.join(p, name), out);
  }
  return out;
}

const files = scanRoots.flatMap((r) => walk(path.resolve(root, r)));

// Token ứng viên: chuỗi không chứa khoảng trắng / dấu nháy / backtick nằm giữa các ranh giới đó.
const TOKEN = /(?<=^|[\s"'`{])([!\-a-zA-Z0-9_:@[\]().,%#/*&>=~+|^$]+)(?=$|[\s"'`}])/g;
const cache = new Map();

// Spacing viết hoa (alias theo tên Fluent, deprecated — #42) → thang số của Tailwind, cùng giá trị ở cỡ chữ gốc 16px.
const SPACING_STEP = { XXS: "0.5", XS: "1", SNudge: "1.5", S: "2", MNudge: "2.5", M: "3", L: "4", XL: "5", XXL: "6", XXXL: "8" };
const SPACING_UTILITY = new RegExp(
  "^((?:[^:\\s]+:)*!?)(-?)" +
    "(p|px|py|ps|pe|pt|pb|pl|pr|m|mx|my|ms|me|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|" +
    "inset|inset-x|inset-y|inset-s|inset-e|inset-bs|inset-be|top|bottom|left|right|start|end|" +
    "w|h|size|min-w|min-h|max-w|max-h|scroll-m[xyseltbr]?|scroll-p[xyseltbr]?|translate-x|translate-y|basis|indent|" +
    "border-spacing(?:-[xy])?)" +
    "-(XXXL|XXL|XL|L|MNudge|M|SNudge|S|XS|XXS)(!?)$",
);

function numericSpacing(candidate) {
  const m = SPACING_UTILITY.exec(candidate);
  return m ? `${m[1]}${m[2]}${m[3]}-${SPACING_STEP[m[4]]}${m[5]}` : null;
}

function canonical(candidate) {
  if (cache.has(candidate)) return cache.get(candidate);
  const numeric = numericSpacing(candidate);
  const base = numeric ?? candidate;
  let result = numeric;
  const [compiled] = ds.candidatesToCss([base]);
  if (compiled) {
    const [next] = ds.canonicalizeCandidates([base], { rem: 16 });
    if (next && next !== base) result = next;
  }
  cache.set(candidate, result);
  return result;
}

let total = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  // File kiểm tra chính các alias deprecated (vd. src/lib/cn.aliases.test.ts) tự đánh dấu để được bỏ qua.
  if (src.includes("lint:classes ignore-file")) continue;
  const found = new Map();
  for (const m of src.matchAll(TOKEN)) {
    const token = m[1];
    if (token.length < 2 || !/[a-z]/.test(token)) continue;
    const next = canonical(token);
    if (next) found.set(token, next);
  }
  if (found.size === 0) continue;
  total += found.size;
  const rel = path.relative(root, file);
  for (const [from, to] of found) console.log(`${rel}: ${from} → ${to}`);
  if (fix) {
    let out = src;
    for (const [from, to] of found) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out = out.replace(new RegExp(`(?<=^|[\\s"'\`{])${escaped}(?=$|[\\s"'\`}])`, "g"), to);
    }
    fs.writeFileSync(file, out);
  }
}

console.log(total ? `\n${total} class chưa canonical${fix ? " — đã sửa." : "."}` : "Tất cả class đã canonical.");
if (total && !fix) process.exit(1);
