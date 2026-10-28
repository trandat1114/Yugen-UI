/** Nhật ký thay đổi hiển thị ở trang "Có gì mới" (/news). Mới nhất ở đầu. Đồng bộ với CHANGELOG.md. */
export type NewsKind = "new" | "improved" | "fixed" | "breaking";

export interface NewsItem {
  kind: NewsKind;
  text: string;
  /** Link nội bộ của docs, tính từ gốc docs, vd. "/components/trace" (NewsPage thêm BASE qua docsPath). */
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
    version: "0.13.0",
    upcoming: true,
    date: "2026-11-10",
    title: "Khúc xạ cho glass, mùa hoa anh đào trong template Glass",
    summary: "Mép của bề mặt glass bẻ cong ảnh phía sau như vành thấu kính (GlassRefraction, trình duyệt Chromium). Template Glass có thêm Kyoto, Tokyo, Hirosaki và núi Phú Sĩ mùa hoa nở. Thêm Sonner (thông báo xếp chồng) và bốn component hiển thị: Timeline, DescriptionList, Stat, Prose. Trang Templates có chế độ toàn màn hình; Checkbox, Switch và Dropdown trong Field không còn kéo dài trang khi nằm trong form ở một vùng cuộn.",
    items: [
      { kind: "new", text: "Sonner: thông báo xếp chồng ở góc màn hình, trỏ chuột hoặc focus vào thì xoè ra. Gọi sonner(\"…\") hoặc sonner.success / info / warning / error / loading ở bất kỳ đâu; sonner.promise đổi tại chỗ từ loading sang success hoặc error; gọi lại với cùng id để cập nhật. Có nút hành động và nút huỷ, richColors, vuốt để đóng, F8 để tới vùng thông báo. Dựng trên Radix Toast, không thêm dependency.", href: "/components/sonner" },
      { kind: "new", text: "Timeline (lịch sử, nhật ký hoạt động; detailed và compact), DescriptionList (cặp nhãn / giá trị, tự bớt cột khi hẹp, nút sao chép), Stat (con số chính, delta, ô biểu đồ nhỏ — StatTile giờ dựng trên Stat) và Prose (kiểu chữ cho Markdown / HTML từ CMS, thoát bằng not-prose).", href: "/components/timeline" },
      { kind: "improved", text: "Template Blog và Docs định dạng bài viết bằng Prose thay cho class riêng trên từng thẻ.", href: "/templates" },
      { kind: "new", text: "GlassRefraction (Yugen Labs): đặt một lần ở gốc app, mép của mọi bề mặt glass bẻ cong phần nền phía sau như vành thấu kính, phần giữa vẫn mờ nên chữ giữ tương phản. Chỉ trình duyệt Chromium vẽ được; Safari và Firefox giữ glass như cũ. Tắt cùng blur khi giảm trong suốt, tăng tương phản, forced colors và theme tương phản cao.", href: "/foundations/glass" },
      { kind: "new", text: "Slider và Switch có material=\"glass\" (Yugen Labs): khi đang nhấn hoặc kéo, thumb thành glass, to ra trên Slider để thấy thanh trượt qua nó, dài ra trên Switch.", href: "/components/slider" },
      { kind: "improved", text: "MenuPopover và PopoverSurface glass mọc ra từ nút mở và thu về đó khi đóng; khi giảm chuyển động vẫn chỉ mờ dần như cũ.", href: "/foundations/glass" },
      { kind: "improved", text: "Theme Designer: trục Glass (trong, mặc định, mờ đục) và sắc glass theo brand, xem trước trên ảnh, kiểm tra chữ trên glass vẫn ≥ 4.5:1 khi phía sau đen hoặc trắng; CSS xuất kèm các biến glass.", href: "/theme-designer" },
      { kind: "improved", text: "Template Glass: bốn chuyến đi mùa hoa anh đào ở Kyoto, Tokyo, Hirosaki và quanh núi Phú Sĩ (ảnh Wikimedia Commons, ghi nguồn và giấy phép); trang Cài đặt có khung xem trước thanh và nút điều khiển trên ảnh sáng, ảnh hoa và ảnh đêm; trang Khám phá là bản đồ thế giới (Natural Earth), mỗi chuyến đi ghim đúng toạ độ, ghim gần nhau gộp lại và phóng tới khi chọn.", href: "/templates" },
      { kind: "improved", text: "Trang Templates: nút toàn màn hình trên mỗi preview, chọn khổ máy tính, máy tính bảng hoặc điện thoại; link ?preview=<template> mở thẳng chế độ này. Các template khác chọn bằng tab và xem trong một khung lớn bằng template nổi bật; link #<template> chọn sẵn template.", href: "/templates" },
      { kind: "improved", text: "Báo trước: React 18.3 vẫn được hỗ trợ đến hết 0.x; từ 1.0, Yugen UI chỉ hỗ trợ React 19. Nếu app còn dùng React 18, hãy lên React 19 trước khi cập nhật lên 1.0.", href: "/concepts/quick-start" },
      { kind: "fixed", text: "Checkbox, Switch và Dropdown trong Field: khi nằm trong <form> ở một vùng cuộn, input ẩn dùng để gửi form không còn kéo dài trang và để lại khoảng trống phía dưới.", href: "/components/checkbox" },
    ],
  },
  {
    version: "0.12.0",
    date: "2026-10-27",
    title: "Glass, sáu template mới và chọn cột trong DataGrid",
    summary: "Vật liệu glass (Yugen Labs) cho thanh công cụ, thanh tab, sidebar và menu nổi trên nội dung. Sáu template mới: Glass, Landing, Admin, Docs, Store và Next.js starter; SaaS dùng đường dẫn thật và mọi template một trang có sẵn cấu hình deploy. Người dùng tự ẩn và hiện cột của DataGrid. Menu dài không còn tràn khỏi màn hình; trên màn hình cảm ứng, các nút vốn chỉ hiện khi rê chuột giờ hiện sẵn.",
    items: [
      { kind: "new", text: "Glass (Yugen Labs, lấy cảm hứng từ Liquid Glass): material=\"glass\" | \"glass-clear\" trên Toolbar, TabsList, Nav, MenuPopover, PopoverSurface, TooltipContent, DialogSurface, DrawerSurface, SheetContent; Button appearance=\"glass\" | \"glass-prominent\"; Input / SearchBox appearance=\"glass\". TabsList có minimized và hook useScrollMinimize cho thanh tab thu gọn khi cuộn. Utility glass, glass-clear, glass-tinted, glass-scrim, scroll-edge, rounded-concentric. Chữ giữ ≥ 4.5:1 trên mọi nền phía sau; nền đặc khi giảm trong suốt, tăng tương phản, tương phản cao hoặc forced colors. Tên có thể đổi trước 1.0.", href: "/foundations/glass" },
      { kind: "new", text: "DataGrid nhận hiddenColumns; DataGridColumnPicker là nút “Cột” mở menu ô tích, dùng được cả với Table. Menu không đóng khi tích từng cột, cột hideable: false và cột hiện cuối cùng không ẩn được, cột đang sắp xếp vẫn sắp xếp hàng khi bị ẩn. Cột ẩn giữ độ rộng đã kéo; lưu lựa chọn bằng onHiddenColumnsChange.", href: "/components/datagrid" },
      { kind: "new", text: "Template Glass: nhật ký du lịch với ảnh tràn viền, sidebar và thanh tab glass (thu gọn khi cuộn), trang Khám phá với ghim và bộ lọc nổi bằng glass clear, bottom sheet glass, cài đặt glass / đặc. Ảnh mẫu Unsplash dạng AVIF.", href: "/templates" },
      { kind: "new", text: "Template Landing: trang giới thiệu sản phẩm với bảng giá theo tháng / năm, hỏi đáp, nhận xét và form đăng ký có kiểm tra. Màn hình đầu, title, Open Graph và JSON-LD của sản phẩm được ghi sẵn vào index.html lúc build; Lighthouse trên di động từ 95 điểm ở cả bốn mục, kiểm tra trong CI.", href: "/templates" },
      { kind: "new", text: "Template Next.js starter (App Router): YugenProvider trong một Client Component, theme và brand lưu trong cookie để server render đúng theme (không nháy), trang chủ là Server Component dùng component Yugen, metadata theo trang, next/font. Trang SSR có liên kết tới template.", href: "/concepts/ssr" },
      { kind: "new", text: "Template Admin: khách hàng và đơn hàng trên API giả lập. DataGrid phân trang, sắp xếp và lọc trên server, chọn cột hiển thị, chọn nhiều hàng để xuất CSV hoặc xoá; thêm và sửa trong Drawer có kiểm tra bằng react-hook-form + zod; cập nhật lạc quan, lỗi thì hoàn tác kèm toast. Có trang đăng nhập, quên mật khẩu, nhập mã OTP và trang cần đăng nhập mới xem được.", href: "/templates" },
      { kind: "new", text: "Template Docs: trang tài liệu từ file Markdown, mỗi thư mục là một phần của sidebar. Mục lục đánh dấu đề mục đang đọc, tìm kiếm Ctrl K trên tiêu đề và đề mục, code gộp tab theo ngôn ngữ, tab npm / pnpm / yarn / bun cho lệnh cài. Mỗi trang có file HTML riêng với title, description và Open Graph, kèm sitemap.xml và 404.html.", href: "/templates" },
      { kind: "new", text: "Template Store: cửa hàng nhỏ bán trà, đồ gốm và văn phòng phẩm. Lưới sản phẩm lọc theo danh mục, khoảng giá và sắp xếp, bộ lọc lưu trong URL; trang sản phẩm có Carousel, chọn màu, cỡ và số lượng; giỏ hàng trong Sheet lưu trong localStorage; thanh toán bằng Wizard bốn bước có kiểm tra và trang xác nhận đơn. Giá định dạng theo ngôn ngữ (USD hoặc VND), thanh toán chỉ là giả lập.", href: "/templates" },
      { kind: "improved", text: "Template SaaS dùng đường dẫn thật (/analytics) thay cho #/analytics, link cũ vẫn mở đúng trang. SaaS, Dashboard, AI chat và Glass có sẵn cấu hình deploy: _redirects cho Netlify, vercel.json, npm run build:gh-pages cho GitHub Pages; Cloudflare Pages không cần gì thêm.", href: "/templates" },
      { kind: "improved", text: "DataGrid: cột chỉ cần label, renderHeaderCell thành tuỳ chọn. Logic ẩn / hiện cột dùng riêng được qua useDataGridColumnVisibility và getVisibleColumns.", href: "/components/datagrid" },
      { kind: "improved", text: "DataGrid và Table dùng chữ số đều chiều rộng, nên số trong một cột thẳng hàng mà không cần thêm class.", href: "/components/table" },
      { kind: "improved", text: "MenuItemCheckbox và MenuItemRadio nhận secondaryContent như MenuItem.", href: "/components/menu" },
      { kind: "improved", text: "Trang Phiên bản có quy tắc cho từng số: phần lớn thay đổi ra ở bản patch, minor chỉ tăng khi có API mới và cách nhau ít nhất 14 ngày, major cách nhau ít nhất 180 ngày. Áp dụng từ sau 0.12.0.", href: "/concepts/versioning" },
      { kind: "fixed", text: "DataGrid: khi bộ cột thay đổi, focus bàn phím ở lại đúng cột thay vì nhảy sang cột khác cùng vị trí; ô đang focus bị gỡ thì focus sang cột gần nhất.", href: "/components/datagrid" },
      { kind: "fixed", text: "Menu, ContextMenu, Menubar và menu con: menu dài cuộn bên trong màn hình thay vì tràn ra ngoài, nên mục cuối luôn chọn được.", href: "/components/contextmenu" },
      { kind: "fixed", text: "Màn hình cảm ứng: nút thao tác của hàng, checkbox chọn kiểu subtle (Table, DataGrid) và thao tác của Tree luôn hiện, vì không có hover để làm chúng hiện ra.", href: "/components/table" },
    ],
  },
  {
    version: "0.11.1",
    date: "2026-10-26",
    title: "Hiệu ứng wave của Skeleton chạy mượt trở lại",
    summary: "Dải sáng của Skeleton chạy hết bề ngang và lặp liền mạch, ở mọi hình dạng và kiểu translucent.",
    items: [
      { kind: "fixed", text: "Skeleton: từ 0.11.0, dải sáng của hiệu ứng wave chỉ hiện ở 1/4 cuối mỗi chu kỳ, dừng giữa khung rồi bật về đầu. Giờ dải sáng chạy hết bề ngang và lặp liền mạch, ở mọi hình dạng (rectangle, circle, square) và kiểu translucent.", href: "/components/skeleton" },
    ],
  },
  {
    version: "0.11.0",
    date: "2026-10-25",
    title: "Chuỗi giao diện thay được, docs tiếng Anh và template mới",
    summary: "Mọi chữ có sẵn trong component đổi được qua YugenProvider (có sẵn bản tiếng Anh). Docs đủ tiếng Anh với URL thật và HTML render sẵn. Dashboard và AI chat thành ứng dụng đầy đủ, mọi template có hai ngôn ngữ.",
    items: [
      { kind: "new", text: "YugenProvider nhận messages và locale: đổi nhãn nút, aria-label, thông báo cho trình đọc màn hình của mọi component theo namespace; messagesEn chuyển toàn bộ sang tiếng Anh. Prop nhãn riêng của component vẫn ưu tiên; tiếng Việt vẫn là mặc định.", href: "/concepts/localization" },
      { kind: "new", text: "Trang component có mục Messages: liệt kê từng khoá, mặc định tiếng Việt và bản tiếng Anh.", href: "/components/toast" },
      { kind: "improved", text: "Skeleton (wave) và ProgressBar không xác định chạy bằng transform, không vẽ lại mỗi khung hình; thêm utility animate-sweep và animate-indeterminate-slide.", href: "/components/skeleton" },
      { kind: "improved", text: "Nhanh hơn khi dữ liệu lớn hoặc cập nhật liên tục: Chart, DataGrid, Tree, List, Combobox, TagPicker, Autocomplete, MessageScroller, StreamingMarkdown, Carousel, PageProgress.", href: "/components/datagrid" },
      { kind: "new", text: "Docs tiếng Anh cho mọi trang ở /en/: khái niệm, 113 component, Foundations, Blocks, Theme Designer. URL theo đường dẫn, HTML render sẵn từng trang, sitemap có hreflang, ảnh Open Graph riêng; trang SEO mới.", href: "/concepts/seo" },
      { kind: "new", text: "Template Dashboard (4 trang, một khoảng ngày cho mọi biểu đồ, DataGrid xuất CSV) và AI chat (danh sách hội thoại, trả lời dạng stream dừng được, nối backend riêng) thành ứng dụng đầy đủ; SaaS, Blog và các template mới có tiếng Anh và tiếng Việt (create --lang).", href: "/templates" },
      { kind: "improved", text: "Template nạp từng trang khi cần: lần tải đầu của SaaS giảm khoảng một phần tư. CI build và kiểm tra từng template với chính bản yugen-ui của PR (dung lượng, lỗi console, axe).", href: "/templates" },
      { kind: "improved", text: "Docs nhẹ hơn: JS lần tải đầu giảm hơn một nửa, trang chủ ít phần tử hơn; hoa anh đào ở trang chủ không còn bị cắt khung." },
      { kind: "fixed", text: "Calendar: ô ngày ở tiếng Anh đọc ngày bằng số thường (\"October 1, 2026\" thay vì \"October 1st\"), khớp số hiện trên ô, nên điều khiển bằng giọng nói chọn được ngày (WCAG 2.5.3).", href: "/components/calendar" },
    ],
  },
  {
    version: "0.10.0",
    date: "2026-10-23",
    title: "Spacing theo thang số, Theme Designer và trang Motion",
    summary: "Spacing dùng thang số của Tailwind (alias viết hoa đã deprecated), cn() dùng tailwind-merge 3. Docs có Theme Designer nhiều trục, trang Motion mới và sidebar co giãn.",
    items: [
      { kind: "improved", text: "Component, ví dụ, template và registry dùng spacing theo thang số (p-3, gap-2) thay cho alias viết hoa (p-M, gap-S). Giá trị không đổi ở cỡ chữ gốc 16px; thang số tính bằng rem nên co giãn theo cỡ chữ của trình duyệt.", href: "/concepts/styling" },
      { kind: "improved", text: "Alias spacing viết hoa (p-M, gap-SNudge…) trong theme.css và cn() đã deprecated, vẫn chạy đến 1.0. Đổi theo bảng XXS → 0.5, XS → 1, SNudge → 1.5, S → 2, MNudge → 2.5, M → 3, L → 4, XL → 5, XXL → 6, XXXL → 8.", href: "/concepts/styling" },
      { kind: "new", text: "Theme Designer: ngoài màu brand còn chọn được bo góc, mật độ, font và cỡ chữ gốc, màu trung tính, độ nổi và chuyển động — mỗi trục vài bậc đã kiểm tra tương phản và vùng bấm. Xem trước ở light, dark, high contrast và RTL; CSS xuất gồm mọi lựa chọn; link chia sẻ giữ nguyên thiết lập.", href: "/theme-designer" },
      { kind: "improved", text: "Ví dụ Form với react-hook-form + zod viết theo zod 4 (z.email(), tham số error) và @hookform/resolvers 6; ví dụ cần zod 4 trở lên.", href: "/components/formvalidation" },
      { kind: "new", text: "Trang Motion viết lại, có bản tiếng Anh: token và animate-*, chuyển động của từng component kèm demo thật, playground so sánh hai thiết lập, xem trước giảm chuyển động, phối hợp và hiệu năng.", href: "/foundations/motion" },
      { kind: "new", text: "Docs: kéo mép sidebar để đổi độ rộng (240–400px, phím mũi tên, nhấp đúp về mặc định) hoặc thu về dạng icon; trạng thái được nhớ sau khi tải lại." },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-10-23",
    title: "React 19 và starter tối giản",
    summary: "React 19 là mặc định, React 18.3 vẫn được hỗ trợ. Starter tiếng Anh gọn hơn, thêm 5 block, docs và lộ trình cập nhật.",
    items: [
      { kind: "improved", text: "React 19 là mặc định cho docs, test và template; React 18.3 vẫn được hỗ trợ và kiểm thử trong CI. Ngày ngừng hỗ trợ React 18 sẽ báo trước ít nhất một bản minor.", href: "/concepts/quick-start" },
      { kind: "new", text: "5 block mới: Đăng ký bản tin, Chọn số lượng, Hộp thoại chào mừng, Tiến độ dự án, Đang trực tuyến.", href: "/blocks" },
      { kind: "fixed", text: "AvatarGroup: tên đọc của nút “+N” bắt đầu bằng đúng số đang hiển thị (WCAG 2.5.3); overflowLabel được đọc sau số đếm.", href: "/components/avatargroup" },
      { kind: "improved", text: "Template có tên ngắn (Starter, SaaS, Blog, Dashboard, AI chat) và mô tả một dòng; starter tối giản bằng tiếng Anh với thương hiệu Sakura và Web.", href: "/templates" },
      { kind: "improved", text: "Có gì mới có tab riêng cho yugen-ui, @yugen-ui/cli và create-yugen-ui; tin của bản sắp phát hành mang nhãn Sắp phát hành.", href: "/news" },
      { kind: "improved", text: "Trang Giới thiệu viết lại; trang Cộng đồng có lộ trình theo từng bản phát hành và cách dự án vận hành, đủ tiếng Anh.", href: "/community" },
      { kind: "improved", text: "Docs gọi CLI đúng tên @yugen-ui/cli và bớt nội dung lặp; footer có GitHub, npm, Thảo luận, Báo lỗi; mục lục không còn sát thông báo trang chưa dịch.", href: "/concepts/cli" },
    ],
  },
  {
    version: "0.8.3",
    date: "2026-10-22",
    title: "Lệnh tạo dự án chạy được trên PowerShell",
    summary: "Lệnh copy từ docs chạy được trên Windows PowerShell. Gói npm không đổi.",
    items: [
      { kind: "fixed", text: "Lệnh tạo dự án dùng npx create-yugen-ui@latest my-app --template <tên>: PowerShell bỏ mất dấu -- trong npm create … -- --template nên npm báo “Unknown cli config --template”.", href: "/concepts/quick-start" },
      { kind: "fixed", text: "cd my-app và npm run dev nằm trên dòng riêng thay vì nối bằng && (Windows PowerShell 5.1 không chấp nhận).", href: "/templates" },
    ],
  },
  {
    version: "0.8.2",
    date: "2026-10-22",
    title: "CLI @yugen-ui/cli",
    summary: "Tạo app, thiết lập dự án và chép mã nguồn component bằng một công cụ dòng lệnh. Sửa một lỗi nhỏ của AriaLive.",
    items: [
      { kind: "new", text: "CLI @yugen-ui/cli: npm create yugen-ui@latest tạo app từ template; npx @yugen-ui/cli@latest init thiết lập dự án có sẵn (gói npm hoặc mã nguồn); add chép component kèm phụ thuộc; doctor kiểm tra cấu hình.", href: "/concepts/cli" },
      { kind: "improved", text: "Trang chủ có mục Tạo dự án nhanh và tab CLI trong khung cài đặt; mục Import của mỗi component có tab yugen CLI.", href: "/" },
      { kind: "improved", text: "Bắt đầu nhanh, Templates và README của template dùng CLI trước; cách cài thủ công và shadcn CLI vẫn giữ.", href: "/concepts/quick-start" },
      { kind: "fixed", text: "AriaLive: announcer dự phòng (khi không có AriaLiveAnnouncer) không còn báo lỗi “window is not defined” khi hàng đợi chạy sau lúc window đã mất, vd. sau khi môi trường test bị gỡ.", href: "/components/arialive" },
    ],
  },
  {
    version: "0.8.1",
    date: "2026-10-22",
    title: "Docs gọn hơn trên điện thoại",
    summary: "Thanh trên, khung ví dụ và trang chủ được làm lại cho màn hình nhỏ. Logo mới. Gói npm không đổi.",
    items: [
      { kind: "improved", text: "Thanh trên: một nút Giao diện cho chế độ sáng / tối / tương phản cao, màu và hướng chữ; nút đổi ngôn ngữ hiện ở mọi cỡ màn hình.", href: "/" },
      { kind: "improved", text: "Khung ví dụ: thanh công cụ một hàng, màn hình nhỏ chỉ còn icon; nút Code chuyển lên thanh trên.", href: "/components/button" },
      { kind: "improved", text: "Trang chủ: hero 幽玄 mới, lệnh cài npm / shadcn có nút copy, danh sách component có ô tìm và chip nhóm; trên điện thoại chạm tên để mở từng demo.", href: "/" },
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
      { kind: "new", text: "Trang Templates: preview chạy thật, tạo dự án bằng một lệnh (npx giget … --install) hoặc mở trên StackBlitz.", href: "/templates" },
      { kind: "new", text: "vite-starter — khởi đầu trắng: theme được ghi nhớ, không nháy khi tải, alias @/, SEO cơ bản và trang chào hoa anh đào 幽玄.", href: "/templates" },
      { kind: "new", text: "vite-saas — ứng dụng 8 trang có sidebar, bảng lệnh Ctrl K, thông báo; vite-blog — blog Markdown sinh HTML từng bài, sitemap.xml, rss.xml.", href: "/templates" },
      { kind: "new", text: "shadcn CLI: npx shadcn@latest init …/r/init.json (Next.js: init-next.json) tạo components.json, chép theme + cn() + YugenProvider và tự thêm @import vào CSS.", href: "/concepts/shadcn-registry" },
      { kind: "breaking", text: "Registry shadcn: component không còn tự cài theme — chạy init một lần cho mỗi dự án, hoặc add kèm …/r/theme.json. Gói npm không đổi.", href: "/concepts/shadcn-registry" },
      { kind: "improved", text: "Bắt đầu nhanh: một lệnh từ template, hoặc ba bước cho dự án có sẵn (cài gói, một dòng CSS, YugenProvider).", href: "/concepts/quick-start" },
      { kind: "improved", text: "Docs: tiêu đề và mô tả theo từng trang, Open Graph kèm ảnh chia sẻ link, JSON-LD; lộ trình SEO mới trên trang Cộng đồng.", href: "/community" },
      { kind: "improved", text: "Nút Open in StackBlitz hiện trên mọi ví dụ component.", href: "/components/button" },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-10-21",
    title: "Quote, Autocomplete & SearchBox dễ nhìn hơn",
    summary:
      "Thêm Quote cho trích dẫn có nguồn và Autocomplete — ô tìm kiếm có gợi ý, lọc không dấu; ví dụ lọc danh sách của SearchBox được thiết kế lại.",
    items: [
      { kind: "new", text: "Quote — trích dẫn có tác giả và nguồn, 3 kiểu default / subtle / emphasis.", href: "/components/quote" },
      { kind: "new", text: "Autocomplete — ô tìm kiếm có gợi ý: lọc không dấu (gõ “xoai” ra “Xoài”), tô sáng phần khớp, nhóm gợi ý, tải từ server.", href: "/components/autocomplete" },
      { kind: "improved", text: "SearchBox — ví dụ “Lọc danh sách” giờ hiển thị kết quả trong khung danh sách có số đếm, avatar và trạng thái rỗng.", href: "/components/searchbox" },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-10-21",
    title: "DataGrid, bộ AI, registry shadcn & kiểm thử tự động",
    summary:
      "Thêm DataGrid, bộ component AI (StreamingMarkdown, Citation, Reasoning, PromptInput), Tour, NotificationCenter, FileUpload, Stepper, TimePicker, Overflow và biểu đồ Scatter / Heatmap; cài từng component bằng shadcn CLI; docs nạp nhanh hơn, có tiếng Anh và hơn 800 bài test tự động.",
    items: [
      { kind: "new", text: "DataGrid — sắp xếp, chọn dòng, đổi cỡ cột, ảo hoá 10 000 dòng.", href: "/components/datagrid" },
      { kind: "new", text: "Bộ AI: StreamingMarkdown an toàn, Citation, Reasoning, PromptInput có đính kèm.", href: "/components/streamingmarkdown" },
      { kind: "new", text: "Tour hướng dẫn có spotlight và NotificationCenter (popover / bottom sheet).", href: "/components/tour" },
      { kind: "new", text: "FileUpload, Stepper / Wizard và mẫu form react-hook-form + zod.", href: "/components/fileupload" },
      { kind: "new", text: "TimePicker, preset cho DateRangePicker và Overflow tự ẩn bớt item.", href: "/components/timepicker" },
      { kind: "new", text: "ScatterChart, Heatmap, AreaChart 100% và zoom / brush.", href: "/components/scatterchart" },
      { kind: "new", text: "Cài component dạng mã nguồn bằng shadcn CLI: npx shadcn add …/r/<tên>.json.", href: "/concepts/shadcn-registry" },
      { kind: "new", text: "Theme Designer xuất JSON (W3C Design Tokens, Tokens Studio).", href: "/theme-designer" },
      { kind: "improved", text: "Docs nạp lười từng trang (JS lần đầu 970 kB → 108 kB), có bản tiếng Anh và menu chọn phiên bản.", href: "/" },
      { kind: "improved", text: "Nút StackBlitz cho mọi ví dụ và chính sách phiên bản / deprecate.", href: "/concepts/versioning" },
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
      { kind: "new", text: "Trace — minh bạch từng bước của agent AI, CI hay quá trình triển khai.", href: "/components/trace" },
      { kind: "new", text: "Questionnaire — khảo sát nhiều bước kiểu một-câu-một-màn-hình.", href: "/components/questionnaire" },
      { kind: "new", text: "Message Scroller, Message Bubble, Typing Indicator và Chat Composer cho giao diện hội thoại.", href: "/components/messagescroller" },
      { kind: "new", text: "Code Block có highlight, số dòng, diff, tab nhiều file và tab trình quản lý gói.", href: "/components/codeblock" },
      { kind: "new", text: "Chart (Bar, Line, Area, Donut, Sparkline, StatTile) theo quy trình trực quan hoá có kiểm định màu.", href: "/components/barchart" },
      { kind: "new", text: "Sheet — side panel trên desktop, bottom sheet kéo được trên mobile.", href: "/components/sheet" },
      { kind: "new", text: "Wait UX: Button loading, useSpinDelay, PageProgress, AsyncContent, ErrorState và Skeleton dựng sẵn.", href: "/concepts/wait-ux" },
      { kind: "improved", text: "Carousel có loop, autoplay kèm tiến độ, peek và thumbnail; Accordion thêm kiểu separated / outline.", href: "/components/carousel" },
      { kind: "improved", text: "Resizable có panel thu gọn được và lưu bố cục.", href: "/components/resizable" },
      { kind: "new", text: "Gói npm yugen-ui với theme.css (Tailwind v4), styles.css (không cần Tailwind) và type declarations.", href: "/concepts/quick-start" },
      { kind: "new", text: "Trang Cộng đồng và trang Có gì mới.", href: "/community" },
      { kind: "fixed", text: "Toàn bộ class Tailwind ở dạng canonical (script lint:classes) — không còn cảnh báo suggestCanonicalClasses." },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-20",
    title: "Khái niệm, RTL & tương phản cao",
    summary: "Tài liệu chuyên sâu kiểu Storybook, hỗ trợ hướng chữ phải-sang-trái và theme tương phản cao.",
    items: [
      { kind: "new", text: "16 trang Khái niệm: bắt đầu nhanh, styling, theming, slot, định vị, RTL, SSR, khả năng tiếp cận, chuyển đổi.", href: "/concepts/introduction" },
      { kind: "new", text: "Thanh công cụ Theme (Yugen / Web / Teams × Light / Dark, Tương phản cao) và công tắc LTR / RTL." },
      { kind: "new", text: "YugenProvider — theme, brand, hướng chữ lồng được; bề mặt portal tự theo provider.", href: "/concepts/theming" },
      { kind: "new", text: "Theme Designer sinh brand ramp 16 bậc kèm kiểm tra tương phản.", href: "/theme-designer" },
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
      { kind: "new", text: "47 component mới theo danh mục Fluent 2 và shadcn/ui.", href: "/" },
      { kind: "new", text: "Blocks — cụm giao diện ghép sẵn, copy nguyên file.", href: "/blocks" },
      { kind: "new", text: "Gradient Sakura / Dusk / Sunset, logo enso hoa anh đào." },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-20",
    title: "Ngôn ngữ thiết kế theo Fluent 2",
    summary: "Trang Màu sắc, Typography, Spacing, Bo góc, Elevation, Motion; quy tắc màu và gradient.",
    items: [
      { kind: "new", text: "Trang Màu sắc với bảng tương phản tính trực tiếp từ token.", href: "/foundations/color" },
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
    version: "0.5.1",
    upcoming: true,
    date: "2026-11-10",
    title: "Template Glass: mùa hoa anh đào ở Nhật Bản",
    summary: "Template Glass có thêm bốn chuyến đi ở Nhật Bản, khúc xạ ở mép glass, khung xem trước trên ảnh trong trang Cài đặt và bản đồ thế giới ở trang Khám phá.",
    items: [
      { kind: "improved", text: "npx create-yugen-ui@latest my-app --template glass: chuyến đi ở Kyoto, Tokyo, Hirosaki và quanh núi Phú Sĩ, GlassRefraction ở gốc app, trang Cài đặt xem trước trên ảnh sáng, ảnh hoa và ảnh đêm, trang Khám phá là bản đồ thế giới với ghim theo toạ độ thật. Template ghim yugen-ui@^0.13.0.", href: "/templates" },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-10-27",
    title: "Template Glass, Landing, Admin và Next.js",
    summary: "Thêm template Glass (nhật ký du lịch với điều hướng glass), Landing (trang giới thiệu sản phẩm), Admin (trang quản trị khách hàng và đơn hàng) và Next.js starter (App Router).",
    items: [
      { kind: "new", text: "create --template landing: trang giới thiệu sản phẩm với bảng giá, hỏi đáp và form đăng ký; màn hình đầu và thẻ SEO sinh sẵn lúc build; tiếng Anh hoặc tiếng Việt (--lang vi).", href: "/templates" },
      { kind: "new", text: "create --template admin: trang quản trị với DataGrid phân trang trên server, form trong Drawer có kiểm tra, cập nhật lạc quan và đăng nhập có mã OTP; tiếng Anh hoặc tiếng Việt (--lang vi).", href: "/templates" },
      { kind: "new", text: "create --template next-starter: dự án Next.js App Router, theme lưu trong cookie để server render đúng theme ngay từ HTML đầu tiên; có tiếng Việt với --lang vi.", href: "/concepts/ssr" },
      { kind: "new", text: "create --template glass: nhật ký du lịch với sidebar, thanh tab, toolbar và bottom sheet bằng glass nổi trên ảnh; tiếng Anh hoặc tiếng Việt (--lang vi).", href: "/templates" },
      { kind: "new", text: "create --template docs: trang tài liệu từ Markdown với sidebar theo thư mục, tìm kiếm Ctrl K và HTML sinh sẵn cho từng trang; tiếng Anh hoặc tiếng Việt (--lang vi).", href: "/templates" },
      { kind: "new", text: "create --template store: cửa hàng nhỏ với bộ lọc trong URL, giỏ hàng trong Sheet và thanh toán nhiều bước có kiểm tra; giá theo USD hoặc VND tuỳ ngôn ngữ (--lang vi).", href: "/templates" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-25",
    title: "diff, update, remove, theme và template mới",
    summary: "Cập nhật mã đã chép theo registry, gỡ component, sinh màu thương hiệu và tự bọc YugenProvider.",
    items: [
      { kind: "new", text: "yugen diff và yugen update: so mã đã chép với registry, xem diff rồi áp bản mới (update hỏi lại trước khi ghi, --dry-run chỉ xem).", href: "/concepts/cli" },
      { kind: "new", text: "yugen remove: xoá file của component, giữ lại file còn được import ở nơi khác.", href: "/concepts/cli" },
      { kind: "new", text: "yugen theme --brand <hex>: sinh brand ramp vào yugen-brand.css (cùng thuật toán Theme Designer) và cảnh báo khi tương phản dưới 4.5:1.", href: "/concepts/cli" },
      { kind: "improved", text: "yugen init tự bọc app trong YugenProvider (main.tsx của Vite, app/layout.tsx của Next.js); create --ref lấy template từ một nhánh hoặc tag.", href: "/concepts/cli" },
      { kind: "improved", text: "create --lang en|vi có thêm template SaaS và Blog; xoá luôn thư mục src/content/<ngôn ngữ kia>/ (bài viết của blog), không chỉ file .ts.", href: "/templates" },
      { kind: "improved", text: "create --lang ghi luôn tiêu đề, description và thẻ Open Graph của ngôn ngữ đó vào index.html, để bản xem trước khi chia sẻ link và công cụ tìm kiếm thấy đúng ngôn ngữ.", href: "/templates" },
      { kind: "new", text: "Template Dashboard (4 trang, DataGrid xuất CSV) và AI chat (danh sách hội thoại, trả lời dạng stream, nối backend riêng) thành ứng dụng đầy đủ. Với --lang en, chuỗi có sẵn của component cũng là tiếng Anh; --lang vi không tải thêm gì. Template dùng yugen-ui 0.11.", href: "/templates" },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-10-23",
    title: "Template dùng Vite 8",
    summary: "App mới chạy Vite 8 và TypeScript 6; doctor không còn cảnh báo app vừa tạo.",
    items: [
      { kind: "improved", text: "Mọi template dùng Vite 8 (Rolldown), @vitejs/plugin-react 6 và TypeScript 6; chia chunk bằng codeSplitting thay cho manualChunks đã deprecated, tsconfig không còn baseUrl.", href: "/templates" },
      { kind: "fixed", text: "doctor, add, list: dự án đã cài yugen-ui mà chưa có yugen.json (app tạo bằng create, hoặc cài tay theo README) được hiểu là mode package; doctor hết cảnh báo, add in sẵn dòng import thay vì đòi chạy yugen init.", href: "/concepts/cli" },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-23",
    title: "Node.js 22, --lang và template mới",
    summary: "create chọn được ngôn ngữ cho starter; cần Node.js 22 trở lên.",
    items: [
      { kind: "breaking", text: "Cần Node.js 22 trở lên (Node.js 20 đã hết hỗ trợ).", href: "/concepts/cli" },
      { kind: "new", text: "create --lang en|vi chọn ngôn ngữ chữ trong app với template có cả hai (starter). Không truyền thì hỏi khi chạy tương tác; mặc định tiếng Anh.", href: "/concepts/cli" },
      { kind: "improved", text: "Template có tên ngắn trong trình chọn; starter tối giản bằng tiếng Anh, chữ nằm trong src/content/; app mới dùng React 19.", href: "/templates" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-22",
    title: "Bản đầu tiên",
    summary: "Tạo app từ template, thiết lập dự án có sẵn và chép mã nguồn component bằng một công cụ dòng lệnh.",
    items: [
      { kind: "new", text: "create: tạo app từ template starter, saas, blog, dashboard hoặc ai-chat. Template đóng gói sẵn nên không cần mạng.", href: "/concepts/cli" },
      { kind: "new", text: "init: thiết lập dự án React có sẵn bằng gói npm hoặc chép mã nguồn, ghi cấu hình vào yugen.json.", href: "/concepts/cli" },
      { kind: "new", text: "add và list: chép component kèm component phụ thuộc, cài gói npm còn thiếu, tìm trong registry.", href: "/concepts/cli" },
      { kind: "new", text: "doctor: kiểm tra React, Tailwind CSS v4, import theme, phiên bản yugen-ui và YugenProvider.", href: "/concepts/cli" },
    ],
  },
];

/** Tab create-yugen-ui (packages/create-yugen-ui) — chỉ phát hành cùng bản CLI ổn định. Mục đầu = version của gói. */
export const CREATE_NEWS: NewsRelease[] = [
  {
    version: "0.5.0",
    date: "2026-10-27",
    title: "Theo @yugen-ui/cli 0.5.0",
    summary: "Cùng các thay đổi của @yugen-ui/cli 0.5.0: template Glass, Landing, Admin và Next.js starter.",
    items: [
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template glass.", href: "/templates" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template landing.", href: "/templates" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template admin.", href: "/templates" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template next-starter.", href: "/concepts/ssr" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template docs.", href: "/templates" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template store.", href: "/templates" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-25",
    title: "Theo @yugen-ui/cli 0.4.0",
    summary: "Cùng các thay đổi của @yugen-ui/cli 0.4.0: template Dashboard và AI chat đầy đủ, mọi template có tiếng Anh và tiếng Việt.",
    items: [
      { kind: "new", text: "npx create-yugen-ui@latest có template Dashboard và AI chat đầy đủ; --lang en|vi dùng được cho mọi template.", href: "/templates" },
      { kind: "improved", text: "--lang ghi đúng ngôn ngữ vào index.html (tiêu đề, description, Open Graph) và chuỗi có sẵn của component.", href: "/concepts/cli" },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-10-23",
    title: "Theo @yugen-ui/cli 0.3.0",
    summary: "Cùng các thay đổi của @yugen-ui/cli 0.3.0: template dùng Vite 8 và TypeScript 6.",
    items: [{ kind: "improved", text: "npx create-yugen-ui@latest tạo app Vite 8 + TypeScript 6.", href: "/concepts/cli" }],
  },
  {
    version: "0.2.0",
    date: "2026-10-23",
    title: "Theo @yugen-ui/cli 0.2.0",
    summary: "Cùng các thay đổi của @yugen-ui/cli 0.2.0.",
    items: [
      { kind: "breaking", text: "Cần Node.js 22 trở lên.", href: "/concepts/cli" },
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template starter --lang vi tạo starter bằng tiếng Việt.", href: "/concepts/cli" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-22",
    title: "Bản đầu tiên",
    summary: "npx create-yugen-ui@latest tạo app từ template, giống lệnh create của @yugen-ui/cli.",
    items: [
      { kind: "new", text: "npx create-yugen-ui@latest my-app --template starter chép template, cài phụ thuộc và khởi tạo git.", href: "/concepts/cli" },
    ],
  },
];
