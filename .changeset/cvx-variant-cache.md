---
"yugen-ui": patch
---

Components with class variants (Button, Input, Badge, Card, Tag, Avatar, Label, Link, Select, Textarea, MessageBar, ButtonGroup, Image, SwatchPicker and the ToggleButton checked layer) merge their classes once per combination of variant props instead of on every render (#355). Server-rendering 1,000 Buttons takes 8.1 → 3.8 ms (5.7 ms with a `className`), re-rendering them in the browser 10.1 → 5.0 ms (7.7 ms with a `className`), and a page with every component 21.8 → 20.2 ms. The exported `buttonVariants`, `buttonGroupVariants`, `linkVariants` and `imageVariants` take the same arguments and return the merged string, the classes the component renders and `cn(buttonVariants(…))` returned before. `cn` keeps 2,000 merged strings instead of 500, so a large page no longer evicts its own entries. Copied source (`yugen add`, the shadcn registry) gains `lib/cvx.ts` next to `lib/cn.ts`.
