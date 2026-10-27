/**
 * Quy tắc cho từng số của phiên bản X.Y.Z (docs › Versioning › Quy tắc cho từng số; wiki › Release Process).
 * scripts/check-release.mjs (yugen-ui, mảng NEWS) và packages/cli/scripts/check-release.mjs (CLI_NEWS) cùng dùng.
 *
 *   PATCH  x.y.Z  sửa lỗi và tinh chỉnh nhỏ: tin chỉ gồm `fixed` / `improved`. Tăng bao nhiêu cũng được.
 *   MINOR  x.Y.0  có ít nhất một mục `new` (hoặc `breaking` khi còn 0.x); cách bản minor / major trước ≥ 14 ngày.
 *   MAJOR  X.0.0  có ít nhất một mục `breaking`; cách bản major trước ≥ 180 ngày.
 *   Không nhảy số: 0.12.0 → 0.12.1 hoặc 0.13.0, không 0.14.0.
 *
 * Bản prerelease (-next.N, canary) và bản phát hành trước RULES_SINCE không bị kiểm tra.
 */

/** Ngày các quy tắc có hiệu lực: bản phát hành (hoặc dự kiến) từ ngày này trở đi. */
export const RULES_SINCE = "2026-10-28";
/** Số ngày tối thiểu giữa hai bản cùng cấp. Patch không giới hạn. */
export const MIN_DAYS = { minor: 14, major: 180 };

export const core = (v) => v.split(/[-+]/)[0].split(".").map(Number);

/** "major" | "minor" | "patch" theo dạng của số phiên bản (1.0.0 là major, 0.13.0 là minor). */
export function level(version) {
  const [x, y, z] = core(version);
  return z > 0 ? "patch" : y > 0 || x === 0 ? "minor" : "major";
}

/**
 * Các mục của một mảng tin (`NEWS`, `CLI_NEWS`…) trong src/docs/news.ts, theo thứ tự trong file (mới trước).
 * `upcoming: true` phải viết ngay sau `version`, nên mỗi mục được cắt từ `version:` này tới `version:` kế tiếp.
 */
export function newsEntries(source, name) {
  const start = source.search(new RegExp(`export\\s+const\\s+${name}\\b[^=]*=\\s*\\[`));
  if (start === -1) return undefined;
  const end = source.indexOf("\n];", start);
  const body = source.slice(start, end === -1 ? undefined : end);
  return [...body.matchAll(/\bversion\s*:\s*["'`]([^"'`]+)["'`]([\s\S]*?)(?=\bversion\s*:|$)/g)].map((m) => ({
    version: m[1],
    upcoming: /\bupcoming\s*:\s*true\b/.test(m[2]),
    date: m[2].match(/\bdate\s*:\s*["'`](\d{4}-\d{2}-\d{2})["'`]/)?.[1] ?? "",
    kinds: [...m[2].matchAll(/\bkind\s*:\s*["'`](\w+)["'`]/g)].map((k) => k[1]),
  }));
}

const days = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/**
 * Lỗi của mục tin `entry` theo các quy tắc trên. `older`: các mục cũ hơn (mới trước), bỏ qua mục `upcoming`.
 * `name` chỉ để ghi trong thông báo, vd. "NEWS".
 */
export function releaseRuleErrors(entry, older, name) {
  const { version, date, kinds } = entry;
  if (version.includes("-") || !date || date < RULES_SINCE) return [];
  const errors = [];
  const at = `src/docs/news.ts › ${name} ${version}`;
  const [x, y, z] = core(version);
  const kind = level(version);
  const released = older.filter((e) => !e.upcoming && !e.version.includes("-"));

  if (kind === "patch" && kinds.some((k) => k === "new" || k === "breaking"))
    errors.push(
      `${at}: bản patch chỉ gồm sửa lỗi và tinh chỉnh nhỏ (kind "fixed" / "improved"). Mục "new" hoặc "breaking" ` +
        `để dành cho bản ${x}.${y + 1}.0.`,
    );
  if (kind === "minor" && !kinds.some((k) => k === "new" || (x === 0 && k === "breaking")))
    errors.push(
      `${at}: bản minor cần ít nhất một mục "new"${x === 0 ? ' (hoặc "breaking")' : ""}. Chỉ có sửa lỗi và tinh chỉnh thì ` +
        `phát hành bản patch.`,
    );
  if (kind === "minor" && x > 0 && kinds.includes("breaking"))
    errors.push(`${at}: từ 1.0, thay đổi phá vỡ chỉ có ở bản major (${x + 1}.0.0). Deprecate trong bản minor trước.`);
  if (kind === "major" && !kinds.includes("breaking"))
    errors.push(`${at}: bản major cần ít nhất một mục "breaking". Không có thay đổi phá vỡ thì phát hành bản minor.`);

  // Không nhảy số: bản liền trước ở vị trí tăng phải có trong tin.
  const previous = kind === "patch" ? `${x}.${y}.${z - 1}` : kind === "minor" ? `${x}.${y - 1}.` : `${x - 1}.`;
  const found = released.some((e) => (kind === "patch" ? e.version === previous : e.version.startsWith(previous)));
  if (released.length && !found)
    errors.push(`${at}: nhảy số — chưa có bản ${kind === "patch" ? previous : `${previous}x`} trước đó.`);

  // Nhịp: minor cách bản minor / major trước, major cách bản major trước.
  if (kind !== "patch") {
    const last = released.find((e) => {
      const [a, b, c] = core(e.version);
      return c === 0 && (kind === "minor" || (a > 0 && b === 0));
    });
    const gap = last?.date ? days(last.date, date) : Infinity;
    if (gap < MIN_DAYS[kind])
      errors.push(
        `${at}: bản ${kind} cách ${last.version} (${last.date}) ${gap} ngày, tối thiểu ${MIN_DAYS[kind]} ngày. ` +
          `Gom tính năng vào milestone kế tiếp; sửa lỗi phát hành bằng bản patch.`,
      );
  }
  return errors;
}
