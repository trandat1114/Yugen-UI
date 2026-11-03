# Operations Handbook

*Tiếng Việt: [Operations-Handbook-vi](Operations-Handbook-vi).*

How the project runs day to day: who does what, when, and under which rules. Roles and decision rights: [`GOVERNANCE.md`](https://github.com/trandat1114/Yugen-UI/blob/main/GOVERNANCE.md).

## 1. Response time commitments (goals, not a contract)

| Item | First response | Notes |
|---|---|---|
| Security vulnerability report | 3 days | The fix has top priority; a patch is released as soon as it is ready |
| Blocking bug (crash, broken build, severe a11y problem) | 3 days | Add `confirmed` + the priority in a comment |
| Regular bug, other a11y issues | 7 days | |
| PR | 7 days to the first review | No response? Politely ping in the PR after 7 days |
| Discussions Q&A | 7 days | Better still if the community answers first |
| Feature request / Ideas | 14 days | The answer may be "after 1.0" |

## 2. Operations schedule

| Frequency | Task | Who |
|---|---|---|
| Weekly | Triage `needs triage` ([[Community and Triage]]), answer pending Q&A, review PRs | Triager / maintainer |
| Weekly | Watch CI on `main` (must always be green). Monday: merge Dependabot minor + patch PRs into `next` if green; close red major PRs, add an `ignore` and note it in the migration issue (#91) | Maintainer |
| Every 2–4 weeks | Release if there are changesets ([[Release Process]]) | Maintainer |
| When `packages/cli/CHANGELOG.md` has an `Unreleased` section | Release the CLI with a news entry on `#/news` ([[Release Process]] › CLI) | Maintainer |
| Monthly | Update the ROADMAP, label new `good first issue`s, pick Showcase entries | Maintainer |
| Monthly | Read the **Prune branches** report (on the 1st); if the "Xoá" (delete) entries are right, rerun with `apply`; handle "Cần xem" (review) entries by hand ([[Branching and Release Channels]] › Branch cleanup) | Maintainer |
| Quarterly | Review major dependencies (React, Radix, Tailwind), the size budget, manual a11y audit with NVDA / VoiceOver | Maintainer |

## 3. Review & merge rules

1. Every change to `main` goes through a PR; CI **must be green** (build, unit, React 18, e2e).
2. At least **1 approval** from a maintainer (PR authors don't approve their own PRs, unless there is only one maintainer; in that case
   they merge after CI is green and after re-reviewing the diff the next day).
3. User-facing change → a changeset. Breaking change → an accepted RFC + a "Thay đổi lớn" (Breaking) entry + a migration guide.
4. Merge with **Squash and merge**, with a Conventional Commits title (`feat(datagrid): …`).
5. Don't merge while threads are unresolved, or while axe / visual is red without an explanation.
6. Review in this order: correct behavior & a11y → API (prop names, defaults) → Design.md compliance → tests → code style.

## 4. Recommended GitHub settings (one time)

Protection for `next`, `release/*`, `canary` and `v*` tags: see [[Branching and Release Channels]].

**Settings → Branches → Branch protection for `main`:**
- Require a pull request before merging · Require approvals: 1 · Dismiss stale approvals
- Require status checks: `Build · Node 24`, `Build · Node 26`, `Unit tests (React 19)`, `React 18`, `E2E (Playwright + axe)`
- Require conversation resolution · Block force pushes · Do not allow deletions

**Settings → General:** Allow squash merging (default) · Automatically delete head branches · Discussions: on.

**Settings → Code security:** Dependabot alerts + security updates · Private vulnerability reporting · Secret scanning.

**Discussions → Categories:** Announcements (only maintainers post), General, Ideas (used for RFCs), Q&A (with marked answers), Polls, Show and tell.

## 5. Automation in place

| Workflow / file | What it does |
|---|---|
| `ci.yml` | Build, test (React 19), React 18, e2e, the checks, size. Doesn't run when a push / PR only changes reading material (README, wiki, CONTRIBUTING…; the `paths-ignore` list in the file); `engines.yml` and `pages.yml` use the same list |
| `release.yml` | Tag `v*` → check the branch + consistency → `npm publish --provenance` (dist-tag by channel) → GitHub Release from the CHANGELOG entry. Push to `canary` (or a manual run) → an `x.y.z-canary-…` version with the `canary` dist-tag |
| `release-cli.yml` | Tag `cli@*` → `check-release.mjs --tag` (CHANGELOG, news entry on `#/news`, unused version, `yugen-ui` already on npm) → publish `@yugen-ui/cli` + `create-yugen-ui` → GitHub Release |
| `sync-next.yml` | Push to `main` → if `next` has no work of its own, merge `main` straight into `next` (no PR, no CI rerun) and rerun Docs; otherwise open a `main → next` PR |
| `node-versions.yml` | Weekly → compare the Node.js versions in workflows with the release schedule (`scripts/node-versions.mjs`), open a PR into `next` when they differ, then run CI on that branch |
| `prune-branches.yml` | 1st of every month → report stale branches (`scripts/prune-branches.mjs`) in the job summary; run manually with `apply` to delete the "Xoá" entries |
| `react-share.yml` | 1st of every month → React download share by major (`scripts/react-share.mjs`) as a comment on #62; React 18 below 10% is one of the two conditions for dropping its support |
| `engines.yml` | Weekly, on PRs into `main` and on PRs that change `e2e/` → E2E on Firefox and WebKit; when a scheduled run fails, open / update an issue, close it when green again |
| `pages.yml` | Deploy the docs (+ docs for older minors) to GitHub Pages |
| `wiki.yml` | Push `wiki/` to the GitHub Wiki |
| `labels.yml` | Sync labels from `.github/labels.yml` |
| `pr-labeler.yml` | Add `area: …` labels to PRs by file path (`.github/labeler.yml`) |
| `stale.yml` | `needs reproduction` issues silent for 14 days → reminder, 7 more days → close |
| `welcome.yml` | Greet first-time issue / PR authors, point them to CONTRIBUTING |
| `visual.yml` | Manual: compare screenshots / create Linux baselines |
| `CODEOWNERS` | Request maintainer review automatically |

## 6. Incident response

| Incident | Do right away |
|---|---|
| Broken release (severe build / runtime error) | `npm deprecate yugen-ui@x.y.z "Broken …, use x.y.z+1"` → fix → release a patch. **Don't** `npm unpublish` (it breaks other people's projects) |
| Leaked secret | Revoke it right away (npm publishes through trusted publishing, so there is no npm token to leak), replace the secret, check recent publishes and workflow runs |
| Security vulnerability reported | Confirm it in a private Security Advisory, build the fix in a private fork, release, publish the advisory + a CVE if needed |
| `main` is red | Fix it before any other PR; revert the offending commit if it can't be fixed within 1 day |
| Docs site broken | Rerun the Docs workflow on the last good commit (`workflow_dispatch`) |
| Docs show stale or broken pages that a redeploy doesn't fix (service worker) | Turn the service worker off: see below |

### Docs service worker

The docs register a service worker (`src/docs/sw/sw.js`, written to `<base>/sw.js` by `vite.perf.ts`). It serves hashed files
in `assets/` from its cache, loads pages from the network first and falls back to the cached copy of the same page when
offline. It leaves everything else alone (`versions.json`, images, `r/*.json`, other origins such as the contributors
data) and ignores the other docs builds in subfolders (`next/`, `vX.Y/`). Each deploy ships a new `sw.js`, which drops the
previous build's cached pages and the chunks that are no longer in the build. It isn't registered in local dev or in E2E.

Kill switch:

1. Repository **Settings → Secrets and variables → Actions → Variables**: add `DOCS_SW` = `off`.
2. Rerun the Docs workflow (`workflow_dispatch`).

That build's `sw.js` deletes the docs caches, unregisters itself and reloads open tabs the next time a visitor opens any
docs page, and the pages stop registering a worker. Delete the variable and rerun the workflow to turn caching back on.

## 7. Community moderation

Apply the [Code of Conduct](https://github.com/trandat1114/Yugen-UI/blob/main/CODE_OF_CONDUCT.md) to issues, PRs and Discussions.

| Level | When | Action |
|---|---|---|
| Reminder | Off topic, mildly impolite | Comment with a reminder, edit / hide the comment (*Hide → Off-topic*) |
| Warning | Repeated, or insulting | Public or private warning, temporarily lock the thread (*Lock conversation*) |
| Temporary block | Serious violation | *Block user* for 30 days from the organization / repo |
| Permanent block | Harassment, threats, deliberate spam | Permanent block, delete the content, report to GitHub if needed |

Spam (ads, malicious links) → delete right away, no warning needed. Record every moderation decision briefly for the other maintainers.

## 8. Metrics to watch

Open issues by label, time to first response, PRs waiting for review > 7 days, share of Q&A threads with an answer, weekly npm
downloads, the size budget: see them at a glance in the repo's **Insights** tab and on the npm page.
