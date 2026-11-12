---
"yugen-ui": minor
---

Resizable's props are Yugen types instead of react-resizable-panels' `GroupProps`, `PanelProps` and `SeparatorProps` (#371): `ResizablePanelGroupProps`, `ResizablePanelProps` and `ResizableHandleProps` list their props, and the refs and callbacks use `ResizableLayout`, `ResizableLayoutChange`, `ResizablePanelSize`, `ResizableGroupHandle` and `ResizablePanelHandle`. Same props and shapes as before, so no code changes; the published types no longer import react-resizable-panels.
