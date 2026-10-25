#!/usr/bin/env node
/**
 * Dọn nhánh đã hết tác dụng trên GitHub (luật: wiki › Branching and Release Channels › Dọn nhánh).
 *
 *   node scripts/prune-branches.mjs                       # chỉ in báo cáo Markdown, không xoá gì
 *   node scripts/prune-branches.mjs --apply               # xoá nhánh "Xoá" (PR đã merge / đã đóng đủ lâu, đã nằm trong main / next)
 *   node scripts/prune-branches.mjs --apply --include-abandoned   # xoá thêm nhánh "Cần xem" (không có PR, lâu không có commit)
 *   node scripts/prune-branches.mjs --local [--apply]     # thêm nhánh local: đã nằm trong origin/main | next, hoặc remote đã mất và PR đã merge
 *   --json                                                # { delete, review, keep } thay cho Markdown
 *   --branches <file.json> --today YYYY-MM-DD             # dữ liệu / ngày cho trước thay cho GitHub / hôm nay (test)
 *
 * Cần `gh` đã đăng nhập (hoặc GH_TOKEN). Không bao giờ đụng main, next, canary, gh-pages, release/* và nhánh mặc định.
 * Mỗi nhánh bị xoá được in kèm SHA và lệnh khôi phục.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

/** Không bao giờ xoá. */
export const PROTECTED = [/^main$/, /^next$/, /^canary$/, /^gh-pages$/, /^release\/.+/];
/** PR đóng (không merge) bao lâu thì xoá được nhánh — đầu PR vẫn còn ở refs/pull/<số>/head. */
export const CLOSED_DAYS = 14;
/** Nhánh không có PR, không có commit bao lâu thì đưa vào "Cần xem". exp/ được lâu hơn. */
export const ABANDONED_DAYS = 30;
export const EXP_ABANDONED_DAYS = 60;

const DAY = 24 * 60 * 60 * 1000;

/**
 * Một nhánh → { action: "delete" | "review" | "keep", reason }.
 * `branch`: { name, sha, date, inBase, prs: [{ number, state, headSha, closedAt }] } (prs mới nhất trước).
 */
export function classify(branch, { today, defaultBranch = "main" }) {
  const age = Math.floor((today - new Date(branch.date)) / DAY);
  if (branch.name === defaultBranch || PROTECTED.some((re) => re.test(branch.name)))
    return { action: "keep", reason: "nhánh dài hạn" };
  const open = branch.prs.find((pr) => pr.state === "OPEN");
  if (open) return { action: "keep", reason: `PR #${open.number} đang mở` };
  if (branch.inBase) return { action: "delete", reason: "commit cuối đã nằm trong main / next" };

  const pr = branch.prs[0];
  if (pr && pr.headSha === branch.sha) {
    if (pr.state === "MERGED") return { action: "delete", reason: `PR #${pr.number} đã merge` };
    const closedAgo = Math.floor((today - new Date(pr.closedAt)) / DAY);
    if (closedAgo >= CLOSED_DAYS)
      return { action: "delete", reason: `PR #${pr.number} đóng không merge ${closedAgo} ngày trước` };
    return { action: "keep", reason: `PR #${pr.number} mới đóng ${closedAgo} ngày` };
  }
  if (pr && pr.state === "MERGED") return { action: "review", reason: `có commit sau khi PR #${pr.number} merge` };

  const limit = branch.name.startsWith("exp/") ? EXP_ABANDONED_DAYS : ABANDONED_DAYS;
  if (age >= limit) return { action: "review", reason: `không có PR, ${age} ngày không có commit` };
  return { action: "keep", reason: `đang làm (commit ${age} ngày trước)` };
}

export function plan(branches, options) {
  const out = { delete: [], review: [], keep: [] };
  for (const b of branches) {
    const { action, reason } = classify(b, options);
    out[action].push({ name: b.name, sha: b.sha, date: b.date.slice(0, 10), reason });
  }
  for (const list of Object.values(out)) list.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export function report(result, { applied = [] } = {}) {
  const section = (title, rows) =>
    rows.length === 0
      ? []
      : [`### ${title} (${rows.length})`, "", "| Nhánh | Commit cuối | Lý do |", "|---|---|---|",
         ...rows.map((r) => `| \`${r.name}\` | ${r.date} | ${r.reason} |`), ""];
  return [
    `## Dọn nhánh: xoá ${result.delete.length}, cần xem ${result.review.length}, giữ ${result.keep.length}`,
    "",
    ...section("Xoá", result.delete),
    ...section("Cần xem (xoá với --include-abandoned)", result.review),
    ...section("Giữ", result.keep),
    ...(applied.length
      ? ["### Đã xoá", "", "Khôi phục: `git push origin <sha>:refs/heads/<nhánh>`", "", "```",
         ...applied.map((r) => `${r.sha} ${r.name}`), "```", ""]
      : []),
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------------------------

const QUERY = `query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef { name }
    refs(refPrefix: "refs/heads/", first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        target { ... on Commit { oid committedDate } }
        associatedPullRequests(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
          nodes { number state headRefOid closedAt }
        }
      }
    }
  }
}`;

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryRun = (cmd, args) => {
  try {
    return run(cmd, args);
  } catch {
    return null;
  }
};

function repoSlug(args) {
  const flag = args.includes("--repo") ? args[args.indexOf("--repo") + 1] : process.env.GITHUB_REPOSITORY;
  if (flag) return flag;
  const url = run("git", ["remote", "get-url", "origin"]);
  return /github\.com[/:]([^/]+\/[^/]+?)(\.git)?$/.exec(url)?.[1];
}

const isAncestor = (sha, ref) => tryRun("git", ["merge-base", "--is-ancestor", sha, ref]) !== null;

function fetchBranches(slug) {
  const [owner, name] = slug.split("/");
  run("git", ["fetch", "--quiet", "--prune", "origin"]);
  const bases = ["origin/main", "origin/next"].filter((ref) => tryRun("git", ["rev-parse", "--verify", "--quiet", ref]));
  const branches = [];
  let defaultBranch = "main";
  let cursor = null;
  do {
    const vars = ["-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `name=${name}`, ...(cursor ? ["-F", `cursor=${cursor}`] : [])];
    const repo = JSON.parse(run("gh", ["api", "graphql", ...vars])).data.repository;
    defaultBranch = repo.defaultBranchRef.name;
    for (const ref of repo.refs.nodes) {
      const sha = ref.target.oid;
      branches.push({
        name: ref.name,
        sha,
        date: ref.target.committedDate,
        inBase: bases.some((base) => isAncestor(sha, base)),
        prs: ref.associatedPullRequests.nodes.map((pr) => ({
          number: pr.number,
          state: pr.state,
          headSha: pr.headRefOid,
          closedAt: pr.closedAt,
        })),
      });
    }
    cursor = repo.refs.pageInfo.hasNextPage ? repo.refs.pageInfo.endCursor : null;
  } while (cursor);
  return { branches, defaultBranch };
}

/** Nhánh local xoá được: đã nằm trong origin/main | next, hoặc remote đã mất và PR của nó đã merge đúng commit đó. */
function localCandidates() {
  const checkedOut = new Set(
    run("git", ["worktree", "list", "--porcelain"])
      .split("\n")
      .filter((l) => l.startsWith("branch refs/heads/"))
      .map((l) => l.slice("branch refs/heads/".length)),
  );
  const rows = run("git", ["for-each-ref", "refs/heads", "--format=%(refname:short)\t%(objectname)\t%(upstream:track)"]);
  const out = [];
  for (const line of rows.split("\n").filter(Boolean)) {
    const [name, sha, track] = line.split("\t");
    if (checkedOut.has(name) || PROTECTED.some((re) => re.test(name))) continue;
    if (["origin/main", "origin/next"].some((base) => isAncestor(sha, base))) {
      out.push({ name, sha, reason: "đã nằm trong origin/main / next" });
      continue;
    }
    if (track !== "[gone]") continue;
    const merged = tryRun("gh", ["pr", "list", "--head", name, "--state", "merged", "--json", "number,headRefOid"]);
    const pr = merged && JSON.parse(merged).find((p) => p.headRefOid === sha);
    if (pr) out.push({ name, sha, reason: `remote đã xoá, PR #${pr.number} đã merge` });
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const today = opt("--today") ? new Date(`${opt("--today")}T00:00:00Z`) : new Date();
  const apply = args.includes("--apply");

  const fixture = opt("--branches");
  const slug = fixture ? null : repoSlug(args);
  const { branches, defaultBranch } = fixture ? JSON.parse(fs.readFileSync(fixture, "utf8")) : fetchBranches(slug);
  const result = plan(branches, { today, defaultBranch });
  const targets = [...result.delete, ...(args.includes("--include-abandoned") ? result.review : [])];

  const applied = [];
  if (apply && !fixture) {
    for (const b of targets) {
      // Xoá qua API (không cần quyền push của remote local); bỏ qua nhánh đã bị xoá ở nơi khác giữa chừng.
      if (tryRun("gh", ["api", "-X", "DELETE", `repos/${slug}/git/refs/heads/${b.name}`]) !== null) applied.push(b);
      else console.error(`Không xoá được ${b.name}`);
    }
  }

  if (args.includes("--json")) console.log(JSON.stringify({ ...result, applied }, null, 2));
  else console.log(report(result, { applied }));

  if (args.includes("--local")) {
    const local = localCandidates();
    console.log(`\n## Nhánh local (${local.length})\n`);
    for (const b of local) {
      if (apply) run("git", ["branch", "-D", b.name]);
      console.log(`- \`${b.name}\` ${b.sha.slice(0, 7)} — ${b.reason}${apply ? " — đã xoá" : ""}`);
    }
    if (apply) run("git", ["worktree", "prune"]);
  }
  if (!apply && targets.length) console.log("\nChưa xoá gì. Thêm --apply để xoá các nhánh ở mục Xoá.");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
