---
"yugen-ui": minor
---

New `StatusPage` and `ErrorBoundary` (#238). `StatusPage` is a page for HTTP errors and app states: `status` (400, 401, 403, 404, 408, 410, 429, 500, 502, 503, 504, `"offline"`, `"update"`) picks the built-in title, description and code from `messages.statusPage`; `primaryAction` / `secondaryAction` take your router's buttons or links, `errorId` shows a copyable error ID, `autoFocus` moves focus to the heading. `ErrorBoundary` catches render errors and shows a 500 page with Try again, or "A new version is available" with Reload when a lazily loaded file fails after a deploy; `fallback`, `onError` and `resetKeys` customise it. Also exported: `isChunkLoadError`, `statusPageCopy`.
