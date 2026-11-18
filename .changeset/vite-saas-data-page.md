---
"yugen-ui": minor
---

`vite-saas` template: pages can opt in to a data layout (#411). `layout: { width: "fluid", density: "compact" }` on an entry in `PAGES` drops the 72rem column so a table uses the whole content area at 1440px and 2560px, and wraps the page in `YugenProvider density="compact"`; page padding and section gaps per density live in `src/layout.ts`. The new Customers page uses it: a full-height `DataGrid` with a pinned name column, wrapped names and addresses, accent-insensitive search and a compact `DataGridColumnPicker`. The other pages keep the SaaS default. New docs page: Dense data tables (`/concepts/data-tables`).
