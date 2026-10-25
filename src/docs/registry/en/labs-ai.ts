import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-ai.tsx.
export const en: Record<string, ComponentDocEn> = {
  streamingmarkdown: {
    description:
      "A built-in parser (parseMarkdown, also exported for testing) builds React elements directly: paragraphs, headings (shifted by headingOffset, never an h1), bold, italic, strikethrough and inline code, links (http, https and mailto only; http and https links open in a new tab with rel noreferrer noopener), nested lists and task lists, blockquotes, GFM tables with alignment, horizontal rules, and code blocks rendered with CodeBlock. While streaming, an unclosed fence shows as a code block in progress, and an unfinished **, link or [1] doesn't show raw syntax. A caret is shown (static with reduced motion) and aria-busy is set. Blocks that have settled keep the same object, so React.memo skips re-rendering them.",
    examples: [
      {
        title: "Task list & unsafe links",
        description: "A `- [x]` item gets an icon plus the hidden text “Đã xong” (Done). A javascript: link is removed and only its label remains.",
      },
      { title: "Small size", description: "size=\"small\" uses caption1, for notes, reasoning blocks and cards in a panel." },
    ],
    dos: [
      "Pass the whole growing string and keep streaming on until the last token arrives. The component handles unfinished syntax.",
      "Set headingOffset to match the heading level of the surrounding page (default 2: # → h3).",
      "Inside a streaming MessageBubble, set caret={false} so there aren't two carets.",
    ],
    donts: [
      "Don't build HTML strings yourself or use dangerouslySetInnerHTML for model answers.",
      "Don't turn on announceWhenDone inside a MessageScroller. The answer would be read twice.",
      "Don't expect full CommonMark: raw HTML, images, reference links and indented code aren't supported.",
    ],
    props: {
      children: "Markdown content.",
      streaming: "Tolerates unfinished syntax, shows the caret, sets aria-busy.",
      headingOffset: "Added to the heading level; never produces an h1.",
      citations: "Sources for [1] / [^1], rendered as Citation chips.",
      breaks: "Turns single line breaks into <br>.",
      caret: "Caret while streaming.",
      size: "caption1 or body1.",
      announceWhenDone: "Reads the plain text through a live region when the stream ends.",
      "parseMarkdown(text, { streaming })": "The parser on its own; sanitizeHref and markdownToPlainText are exported too.",
    },
  },

  citation: {
    description:
      "The chip is a Popover button. Hover or keyboard focus opens a preview card without moving focus; a click or Enter pins the card and moves focus to the link; Esc closes it and returns focus. The chip describes its source through aria-describedby. No favicon is loaded from other sites; the first letter of the domain is shown instead. CitationList lists the sources under the answer, numbered to match the chips.",
    examples: [
      { title: "From Markdown", description: "Pass citations to StreamingMarkdown and every [n] with a matching source becomes a chip." },
    ],
    dos: [
      "Number the chips in the order the sources appear in CitationList.",
      "Provide a snippet so readers can check the source without leaving the page.",
      "Place the chip right after the clause the source supports.",
    ],
    donts: [
      "Don't use a chip for a note that has no real source.",
      "Don't load favicons or preview images from other sites. Those requests expose information about the reader.",
      "Don't put more than 3 chips in a row. Combine them or point to CitationList.",
    ],
    props: {
      index: "Displayed number (from 1).",
      source: "Source details; url only accepts http / https / mailto.",
      "openDelay / closeDelay": "Delay before opening / closing on hover.",
      "CitationList.sources": "List of sources (2-column grid from sm).",
      "CitationList.title": "Heading, followed by the count.",
    },
    defaults: { "CitationList.title": "“Nguồn” (Sources)" },
  },

  reasoning: {
    description:
      "Built on Collapsible (aria-expanded; the height animation turns off with reduced motion). autoOpen opens the block when reasoning starts and collapses it when done, unless the user has toggled it. The time is measured in an effect (Date.now() is never read during render), so it is safe for SSR; you can also pass duration. String content is rendered with a small StreamingMarkdown and has aria-busy while running.",
    examples: [{ title: "Finished, with duration", description: "Collapsed by default; pass duration when the server has already measured it." }],
    dos: [
      "Place Reasoning right above the answer and collapse it once done.",
      "Show the reasoning time so people understand why they had to wait.",
      "Let people reopen it to check the reasoning.",
    ],
    donts: [
      "Don't leave a long reasoning block open once the answer is there.",
      "Don't use Reasoning for tool-call steps. Use Trace.",
      "Don't read the reasoning content through a live region.",
    ],
    props: {
      streaming: "Reasoning in progress: changing label, timer, aria-busy.",
      duration: "Duration; measured automatically when left out.",
      "open / defaultOpen / onOpenChange": "Controls the open state.",
      autoOpen: "Opens when reasoning starts and collapses when it ends.",
      label: "Replaces the default label.",
      children: "A string is rendered with StreamingMarkdown size small.",
    },
  },

  promptinput: {
    description:
      "Files show as chips with a type icon (or a thumbnail for images, created with URL.createObjectURL and revoked on removal or unmount) and the file size. accept, maxFiles and maxSize are checked before a file is added, and errors show inline (role=alert). Enter sends, Shift+Enter adds a new line, and nothing is sent while an input method is still composing (Telex, IME). onSubmit receives { text, files }; return false to keep the content. For text-only chat, ChatComposer is the simpler choice.",
    examples: [{ title: "Text only, with key hint" }, { title: "Disabled" }],
    dos: [
      "Set accept / maxSize to the server's limits so errors show early.",
      "Put the model and tool pickers in toolbar, close to the Send button.",
      "Allow stopping (onStop) when answers are long.",
    ],
    donts: [
      "Don't clear the content when sending fails. Return false from onSubmit.",
      "Don't send when Enter is only confirming text in an input method.",
      "Don't hide why a file was rejected.",
    ],
    props: {
      onSubmit: "Sends; returning false keeps the content.",
      "value / defaultValue / onValueChange": "Text (controlled / uncontrolled).",
      "files / defaultFiles / onFilesChange": "Attached files.",
      "accept / maxFiles / maxSize": "File checks; onFilesRejected receives the reasons.",
      "streaming / onStop": "Blocks sending; Stop button.",
      toolbar: "Slot after the attach button.",
      allowAttachments: "Attach button, drag and drop, pasting files.",
      "maxRows / showHint / disabled": "Maximum rows before scrolling, key hint, disabled.",
      "placeholder / label / sendLabel / stopLabel": "Visible text and accessible labels.",
    },
  },

  tour: {
    description:
      "Each step takes a target (a CSS selector or a ref; without one, the popover sits in the middle of the screen), title, content, placement (top / bottom / start / end, flipped in RTL) and media. The popover is modal: focus moves inside and Tab can't leave it, Esc closes it, and focus returns to where it was when the tour ends. The target is scrolled into view and tracked every frame (scrolling, resizing). The spotlight has an outline, so it stays visible in high contrast mode. useTour() controls start / stop / next / back / goTo.",
    examples: [{ title: "One step, controlled, brand", description: "target is a ref; open / onOpenChange control the tour from outside." }],
    dos: [
      "Keep the tour short (3–5 steps), one idea per step.",
      "Always offer Skip, and let people reopen the tour from the Help menu.",
      "Target stable elements (id, data attribute) rather than class names that change easily.",
    ],
    donts: [
      "Don't open the tour on every visit. Only the first time, or when people ask for it.",
      "Don't put required actions inside the tour.",
      "Don't use a tour to make up for a confusing interface.",
    ],
    props: {
      steps: "Steps; target is a selector or a ref.",
      "open / defaultOpen / onOpenChange": "Open state.",
      "step / defaultStep / onStepChange": "Current step (from 0).",
      onFinish: "Called when Finish is clicked on the last step.",
      appearance: "Surface, as in TeachingPopover.",
      "spotlightPadding / closeOnOverlayClick": "Gap around the spotlight; close by clicking the overlay.",
      "nextLabel / backLabel / skipLabel / finishLabel": "Button labels.",
      "useTour()": "Controls the tour from anywhere inside Tour.",
    },
  },

  notificationcenter: {
    description:
      "Each notification has an avatar or an intent icon, a title, body, relative time, an unread dot (with hidden text) and Mark as read / Dismiss actions. The panel has All / Unread filters, Mark all as read, and empty (Empty), loading (SkeletonList through useSpinDelay) and error (ErrorState with Retry) states. Times are computed after mount or from the now prop, so hydration doesn't mismatch. New notifications are announced politely through useAnnounce. useNotifications() is a small store for demos.",
    examples: [
      {
        title: "Loading & error",
        description: "The skeleton only shows when the wait is longer than 300ms; the error state has a Retry button when onRetry is passed.",
      },
    ],
    dos: [
      "Write titles that say who did what; put the details in body.",
      "Make a notification clickable so it leads to the right place and marks itself as read.",
      "Use the warning / error intents only for things people need to act on.",
    ],
    donts: [
      "Don't use NotificationCenter for immediate feedback on an action. Use Toast.",
      "Don't count read notifications on the bell.",
      "Don't compute the current time during server render. Pass now, or let the component read it after mount.",
    ],
    props: {
      items: "{ id, title, body?, time, read?, author?, icon?, intent?, href? }.",
      "onMarkRead / onMarkAllRead / onDismiss": "Actions (controlled).",
      onItemClick: "Click on a notification; also calls onMarkRead if it is unread.",
      "loading / error / onRetry": "Loading and error states.",
      now: "Fixed reference time (SSR, tests).",
      "open / defaultOpen / onOpenChange": "Panel open state.",
      "mode / breakpoint": "Popover or bottom sheet.",
      "title / footer / announce": "Title, panel footer, announcing new notifications.",
      "useNotifications(initial)": "Small store for demos; spread bind into NotificationCenter.",
    },
    defaults: { "title / footer / announce": "“Thông báo” (Notifications) / — / true" },
  },
};
