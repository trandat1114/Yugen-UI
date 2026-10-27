---
title: Notes
description: The note object and the endpoints to list, create, update and delete notes.
order: 2
---

Base URL: `https://api.sakuranotes.example/v1`. Requests and responses are JSON.

## The note object

```json
{
  "id": "note_5c1m",
  "notebookId": "nb_8f2k",
  "title": "Sprint review",
  "body": "## Decisions\n\n- Ship search on Friday",
  "tags": ["sprint", "review"],
  "pinned": false,
  "archived": false,
  "createdAt": "2026-10-27T09:41:00Z",
  "updatedAt": "2026-10-27T10:02:00Z"
}
```

## List notes

`GET /notes` returns notes, most recently updated first, 20 at a time.

| Parameter | Type | Description |
| --- | --- | --- |
| `notebookId` | string | Only notes of this notebook |
| `tag` | string | Only notes with this tag |
| `limit` | number | 1 to 100, default 20 |
| `cursor` | string | `nextCursor` of the previous page |

```bash tab=curl
curl "https://api.sakuranotes.example/v1/notes?notebookId=nb_8f2k&limit=20" \
  -H "Authorization: Bearer $SAKURA_API_KEY"
```

```ts tab=TypeScript
const page = await sakura.notes.list({ notebookId: "nb_8f2k", limit: 20 });
// page.data: Note[], page.nextCursor: string | null
```

## Create a note

`POST /notes` with `notebookId` and `title`; `body` (Markdown) and `tags` are optional. Returns the new note with `201`.

```bash tab=curl
curl https://api.sakuranotes.example/v1/notes \
  -H "Authorization: Bearer $SAKURA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"nb_8f2k","title":"Retro","tags":["sprint"]}'
```

```ts tab=TypeScript
const note = await sakura.notes.create({ notebookId: "nb_8f2k", title: "Retro", tags: ["sprint"] });
```

## Update a note

`PATCH /notes/{id}` with the fields to change. Fields you leave out keep their value.

```ts
await sakura.notes.update("note_5c1m", { title: "Sprint 42 review", pinned: true });
```

## Delete a note

`DELETE /notes/{id}` returns `204`. Deleted notes stay in the workspace trash for 30 days and can be restored from the
app.

```ts
await sakura.notes.delete("note_5c1m");
```
