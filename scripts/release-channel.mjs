#!/usr/bin/env node
/**
 * Chọn dist-tag npm cho một tag phát hành và kiểm tra tag nằm đúng nhánh (workflow release.yml).
 *
 *   vX.Y.Z-next.N | -rc.N | -beta.N  → phải nằm trên next hoặc release/*  → dist-tag "next"
 *   vX.Y.Z  (≥ bản latest trên npm)  → phải nằm trên main hoặc release/*  → "latest"
 *   vX.Y.Z  (< bản latest)           → phải nằm trên release/X.Y          → "release-X.Y" (vá minor cũ, không chiếm latest)
 *
 *   node scripts/release-channel.mjs v0.7.0-next.1        # in ra dist-tag
 *   node scripts/release-channel.mjs v0.6.2 --latest 0.7.0 --branches release/0.6   # thử offline
 */
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const tag = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const fail = (msg) => {
  console.error(`release-channel: ${msg}`);
  process.exit(1);
};

const m = tag?.match(/^v(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/);
if (!m) fail(`tag không hợp lệ "${tag ?? ""}" (cần vX.Y.Z hoặc vX.Y.Z-next.N).`);
const [, major, minor, patch, pre] = m;
const version = [major, minor, patch].map(Number);

const sh = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const branches = (opt("branches") ?? sh("git", ["branch", "-r", "--contains", process.env.GITHUB_SHA ?? "HEAD"]))
  .split(/[\s,]+/)
  .map((b) => b.replace(/^origin\//, ""))
  .filter(Boolean);
const onBranch = (re) => branches.some((b) => re.test(b));

if (pre) {
  if (!onBranch(/^(next|release\/.+)$/)) fail(`prerelease ${tag} phải được tag trên next hoặc release/* (đang ở: ${branches.join(", ") || "?"}).`);
  console.log("next");
  process.exit(0);
}

let latest = opt("latest");
if (!latest) {
  try {
    latest = sh("npm", ["view", "yugen-ui", "version"]);
  } catch {
    latest = "0.0.0"; // chưa từng publish
  }
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const isNewest = cmp(version, latest.split(".").map(Number)) >= 0;

if (isNewest) {
  if (!onBranch(/^(main|release\/.+)$/)) fail(`bản ổn định ${tag} phải được tag trên main hoặc release/*.`);
  console.log("latest");
} else {
  const line = `release/${major}.${minor}`;
  if (!onBranch(new RegExp(`^${line.replace(".", "\\.")}$`))) fail(`${tag} thấp hơn latest (${latest}) nên phải được tag trên ${line}.`);
  console.log(`release-${major}.${minor}`);
}
