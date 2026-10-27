---
title: Using the CLI
description: Sign in, list and create notes from the terminal, export notebooks to Markdown files and run the CLI in CI.
order: 3
---

The `sakura` command covers the everyday API tasks from a terminal. Install it next to the SDK
([Install the CLI](/getting-started/installation/#install-the-cli)) or run it with `npx`.

## Sign in

```npm
npx @sakura-notes/cli login
```

`login` opens the browser, asks which workspace to use and keeps a key in your system keychain. On a server, set
`SAKURA_API_KEY` instead.

## Commands

| Command | What it does |
| --- | --- |
| `sakura whoami` | Workspace and scopes of the current key |
| `sakura notebooks list` | Notebooks you can open |
| `sakura notes list --notebook <id>` | Latest notes of a notebook |
| `sakura notes new <title>` | Creates a note; the body comes from stdin |
| `sakura export <notebook>` | Writes every note to a Markdown file |
| `sakura import <folder>` | Creates or updates notes from Markdown files |

Every command takes `--json` for output that scripts can read.

## Export and import

```bash
npx sakura export nb_8f2k --out ./notes
```

Each note becomes `./notes/<title>.md`, with its id and tags in the front matter. Edit the files, then send the changes
back. Notes are matched by id, so a renamed file still updates the right note:

```bash
npx sakura import ./notes --notebook nb_8f2k
```

## In CI

Keep a notebook in step with a folder of your repository, for example release notes:

```yaml title=.github/workflows/notes.yml
- run: npx @sakura-notes/cli import ./docs/releases --notebook nb_4r8t
  env:
    SAKURA_API_KEY: ${{ secrets.SAKURA_API_KEY }}
```
