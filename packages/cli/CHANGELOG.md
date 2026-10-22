# @yugen-ui/cli

## Unreleased

- Requires Node.js 22 or later (`engines`); Node.js 20 reached end of life. Release as a minor (0.2.0), and bump
  `create-yugen-ui` with it.

## 0.1.0

- First release: `yugen create`, `init` (package / source mode), `add`, `list` and `doctor`.
- Templates `starter`, `saas`, `blog`, `dashboard`, `ai-chat` bundled in the package.
- `create-yugen-ui` 0.1.0: `npm create yugen-ui@latest` runs `yugen create`.
- Published as `@yugen-ui/cli` (run with `npx @yugen-ui/cli@latest`, the installed command is `yugen`): npm rejects the
  unscoped name `yugen` as too similar to `hygen`.
