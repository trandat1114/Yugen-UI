---
title: Introduction
description: What Sakura Notes is, how its data is organized, and the three ways to work with it from code.
order: 1
---

Sakura Notes is a notes app for teams. Notes are written in Markdown, live in shared notebooks and reach every member's
devices within a second or two. Everything you can do in the app, your own code can do too.

## How data is organized

- A **workspace** is your team. Billing, members and API keys belong to it.
- A **notebook** groups notes inside a workspace, for example *Product* or *Meeting notes*. Access is set per notebook.
- A **note** is a Markdown document with a title, tags and a history of revisions.

Every object has an id with a prefix, so you can tell them apart in logs: `ws_` for workspaces, `nb_` for notebooks and
`note_` for notes.

## Three ways to use it from code

| Tool | Use it for |
| --- | --- |
| [SDK](/getting-started/installation/) | TypeScript and JavaScript apps, on a server or in scripts |
| [REST API](/api-reference/notes/) | Any language; the SDK is a thin layer over it |
| [CLI](/guides/cli/) | Your terminal and CI: export, import and quick edits |

All three use the same [API keys](/api-reference/authentication/) and the same rate limits.

## Where to go next

New here? The [quick start](/getting-started/quick-start/) creates a note from code in about five minutes. If you already
have a key, go straight to the [notes endpoints](/api-reference/notes/).
