// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { level, newsEntries, releaseRuleErrors } from "../../scripts/release-rules.mjs";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { changesetErrors, parseChangeset } from "../../scripts/check-changesets.mjs";

/** Quy tắc cho từng số của phiên bản: scripts/release-rules.mjs (check-release) và scripts/check-changesets.mjs. */
type Entry = { version: string; upcoming?: boolean; date: string; kinds: string[] };
const entry = (version: string, date: string, ...kinds: string[]): Entry => ({ version, date, kinds });

const HISTORY = [
  entry("0.13.0", "2026-11-20", "new", "fixed"),
  entry("0.12.1", "2026-11-02", "fixed"),
  entry("0.12.0", "2026-10-27", "new"),
];

const check = (e: Entry, older: Entry[] = HISTORY) => releaseRuleErrors(e, older, "NEWS") as string[];

describe("release-rules", () => {
  it("đọc số theo dạng", () => {
    expect([level("0.12.1"), level("0.13.0"), level("1.0.0"), level("2.3.0"), level("1.0.0-rc.1")]).toEqual([
      "patch",
      "minor",
      "major",
      "minor",
      "major",
    ]);
  });

  it("patch chỉ gồm sửa lỗi và tinh chỉnh", () => {
    expect(check(entry("0.13.1", "2026-11-21", "fixed", "improved"))).toEqual([]);
    expect(check(entry("0.13.1", "2026-11-21", "fixed", "new"))[0]).toMatch(/bản patch .*0\.14\.0/);
    expect(check(entry("0.13.1", "2026-11-21", "breaking"))).toHaveLength(1);
  });

  it("minor cần mục new; trước 1.0 breaking cũng được", () => {
    expect(check(entry("0.14.0", "2026-12-10", "improved", "fixed"))[0]).toMatch(/cần ít nhất một mục "new"/);
    expect(check(entry("0.14.0", "2026-12-10", "breaking"))).toEqual([]);
    const stable = [entry("1.0.0", "2027-01-01", "breaking")];
    expect(check(entry("1.1.0", "2027-02-01", "new", "breaking"), stable)[0]).toMatch(/chỉ có ở bản major \(2\.0\.0\)/);
    expect(check(entry("1.1.0", "2027-02-01", "breaking"), stable)).toHaveLength(2);
  });

  it("major cần mục breaking và cách major trước 180 ngày", () => {
    const older = [entry("0.20.0", "2027-01-01", "new")];
    expect(check(entry("1.0.0", "2027-02-01", "breaking"), older)).toEqual([]);
    expect(check(entry("1.0.0", "2027-02-01", "new"), older)[0]).toMatch(/cần ít nhất một mục "breaking"/);
    const v1 = [entry("1.4.0", "2027-03-01", "new"), entry("1.0.0", "2027-02-01", "breaking")];
    expect(check(entry("2.0.0", "2027-05-01", "breaking"), v1)[0]).toMatch(/cách 1\.0\.0 \(2027-02-01\) 89 ngày, tối thiểu 180/);
    expect(check(entry("2.0.0", "2027-08-01", "breaking"), v1)).toEqual([]);
  });

  it("minor cách bản minor / major trước ít nhất 14 ngày; patch không giới hạn", () => {
    expect(check(entry("0.14.0", "2026-11-30", "new"))[0]).toMatch(/cách 0\.13\.0 \(2026-11-20\) 10 ngày, tối thiểu 14/);
    expect(check(entry("0.14.0", "2026-12-04", "new"))).toEqual([]);
    expect(check(entry("0.13.1", "2026-11-20", "fixed"))).toEqual([]);
  });

  it("không nhảy số", () => {
    expect(check(entry("0.15.0", "2026-12-10", "new"))[0]).toMatch(/nhảy số — chưa có bản 0\.14\.x/);
    expect(check(entry("0.13.2", "2026-11-21", "fixed"))[0]).toMatch(/chưa có bản 0\.13\.1/);
    // Patch cho dòng minor cũ (release/0.12) sau khi đã có 0.13.0.
    expect(check(entry("0.12.2", "2026-11-22", "fixed"))).toEqual([]);
  });

  it("bỏ qua prerelease và bản trước khi có quy tắc", () => {
    expect(check(entry("0.14.0-next.1", "2026-11-21", "fixed"))).toEqual([]);
    expect(check(entry("0.12.0", "2026-10-27", "fixed"), [entry("0.11.0", "2026-10-25", "new")])).toEqual([]);
  });

  it("đọc version, upcoming, date và kind từ news.ts", () => {
    const source = `export const NEWS: NewsRelease[] = [
  {
    version: "0.13.0",
    upcoming: true,
    date: "2026-11-27",
    items: [{ kind: "new", text: "a" }, { kind: "fixed", text: "b" }],
  },
  { version: "0.12.0", date: "2026-10-27", items: [{ kind: "improved", text: "c" }] },
];
export const CLI_NEWS: NewsRelease[] = [{ version: "0.5.0", date: "2026-10-27", items: [] }];
`;
    expect(newsEntries(source, "NEWS")).toEqual([
      { version: "0.13.0", upcoming: true, date: "2026-11-27", kinds: ["new", "fixed"] },
      { version: "0.12.0", upcoming: false, date: "2026-10-27", kinds: ["improved"] },
    ]);
    expect(newsEntries(source, "CLI_NEWS")).toEqual([{ version: "0.5.0", upcoming: false, date: "2026-10-27", kinds: [] }]);
    expect(newsEntries(source, "CREATE_NEWS")).toBeUndefined();
  });

  it("tin hiện có trong news.ts theo đúng quy tắc", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../docs/news.ts"), "utf8");
    for (const name of ["NEWS", "CLI_NEWS"]) {
      const entries: Entry[] = newsEntries(source, name);
      entries.forEach((e, i) => expect(releaseRuleErrors(e, entries.slice(i + 1), name)).toEqual([]));
    }
  });
});

describe("check-changesets", () => {
  const errors = (bump: string, summary: string, opts = { stable: false, patchOnly: false }) =>
    changesetErrors({ bump, summary }, opts) as string[];

  it("đọc bump của yugen-ui", () => {
    expect(parseChangeset('---\r\n"yugen-ui": minor\r\n---\r\n\r\nNew `Quote` component.\r\n')).toEqual({
      bump: "minor",
      summary: "New `Quote` component.",
    });
    expect(parseChangeset('---\n"other-pkg": patch\n---\n\nX.')).toBeUndefined();
  });

  it("major chỉ từ 1.0 và luôn kèm **Breaking:**", () => {
    expect(errors("major", "**Breaking:** remove `transparent`.")[0]).toMatch(/chỉ dùng từ 1\.0/);
    expect(errors("major", "**Breaking:** remove `transparent`.", { stable: true, patchOnly: false })).toEqual([]);
    expect(errors("major", "Remove `transparent`.", { stable: true, patchOnly: false })).toHaveLength(1);
    expect(errors("minor", "**Breaking:** rename `tone` to `intent`.")).toEqual([]);
    expect(errors("patch", "**Breaking:** rename `tone` to `intent`.")).toHaveLength(1);
  });

  it("Fix là patch, New là minor", () => {
    expect(errors("minor", "Fix focus ring clipped in Dialog.")[0]).toMatch(/sửa lỗi là `patch`/);
    expect(errors("patch", "Fix focus ring clipped in Dialog.")).toEqual([]);
    expect(errors("patch", "New `Quote` component.")[0]).toMatch(/là `minor`/);
    expect(errors("patch", "`Combobox`: keep focus when a tag is removed.")).toEqual([]);
  });

  it("PR vào main / release/* chỉ mang patch", () => {
    expect(errors("minor", "New `Quote` component.", { stable: false, patchOnly: true })).toHaveLength(1);
    expect(errors("patch", "`Combobox`: keep focus.", { stable: false, patchOnly: true })).toEqual([]);
  });
});
