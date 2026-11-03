# Testing and Quality

*Tiếng Việt: [Testing-and-Quality-vi](Testing-and-Quality-vi).*

## Commands

| Command | What it checks |
|---|---|
| `npm run typecheck` | Strict TypeScript 7, the native compiler (app + config) |
| `npm run lint:classes` | Tailwind classes in canonical form (`-- --fix` to fix them automatically). Results are cached in `node_modules/.cache/` by the CSS in `src`, the Tailwind version and the script: ~1 s cached, ~25 s cold |
| `npm test` | Vitest: logic, keyboard, SSR / hydration (~470 tests) |
| `npm run test:e2e` | Playwright: axe on every docs page (light / dark, + high contrast / RTL), drag and drop, touch |
| `npm run test:visual` | Compares screenshots with the baselines (only Linux screenshots are committed; CI runs it on PRs that change the UI) |
| `npm run test:engines` | Interaction on Firefox, desktop Safari and iPhone (WebKit) |
| `npm run check:examples` | Every docs example typechecks when copied out and used with `yugen-ui` |
| `npm run check:props` | Props tables in the docs match the real types (asks TypeScript 7's type checker through `typescript/unstable/sync`) |
| `npm run check:release` | `package.json` = `src/docs/news` = `CHANGELOG.md` |
| `npm run size` | Size budget (gzip), after `npm run build:lib` |
| `node scripts/sync-templates.mjs --check` | Templates match the blocks |

## CI (`.github/workflows/ci.yml`)

Pushes / PRs that only change reading material (README, wiki, CONTRIBUTING, PR / issue templates…) don't run CI, Browser
engines or Docs (`paths-ignore`). `CHANGELOG.md`, `ROADMAP.md` and Markdown in `src/` / `templates/` still run CI because
checks read them. Add new docs files to the list in all three workflows. If required status checks are turned on later,
checks from a skipped workflow will hang at "Expected": then switch to filtering inside the job instead of `paths-ignore`.

| Job | Runs |
|---|---|
| Build · Node 24 / 26 | typecheck, lint:classes, the check:* scripts, sync-templates, build lib + docs, pack, size |
| Unit tests (React 19) | `npm test` |
| E2E · shard 1/4 … 4/4 | `test:e2e --shard=n/4` in parallel (blob report; `test-results-n` on failure) |
| E2E (Playwright + axe) | merges the blob reports into one HTML report (`playwright-report`); red if any shard is red; fixed check name |

Separate workflow **Browser engines** (`engines.yml`): `npm run test:engines` weekly (Monday), on PRs into `main`, on PRs
into `next` that change `e2e/` / `playwright.config.ts` / the workflow itself, and when run manually. When a scheduled run fails, it opens the issue "E2E on Firefox / WebKit is failing" (or comments on it if it is already open), and closes it when the run turns green
again. Differences between engines are recorded on the docs page Browsers & platforms › Testing on each engine.

## Fixing a red CI: common cases

| Symptom | Usual cause | Fix |
|---|---|---|
| React 19: `Type '…' is not assignable to type 'Ref<…>'` | a ref callback returns a value (`ref={(el) => list.push(el)}`) | write a function body `{ list.push(el); }` |
| React 19: `Expected 1 arguments` on `useRef` | `useRef<T>()` with no initial value | `useRef<T \| undefined>(undefined)` |
| `sync-templates --check` out of sync | a block or version changed without regenerating | `node scripts/sync-templates.mjs` |
| `check:release` fails | missing news in `src/docs/news` / CHANGELOG | add `<version>.vi.md` and `.en.md`, a CHANGELOG entry |
| `check:examples` fails | the example uses a variable that only exists in the docs file | add `setup: declarationsOf(RAW, [...])` |
| axe: `aria-allowed-attr` | an ARIA attribute not valid for the role (e.g. `aria-orientation` on `<ol>`) | switch to `data-*` or the correct role |
| Visual differences | an intentional UI change | **Visual regression** workflow on the branch, tick `update` (rewrites every baseline) → download `visual-screenshots` → copy into `e2e/__screenshots__/` → commit the files git shows as changed. Diff images: the `visual-test-results` artifact |
| size-limit exceeded | a large dependency / component was added | optimize, or raise `limit` in `.size-limit.cjs` with the reason in the PR |

## Node.js versions in CI

Build and CLI run on every released Node.js version that has not reached EOL (LTS + Current); jobs that run a single version
use the latest Active LTS. `node scripts/node-versions.mjs` compares the workflows with the [release schedule](https://github.com/nodejs/Release) (exit 1 if
they differ, `--write` to fix them); the `node-versions.yml` workflow runs weekly and opens a PR into `next`. The CLI's `engines`
doesn't change automatically: raising it is a CLI minor release.
