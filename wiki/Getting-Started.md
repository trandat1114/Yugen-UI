# Getting Started

*Tiếng Việt: [Getting-Started-vi](Getting-Started-vi).*

Requirements: React 19, TypeScript 5 (recommended). Tailwind CSS v4 is optional.

## 1. Choose how to use it

| Option | When | Command |
|---|---|---|
| **CLI `@yugen-ui/cli`** — simplest | Existing project: install the package and add the theme to your CSS in one command | `npx @yugen-ui/cli@latest init` |
| **Starter template** | Start a complete app quickly (starter, SaaS, blog…) | `npm create yugen-ui@latest my-app` |
| **Copy the source** | You want to own and deeply modify the source | `npx @yugen-ui/cli@latest init --mode source` then `npx @yugen-ui/cli add button` |
| **npm + Tailwind v4** (by hand) | Same as the first row, without the CLI | `npm install yugen-ui` + `@import "yugen-ui/theme.css"` |
| **npm, no Tailwind** | The project uses other CSS | `import "yugen-ui/styles.css"` (or let `npx @yugen-ui/cli init` add it) |
| **shadcn CLI** | The project already uses shadcn/ui | `npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json` then `add …/r/button.json` |

Details: [@yugen-ui/cli](https://trandat1114.github.io/Yugen-UI/#/concepts/cli), [README](https://github.com/trandat1114/Yugen-UI#readme),
[Install with the shadcn CLI](https://trandat1114.github.io/Yugen-UI/#/concepts/shadcn-registry).

## 2. Minimal setup (npm + Tailwind v4)

`npx @yugen-ui/cli@latest init` (choose `package`) does the CSS step below for you and prints the `YugenProvider` wrapper; check
the result with `npx @yugen-ui/cli doctor`. By hand:

```css
/* src/index.css */
@import "tailwindcss";
@import "yugen-ui/theme.css";
```

```tsx
import { YugenProvider, Button } from "yugen-ui";

export function App() {
  return (
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <Button appearance="primary">Xin chào</Button>
    </YugenProvider>
  );
}
```

> ⚠ `theme.css` **turns off** Tailwind's default scales (colors, radius, shadows, font sizes): `bg-blue-500`, `rounded-lg`,
> `text-sm` no longer exist. Use Yugen utilities: `bg-background-1`, `text-foreground-2`, `p-3`, `rounded-medium`, `text-body1`.

## 3. Next.js App Router

Every component file in the package already has `"use client"`, so you can import components directly in a Server Component.
Put `YugenProvider` in `app/layout.tsx`, and add `suppressHydrationWarning` to `<html>` if you change the theme with a script
before hydration. See also: [SSR & Next.js](https://trandat1114.github.io/Yugen-UI/#/concepts/ssr).

## 4. Next steps

- Change the brand color: [[Theming and Tokens]].
- Browse every component and copy examples: [docs](https://trandat1114.github.io/Yugen-UI/). Each example has Copy and StackBlitz buttons.
- Stuck? Ask in [Discussions Q&A](https://github.com/trandat1114/Yugen-UI/discussions/categories/q-a).
