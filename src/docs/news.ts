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
  /**
   * Bản chưa phát hành, viết trên next (wiki › Release Process › Tin cho bản sắp phát hành). Chỉ mục ĐẦU mảng được
   * đánh dấu; `date` là ngày dự kiến. Commit chore(release) bỏ cờ này và điền ngày thật; `check-release --tag` chặn nếu quên.
   * Đặt ngay sau `version` (check-release đọc theo thứ tự đó).
   */
  upcoming?: true;
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
    version: "0.10.0",
    upcoming: true,
    date: "2027-01-29",
    title: "Spacing theo thang số",
    summary: "Spacing dùng thang số của Tailwind; alias viết hoa vẫn chạy nhưng đã deprecated.",
    items: [
      { kind: "improved", text: "Component, ví dụ, template và registry dùng spacing theo thang số (p-3, gap-2) thay cho alias viết hoa (p-M, gap-S). Giá trị không đổi ở cỡ chữ gốc 16px; thang số tính bằng rem nên co giãn theo cỡ chữ của trình duyệt.", href: "#/concepts/styling" },
      { kind: "improved", text: "Alias spacing viết hoa (p-M, gap-SNudge…) trong theme.css và cn() đã deprecated, vẫn chạy đến 1.0. Đổi theo bảng XXS → 0.5, XS → 1, SNudge → 1.5, S → 2, MNudge → 2.5, M → 3, L → 4, XL → 5, XXL → 6, XXXL → 8.", href: "#/concepts/styling" },
      { kind: "new", text: "Trang Motion viết lại, có bản tiếng Anh: token và animate-*, chuyển động của từng component kèm demo thật, playground so sánh hai thiết lập, xem trước giảm chuyển động, phối hợp và hiệu năng.", href: "#/foundations/motion" },
      { kind: "new", text: "Docs: kéo mép sidebar để đổi độ rộng (240–400px, phím mũi tên, nhấp đúp về mặc định) hoặc thu về dạng icon; trạng thái được nhớ sau khi tải lại." },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-10-23",
    title: "React 19 và starter tối giản",
    summary: "React 19 là mặc định, React 18.3 vẫn được hỗ trợ. Starter tiếng Anh gọn hơn, thêm 5 block, docs và lộ trình cập nhật.",
    items: [
      { kind: "improved", text: "React 19 là mặc định cho docs, test và template; React 18.3 vẫn được hỗ trợ và kiểm thử trong CI. Ngày ngừng hỗ trợ React 18 sẽ báo trước ít nhất một bản minor.", href: "#/concepts/quick-start" },
      { kind: "new", text: "5 block mới: Đăng ký bản tin, Chọn số lượng, Hộp thoại chào mừng, Tiến độ dự án, Đang trực tuyến.", href: "#/blocks" },
      { kind: "fixed", text: "AvatarGroup: tên đọc của nút “+N” bắt đầu bằng đúng số đang hiển thị (WCAG 2.5.3); overflowLabel được đọc sau số đếm.", href: "#/components/avatargroup" },
      { kind: "improved", text: "Template có tên ngắn (Starter, SaaS, Blog, Dashboard, AI chat) và mô tả một dòng; starter tối giản bằng tiếng Anh với thương hiệu Sakura và Web.", href: "#/templates" },
      { kind: "improved", text: "Có gì mới có tab riêng cho yugen-ui, @yugen-ui/cli và create-yugen-ui; tin của bản sắp phát hành mang nhãn Sắp phát hành.", href: "#/news" },
      { kind: "improved", text: "Trang Giới thiệu viết lại; trang Cộng đồng có lộ trình theo từng bản phát hành và cách dự án vận hành, đủ tiếng Anh.", href: "#/community" },
      { kind: "improved", text: "Docs gọi CLI đúng tên @yugen-ui/cli và bớt nội dung lặp; footer có GitHub, npm, Thảo luận, Báo lỗi; mục lục không còn sát thông báo trang chưa dịch.", href: "#/concepts/cli" },
    ],
  },
  {
    version: "0.8.3",
    date: "2026-10-22",
    title: "Lệnh tạo dự án chạy được trên PowerShell",
    summary: "Lệnh copy từ docs chạy được trên Windows PowerShell. Gói npm không đổi.",
    items: [
      { kind: "fixed", text: "Lệnh tạo dự án dùng npx create-yugen-ui@latest my-app --template <tên>: PowerShell bỏ mất dấu -- trong npm create … -- --template nên npm báo “Unknown cli config --template”.", href: "#/concepts/quick-start" },
      { kind: "fixed", text: "cd my-app và npm run dev nằm trên dòng riêng thay vì nối bằng && (Windows PowerShell 5.1 không chấp nhận).", href: "#/templates" },
    ],
  },
  {
    version: "0.8.2",
    date: "2026-10-22",
    title: "CLI @yugen-ui/cli",
    summary: "Tạo app, thiết lập dự án và chép mã nguồn component bằng một công cụ dòng lệnh. Sửa một lỗi nhỏ của AriaLive.",
    items: [
      { kind: "new", text: "CLI @yugen-ui/cli: npm create yugen-ui@latest tạo app từ template; npx @yugen-ui/cli@latest init thiết lập dự án có sẵn (gói npm hoặc mã nguồn); add chép component kèm phụ thuộc; doctor kiểm tra cấu hình.", href: "#/concepts/cli" },
      { kind: "improved", text: "Trang chủ có mục Tạo dự án nhanh và tab CLI trong khung cài đặt; mục Import của mỗi component có tab yugen CLI.", href: "#/" },
      { kind: "improved", text: "Bắt đầu nhanh, Templates và README của template dùng CLI trước; cách cài thủ công và shadcn CLI vẫn giữ.", href: "#/concepts/quick-start" },
      { kind: "fixed", text: "AriaLive: announcer dự phòng (khi không có AriaLiveAnnouncer) không còn báo lỗi “window is not defined” khi hàng đợi chạy sau lúc window đã mất, vd. sau khi môi trường test bị gỡ.", href: "#/components/arialive" },
    ],
  },
  {
    version: "0.8.1",
    date: "2026-10-22",
    title: "Docs gọn hơn trên điện thoại",
    summary: "Thanh trên, khung ví dụ và trang chủ được làm lại cho màn hình nhỏ. Logo mới. Gói npm không đổi.",
    items: [
      { kind: "improved", text: "Thanh trên: một nút Giao diện cho chế độ sáng / tối / tương phản cao, màu và hướng chữ; nút đổi ngôn ngữ hiện ở mọi cỡ màn hình.", href: "#/" },
      { kind: "improved", text: "Khung ví dụ: thanh công cụ một hàng, màn hình nhỏ chỉ còn icon; nút Code chuyển lên thanh trên.", href: "#/components/button" },
      { kind: "improved", text: "Trang chủ: hero 幽玄 mới, lệnh cài npm / shadcn có nút copy, danh sách component có ô tìm và chip nhóm; trên điện thoại chạm tên để mở từng demo.", href: "#/" },
      { kind: "improved", text: "Logo mới: vòng enso nét mực và hoa anh đào; favicon đổi màu theo chế độ sáng / tối của trình duyệt." },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-10-21",
    title: "Templates, shadcn init một lệnh & SEO",
    summary:
      "Trang Templates với ba template mới — starter, SaaS và blog Markdown — tạo dự án bằng một lệnh; shadcn CLI cài theme, cn() và YugenProvider trong một bước; Bắt đầu nhanh gọn còn một lệnh và docs bắt đầu hỗ trợ SEO.",
    items: [
      { kind: "new", text: "Trang Templates: preview chạy thật, tạo dự án bằng một lệnh (npx giget … --install) hoặc mở trên StackBlitz.", href: "#/templates" },
      { kind: "new", text: "vite-starter — khởi đầu trắng: theme được ghi nhớ, không nháy khi tải, alias @/, SEO cơ bản và trang chào hoa anh đào 幽玄.", href: "#/templates" },
      { kind: "new", text: "vite-saas — ứng dụng 8 trang có sidebar, bảng lệnh Ctrl K, thông báo; vite-blog — blog Markdown sinh HTML từng bài, sitemap.xml, rss.xml.", href: "#/templates" },
      { kind: "new", text: "shadcn CLI: npx shadcn@latest init …/r/init.json (Next.js: init-next.json) tạo components.json, chép theme + cn() + YugenProvider và tự thêm @import vào CSS.", href: "#/concepts/shadcn-registry" },
      { kind: "breaking", text: "Registry shadcn: component không còn tự cài theme — chạy init một lần cho mỗi dự án, hoặc add kèm …/r/theme.json. Gói npm không đổi.", href: "#/concepts/shadcn-registry" },
      { kind: "improved", text: "Bắt đầu nhanh: một lệnh từ template, hoặc ba bước cho dự án có sẵn (cài gói, một dòng CSS, YugenProvider).", href: "#/concepts/quick-start" },
      { kind: "improved", text: "Docs: tiêu đề và mô tả theo từng trang, Open Graph kèm ảnh chia sẻ link, JSON-LD; lộ trình SEO mới trên trang Cộng đồng.", href: "#/community" },
      { kind: "improved", text: "Nút Open in StackBlitz hiện trên mọi ví dụ component.", href: "#/components/button" },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-10-21",
    title: "Quote, Autocomplete & SearchBox dễ nhìn hơn",
    summary:
      "Thêm Quote cho trích dẫn có nguồn và Autocomplete — ô tìm kiếm có gợi ý, lọc không dấu; ví dụ lọc danh sách của SearchBox được thiết kế lại.",
    items: [
      { kind: "new", text: "Quote — trích dẫn có tác giả và nguồn, 3 kiểu default / subtle / emphasis.", href: "#/components/quote" },
      { kind: "new", text: "Autocomplete — ô tìm kiếm có gợi ý: lọc không dấu (gõ “xoai” ra “Xoài”), tô sáng phần khớp, nhóm gợi ý, tải từ server.", href: "#/components/autocomplete" },
      { kind: "improved", text: "SearchBox — ví dụ “Lọc danh sách” giờ hiển thị kết quả trong khung danh sách có số đếm, avatar và trạng thái rỗng.", href: "#/components/searchbox" },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-10-21",
    title: "DataGrid, bộ AI, registry shadcn & kiểm thử tự động",
    summary:
      "Thêm DataGrid, bộ component AI (StreamingMarkdown, Citation, Reasoning, PromptInput), Tour, NotificationCenter, FileUpload, Stepper, TimePicker, Overflow và biểu đồ Scatter / Heatmap; cài từng component bằng shadcn CLI; docs nạp nhanh hơn, có tiếng Anh và hơn 800 bài test tự động.",
    items: [
      { kind: "new", text: "DataGrid — sắp xếp, chọn dòng, đổi cỡ cột, ảo hoá 10 000 dòng.", href: "#/components/datagrid" },
      { kind: "new", text: "Bộ AI: StreamingMarkdown an toàn, Citation, Reasoning, PromptInput có đính kèm.", href: "#/components/streamingmarkdown" },
      { kind: "new", text: "Tour hướng dẫn có spotlight và NotificationCenter (popover / bottom sheet).", href: "#/components/tour" },
      { kind: "new", text: "FileUpload, Stepper / Wizard và mẫu form react-hook-form + zod.", href: "#/components/fileupload" },
      { kind: "new", text: "TimePicker, preset cho DateRangePicker và Overflow tự ẩn bớt item.", href: "#/components/timepicker" },
      { kind: "new", text: "ScatterChart, Heatmap, AreaChart 100% và zoom / brush.", href: "#/components/scatterchart" },
      { kind: "new", text: "Cài component dạng mã nguồn bằng shadcn CLI: npx shadcn add …/r/<tên>.json.", href: "#/concepts/shadcn-registry" },
      { kind: "new", text: "Theme Designer xuất JSON (W3C Design Tokens, Tokens Studio).", href: "#/theme-designer" },
      { kind: "improved", text: "Docs nạp lười từng trang (JS lần đầu 970 kB → 108 kB), có bản tiếng Anh và menu chọn phiên bản.", href: "#/" },
      { kind: "improved", text: "Nút StackBlitz cho mọi ví dụ và chính sách phiên bản / deprecate.", href: "#/concepts/versioning" },
      { kind: "fixed", text: "Sửa a11y (axe trên 128 trang × sáng / tối), Resizable kéo ngược trong RTL, lệch hydration khi SSR, tương thích React 19." },
    ],
  },
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

/** Bản đã phát hành mới nhất (bỏ qua mục `upcoming`). */
export const LATEST_RELEASE = NEWS.find((r) => !r.upcoming) ?? NEWS[0];

/**
 * Tab @yugen-ui/cli (packages/cli). Mục đầu = version trong packages/cli/package.json — packages/cli/scripts/check-release.mjs
 * kiểm tra cùng CHANGELOG của CLI.
 */
export const CLI_NEWS: NewsRelease[] = [
  {
    version: "0.2.1",
    upcoming: true,
    date: "2026-10-30",
    title: "doctor nhận app vừa tạo",
    summary: "App tạo bằng create không còn bị doctor cảnh báo thiếu yugen.json.",
    items: [
      { kind: "fixed", text: "doctor, add, list: dự án đã cài yugen-ui mà chưa có yugen.json (app tạo bằng create, hoặc cài tay theo README) được hiểu là mode package; doctor hết cảnh báo, add in sẵn dòng import thay vì đòi chạy yugen init.", href: "#/concepts/cli" },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-23",
    title: "Node.js 22, --lang và template mới",
    summary: "create chọn được ngôn ngữ cho starter; cần Node.js 22 trở lên.",
    items: [
      { kind: "breaking", text: "Cần Node.js 22 trở lên (Node.js 20 đã hết hỗ trợ).", href: "#/concepts/cli" },
      { kind: "new", text: "create --lang en|vi chọn ngôn ngữ chữ trong app với template có cả hai (starter). Không truyền thì hỏi khi chạy tương tác; mặc định tiếng Anh.", href: "#/concepts/cli" },
      { kind: "improved", text: "Template có tên ngắn trong trình chọn; starter tối giản bằng tiếng Anh, chữ nằm trong src/content/; app mới dùng React 19.", href: "#/templates" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-22",
    title: "Bản đầu tiên",
    summary: "Tạo app từ template, thiết lập dự án có sẵn và chép mã nguồn component bằng một công cụ dòng lệnh.",
    items: [
      { kind: "new", text: "create: tạo app từ template starter, saas, blog, dashboard hoặc ai-chat. Template đóng gói sẵn nên không cần mạng.", href: "#/concepts/cli" },
      { kind: "new", text: "init: thiết lập dự án React có sẵn bằng gói npm hoặc chép mã nguồn, ghi cấu hình vào yugen.json.", href: "#/concepts/cli" },
      { kind: "new", text: "add và list: chép component kèm component phụ thuộc, cài gói npm còn thiếu, tìm trong registry.", href: "#/concepts/cli" },
      { kind: "new", text: "doctor: kiểm tra React, Tailwind CSS v4, import theme, phiên bản yugen-ui và YugenProvider.", href: "#/concepts/cli" },
    ],
  },
];

/** Tab create-yugen-ui (packages/create-yugen-ui) — chỉ phát hành cùng bản CLI ổn định. Mục đầu = version của gói. */
export const CREATE_NEWS: NewsRelease[] = [
  {
    version: "0.2.0",
    date: "2026-10-23",
    title: "Theo @yugen-ui/cli 0.2.0",
    summary: "Cùng các thay đổi của @yugen-ui/cli 0.2.0.",
    items: [
      { kind: "breaking", text: "Cần Node.js 22 trở lên.", href: "#/concepts/cli" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template starter --lang vi tạo starter bằng tiếng Việt.", href: "#/concepts/cli" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-22",
    title: "Bản đầu tiên",
    summary: "npx create-yugen-ui@latest tạo app từ template, giống lệnh create của @yugen-ui/cli.",
    items: [
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template starter chép template, cài phụ thuộc và khởi tạo git.", href: "#/concepts/cli" },
    ],
  },
];
