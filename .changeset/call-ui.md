---
"yugen-ui": minor
---

New Calling UI primitives (Yugen Labs, #441), shared by voice assistants, one-to-one calls and meeting rooms; they take state and callbacks and never manage the connection or the microphone. `CallSurface` lays out the other party (`name`, `avatar`, `description`), the state, middle content (a Transcript, a VoiceWave) and `controls`, stacked or `layout="inline"`. `CallStatus` says the state in words (`connecting`, `ringing`, `connected`, `muted`, `on-hold`, `ended`, `failed`) in a status region, with the duration outside it so it isn't read every second. `CallControls` is a toolbar with one Tab stop and arrow keys, and `CallControlButton` has built-in `mute`, `speaker`, `camera` and `hold` toggles (`aria-pressed`, a constant name, an icon that follows the state), `add` and `end` (`confirm` asks for a second press). Also `formatCallDuration()` and the new `messages.call` (English default, `callMessagesVi`).
