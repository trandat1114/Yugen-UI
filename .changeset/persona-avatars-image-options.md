---
"yugen-ui": minor
---

Persona takes several people: `avatars={[{ name, src }, …]}` renders an AvatarGroup at the Persona's size (`avatarLayout` `"stack"` or `"pie"`, `maxAvatars` with a "+N" button), named by `primaryText`. Avatar, AvatarGroupItem and Persona's `avatar` get image options: `image` (`srcSet`, `sizes`, `loading`, `decoding`, `crossOrigin`, `referrerPolicy`, `fetchPriority`), `renderImage` for a framework image component such as Next.js `<Image>`, `onLoadingStatusChange`, and `fallbackDelay` (400 ms as before). Avatar no longer uses `@radix-ui/react-avatar`: the `<img>` is in the server HTML, so the photo starts loading before hydration. Existing `src` usage is unchanged.
