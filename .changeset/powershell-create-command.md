---
"yugen-ui": patch
---

Docs site: the create-project commands now work in Windows PowerShell. They use `npx create-yugen-ui@latest my-app --template <name>`, because PowerShell drops the `--` in `npm create yugen-ui@latest my-app -- --template <name>` and npm then reads `--template` as its own option. `cd my-app` and `npm run dev` go on separate lines instead of being chained with `&&`, which Windows PowerShell 5.1 rejects. The npm package is unchanged.
