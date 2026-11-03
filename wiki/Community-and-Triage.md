# Community and Triage

*Tiếng Việt: [Community-and-Triage-vi](Community-and-Triage-vi).*

## Where to ask?

| You have… | Go to |
|---|---|
| A usage question | [Discussions › Q&A](https://github.com/trandat1114/Yugen-UI/discussions/categories/q-a) — mark the correct answer |
| An early idea | [Discussions › Ideas](https://github.com/trandat1114/Yugen-UI/discussions/categories/ideas) — upvote to prioritize |
| Something you built and want to show | [Discussions › Show and tell](https://github.com/trandat1114/Yugen-UI/discussions/categories/show-and-tell) |
| A reproducible bug | [Issue › Bug report](https://github.com/trandat1114/Yugen-UI/issues/new/choose) |
| A keyboard / screen reader problem | Issue › Accessibility |
| A wrong example, missing props, a translation | Issue › Documentation |
| A security vulnerability | [Report it privately](https://github.com/trandat1114/Yugen-UI/security/advisories/new) — don't open an issue |

Only maintainers post in **Announcements** (releases, major changes). **Polls** are for asking the community when choosing an API.

## Discussions rules

1. **Search before asking**: the docs, [[FAQ]] and older Discussions. Duplicate questions are marked *Duplicate* and locked.
2. **One topic per thread**, with a title that states the problem ("DataGrid doesn't scroll inside a Sheet on iOS", not "Help!!").
3. **Give enough context**: the `yugen-ui` version, React, framework, a minimal code snippet (a `tsx` code block), ideally a StackBlitz link.
4. **Mark the answer** (*Mark as answer*) once your question is resolved; if you found the solution yourself, come back and share it.
5. **Don't bump threads** with "+1" comments. Use 👍 (reaction) to prioritize; comment only when you have new information.
6. **Vietnamese or English** are both fine; reply in the asker's language when you can.
7. **Don't post private information** (tokens, passwords, customer data) and **don't report security vulnerabilities** in Discussions.
8. **Ideas / RFCs** follow the [RFC process in GOVERNANCE.md](https://github.com/trandat1114/Yugen-UI/blob/main/GOVERNANCE.md#3-quy-trình-rfc);
   maintainers record the outcome *Accepted / Declined / Needs work* in the thread.
9. Only maintainers post in **Announcements**; comments there should be short and on topic.
10. A question asked many times → maintainers add it to the [[FAQ]] or the docs, then lock the thread with a link.

Violations are handled as described under *Community moderation* in the [[Operations Handbook]].

## Labels

Source: [`.github/labels.yml`](https://github.com/trandat1114/Yugen-UI/blob/main/.github/labels.yml); the **Labels** workflow syncs them automatically.

- **Type**: `bug`, `enhancement`, `documentation`, `accessibility`, `performance`, `question`
- **Area**: `area: components`, `area: labs`, `area: tokens & theming`, `area: docs site`, `area: build & package`, `area: ci & tests`
- **Status**: `needs triage` → `needs reproduction` / `confirmed` → `in progress` (· `blocked`) ; `breaking change`
- **Community**: `good first issue`, `help wanted`

## Triage process (maintainers, weekly)

1. Filter by `label:"needs triage"`.
2. Questions → move to Discussions (**Convert to discussion**). Duplicates → `duplicate` + a link, close.
3. Bugs not yet reproduced → `needs reproduction`, ask for a StackBlitz (the StackBlitz button on every docs example). No response in 14 days → close.
4. Valid → remove `needs triage`, add `confirmed` + an area label; small, clear tasks → `good first issue` with a hint about which files to change.
5. Ideas in Discussions with many upvotes and enough detail → create an `enhancement` issue that links back.

## What a good first issue looks like

- A scope of 1–2 files, with a link to the file / line to change.
- Clear completion criteria ("`npm run check:props` shows no more warnings for Wizard").
- Good examples: translate a concept page into English, document a missing prop (listed by `npm run check:props`),
  add keyboard tests for a component.

## Showcase

**Show and tell** posts with the consent box ticked are featured in the Showcase section of the
[Community page](https://trandat1114.github.io/Yugen-UI/#/community).
