/** Nhật ký thay đổi hiển thị ở trang "Có gì mới" (#/news). Mới nhất ở đầu. Đồng bộ với CHANGELOG.md. */
export type NewsKind = "new" | "improved" | "fixed" | "breaking";

export interface NewsItem {
  kind: NewsKind;
  text: string;
  /** Link nội bộ của docs, vd. "#/components/trace" */
  href?: string;
}

export interface NewsRelease {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  items: NewsItem[];
}

export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  new: "Mới",
  improved: "Cải tiến",
  fixed: "Sửa lỗi",
  breaking: "Thay đổi lớn",
};

export const NEWS: NewsRelease[] = [
  {
    version: "0.5.0",
    date: "2026-10-20",
    title: "Yugen Labs, gói npm & cộng đồng",
    summary:
      "Nhóm component vượt ra ngoài Fluent 2 — Trace, Questionnaire, Message Scroller, Code Block, Chart, Sheet thích ứng — cùng tầng Wait UX, bản build npm và trang cộng đồng.",
    items: [
      { kind: "new", text: "Trace — minh bạch từng bước của agent AI, CI hay quá trình triển khai.", href: "#/components/trace" },
      { kind: "new", text: "Questionnaire — khảo sát nhiều bước kiểu một-câu-một-màn-hình.", href: "#/components/questionnaire" },
      { kind: "new", text: "Message Scroller, Message Bubble, Typing Indicator và Chat Composer cho giao diện hội thoại.", href: "#/components/messagescroller" },
      { kind: "new", text: "Code Block có highlight, số dòng, diff, tab nhiều file và tab trình quản lý gói.", href: "#/components/codeblock" },
      { kind: "new", text: "Chart (Bar, Line, Area, Donut, Sparkline, StatTile) theo quy trình trực quan hoá có kiểm định màu.", href: "#/components/barchart" },
      { kind: "new", text: "Sheet — side panel trên desktop, bottom sheet kéo được trên mobile.", href: "#/components/sheet" },
      { kind: "new", text: "Wait UX: Button loading, useSpinDelay, PageProgress, AsyncContent, ErrorState và Skeleton dựng sẵn.", href: "#/concepts/wait-ux" },
      { kind: "improved", text: "Carousel có loop, autoplay kèm tiến độ, peek và thumbnail; Accordion thêm kiểu separated / outline.", href: "#/components/carousel" },
      { kind: "improved", text: "Resizable có panel thu gọn được và lưu bố cục.", href: "#/components/resizable" },
      { kind: "new", text: "Gói npm yugen-ui với theme.css (Tailwind v4), styles.css (không cần Tailwind) và type declarations.", href: "#/concepts/quick-start" },
      { kind: "new", text: "Trang Cộng đồng và trang Có gì mới.", href: "#/community" },
      { kind: "fixed", text: "Toàn bộ class Tailwind ở dạng canonical (script lint:classes) — không còn cảnh báo suggestCanonicalClasses." },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-20",
    title: "Khái niệm, RTL & tương phản cao",
    summary: "Tài liệu chuyên sâu kiểu Storybook, hỗ trợ hướng chữ phải-sang-trái và theme tương phản cao.",
    items: [
      { kind: "new", text: "16 trang Khái niệm: bắt đầu nhanh, styling, theming, slot, định vị, RTL, SSR, khả năng tiếp cận, chuyển đổi.", href: "#/concepts/introduction" },
      { kind: "new", text: "Thanh công cụ Theme (Yugen / Web / Teams × Light / Dark, Tương phản cao) và công tắc LTR / RTL." },
      { kind: "new", text: "YugenProvider — theme, brand, hướng chữ lồng được; bề mặt portal tự theo provider.", href: "#/concepts/theming" },
      { kind: "new", text: "Theme Designer sinh brand ramp 16 bậc kèm kiểm tra tương phản.", href: "#/theme-designer" },
      { kind: "new", text: "Motion (Fade, Scale, Slide, Collapse, Stagger), AriaLive, Focus management, CompoundButton, MenuButton, TeachingPopover…" },
      { kind: "fixed", text: "Command không còn kéo cả trang khi mount; Field gắn nhãn đúng cho nhóm control." },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-10-20",
    title: "Yugen UI ra đời — Sakura 桜",
    summary: "Đổi tên thành Yugen UI, brand hoa anh đào, 47 component mới và trang Blocks.",
    items: [
      { kind: "breaking", text: "Brand mặc định chuyển từ Communication Blue sang Sakura #C2347A (blue vẫn dùng được qua data-brand=\"web\")." },
      { kind: "new", text: "47 component mới theo danh mục Fluent 2 và shadcn/ui.", href: "#/" },
      { kind: "new", text: "Blocks — cụm giao diện ghép sẵn, copy nguyên file.", href: "#/blocks" },
      { kind: "new", text: "Gradient Sakura / Dusk / Sunset, logo enso hoa anh đào." },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-20",
    title: "Ngôn ngữ thiết kế theo Fluent 2",
    summary: "Trang Màu sắc, Typography, Spacing, Bo góc, Elevation, Motion; quy tắc màu và gradient.",
    items: [
      { kind: "new", text: "Trang Màu sắc với bảng tương phản tính trực tiếp từ token.", href: "#/foundations/color" },
      { kind: "improved", text: "Docs site thiết kế lại theo bố cục fluent2.microsoft.design." },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-20",
    title: "Nền móng",
    summary: "Token 3 lớp theo Fluent 2, 11 component đầu tiên và Design.md.",
    items: [{ kind: "new", text: "Token Global → Alias → Utility, Tailwind CSS v4, 11 component cốt lõi." }],
  },
];

export const LATEST_RELEASE = NEWS[0];
