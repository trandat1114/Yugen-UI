# Writing

*Tiếng Việt: [Writing-vi](Writing-vi).*

Applies to docs pages (vi + en), templates, CLI messages, README, What's new entries and changesets.

## Principles

1. **Say what the reader can do.** The opening sentence answers "what is it for", without a rambling introduction.
2. **One idea per sentence.** Split any sentence longer than two lines.
3. **Don't repeat what is already shown right next to it.** If a tab, button or heading already says it, the paragraph doesn't say it again.
4. **Stay on topic.** Tools outside the project (giget, …) have no place in Yugen's docs.
5. **No marketing words**: "powerful", "amazing", "has blossomed". No dashes ( — ) to insert asides. No lists of three just for rhythm.
6. **Don't state the obvious** ("hover to…", "click the button to…").
7. **Use the right names**, as users see them (table below).
8. **Fluent 2** is mentioned only in Credits and on the From Fluent UI page.

## Names

| Use | Don't use |
|---|---|
| `yugen-ui` (npm package), Yugen UI (product) | Yugen-UI, YugenUI |
| `@yugen-ui/cli` | CLI yugen, yugen CLI |
| `create-yugen-ui` | Yugen app generator |
| Có gì mới · What's new | Changelog (when talking about the docs page) |
| Starter, SaaS, Blog, Dashboard, AI chat | "Sakura Studio · Yugen UI", "Yugen UI · Dashboard" |

Commands must run in every shell: don't chain them with `&&`, don't use `npm create … -- --option` (PowerShell drops the `--`). Use `npx create-yugen-ui@latest my-app --template starter`, one command per line.

## Vietnamese

- Natural, clear, short. Read it aloud: it should sound like a person talking, not like a translation.
- Keep English terms when there is no common Vietnamese word: theme, token, props, component, template.
- Capitalize the first word of a sentence and proper names; don't capitalize every word in headings.
- Use "bạn" when addressing the reader; avoid "chúng tôi".

## English

- Plain words, short sentences, sentence case for headings.
- Active voice; "you" for the reader.
- Same facts as the Vietnamese page. Translate the meaning, not word by word.

## Before / after

| Before | After | Why |
|---|---|---|
| Want to own the source code? | Need deep customization? | Talk about how far you can customize, not about ownership |
| theme remembered | saves the theme the user picks | Clear about who does what |
| everything is already wired up | configuration is ready | More natural wording |
| Your app has blossomed. | The project is running. Edit `src/Welcome.tsx` to get started. | Say what to do next, no metaphor |
| …with a cherry blossom welcome page that shows what Yugen UI can do — delete it when you start writing. | (removed) | Dash for an aside, adds no information |
| npm / pnpm / yarn / bun tabs + a code block listing the same command for each package manager | Keep only the tabs | Repeated content |
| "Based on Fluent 2, not a Microsoft product" in the footer of every page | Only in Credits | Already on the introduction page |

## Changesets, CHANGELOG and What's new

- **Changeset** (in English): a short paragraph for package users. Say what changed and what it affects. No internal details (file names, PRs) unless users need to know them.
- **What's new** (`src/docs/news/<package>/<version>.vi.md` and `.en.md`): a title of a few words, a one-paragraph summary, one change per item with a link `[→](/path)` to the docs page; `` `code` `` for props, functions, files. The two versions match item by item (wiki › Release Process › News on the What's new page).
- **Upcoming news** (`upcoming: true`, written on `next`): write it like a released version, in the present tense, without "will"; each PR into `next` adds its own line.
- Breaking changes: spell out how to migrate.

## Checklist for PRs that change copy

- [ ] No sentence repeats a tab, button or heading right next to it
- [ ] No dashes for asides, no marketing words, no stating the obvious
- [ ] Names match the table above; commands run in PowerShell
- [ ] The Vietnamese version reads naturally; the English version has the same content
- [ ] Fluent 2 appears only in Credits / the migration page
