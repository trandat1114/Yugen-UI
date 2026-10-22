# @yugen-ui/cli

## 0.2.0

- `create --lang en|vi`: language of the app's text for templates that have both (the starter today). English by
  default; interactive runs ask after the template.
- Templates: short names (Starter, SaaS, Blog, Dashboard, AI chat). The starter is a minimal English page with the Sakura
  and Web brands; its text lives in `src/content/`.
- Requires Node.js 22 or later (`engines`); Node.js 20 reached end of life. `create-yugen-ui` 0.2.0 follows.

## 0.1.0

- First release: `yugen create`, `init` (package / source mode), `add`, `list` and `doctor`.
- Templates `starter`, `saas`, `blog`, `dashboard`, `ai-chat` bundled in the package.
- `create-yugen-ui` 0.1.0: `npm create yugen-ui@latest` runs `yugen create`.
- Published as `@yugen-ui/cli` (run with `npx @yugen-ui/cli@latest`, the installed command is `yugen`): npm rejects the
  unscoped name `yugen` as too similar to `hygen`.
