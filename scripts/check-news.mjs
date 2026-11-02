#!/usr/bin/env node
/**
 * Kiểm tra tin của trang Có gì mới (src/docs/news, #261) mà không cần `npm ci` hay build: định dạng từng file, bản vi
 * và en khớp nhau, `upcoming` chỉ ở bản mới nhất, và quy tắc cho từng số (scripts/release-rules.mjs). Workflow news.yml
 * chạy cho PR chỉ sửa tin (CI đầy đủ bỏ qua đường dẫn này); build docs cũng báo cùng lỗi qua plugin yugenNews.
 *
 *   node scripts/check-news.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FEEDS, readNews } from "./news.mjs";
import { releaseRuleErrors } from "./release-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { feeds, errors } = readNews(root);

for (const name of ["NEWS", "CLI_NEWS"]) {
  const entries = feeds[name].map(({ version, upcoming, date, vi }) => ({ version, upcoming, date, kinds: vi.items.map((i) => i.kind) }));
  entries.forEach((entry, i) => errors.push(...releaseRuleErrors(entry, entries.slice(i + 1), name)));
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
const count = Object.values(feeds).reduce((n, releases) => n + releases.length, 0);
console.log(`check-news: OK — ${count} bản phát hành trong ${Object.keys(FEEDS).length} gói, đủ tiếng Việt và tiếng Anh.`);
