import { messagesEn } from "@/components/ui";
import type { Content } from "./types";

const en: Content = {
  lang: "en",
  messages: messagesEn,
  locale: "en-US",
  appName: "Sakura Chat",
  assistantName: "Sakura",
  you: "You",
  nav: {
    open: "Open conversations",
    label: "Conversations",
    newChat: "New chat",
    settings: "Settings",
    empty: "No conversations yet.",
    groups: { today: "Today", week: "Previous 7 days", older: "Older" },
    options: (title) => `Options for ${title}`,
    replying: "Replying",
  },
  appearance: {
    label: "Appearance",
    mode: "Mode",
    brand: "Brand",
    themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" },
  },
  chat: {
    newTitle: "New chat",
    log: "Messages",
    greeting: "What can I help with?",
    intro: "Replies come from a local mock until you connect your own backend in src/api.ts.",
    suggestionsLabel: "Suggestions",
    suggestions: [
      { title: "Plan a trip", prompt: "Plan a three-day trip to Kyoto" },
      { title: "Explain code", prompt: "Explain AbortController with an example" },
      { title: "Write an email", prompt: "Write a polite reminder about an unpaid invoice" },
      { title: "Compare options", prompt: "Compare localStorage and IndexedDB" },
    ],
    placeholder: "Ask anything…",
    escToStop: "to stop",
    disclaimer: "AI can make mistakes. Check important information.",
    stopped: "Stopped",
    errorTitle: "The reply didn't load",
    retry: "Try again",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Couldn't copy to the clipboard",
    regenerate: "Regenerate",
    actions: "Message actions",
    working: "Working…",
    ranSteps: (count) => (count === 1 ? "Ran 1 step" : `Ran ${count} steps`),
    steps: "Steps",
    attachments: "Attachments",
    options: "Conversation options",
    rename: "Rename",
    delete: "Delete",
  },
  rename: { title: "Rename conversation", label: "Name", save: "Save", cancel: "Cancel" },
  remove: {
    title: "Delete conversation?",
    body: (title) => `“${title}” will be removed from this browser. This can't be undone.`,
    confirm: "Delete",
    cancel: "Cancel",
    done: "Conversation deleted",
  },
  notFound: {
    title: "Page not found",
    body: "The address may be wrong, or the page has moved.",
    chatTitle: "Conversation not found",
    chatBody: "It may have been deleted, or it was saved in another browser.",
    action: "Start a new chat",
  },
  settings: {
    title: "Settings",
    description: "Saved in this browser.",
    appearance: { title: "Appearance", description: "Mode and brand color." },
    data: {
      title: "Conversations",
      description: (count) =>
        `${count === 1 ? "1 conversation is" : `${count} conversations are`} saved in this browser's localStorage. Attachments are not saved, only their names.`,
      export: "Export as JSON",
      clear: "Delete all",
      clearTitle: "Delete all conversations?",
      clearBody: "Every conversation will be removed from this browser. This can't be undone.",
      clearConfirm: "Delete all",
      cancel: "Cancel",
      cleared: "All conversations deleted",
    },
    backend: {
      title: "Backend",
      description: "Replies come from the local mock in src/api.ts. Replace sendMessage there to use your own endpoint.",
      fail: "Fail replies",
      failHint: "Only affects the mock. Use it to check the error state.",
    },
  },
  mock: {
    replies: [
      {
        match: ["kyoto"],
        reasoning:
          "The user wants a three-day plan for Kyoto. Group the sights by area so each day needs little travel: east (Higashiyama), north-west (Arashiyama, Kinkaku-ji) and south (Fushimi Inari). Busy places are best early in the morning.",
        steps: ["Search travel guides for Kyoto", "Group sights by area", "Check opening hours"],
        answer: `Here is a three-day plan that keeps travel short by grouping sights by area.

### Day 1: Higashiyama
- **Morning:** Kiyomizu-dera, then walk down Sannenzaka and Ninenzaka.
- **Afternoon:** Yasaka Shrine and Maruyama Park.
- **Evening:** Dinner in Gion. The lanes around Hanamikoji are quieter after 8 pm.

### Day 2: Arashiyama and Kinkaku-ji
- Reach the **bamboo grove** before 8 am to avoid the crowds[1].
- Visit the Tenryu-ji garden, then take a short train ride to Kinkaku-ji.

### Day 3: Fushimi Inari
- Walk through the torii gates up to the Yotsutsuji viewpoint, about 90 minutes there and back[2].
- Spend the afternoon at Nishiki Market.

Book dinner in Gion ahead of time; many places fill up early.`,
        sources: [
          { title: "Kyoto City Official Travel Guide", url: "https://kyoto.travel/en/", snippet: "Sights, seasons and getting around Kyoto." },
          { title: "Fushimi Inari Taisha", url: "https://inari.jp/en/", snippet: "The head shrine of Inari, known for its thousands of torii gates." },
        ],
      },
      {
        match: ["abortcontroller", "abort signal"],
        reasoning:
          "Explain what AbortController is for, then show the three steps in code: create a controller, pass its signal, call abort(). Mention that an aborted fetch rejects with an AbortError.",
        steps: ["Look up AbortController on MDN", "Write an example"],
        answer: `\`AbortController\` cancels work that is already running, such as a \`fetch\` request[1].

1. Create a controller and pass its \`signal\` to the request.
2. Call \`abort()\` when the result is no longer needed.
3. The request rejects with an \`AbortError\`, which you can ignore.

\`\`\`ts
const controller = new AbortController();

fetch("/api/chat", { method: "POST", body, signal: controller.signal })
  .then((res) => res.json())
  .catch((error) => {
    if (error.name !== "AbortError") throw error;
  });

// Later, for example when the user presses Esc:
controller.abort();
\`\`\`

\`AbortSignal.timeout(5000)\` gives you a signal that aborts on its own after five seconds[2]. This chat uses the same signal to stop a reply.`,
        sources: [
          {
            title: "AbortController",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
            snippet: "An object that lets you abort one or more web requests as and when desired.",
          },
          {
            title: "AbortSignal: timeout() static method",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static",
            snippet: "Returns an AbortSignal that aborts automatically after a given time.",
          },
        ],
      },
      {
        match: ["invoice", "reminder"],
        reasoning:
          "A payment reminder should be short and friendly. Include the invoice number, amount and due date, allow for the payment already being on its way, and make it easy to reply.",
        steps: ["Draft the email", "Check the tone"],
        answer: `**Subject:** Reminder: invoice #1042 was due on May 30

Hi Mai,

I hope your week is going well. This is a quick reminder that invoice #1042 for $1,250 was due on May 30. If you have already paid, thank you, and please ignore this email.

The payment details are on the invoice. If anything is unclear, just reply here.

Best regards,
Lan`,
      },
      {
        match: ["localstorage", "indexeddb"],
        reasoning:
          "Compare the two on API style, what they can store, how much, and what each is good for. A table fits. Tie it back to how this template stores conversations.",
        steps: ["Read the storage docs", "Build a comparison table"],
        answer: `| | localStorage | IndexedDB |
| --- | --- | --- |
| API | Synchronous | Asynchronous |
| Stores | Strings only | Objects, files and blobs |
| Size | About 5 MB per origin | Much more, depends on free disk space[1] |
| Good for | Settings, small drafts | Offline data, large lists[2] |

This template keeps conversations in \`localStorage\`. Move them to IndexedDB or to your server once they grow past a few megabytes.`,
        sources: [
          {
            title: "Storage quotas and eviction criteria",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria",
            snippet: "How much data browsers let a site store, and when they delete it.",
          },
          {
            title: "IndexedDB API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
            snippet: "A low-level API for client-side storage of significant amounts of structured data.",
          },
        ],
      },
    ],
    fallback: {
      reasoning: "There is no canned answer for this question, so explain where real answers come from.",
      steps: ["Read the question", "Write a reply"],
      answer: (quote) => `This reply comes from the local mock in \`src/api.ts\`. You asked:

${quote}

To get real answers, replace \`sendMessage\` with a call to your own endpoint. The README shows how to do it without putting API keys in the browser.

Try one of the suggestions on the New chat page to see reasoning, steps, sources and code.`,
    },
    readFile: (name) => `Read ${name}`,
    attachmentNote: (names) =>
      `\n\nThe mock doesn't open ${names}. In your app, upload files to your server and send a reference with the message.`,
    error: "The server didn't respond (simulated). Turn off “Fail replies” in Settings to get answers again.",
  },
  seed: [
    { title: "Three days in Kyoto", prompt: "Plan a three-day trip to Kyoto", reply: 0, hoursAgo: 2 },
    { title: "AbortController example", prompt: "Explain AbortController with an example", reply: 1, hoursAgo: 52 },
    { title: "localStorage or IndexedDB", prompt: "Compare localStorage and IndexedDB", reply: 3, hoursAgo: 24 * 12 },
  ],
};

export default en;
