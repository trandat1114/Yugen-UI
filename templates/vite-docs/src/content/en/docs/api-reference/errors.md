---
title: Errors and rate limits
description: The error format, the codes you can get, rate limit headers and how to retry safely.
order: 3
---

## Error format

A failed request returns a `4xx` or `5xx` status and a JSON body:

```json
{
  "error": {
    "code": "missing_scope",
    "message": "This key cannot write notes. Add the notes:write scope.",
    "requestId": "req_3k9v"
  }
}
```

Include `requestId` when you contact support.

## Error codes

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_request` | A field is missing or has the wrong type; `message` names it |
| 401 | `invalid_key` | The key is missing, mistyped or revoked |
| 403 | `missing_scope` | The key lacks a scope (see [Scopes](/api-reference/authentication/#scopes)) |
| 404 | `not_found` | The object does not exist, or the key cannot see it |
| 409 | `conflict` | The note changed since you read it |
| 429 | `rate_limited` | Too many requests; wait and try again |
| 500 | `server_error` | Something failed on our side; try again later |

In the SDK every failure is a `SakuraError` with the same `status`, `code` and `requestId`.

## Rate limits

Each key can make 100 requests per 10 seconds. Every response tells you where you are:

| Header | Description |
| --- | --- |
| `RateLimit-Limit` | Requests allowed in the window |
| `RateLimit-Remaining` | Requests left in the window |
| `RateLimit-Reset` | Seconds until the window starts again |

## Retry safely

Retry `429` and `5xx` responses with a growing delay. The SDK already does this up to three times; with your own HTTP
client:

```ts
async function withRetry<T>(request: () => Promise<Response>, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    const response = await request();
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || i + 1 >= attempts) throw new Error(`HTTP ${response.status}`);
    const seconds = Number(response.headers.get("RateLimit-Reset") ?? 2 ** i);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
```

> [!NOTE]
> A `POST` request can be retried without creating a duplicate when it has an `Idempotency-Key` header with a value of
> your choice.
