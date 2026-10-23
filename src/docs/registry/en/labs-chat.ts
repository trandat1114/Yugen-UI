import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/labs-chat.tsx.
export const en: Record<string, ComponentDocEn> = {
  trace: {
    description:
      "Each TraceStep has a status (pending, running, success, error, skipped, cancelled) shown with an icon and text, a duration or a live timer, metadata badges, expandable details (logs, JSON, CodeBlock) and nested child steps. The header counts steps by status, shows the total time and has an expand / collapse all button. Status changes are announced through a polite live region.",
    examples: [
      {
        title: "Six statuses",
        description: "The icon and token color come with a text label, so color is never the only signal. A running step starts its timer on its own.",
      },
      {
        title: "Pipeline with an error",
        description: "A failed step opens its details on its own; here the steps after it are set to skipped / cancelled.",
      },
      { title: "Tool call with JSON", description: "The details slot takes any content, here a JSON CodeBlock." },
    ],
    dos: [
      "Name steps with a short verb phrase that says what the system is doing (“Check calendars”, “Send invites”).",
      "Open the details of a failed step by default and state the cause and the fix.",
      "Give people actions in the header: Stop, Run again, View full log.",
    ],
    donts: [
      "Don't dump the whole raw log into description. Put it in details, collapsed by default.",
      "Don't nest more than 2 levels; group steps if the agent makes dozens of small calls.",
      "Don't turn off announceChanges when Trace is the only place that reports progress.",
    ],
    props: {
      "Trace.title / description": "Run title and secondary note.",
      "Trace.status": "Overall status; derived from the steps by default.",
      "Trace.duration / startedAt": "Total duration once finished; start time for the live timer while running.",
      "Trace.actions": "Buttons in the header (Run again, Stop…).",
      "Trace.appearance": "Framed, or embedded in another surface.",
      "Trace.size": "16 / 20px icons, caption1 / body1 text.",
      "Trace.hideHeader / announceChanges": "Hides the header; announces status changes through a live region.",
      "TraceStep.status": "Step status.",
      "TraceStep.title / description": "Step name (preferably a string, so it can be used in announcements) and description.",
      "TraceStep.duration / startedAt": "Duration (ms) once finished; a running step records its own start time if startedAt isn't passed.",
      "TraceStep.metadata": "Info badges: model, tokens, branch…",
      "TraceStep.details": "Expandable content (TraceLog, CodeBlock…).",
      "TraceStep.expanded / defaultExpanded / onExpandedChange": "Controls the disclosure; open by default when running / error.",
      "TraceStep.children": "Nested child steps, with a connecting line.",
      "TraceLog.intent": "Monospace log block, always LTR.",
    },
  },

  questionnaire: {
    description:
      "Supports single, multiple, rating (uses Rating), scale (NPS 0–10), text, longText and yesNo questions, with required and custom validate. It has a progress bar, Back / Next, Enter to continue, number keys (0–9) to choose, a slide transition (off with reduced motion), a review step and a completion screen. Controlled value / onChange is supported.",
    examples: [
      {
        title: "List mode + validate",
        description: "mode=\"list\": all questions on one page, each wrapped in a Field; the email is checked with validate.",
      },
      {
        title: "Controlled & completion screen",
        description: "value / onChange keep it in sync with outside state; completion is a render prop that receives answers and restart.",
      },
    ],
    dos: [
      "Keep one idea per question; add a short description only when something needs explaining.",
      "Mark a question required only when it really is. Optional questions let people move faster.",
      "Turn on the review step for long surveys or when answers are hard to change after sending.",
    ],
    donts: [
      "Don't use the stepper for a simple form of 2–3 fields. Use mode=\"list\" or plain Fields.",
      "Don't put more than 9 options in one question (number keys only go up to 9, and long lists are hard to read).",
      "Don't use validate to block an empty optional question. validate only runs once there is an answer.",
    ],
    props: {
      questions: "Question config: { id, type, title, description?, required?, validate?, …per type }.",
      mode: "One question per screen, or all on one page.",
      "value / defaultValue": "Record<id, string | string[] | number | boolean>.",
      onChange: "Called whenever an answer changes.",
      onSubmit:
        "Called when every question is valid; with a Promise the Submit button shows “Đang gửi…” (Sending…), and an error shows a retry message.",
      review: "Adds a review step before submitting.",
      completion: "Replaces the default completion screen.",
      "title / description / submitLabel": "Header and submit button label.",
      appearance: "With a frame (Card) or without.",
      "SingleQuestion / MultipleQuestion": "Option cards; multiple is limited by min / max.",
      "RatingQuestion / ScaleQuestion": "Stars (Rating) or a segmented scale (0–10 by default).",
      "TextQuestion / LongTextQuestion": "Single-line Input / Textarea with a counter (when maxLength is set).",
      YesNoQuestion: "Yes / No, labeled “Có” / “Không” by default; keys Y, N (or C, K).",
    },
    defaults: { "title / description / submitLabel": "— / — / “Gửi” (Submit)" },
  },

  messagescroller: {
    description:
      "Comes with MessageBubble (incoming / outgoing, avatar, time, delivery status, retry, reactions, automatic grouping of consecutive messages from the same sender, streamed content), MessageReaction, MessageDaySeparator and TypingIndicator. The End key jumps to the newest message. Incoming messages are announced through a polite live region; a streaming message is only announced once it is complete.",
    examples: [
      { title: "Delivery status & retry", description: "sending → sent → delivered → read; error shows a message and a Retry button." },
      {
        title: "Grouping & reactions",
        description: "Consecutive messages from the same sender are grouped: only the first one shows the avatar, name and time.",
      },
      {
        title: "Loading older messages",
        description: "Scroll to the top to call onLoadOlder; the reading position stays put when older messages are inserted.",
      },
      {
        title: "New messages while reading older ones",
        description: "Scroll up, then click “Nhận tin mới” (Receive new message): the list doesn't jump, and a floating button counts the new messages.",
      },
    ],
    dos: [
      "Give each item a stable key (the message id) so new and older messages are detected correctly.",
      "Always scroll to the bottom when people send a message themselves (the component does this for side=\"outgoing\").",
      "Give a failed message a clear way to retry, right on that message.",
    ],
    donts: [
      "Don't scroll down automatically while people are reading older messages. Let the new messages button do that.",
      "Don't put aria-live on the whole list while text streams. Screen readers would read every fragment.",
      "Don't render unsanitized HTML or Markdown in a bubble. MessageBubble shows plain text.",
    ],
    props: {
      "MessageScroller.onLoadOlder": "Called when scrolling reaches the top; a Promise prevents repeated calls.",
      "MessageScroller.hasOlder / loadingOlder": "Whether older messages remain; shows a spinner at the top of the list.",
      "MessageScroller.label": "Accessible name of the log region.",
      "MessageScroller.bottomThreshold": "Distance (px) from the bottom that still counts as being at the end.",
      "MessageScroller.announceIncoming": "Announces incoming messages through a polite live region.",
      "MessageBubble.side": "Someone else's message / your own.",
      "MessageBubble.author / avatar / avatarSrc": "Sender; the default avatar is an Avatar built from the name (incoming messages).",
      "MessageBubble.time / dateTime": "Displayed time and the ISO value for <time>.",
      "MessageBubble.status / onRetry / errorMessage": "Delivery status; error shows a Retry button.",
      "MessageBubble.groupPosition": "Overrides the position in the group (computed automatically by default).",
      "MessageBubble.reactions": "Reactions slot (MessageReaction).",
      "MessageBubble.streaming": "Streaming: blinking caret, aria-busy, not announced through the live region yet.",
      "MessageBubble.appearance": "plain: no background, full width, for long AI answers.",
      MessageReaction: "Reaction button (aria-pressed).",
      TypingIndicator: "Three dots (static with reduced motion), role=status.",
    },
    defaults: { "MessageScroller.label": "“Cuộc trò chuyện” (Conversation)" },
  },

  chatcomposer: {
    description:
      "Includes an actions slot for attachments, emoji or a model picker, a character counter, a key hint, and a busy state with a Stop button for AI responses. Nothing is sent while a Vietnamese input method (Telex, VNI) or another IME is still composing. ref points to the textarea.",
    examples: [
      { title: "Responding & Stop button", description: "busy blocks sending; with onStop, the Send button becomes a Stop button." },
      {
        title: "Key hint",
        description: "showHint shows “Enter để gửi · Shift+Enter xuống dòng” (Enter to send · Shift+Enter for a new line), hidden on narrow screens.",
      },
      { title: "Disabled", description: "Explain why in the placeholder or next to the composer." },
    ],
    dos: [
      "Return focus to the composer after sending (the component does this) so people can keep typing.",
      "Use busy + onStop while waiting for the AI so people can stop a long answer.",
    ],
    donts: [
      "Don't require Ctrl+Enter to send in regular chat. People expect Enter.",
      "Don't drop a message that failed to send: ChatComposer clears after onSend, so keep the message in the list with an error status and a Retry button.",
    ],
    props: {
      onSend: "Receives the trimmed text; the composer clears itself.",
      "value / defaultValue / onValueChange": "Controlled or uncontrolled.",
      "placeholder / label": "Placeholder and the textarea's accessible name.",
      "maxLength / showCount": "Character limit and counter (changes color near the limit).",
      maxRows: "Maximum rows before scrolling.",
      actions: "Buttons at the start of the toolbar.",
      "busy / onStop": "Blocks sending while waiting; Stop button.",
      "showHint / sendLabel / disabled": "Key hint, Send button label, disabled.",
      textareaProps: "Extra attributes for the textarea.",
    },
    defaults: {
      "placeholder / label": "“Nhập tin nhắn…” (Type a message…) / “Tin nhắn” (Message)",
      "showHint / sendLabel / disabled": "false / “Gửi” (Send) / false",
    },
  },

  codeblock: {
    description:
      "Supports tsx, ts, jsx, js, css, html, bash, json and md. The header shows the file name and a language label. maxHeight collapses long blocks behind a Show more / Show less button. appearance is auto (follows the theme) or dark. Always dir=\"ltr\". Comes with CodeTabs (several files) and PackageManagerTabs (npm / pnpm / yarn / bun; remembers the choice and keeps every block in sync).",
    examples: [
      { title: "Diff", description: "+ / - lines are colored green / red and keep their sign; Copy takes the version after the change." },
      { title: "Collapsing long blocks", description: "maxHeight cuts the block off and adds a Show more / Show less button (aria-expanded)." },
      {
        title: "CodeTabs",
        description: "Several files in one block; the language is guessed from the file extension. appearance=\"dark\" always has a dark background.",
      },
      {
        title: "PackageManagerTabs",
        description: "Pick a package manager in one block: every other block on the page follows, and the choice is remembered for next time.",
      },
    ],
    dos: [
      "Set filename when the code belongs to a specific file, so readers know where to paste it.",
      "Use highlightLines to point at the exact lines being explained.",
      "Use diff when explaining a change to existing code instead of printing the whole file again.",
    ],
    donts: [
      "Don't use CodeBlock for short code inside a sentence. Use inline <code>.",
      "Don't set maxHeight so low that readers have to expand every block.",
      "Don't expect IDE-level highlighting. The tokenizer is deliberately small.",
    ],
    props: {
      code: "Code content.",
      language: "Syntax highlighter.",
      "title / filename": "Shows the header with the language label, a wrap button and a copy button.",
      showLineNumbers: "Line number column.",
      highlightLines: "Highlighted lines: \"2,4-6\".",
      diff: "Lines starting with + / - are colored.",
      "wrap / defaultWrap / onWrapChange": "Wraps lines instead of scrolling horizontally.",
      maxHeight: "Collapses when taller; Show more / Show less button.",
      appearance: "Follows the theme, or always dark (left unchanged in high contrast).",
      "size / copyable / bare": "Text size; copy button; no frame, for nesting in another surface.",
      "CodeTabs.files": "List of files; value / defaultValue / onValueChange select a file.",
      "PackageManagerTabs.packages": "Packages to install, or the command when command=\"dlx\".",
      "PackageManagerTabs.dev / command / managers": "devDependency; npx / pnpm dlx / yarn dlx / bunx; limits the list.",
    },
  },
};
