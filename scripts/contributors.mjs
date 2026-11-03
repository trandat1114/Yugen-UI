#!/usr/bin/env node
/**
 * Danh sách người đóng góp cho trang /contributors (#248, #272): đọc từ GitHub API PR đã merge, review, issue, bình luận
 * trong issue và PR (timeline) và lịch sử commit của `next` (co-author), cộng phần ghi tay trong
 * src/docs/contributors.extra.json, ghi ra src/docs/contributors.json.
 *
 *   npm run contributors        (cần GITHUB_TOKEN; trên máy: GITHUB_TOKEN=$(gh auth token) npm run contributors)
 *   node scripts/contributors.mjs --out <file> --strict [--svg <dir>]
 *
 * pages.yml chạy lệnh này trước khi build docs (snapshot cho prerender); contributors.yml chạy với --out --strict sau mỗi
 * issue, bình luận, PR đóng và hằng ngày, đẩy kết quả lên nhánh contributors-data để trang tải bản mới. --svg vẽ thêm
 * ảnh đại diện từng nhóm (contributors-code.svg, contributors-ideas.svg) cho CONTRIBUTING.md và README (#275). Không có
 * token hoặc API lỗi: mặc định giữ snapshot và chỉ cảnh báo (không làm hỏng lần deploy); --strict thì thoát với mã 1.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "src/docs/contributors.json");
const EXTRA = path.join(root, "src/docs/contributors.extra.json");
const REPO = { owner: "trandat1114", name: "Yugen-UI" };
/** Nhánh có mọi commit đã qua review (PR vào next, release next → main được merge ngược lại). */
const HISTORY_REF = "refs/heads/next";

/** Thứ tự hiển thị của các loại đóng góp (trang /contributors đọc cùng danh sách này). */
export const TYPES = ["code", "templates", "docs", "translation", "design", "review", "discussion", "bug", "a11y", "idea"];

/** Issue mang nhãn này không được tính (trùng, không hợp lệ, chỉ là câu hỏi). */
const SKIP_LABELS = new Set(["invalid", "duplicate", "question"]);

/**
 * Bình luận ngắn hơn mức này ("+1", "Cảm ơn!", "LGTM") không tính là góp ý. Đếm trên chữ đã bỏ Markdown, khoảng trắng hai
 * đầu.
 */
export const MIN_COMMENT = 40;

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

/** Hai nhóm của trang /contributors; giống CONTRIBUTION_GROUPS trong src/docs/contributors.ts (test giữ hai bản khớp nhau). */
export const GROUPS = {
  code: ["code", "templates", "docs", "translation"],
  ideas: ["design", "review", "discussion", "bug", "a11y", "idea"],
};

/** Người có đóng góp thuộc nhóm, theo thứ tự của danh sách (maintainer trước, rồi theo lần đóng góp đầu). */
export const inGroup = (people, group) => people.filter((person) => GROUPS[group].some((type) => person.counts[type]));

const AVATAR = 48;
const GAP = 12;
const escapeXml = (text) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
/** Màu nền cố định theo login cho ảnh dự phòng (chữ trắng đọc được trên mọi màu này). */
const FALLBACK_HUES = [340, 200, 150, 30, 270, 0, 180, 90];
const hueOf = (login) => FALLBACK_HUES[[...login].reduce((sum, c) => sum + c.charCodeAt(0), 0) % FALLBACK_HUES.length];

/**
 * Ảnh đại diện của một nhóm, cho CONTRIBUTING.md và README (#275). `avatars`: login → data URI; SVG hiện qua <img> không
 * tải được ảnh ngoài nên ảnh phải nhúng sẵn, người không có ảnh thì là vòng tròn màu với chữ cái đầu. Không có chữ nào
 * phụ thuộc nền (nút "+N" có màu riêng), nên một file dùng được cả theme sáng lẫn tối; tiêu đề nhóm là chữ Markdown bên
 * ngoài. Quá `max` người thì hiện `max - 1` người đầu và một nụ "+N".
 */
export function renderAvatarsSvg(people, avatars = new Map(), { perRow = 14, max = 56 } = {}) {
  const shown = people.length > max ? people.slice(0, max - 1) : people;
  const rest = people.length - shown.length;
  const slots = Math.max(shown.length + (rest ? 1 : 0), 1);
  const step = AVATAR + GAP;
  // 2px lề để viền và bông hoa nhỏ không bị cắt.
  const width = Math.min(slots, perRow) * step - GAP + 4;
  const height = Math.ceil(slots / perRow) * step - GAP + 4;
  const at = (i) => `translate(${(i % perRow) * step + 2} ${Math.floor(i / perRow) * step + 2})`;
  const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cy="-3.2" rx="2.4" ry="3.4" transform="rotate(${a})"/>`).join("");
  const parts = shown.map((person, i) => {
    const name = escapeXml(person.name === person.login ? `@${person.login}` : `${person.name} (@${person.login})`);
    const src = avatars.get(person.login);
    const face = src
      ? `<image href="${escapeXml(src)}" width="${AVATAR}" height="${AVATAR}" clip-path="url(#round)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="24" cy="24" r="24" fill="hsl(${hueOf(person.login)} 45% 42%)"/><text x="24" y="24" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#fff">${escapeXml([...person.name][0]?.toUpperCase() ?? "?")}</text>`;
    return `<g transform="${at(i)}"><title>${name}</title>${face}<circle cx="24" cy="24" r="23.5" fill="none" stroke="#808080" stroke-opacity="0.35"/><g transform="translate(41 41)" fill="#ef8db6">${petals}<circle r="1.4" fill="#d9588f"/></g></g>`;
  });
  if (rest) {
    parts.push(
      `<g transform="${at(shown.length)}"><title>+${rest}</title><circle cx="24" cy="24" r="23.5" fill="#fbe3ee" stroke="#ef8db6"/><text x="24" y="24" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#8a1f4f">+${rest}</text></g>`,
    );
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs><clipPath id="round"><circle cx="24" cy="24" r="24"/></clipPath></defs>`,
    ...parts,
    "</svg>",
    "",
  ].join("\n");
}

/** Ảnh đại diện 96px (gấp đôi cỡ hiện) dạng data URI; lỗi thì bỏ qua người đó (SVG dùng chữ cái đầu). */
async function fetchAvatars(people) {
  const entries = await Promise.all(
    people.map(async (person) => {
      try {
        const url = new URL(person.avatar);
        url.searchParams.set("s", "96");
        const res = await fetch(url, { redirect: "follow" });
        const type = (res.headers.get("content-type") ?? "").split(";")[0];
        if (!res.ok || !type.startsWith("image/")) return null;
        return [person.login, `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`];
      } catch {
        return null;
      }
    }),
  );
  return new Map(entries.filter(Boolean));
}

const isPerson = (actor) => actor?.__typename === "User" && !actor.login.endsWith("[bot]");
const day = (iso) => iso.slice(0, 10);

/**
 * Gom dữ liệu thô (node GraphQL của PR đã merge và issue) + phần ghi tay thành danh sách người đóng góp. Maintainer đứng
 * đầu, sau đó theo ngày đóng góp đầu tiên. `items` (từng đóng góp, để ghi công theo bản phát hành) chỉ giữ cho người không
 * phải maintainer, tối đa `maxItems` mục mới nhất.
 */
export function buildContributors({ pulls, issues, commits = [] }, extra = {}, { maxItems = 50 } = {}) {
  const maintainers = new Set(extra.maintainers ?? []);
  const exclude = new Set(extra.exclude ?? []);
  // Ghi tay trùng một đóng góp trên GitHub (cùng người, cùng url) chỉ đặt loại cho đóng góp đó; số, tiêu đề và ngày vẫn
  // lấy nguyên bản từ GitHub. Mục không trùng (thiết kế, ý tưởng ngoài GitHub) dùng tiêu đề và ngày ghi tay.
  const manual = new Map((extra.people ?? []).filter((entry) => entry.url).map((entry) => [`${entry.login} ${entry.url}`, entry]));
  const matched = new Set();
  const manualFor = (login, url) => {
    const entry = url && manual.get(`${login} ${url}`);
    if (entry) matched.add(entry);
    return entry;
  };
  const people = new Map();

  const add = (actor, autoTypes, item) => {
    if (exclude.has(actor.login)) return;
    const types = manualFor(actor.login, item.url)?.types ?? autoTypes;
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

  /**
   * Góp ý: bình luận (timeline) trong issue / PR của người khác; người mở bổ sung thông tin thì đã được tính cho chính
   * issue / PR. Bỏ maintainer, bot và bình luận quá ngắn, trừ khi maintainer đã ghi tay bình luận đó.
   */
  const creditComments = (parent, title) => {
    for (const comment of parent.timelineItems?.nodes ?? []) {
      const author = comment.author;
      if (!isPerson(author)) continue;
      const counted =
        manual.has(`${author.login} ${comment.url}`) ||
        (!maintainers.has(author.login) && author.login !== parent.author?.login && (comment.bodyText ?? "").trim().length >= MIN_COMMENT);
      if (counted) add(author, ["discussion"], { number: parent.number, title, date: day(comment.createdAt), url: comment.url });
    }
  };

  /**
   * Co-author: commit của người khác (tác giả commit hoặc dòng Co-authored-by) nằm trong một PR đã merge, như khi
   * maintainer làm tiếp PR của contributor (#253 → #257). Commit thuộc PR merge sớm nhất chứa nó, không phải PR release
   * next → main tạo sau. Mỗi người một lần cho mỗi PR, cùng loại với PR.
   */
  const pullsByNumber = new Map(pulls.map((pr) => [pr.number, pr]));
  const coauthors = new Map();
  for (const commit of commits) {
    const pr = commit.associatedPullRequests.nodes.map((node) => node.merged && pullsByNumber.get(node.number)).find(Boolean);
    if (!pr) continue;
    for (const { user } of commit.authors.nodes) {
      if (!isPerson(user) || user.login === pr.author?.login || maintainers.has(user.login)) continue;
      if (!coauthors.has(pr.number)) coauthors.set(pr.number, new Map());
      coauthors.get(pr.number).set(user.login, user);
    }
  }

  for (const pr of pulls) {
    const item = { number: pr.number, title: pr.title, date: day(pr.mergedAt), url: pr.url };
    if (isPerson(pr.author)) add(pr.author, pullTypes(pr.files.nodes.map((f) => f.path)), item);
    const reviewers = new Map();
    for (const review of pr.reviews.nodes) {
      if (isPerson(review.author) && review.author.login !== pr.author?.login) reviewers.set(review.author.login, review.author);
    }
    for (const reviewer of reviewers.values()) add(reviewer, ["review"], item);
    for (const user of coauthors.get(pr.number)?.values() ?? []) add(user, pullTypes(pr.files.nodes.map((f) => f.path)), item);
    creditComments(pr, pr.title);
  }

  for (const issue of issues) {
    const type = issueType(issue.labels.nodes.map((l) => l.name));
    // Bỏ tiền tố của mẫu issue ("[Bug]: …").
    const title = issue.title.replace(/^\[[^\]]*\]:?\s*/, "");
    if (type && isPerson(issue.author)) add(issue.author, [type], { number: issue.number, title, date: day(issue.createdAt), url: issue.url });

    // Issue không hợp lệ (spam): bình luận trong đó cũng không tính.
    if (!issue.labels.nodes.some((l) => l.name === "invalid")) creditComments(issue, title);
  }

  for (const entry of extra.people ?? []) {
    if (matched.has(entry)) continue;
    add({ login: entry.login, name: entry.name }, entry.types, { title: entry.title ?? entry.url, date: entry.date, ...(entry.url && { url: entry.url }) });
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
/** Bình luận trên timeline của issue / PR (tối đa 100 mỗi issue / PR). */
const COMMENTS = `timelineItems(first: 100, itemTypes: [ISSUE_COMMENT]) { nodes { ... on IssueComment { url createdAt bodyText ${ACTOR} } } }`;
const QUERIES = {
  pulls: `query($owner: String!, $name: String!, $cursor: String) {
    rateLimit { cost }
    repository(owner: $owner, name: $name) {
      list: pullRequests(states: MERGED, first: 50, after: $cursor, orderBy: { field: CREATED_AT, direction: ASC }) {
        pageInfo { hasNextPage endCursor }
        nodes { number title url mergedAt ${ACTOR} files(first: 100) { nodes { path } } reviews(first: 30) { nodes { ${ACTOR} } } ${COMMENTS} }
      }
    }
  }`,
  issues: `query($owner: String!, $name: String!, $cursor: String) {
    rateLimit { cost }
    repository(owner: $owner, name: $name) {
      list: issues(first: 50, after: $cursor, orderBy: { field: CREATED_AT, direction: ASC }) {
        pageInfo { hasNextPage endCursor }
        nodes {
          number title url createdAt ${ACTOR} labels(first: 20) { nodes { name } }
          ${COMMENTS}
        }
      }
    }
  }`,
  commits: `query($owner: String!, $name: String!, $ref: String!, $cursor: String) {
    rateLimit { cost }
    repository(owner: $owner, name: $name) {
      ref(qualifiedName: $ref) {
        target {
          ... on Commit {
            list: history(first: 100, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                authors(first: 5) { nodes { user { __typename login avatarUrl name } } }
                associatedPullRequests(first: 5, orderBy: { field: CREATED_AT, direction: ASC }) { nodes { number merged } } }
            }
          }
        }
      }
    }
  }`,
};

async function fetchAll(query, token, variables = {}) {
  const nodes = [];
  let cursor = null;
  let cost = 0;
  do {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "user-agent": "yugen-ui-contributors" },
      body: JSON.stringify({ query, variables: { ...REPO, ...variables, cursor } }),
    });
    const body = await res.json();
    if (!res.ok || body.errors) throw new Error(body.errors?.[0]?.message ?? `HTTP ${res.status}`);
    cost += body.data.rateLimit?.cost ?? 0;
    // Lịch sử commit nằm dưới ref; ref không tồn tại thì không có commit nào.
    const list = body.data.repository.list ?? body.data.repository.ref?.target?.list;
    if (!list) break;
    nodes.push(...list.nodes);
    cursor = list.pageInfo.hasNextPage ? list.pageInfo.endCursor : null;
  } while (cursor);
  return { nodes, cost };
}

/** `--out <file>` (mặc định src/docs/contributors.json) và `--strict` (API lỗi thì thoát với mã 1). */
export function parseArgs(argv) {
  const value = (flag) => {
    const at = argv.indexOf(flag);
    return at >= 0 && argv[at + 1] ? path.resolve(argv[at + 1]) : null;
  };
  return { out: value("--out") ?? OUT, strict: argv.includes("--strict"), svg: value("--svg") };
}

async function main() {
  const { out, strict, svg } = parseArgs(process.argv.slice(2));
  const fail = (message) => {
    if (!strict) return console.warn(`⚠ contributors: ${message}, giữ snapshot hiện có.`);
    console.error(`✖ contributors: ${message}.`);
    process.exitCode = 1;
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) return fail("thiếu GITHUB_TOKEN");
  try {
    const [pulls, issues, commits] = await Promise.all([
      fetchAll(QUERIES.pulls, token),
      fetchAll(QUERIES.issues, token),
      fetchAll(QUERIES.commits, token, { ref: HISTORY_REF }),
    ]);
    const extra = JSON.parse(fs.readFileSync(EXTRA, "utf8"));
    const people = buildContributors({ pulls: pulls.nodes, issues: issues.nodes, commits: commits.nodes }, extra);
    const data = { updated: new Date().toISOString().slice(0, 10), people };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
    if (svg) {
      const avatars = await fetchAvatars(people);
      fs.mkdirSync(svg, { recursive: true });
      for (const group of Object.keys(GROUPS)) {
        fs.writeFileSync(path.join(svg, `contributors-${group}.svg`), renderAvatarsSvg(inGroup(people, group), avatars));
      }
      console.log(`contributors: ảnh đại diện ${avatars.size}/${people.length} → ${path.relative(root, svg) || "."}/contributors-{code,ideas}.svg`);
    }
    const cost = pulls.cost + issues.cost + commits.cost;
    console.log(
      `contributors: ${people.length} người (${pulls.nodes.length} PR, ${issues.nodes.length} issue, ${commits.nodes.length} commit; ${cost} điểm GraphQL) → ${path.relative(root, out)}`,
    );
  } catch (error) {
    fail(`không đọc được GitHub API (${error.message})`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
