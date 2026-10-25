import { SITE } from "./site";

/** Starter template trong templates/ (sinh bởi scripts/sync-templates.mjs — giữ khớp danh sách TEMPLATES ở đó). */
export interface TemplateInfo {
  dir: string;
  name: string;
  tags: string[];
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
    tags: ["Vite", "React 19", "Tailwind v4", "Trang trắng"],
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
    tags: ["Vite", "React 19", "Tailwind v4", "8 trang"],
    featured: true,
    previewPath: "/#/overview",
    vi: {
      description:
        "Ứng dụng SaaS 8 trang: sidebar, bảng lệnh Ctrl K, thông báo và menu tài khoản.",
      features: [
        "Sidebar Nav → Drawer trên màn hẹp (container query)",
        "Bảng lệnh Ctrl / ⌘ K: chuyển trang, đổi theme, hành động nhanh",
        "Sáng / tối / tương phản cao + 3 thương hiệu, lưu lại, không nháy khi tải",
        "Định tuyến hash, tiêu đề & meta description theo trang",
        "SEO cơ bản: description, Open Graph, theme-color, robots.txt",
        "Tách sẵn chunk vendor, build không cảnh báo",
      ],
    },
    en: {
      description:
        "An 8-page SaaS app: sidebar, Ctrl K command palette, notifications and account menu.",
      features: [
        "Sidebar Nav → Drawer on narrow screens (container queries)",
        "Ctrl / ⌘ K command palette: navigate, switch theme, quick actions",
        "Light / dark / high contrast + 3 brands, persisted with no flash on load",
        "Hash routing, per-page title & meta description",
        "SEO basics: description, Open Graph, theme-color, robots.txt",
        "Vendor chunks split out, so the build has no warnings",
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
        "Thêm file src/posts/*.md là có bài (frontmatter: title, date, tags, draft)",
        "Parser an toàn của Yugen UI: code tô màu, bảng, trích dẫn, ảnh, link nội bộ",
        "URL thật /posts/<slug>/ bằng History API, không thêm router",
        "Mỗi bài một file HTML: title, description, canonical, Open Graph, JSON-LD",
        "Tự sinh sitemap.xml, rss.xml, robots.txt, 404.html; chạy trên mọi host tĩnh",
        "Theme sáng / tối / tương phản cao, không nháy khi tải",
      ],
    },
    en: {
      description:
        "A Markdown blog: search, tags, table of contents and build-time SEO for every post.",
      features: [
        "Add src/posts/*.md to publish (frontmatter: title, date, tags, draft)",
        "Yugen UI's safe parser: highlighted code, tables, quotes, images, internal links",
        "Real URLs /posts/<slug>/ via the History API, no router library",
        "One HTML file per post: title, description, canonical, Open Graph, JSON-LD",
        "Generates sitemap.xml, rss.xml, robots.txt and 404.html; runs on any static host",
        "Light / dark / high contrast, no flash on load",
      ],
    },
  },
  {
    dir: "vite-dashboard",
    name: "Dashboard",
    tags: ["Vite", "React 19", "Charts", "4 trang"],
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
