#!/usr/bin/env node
/**
 * Sinh starter template trong templates/ từ mã có sẵn trên docs, đổi import "@/components/ui" → "yugen-ui":
 *   - blocks: các block trong src/docs/block-library xếp dọc trong main.tsx
 *   - app:    một ứng dụng đầy đủ trong src/docs/template-library/<app>/ (App.tsx là gốc) — block nó import được chép kèm.
 *             Mọi file (kể cả thư mục con như posts/*.md) vào src/, trừ vite.config.ts → gốc template (import "./x" → "./src/x").
 * Template luôn khớp docs (trang #/templates xem trước chính các file này); sửa nguồn rồi chạy lại script.
 *
 *   node scripts/sync-templates.mjs           # ghi lại templates/
 *   node scripts/sync-templates.mjs --check   # CI: báo lỗi nếu templates/ lệch so với nguồn
 *
 * Dùng: npx create-yugen-ui@latest my-app --template saas
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const check = process.argv.includes("--check");

/** Giữ khớp với src/docs/templates.ts (trang #/templates). */
const TEMPLATES = [
  {
    dir: "vite-starter",
    /** Mô tả một dòng (tiếng Anh) cho `yugen create` — ghi vào templates/templates.json. */
    hint: "Blank app: saved theme, toast, @/ alias and a short welcome page",
    /** Tên template (trình chọn của `yugen create`, docs). `appTitle`: <title> và README của app được tạo. */
    title: "Starter",
    appTitle: "My app",
    description: "A blank React + Tailwind CSS v4 project with Yugen UI: saved theme, toast and the @/ alias.",
    /** <html lang>, README và trang chào; `create --lang vi` (#55) đổi sang tiếng Việt. Template khác: "vi". */
    lang: "en",
    app: "starter",
    storageKey: "yugen-starter-appearance",
    /** Alias @/ → src cho mã của người dùng (vite.config + tsconfig). */
    alias: true,
    /** Font Mincho từ Google Fonts, chỉ tải các ký tự Nhật có trong mã nguồn (tham số text=). */
    jpFont: true,
    devDependencies: { "@types/node": "^22.0.0" },
  },
  {
    dir: "vite-saas",
    hint: "SaaS workspace: sidebar, Ctrl K command palette, notifications, 8 pages",
    title: "SaaS",
    appTitle: "Sakura Studio",
    description:
      "Ứng dụng SaaS dựng bằng Yugen UI: sidebar, bảng lệnh Ctrl K, thông báo, theme sáng / tối / tương phản cao và 8 trang mẫu.",
    app: "saas",
    /** Khoá localStorage của script chống nháy — trùng STORAGE_KEY trong App.tsx. */
    storageKey: "yugen-saas-appearance",
  },
  {
    dir: "vite-blog",
    hint: "Markdown blog: table of contents, tags, search, build-time SEO",
    title: "Blog",
    appTitle: "Nhật ký Sakura",
    description: "Blog viết bằng Markdown, dựng bằng Yugen UI: mục lục, thẻ, tìm kiếm, theme tối và SEO sinh sẵn lúc build.",
    app: "blog",
    storageKey: "yugen-blog-theme",
    devDependencies: { "@types/node": "^22.0.0" },
    /** vite.config.ts của app thay khối <!-- seo --> … <!-- /seo --> trong index.html cho từng trang khi build. */
    seoPlugin: true,
  },
  {
    dir: "vite-dashboard",
    hint: "Dashboard: KPI cards, charts and recent transactions",
    title: "Dashboard",
    description: "Dashboard dựng bằng Yugen UI: thẻ KPI, biểu đồ và giao dịch gần đây.",
    blocks: ["02-stats.tsx", "11-analytics.tsx", "06-transactions.tsx"],
  },
  {
    dir: "vite-ai-chat",
    hint: "AI chat: saved conversations, streaming answers you can stop, one backend adapter",
    title: "AI chat",
    appTitle: "Sakura Chat",
    description:
      "An AI chat app built with Yugen UI: saved conversations, streaming Markdown answers with reasoning, steps and sources, and one adapter for your backend.",
    lang: "en",
    app: "ai-chat",
    storageKey: "yugen-ai-chat-appearance",
  },
];

const BLOCK_DIR = path.join(root, "src/docs/block-library");
const APP_DIR = path.join(root, "src/docs/template-library");
const BLOCK_IMPORT = /(["'])@\/docs\/block-library\/(?:\d+-)?([\w-]+?)(?:\.tsx)?\1/g;

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const toYugen = (code) =>
  code
    .replace(/(["'])@\/components\/ui(?:\/[^"']*)?\1/g, '"yugen-ui"')
    .replace(/(["'])@\/lib\/cn\1/g, '"yugen-ui"')
    .replace(BLOCK_IMPORT, '"./blocks/$2"');
const blockTarget = (file) => `src/blocks/${file.replace(/^\d+-/, "")}`;
const componentName = (file) => {
  const m = read(path.join(BLOCK_DIR, file)).match(/export default function (\w+)/);
  if (!m) throw new Error(`${file}: thiếu export default function`);
  return m[1];
};

/** File của template app (giữ nguyên đường dẫn, đặt ở src/; vite.config.ts ở gốc) + các block chúng import. */
function appSources(app) {
  const dir = path.join(APP_DIR, app);
  const sources = Object.fromEntries(
    fs
      .readdirSync(dir, { recursive: true })
      .map((f) => String(f).split(path.sep).join("/"))
      .filter((f) => /\.(tsx?|md)$/.test(f) && !/\.test\.tsx?$/.test(f))
      .sort()
      .map((f) =>
        f === "vite.config.ts"
          ? [f, read(path.join(dir, f)).replace(/from "\.\/(?!src\/)/g, 'from "./src/')]
          : [`src/${f}`, read(path.join(dir, f))],
      ),
  );
  const blockNames = new Set(Object.values(sources).flatMap((code) => [...code.matchAll(BLOCK_IMPORT)].map((m) => m[2])));
  const blocks = fs.readdirSync(BLOCK_DIR).filter((f) => blockNames.has(f.replace(/^\d+-/, "").replace(/\.tsx$/, "")));
  return { sources, blocks };
}

const indexHtml = (t) => {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const noFlash = t.storageKey
    ? `
    <script>
      // Áp theme / brand đã lưu trước khi React render để không nháy nền (cùng khoá với App.tsx).
      (function () {
        var a = {};
        try { a = JSON.parse(localStorage.getItem("${t.storageKey}") || "{}"); } catch (e) {}
        var t = a.theme === "light" || a.theme === "dark" || a.theme === "high-contrast" ? a.theme
          : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", t);
        document.documentElement.setAttribute("data-brand", a.brand === "web" || a.brand === "teams" ? a.brand : "sakura");
      })();
    </script>`
    : "";
  const lang = t.lang ?? "vi";
  const attrs = t.storageKey ? `lang="${lang}" dir="ltr"` : `lang="${lang}" data-theme="light" data-brand="sakura" dir="ltr"`;
  // Google Fonts chỉ gửi glyph của đúng các ký tự này (vài kB thay vì vài MB cho cả bộ chữ Nhật).
  const jpFont = t.jpFont
    ? `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=${encodeURIComponent(t.jpChars)}" />`
    : "";
  return `<!doctype html>
<html ${attrs}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#c2347a" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />${jpFont}
${t.seoPlugin ? "    <!-- seo -->\n" : ""}    <title>${esc(t.appTitle ?? t.title)}</title>
    <meta name="description" content="${esc(t.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(t.appTitle ?? t.title)}" />
    <meta property="og:description" content="${esc(t.description)}" />${t.seoPlugin ? "\n    <!-- /seo -->" : ""}${noFlash}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
};

const blocksMain = (blocks) => `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
${blocks.map((b) => `import ${componentName(b)} from "./blocks/${b.replace(/^\d+-/, "").replace(/\.tsx$/, "")}";`).join("\n")}
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 bg-shell p-6">
${blocks.map((b) => `        <${componentName(b)} />`).join("\n")}
      </main>
    </YugenProvider>
  </StrictMode>,
);
`;

const appMain = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const install = (dir, lang = "vi") => `\`\`\`bash
npx create-yugen-ui@latest my-app --template ${dir.replace(/^vite-/, "")}
cd my-app
npm run dev
\`\`\`

${
  lang === "en"
    ? "Try it without installing anything on StackBlitz:"
    : "Không muốn cài gì? Mở thẳng trên StackBlitz:"
} https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/${dir}

${lang === "en" ? "Check your setup any time:" : "Kiểm tra cấu hình bất cứ lúc nào:"} \`npx @yugen-ui/cli doctor\` (${
  lang === "en" ? "see" : "xem"
} https://trandat1114.github.io/Yugen-UI/#/concepts/cli).`;

const generatedFrom = (t) =>
  t.lang === "en"
    ? `Files in \`src/\` are generated from \`src/docs/template-library/${t.app}\` (and \`src/docs/block-library\`) by \`scripts/sync-templates.mjs\`.`
    : `File trong \`src/\` sinh từ \`src/docs/template-library/${t.app}\` (và \`src/docs/block-library\`) bằng \`scripts/sync-templates.mjs\`.`;

const README = {
  starter: (t) => `# ${t.appTitle ?? t.title}

A blank [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) project: Vite, React and Tailwind CSS v4, set up and
ready to go.

${install(t.dir, "en")}

## What's included

- \`YugenProvider\` with light, dark and high-contrast themes and the Sakura and Web brands, saved in \`localStorage\`
  with no flash on reload (a small script in \`index.html\`).
- \`toast()\` from anywhere, Tooltip, focus rings, RTL.
- An \`@/\` → \`src/\` alias (\`vite.config.ts\` + \`tsconfig.json\`).
- SEO basics: \`description\`, Open Graph, \`theme-color\`, favicon, \`robots.txt\`.
- Vendor chunks split out, so the build has no size warnings.
- A short welcome page. Its text lives in \`src/content/\`: English by default, Vietnamese with
  \`npx create-yugen-ui@latest my-app --template starter --lang vi\`.

## Start building

1. In \`src/App.tsx\`, replace \`<Welcome />\` with your app.
2. When you no longer need it, delete \`src/Welcome.tsx\`, \`src/Sakura.tsx\` and \`src/content/\`, and remove the
   Shippori Mincho font \`<link>\` from \`index.html\`.
3. Add components: \`import { Button, DataGrid } from "yugen-ui"\`. Examples are in the
   [docs](https://trandat1114.github.io/Yugen-UI/).

## Brand colour

The appearance menu switches between Sakura and Web. For your own colour, create a palette in
[Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer), paste its CSS into \`src/index.css\`, and
use its name as the default brand: \`"sakura"\` in \`index.html\` (the no-flash script) and in \`src/App.tsx\`.

## Structure

\`\`\`
src/
  App.tsx        # YugenProvider and the saved theme: your starting point
  Welcome.tsx    # welcome page (safe to delete)
  content/       # welcome page text, one file per language
  Sakura.tsx     # blossom SVG and the Japanese font class (safe to delete)
  index.css      # @import "tailwindcss" + the Yugen theme
  main.tsx
\`\`\`

${generatedFrom(t)}
`,
  blog: (t) => `# ${t.appTitle ?? t.title}

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — blog viết bằng Markdown trên Vite + React +
Tailwind CSS v4. Không cần CMS hay thư viện Markdown: thêm file \`.md\` là có bài mới.

${install(t.dir)}

## Có gì bên trong

- Bài viết là file \`src/posts/*.md\` có frontmatter (\`title\`, \`description\`, \`date\`, \`tags\`, \`draft\`).
- Markdown hiển thị bằng parser an toàn của Yugen UI: code tô màu có nút sao chép, bảng, trích dẫn, việc cần làm, ảnh, link nội bộ.
- Trang chủ có tìm kiếm và lọc theo thẻ; trang bài có mục lục, thời gian đọc, bài trước / sau, sao chép liên kết.
- Định tuyến theo đường dẫn thật (\`/posts/<slug>/\`) bằng History API — không thêm thư viện.
- **SEO sinh lúc build** (plugin \`blogSeo\` trong \`vite.config.ts\`): mỗi bài / thẻ một file HTML có \`<title>\`, \`description\`,
  canonical, Open Graph, JSON-LD \`BlogPosting\`; kèm \`sitemap.xml\`, \`rss.xml\`, \`robots.txt\`, \`404.html\`.
- Theme sáng / tối / tương phản cao, lưu vào \`localStorage\`, không nháy khi tải lại.

## Cấu trúc

\`\`\`
src/
  site.ts          # tên blog, mô tả, domain (SITE.url), tác giả
  posts/*.md       # bài viết — tên file là đường dẫn
  content.ts       # đọc frontmatter, thời gian đọc (dùng chung với plugin SEO)
  Markdown.tsx     # Markdown → component, heading có id cho mục lục
  BlogLayout.tsx   # thanh trên, nội dung theo route, chân trang
  PostList.tsx · PostPage.tsx · router.tsx
vite.config.ts     # plugin blogSeo: HTML tĩnh từng trang, sitemap, RSS
\`\`\`

## Triển khai

1. Đặt \`url\` trong \`src/site.ts\` thành domain thật (build sẽ nhắc nếu còn \`example.com\`).
2. \`npm run build\` → đưa \`dist/\` lên host tĩnh bất kỳ. Ở thư mục con (GitHub Pages): \`BASE=/ten-repo/ npm run build\`.
3. Gửi \`sitemap.xml\` cho Google Search Console.

${generatedFrom(t)}
`,
  saas: (t) => `# ${t.appTitle ?? t.title}

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — ứng dụng SaaS hoàn chỉnh trên Vite + React +
Tailwind CSS v4, sẵn sàng thay dữ liệu thật.

${install(t.dir)}

## Có gì bên trong

- Sidebar \`Nav\` có nhóm và số đếm; trên màn hẹp chuyển thành \`Drawer\` (container query, không cần JS đo kích thước).
- Bảng lệnh **Ctrl / ⌘ K**: chuyển trang, đổi theme / thương hiệu, hành động nhanh.
- \`NotificationCenter\`, menu tài khoản, breadcrumb, nút xuất báo cáo có \`toast\`.
- Theme sáng / tối / tương phản cao + thương hiệu Sakura / Web / Teams, lưu vào \`localStorage\`, **không nháy** khi tải lại
  (script nhỏ trong \`index.html\`).
- 8 trang mẫu ghép từ block: Tổng quan, Phân tích, Trợ lý AI, Hộp thư, Lịch hẹn, Đội ngũ, Thanh toán, Cài đặt.
- Định tuyến bằng hash (\`#/analytics\`) không thêm thư viện; tiêu đề tab và \`<meta name="description">\` đổi theo trang.
- Sẵn cho SEO cơ bản: \`description\`, Open Graph, \`theme-color\`, \`robots.txt\`.

## Cấu trúc

\`\`\`
src/
  App.tsx             # gốc: YugenProvider, định tuyến hash, lưu theme, tiêu đề trang
  AppShell.tsx        # khung: sidebar, thanh trên, Drawer, nội dung
  CommandPalette.tsx  # bảng lệnh Ctrl K
  pages.tsx           # danh sách trang — thêm một mục là có trang mới trên sidebar & bảng lệnh
  blocks/             # các block giao diện, sửa thoải mái
\`\`\`

## Tuỳ biến nhanh

- **Thêm trang**: thêm một mục vào \`PAGES\` trong \`src/pages.tsx\`.
- **Đổi thương hiệu mặc định**: sửa \`"sakura"\` trong \`index.html\` và \`App.tsx\`; tự tạo bảng màu ở
  [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer).
- **Dùng router thật** (React Router, TanStack Router): thay \`pageFromHash\` / \`navigate\` trong \`App.tsx\`, truyền \`href\` của
  router vào \`NavItem\` (\`asChild\`).

${generatedFrom(t)}
`,
  "ai-chat": (t) => `# ${t.appTitle ?? t.title}

An AI chat app from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Replies come from a local mock until you connect your own backend.

${install(t.dir, "en")}

## What's included

- Conversations: new, rename, delete, saved in \`localStorage\`. On narrow screens the list moves into a Drawer.
- Streaming answers: Markdown that renders as it arrives (\`StreamingMarkdown\`), a collapsible \`Reasoning\` block, the
  agent's steps in a \`Trace\`, and \`Citation\` chips with a list of sources.
- Stop a reply with the Stop button or Esc. Copy or regenerate an answer.
- \`PromptInput\` with attachments (button, drag and drop, paste). Enter sends, Shift+Enter adds a new line.
- Routes with the History API: \`/\` (new chat), \`/c/<id>\` (a conversation), \`/settings\`. Each page loads on demand.
- Light, dark and high-contrast themes and three brands, saved with no flash on reload.
- All text, mock replies included, lives in \`src/content/\`: English by default, Vietnamese with
  \`npx create-yugen-ui@latest my-app --template ai-chat --lang vi\`.

## Connect your backend

The chat calls one function: \`sendMessage(messages, { signal })\` in \`src/api.ts\`. It gets the conversation, oldest
message first, and returns the reply as an async iterable of chunks:

\`\`\`ts
type ChatChunk =
  | { type: "text"; text: string } // Markdown added to the answer
  | { type: "reasoning"; text: string } // shown in the Reasoning block
  | { type: "step"; id: string; title: string; status: TraceStatus } // adds or updates a Trace step
  | { type: "sources"; sources: CitationSource[] }; // for [1], [2] in the text
\`\`\`

\`signal\` aborts when the user stops the reply. If the iterable throws, the answer shows the error and a Try again
button. Only \`text\` is required; the other chunks are optional.

Model API keys must stay on a server. Add an endpoint there that streams one JSON chunk per line, then point
\`sendMessage\` at it with the helper in \`src/api.ts\`:

\`\`\`ts
export function sendMessage(messages: ChatMessage[], options: SendOptions) {
  return streamFromEndpoint("/api/chat", messages, options);
}
\`\`\`

The endpoint can use any model provider and any server that speaks the Web \`Request\` / \`Response\` API (Hono, Next.js
route handlers, Cloudflare Workers, Deno, Bun):

\`\`\`ts
// POST /api/chat → newline-delimited JSON, one ChatChunk per line
export async function POST(request: Request) {
  const { messages } = await request.json();
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (chunk: object) => controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\\n"));
      // Call your model here with the API key from the server's environment and forward its stream.
      for await (const text of streamFromYourModel(messages, request.signal)) send({ type: "text", text });
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "application/x-ndjson" } });
}
\`\`\`

- In development, forward \`/api\` to that server with \`server.proxy\` in \`vite.config.ts\`.
- Attachments: each message has the files' \`name\`, \`size\` and \`type\`, plus \`file\` (the \`File\`) for messages
  sent in this session. JSON can't carry files: upload them first, for example with \`FormData\`, and send a reference.
- Settings > Backend > Fail replies makes the mock throw, so you can check the error state.

## Deploy

\`npm run build\` and upload \`dist/\` to any static host. The app uses real paths such as \`/c/<id>\`, so the host must
answer unknown paths with \`index.html\`: on Netlify add \`/* /index.html 200\` to \`public/_redirects\`, on Vercel add a
rewrite to \`/index.html\`, on GitHub Pages copy \`dist/index.html\` to \`dist/404.html\`. Under a sub-path, build with
\`npx vite build --base=/my-app/\`.

## Structure

\`\`\`
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
\`\`\`

${generatedFrom(t)}
`,
};

const readme = (t) =>
  t.app
    ? README[t.app](t)
    : `# ${t.appTitle ?? t.title}

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — Vite + React + Tailwind CSS v4.

${install(t.dir)}

File trong \`src/blocks/\` sinh từ \`src/docs/block-library\` bằng \`scripts/sync-templates.mjs\` — sửa thoải mái trong dự án của bạn.
`;

const ALIAS_CONFIG = `
  // import { Foo } from "@/components/Foo" thay cho đường dẫn tương đối dài (khai báo cả trong tsconfig.json).
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },`;

function files(t) {
  const { sources, blocks } = t.app ? appSources(t.app) : { sources: {}, blocks: t.blocks };
  const blockFiles = Object.fromEntries(blocks.map((b) => [blockTarget(b), toYugen(read(path.join(BLOCK_DIR, b)))]));
  const appFiles = Object.fromEntries(Object.entries(sources).map(([rel, code]) => [rel, toYugen(code)]));
  const jpChars = [...new Set(Object.values(sources).join("").match(/[\u3040-\u30ff\u3400-\u9fff]/g) ?? [])].sort().join("");
  return {
    "package.json":
      JSON.stringify(
        {
          name: t.dir,
          private: true,
          type: "module",
          scripts: { dev: "vite", build: "tsc -b && vite build", preview: "vite preview" },
          dependencies: {
            "@fluentui/react-icons": pkg.dependencies["@fluentui/react-icons"],
            // React và type theo devDependencies ở gốc repo (cùng bản mà docs và test chạy).
            react: pkg.devDependencies.react,
            "react-dom": pkg.devDependencies["react-dom"],
            "yugen-ui": `^${pkg.version}`,
          },
          devDependencies: {
            "@tailwindcss/vite": "^4.0.0",
            "@types/react": pkg.devDependencies["@types/react"],
            "@types/react-dom": pkg.devDependencies["@types/react-dom"],
            // Bundler và TypeScript theo devDependencies ở gốc repo (cùng bản docs build và typecheck).
            "@vitejs/plugin-react": pkg.devDependencies["@vitejs/plugin-react"],
            tailwindcss: "^4.0.0",
            typescript: pkg.devDependencies.typescript,
            vite: pkg.devDependencies.vite,
            ...t.devDependencies,
          },
        },
        null,
        2,
      ) + "\n",
    "index.html": indexHtml({ ...t, jpChars }),
    "vite.config.ts": `${t.alias ? 'import path from "node:path";\n' : ""}import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],${t.alias ? ALIAS_CONFIG : ""}
  build: {
    rolldownOptions: {
      output: {
        // Tách thư viện khỏi mã ứng dụng: sửa trang chỉ làm đổi chunk nhỏ, phần còn lại trình duyệt giữ cache.
        // Icon Fluent để chung vendor: tách riêng tạo vòng import vendor ↔ icons (lỗi TDZ lúc chạy).
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\\\/]node_modules[\\\\/](react|react-dom|scheduler)[\\\\/]/, priority: 20 },
            { name: "vendor", test: /[\\\\/]node_modules[\\\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
`,
    "tsconfig.json":
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            module: "ESNext",
            moduleResolution: "Bundler",
            jsx: "react-jsx",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            // Import có đuôi .ts: config của Vite nạp kiểu native (không bundle) cần đường dẫn đầy đủ.
            allowImportingTsExtensions: true,
            types: ["vite/client"],
            // Không có baseUrl (TypeScript 6 báo deprecated): paths tính theo vị trí tsconfig.json.
            ...(t.alias ? { paths: { "@/*": ["./src/*"] } } : {}),
          },
          include: ["src"],
        },
        null,
        2,
      ) + "\n",
    ".gitignore": "node_modules\ndist\n*.local\n",
    "public/favicon.svg": read(path.join(root, "public/favicon.svg")),
    "public/robots.txt": "User-agent: *\nAllow: /\n",
    "src/index.css": `@import "tailwindcss";\n@import "yugen-ui/theme.css";\n`,
    "src/main.tsx": t.app ? appMain : blocksMain(blocks),
    "README.md": readme(t),
    // vite.config.ts riêng của app (nếu có) ghi đè bản mặc định ở trên.
    ...appFiles,
    ...blockFiles,
  };
}

/** Danh mục cho `yugen create` (packages/cli đóng gói templates/ kèm file này). */
const manifest = TEMPLATES.map(({ dir, title, hint }) => ({ dir, name: dir.replace(/^vite-/, ""), title, hint }));
const outputs = [
  ...TEMPLATES.flatMap((t) => Object.entries(files(t)).map(([rel, content]) => [`${t.dir}/${rel}`, content])),
  ["templates.json", JSON.stringify(manifest, null, 2) + "\n"],
];

let drift = 0;
for (const [rel, content] of outputs) {
  const file = path.join(root, "templates", rel);
  const same = fs.existsSync(file) && read(file) === content;
  if (check) {
    if (!same) {
      drift++;
      console.error(`✗ templates/${rel} lệch — chạy: node scripts/sync-templates.mjs`);
    }
    continue;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
if (check && drift) process.exit(1);
console.log(check ? "sync-templates: OK" : `sync-templates: đã ghi ${TEMPLATES.map((t) => `templates/${t.dir}`).join(", ")}`);
