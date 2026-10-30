#!/usr/bin/env node
/**
 * Danh sách người đóng góp cho trang /contributors (#248): đọc PR đã merge, issue và review từ GitHub API, cộng phần ghi
 * tay trong src/docs/contributors.extra.json, ghi ra src/docs/contributors.json.
 *
 *   npm run contributors        (cần GITHUB_TOKEN; trên máy: GITHUB_TOKEN=$(gh auth token) npm run contributors)
 *
 * pages.yml chạy lệnh này trước khi build docs nên site đã deploy luôn mới; file commit trong repo là snapshot cho build
 * ở máy và CI. Không có token hoặc API lỗi: giữ snapshot, chỉ cảnh báo, không làm hỏng lần deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "src/docs/contributors.json");
const EXTRA = path.join(root, "src/docs/contributors.extra.json");
const REPO = { owner: "trandat1114", name: "Yugen-UI" };

/** Thứ tự hiển thị của các loại đóng góp (trang /contributors đọc cùng danh sách này). */
export const TYPES = ["code", "templates", "docs", "translation", "design", "review", "bug", "a11y", "idea"];

/** Issue mang nhãn này không được tính (trùng, không hợp lệ, chỉ là câu hỏi). */
const SKIP_LABELS = new Set(["invalid", "duplicate", "question"]);

/** File sinh ra hoặc không phải nội dung đóng góp: không dùng để xếp loại PR. */
const IGNORED = [/^\.changeset\//, /(^|\/)CHANGELOG\.md$/, /^ROADMAP\.md$/, /(^|\/)package-lock\.json$/, /^templates\//, /^e2e\/__screenshots__\//];

/** Loại đóng góp của một file trong PR. */
export function fileType(file) {
  if (/^src\/docs\/i18n\//.test(file) || /^src\/docs\/.+\/en\//.test(file) || /(^|\/)messages(-en)?\.ts$/.test(file)) return "translation";
  if (/^src\/docs\/(template|block)-library\//.test(file)) return "templates";
  if (/\.md$/.test(file) || /^wiki\//.test(file) || /^src\/docs\//.test(file)) return "docs";
  return "code";
}

/** Các loại của một PR theo file nó sửa; PR chỉ đụng file sinh ra vẫn tính là code. */
export function pullTypes(files) {
  const types = new Set(files.filter((file) => !IGNORED.some((re) => re.test(file))).map(fileType));
  return types.size ? TYPES.filter((t) => types.has(t)) : ["code"];
}

/**
 * Loại của một issue theo nhãn mà mẫu issue tự gắn (repo tắt issue trống); null nếu không tính. Issue không có nhãn loại
 * là việc maintainer tự ghi (kế hoạch, release), không phải báo lỗi.
 */
export function issueType(labels) {
  if (labels.some((label) => SKIP_LABELS.has(label))) return null;
  if (labels.includes("accessibility")) return "a11y";
  if (labels.includes("bug") || labels.includes("documentation")) return "bug";
  if (labels.includes("enhancement")) return "idea";
  return null;
}

const isPerson = (actor) => actor?.__typename === "User" && !actor.login.endsWith("[bot]");
const day = (iso) => iso.slice(0, 10);

/**
 * Gom dữ liệu thô (node GraphQL của PR đã merge và issue) + phần ghi tay thành danh sách người đóng góp. Maintainer đứng
 * đầu, sau đó theo ngày đóng góp đầu tiên. `items` (từng đóng góp, để ghi công theo bản phát hành) chỉ giữ cho người không
 * phải maintainer, tối đa `maxItems` mục mới nhất.
 */
export function buildContributors({ pulls, issues }, extra = {}, { maxItems = 50 } = {}) {
  const maintainers = new Set(extra.maintainers ?? []);
  const exclude = new Set(extra.exclude ?? []);
  const people = new Map();

  const add = (actor, types, item) => {
    if (exclude.has(actor.login)) return;
    let person = people.get(actor.login);
    if (!person) {
      person = {
        login: actor.login,
        name: actor.name || actor.login,
        avatar: actor.avatarUrl ?? `https://github.com/${actor.login}.png`,
        first: item.date,
        counts: {},
        items: [],
      };
      people.set(actor.login, person);
    }
    if (actor.name) person.name = actor.name;
    if (actor.avatarUrl) person.avatar = actor.avatarUrl;
    if (item.date < person.first) person.first = item.date;
    for (const type of types) person.counts[type] = (person.counts[type] ?? 0) + 1;
    person.items.push({ types, ...item });
  };

  for (const pr of pulls) {
    const item = { number: pr.number, title: pr.title, date: day(pr.mergedAt), url: pr.url };
    if (isPerson(pr.author)) add(pr.author, pullTypes(pr.files.nodes.map((f) => f.path)), item);
    const reviewers = new Map();
    for (const review of pr.reviews.nodes) {
      if (isPerson(review.author) && review.author.login !== pr.author?.login) reviewers.set(review.author.login, review.author);
    }
    for (const reviewer of reviewers.values()) add(reviewer, ["review"], item);
  }

  for (const issue of issues) {
    const type = issueType(issue.labels.nodes.map((l) => l.name));
    // Bỏ tiền tố của mẫu issue ("[Bug]: …").
    const title = issue.title.replace(/^\[[^\]]*\]:?\s*/, "");
    if (type && isPerson(issue.author)) add(issue.author, [type], { number: issue.number, title, date: day(issue.createdAt), url: issue.url });
  }

  for (const entry of extra.people ?? []) {
    add({ login: entry.login, name: entry.name }, entry.types, { title: entry.title, date: entry.date, ...(entry.url && { url: entry.url }) });
  }

  return [...people.values()]
    .map(({ items, ...person }) => {
      const maintainer = maintainers.has(person.login);
      const counts = Object.fromEntries(TYPES.filter((t) => person.counts[t]).map((t) => [t, person.counts[t]]));
      const recent = items.sort((a, b) => b.date.localeCompare(a.date) || (b.number ?? 0) - (a.number ?? 0)).slice(0, maxItems);
      return { ...person, ...(maintainer && { maintainer }), counts, ...(!maintainer && { items: recent }) };
    })
    .sort((a, b) => Number(Boolean(b.maintainer)) - Number(Boolean(a.maintainer)) || a.first.localeCompare(b.first) || a.login.localeCompare(b.login));
}

const ACTOR = "author { __typename login avatarUrl ... on User { name } }";
const QUERIES = {
  pulls: `query($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      list: pullRequests(states: MERGED, first: 50, after: $cursor, orderBy: { field: CREATED_AT, direction: ASC }) {
        pageInfo { hasNextPage endCursor }
        nodes { number title url mergedAt ${ACTOR} files(first: 100) { nodes { path } } reviews(first: 30) { nodes { ${ACTOR} } } }
      }
    }
  }`,
  issues: `query($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      list: issues(first: 100, after: $cursor, orderBy: { field: CREATED_AT, direction: ASC }) {
        pageInfo { hasNextPage endCursor }
        nodes { number title url createdAt ${ACTOR} labels(first: 20) { nodes { name } } }
      }
    }
  }`,
};

async function fetchAll(query, token) {
  const nodes = [];
  let cursor = null;
  do {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "user-agent": "yugen-ui-contributors" },
      body: JSON.stringify({ query, variables: { ...REPO, cursor } }),
    });
    const body = await res.json();
    if (!res.ok || body.errors) throw new Error(body.errors?.[0]?.message ?? `HTTP ${res.status}`);
    const { list } = body.data.repository;
    nodes.push(...list.nodes);
    cursor = list.pageInfo.hasNextPage ? list.pageInfo.endCursor : null;
  } while (cursor);
  return nodes;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.warn("⚠ contributors: thiếu GITHUB_TOKEN, giữ src/docs/contributors.json hiện có.");
    return;
  }
  try {
    const [pulls, issues] = await Promise.all([fetchAll(QUERIES.pulls, token), fetchAll(QUERIES.issues, token)]);
    const extra = JSON.parse(fs.readFileSync(EXTRA, "utf8"));
    const people = buildContributors({ pulls, issues }, extra);
    const data = { updated: new Date().toISOString().slice(0, 10), people };
    fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
    console.log(`contributors: ${people.length} người (${pulls.length} PR, ${issues.length} issue) → src/docs/contributors.json`);
  } catch (error) {
    console.warn(`⚠ contributors: không đọc được GitHub API (${error.message}), giữ snapshot hiện có.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
