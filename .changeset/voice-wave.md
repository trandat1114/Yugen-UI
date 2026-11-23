---
"yugen-ui": minor
---

New `VoiceWave` (Yugen Labs, #440): the audio level of a voice assistant or a call as a row of bars, with `state` `"idle" | "listening" | "speaking" | "muted" | "error"`, `bars`, `size`, `tone` and `align`. Pass `levels` (0–1, resampled to the bar count) or `source`, a function read once per animation frame that updates the bars without a re-render, for example from your own Web Audio `AnalyserNode`; the component never opens the microphone or creates an `AudioContext`. The bar count is fixed, so nothing shifts as levels change; with reduced motion the frame loop doesn't run. It is `role="img"` named after its state (new `messages.voiceWave`, English default, `voiceWaveMessagesVi`). 10.9 kB gzip with the shared `cn`.
