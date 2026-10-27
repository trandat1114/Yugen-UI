---
title: Organizing notes
description: Notebooks and tags, and how to pin, archive and move notes from code.
order: 1
---

## Notebooks

A notebook holds the notes on one subject. Make one per team, project or meeting series; a workspace can have as many as
it needs.

```ts
const notebook = await sakura.notebooks.create({
  name: "Design reviews",
  parentId: "nb_1a4z", // optional: inside another notebook
});
```

Notebooks nest one level deep. Deeper trees are flattened in the app, so keep them shallow.

## Tags

Tags cut across notebooks. A note can have up to 20 tags, written in lower case with letters, digits and `-`.

```ts
await sakura.notes.update("note_5c1m", { tags: ["sprint", "decision"] });

const decisions = await sakura.notes.list({ tag: "decision" });
```

## Pin and archive

Pinned notes stay at the top of their notebook. Archived notes leave lists and search results but keep their history, and
can be restored at any time.

| Field | Type | Effect |
| --- | --- | --- |
| `pinned` | boolean | Keeps the note at the top of its notebook |
| `archived` | boolean | Hides the note from lists and search |

```ts
await sakura.notes.update("note_5c1m", { pinned: true });
await sakura.notes.update("note_9d3x", { archived: true });
```

## Move a note

Change `notebookId` to move a note. Its comments and history move with it; people who could only open the old notebook
lose access to it.

```ts
await sakura.notes.update("note_5c1m", { notebookId: "nb_3q9w" });
```
