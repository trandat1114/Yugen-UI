---
"yugen-ui": minor
---

New `ColorPicker`: a saturation / brightness area, hue and optional opacity (`alpha`) sliders, HEX / RGB / HSL inputs, a screen color picker where the browser supports the EyeDropper API, and preset colors through SwatchPicker (`swatches`). The value is hex; `onValueChange` also gets rgb / hsl / hsv. `parseColor` is exported, and built-in strings live in `messages.colorPicker` (#173).
