## Summary

<!-- What does this PR change, and why? Link related issues: "Closes #123". -->

## Type

- [ ] `feat` — new component / prop / token
- [ ] `fix` — bug fix
- [ ] `docs` — documentation / registry / block
- [ ] `refactor` / `perf` / `style`
- [ ] `build` / `ci` / `chore`
- [ ] Breaking change (describe the migration below)

## Screenshots

<!-- Before / after for visual changes: light, dark, high contrast; RTL if relevant. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint:classes` passes
- [ ] `npm run build:lib` and `npm run build:docs` pass
- [ ] Follows [Design.md](../Design.md): token utilities only (no raw HEX/px/ms), upper-case spacing, type-ramp font sizes, `cn()`, no `dark:`, logical properties
- [ ] Colour roles respected (neutral / brand / semantic); no brand on large areas; no gradients on controls
- [ ] Hover / pressed / disabled / focus-visible states; keyboard and screen reader tested
- [ ] Checked Sakura / Web / Teams × Light / Dark, High contrast and RTL
- [ ] New or changed components exported from `src/components/ui/index.ts` and documented in `src/docs/registry/` (example `code` matches `render`)
- [ ] `CHANGELOG.md` updated under `Unreleased`
