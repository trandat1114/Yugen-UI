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
    tags: ["Vite", "React 18", "Tailwind v4", "Trang trắng"],
    featured: true,
    vi: {
      description:
        "Điểm khởi đầu trắng cho mọi dự án: mọi thứ đã nối sẵn, kèm trang chào hoa anh đào cho thấy Yugen UI làm được gì — xoá đi khi bắt đầu viết.",
      features: [
        "Theme sáng / tối / tương phản cao + 3 thương hiệu, ghi nhớ, không nháy khi tải",
        "toast(), Tooltip, focus ring, RTL — YugenProvider đã bọc sẵn",
        "Alias @/ → src cho mã của bạn (vite.config + tsconfig)",
        "SEO cơ bản: description, Open Graph, theme-color, favicon, robots.txt",
        "Trang chào: chữ dọc 幽玄, cánh hoa rơi (tắt khi giảm chuyển động), 6 thẻ component chạy thật",
        "Font Mincho chỉ tải đúng các ký tự Nhật dùng trong trang (vài kB)",
      ],
    },
    en: {
      description:
        "A blank starting point for any project: everything is wired up, plus a cherry-blossom welcome page that shows what Yugen UI can do — delete it when you start building.",
      features: [
        "Light / dark / high contrast + 3 brands, persisted with no flash on load",
        "toast(), Tooltip, focus rings, RTL — YugenProvider already in place",
        "@/ → src alias for your code (vite.config + tsconfig)",
        "SEO basics: description, Open Graph, theme-color, favicon, robots.txt",
        "Welcome page: vertical 幽玄 lettering, falling petals (off with reduced motion), 6 live component cards",
        "The Mincho font loads only the Japanese glyphs the page uses (a few kB)",
      ],
    },
  },
  {
    dir: "vite-saas",
    name: "SaaS workspace",
    tags: ["Vite", "React 18", "Tailwind v4", "8 trang"],
    featured: true,
    previewPath: "/#/overview",
    vi: {
      description:
        "Ứng dụng SaaS hoàn chỉnh: sidebar có nhóm, thanh trên cùng, bảng lệnh Ctrl K, thông báo, menu tài khoản và 8 trang mẫu ghép từ block.",
      features: [
        "Sidebar Nav → Drawer trên màn hẹp (container query)",
        "Bảng lệnh Ctrl / ⌘ K: chuyển trang, đổi theme, hành động nhanh",
        "Sáng / tối / tương phản cao + 3 thương hiệu, lưu lại, không nháy khi tải",
        "Định tuyến hash, tiêu đề & meta description theo trang",
        "SEO cơ bản: description, Open Graph, theme-color, robots.txt",
        "Tách chunk vendor sẵn — build không cảnh báo",
      ],
    },
    en: {
      description:
        "A complete SaaS app: grouped sidebar, top bar, Ctrl K command palette, notifications, account menu and 8 sample pages composed from blocks.",
      features: [
        "Sidebar Nav → Drawer on narrow screens (container queries)",
        "Ctrl / ⌘ K command palette: navigate, switch theme, quick actions",
        "Light / dark / high contrast + 3 brands, persisted with no flash on load",
        "Hash routing, per-page title & meta description",
        "SEO basics: description, Open Graph, theme-color, robots.txt",
        "Vendor chunks split out — a warning-free build",
      ],
    },
  },
  {
    dir: "vite-blog",
    name: "Markdown blog",
    tags: ["Vite", "Markdown", "SEO"],
    featured: true,
    vi: {
      description:
        "Blog viết bằng file Markdown: tìm kiếm, lọc thẻ, mục lục, bài trước / sau — và SEO sinh sẵn lúc build cho từng bài.",
      features: [
        "Thêm file src/posts/*.md là có bài — frontmatter title, date, tags, draft",
        "Parser an toàn của Yugen UI: code tô màu, bảng, trích dẫn, ảnh, link nội bộ",
        "URL thật /posts/<slug>/ bằng History API, không thêm router",
        "Mỗi bài một file HTML: title, description, canonical, Open Graph, JSON-LD",
        "Tự sinh sitemap.xml, rss.xml, robots.txt, 404.html — host tĩnh nào cũng chạy",
        "Theme sáng / tối / tương phản cao, không nháy khi tải",
      ],
    },
    en: {
      description:
        "A blog written as Markdown files: search, tag filters, table of contents, previous / next — and build-time SEO for every post.",
      features: [
        "Add src/posts/*.md to publish — frontmatter title, date, tags, draft",
        "Yugen UI's safe parser: highlighted code, tables, quotes, images, internal links",
        "Real URLs /posts/<slug>/ via the History API, no router library",
        "One HTML file per post: title, description, canonical, Open Graph, JSON-LD",
        "Generates sitemap.xml, rss.xml, robots.txt and 404.html — runs on any static host",
        "Light / dark / high contrast, no flash on load",
      ],
    },
  },
  {
    dir: "vite-dashboard",
    name: "Dashboard",
    tags: ["Vite", "Charts"],
    vi: {
      description: "Một trang dashboard: thẻ KPI, bảng phân tích với bộ lọc thời gian và giao dịch gần đây.",
      features: ["StatTile, AreaChart, BarChart, DonutChart, List", "Một bộ lọc thời gian cho mọi thẻ"],
    },
    en: {
      description: "A single dashboard page: KPI tiles, an analytics board with a shared time filter and recent transactions.",
      features: ["StatTile, AreaChart, BarChart, DonutChart, List", "One time filter for every card"],
    },
  },
  {
    dir: "vite-ai-chat",
    name: "AI chat",
    tags: ["Vite", "Yugen Labs"],
    vi: {
      description: "Trợ lý AI dạng chat: luồng tin nhắn tự cuộn, ô soạn có đính kèm và Trace hiển thị từng bước agent đang làm.",
      features: ["MessageScroller, MessageBubble, ChatComposer", "Trace — các bước của agent theo thời gian thực"],
    },
    en: {
      description: "An AI chat assistant: auto-scrolling thread, a composer with attachments and a Trace showing each step the agent takes.",
      features: ["MessageScroller, MessageBubble, ChatComposer", "Trace — the agent's steps in real time"],
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
