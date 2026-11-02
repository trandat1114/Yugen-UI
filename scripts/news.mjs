/**
 * Tin của trang Có gì mới (/news), viết bằng Markdown trong src/docs/news/<gói>/<version>.<vi|en>.md (#261).
 * Một parser dùng chung cho plugin Vite (virtual:yugen-news-*), check-release, release-rules, sync-roadmap và
 * check-news (CI nhẹ cho PR chỉ sửa tin). Không phụ thuộc gì ngoài Node.
 *
 * Mỗi file:
 *
 *   ---
 *   date: 2026-11-11
 *   upcoming: true            ← chỉ mục mới nhất của một gói, viết trên next; commit phát hành bỏ dòng này
 *   ---
 *
 *   # Tiêu đề
 *
 *   Một đoạn tóm tắt.
 *
 *   ## Mới                    ← en: New · Improved · Fixed · Breaking
 *
 *   - Nội dung (Markdown inline). [→](/components/sonner)
 *
 * Bản vi và en của một version phải khớp: cùng `date`, `upcoming`, số mục, loại và link theo cùng thứ tự.
 */
import fs from "node:fs";
import path from "node:path";

export const NEWS_DIR = "src/docs/news";
export const LOCALES = ["vi", "en"];
/** Tên mảng (như trong code) → thư mục. */
export const FEEDS = { NEWS: "yugen-ui", CLI_NEWS: "cli", CREATE_NEWS: "create-yugen-ui" };
export const KIND_HEADINGS = {
  vi: { "Thay đổi lớn": "breaking", Mới: "new", "Cải tiến": "improved", "Sửa lỗi": "fixed" },
  en: { Breaking: "breaking", New: "new", Improved: "improved", Fixed: "fixed" },
};

const FILE = /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\.(vi|en)\.md$/;
const LINK = /\s*\[→\]\(([^)\s]*)\)\s*$/;

/**
 * Một file tin → `{ date, upcoming, title, summary, items }`. Lỗi đẩy vào `errors` dạng "file:dòng: …"; vẫn trả về
 * phần đọc được để kiểm tra tiếp.
 */
export function parseNewsFile(source, file, locale, errors) {
  const lines = source.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  const err = (line, message) => errors.push(`${file}:${line}: ${message}`);
  const out = { date: "", upcoming: false, title: "", summary: "", items: [] };
  let i = 0;

  if (lines[0] !== "---") err(1, "thiếu frontmatter (`---` ở dòng đầu, rồi `date: YYYY-MM-DD`).");
  else {
    for (i = 1; i < lines.length && lines[i] !== "---"; i++) {
      const m = /^(\w+):\s*(.*)$/.exec(lines[i]);
      if (m?.[1] === "date" && /^\d{4}-\d{2}-\d{2}$/.test(m[2])) out.date = m[2];
      else if (m?.[1] === "upcoming" && m[2] === "true") out.upcoming = true;
      else err(i + 1, `frontmatter chỉ nhận \`date: YYYY-MM-DD\` và \`upcoming: true\`, gặp "${lines[i]}".`);
    }
    if (i === lines.length) err(1, "frontmatter chưa đóng bằng `---`.");
    i++;
    if (!out.date) err(1, "thiếu `date: YYYY-MM-DD` trong frontmatter.");
  }

  const headings = KIND_HEADINGS[locale];
  const seen = new Set();
  const summary = [];
  let section = null;
  let item = null;
  for (; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;
    if (!line.trim()) {
      item = null;
      if (!section && summary.length && out.summary === "") out.summary = summary.join(" ");
      continue;
    }
    if (/^# /.test(line)) {
      if (out.title) err(n, "chỉ một tiêu đề `#` cho mỗi file.");
      else out.title = line.slice(2).trim();
      continue;
    }
    if (/^## /.test(line)) {
      const label = line.slice(3).trim();
      const kind = headings[label];
      if (!kind) err(n, `mục "${label}" không hợp lệ; dùng ${Object.keys(headings).map((h) => `"## ${h}"`).join(", ")}.`);
      else if (seen.has(kind)) err(n, `mục "${label}" xuất hiện hai lần.`);
      seen.add(kind);
      section = { kind, line: n, count: 0 };
      item = null;
      if (out.summary === "") out.summary = summary.join(" ");
      continue;
    }
    if (/^#/.test(line)) {
      err(n, "chỉ dùng `#` (tiêu đề) và `##` (loại thay đổi).");
      continue;
    }
    if (!out.title) {
      err(n, "dòng đầu sau frontmatter phải là tiêu đề `# …`.");
      out.title = "?";
    }
    if (!section) {
      if (out.summary !== "") err(n, "tóm tắt chỉ một đoạn văn.");
      else summary.push(line.trim());
      continue;
    }
    if (line.startsWith("- ")) {
      item = { kind: section.kind, text: line.slice(2).trim(), line: n };
      out.items.push(item);
      section.count++;
      continue;
    }
    if (item && /^\s+\S/.test(line)) {
      item.text += ` ${line.trim()}`;
      continue;
    }
    err(n, "trong một mục `##` chỉ có danh sách `- …`.");
  }
  if (out.summary === "" && summary.length) out.summary = summary.join(" ");
  if (!out.title) err(1, "thiếu tiêu đề `# …`.");
  if (!out.summary) err(1, "thiếu đoạn tóm tắt sau tiêu đề.");
  if (!out.items.length) err(1, "chưa có mục tin nào (`## …` rồi `- …`).");

  out.items = out.items.map(({ kind, text, line }) => {
    const m = LINK.exec(text);
    if (!m) return { kind, text };
    if (!m[1].startsWith("/") || m[1].startsWith("//") || m[1].startsWith("/#")) err(line, `link "${m[1]}" phải là đường dẫn trong docs, vd. "/components/button".`);
    const rest = text.slice(0, m.index).trim();
    if (!rest) err(line, "mục tin trống.");
    return { kind, text: rest, href: m[1] };
  });
  return out;
}

function compareVersions(a, b) {
  const [ca, pa = ""] = a.split(/-(.*)/s);
  const [cb, pb = ""] = b.split(/-(.*)/s);
  const na = ca.split(".").map(Number);
  const nb = cb.split(".").map(Number);
  for (let k = 0; k < 3; k++) if (na[k] !== nb[k]) return na[k] - nb[k];
  if (pa === pb) return 0;
  if (!pa) return 1;
  if (!pb) return -1;
  return pa.localeCompare(pb, "en", { numeric: true });
}

/**
 * Mọi bản phát hành của một gói (mới trước): `{ version, date, upcoming, vi, en }`, `vi` / `en` =
 * `{ title, summary, items }`. Lỗi định dạng và lệch giữa hai ngôn ngữ đẩy vào `errors`.
 */
export function readFeed(root, name, errors = []) {
  const rel = `${NEWS_DIR}/${FEEDS[name]}`;
  const dir = path.join(root, rel);
  const byVersion = new Map();
  for (const entry of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const m = FILE.exec(entry);
    if (!m) {
      errors.push(`${rel}/${entry}: tên file phải là <version>.vi.md hoặc <version>.en.md.`);
      continue;
    }
    const [, version, locale] = m;
    const parsed = parseNewsFile(fs.readFileSync(path.join(dir, entry), "utf8"), `${rel}/${entry}`, locale, errors);
    if (!byVersion.has(version)) byVersion.set(version, {});
    byVersion.get(version)[locale] = parsed;
  }

  const releases = [...byVersion.keys()].sort((a, b) => compareVersions(b, a)).map((version) => {
    const files = byVersion.get(version);
    const at = `${rel}/${version}`;
    for (const locale of LOCALES) if (!files[locale]) errors.push(`${at}.${locale}.md: thiếu (mỗi version cần cả bản vi và en).`);
    const vi = files.vi ?? files.en;
    const en = files.en ?? files.vi;
    if (vi.date !== en.date) errors.push(`${at}: \`date\` của bản vi (${vi.date}) và en (${en.date}) khác nhau.`);
    if (vi.upcoming !== en.upcoming) errors.push(`${at}: \`upcoming\` của bản vi và en khác nhau.`);
    if (vi.items.length !== en.items.length) errors.push(`${at}: bản vi có ${vi.items.length} mục tin, bản en có ${en.items.length}.`);
    else
      vi.items.forEach((a, k) => {
        const b = en.items[k];
        if (a.kind !== b.kind || a.href !== b.href)
          errors.push(`${at}: mục ${k + 1} lệch giữa vi (${a.kind} ${a.href ?? "không link"}) và en (${b.kind} ${b.href ?? "không link"}).`);
      });
    const strip = ({ title, summary, items }) => ({ title, summary, items });
    return { version, date: vi.date, upcoming: vi.upcoming, vi: strip(vi), en: strip(en) };
  });
  if (releases.slice(1).some((r) => r.upcoming)) errors.push(`${rel}: chỉ bản mới nhất được đánh dấu \`upcoming: true\`.`);
  return releases;
}

/** Cả ba gói: `{ feeds: { NEWS, CLI_NEWS, CREATE_NEWS }, errors }`. */
export function readNews(root) {
  const errors = [];
  const feeds = Object.fromEntries(Object.keys(FEEDS).map((name) => [name, readFeed(root, name, errors)]));
  return { feeds, errors };
}

/** Một gói theo một ngôn ngữ, dạng trang News dùng: `{ version, upcoming?, date, title, summary, items }[]`. */
export function localizeFeed(releases, locale) {
  return releases.map(({ version, date, upcoming, [locale]: text }) => ({ version, ...(upcoming ? { upcoming: true } : {}), date, ...text }));
}

/** Dạng release-rules / check-release cần: `{ version, upcoming, date, kinds }[]`, mới trước. */
export function newsEntries(root, name) {
  return readFeed(root, name).map(({ version, upcoming, date, vi }) => ({ version, upcoming, date, kinds: vi.items.map((i) => i.kind) }));
}
