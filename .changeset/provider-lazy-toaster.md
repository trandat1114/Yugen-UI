---
"yugen-ui": patch
---

`YugenProvider` no longer bundles the Toaster: with `withToaster` it loads it after the first client render, and `toast()` calls made before that still show once it mounts. Apps that don't turn on `withToaster` no longer ship `@radix-ui/react-toast`: the initial chunk for `{ YugenProvider }` goes from 24.9 to 13.2 kB gzip (Rolldown, as in Vite 8), and a six-component app from 38.0 to 31.1 kB. The toast store (`toast()`, `dismissToast()`, `useToast()`) lives in its own module, so code that only calls `toast()`, such as `useOptimisticList`, no longer pulls in the Toaster UI. Server rendering and hydration render no Toaster, so both sides produce the same HTML. Rendering `<Toaster />` as a child of the root provider is the recommended setup (#346).
