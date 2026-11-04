---
"yugen-ui": minor
---

New subpath imports (#344): every component folder is also a path of the package, as in `import { Button } from "yugen-ui/Button"`, `yugen-ui/Chart` or `yugen-ui/DatePicker`, plus `yugen-ui/hooks`, `yugen-ui/AppShell/Sidebar`, `yugen-ui/messages-en` and `yugen-ui/messages-vi`. A subpath loads only that component and what it uses, which matters where nothing tree-shakes the package: tests, server rendering in Node and dev servers. A cold `import { Button }` in Node loads 14 modules in about 60 ms from `yugen-ui/Button`, against 498 modules in about 1.6 s from `yugen-ui`. Production bundles keep the same size, and the root and the subpaths load the same files, so both can be used in one app. `yugen-ui/_internal/*` stays private. The Quick start page lists the paths and shows Next.js `optimizePackageImports` for apps that keep importing from the root.
