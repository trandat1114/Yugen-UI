---
"yugen-ui": patch
---

`messagesEn` now carries only English strings. Each component's English set moved to its own `messages.en.ts`, so importing `messagesEn` no longer pulls in other components' Vietnamese defaults or the react-day-picker Vietnamese locale. Export names are unchanged; source copied with the CLI or shadcn gets `messages.en.ts` next to `messages.ts`.
