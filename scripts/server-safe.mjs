/**
 * Files of dist/ built without the `"use client"` banner (vite.lib.config.ts), so a React Server Component (Next.js
 * App Router) can call what they export while rendering. Every other file is a client boundary.
 *
 * The list is reviewed by hand, not derived from a pattern: a file belongs here only when it has no React (no hooks,
 * no context) and imports nothing but other files of this list and packages that do not use React. The messages
 * modules stay client references: their strings include functions, and a Server Component can hand those to
 * YugenProvider only as a client reference (a plain function prop cannot cross to the client).
 * scripts/check-package.mjs checks these rules on the built files (#345).
 *
 * `lib.js` is the package root: a barrel with no code of its own, so each name it re-exports stays what its module
 * is (a client reference for components, a plain function for the files below).
 */
export const SERVER_SAFE = [
  "lib.js",
  "lib/cn.js",
  "lib/brandRamp.js",
  "lib/tokenExport.js",
  "lib/deprecate.js",
  "components/ui/AppShell/cookie.js",
];

/** Files of SERVER_SAFE that only re-export (no code of their own). */
export const SERVER_SAFE_BARRELS = ["lib.js"];
