---
title: Authentication
description: Send an API key as a bearer token, choose its scopes, and rotate keys without downtime.
order: 1
---

Every request needs an API key. Keys belong to a workspace and are created in **Settings › API keys**.

## Send the key

Put the key in the `Authorization` header as a bearer token. A request without it, or with a revoked key, gets `401`.

```bash
curl https://api.sakuranotes.example/v1/notebooks \
  -H "Authorization: Bearer $SAKURA_API_KEY"
```

The SDK and the CLI read `SAKURA_API_KEY` and send the header for you.

## Key types

| Prefix | Type | Where to use it |
| --- | --- | --- |
| `sk_live_` | Secret key | Servers, scripts and CI, never in a browser |
| `sk_test_` | Test key | A sandbox workspace with sample data; nothing is billed |

## Scopes

A key only does what its scopes allow. Give it the fewest that do the job.

| Scope | Allows |
| --- | --- |
| `notes:read` | Listing and reading notes and notebooks |
| `notes:write` | Creating, updating, moving and deleting notes |
| `sharing:write` | Sharing notebooks and managing public links |
| `webhooks:write` | Creating and deleting webhook endpoints |

A request outside the key's scopes gets `403` with the code `missing_scope`.

## Rotate a key

1. Create a new key with the same scopes.
2. Deploy it next to the old one and switch your app over.
3. Revoke the old key. Revoking takes effect at once.

> [!TIP]
> **Settings › API keys** shows when each key was last used, so you can see when the old one has gone quiet.
