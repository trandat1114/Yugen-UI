import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error -- script Node thuần, không có khai báo kiểu
import { buildContributors, parseArgs, pullTypes } from "../../scripts/contributors.mjs";
// @ts-expect-error -- module Changesets thuần JS
import changelog, { splitThanks, thanksText } from "../../.changeset/changelog.mjs";
import {
  sourceLang,
  CONTRIBUTORS,
  CONTRIBUTORS_LIVE_URL,
  CONTRIBUTORS_UPDATED,
  contributionsIn,
  creditsBetween,
  parseContributors,
  useLiveContributors,
  type Contributor,
} from "@/docs/contributors";
import { SakuraBranch } from "@/docs/SakuraBranch";

const user = (login: string, name?: string) => ({ __typename: "User", login, name, avatarUrl: `https://avatars.githubusercontent.com/u/${login.length}?v=4` });
const bot = (login: string) => ({ __typename: "Bot", login, avatarUrl: "" });
const pull = (number: number, author: object, files: string[], mergedAt: string, reviewers: object[] = [], comments: object[] = []) => ({
  number,
  title: `PR ${number}`,
  url: `https://github.com/x/y/pull/${number}`,
  mergedAt: `${mergedAt}T10:00:00Z`,
  author,
  files: { nodes: files.map((path) => ({ path })) },
  reviews: { nodes: reviewers.map((author) => ({ author })) },
  timelineItems: { nodes: comments },
});
const issue = (number: number, author: object, labels: string[], createdAt: string, title = `Issue ${number}`, comments: object[] = []) => ({
  number,
  title,
  url: `https://github.com/x/y/issues/${number}`,
  createdAt: `${createdAt}T10:00:00Z`,
  author,
  labels: { nodes: labels.map((name) => ({ name })) },
  timelineItems: { nodes: comments },
});
const comment = (issueNumber: number, id: number, author: object, createdAt: string, bodyText: string) => ({
  url: `https://github.com/x/y/issues/${issueNumber}#issuecomment-${id}`,
  createdAt: `${createdAt}T10:00:00Z`,
  bodyText,
  author,
});
const LONG = "Persist only the desktop collapsed state; treat the Drawer as transient.";
/** Commit trong lịch sử next: tác giả (kể cả Co-authored-by) và các PR chứa nó, PR tạo trước đứng trước. */
const commit = (authors: object[], prs: [number, boolean][]) => ({
  authors: { nodes: authors.map((user) => ({ user })) },
  associatedPullRequests: { nodes: prs.map(([number, merged]) => ({ number, merged })) },
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

describe("scripts/contributors.mjs · góp ý trong issue", () => {
  it("tính bình luận trong issue của người khác; bỏ maintainer, bot, bình luận ngắn, người mở issue và issue invalid; ghi tay chỉ đổi loại", () => {
    const people = buildContributors(
      {
        pulls: [],
        issues: [
          issue(20, user("owner"), [], "2026-10-30", "AppShell proposal", [
            comment(20, 1, user("owner"), "2026-10-30", LONG),
            comment(20, 2, user("dave", "Dave"), "2026-10-30", LONG),
            comment(20, 3, user("dave", "Dave"), "2026-11-02", LONG),
            comment(20, 4, user("dave"), "2026-11-02", "+1, thanks!"),
            comment(20, 5, bot("github-actions[bot]"), "2026-11-02", LONG),
            comment(20, 6, user("gone"), "2026-11-02", LONG),
          ]),
          issue(21, user("reporter"), ["bug"], "2026-10-31", "[Bug]: cut off", [
            comment(21, 7, user("reporter"), "2026-10-31", LONG),
            comment(21, 8, user("dave"), "2026-11-01", LONG),
          ]),
          issue(22, user("spammer"), ["invalid"], "2026-11-01", "spam", [comment(22, 9, user("dave"), "2026-11-01", LONG)]),
        ],
      },
      {
        maintainers: ["owner"],
        exclude: ["gone"],
        people: [
          // Trùng bình luận #2: chỉ đổi loại, số và tiêu đề lấy nguyên bản từ GitHub (không dùng tiêu đề ghi tay).
          { login: "dave", types: ["a11y", "idea"], title: "Góp ý về breakpoint", date: "2026-10-30", url: "https://github.com/x/y/issues/20#issuecomment-2" },
          // Bình luận ngắn bị bỏ, nhưng maintainer đã ghi tay thì vẫn tính.
          { login: "dave", types: ["idea"], date: "2026-11-02", url: "https://github.com/x/y/issues/20#issuecomment-4" },
        ],
      },
    ) as Contributor[];

    // Maintainer chỉ bình luận thì không có mặt.
    expect(people.map((p) => p.login)).toEqual(["dave", "reporter"]);
    const [dave, reporter] = people;
    expect(reporter.counts).toEqual({ bug: 1 });
    expect(dave).toMatchObject({ name: "Dave", first: "2026-10-30", counts: { discussion: 2, a11y: 1, idea: 2 } });
    expect(dave.items?.map((i) => [i.number, i.title, i.types, i.url?.split("-").pop()])).toEqual([
      [20, "AppShell proposal", ["discussion"], "3"],
      [20, "AppShell proposal", ["idea"], "4"],
      [21, "cut off", ["discussion"], "8"],
      [20, "AppShell proposal", ["a11y", "idea"], "2"],
    ]);
  });
});

describe("scripts/contributors.mjs · bình luận trên PR và co-author (#272)", () => {
  it("bình luận trên PR đã merge của người khác là góp ý, cùng luật với issue", () => {
    const people = buildContributors(
      {
        pulls: [
          pull(30, user("dev", "Dev"), ["src/lib/cn.ts"], "2026-11-01", [], [
            { ...comment(30, 1, user("dave", "Dave"), "2026-10-31", LONG), url: "https://github.com/x/y/pull/30#issuecomment-1" },
            { ...comment(30, 2, user("dev"), "2026-10-31", LONG), url: "https://github.com/x/y/pull/30#issuecomment-2" },
            { ...comment(30, 3, user("owner"), "2026-10-31", LONG), url: "https://github.com/x/y/pull/30#issuecomment-3" },
            { ...comment(30, 4, user("dave"), "2026-10-31", "LGTM"), url: "https://github.com/x/y/pull/30#issuecomment-4" },
          ]),
        ],
        issues: [],
      },
      { maintainers: ["owner"] },
    ) as Contributor[];
    expect(people.map((p) => [p.login, p.counts])).toEqual([
      ["dave", { discussion: 1 }],
      ["dev", { code: 1 }],
    ]);
    expect(people[0].items?.[0]).toMatchObject({ number: 30, title: "PR 30", url: "https://github.com/x/y/pull/30#issuecomment-1" });
  });

  it("co-author: commit của người khác trong PR merge sớm nhất chứa nó; một lần mỗi PR, bỏ PR release, maintainer, bot và mục ghi tay", () => {
    const giabao = user("giabao", "Gia Bao");
    const people = buildContributors(
      {
        pulls: [
          pull(57, user("owner"), ["src/hooks/useClipboard.ts", "src/docs/hooks.tsx"], "2026-11-02"),
          pull(60, user("owner"), ["CHANGELOG.md"], "2026-11-11"),
          pull(61, user("owner"), ["src/lib/cn.ts"], "2026-11-12"),
        ],
        issues: [],
        commits: [
          // #53 (không merge) → #57 (merge) → #60 (release next → main): credit cho #57.
          commit([giabao], [[53, false], [57, true], [60, true]]),
          commit([giabao], [[53, false], [57, true], [60, true]]),
          commit([user("owner"), bot("dependabot[bot]")], [[57, true], [60, true]]),
          // Co-authored-by trong một commit của maintainer.
          commit([user("owner"), user("pair", "Pair")], [[61, true]]),
          // Đã ghi tay cho #61.
          commit([user("noted")], [[61, true]]),
          // Commit không thuộc PR nào đã merge.
          commit([user("stray")], [[70, false]]),
          commit([user("lone")], []),
        ],
      },
      {
        maintainers: ["owner"],
        people: [{ login: "noted", types: ["design"], title: "Icon", date: "2026-11-12", url: "https://github.com/x/y/pull/61" }],
      },
    ) as Contributor[];
    const byLogin = Object.fromEntries(people.map((p) => [p.login, p]));
    expect(Object.keys(byLogin).sort()).toEqual(["giabao", "noted", "owner", "pair"]);
    expect(byLogin.giabao).toMatchObject({ name: "Gia Bao", first: "2026-11-02", counts: { code: 1, docs: 1 } });
    expect(byLogin.giabao.items?.map((i) => i.number)).toEqual([57]);
    expect(byLogin.pair.counts).toEqual({ code: 1 });
    expect(byLogin.noted.counts).toEqual({ design: 1 });
    expect(byLogin.noted.items?.map((i) => [i.number, i.title])).toEqual([[61, "PR 61"]]);
    expect(byLogin.owner.counts).toEqual({ code: 3, docs: 1 });
  });

  it("ghi tay không trùng đóng góp nào trên GitHub thì dùng tiêu đề và ngày ghi tay", () => {
    const people = buildContributors(
      { pulls: [], issues: [] },
      { people: [{ login: "artist", types: ["design"], title: "Sakura icon set", date: "2026-10-24", url: "https://www.figma.com/file/x" }] },
    ) as Contributor[];
    expect(people[0].items).toEqual([{ types: ["design"], title: "Sakura icon set", date: "2026-10-24", url: "https://www.figma.com/file/x" }]);
  });

  it("--out và --strict", () => {
    expect(parseArgs([]).strict).toBe(false);
    expect(parseArgs([]).out).toMatch(/src[\\/]docs[\\/]contributors\.json$/);
    const { out, strict } = parseArgs(["--out", "data/contributors.json", "--strict"]);
    expect(strict).toBe(true);
    expect(out).toMatch(/data[\\/]contributors\.json$/);
  });
});

describe("dữ liệu mới từ nhánh contributors-data (#272)", () => {
  const person = { login: "new", name: "New", avatar: "https://github.com/new.png", first: "2026-11-03", counts: { discussion: 1 }, items: [] };
  const fresh = { updated: "2099-01-01", people: [...CONTRIBUTORS, person] };

  function Probe() {
    const { people, updated } = useLiveContributors();
    return <p data-testid="probe">{`${people.length} ${updated}`}</p>;
  }
  const mockFetch = (response: () => Promise<unknown>) => vi.stubGlobal("fetch", vi.fn(response));
  afterEach(() => vi.unstubAllGlobals());

  it("tiêu đề gốc giữ nguyên, chỉ đánh dấu ngôn ngữ", () => {
    expect(sourceLang("1.0 proposal: AppShell / Sidebar layout component")).toBe("en");
    expect(sourceLang("Hooks dùng chung cho logic giao diện")).toBe("vi");
    expect(sourceLang("Đề xuất")).toBe("vi");
  });

  it("kiểm dạng: thiếu trường, sai kiểu, danh sách rỗng thì bỏ", () => {
    expect(parseContributors(fresh)).toEqual(fresh);
    expect(parseContributors(null)).toBeUndefined();
    expect(parseContributors({ updated: "hôm nay", people: [person] })).toBeUndefined();
    expect(parseContributors({ updated: "2099-01-01", people: [] })).toBeUndefined();
    expect(parseContributors({ updated: "2099-01-01", people: [{ ...person, counts: undefined }] })).toBeUndefined();
    expect(parseContributors({ updated: "2099-01-01", people: [{ ...person, items: "x" }] })).toBeUndefined();
  });

  it("render snapshot trước, rồi đổi sang bản mới hơn", async () => {
    mockFetch(() => Promise.resolve({ ok: true, json: () => Promise.resolve(fresh) }));
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe(`${CONTRIBUTORS.length} ${CONTRIBUTORS_UPDATED}`);
    await waitFor(() => expect(screen.getByTestId("probe").textContent).toBe(`${CONTRIBUTORS.length + 1} 2099-01-01`));
    expect(fetch).toHaveBeenCalledWith(CONTRIBUTORS_LIVE_URL, expect.anything());
    expect(CONTRIBUTORS_LIVE_URL).toBe("https://raw.githubusercontent.com/trandat1114/Yugen-UI/contributors-data/contributors.json");
  });

  it("giữ snapshot khi bản tải về cũ hơn, sai dạng hoặc lỗi mạng", async () => {
    for (const response of [
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ...fresh, updated: "2000-01-01" }) }),
      () => Promise.resolve({ ok: true, json: () => Promise.resolve({ updated: "2099-01-01" }) }),
      () => Promise.resolve({ ok: false, json: () => Promise.reject(new Error("404")) }),
      () => Promise.reject(new TypeError("Failed to fetch")),
    ]) {
      mockFetch(response);
      const { unmount } = render(<Probe />);
      await waitFor(() => expect(fetch).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(screen.getByTestId("probe").textContent).toBe(`${CONTRIBUTORS.length} ${CONTRIBUTORS_UPDATED}`);
      unmount();
      vi.unstubAllGlobals();
    }
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

  it("tách hai mục: code (PR) và ý tưởng, thảo luận; thẻ chỉ còn loại của mục", () => {
    const person = {
      login: "b",
      name: "B",
      avatar: "",
      first: "2026-10-01",
      counts: { code: 1, docs: 1, review: 2, idea: 1 },
      items: [
        { types: ["review", "idea"], title: "góp ý trong issue", date: "2026-11-03", url: "https://github.com/x/y/issues/9#issuecomment-1" },
        { types: ["code", "docs"], number: 5, title: "PR 5", date: "2026-10-02" },
        { types: ["review"], number: 4, title: "PR 4", date: "2026-10-01" },
      ],
    } as Contributor;
    const code = contributionsIn(person, "code")!;
    expect(code.counts).toEqual({ code: 1, docs: 1 });
    expect(code.items!.map((i) => i.title)).toEqual(["PR 5"]);
    const ideas = contributionsIn(person, "ideas")!;
    expect(ideas.counts).toEqual({ review: 2, idea: 1 });
    expect(ideas.items!.map((i) => [i.title, i.types])).toEqual([
      ["góp ý trong issue", ["review", "idea"]],
      ["PR 4", ["review"]],
    ]);
    expect(contributionsIn({ ...person, counts: { bug: 1 }, items: [] }, "code")).toBeUndefined();
  });

  it("dave-otf (chỉ góp ý trong issue) chỉ có ở mục ý tưởng và thảo luận", () => {
    const dave = CONTRIBUTORS.find((p) => p.login === "dave-otf")!;
    expect(contributionsIn(dave, "code")).toBeUndefined();
    expect(contributionsIn(dave, "ideas")?.counts.idea).toBeGreaterThan(0);
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
