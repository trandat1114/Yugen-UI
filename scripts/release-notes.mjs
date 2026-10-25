#!/usr/bin/env node
/**
 * Ghi chú cho GitHub Release từ một mục của CHANGELOG (release.yml, release-cli.yml).
 *
 *   node scripts/release-notes.mjs CHANGELOG.md 0.11.0                # yugen-ui: mục "## 0.11.0"
 *   node scripts/release-notes.mjs packages/cli/CHANGELOG.md 0.4.0    # CLI
 *
 * In nội dung giữa "## <version>" (hoặc "## [<version>]") và tiêu đề "## " kế tiếp. Bỏ mã commit Changesets ở đầu
 * mỗi mục ("- 73aa98e: …" → "- …"). Không tìm thấy mục → thoát mã 1.
 */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function releaseNotes(changelog, version) {
  const lines = changelog.replace(/\r\n/g, "\n").split("\n");
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^##\\s+\\[?${escaped}\\]?(?=\\s|$)`);
  const start = lines.findIndex((l) => heading.test(l));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end))
    .map((l) => l.replace(/^- [0-9a-f]{7,40}: /, "- "))
    .join("\n")
    .replace(/^\n?\[[^\]]+\]: \S+$/gm, "")
    .trim();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [file, version] = process.argv.slice(2);
  const notes = file && version ? releaseNotes(fs.readFileSync(file, "utf8"), version) : null;
  if (!notes) {
    console.error(`release-notes: không tìm thấy mục "## ${version}" trong ${file}.`);
    process.exitCode = 1;
  } else console.log(notes);
}
