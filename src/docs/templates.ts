import { SITE } from "./site";

/** Starter template trong templates/ (sinh bởi scripts/sync-templates.mjs — giữ khớp danh sách TEMPLATES ở đó). */
export interface TemplateInfo {
  dir: string;
  name: string;
  /** Tag trên thẻ: chuỗi giữ nguyên ở mọi ngôn ngữ (tên công nghệ) hoặc { vi, en }. */
  tags: (string | { vi: string; en: string })[];
  /** Template nổi bật: preview lớn ở đầu trang. */
  featured?: boolean;
  /** Đường dẫn hiện trên thanh địa chỉ giả của khung preview. */
  previewPath?: string;
  vi: { description: string; features: string[] };
  en: { description: string; features: string[] };
}

export const TEMPLATES: TemplateInfo[] = [
  {
    dir: "vite-starter",
    name: "Starter",
    tags: ["Vite", "React 19", "Tailwind v4", { vi: "Trang trắng", en: "Blank" }],
    featured: true,
    vi: {
      description:
        "Dự án trống, cấu hình sẵn sàng: theme, toast, alias @/ và SEO cơ bản.",
      features: [
        "Theme sáng / tối / tương phản cao, thương hiệu Sakura và Web, ghi nhớ, không nháy khi tải",
        "YugenProvider bọc sẵn: toast(), Tooltip, focus ring, RTL",
        "Alias @/ → src cho mã của bạn (vite.config + tsconfig)",
        "SEO cơ bản: description, Open Graph, theme-color, favicon, robots.txt",
        "Trang chào ngắn bằng tiếng Anh (tiếng Việt với --lang vi), chữ trong src/content/",
        "Font Mincho chỉ tải đúng các ký tự Nhật dùng trong trang (vài kB)",
      ],
    },
    en: {
      description:
        "A blank project, ready to go: theme, toast, @/ alias and SEO basics.",
      features: [
        "Light / dark / high contrast, Sakura and Web brands, persisted with no flash on load",
        "YugenProvider in place: toast(), Tooltip, focus rings, RTL",
        "@/ → src alias for your code (vite.config + tsconfig)",
        "SEO basics: description, Open Graph, theme-color, favicon, robots.txt",
        "A short English welcome page (Vietnamese with --lang vi), text in src/content/",
        "The Mincho font loads only the Japanese glyphs the page uses (a few kB)",
      ],
    },
  },
  {
    dir: "vite-saas",
    name: "SaaS",
    tags: ["Vite", "React 19", "Tailwind v4", { vi: "8 trang", en: "8 pages" }],
    featured: true,
    previewPath: "/",
    vi: {
      description:
        "Ứng dụng SaaS 8 trang: sidebar, bảng lệnh Ctrl K, thông báo và menu tài khoản.",
      features: [
        "Sidebar Nav → Drawer trên màn hẹp (container query)",
        "Bảng lệnh Ctrl / ⌘ K: chuyển trang, đổi theme, hành động nhanh",
        "Sáng / tối / tương phản cao + 3 thương hiệu, lưu lại, không nháy khi tải",
        "Đường dẫn thật (/analytics), tiêu đề & meta description theo trang; mỗi trang nạp lười",
        "SEO cơ bản: description, Open Graph, theme-color, robots.txt",
        "Chữ và dữ liệu mẫu bằng tiếng Anh (tiếng Việt với --lang vi), nằm trong src/content/",
      ],
    },
    en: {
      description:
        "An 8-page SaaS app: sidebar, Ctrl K command palette, notifications and account menu.",
      features: [
        "Sidebar Nav → Drawer on narrow screens (container queries)",
        "Ctrl / ⌘ K command palette: navigate, switch theme, quick actions",
        "Light / dark / high contrast + 3 brands, persisted with no flash on load",
        "Real paths (/analytics), per-page title & meta description; every page loads on demand",
        "SEO basics: description, Open Graph, theme-color, robots.txt",
        "English text and sample data (Vietnamese with --lang vi), kept in src/content/",
      ],
    },
  },
  {
    dir: "vite-blog",
    name: "Blog",
    tags: ["Vite", "Markdown", "SEO"],
    featured: true,
    vi: {
      description:
        "Blog viết bằng Markdown: tìm kiếm, thẻ, mục lục và SEO sinh sẵn cho từng bài.",
      features: [
        "Thêm file src/content/<lang>/posts/*.md là có bài (frontmatter: title, date, tags, draft)",
        "Parser an toàn của Yugen UI: code tô màu, bảng, trích dẫn, ảnh, link nội bộ",
        "URL thật /posts/<slug>/ bằng History API, không thêm router",
        "Mỗi bài một file HTML: title, description, canonical, Open Graph, JSON-LD",
        "Tự sinh sitemap.xml, rss.xml, robots.txt, 404.html; chạy trên mọi host tĩnh",
        "Theme sáng / tối / tương phản cao, không nháy khi tải",
        "Chữ và bài mẫu bằng tiếng Anh (tiếng Việt với --lang vi); SEO, RSS theo ngôn ngữ đó",
      ],
    },
    en: {
      description:
        "A Markdown blog: search, tags, table of contents and build-time SEO for every post.",
      features: [
        "Add src/content/<lang>/posts/*.md to publish (frontmatter: title, date, tags, draft)",
        "Yugen UI's safe parser: highlighted code, tables, quotes, images, internal links",
        "Real URLs /posts/<slug>/ via the History API, no router library",
        "One HTML file per post: title, description, canonical, Open Graph, JSON-LD",
        "Generates sitemap.xml, rss.xml, robots.txt and 404.html; runs on any static host",
        "Light / dark / high contrast, no flash on load",
        "English text and sample posts (Vietnamese with --lang vi); SEO and RSS follow that language",
      ],
    },
  },
  {
    dir: "vite-dashboard",
    name: "Dashboard",
    tags: ["Vite", "React 19", "Charts", { vi: "4 trang", en: "4 pages" }],
    previewPath: "/",
    vi: {
      description: "Dashboard bán hàng 4 trang: KPI, biểu đồ và bảng khách hàng, dữ liệu từ API giả lập có độ trễ.",
      features: [
        "Tổng quan, Doanh thu, Khách hàng, Cài đặt; sidebar → Drawer trên màn hẹp",
        "Một khoảng ngày (DateRangePicker có preset) cho mọi thẻ và biểu đồ",
        "StatTile có sparkline, LineChart, BarChart, DonutChart",
        "DataGrid: sắp xếp, lọc, tìm kiếm, phân trang, xuất CSV",
        "Trạng thái đang tải, trống và lỗi từ src/api.ts, chỉnh được trong Cài đặt",
        "Tiếng Anh, hoặc tiếng Việt với --lang vi; trang tải lười, URL thật bằng History API",
      ],
    },
    en: {
      description: "A 4-page sales dashboard: KPIs, charts and a customer table, fed by a mock API with latency.",
      features: [
        "Overview, Revenue, Customers, Settings; sidebar → Drawer on narrow screens",
        "One date range (DateRangePicker with presets) for every card and chart",
        "StatTile with sparklines, LineChart, BarChart, DonutChart",
        "DataGrid: sorting, filters, search, pagination, CSV export",
        "Loading, empty and error states from src/api.ts, adjustable in Settings",
        "English, or Vietnamese with --lang vi; lazy pages, real URLs via the History API",
      ],
    },
  },
  {
    dir: "vite-ai-chat",
    name: "AI chat",
    tags: ["Vite", "React 19", "Yugen Labs", "Streaming"],
    previewPath: "/",
    vi: {
      description: "Ứng dụng chat AI: lưu hội thoại, câu trả lời stream dừng được, kèm suy luận, các bước và nguồn.",
      features: [
        "Danh sách hội thoại: tạo, đổi tên, xoá, lưu trong localStorage; Drawer trên màn hẹp",
        "Câu trả lời Markdown dạng stream kèm Reasoning, Trace từng bước và nguồn Citation",
        "Dừng bằng nút hoặc phím Esc; sao chép và tạo lại câu trả lời",
        "PromptInput có đính kèm (nút, kéo thả, dán); Enter gửi, Shift+Enter xuống dòng",
        "Một adapter sendMessage(messages, { signal }): mặc định là mock, nối endpoint của bạn bằng một dòng",
        "Route /, /c/:id, /settings nạp lười; chữ tiếng Anh, tiếng Việt với --lang vi",
      ],
    },
    en: {
      description: "An AI chat app: saved conversations and streaming answers with reasoning, steps and sources.",
      features: [
        "Conversation list: new, rename, delete, saved in localStorage; Drawer on narrow screens",
        "Streaming Markdown answers with Reasoning, a step-by-step Trace and Citation sources",
        "Stop with the button or Esc; copy and regenerate answers",
        "PromptInput with attachments (button, drag and drop, paste); Enter sends, Shift+Enter adds a line",
        "One sendMessage(messages, { signal }) adapter: a mock by default, your endpoint in one line",
        "Lazy routes /, /c/:id, /settings; English text, Vietnamese with --lang vi",
      ],
    },
  },
  {
    dir: "next-starter",
    name: "Next.js starter",
    tags: ["Next.js 16", "App Router", "React 19", "Tailwind v4"],
    vi: {
      description: "Dự án Next.js App Router: theme lưu trong cookie để server render đúng, không nháy.",
      features: [
        "YugenProvider trong một Client Component (src/app/providers.tsx), bọc app ở layout.tsx",
        "Theme và brand trong cookie: server ghi sẵn data-theme lên <html>; lần đầu theo cài đặt hệ điều hành",
        "Trang chủ là Server Component dùng component Yugen; form Cài đặt là Client Component",
        "Icon Fluent qua một file \"use client\" để Server Component dùng được",
        "metadata theo trang, next/font (Noto Sans, đủ dấu tiếng Việt), trang 404",
        "Chữ tiếng Anh, tiếng Việt với --lang vi; CI build bằng next build và kiểm tra từng trang",
      ],
    },
    en: {
      description: "A Next.js App Router project: theme in a cookie so the server renders it, no flash.",
      features: [
        "YugenProvider in one Client Component (src/app/providers.tsx), wrapped around the app in layout.tsx",
        "Theme and brand in cookies: the server writes data-theme on <html>; a first visit follows the OS setting",
        "The home page is a Server Component using Yugen components; the Settings form is a Client Component",
        "Fluent icons through a \"use client\" file so Server Components can use them",
        "metadata per page, next/font (Noto Sans with Vietnamese glyphs), a 404 page",
        "English text, Vietnamese with --lang vi; CI builds it with next build and checks every page",
      ],
    },
  },
  {
    dir: "vite-glass",
    name: "Glass",
    tags: ["Vite", "React 19", "Yugen Labs", "Glass"],
    previewPath: "/",
    vi: {
      description: "Nhật ký du lịch: ảnh tràn viền, điều hướng glass nổi bên trên, nền đặc khi giảm trong suốt.",
      features: [
        "Sidebar glass từ 768px (thanh icon tới 1024px); màn hẹp có header và thanh tab thu gọn khi cuộn xuống",
        "Ảnh hero tràn dưới sidebar, khối tiêu đề glass-clear trên ảnh đã làm tối",
        "Trang chuyến đi: toolbar glass nhóm thao tác, Carousel ảnh, bottom sheet glass có nấc",
        "Khám phá: ảnh toàn khung, ghim mở popover, bộ lọc, phóng to và ô tìm kiếm nổi bằng glass clear",
        "Cài đặt: theme, brand, glass hoặc đặc, clear hoặc thường trên ảnh; ghi nguồn ảnh Unsplash",
        "Route /, /trips/:id, /explore, /settings nạp lười; chữ tiếng Anh, tiếng Việt với --lang vi",
      ],
    },
    en: {
      description: "A travel journal: full-bleed photos with glass navigation, opaque when transparency is reduced.",
      features: [
        "Glass sidebar from 768px (an icon rail until 1024px); a header and a tab bar that shrinks while scrolling below",
        "A hero photo running under the sidebar, with a clear-glass title block on the dimmed photo",
        "Trip page: glass toolbar with grouped actions, a photo Carousel, a glass bottom sheet with snap points",
        "Explore: a full-screen picture, pins that open popovers, filters, zoom and search floating in clear glass",
        "Settings: theme, brand, glass or solid, clear or regular over photos; Unsplash photo credits",
        "Lazy routes /, /trips/:id, /explore, /settings; English text, Vietnamese with --lang vi",
      ],
    },
  },
  {
    dir: "vite-docs",
    name: "Docs",
    tags: ["Vite", "Markdown", "SEO", { vi: "Tìm kiếm", en: "Search" }],
    previewPath: "/",
    vi: {
      description: "Trang tài liệu từ Markdown: mục lục, tìm kiếm Ctrl K và HTML sinh sẵn cho từng trang.",
      features: [
        "Mỗi thư mục trong src/content/<lang>/docs/ là một phần của sidebar, mỗi file .md là một trang, thứ tự theo front matter",
        "Sidebar Nav → Drawer trên màn hẹp; mục lục tô đậm đề mục đang đọc; trang trước / trang sau",
        "Tìm kiếm Ctrl / ⌘ K trên tiêu đề trang và đề mục h2 / h3, không phân biệt dấu; chỉ mục chỉ tải khi mở",
        "Code có nút sao chép, gộp nhiều ngôn ngữ thành tab, tab npm / pnpm / yarn / bun cho lệnh cài; khối lưu ý",
        "Mỗi trang một file HTML: title, description, canonical, Open Graph; tự sinh sitemap.xml và 404.html",
        "Lần tải đầu chỉ có front matter, nội dung từng trang tải khi mở",
        "Chữ và 10 trang mẫu bằng tiếng Anh (tiếng Việt với --lang vi); theme sáng / tối / tương phản cao",
      ],
    },
    en: {
      description: "A Markdown documentation site: table of contents, Ctrl K search and static HTML per page.",
      features: [
        "Each folder in src/content/<lang>/docs/ is a sidebar section, each .md file a page, ordered by front matter",
        "Sidebar Nav → Drawer on narrow screens; a table of contents that highlights the current heading; previous / next",
        "Ctrl / ⌘ K search over page titles and h2 / h3 headings, accents ignored; the index loads when it opens",
        "Code with a copy button, tabs across languages, npm / pnpm / yarn / bun tabs for install commands; callouts",
        "One HTML file per page: title, description, canonical, Open Graph; generates sitemap.xml and 404.html",
        "The first load holds the front matter only; each page's text loads when it opens",
        "English text and 10 sample pages (Vietnamese with --lang vi); light / dark / high contrast",
      ],
    },
  },
];

const REPO = SITE.links.repository.replace(/^https:\/\/github\.com\//, "");

/** Tên template trong CLI (`--template`): "vite-saas" → "saas" — khớp templates/templates.json. */
export const templateName = (dir: string) => dir.replace(/^vite-/, "");

/** CLI chép template và cài phụ thuộc (create-yugen-ui → yugen create). npx thay `npm create … -- --template`: PowerShell nuốt `--` khi gọi npm.ps1. */
export const templateCreateCommand = (dir: string, folder = "my-app") =>
  `npx create-yugen-ui@latest ${folder} --template ${templateName(dir)}`;

/** Tạo dự án rồi chạy dev server — mỗi lệnh một dòng: `&&` không chạy trên Windows PowerShell 5.1. */
export const templateCommand = (dir: string, folder = "my-app") =>
  `${templateCreateCommand(dir, folder)}\ncd ${folder}\nnpm run dev`;

/** StackBlitz mở thẳng thư mục trên GitHub — không cần cài gì. */
export const templateStackBlitzUrl = (dir: string) => `https://stackblitz.com/github/${REPO}/tree/main/templates/${dir}`;

export const templateSourceUrl = (dir: string) => `${SITE.links.repository}/tree/main/templates/${dir}`;
