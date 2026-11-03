# FAQ

*Tiếng Việt: [FAQ-vi](FAQ-vi).*

**Is Yugen UI related to Microsoft?**
No. Yugen UI is inspired by the tokens and behavior of Fluent 2. It is an independent project by
[trandat1114](https://github.com/trandat1114), MIT licensed.

**After importing `theme.css`, `bg-blue-500` / `text-sm` stopped working?**
By design: Tailwind's default scales are turned off so that tokens are used. Use `bg-brand-background`, `text-body1`…
(lookup table in Design.md §3).

**Is Tailwind v3 supported?**
Not officially. Use `yugen-ui/styles.css` (precompiled) if your project doesn't use Tailwind v4.

**Can I mix it with shadcn/ui?**
You can install both in one project, but the Yugen theme replaces the default scales, so shadcn components that use `bg-primary`,
`rounded-lg`… will break. Pick one system per app.

**Does it work with the Next.js App Router?**
Yes. Every component file has `"use client"`; `cn()` and `generateBrandRamp()` can be called in a Server Component. See [[Getting Started]].

**The theme flashes when the page loads?**
Set `data-theme` / `data-brand` / `dir` on `<html>` with an inline script before React runs (example on the Quick start page).

**Components announce Vietnamese to screen readers. How do I change the language?**
Default labels (e.g. "Đóng", "Thêm N mục") are all props (`*Label`, `aria-label`): pass your own strings.

**A docs example doesn't run when copied out?**
That shouldn't happen: CI runs `check:examples` on every example. If it does, open a **Documentation** issue with the page link.

**How can I contribute if I don't know React well yet?**
Translate docs, fix examples, add English translations of component names. Filter issues by `good first issue` or `documentation`.
