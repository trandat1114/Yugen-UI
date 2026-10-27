---
title: Quick start
description: Create an API key, connect the SDK and write your first note in about five minutes.
order: 3
---

This guide creates a note in a notebook from a small script. You need Node.js 20 and the SDK
([Installation](/getting-started/installation/)).

## 1. Create an API key

In the app, open **Settings › API keys** and choose **New key**. Name it, pick the `notes:write` scope and copy the key:
it is shown once.

> [!TIP]
> Make one key per app or script. Revoking a key then never breaks anything else.

## 2. Create a client

```ts title=src/sakura.ts
import { SakuraNotes } from "@sakura-notes/sdk";

export const sakura = new SakuraNotes({
  apiKey: process.env.SAKURA_API_KEY!,
});
```

## 3. Write a note

Find the notebook id in the address bar of the app (`/nb_…`) or with `npx sakura notebooks list`, then:

```ts tab=TypeScript
import { sakura } from "./sakura";

const note = await sakura.notes.create({
  notebookId: "nb_8f2k",
  title: "Sprint review",
  body: "## Decisions\n\n- Ship search on Friday",
  tags: ["sprint", "review"],
});

console.log(note.id); // note_5c1m…
```

```bash tab=curl
curl https://api.sakuranotes.example/v1/notes \
  -H "Authorization: Bearer $SAKURA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"nb_8f2k","title":"Sprint review","tags":["sprint"]}'
```

```bash tab=CLI
npx sakura notes new "Sprint review" --notebook nb_8f2k --tag sprint
```

The note shows up in the app straight away for everyone who can open the notebook.

## 4. Read it back

```ts
const { data } = await sakura.notes.list({ notebookId: "nb_8f2k", limit: 5 });

for (const note of data) console.log(note.title, note.updatedAt);
```

## Next steps

- Group notes and choose who sees them: [Organizing notes](/guides/organizing-notes/) and
  [Sharing and permissions](/guides/sharing/).
- React to changes as they happen with [webhooks](/guides/webhooks/).
