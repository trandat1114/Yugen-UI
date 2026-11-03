/**
 * Changelog của Changesets như mặc định (@changesets/changelog-git: "- <commit>: <tóm tắt>") cộng lời cảm ơn người đóng
 * góp (#248):
 *
 * - dòng `Thanks: @a @b` trong changeset (vd. người báo lỗi) được bỏ khỏi tóm tắt và thành "Thanks [@a](…)!";
 * - có GITHUB_TOKEN thì tác giả PR chứa commit của changeset cũng được cảm ơn.
 *
 * Maintainer (options.maintainers) và bot không được liệt kê. Không có token hoặc API lỗi: chỉ dùng dòng Thanks.
 */

const THANKS = /^Thanks:?\s+(.+)$/im;

/** Tách dòng `Thanks: @a, @b` khỏi tóm tắt. */
export function splitThanks(summary) {
  const match = summary.match(THANKS);
  if (!match) return { summary, logins: [] };
  const logins = [...match[1].matchAll(/@([\w-]+)/g)].map((m) => m[1]);
  return { summary: summary.replace(THANKS, "").replace(/\n{3,}/g, "\n\n").trim(), logins };
}

/** " Thanks [@a](https://github.com/a)!" hoặc chuỗi rỗng; bỏ trùng, maintainer và bot. */
export function thanksText(logins, maintainers = []) {
  const people = [...new Set(logins)].filter((login) => !maintainers.includes(login) && !login.endsWith("[bot]"));
  if (people.length === 0) return "";
  return ` Thanks ${people.map((login) => `[@${login}](https://github.com/${login})`).join(", ")}!`;
}

async function pullAuthor(repo, commit) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!repo || !commit || !token) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits/${commit}/pulls`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "yugen-ui-changelog" },
    });
    if (!res.ok) return null;
    const [pull] = await res.json();
    return pull?.user?.type === "User" ? pull.user.login : null;
  } catch {
    return null;
  }
}

export default {
  async getReleaseLine(changeset, _type, options = {}) {
    const { summary, logins } = splitThanks(changeset.summary);
    const author = await pullAuthor(options.repo, changeset.commit);
    const thanks = thanksText(author ? [author, ...logins] : logins, options.maintainers);
    const [firstLine, ...futureLines] = summary.split("\n").map((line) => line.trimEnd());
    let line = `- ${changeset.commit ? `${changeset.commit.slice(0, 7)}: ` : ""}${firstLine}${thanks}`;
    if (futureLines.length > 0) line += `\n${futureLines.map((l) => `  ${l}`).join("\n")}`;
    return line;
  },
  async getDependencyReleaseLine(changesets, dependenciesUpdated) {
    if (dependenciesUpdated.length === 0) return "";
    const links = changesets.map((changeset) => `- Updated dependencies${changeset.commit ? ` [${changeset.commit.slice(0, 7)}]` : ""}`);
    const list = dependenciesUpdated.map((dependency) => `  - ${dependency.name}@${dependency.newVersion}`);
    return [...links, ...list].join("\n");
  },
};
