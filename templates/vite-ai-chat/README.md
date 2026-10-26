# Sakura Chat

An AI chat app from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Replies come from a local mock until you connect your own backend.

```bash
npx create-yugen-ui@latest my-app --template ai-chat
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-ai-chat

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Conversations: new, rename, delete, saved in `localStorage`. On narrow screens the list moves into a Drawer.
- Streaming answers: Markdown that renders as it arrives (`StreamingMarkdown`), a collapsible `Reasoning` block, the
  agent's steps in a `Trace`, and `Citation` chips with a list of sources.
- Stop a reply with the Stop button or Esc. Copy or regenerate an answer.
- `PromptInput` with attachments (button, drag and drop, paste). Enter sends, Shift+Enter adds a new line.
- Routes with the History API: `/` (new chat), `/c/<id>` (a conversation), `/settings`. Each page loads on demand.
- Light, dark and high-contrast themes and three brands, saved with no flash on reload.
- All text, mock replies included, lives in `src/content/`: English by default, Vietnamese with
  `npx create-yugen-ui@latest my-app --template ai-chat --lang vi`.

## Connect your backend

The chat calls one function: `sendMessage(messages, { signal })` in `src/api.ts`. It gets the conversation, oldest
message first, and returns the reply as an async iterable of chunks:

```ts
type ChatChunk =
  | { type: "text"; text: string } // Markdown added to the answer
  | { type: "reasoning"; text: string } // shown in the Reasoning block
  | { type: "step"; id: string; title: string; status: TraceStatus } // adds or updates a Trace step
  | { type: "sources"; sources: CitationSource[] }; // for [1], [2] in the text
```

`signal` aborts when the user stops the reply. If the iterable throws, the answer shows the error and a Try again
button. Only `text` is required; the other chunks are optional.

Model API keys must stay on a server. Add an endpoint there that streams one JSON chunk per line, then point
`sendMessage` at it with the helper in `src/api.ts`:

```ts
export function sendMessage(messages: ChatMessage[], options: SendOptions) {
  return streamFromEndpoint("/api/chat", messages, options);
}
```

The endpoint can use any model provider and any server that speaks the Web `Request` / `Response` API (Hono, Next.js
route handlers, Cloudflare Workers, Deno, Bun):

```ts
// POST /api/chat → newline-delimited JSON, one ChatChunk per line
export async function POST(request: Request) {
  const { messages } = await request.json();
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (chunk: object) => controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
      // Call your model here with the API key from the server's environment and forward its stream.
      for await (const text of streamFromYourModel(messages, request.signal)) send({ type: "text", text });
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "application/x-ndjson" } });
}
```

- In development, forward `/api` to that server with `server.proxy` in `vite.config.ts`.
- Attachments: each message has the files' `name`, `size` and `type`, plus `file` (the `File`) for messages
  sent in this session. JSON can't carry files: upload them first, for example with `FormData`, and send a reference.
- Settings > Backend > Fail replies makes the mock throw, so you can check the error state.

## Deploy

`npm run build` and upload `dist/` to a static host. Pages are real paths, so a deep link such as `/settings` must
get the app back from the host:

- **Netlify**: nothing to do, `public/_redirects` sends unknown paths to `index.html`.
- **Vercel**: nothing to do, `vercel.json` has the same rewrite.
- **Cloudflare Pages**: nothing to do, it serves the app for unknown paths when there is no `404.html`.
- **GitHub Pages**: `npm run build:gh-pages` also writes `dist/404.html`, which GitHub Pages serves for unknown
  paths. For a project site, add the repository name: `npm run build:gh-pages -- --base=/my-repo/`.

Under a sub-path on another host, build with `npm run build -- --base=/my-app/`.

## Structure

```
src/
  App.tsx            # YugenProvider, saved theme, router
  ChatLayout.tsx     # sidebar (Drawer on narrow screens), header, the page for the route
  ChatPage.tsx       # messages, answers, prompt input
  SettingsPage.tsx · NotFoundPage.tsx
  Sidebar.tsx        # conversation list
  api.ts             # sendMessage: the backend adapter, a mock by default
  useChat.ts         # streaming loop: stop, regenerate
  conversations.ts   # conversation data and localStorage
  router.tsx         # / · /c/<id> · /settings
  content/           # every string, one file per language
```

Files in `src/` are generated from `src/docs/template-library/ai-chat` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
