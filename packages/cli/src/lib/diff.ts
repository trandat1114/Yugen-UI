/** Diff theo dòng (LCS) ra dạng unified, đủ cho file component vài trăm dòng — không thêm dependency. */

type Op = { kind: " " | "-" | "+"; line: string };

const splitLines = (text: string) => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
};

function lineOps(a: string[], b: string[]): Op[] {
  // Bảng độ dài LCS từ cuối lên; bỏ phần đầu / cuối trùng nhau trước để bảng nhỏ.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const x = a.slice(start, endA);
  const y = b.slice(start, endB);
  const lcs = Array.from({ length: x.length + 1 }, () => new Uint32Array(y.length + 1));
  for (let i = x.length - 1; i >= 0; i--)
    for (let j = y.length - 1; j >= 0; j--) lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);

  const ops: Op[] = a.slice(0, start).map((line) => ({ kind: " ", line }));
  let i = 0;
  let j = 0;
  while (i < x.length || j < y.length) {
    if (i < x.length && j < y.length && x[i] === y[j]) {
      ops.push({ kind: " ", line: x[i++] });
      j++;
    } else if (i < x.length && (j === y.length || lcs[i + 1][j] >= lcs[i][j + 1])) ops.push({ kind: "-", line: x[i++] });
    else ops.push({ kind: "+", line: y[j++] });
  }
  for (const line of a.slice(endA)) ops.push({ kind: " ", line });
  return ops;
}

export interface DiffStats {
  added: number;
  removed: number;
}

export interface UnifiedDiff extends DiffStats {
  /** Các dòng của diff (không màu), rỗng khi hai bản giống nhau. */
  lines: string[];
}

/** Diff unified từ `before` sang `after`, `context` dòng ngữ cảnh quanh mỗi thay đổi. */
export function unifiedDiff(before: string, after: string, { from = "a", to = "b", context = 3 } = {}): UnifiedDiff {
  const a = splitLines(before);
  const b = splitLines(after);
  const ops = lineOps(a, b);
  const changed = ops.map((op, k) => (op.kind === " " ? -1 : k)).filter((k) => k >= 0);
  if (!changed.length) return { lines: [], added: 0, removed: 0 };

  // Gom các thay đổi cách nhau ≤ 2·context dòng vào cùng một hunk.
  const hunks: [number, number][] = [];
  for (const k of changed) {
    const last = hunks.at(-1);
    if (last && k - last[1] <= 2 * context) last[1] = k;
    else hunks.push([k, k]);
  }

  const lines = [`--- ${from}`, `+++ ${to}`];
  let added = 0;
  let removed = 0;
  for (const [first, last] of hunks) {
    const lo = Math.max(0, first - context);
    const hi = Math.min(ops.length - 1, last + context);
    // Số dòng bắt đầu của hunk ở mỗi phía = số dòng của phía đó đứng trước `lo`.
    const before = ops.slice(0, lo);
    const startA = before.filter((op) => op.kind !== "+").length + 1;
    const startB = before.filter((op) => op.kind !== "-").length + 1;
    const body = ops.slice(lo, hi + 1);
    const lenA = body.filter((op) => op.kind !== "+").length;
    const lenB = body.filter((op) => op.kind !== "-").length;
    lines.push(`@@ -${startA},${lenA} +${startB},${lenB} @@`);
    for (const op of body) {
      if (op.kind === "+") added++;
      if (op.kind === "-") removed++;
      lines.push(`${op.kind}${op.line}`);
    }
  }
  return { lines, added, removed };
}
