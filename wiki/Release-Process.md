# Release Process

*Tiếng Việt: [Release-Process-vi](Release-Process-vi).*

This page covers the stable channel (`main` → `latest`). Prereleases on `next`, `canary` and fixes for older minors on `release/X.Y`: [[Branching and Release Channels]].

Versions follow [SemVer](https://trandat1114.github.io/Yugen-UI/#/concepts/versioning). Before 1.0, a minor release may
contain breaking changes; always call them out.

## Rules for each number

These rules apply to releases after 0.12.0 (`RULES_SINCE` in `scripts/release-rules.mjs`), for `yugen-ui` and
`@yugen-ui/cli`. The goal: most changes ship in patch releases, and the minor and major numbers don't go up for small changes.

| Number | Bump when | Don't bump for | Cadence |
| --- | --- | --- | --- |
| PATCH `x.y.Z` | Bug fixes (including bugs from the previous release), a11y, performance, wrong TS types, small UI tweaks | New API, breaking changes | No limit; group fixes that land close together |
| MINOR `x.Y.0` | At least one new API (component, prop, prop value, token, export, template); deprecations; before 1.0 also breaking changes | Only fixes / tweaks | One per milestone, ≥ 14 days after the previous minor |
| MAJOR `X.0.0` | Breaking changes, from 1.0; removes all deprecated APIs at once, with a migration guide | Non-breaking features | ≥ 180 days after the previous major |

- No skipped numbers: after `0.12.0` comes `0.12.1` or `0.13.0`.
- Changes only to the docs site, tests or CI are not released; the **Docs** workflow deploys them on its own.
- `main` and `release/X.Y` only ship patch releases (hotfixes). Features go into `next` and are released when the milestone closes.
- Prereleases (`-next.N`, `cli@X.Y.Z-beta.N`, canary) don't count.
- `create-yugen-ui` has no cadence of its own: it moves up a minor together with `@yugen-ui/cli` (CLI rule 2).

Automatic checks:

- `npm run check:changesets` (CI) flags: `major` before 1.0; `major` without "**Breaking:**"; "**Breaking:**" in a `patch`; a summary
  starting with "Fix" in a `minor`, or "New" in a `patch`; a `minor` / `major` in PRs into `main` / `release/*` (except `next → main`).
- `check:release` (repo root and CLI) reads the type (`## Mới`, `## Sửa lỗi`…) of the news entries in `src/docs/news` (the current
  version and the `upcoming` entry on next): a patch release has no `new` / `breaking`; a minor release has at least one `new` (before 1.0: or
  `breaking`); from 1.0, `breaking` only in a major release; a major has at least one `breaking`; no skipped numbers; the minor / major
  cadence is measured from the news `date`.

Want to release a minor sooner than 14 days? There is no way around it in the script. Features wait for the milestone; fixes ship
in a patch release.

## In every PR

`npx changeset` → choose `patch` (bug fix) / `minor` (feature, deprecation) / `major` (from 1.0, API removal) → write one sentence for
users (in English, as in the CHANGELOG). The file goes in `.changeset/*.md`.

PRs into `next` with user-visible changes also add a line to the **upcoming news** (section below).

## News on the What's new page

Each release is two Markdown files, Vietnamese and English, in `src/docs/news/<package>/` (`yugen-ui`, `cli`,
`create-yugen-ui`): `0.14.0.vi.md` and `0.14.0.en.md`. The version number comes from the file name.

```md
---
date: 2026-11-11
upcoming: true
---

# AppShell, Sortable và trang Người đóng góp

Một đoạn tóm tắt.

## Mới

- AppShell và Sidebar: … `layout="header"` cho thanh trên cùng trải ngang. [→](/components/appshell)

## Sửa lỗi

- …
```

- The change type is a `##` heading: `Mới`, `Cải tiến`, `Sửa lỗi`, `Thay đổi lớn` (en version: `New`, `Improved`, `Fixed`,
  `Breaking`). One `- …` line per item; the `[→](/path)` at the end is the "View" button to the docs page.
- Items may use inline Markdown: `` `code` `` for props, functions, files, commands; component names in lowercase.
- The vi and en versions must match: same `date`, `upcoming`, number of items, types and links, in the same order. `node scripts/check-news.mjs`
  checks this (a few seconds, no `npm ci` needed); the docs build reports the same errors with file and line.
- PRs that only change `src/docs/news/**` don't run the full CI, only the `News` workflow. After merge, Pages rebuilds the docs.

## News for an upcoming release (next)

News for the next release is written step by step on `next`, not left until release time.

- The newest file in the package folder has `upcoming: true` in its frontmatter, in both the vi and en versions. The file name is
  the number the next release will have (`npx changeset status`; for the CLI, by the CLI's SemVer rules), and `date` is the planned
  date (the milestone's due date).
- Each PR into `next` with user-visible changes adds an item to both files, creating them if they don't exist yet. Changesets are
  still required as before; the news is the part for docs readers.
- The What's new page shows this entry with the **Upcoming** label and the date "Planned for …". Preview it at `/next/`
  (https://trandat1114.github.io/Yugen-UI/next/): the docs rebuild from `next` after every push.
- Only the newest version may be `upcoming`. `check-release` accepts it when its version is greater than `package.json`, and fails when
  `package.json` already equals that version while the news is still `upcoming` (it was not finalized), or when a tag exists.
- `upcoming` news reaches `main` through the `next → main` PR and is **finalized in the `chore(release)` commit**: remove `upcoming`,
  fill in the release date in both files, review the content against the CHANGELOG.

## Releasing (maintainers)

```bash
git pull
npm run version-packages      # changeset version → bump package.json, write the CHANGELOG, sync templates, lockfile
```

1. News in `src/docs/news/yugen-ui`: if there is already an `upcoming` entry (written on next), remove `upcoming`, fill in the release
   date in both `.vi.md` and `.en.md` and review the content; if there is none, add two files for the new version (see
   [News on the What's new page](#news-on-the-whats-new-page)).
2. Add the link `[x.y.z]: …/releases/tag/vx.y.z` at the end of the CHANGELOG.
   Update `src/docs/roadmap.ts`: set the items of the finished milestone to `done`, move the milestone to Released (remove it from
   `now`, move `next` up), then run `npm run roadmap` (writes ROADMAP.md; `roadmap.test.ts` fails if they differ).
3. `npm run check:release && npm test && npm run build`
4. Commit `chore(release): vx.y.z`, push, **wait for CI to be green**.
5. Tag and push the tag:

```bash
git tag vx.y.z
git push origin vx.y.z
```

The **Release** workflow checks that the tag matches `package.json` and is on the right branch, runs the tests, builds and runs
`npm publish --provenance` (requires the `NPM_TOKEN` secret). The dist-tag is chosen by `scripts/release-channel.mjs`: `latest`, `next` (prerelease) or `release-X.Y`.

After publishing, the workflow creates a GitHub Release for the tag from that version's CHANGELOG entry (`scripts/release-notes.mjs`;
the `latest` release is marked Latest, prereleases are marked Pre-release). The **Docs** workflow rebuilds the site (including docs for
older minors under `/vX.Y/`). The maintainer posts a summary in Discussions **Announcements**.

## Major releases (1.0.0, 2.0.0…)

The README is the front page on GitHub and npm, so it must be reviewed before a major release. Add the following to the
`chore(release)` commit, after step 2 above:

- **Installation and requirements:** the install command, peer dependencies (React, Tailwind CSS) and minimum Node.js match the new release.
- **Examples:** the code in the README runs with the new API, with no removed or deprecated APIs left.
- **Features:** the feature list, component count, themes and brands match the docs.
- **Links:** docs, the migration guide from the previous major, CHANGELOG, npm.
- Fix what needs fixing, then write `<!-- readme-reviewed: X.0.0 -->` at the top of `README.md`, even if nothing needed fixing.
  `check:release` blocks the release PR of a major if this marker is missing or still names the previous major. Minor, patch and
  prerelease (`-rc.N`) versions don't need it.

A CLI major works the same way with `packages/cli/README.md` (commands, options, Node.js requirement, examples); the CLI's
`check-release` checks the same marker.

## Quick fixes after a release (hotfix)

Fix on `main` → `patch` changeset → repeat the process (e.g. `0.6.1`). Never republish the same version number; npm doesn't allow it.
Hotfixes are patch releases only: `check:changesets` blocks `minor` / `major` changesets in PRs into `main`.

## CLI: `@yugen-ui/cli` and `create-yugen-ui`

Two packages in `packages/` (`packages/cli` → npm `@yugen-ui/cli`, the command after install is `yugen`;
`packages/create-yugen-ui` → npm `create-yugen-ui`), released **separately** from `yugen-ui`: tag `cli@X.Y.Z`, workflow
**Release CLI** (`.github/workflows/release-cli.yml`). They don't use Changesets: the version and CHANGELOG are edited by hand.
User docs: `#/concepts/cli`.

The unscoped name `yugen` can't be used: npm returns 403 *"Package name too similar to existing package hygen"*. Scoped packages
are not subject to this check; the `@yugen-ui` scope is an npm org (free), and `NPM_TOKEN` must have write access to that org.

### Rules

`packages/cli/scripts/check-release.mjs` checks rules 1–4 automatically (in CI and at release time).

1. **CHANGELOG and What's new**: each version has a `## X.Y.Z` section at the **top** of `packages/cli/CHANGELOG.md` (changes to
   both packages are recorded together here), and a news entry in `src/docs/news/cli` (the `@yugen-ui/cli` tab on
   `/news`). When `create-yugen-ui` changes version, also add news in `src/docs/news/create-yugen-ui`. Write both Vietnamese and
   English, with a link to `/concepts/cli`. CLI prereleases need no news entry. During development, PRs that change `packages/cli` add
   a line to the `## Unreleased` section of the CHANGELOG; at release time, rename `Unreleased` to the version number.
2. **`create-yugen-ui` follows the CLI**: `packages/create-yugen-ui/package.json` declares `"@yugen-ui/cli": "^X.Y.0"`. Before
   1.0, `^0.1.0` does **not** accept `0.2.0`: when the CLI moves up a minor, update the dependency and bump the `create-yugen-ui`
   version in the same commit. A CLI patch release doesn't require republishing `create-yugen-ui`.
3. **Templates follow `yugen-ui`**: templates live in the CLI package and pin `yugen-ui@^<current version>`. After every minor
   release of `yugen-ui`, release the CLI (patch) so that `create` makes apps with the new version.
   The CLI can only be published after that `yugen-ui` version is on npm: `check-release --tag` blocks it otherwise. Before then, the
   CI job `Template · …` builds the templates with an `npm pack` of the same commit, so the release PR doesn't need the published version.
4. **Never reuse a version**, including unpublished ones: npm blocks them permanently, and `npm view` doesn't show unpublished versions.
   Check with `npm run check:release -- --npm`. For a broken version use `npm deprecate`, not unpublish.
5. **Branches**: stable versions are tagged on `main` (dist-tag `latest`); prereleases `cli@X.Y.Z-beta.N` are tagged on `next`
   (dist-tag `next`, try them with `npx @yugen-ui/cli@next`). `create-yugen-ui` is only released with stable versions.
6. **CLI SemVer**: `patch`: bug fixes, template updates; `minor`: new commands or options, changes to the `yugen.json` format,
   new templates. Before 1.0, breaking changes (renamed commands / options, files written to a different place) are also `minor`,
   called out in the CHANGELOG. Cadence and news follow the [rules for each number](#rules-for-each-number) (`src/docs/news/cli`).
7. **The registry is a contract**: `yugen add` / `init` read `public/r`, generated by `scripts/build-registry.mjs` (item names,
   paths `registry/yugen/{ui,lib}/…`, imports `@/lib` / `@/components/ui`, the items `theme`, `cn`, `yugen-provider`,
   `all`). If you change any of these, release a compatible CLI **before** the docs (and registry) deploy.
8. **Publish only through tags** to get provenance: no `npm publish` from a personal machine.

### Steps

```bash
git switch main && git pull
# 1. Bump "version" in packages/cli/package.json (+ packages/create-yugen-ui/package.json under rule 2)
# 2. Rename "## Unreleased" to "## X.Y.Z" at the top of packages/cli/CHANGELOG.md
# 3. Finalize the upcoming news in src/docs/news/cli (and news/create-yugen-ui if create-yugen-ui changes version):
#    remove upcoming, fill in the release date in both .vi.md and .en.md; if there is none, add two files for the new version
# 4. Update the cli X.Y.Z milestone in src/docs/roadmap.ts, then npm run roadmap (from the repo root)
cd packages/cli
npm install --package-lock-only    # version in the lockfile
npm run check:release -- --npm     # rules 1–4 (--npm needs network access)
npm test
npm run smoke                      # npm pack both packages → install from the .tgz → create-yugen-ui with every template
```

Commit `chore(release): cli X.Y.Z`, merge into `main`, **wait for CI to be green** (`CLI` job), then:

```bash
git switch main && git pull
git tag cli@X.Y.Z
git push origin cli@X.Y.Z
```

**Release CLI** runs `check-release.mjs --tag` (the tag matches the version, the branch is right, the version was never unpublished, the `yugen-ui` version pinned by the templates is on npm → pick the dist-tag),
typecheck, test, smoke, then `npm publish --provenance` for `@yugen-ui/cli` and `create-yugen-ui`. Each package is skipped if
that version is already on npm, so when a publish step fails (token, package name), fix the cause and just **Re-run** the workflow.

### After publishing

```bash
npx @yugen-ui/cli@latest --version
npx create-yugen-ui@latest smoke-app --template starter
cd smoke-app && npm run build
```

The docs deploy from `main` puts the news entry on `#/news` (the `@yugen-ui/cli` / `create-yugen-ui` tab) and turns on the "new" dot
in the top bar for people who saw the previous version. **Release CLI** creates a GitHub Release for the tag from the section in
`packages/cli/CHANGELOG.md` (not marked Latest, so the repo page keeps showing the `yugen-ui` release). Broken after publishing: fix on
`main` and release a patch; deprecate the broken version with `npm deprecate @yugen-ui/cli@X.Y.Z "…"` (don't unpublish).

### Trusted publishing (OIDC, #202)

npm restricts tokens that bypass 2FA. Both release workflows already use npm ≥ 11.5.1 and have `permissions: id-token: write`, so
npm switches to OIDC on its own once a package declares a trusted publisher:

1. On npmjs.com, each package › **Settings** › **Trusted Publisher** › GitHub Actions: repository `trandat1114/Yugen-UI`,
   workflow `release.yml` for `yugen-ui`; `release-cli.yml` for `@yugen-ui/cli` and `create-yugen-ui`. No
   environment needed.
2. Release the next version as usual. The "Publish to npm" log no longer shows the notice about tokens that bypass 2FA; the package
   page on npm shows provenance.
3. After the first release that runs through OIDC: remove `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` from the publish steps, delete
   the `NPM_TOKEN` secret and revoke the token on npmjs.com.

Until step 1 is done, npm keeps using `NPM_TOKEN` as before, so releases are not interrupted.

### First time (`cli@0.1.0`)

1. On npmjs.com: **Add Organization** → name `yugen-ui` (public packages, free).
2. `NPM_TOKEN`: a granular token with **Read and write** for **All packages** and for the `yugen-ui` org (or a classic
   Automation token); update the secret in Settings › Secrets › Actions.
3. Tag `cli@0.1.0` on `main` as above.
