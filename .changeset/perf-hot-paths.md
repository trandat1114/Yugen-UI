---
"yugen-ui": patch
---

Performance: less work in the components' busiest paths, no API changes.

- Charts: date formatters and label widths are reused instead of rebuilt for every data point on every hover step; the data table is only built while it is shown (`ChartContainer`'s `table` also accepts a function).
- DataGrid: resizing a column no longer re-renders every row (pinned-column offsets come from `--dg-sticky-<col>` CSS variables on the grid), and an inline `getRowId` is no longer called for every row on every render.
- Tree, List: moving focus with the arrow keys re-renders the two items involved instead of all items.
- Combobox, TagPicker, Autocomplete: option labels are normalized once per option list, not on every keystroke.
- MessageScroller, MessageBubble, StreamingMarkdown: streamed tokens skip the new-message scan, unchanged bubbles don't re-render, and an open code fence is highlighted at low priority.
- NotificationPanel formats only the open tab; Carousel autoplay stops its per-frame loop when there is no progress bar and pauses offscreen; `useMediaQuery` reuses one MediaQueryList per query.
