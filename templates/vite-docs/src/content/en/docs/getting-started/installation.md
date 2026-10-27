---
title: Installation
description: Install the TypeScript SDK and the command line tool, and set the environment variables they read.
order: 2
---

## Requirements

- Node.js 20 or later, or Bun 1.1 or later.
- A Sakura Notes workspace on any plan. API access is included in the free plan.

## Install the SDK

```npm
npm install @sakura-notes/sdk
```

The package ships ES modules and TypeScript types. It has no dependencies and runs in Node.js, Bun, Deno and edge runtimes
such as Cloudflare Workers.

## Install the CLI

Add the CLI to a project as a development dependency, so everyone on the team runs the same version:

```npm
npm install -D @sakura-notes/cli
```

Or run it once without installing anything:

```npm
npx @sakura-notes/cli login
```

## Environment variables

Both tools read the same variables, so a script and the CLI share one setup.

| Variable | Required | Description |
| --- | --- | --- |
| `SAKURA_API_KEY` | Yes | A secret key from **Settings › API keys** |
| `SAKURA_WORKSPACE` | No | Default workspace id, for keys that reach more than one |
| `SAKURA_API_URL` | No | Another API address, for example a proxy |

```bash title=.env
SAKURA_API_KEY=sk_live_4f8a…
SAKURA_WORKSPACE=ws_2h7d
```

> [!WARNING]
> Never commit a secret key. Add `.env` to `.gitignore` and keep keys in your host's secret settings.

## Check the setup

```bash
npx sakura whoami
```

It prints the workspace and the scopes of the key. An error here means the key is missing or revoked: see
[Errors and rate limits](/api-reference/errors/).
