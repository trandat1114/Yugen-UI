---
"yugen-ui": patch
---

AvatarGroup: the overflow button's accessible name now starts with the count it shows ("+2 Xem thêm 2 thành viên"), as WCAG 2.5.3 Label in Name requires. `overflowLabel` is read after the count instead of replacing it. With `overflowIndicator="icon"`, `overflowLabel` is still the button's whole name.
