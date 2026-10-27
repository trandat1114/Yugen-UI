---
title: Webhooks
description: Get an HTTP request when notes change, check that it comes from Sakura Notes, and handle retries.
order: 4
---

Webhooks send a `POST` request to your server when something happens in a workspace, so you don't have to poll the API.

## Create an endpoint

```ts
const webhook = await sakura.webhooks.create({
  url: "https://example.com/hooks/sakura",
  events: ["note.created", "note.updated"],
});

console.log(webhook.secret); // whsec_…, shown once
```

## Events

| Event | Sent when |
| --- | --- |
| `note.created` | A note is created, in the app or through the API |
| `note.updated` | The title, body, tags or notebook of a note change |
| `note.deleted` | A note is deleted (not archived) |
| `notebook.shared` | Someone gets access to a notebook |

The request body is JSON:

```json
{
  "id": "evt_7h2p",
  "type": "note.updated",
  "createdAt": "2026-10-27T09:41:00Z",
  "data": { "noteId": "note_5c1m", "notebookId": "nb_8f2k" }
}
```

## Verify the signature

Each request carries a `Sakura-Signature` header. Check it before you trust the body: anyone can send a request to a
public URL.

```ts title=server.ts
import { verifyWebhook } from "@sakura-notes/sdk";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("Sakura-Signature");
  const event = await verifyWebhook(body, signature, process.env.SAKURA_WEBHOOK_SECRET!);
  if (!event) return new Response("Invalid signature", { status: 400 });

  if (event.type === "note.updated") {
    // The event only carries ids: read the note again for its content.
  }
  return new Response(null, { status: 204 });
}
```

## Retries

Answer with a `2xx` status within 10 seconds. Otherwise the request is sent again after 1 minute, 10 minutes, 1 hour and
6 hours, then the event is dropped. The same event can arrive twice: use its `id` to skip duplicates.
