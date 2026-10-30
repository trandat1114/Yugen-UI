import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script Node thuần, không có khai báo kiểu
import { buildContributors, pullTypes } from "../../scripts/contributors.mjs";
// @ts-expect-error -- module Changesets thuần JS
import changelog, { splitThanks, thanksText } from "../../.changeset/changelog.mjs";
import { CONTRIBUTORS, creditsBetween, type Contributor } from "@/docs/contributors";
import { SakuraBranch } from "@/docs/SakuraBranch";

const user = (login: string, name?: string) => ({ __typename: "User", login, name, avatarUrl: `https://avatars.githubusercontent.com/u/${login.length}?v=4` });
const bot = (login: string) => ({ __typename: "Bot", login, avatarUrl: "" });
const pull = (number: number, author: object, files: string[], mergedAt: string, reviewers: object[] = []) => ({
  number,
  title: `PR ${number}`,
  url: `https://github.com/x/y/pull/${number}`,
  mergedAt: `${mergedAt}T10:00:00Z`,
  author,
  files: { nodes: files.map((path) => ({ path })) },
  reviews: { nodes: reviewers.map((author) => ({ author })) },
});
const issue = (number: number, author: object, labels: string[], createdAt: string, title = `Issue ${number}`) => ({
  number,
  title,
  url: `https://github.com/x/y/issues/${number}`,
  createdAt: `${createdAt}T10:00:00Z`,
  author,
  labels: { nodes: labels.map((name) => ({ name })) },
});

describe("scripts/contributors.mjs", () => {
  it("xếp loại PR theo file, bỏ file sinh ra", () => {
    expect(pullTypes(["src/components/ui/Button/Button.tsx"])).toEqual(["code"]);
    expect(pullTypes(["src/docs/i18n/en.ts", "README.md"])).toEqual(["docs", "translation"]);
    expect(pullTypes(["src/docs/concepts/en/cli.tsx"])).toEqual(["translation"]);
    expect(pullTypes(["src/docs/block-library/login.tsx", "templates/vite-saas/src/App.tsx"])).toEqual(["templates"]);
    expect(pullTypes(["package-lock.json", ".changeset/x.md"])).toEqual(["code"]);
  });

  it("gom PR, review, issue và phần ghi tay; bỏ bot, issue không tính và người xin bỏ tên", () => {
    const people = buildContributors(
      {
        pulls: [
          pull(1, user("owner", "Owner"), ["src/lib/cn.ts"], "2026-10-20", [user("owner"), user("rev")]),
          pull(2, bot("dependabot[bot]"), ["package.json"], "2026-10-21"),
          pull(3, user("dev"), ["src/docs/i18n/en.ts"], "2026-10-25", [user("owner")]),
        ],
        issues: [
          issue(10, user("reporter", "Reporter"), ["bug", "needs triage"], "2026-10-30", "[Bug]: Text is cut off"),
          issue(11, user("reporter"), ["accessibility"], "2026-10-31"),
          issue(12, user("dev"), ["enhancement", "duplicate"], "2026-10-26"),
          issue(13, user("owner"), [], "2026-10-22"),
          issue(14, user("gone"), ["bug"], "2026-10-23"),
        ],
      },
      {
        maintainers: ["owner"],
        exclude: ["gone"],
        people: [{ login: "artist", types: ["design"], title: "Sakura icon", date: "2026-10-24" }],
      },
    ) as Contributor[];

    expect(people.map((p) => p.login)).toEqual(["owner", "rev", "artist", "dev", "reporter"]);
    const [owner, rev, artist, dev, reporter] = people;
    expect(owner).toMatchObject({ maintainer: true, counts: { code: 1, review: 1 }, first: "2026-10-20" });
    expect(owner.items).toBeUndefined();
    expect(artist).toMatchObject({ name: "artist", avatar: "https://github.com/artist.png", counts: { design: 1 } });
    expect(dev.counts).toEqual({ translation: 1 });
    expect(rev).toMatchObject({ counts: { review: 1 }, first: "2026-10-20" });
    expect(reporter).toMatchObject({ name: "Reporter", counts: { bug: 1, a11y: 1 }, first: "2026-10-30" });
    expect(reporter.items?.map((i) => [i.number, i.title])).toEqual([
      [11, "Issue 11"],
      [10, "Text is cut off"],
    ]);
  });
});

describe("creditsBetween", () => {
  const people = [
    { login: "owner", name: "Owner", avatar: "", maintainer: true, first: "2026-10-01", counts: { code: 9 } },
    {
      login: "a",
      name: "A",
      avatar: "",
      first: "2026-10-10",
      counts: { bug: 2 },
      items: [
        { types: ["bug"], number: 2, title: "two", date: "2026-10-20" },
        { types: ["bug"], number: 1, title: "one", date: "2026-10-10" },
      ],
    },
  ] as Contributor[];

  it("ghi công đóng góp sau bản trước, tới hết ngày của bản này; không có maintainer", () => {
    expect(creditsBetween("2026-10-10", "2026-10-20", people).map(({ person, items }) => [person.login, items.map((i) => i.number)])).toEqual([["a", [2]]]);
    expect(creditsBetween(undefined, "2026-10-10", people)[0].items.map((i) => i.number)).toEqual([1]);
    expect(creditsBetween("2026-10-20", "2026-10-30", people)).toEqual([]);
  });

  it("snapshot có maintainer đứng đầu", () => {
    expect(CONTRIBUTORS[0]?.maintainer).toBe(true);
  });
});

describe(".changeset/changelog.mjs", () => {
  it("dòng Thanks thành lời cảm ơn, bỏ maintainer, bot và trùng", async () => {
    expect(splitThanks("Fix X.\n\nThanks: @a, @b")).toEqual({ summary: "Fix X.", logins: ["a", "b"] });
    expect(thanksText(["a", "owner", "a", "x[bot]"], ["owner"])).toBe(" Thanks [@a](https://github.com/a)!");
    expect(thanksText(["owner"], ["owner"])).toBe("");
    const line = await changelog.getReleaseLine({ summary: "Fix X.\nMore.\n\nThanks: @a", commit: "abcdef123" }, "patch", { maintainers: ["owner"] });
    expect(line).toBe("- abcdef1: Fix X. Thanks [@a](https://github.com/a)!\n  More.");
  });

  it("không có dòng Thanks: giống @changesets/changelog-git", async () => {
    expect(await changelog.getReleaseLine({ summary: "New `Foo`.\n\nDetails.", commit: "1234567890" }, "minor", {})).toBe("- 1234567: New `Foo`.\n  \n  Details.");
  });
});

describe("SakuraBranch", () => {
  it("mỗi người một bông hoa, chỗ còn lại là nụ; bông của người đang chọn được đánh dấu", () => {
    const { container } = render(<SakuraBranch people={[{ login: "owner", maintainer: true }, { login: "a" }]} active="a" />);
    const flowers = container.querySelectorAll(".cb-flower");
    expect(flowers).toHaveLength(2);
    expect(flowers[1].hasAttribute("data-active")).toBe(true);
    expect(container.querySelector("svg")?.hasAttribute("data-dim")).toBe(true);
    // 26 chỗ: 2 hoa + 24 nụ (mỗi nụ một nhóm có transform trong phần cành).
    expect(container.querySelectorAll('g[mask] > g[transform]')).toHaveLength(24);
  });
});
