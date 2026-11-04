# Branching and Release Channels

*Tiếng Việt: [Branching-and-Release-Channels-vi](Branching-and-Release-Channels-vi).*

Each long-lived branch maps to **one release channel**. Users pick a stability level through the npm dist-tag.

| Branch | Purpose | Version | npm dist-tag | Docs |
|---|---|---|---|---|
| `main` | The current stable release; only takes bug fixes, docs, chores | `0.6.1` | `latest` → `npm i yugen-ui` | `/` |
| `next` | Collects features for the next minor, breaking changes | `0.7.0-next.3` | `next` → `npm i yugen-ui@next` | `/next/` |
| `release/X.Y` | Fixes for an older minor after a newer minor is out | `0.6.4` | `release-0.6` → `npm i yugen-ui@release-0.6` | `/v0.6/` (from the tag) |
| `canary` | Quick experiments: every push publishes a version | `0.7.0-canary-20261021…` | `canary` → `npm i yugen-ui@canary` | — |

Short-lived branches (deleted after merge): `feat/<scope>-<description>`, `fix/…`, `docs/…`, `chore/…`, `exp/…` (trying out ideas, never merged directly).

```
feat/datagrid-grouping ──PR──▶ next ──(0.7.0-next.N)──▶ … ──PR "release 0.7.0"──▶ main ──tag v0.7.0──▶ latest
fix/tabs-focus ─────────PR──▶ main ──tag v0.6.1──▶ latest
                               main ──automatic "sync main → next"──▶ next   (fixes are not missing from 0.7)
                       tag v0.6.x ──▶ release/0.6 ──fix──▶ tag v0.6.5 ──▶ release-0.6
any branch ──push / reset──▶ canary ──▶ yugen-ui@canary
```

The docs for `next` (https://trandat1114.github.io/Yugen-UI/next/) rebuild after every push to `next`, including upcoming news
(`upcoming`) on the What's new page: check there before opening the `next → main` PR ([[Release Process]] › News for an upcoming
release).

**Sync main → next** (`sync-next.yml`, after every push to `main`): if `next` has no changes beyond `main` (common right
after a release), the workflow merges `main` straight into `next`. The resulting tree is the same as the `main` tree that CI
already checked, so there is no PR and CI doesn't run again; the workflow reruns Docs to update `/next/`. If `next` has work
of its own, the workflow opens the PR "chore: sync main → next" so CI checks the merge result; merge it with **Create a merge commit**.

## Which branch does a PR go to?

| Change | Target branch |
|---|---|
| Bug fix (patch), docs, tests, CI | `main` |
| New component / prop / token (minor) | `next` |
| Breaking API change (with an RFC) | `next` |
| Fix for an older minor | `release/X.Y` (then forward-port to `main` if needed) |
| Experiment that others need to install | push to `canary` (no PR needed) |

When there is no `next` branch (between two cycles), feature PRs go to `main` as usual.

## Workflow per channel

**Stable (`main` → `latest`)**: see [[Release Process]]: `npm run version-packages` → News → tag `vX.Y.Z` on `main`.

**Planned prerelease (`next` → `next`)**
```bash
git switch -c next main                 # start of the cycle (once)
npx changeset pre enter next            # turn on prerelease mode, commit .changeset/pre.json
# … merge feature PRs into next …
npm run version-packages                # → 0.7.0-next.0 (CHANGELOG has a prerelease entry)
git tag v0.7.0-next.0 && git push origin next v0.7.0-next.0   # release.yml publishes the next dist-tag
```
End of the cycle: on `next` run `npx changeset pre exit` → `npm run version-packages` (→ `0.7.0`) → add News →
PR `next → main` → merge → tag `v0.7.0` on `main`. The News page only lists stable releases; prereleases need no News entry.

**Fixing an older minor (`release/X.Y`)**
```bash
git switch -c release/0.6 v0.6.4        # create it from the last tag of the older minor (once)
# … cherry-pick / fix, add a patch changeset …
npm run version-packages && git tag v0.6.5 && git push origin release/0.6 v0.6.5
```
`scripts/release-channel.mjs` sees `0.6.5 < latest`, so it uses the `release-0.6` dist-tag and leaves `latest` alone.

**Canary**
```bash
git push --force origin HEAD:canary     # from the branch you want others to try
```
The `canary` job of `release.yml` runs typecheck + test + build, then publishes `x.y.z-canary-<timestamp>`. No tag, no News needed.

## Safety rules (checked automatically)

- Prerelease tags (`-next.N`, `-rc.N`) are only valid on `next` or `release/*`; stable tags only on `main` or `release/*`.
  `release.yml` stops if a tag is on the wrong branch.
- The tag must match `package.json`; `check:release` checks the CHANGELOG (+ News for stable releases).
- Never force-push `main`, `next`, `release/*`. Only `canary` may be overwritten.

## Branch cleanup

Short-lived branches are deleted as soon as their PR merges. GitHub does this when Settings → General → **Automatically delete head
branches** is on. The rest is cleaned up with `scripts/prune-branches.mjs`, following this table (the branch's latest PR decides).
The report uses the section names Xoá (delete), Cần xem (review) and Giữ (keep).

| Branch | Verdict |
|---|---|
| `main`, `next`, `canary`, `gh-pages`, `issue-assets` (screenshots embedded in issues / PRs), `contributors-data` (data for the Contributors page), `release/*`, the default branch | Never deleted |
| Has an open PR | Keep |
| Last commit is already in `main` or `next` | Delete |
| PR merged at exactly the last commit (squashed, so the commit is not in `main`) | Delete |
| Has commits after the PR merged | Review |
| PR closed without merging 14 or more days ago | Delete (the PR head stays at `refs/pull/<number>/head`) |
| No PR, no commits for 30 days (`exp/`: 60 days) | Review |
| Everything else | Keep |

```bash
node scripts/prune-branches.mjs                                # report only, deletes nothing
node scripts/prune-branches.mjs --apply                        # delete the "Xoá" entries
node scripts/prune-branches.mjs --apply --include-abandoned    # also delete the "Cần xem" entries
node scripts/prune-branches.mjs --local --apply                # also merged local branches, git worktree prune
```

- Requires a logged-in `gh`. Each deleted branch is printed with its SHA; restore it with `git push origin <sha>:refs/heads/<branch>`.
- "Cần xem" (review) entries are never deleted automatically. Check `git log origin/next..origin/<branch>` first: if there is
  unfinished work, open a draft PR; if the branch is no longer needed, delete it with `--include-abandoned`.
- The **Prune branches** workflow runs on the 1st of every month and only writes a report to the job summary. Run it manually
  (Run workflow, tick `apply`) to delete the "Xoá" entries.
- Worktrees: remove the worktree (`git worktree remove`) before deleting its branch. If the worktree's `node_modules` is a
  junction pointing to the main repo, delete the junction first (PowerShell: `(Get-Item <worktree>\node_modules).Delete()`),
  then remove the worktree.

## Branch protection (Settings → Branches → Add rule)

| Pattern | Rules |
|---|---|
| `main` | PR required, 1 approval, 5 CI jobs green, all threads resolved, no force-push / deletion |
| `next` | PR required, CI green, no force-push / deletion |
| `release/*` | PR required, CI green, no deletion |
| `canary` | Not protected (maintainers may force-push) |

`v*` tags: Settings → Rules → Rulesets → Tag ruleset, only maintainers may create / delete `v*` tags.
