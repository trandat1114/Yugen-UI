---
"yugen-ui": minor
---

`TableHeaderCell` and `TableCell` take `align` (`"start" | "center" | "end"`) for number, amount and date columns (#412). On a sortable header the sort button is aligned too, which a class on the cell could not do. The prop replaces the obsolete HTML `align` attribute in the types (`align="right"` becomes `align="end"`).
