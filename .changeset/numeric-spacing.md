---
"yugen-ui": minor
---

Spacing uses Tailwind's numeric scale. Components, docs examples, templates and the shadcn registry now use `p-3`, `gap-2`, `mt-6` instead of the upper-case Fluent aliases (`p-M`, `gap-S`, `mt-XXL`). The Fluent spacing ramp is the same as Tailwind's 4px scale, so nothing moves at the default 16px root font size. The numeric scale is in `rem`, so spacing now follows the user's browser font size, as the numeric sizes (`h-8`, `size-5`) already did.

Deprecated: the upper-case spacing aliases (`--spacing-XXS` … `--spacing-XXXL` in `theme.css` and the matching group in `cn()`). They still work and will be removed in 1.0. Rename them as XXS → 0.5, XS → 1, SNudge → 1.5, S → 2, MNudge → 2.5, M → 3, L → 4, XL → 5, XXL → 6, XXXL → 8.
