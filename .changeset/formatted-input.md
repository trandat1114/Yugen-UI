---
"yugen-ui": minor
---

New `FormattedInput` with `format="phone" | "card" | "currency"`: formats as you type and keeps the caret in place, including edits in the middle and Backspace over a separator. `value` / `onValueChange` use the raw value (digits, or a decimal like `"1234.5"`); with `name`, forms submit the raw value. Phone masks follow the `locale` region (or `mask`), card numbers group by card type, and currency uses Intl with the provider `locale` and `currency`. Also exported: `applyMask`, `getPhoneMask`, `getCardMask` (#173).
