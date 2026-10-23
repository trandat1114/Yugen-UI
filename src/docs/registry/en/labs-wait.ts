import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-wait.tsx.
export const en: Record<string, ComponentDocEn> = {
  loading: {
    description:
      "useSpinDelay(loading, { delay, minDuration }) only turns the loader on when the wait lasts longer than delay (300ms by default), and once it is shown keeps it for at least minDuration (500ms). LoadingOverlay is built on this hook: it covers a region with a dimmed surface, a Spinner and a label while the old content keeps its place underneath. The region gets aria-busy and the label is announced through a live region.",
    examples: [
      {
        title: "With and without useSpinDelay",
        description:
          "Choose “Nhanh” (fast) and click “Tải” (load) a few times: the left panel flashes a spinner for 150ms, the right one doesn't change. Choose “Chậm” (slow): the right panel waits 300ms, then stays steady.",
      },
      {
        title: "Keep old content under the overlay",
        description:
          "When refreshing data that is already on screen, dim it with an overlay instead of replacing it with a skeleton, so people can still read the old numbers.",
      },
      {
        title: "Small indicators need a delay too",
        description: "The “Đang lưu…” (Saving…) line of an autosave uses the same useSpinDelay; a fast save only ever shows “Đã lưu” (Saved).",
      },
    ],
    dos: [
      "Wrap every loader (spinner, overlay, “Saving…”) in useSpinDelay so responses under 300ms don't cause a flash.",
      "Cover only the region that is loading, and keep the old content when refreshing data that is already shown.",
      "Set aria-busy on the loading region and say in words what is happening (“Refreshing…”).",
    ],
    donts: [
      "Don't cover the whole page for a local action.",
      "Don't hide a loader a few dozen milliseconds after it appears. Keep minDuration.",
      "Don't move focus into the overlay. Focus stays where people are working.",
    ],
    props: {
      "useSpinDelay(loading, options)": "Returns true when the loader should be shown.",
      "options.delay": "Wait (ms) before showing; if the work finishes sooner, nothing is shown.",
      "options.minDuration": "Minimum time (ms) the loader stays once shown.",
      "LoadingOverlay.loading": "The region is loading; aria-busy updates right away, the overlay follows delay.",
      label: "Label under the Spinner; a string label is announced through a live region when the overlay appears.",
      "delay / minDuration": "Passed to useSpinDelay.",
      spinnerSize: "Spinner size.",
      overlayClassName: "Class for the overlay (opacity, padding…).",
    },
    defaults: { label: "“Đang tải…” (Loading…)", "delay / minDuration": "0 / 500 when delay is set" },
  },

  pageprogress: {
    description:
      "Two modes: determinate (value 0–1) when the real progress is known, and trickle (active), which creeps toward ~94%, then runs to 100% and fades out when done. The imperative controller pageProgress.start() / .done() / .set(n) can be called from anywhere (a router, a fetch wrapper) without context. start/done calls are counted, so overlapping tasks still finish at the right moment. With prefers-reduced-motion, the width doesn't animate and the bar doesn't fade.",
    examples: [
      {
        title: "Determinate (value)",
        description: "When the real progress is known (a file upload), pass value; add active so the bar only shows during the upload.",
      },
      {
        title: "Imperative controller",
        description:
          "In an app, mount one <PageProgress /> at the root and call pageProgress.start() / .done(). The example uses its own createPageProgress() so it doesn't touch the docs site's bar.",
      },
      {
        title: "Suspense & lazy routes",
        description: "PageProgressFallback as the Suspense fallback: the bar runs while the chunk loads, with no spinner in the middle of the page.",
      },
    ],
    dos: [
      "Mount one PageProgress at the app root and drive it with pageProgress or PageProgressFallback.",
      "Use value when there is real progress; use trickle when all you know is that work is running.",
      "Keep the old page content visible while the new page loads.",
    ],
    donts: [
      "Don't use PageProgress for a local action inside one region. Use LoadingOverlay or Button loading.",
      "Don't forget to call done() in finally, or the bar stays at ~94% forever.",
      "Don't make the bar thick or give it a status color. It is a background signal, not a notification.",
    ],
    props: {
      value: "0–1, determinate mode; ≥ 1 → completes, then fades out.",
      active: "true → shows the bar (trickle if there is no value); false → runs to 100%, then fades out.",
      controller: "Controller used when value / active aren't passed.",
      position: "fixed: top edge of the viewport (portal, z-50) · absolute: top edge of the relative parent.",
      thickness: "2px / 4px.",
      label: "aria-label of the progressbar.",
      "pageProgress.start() / .done() / .set(n) / .reset()":
        "Imperative control; start/done calls are counted. createPageProgress() creates a separate controller.",
      "PageProgressFallback / usePageProgress(active?)": "Runs the bar while mounted (as a Suspense fallback) or while active.",
    },
    defaults: { label: "“Đang tải trang” (Loading page)" },
  },

  asynccontent: {
    description:
      "AsyncContent takes a status and renders exactly one state. Loading uses useSpinDelay: if the response arrives within 300ms, the previous state stays and no skeleton flashes. The error state defaults to ErrorState (role=\"alert\") with a Retry button that switches to loading by itself; the empty state defaults to Empty. If the focused button gets replaced, focus stays inside the region instead of falling back to the top of the page.",
    examples: [
      {
        title: "ErrorState with retry",
        description: "If onRetry returns a Promise, the Retry button shows a spinner until it settles; focus stays on the button.",
      },
      { title: "Compact ErrorState", description: "size=\"small\" for cards, panels and list rows." },
      { title: "Custom empty state", description: "Empty isn't an error: say why there is nothing here and suggest a next step." },
    ],
    dos: [
      "Keep empty and error clearly apart. Empty is a valid result; an error needs a way out.",
      "An error says what happened and offers a retry right there.",
      "Pass a skeleton that matches the layout of the real content.",
    ],
    donts: [
      "Don't leave a blank area on an error or when there is no data.",
      "Don't use technical messages (error codes, stack traces) as the title.",
      "Don't use role=\"alert\" for first-load errors in many regions at once. They would all be announced in a burst.",
    ],
    props: {
      status: "State to render.",
      children: "Content on success; the function form is only called on success.",
      skeleton: "Shown while loading (after delay).",
      error: "Replaces the error UI.",
      "empty / idle": "Empty UI (Empty by default) / not-yet-loaded UI (nothing by default).",
      onRetry: "Passed to the Retry button of the default ErrorState.",
      "delay / minDuration": "How long to wait before showing the loader, and the minimum time it stays once shown (ms). See useSpinDelay.",
      loadingLabel: "Text announced to screen readers when the skeleton appears.",
      "ErrorState.title / description / icon": "Error content; the default text is in Vietnamese.",
      "ErrorState.onRetry / retrying / retryLabel": "Retry button; a Promise or retrying puts the button in its loading state.",
      "ErrorState.secondaryAction": "Secondary action (Report a problem, Go back…).",
      "ErrorState.variant / size": "alert adds role=\"alert\"; small is a compact single line.",
    },
    defaults: { skeleton: "SkeletonText, 3 lines", loadingLabel: "“Đang tải…” (Loading…)" },
  },

  skeletonpresets: {
    description:
      "The presets are built on SkeletonItem and inherit animation (wave / pulse) and appearance (opaque / translucent). On its own, each preset is a Skeleton (role=\"progressbar\", aria-busy); nested presets don't repeat the announcement for screen readers. Use them as the skeleton prop of AsyncContent.",
    examples: [
      { title: "SkeletonText", description: "lines sets the number of lines, with a shorter last line; size small 12 · medium 16 · large 20px." },
      { title: "SkeletonAvatar", description: "Use the same size as the Avatar it stands in for." },
      { title: "SkeletonTable", description: "rows × columns, with 44px rows like Table size medium." },
      {
        title: "Skeleton that matches the real content",
        description: "SkeletonCard with header + 2 lines + 2 buttons lines up exactly with the Card below, so nothing shifts when they swap.",
      },
    ],
    dos: [
      "Match the real layout: same number of columns, avatar size, line height and button position.",
      "Only sketch the parts that will definitely be there; keep the line count close to typical data.",
      "Use translucent on colored surfaces, and pulse when wave is distracting.",
    ],
    donts: [
      "Don't draw skeletons for content that is already available (page title, static labels).",
      "Don't use skeletons for actions under 300ms. Leave that to AsyncContent / useSpinDelay.",
      "Don't put a Spinner in the middle of a skeleton.",
    ],
    props: {
      "SkeletonText.lines / size": "Number of lines (the last one at 60%) and line height.",
      "SkeletonAvatar.size / shape": "Side length (px) and shape.",
      "SkeletonCard.header / media / lines / actions": "Parts of the card.",
      "SkeletonList.rows / avatarSize / avatarShape": "Number of rows and the avatar in each row.",
      "SkeletonTable.rows / columns / header": "Table dimensions.",
      "animation / appearance": "Same as Skeleton; nested presets inherit from the outer preset.",
    },
  },

  optimistic: {
    description:
      "mutate(update, commit, options) applies update to the list right away and waits for commit(). On success the change is merged into the base data. On failure only that change is removed (other pending changes stay), and an error toast that doesn't close on its own offers a Retry button. update must be a pure function based on ids, because it is reapplied to the latest data. mutate returns true / false so you can follow up (e.g. put the text back in the input).",
    examples: [
      {
        title: "Waiting for the server vs. optimistic",
        description: "On a slow network the left button spins for 2 seconds; the right one changes at once and only reverts on an error.",
      },
      {
        title: "Add an item and restore the input on error",
        description: "mutate returns false on failure; put the comment back in the input so people don't lose their text.",
      },
    ],
    dos: [
      "Use it for actions that almost always succeed and are easy to undo: liking, checking off tasks, reordering, renaming.",
      "Write update by id, not by position.",
      "Report the error clearly when rolling back, and offer a retry.",
    ],
    donts: [
      "Don't use it for payments, permanent deletion or other actions that can't be undone. Wait for the server.",
      "Don't roll back silently.",
      "Don't lock the whole list while waiting. That is the pessimistic approach.",
    ],
    props: {
      "useOptimisticList(initial)": "Initial (confirmed) data.",
      items: "Base data plus every pending change.",
      "mutate(update, commit, options?)": "Applies update at once and waits for commit; true on success.",
      "options.errorTitle / errorBody": "Toast content on failure.",
      "options.toast / onError": "Turns off the default toast / handles the error yourself.",
      setItems: "Replaces the base data (e.g. after reloading from the server).",
      pending: "There are pending changes; combine it with useSpinDelay for a “Saving…” line.",
    },
    defaults: { "options.errorTitle / errorBody": "“Không lưu được thay đổi” (Couldn't save changes)" },
  },
};
