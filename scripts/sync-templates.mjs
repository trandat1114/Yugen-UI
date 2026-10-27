#!/usr/bin/env node
/**
 * Sinh starter template trong templates/ từ mã có sẵn trên docs, đổi import "@/components/ui" → "yugen-ui":
 *   - blocks: các block trong src/docs/block-library xếp dọc trong main.tsx
 *   - app:    một ứng dụng đầy đủ trong src/docs/template-library/<app>/ (App.tsx là gốc) — block nó import được chép kèm.
 *             Mọi file (kể cả thư mục con như posts/*.md, ảnh như photos/*.avif) vào src/, trừ vite.config.ts → gốc
 *             template (import "./x" → "./src/x"). Ảnh được chép nguyên byte.
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
    /** Tiêu đề và mô tả của index.html khi tạo bằng `--lang vi` (CLI ghi đè lúc tạo app). */
    vi: { appTitle: "Ứng dụng của tôi", description: "Dự án React + Tailwind CSS v4 trống với Yugen UI: theme được lưu, toast và alias @/." },
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
    /** Tiêu đề và mô tả của index.html khi tạo bằng `--lang vi` (CLI ghi đè lúc tạo app). */
    vi: { appTitle: "Sakura Studio", description: "Ứng dụng SaaS dựng bằng Yugen UI: sidebar, bảng lệnh Ctrl K, thông báo, theme sáng / tối / tương phản cao và 8 trang mẫu." },
    hint: "SaaS workspace: sidebar, Ctrl K command palette, notifications, 8 pages",
    title: "SaaS",
    appTitle: "Sakura Studio",
    description:
      "A SaaS app built with Yugen UI: sidebar, Ctrl K command palette, notifications, light / dark / high-contrast themes and 8 sample pages.",
    lang: "en",
    app: "saas",
    /** Route là đường dẫn thật, app một trang: kèm _redirects, vercel.json, build:gh-pages và mục Deploy (#150). */
    spa: true,
    /** Khoá localStorage của script chống nháy — trùng STORAGE_KEY trong App.tsx. */
    storageKey: "yugen-saas-appearance",
  },
  {
    dir: "vite-blog",
    /** Tiêu đề và mô tả của index.html khi tạo bằng `--lang vi` (CLI ghi đè lúc tạo app). */
    vi: { appTitle: "Nhật ký Sakura", description: "Blog viết bằng Markdown, dựng bằng Yugen UI: mục lục, thẻ, tìm kiếm, theme tối và SEO sinh sẵn lúc build." },
    hint: "Markdown blog: table of contents, tags, search, build-time SEO",
    title: "Blog",
    appTitle: "Sakura Notes",
    description: "A Markdown blog built with Yugen UI: table of contents, tags, search, dark theme and SEO generated at build time.",
    lang: "en",
    app: "blog",
    storageKey: "yugen-blog-theme",
    devDependencies: { "@types/node": "^22.0.0" },
    /** vite.config.ts của app thay khối <!-- seo --> … <!-- /seo --> trong index.html cho từng trang khi build. */
    seoPlugin: true,
  },
  {
    dir: "vite-dashboard",
    /** Tiêu đề và mô tả của index.html khi tạo bằng `--lang vi` (CLI ghi đè lúc tạo app). */
    vi: { appTitle: "Sakura Analytics", description: "Dashboard bán hàng dựng bằng Yugen UI: một khoảng ngày cho mọi biểu đồ, KPI, bảng khách hàng và API giả lập." },
    hint: "Sales dashboard: date range, KPIs, charts, customer table with CSV export, 4 pages",
    title: "Dashboard",
    appTitle: "Sakura Analytics",
    description: "A sales dashboard built with Yugen UI: one date range for every chart, KPIs, a customer table and a mock API.",
    lang: "en",
    app: "dashboard",
    spa: true,
    storageKey: "yugen-dashboard-appearance",
  },
  {
    dir: "vite-ai-chat",
    /** Tiêu đề và mô tả của index.html khi tạo bằng `--lang vi` (CLI ghi đè lúc tạo app). */
    vi: { appTitle: "Sakura Chat", description: "Ứng dụng chat AI dựng bằng Yugen UI: danh sách hội thoại, trả lời dạng stream dừng được, nối backend của bạn." },
    hint: "AI chat: saved conversations, streaming answers you can stop, one backend adapter",
    title: "AI chat",
    appTitle: "Sakura Chat",
    description:
      "An AI chat app built with Yugen UI: saved conversations, streaming Markdown answers with reasoning, steps and sources, and one adapter for your backend.",
    lang: "en",
    app: "ai-chat",
    spa: true,
    storageKey: "yugen-ai-chat-appearance",
  },
  {
    dir: "vite-glass",
    vi: {
      appTitle: "Sakura Journeys",
      description: "Nhật ký du lịch dựng bằng Yugen UI: ảnh tràn viền, sidebar, thanh tab và menu glass nổi trên ảnh, nền đặc khi giảm trong suốt.",
    },
    hint: "Travel journal: full-bleed photos with glass navigation (Yugen Labs)",
    title: "Glass",
    appTitle: "Sakura Journeys",
    description:
      "A travel journal built with Yugen UI: full-bleed photos with a glass sidebar, tab bar, toolbars and sheets floating above them, opaque when transparency is reduced.",
    lang: "en",
    app: "glass",
    spa: true,
    storageKey: "yugen-glass-appearance",
  },
  {
    dir: "vite-landing",
    vi: {
      appTitle: "Sakura Notes",
      description: "Trang giới thiệu sản phẩm dựng bằng Yugen UI: bảng giá theo tháng / năm, hỏi đáp, form đăng ký và SEO sinh sẵn lúc build.",
    },
    hint: "Product landing page: pricing, FAQ, sign-up form, build-time SEO, Lighthouse 95+",
    title: "Landing",
    appTitle: "Sakura Notes",
    description:
      "A product landing page built with Yugen UI: pricing with a monthly / yearly switch, FAQ, a sign-up form and SEO generated at build time.",
    lang: "en",
    app: "landing",
    storageKey: "yugen-landing-appearance",
    devDependencies: { "@types/node": "^22.0.0" },
    /**
     * vite.config.ts của app thay khối <!-- seo --> … <!-- /seo --> trong index.html bằng thẻ lấy từ content/, và sau khi
     * build thì render màn hình đầu vào <div id="root"> (src/main.tsx của app hydrate nó).
     */
    seoPlugin: true,
  },
  {
    dir: "vite-admin",
    vi: {
      appTitle: "Sakura Admin",
      description: "Trang quản trị dựng bằng Yugen UI: bảng khách hàng phân trang trên server, sửa trong Drawer có kiểm tra, cập nhật lạc quan, đăng nhập có mã OTP.",
    },
    hint: "Admin / CRUD: server-paged DataGrid, drawer forms, optimistic updates, sign-in with OTP",
    title: "Admin",
    appTitle: "Sakura Admin",
    description:
      "An admin app built with Yugen UI: a server-paged customer DataGrid, create and edit in a validated drawer, optimistic updates that roll back, and sign-in with a one-time code.",
    lang: "en",
    app: "admin",
    spa: true,
    storageKey: "yugen-admin-appearance",
    /** Form validation (src/validation.ts). Not @hookform/resolvers: its optional peers break `npm install` on npm 11. */
    dependencies: { "react-hook-form": pkg.devDependencies["react-hook-form"], zod: pkg.devDependencies.zod },
  },
  {
    dir: "next-starter",
    vi: {
      appTitle: "Ứng dụng của tôi",
      description: "Dự án Next.js App Router với Yugen UI: theme lưu trong cookie để server render đúng, metadata theo trang, next/font.",
    },
    hint: "Next.js App Router: theme in a cookie (no flash), metadata per page, next/font",
    title: "Next.js starter",
    appTitle: "My app",
    description: "A Next.js App Router project with Yugen UI: theme in a cookie so the server renders it, metadata per page, next/font.",
    lang: "en",
    app: "next-starter",
    /** Next.js App Router thay cho Vite (#153): xem nextFiles(). Không có bản xem trước nhúng trong docs. */
    framework: "next",
  },
];

const BLOCK_DIR = path.join(root, "src/docs/block-library");
const APP_DIR = path.join(root, "src/docs/template-library");
const BLOCK_IMPORT = /(["'])@\/docs\/block-library\/(?:\d+-)?([\w-]+?)(?:\.tsx)?\1/g;

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
/** Ảnh của template app: chép nguyên byte (Buffer), không qua toYugen. */
const ASSET = /\.(avif|webp|png|jpe?g|svg)$/;
const isText = (content) => typeof content === "string";
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
      .filter((f) => (/\.(tsx?|md|css)$/.test(f) || ASSET.test(f)) && !/\.test\.tsx?$/.test(f))
      .sort()
      .map((f) =>
        f === "vite.config.ts"
          ? [f, read(path.join(dir, f)).replace(/from "\.\/(?!src\/)/g, 'from "./src/')]
          : [`src/${f}`, ASSET.test(f) ? fs.readFileSync(path.join(dir, f)) : read(path.join(dir, f))],
      ),
  );
  const blockNames = new Set(
    Object.values(sources)
      .filter(isText)
      .flatMap((code) => [...code.matchAll(BLOCK_IMPORT)].map((m) => m[2])),
  );
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

/** Mục "Deploy" của template SPA: route là đường dẫn thật, nên host phải trả app cho đường dẫn lạ (#150). */
const deploy = () => `## Deploy

\`npm run build\` and upload \`dist/\` to a static host. Pages are real paths, so a deep link such as \`/settings\` must
get the app back from the host:

- **Netlify**: nothing to do, \`public/_redirects\` sends unknown paths to \`index.html\`.
- **Vercel**: nothing to do, \`vercel.json\` has the same rewrite.
- **Cloudflare Pages**: nothing to do, it serves the app for unknown paths when there is no \`404.html\`.
- **GitHub Pages**: \`npm run build:gh-pages\` also writes \`dist/404.html\`, which GitHub Pages serves for unknown
  paths. For a project site, add the repository name: \`npm run build:gh-pages -- --base=/my-repo/\`.

Under a sub-path on another host, build with \`npm run build -- --base=/my-app/\`.
`;

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

A Markdown blog built with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) on Vite, React and Tailwind CSS
v4. No CMS or Markdown library: add a \`.md\` file and the post is live.

${install(t.dir, "en")}

## What's included

- Posts are \`src/content/<lang>/posts/*.md\` files with frontmatter (\`title\`, \`description\`, \`date\`, \`tags\`,
  \`draft\`).
- Markdown goes through Yugen UI's safe parser: highlighted code with a copy button, tables, quotes, task lists, images and
  internal links.
- The home page has search and tag filters; a post page has a table of contents, reading time, previous / next post and a
  copy link button.
- Real paths (\`/posts/<slug>/\`) with the History API, no router library.
- **SEO at build time** (the \`blogSeo\` plugin in \`vite.config.ts\`): an HTML file per post and tag with \`<title>\`,
  \`description\`, canonical, Open Graph and \`BlogPosting\` JSON-LD, plus \`sitemap.xml\`, \`rss.xml\`, \`robots.txt\` and
  \`404.html\`.
- Light, dark and high-contrast themes, saved in \`localStorage\` with no flash on reload.
- English text and sample posts. For Vietnamese, create the app with
  \`npx create-yugen-ui@latest my-app --template blog --lang vi\`.

## Structure

\`\`\`
src/
  site.ts                 # your domain (SITE.url)
  content/<lang>.ts       # blog name, description, author and interface text
  content/<lang>/posts/   # posts: the file name is the URL
  content/index.ts        # the language in use (the app and the SEO plugin read it)
  blog.ts                 # frontmatter, reading time, page titles (shared with the SEO plugin)
  posts.ts                # loads the posts of the language in use
  Markdown.tsx            # Markdown to components, headings with ids for the table of contents
  BlogLayout.tsx          # top bar, content by route, footer
  PostList.tsx · PostPage.tsx · router.tsx
vite.config.ts            # blogSeo plugin: static HTML for every page, sitemap, RSS
\`\`\`

## Deploy

1. Set \`url\` in \`src/site.ts\` to your domain (the build warns while it is still \`example.com\`).
2. Run \`npm run build\` and upload \`dist/\` to any static host. For a subfolder (GitHub Pages):
   \`BASE=/repo-name/ npm run build\`.
3. Submit \`sitemap.xml\` to Google Search Console.

${generatedFrom(t)}
`,
  saas: (t) => `# ${t.appTitle ?? t.title}

A complete SaaS app built with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) on Vite, React and Tailwind
CSS v4, ready for your own data.

${install(t.dir, "en")}

## What's included

- A sidebar \`Nav\` with groups and counts; on narrow screens it becomes a \`Drawer\` (container queries, no JS measuring).
- A **Ctrl / ⌘ K** command palette: go to a page, switch theme or brand, quick actions.
- \`NotificationCenter\`, an account menu, a breadcrumb and an export button with a \`toast\`.
- Light, dark and high-contrast themes and the Sakura, Web and Teams brands, saved in \`localStorage\` with **no flash** on
  reload (a small script in \`index.html\`).
- 8 sample pages: Overview, Analytics, AI assistant, Inbox, Calendar, Team, Billing and Settings. Each page loads on
  demand; the others are fetched while the browser is idle.
- Real paths with the History API (\`/analytics\`, \`/settings\`), no extra library; old \`#/analytics\` links still open
  the right page. The tab title and \`<meta name="description">\` follow the page.
- SEO basics: \`description\`, Open Graph, \`theme-color\`, \`robots.txt\`.
- English text and sample data in \`src/content/\`. For Vietnamese, create the app with
  \`npx create-yugen-ui@latest my-app --template saas --lang vi\`.

## Structure

\`\`\`
src/
  App.tsx             # root: YugenProvider, routing, saved theme, page title
  routes.ts           # / · /<page>: path ⇄ page
  AppShell.tsx        # layout: sidebar, top bar, Drawer, content
  CommandPalette.tsx  # Ctrl K command palette
  pages.tsx           # page list: one entry per page in the sidebar and the command palette
  pages/              # one file per page, loaded on demand
  content/            # all text and sample data, one file per language; index.ts picks the language
  format.ts           # amounts in the content's currency and locale
\`\`\`

## Customize

- **Add a page**: create \`src/pages/<id>.tsx\`, add the id to \`PageId\` in \`src/content/types.ts\` and its text to
  \`pages\` in \`src/content/<lang>.ts\`, then add an entry to \`PAGES\` in \`src/pages.tsx\`.
- **Change the default brand**: replace \`"sakura"\` in \`index.html\` and \`App.tsx\`; make your own palette in
  [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer).
- **Use a router library** (React Router, TanStack Router): replace \`initialPage\` / \`navigate\` in \`App.tsx\` and
  pass the router's link to \`NavItem\` (\`asChild\`).

${deploy()}
${generatedFrom(t)}
`,
  dashboard: (t) => `# ${t.appTitle ?? t.title}

A [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) sales dashboard: Vite, React and Tailwind CSS v4, with
four pages and a mock API you replace with your own.

${install(t.dir, "en")}

## What's included

- Overview, Revenue, Customers and Settings. The sidebar becomes a \`Drawer\` on narrow screens (container queries).
- One date range for the whole app (\`DateRangePicker\` with presets). Every card and chart reloads when it changes.
- KPI \`StatTile\`s with the change against the previous period and a sparkline; \`LineChart\`, stacked and horizontal
  \`BarChart\`, \`DonutChart\`. Each chart has a data table view.
- A customer \`DataGrid\`: sorting, segment and status filters, search from the top bar, pagination and CSV export.
- Loading skeletons, empty and error states driven by \`src/api.ts\`. Settings has a response time slider and can make
  every response empty or failed.
- Pages load on demand (\`React.lazy\`); hovering a nav item starts the download. Real URLs (\`/revenue\`) through the
  History API, with the tab title per page.
- Light, dark and high-contrast themes and three brands, saved in \`localStorage\` with no flash on reload.
- English text in \`src/content/\`; Vietnamese with \`npx create-yugen-ui@latest my-app --template dashboard --lang vi\`.
  Built-in component strings follow through \`messagesEn\` and \`locale\` on \`YugenProvider\`.

## Connect your data

\`src/api.ts\` generates about 18 months of orders in the browser and answers after a short delay. Keep the
\`DashboardApi\` interface and return an object that calls your backend:

\`\`\`ts
const api: DashboardApi = {
  getKpis: (range, signal) => fetch(\`/api/kpis?\${query(range)}\`, { signal }).then((r) => r.json()),
  // getTimeseries, getBreakdown, getRecentOrders, getCustomers
};
\`\`\`

Create it in \`src/Dashboard.tsx\` instead of \`createMockApi\`, and delete the mock API card in \`src/pages/Settings.tsx\`.
\`useQuery\` (\`src/useQuery.ts\`) cancels stale requests; swap it for TanStack Query or SWR if you need caching.

${deploy()}
## Size

\`npm run build\` with yugen-ui 0.10, gzip: about 217 kB of JavaScript on first load (React 68 kB, other libraries
138 kB, app 10 kB) and 22 kB of CSS. Opening a page adds 1 to 4 kB.

## Structure

\`\`\`
src/
  App.tsx          # YugenProvider, saved theme, router
  Dashboard.tsx    # shell: sidebar, top bar, date range, lazy pages
  pages/           # Overview, Revenue, Customers, Settings
  api.ts           # mock data layer (replace with your backend)
  ui.tsx           # data cards, KPI tiles, number and date formats
  router.tsx       # History API router, Link
  content/         # all text, one file per language
  useQuery.ts · dates.ts · csv.ts · context.ts
\`\`\`

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

${deploy()}
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
  glass: (t) => `# ${t.appTitle ?? t.title}

A travel journal from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Photos fill the screen and the navigation floats above them in glass, a Yugen Labs material (names may change before
Yugen UI 1.0).

${install(t.dir, "en")}

## What's included

- Journal (\`/\`): an edge-to-edge photo under the floating bars, then the trips.
- Trip (\`/trips/<id>\`): a glass toolbar with grouped actions, a photo gallery, the story, and the details in a glass
  bottom sheet with snap points (inset from the edges, opaque at the top snap point).
- Explore (\`/explore\`): one full-screen picture with every trip as a pin, filters, zoom and a search field floating
  over it in clear glass, on a dimmed photo (\`glass-scrim\`).
- Settings (\`/settings\`): theme, brand, glass or solid bars, clear or regular controls over photos, photo credits.
- Navigation: a glass sidebar from 768px (an icon rail until 1024px); below that, a header and a tab bar that shrinks
  while you scroll down (\`useScrollMinimize\`). Breakpoints are container queries.
- Search in a glass dialog, from the sidebar, the header or the tab bar.
- All text lives in \`src/content/\`: English by default, Vietnamese with
  \`npx create-yugen-ui@latest my-app --template glass --lang vi\`.

## Glass and accessibility

Glass is opt-in per component: \`material="glass"\` on \`Toolbar\`, \`Nav\`, \`TabsList\`, \`MenuPopover\`,
\`PopoverSurface\`, \`DialogSurface\` and \`SheetContent\`, \`appearance="glass-prominent"\` on one \`Button\`, and the
\`glass\` utilities for your own bars. Text on glass keeps a 4.5:1 contrast over any photo. Reduce transparency, Increase
contrast, forced colors and the high-contrast theme make it opaque; the Solid setting shows that look. Use the clear
variant only over a photo dimmed with \`glass-scrim\`.

## Photos

Sample photos from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license), picked
from the [Lorem Picsum](https://picsum.photos) list, in AVIF at 640 and 1280px wide (\`src/photos/\`):
Yoni Kaplan-Nadel, Margaret Barley, Go Wild, Jeffrey Kam, Jerry Adney and Paul Jarvis. Replace them with your own in
\`src/photos.ts\`.

${deploy()}
## Structure

\`\`\`
src/
  App.tsx            # YugenProvider, saved appearance, router
  Layout.tsx         # glass sidebar / header / tab bar, search, the page for the route
  HomePage.tsx · TripPage.tsx · ExplorePage.tsx · SettingsPage.tsx · NotFoundPage.tsx
  SearchDialog.tsx   # glass dialog with live results
  trips.ts           # trips: photos, dates, pins (text is in content/)
  photos.ts          # photo imports and credits
  router.tsx         # / · /trips/<id> · /explore · /settings
  content/           # every string, one file per language
\`\`\`

${generatedFrom(t)}
`,
  landing: (t) => `# ${t.appTitle ?? t.title}

A product landing page from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS
v4. One fast page for a made-up notes app, ready for your own product.

${install(t.dir, "en")}

## What's included

- Hero with two calls to action, a product picture drawn in HTML (no image to download), a row of customer logos.
- Feature grid, pricing with a monthly / yearly switch, testimonials, FAQ (\`Accordion\`), sign-up section and footer.
- A sign-up form with Yugen \`Field\` components and a small validation function (no form library): messages after the
  first submit, focus on the first field to fix, a loading button and a success \`toast\`.
- **SEO at build time** (the \`landingSeo\` plugin in \`vite.config.ts\`): \`<title>\`, \`description\`, canonical, Open
  Graph and \`SoftwareApplication\` JSON-LD with one offer per plan, written into \`index.html\` from \`src/content/\`.
- **Static first screen**: the same plugin renders the header, hero and footer into \`index.html\`, so the page shows
  before any JavaScript runs. React loads after that first paint and attaches to the HTML (\`src/main.tsx\`); the
  sections below and the theme menu load next, one section per frame.
- Built for Lighthouse 95+ on mobile in all four categories (checked in this repo's CI): no web fonts, no images to
  wait for, no layout shift.
- Light, dark and high-contrast themes, saved in \`localStorage\` with no flash on reload.
- English text; Vietnamese (with prices in VND) with \`npx create-yugen-ui@latest my-app --template landing --lang vi\`.

## Make it yours

1. Text, plans and prices: \`src/content/<lang>.ts\`. The SEO tags and the JSON-LD offers follow them.
2. Your domain: \`url\` in \`src/site.ts\` (the build warns while it is still \`example.com\`).
3. The form: replace \`submitSignUp\` in \`src/signUp.ts\` with a call to your backend or form service.
4. The picture: swap \`<ProductShot />\` for a screenshot, an \`<img>\` with \`width\` and \`height\` so nothing moves while
   it loads.
5. The first screen is rendered at build time, so it must not depend on the visitor (saved theme, date, \`window\`):
   React would find different HTML when it attaches. Read those in an effect, or put that part below the fold.

## Deploy

\`npm run build\` and upload \`dist/\` to any static host. Under a sub-path (GitHub Pages project site):
\`npm run build -- --base=/my-repo/\`.

## Structure

\`\`\`
src/
  main.tsx · start.tsx   # paint the static HTML first, then load React and attach it
  App.tsx                # YugenProvider, saved theme
  LandingPage.tsx        # header, hero, footer; loads BelowTheFold and ThemeMenu after the first paint
  BelowTheFold.tsx       # Features · Pricing · Testimonials · Faq · SignUpSection, one per frame
  ProductShot.tsx        # the product picture in HTML
  Logos.tsx              # product mark and customer wordmarks (SVG)
  signUp.ts              # validateSignUp and submitSignUp
  seo.ts                 # head tags and JSON-LD, used by vite.config.ts
  site.ts                # your domain (SITE.url)
  content/               # every string and the plans, one file per language
vite.config.ts           # landingSeo plugin: head tags and the static first screen
\`\`\`

${generatedFrom(t)}
`,
  admin: (t) => `# ${t.appTitle ?? t.title}

An admin app from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Customers and their orders, the screens most back offices start with, on a mock API you replace with your own.

${install(t.dir, "en")}

## What's included

- Customers (\`/customers\`): a \`DataGrid\` paged, sorted and filtered by the server (one page plus the total per
  request), search, status and plan filters, a column picker (\`DataGridColumnPicker\`), and row selection with bulk
  export to CSV and bulk delete.
- Create and edit in a \`Drawer\`, validated with react-hook-form and zod (\`src/validation.ts\`); delete after a
  confirm \`Dialog\`.
- Optimistic updates (\`useOptimisticList\`): changes show at once, a toast confirms them, and a failed request puts
  the list back as it was, with a Retry button.
- Customer page (\`/customers/<id>\`) with the details and the customer's orders; Orders (\`/orders\`), read-only.
- Sign in, forgot password and a one-time code step (\`InputOTP\`). Pages other than these need a session: without
  one you land on the sign-in page and come back to the page you asked for.
- Settings: theme, brand, the mock API's response time and a switch for random errors.
- Pages load on demand (\`React.lazy\`), with real URLs and the tab title per page. Light, dark and high-contrast
  themes, saved with no flash on reload. English text in \`src/content/\`; Vietnamese with
  \`npx create-yugen-ui@latest my-app --template admin --lang vi\`.

## Demo account

The first visit in a tab starts signed in, so the app opens on its data. Sign out (avatar menu or Settings) to try
the sign-in flow with \`admin@sakura.dev\` / \`sakura-admin\` and the code \`246810\`. The session lives in
\`sessionStorage\`. To turn off the automatic sign-in, set \`DEMO_AUTO_SIGN_IN\` to \`false\` in \`src/auth.tsx\`.

## Connect your back end

\`src/api.ts\` generates 120 customers and their orders in the browser and answers after a short delay; with random
errors on, about one save or delete in five fails. Keep the \`AdminApi\` interface and return an object that calls
your server:

\`\`\`ts
const api: AdminApi = {
  listCustomers: (query, signal) => fetch(\`/api/customers?\${toParams(query)}\`, { signal }).then((r) => r.json()),
  updateCustomer: (id, input) => fetch(\`/api/customers/\${id}\`, { method: "PUT", body: JSON.stringify(input) }).then((r) => r.json()),
  // getCustomer, createCustomer, deleteCustomers, listOrders, signIn, verifyCode, requestPasswordReset
};
\`\`\`

Create it in \`src/App.tsx\` instead of \`createMockApi\`, then delete the mock API card in
\`src/pages/SettingsPage.tsx\` and the demo account notes on the sign-in pages. List calls take a page, a page size,
a sort and the filters, and return \`{ rows, total }\`. Reject with an error when a request fails: the optimistic
update rolls back on its own.

Validation uses a small zod resolver in \`src/validation.ts\` instead of \`@hookform/resolvers\`, whose optional
peer dependencies make \`npm install\` fail on npm 11. You can switch to it once that is fixed.

${deploy()}
## Structure

\`\`\`
src/
  App.tsx              # YugenProvider, saved appearance, mock API, session, router
  Layout.tsx           # top bar, sidebar, sign-in redirect, lazy pages
  pages/               # Customers, Customer, Orders, Settings, SignIn, Verify, ForgotPassword, NotFound
  CustomerDrawer.tsx   # create / edit drawer and the delete dialog
  CustomerForm.tsx     # the form (react-hook-form + zod), loaded when a drawer opens
  OrderList.tsx        # paged orders, for /orders and the customer page
  api.ts               # mock back end (replace with yours)
  auth.tsx             # session in sessionStorage, demo sign-in
  validation.ts        # zod schemas and the resolver
  router.tsx           # History API router, Link, next= after sign-in
  content/             # every string, one file per language
  ui.tsx · useQuery.ts · csv.ts · context.ts · appearance.ts
\`\`\`

${generatedFrom(t)}
`,
};

README["next-starter"] = (t) => `# ${t.appTitle ?? t.title}

A [Next.js](https://nextjs.org) App Router project with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates)
and Tailwind CSS v4.

${install(t.dir, "en")}

## What's included

- \`YugenProvider\` in one Client Component (\`src/app/providers.tsx\`), wrapped around the app in \`src/app/layout.tsx\`.
- The theme and brand live in cookies. The root layout reads them and writes \`data-theme\` / \`data-brand\` on \`<html>\`,
  so the first HTML is already in the right theme, with no flash. On a first visit, a tiny script picks light or dark
  from the OS before the first paint. Reading cookies renders pages per request; for a fully static site, drop the
  cookies and keep only the script.
- \`src/app/page.tsx\` is a Server Component that renders Yugen components (no \`"use client"\`): their props are text and
  elements. \`src/components/AppearanceForm.tsx\` is a Client Component because it has state and event handlers.
- Fluent icons run style code when they load, so Server Components import them from \`src/components/icons.ts\` (a
  \`"use client"\` file that re-exports the ones you use), not from \`@fluentui/react-icons\` directly.
- \`metadata\` per page with a title template, \`next/font\` (Noto Sans, self-hosted, Vietnamese glyphs) as Yugen's base
  font in \`src/app/globals.css\`, a not-found page and a skip link.
- All text in \`src/content/\`: English by default, Vietnamese with
  \`npx create-yugen-ui@latest my-app --template next-starter --lang vi\`.

## Structure

\`\`\`
src/
  app/
    layout.tsx        # <html> with the saved theme, metadata, next/font, header
    providers.tsx     # "use client": YugenProvider, theme and brand state, cookies
    page.tsx          # Server Component home page
    settings/page.tsx # Server Component page with a Client Component form
    not-found.tsx
    globals.css       # Tailwind + yugen-ui/theme.css, base font
  components/         # SiteHeader (server), NavLinks and AppearanceForm (client)
  appearance.ts       # cookie names and the first-visit script
  content/            # every string, one file per language
\`\`\`

## Deploy

\`npm run build\` then \`npm start\` on any Node host, or push to Vercel. The pages read cookies, so they render on the
server; a static export (\`output: "export"\`) needs the cookies removed first.

${generatedFrom(t)}
`;

const readme = (t) =>
  t.app
    ? README[t.app](t)
    : `# ${t.appTitle ?? t.title}

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) — Vite + React + Tailwind CSS v4.

${install(t.dir)}

File trong \`src/blocks/\` sinh từ \`src/docs/block-library\` bằng \`scripts/sync-templates.mjs\` — sửa thoải mái trong dự án của bạn.
`;

/** Plugin trong vite.config.ts của template SPA: `npm run build:gh-pages` chép index.html thành 404.html (#150). */
const GH_PAGES_PLUGIN = `
/**
 * \`npm run build:gh-pages\` (mode gh-pages): GitHub Pages answers unknown paths with 404.html, so the app is copied
 * there too and a deep link such as /settings opens the right page. Other hosts: see Deploy in README.md.
 */
function githubPagesFallback(): Plugin {
  let outDir = "dist";
  let enabled = false;
  return {
    name: "github-pages-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      enabled = config.mode === "gh-pages";
    },
    closeBundle() {
      if (enabled) fs.copyFileSync(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
    },
  };
}
`;

const ALIAS_CONFIG = `
  // import { Foo } from "@/components/Foo" thay cho đường dẫn tương đối dài (khai báo cả trong tsconfig.json).
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },`;

/** Next.js cho template Next (#153): cùng dòng với bản Vercel đang dùng. */
const NEXT_VERSION = "^16.4.3";

/** Template Next.js App Router (#153): Tailwind qua PostCSS, mã từ template-library/<app>/ vào src/ (src/app/…). */
function nextFiles(t, appFiles) {
  return {
    "package.json":
      JSON.stringify(
        {
          name: t.dir,
          private: true,
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: {
            "@fluentui/react-icons": pkg.dependencies["@fluentui/react-icons"],
            next: NEXT_VERSION,
            react: pkg.devDependencies.react,
            "react-dom": pkg.devDependencies["react-dom"],
            "yugen-ui": `^${pkg.version}`,
          },
          devDependencies: {
            "@tailwindcss/postcss": "^4.0.0",
            "@types/node": "^22.0.0",
            "@types/react": pkg.devDependencies["@types/react"],
            "@types/react-dom": pkg.devDependencies["@types/react-dom"],
            tailwindcss: "^4.0.0",
            typescript: pkg.devDependencies.typescript,
          },
        },
        null,
        2,
      ) + "\n",
    "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`,
    "postcss.config.mjs": `// Tailwind CSS v4 runs through PostCSS in Next.js.
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
`,
    "tsconfig.json":
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: false,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "react-jsx",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./src/*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2,
      ) + "\n",
    ".gitignore": "node_modules\n.next\nout\nnext-env.d.ts\n*.tsbuildinfo\n*.local\n",
    "public/favicon.svg": read(path.join(root, "public/favicon.svg")),
    "public/robots.txt": "User-agent: *\nAllow: /\n",
    "README.md": readme(t),
    ...appFiles,
  };
}

function files(t) {
  const { sources, blocks } = t.app ? appSources(t.app) : { sources: {}, blocks: t.blocks };
  const blockFiles = Object.fromEntries(blocks.map((b) => [blockTarget(b), toYugen(read(path.join(BLOCK_DIR, b)))]));
  const appFiles = Object.fromEntries(Object.entries(sources).map(([rel, code]) => [rel, isText(code) ? toYugen(code) : code]));
  if (t.framework === "next") return nextFiles(t, appFiles);
  const jpChars = [...new Set(Object.values(sources).filter(isText).join("").match(/[\u3040-\u30ff\u3400-\u9fff]/g) ?? [])].sort().join("");
  return {
    "package.json":
      JSON.stringify(
        {
          name: t.dir,
          private: true,
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc -b && vite build",
            ...(t.spa && { "build:gh-pages": "tsc -b && vite build --mode gh-pages" }),
            preview: "vite preview",
          },
          // `t.dependencies`: thư viện runtime riêng của template (vd. admin: react-hook-form, zod), xếp theo tên như npm.
          dependencies: Object.fromEntries(
            Object.entries({
              "@fluentui/react-icons": pkg.dependencies["@fluentui/react-icons"],
              // React và type theo devDependencies ở gốc repo (cùng bản mà docs và test chạy).
              react: pkg.devDependencies.react,
              "react-dom": pkg.devDependencies["react-dom"],
              "yugen-ui": `^${pkg.version}`,
              ...t.dependencies,
            }).sort(([a], [b]) => (a < b ? -1 : 1)),
          ),
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
    "vite.config.ts": `${t.spa ? 'import fs from "node:fs";\n' : ""}${t.alias || t.spa ? 'import path from "node:path";\n' : ""}import { defineConfig${t.spa ? ", type Plugin" : ""} } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
${t.spa ? GH_PAGES_PLUGIN : ""}
export default defineConfig({
  plugins: [react(), tailwindcss()${t.spa ? ", githubPagesFallback()" : ""}],${t.alias ? ALIAS_CONFIG : ""}
  build: {
    rolldownOptions: {
      output: {
        // React (trang nào cũng cần) tách riêng để trình duyệt giữ cache khi mã ứng dụng đổi. Không gom mọi node_modules vào
        // một chunk "vendor": yugen-ui được build theo từng component, để Rolldown tự chia thì trang nạp lười chỉ tải
        // component của chính nó (lần tải đầu của SaaS giảm ~27%).
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\\\/]node_modules[\\\\/](react|react-dom|scheduler)[\\\\/]/ },
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
    ...(t.spa && {
      "public/_redirects": "# Netlify: unknown paths get the app (real files still win). See Deploy in README.md.\n/*    /index.html   200\n",
      "vercel.json": JSON.stringify({ rewrites: [{ source: "/(.*)", destination: "/index.html" }] }, null, 2) + "\n",
    }),
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
/**
 * Ngân sách lần tải đầu (kB gzip) — CI job "Templates" (scripts/check-template.mjs) báo lỗi khi vượt. JS = <script type=module>
 * + modulepreload trong dist/index.html (trang lazy không tính). Tăng có chủ đích: sửa ở đây và ghi lý do trong PR.
 */
const BUDGETS = {
  "vite-starter": { js: 135, css: 25 },
  // SaaS, Blog: +messagesEn (chuỗi tiếng Anh của mọi component, ~13–17 kB gzip) khi có hai ngôn ngữ (#147); thư mục
  // templates/vite-blog còn chứa bài mẫu của cả hai ngôn ngữ (~1,7 kB, `create --lang` chỉ giữ một).
  "vite-saas": { js: 190, css: 25 },
  "vite-blog": { js: 150, css: 25 },
  "vite-dashboard": { js: 195, css: 25 },
  "vite-ai-chat": { js: 175, css: 25 },
  "vite-glass": { js: 160, css: 26 },
  // Landing: index.html đã có màn hình đầu (prerender), JS đầu chỉ là main.tsx; React và app (~150 kB) nạp sau lần vẽ đầu.
  "vite-landing": { js: 2, css: 27 },
  "vite-admin": { js: 167, css: 26 },
  // Next.js: react-dom + runtime của Next ~157 kB trước cả mã của app.
  "next-starter": { js: 265, css: 27 },
};

// `meta`: <title> / description của index.html theo từng ngôn ngữ — `create --lang` (packages/cli applyLang) ghi đè.
const manifest = TEMPLATES.map((t) => ({
  dir: t.dir,
  name: t.dir.replace(/^vite-/, ""),
  title: t.title,
  hint: t.hint,
  budget: BUDGETS[t.dir],
  ...(t.vi && {
    meta: {
      [t.lang ?? "vi"]: { title: t.appTitle ?? t.title, description: t.description },
      vi: { title: t.vi.appTitle ?? t.appTitle ?? t.title, description: t.vi.description },
    },
  }),
}));
const outputs = [
  ...TEMPLATES.flatMap((t) => Object.entries(files(t)).map(([rel, content]) => [`${t.dir}/${rel}`, content])),
  ["templates.json", JSON.stringify(manifest, null, 2) + "\n"],
];

let drift = 0;
for (const [rel, content] of outputs) {
  const file = path.join(root, "templates", rel);
  const same = fs.existsSync(file) && (isText(content) ? read(file) === content : fs.readFileSync(file).equals(content));
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
