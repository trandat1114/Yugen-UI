---
"yugen-ui": minor
---

New `VoiceAssistant` (Yugen Labs, #443): a whole voice conversation on one screen, built from CallSurface, CallStatus, CallControls, VoiceWave and Transcript. It is fully controlled (`state` `idle | connecting | listening | thinking | speaking | ended | error`, `turns`, `levels` or `source`, `muted`, `duration`, `onStart`, `onEnd`, `onRetry`, `onMutedChange`) and never opens the microphone or calls a speech service. The state is always said in words in a status region, each finished turn is read once, idle and ended show a Start button and error shows its reason with Try again; `layout="inline"` fits a side panel. `CallSurface` gets `statusLabel` to replace its state text. New `messages.voiceAssistant` (English default, `voiceAssistantMessagesVi`).
