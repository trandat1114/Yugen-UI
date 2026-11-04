import { useState } from "react";
import {
  BookOpen20Regular,
  ChartMultiple20Regular,
  Code20Regular,
  Navigation20Regular,
  News20Regular,
  People20Regular,
  Search20Regular,
  ShieldLock20Regular,
} from "@fluentui/react-icons";
import {
  Button,
  DrawerBody,
  DrawerClose,
  DrawerHeader,
  DrawerHeaderTitle,
  ErrorBoundary,
  Nav,
  NavCategory,
  NavCategoryItem,
  NavItem,
  NavSubItem,
  NavSubItemGroup,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  OverlayDrawer,
  StatusPage,
  ToggleGroup,
  ToggleGroupItem,
  type StatusPageStatus,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./site-pages.tsx?raw";

/* `code` của ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`). */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");
function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      return start < 0 || end < 0 ? `// Không tìm thấy "${name}"` : LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

/* ======================================================================== NavigationMenu */

// #region NavigationHero
const PRODUCTS = [
  { href: "#analytics", title: "Analytics", description: "Dashboards and reports for every team", icon: <ChartMultiple20Regular /> },
  { href: "#security", title: "Security", description: "Single sign-on, audit logs and roles", icon: <ShieldLock20Regular /> },
  { href: "#api", title: "Developer API", description: "REST and webhooks with typed SDKs", icon: <Code20Regular /> },
  { href: "#teams", title: "Teams", description: "Shared workspaces and permissions", icon: <People20Regular /> },
];

function NavigationHero() {
  return (
    // min-h: room for the open panel, which floats below the header.
    <div className="min-h-88 w-full">
      <header className="flex w-full items-center gap-6 rounded-medium border border-stroke-2 bg-background-1 px-4 py-2">
        <span className="font-semibold text-foreground-1">Sakura Studio</span>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[min(28rem,calc(100vw-4rem))] gap-1 sm:grid-cols-2">
                  {PRODUCTS.map((p) => (
                    <li key={p.href}>
                      <NavigationMenuLink href={p.href} icon={p.icon} description={p.description}>
                        {p.title}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-72 gap-1">
                  <li>
                    <NavigationMenuLink href="#docs" icon={<BookOpen20Regular />} description="Guides and API reference">
                      Documentation
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#blog" icon={<News20Regular />} description="Product news and stories">
                      Blog
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" active>
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
    </div>
  );
}
// #endregion

// #region NavigationMobile
function NavigationMobile() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    // Container query: the full menu from @2xl (42rem) of header width, a Drawer below it.
    <div className="@container w-full">
      <header className="flex items-center gap-4 rounded-medium border border-stroke-2 bg-background-1 px-4 py-2">
        <span className="font-semibold text-foreground-1">Sakura Studio</span>
        <NavigationMenu className="hidden @2xl:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#features">Features</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" active>
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button
          appearance="subtle"
          icon={<Navigation20Regular />}
          aria-label="Open menu"
          className="ms-auto @2xl:hidden"
          onClick={() => setOpen(true)}
        />
      </header>
      <OverlayDrawer open={open} onOpenChange={setOpen} position="start">
        <DrawerHeader>
          <DrawerHeaderTitle action={<DrawerClose asChild><Button appearance="subtle">Close</Button></DrawerClose>}>
            Sakura Studio
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <Nav aria-label="Main" defaultSelectedValue="pricing">
            <NavItem value="features" href="#features" onClick={close}>
              Features
            </NavItem>
            <NavItem value="pricing" href="#pricing" onClick={close}>
              Pricing
            </NavItem>
            <NavCategory value="resources">
              <NavCategoryItem>Resources</NavCategoryItem>
              <NavSubItemGroup>
                <NavSubItem value="docs" href="#docs" onClick={close}>
                  Docs
                </NavSubItem>
                <NavSubItem value="blog" href="#blog" onClick={close}>
                  Blog
                </NavSubItem>
              </NavSubItemGroup>
            </NavCategory>
          </Nav>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
}
// #endregion

// #region NavigationRouter
const PAGES = [
  { path: "/", label: "Home" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
];

function NavigationRouter() {
  // Stand-in for your router: replace <a onClick> with its Link component.
  const [path, setPath] = useState("/blog");
  return (
    <div className="flex flex-col items-start gap-3">
      <NavigationMenu aria-label="Site">
        <NavigationMenuList>
          {PAGES.map((p) => (
            <NavigationMenuItem key={p.path}>
              <NavigationMenuLink asChild active={path === p.path}>
                <a
                  href={p.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setPath(p.path);
                  }}
                >
                  {p.label}
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <span className="text-caption1 text-foreground-3">Current page: {path}</span>
    </div>
  );
}
// #endregion

// #region NavigationManual
function NavigationManual() {
  return (
    <div className="min-h-56">
      <NavigationMenu activationMode="manual" aria-label="Account">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Workspace</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-1">
                <li>
                  <NavigationMenuLink href="#members" description="Invite people and set roles">
                    Members
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#billing" description="Plan, invoices and usage">
                    Billing
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#help">Help</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
// #endregion

/* ======================================================================== StatusPage */

// #region StatusHero
function StatusHero() {
  return (
    <StatusPage
      status={404}
      headingAs="h2"
      primaryAction={
        <Button appearance="primary" icon={<Search20Regular />}>
          Search
        </Button>
      }
      secondaryAction={
        <Button asChild>
          <a href="#home">Home</a>
        </Button>
      }
    />
  );
}
// #endregion

// #region StatusGallery
const STATUSES: StatusPageStatus[] = [401, 403, 429, 500, 503, "offline", "update"];

function StatusGallery() {
  const [status, setStatus] = useState<StatusPageStatus>(500);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <ToggleGroup
        type="single"
        size="small"
        aria-label="Status"
        value={String(status)}
        onValueChange={(v) => v && setStatus(STATUSES.find((s) => String(s) === v) ?? 500)}
        className="flex-wrap"
      >
        {STATUSES.map((s) => (
          <ToggleGroupItem key={s} value={String(s)}>
            {s === "offline" ? "Offline" : s === "update" ? "Update" : s}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <StatusPage
        status={status}
        headingAs="h2"
        errorId={status === 500 ? "7f3a-91c2" : undefined}
        primaryAction={<Button appearance="primary">{status === "update" ? "Reload" : "Try again"}</Button>}
      />
    </div>
  );
}
// #endregion

// #region StatusBoundary
function Report({ broken }: { broken: boolean }) {
  if (broken) throw new Error("Report data is malformed");
  return <p className="text-body1 text-foreground-1">Revenue is up 12% this quarter.</p>;
}

function StatusBoundary() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Button onClick={() => setBroken(true)}>Break the report</Button>
      <ErrorBoundary
        // Retry renders the report again; here it works the second time.
        onError={() => setTimeout(() => setBroken(false))}
        statusPageProps={{ headingAs: "h2", className: "min-h-0 py-6" }}
      >
        <Report broken={broken} />
      </ErrorBoundary>
    </div>
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  /* ===== NavigationMenu ===== */
  {
    slug: "navigationmenu",
    name: "NavigationMenu",
    category: "Điều hướng",
    lead: "NavigationMenu là menu điều hướng cho header website: link và nút mở bảng thả xuống (mega menu).",
    description:
      "Dựng trên Radix Navigation Menu, theo mẫu WAI-ARIA disclosure navigation: `<nav>` có nhãn, nút mở bảng có `aria-expanded`, link trang hiện tại có `aria-current=\"page\"` (prop `active`). Rê chuột mở bảng sau một khoảng trễ ngắn để không mở nhầm, chuyển giữa các nút không trễ lại; `activationMode=\"manual\"` chỉ mở khi bấm. Bàn phím: Tab đi qua các mục, Enter / Space mở, mũi tên trái / phải chuyển mục, Tab vào bảng, Esc đóng và trả focus về nút. Bảng nằm trong một khung nổi đổi cỡ theo nội dung (Motion token, tắt khi giảm chuyển động); hướng RTL theo YugenProvider. Link trong bảng nhận `icon` và `description`; `asChild` để dùng Link của router. Màn hình hẹp: đặt cùng các link vào Drawer, như sidebar của AppShell.",
    importCode: `import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
} from "@/components/ui";`,
    hero: { title: "Header website", code: source("NavigationHero"), render: () => <NavigationHero />, wide: true },
    examples: [
      {
        title: "Màn hình hẹp: Drawer",
        description: "Container query: header hẹp thì ẩn menu, nút mở Drawer chứa cùng các link bằng Nav.",
        code: source("NavigationMobile"),
        render: () => <NavigationMobile />,
        wide: true,
      },
      {
        title: "Link của router (asChild) & trang hiện tại",
        description: "active đặt aria-current=\"page\" và thanh brand dưới link.",
        code: source("NavigationRouter"),
        render: () => <NavigationRouter />,
      },
      {
        title: "Chỉ mở khi bấm",
        description: "activationMode=\"manual\": rê chuột hay focus không mở bảng — hợp với màn hình cảm ứng và header dày đặc.",
        code: source("NavigationManual"),
        render: () => <NavigationManual />,
      },
    ],
    dos: [
      "Giữ 3–7 mục ở hàng trên cùng; gom trang con vào bảng thả xuống có tiêu đề và mô tả ngắn.",
      "Đánh dấu trang hiện tại bằng `active` để có `aria-current=\"page\"`.",
      "Trên màn hình hẹp, chuyển các link vào Drawer thay vì thu nhỏ menu.",
    ],
    donts: [
      "Không dùng NavigationMenu cho lệnh (Lưu, Xoá…) — dùng Menu hoặc Menubar.",
      "Không đặt nút mở bảng làm link: bấm vào nút chỉ mở bảng; trang tổng quan đặt thành một link trong bảng.",
      "Không dùng cho điều hướng trong ứng dụng có sidebar — dùng Nav / AppShell.",
    ],
    props: [
      { name: "value / defaultValue / onValueChange", type: "string / (value: string) => void", description: "Mục đang mở (controlled / uncontrolled); \"\" khi đóng." },
      { name: "activationMode", type: `"automatic" | "manual"`, defaultValue: `"automatic"`, description: "automatic: rê chuột / focus mở bảng; manual: chỉ khi bấm." },
      { name: "delayDuration / skipDelayDuration", type: "number", defaultValue: "200 / 300", description: "Độ trễ (ms) trước khi rê chuột mở bảng; thời gian chuyển sang nút khác không cần trễ lại." },
      { name: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng của danh sách và phím mũi tên." },
      { name: "aria-label", type: "string", defaultValue: `"Main"`, description: "Nhãn của thẻ <nav>." },
      { name: "viewportClassName", type: "string", description: "Class cho khung nổi chứa bảng đang mở." },
      { name: "NavigationMenuItem.value", type: "string", description: "Khoá của mục (mặc định tự sinh)." },
      { name: "NavigationMenuLink.active", type: "boolean", description: "Trang hiện tại: aria-current=\"page\" và kiểu đang chọn." },
      { name: "NavigationMenuLink.icon / description", type: "ReactNode", description: "Icon và mô tả một dòng (link trong NavigationMenuContent)." },
      { name: "NavigationMenuLink.asChild", type: "boolean", description: "Dùng phần tử con (Link của router) làm link." },
      { name: "NavigationMenuIndicator", type: "component", description: "Mũi tên nhỏ dưới nút đang mở (đặt trong NavigationMenuList)." },
      { name: "navigationMenuTriggerClass", type: "string", description: "Class của nút / link ở hàng trên cùng, cho phần tử tự dựng." },
      { name: "ref", type: "Ref<HTMLElement>", description: "Trỏ tới thẻ <nav>." },
    ],
  },

  /* ===== StatusPage ===== */
  {
    slug: "statuspage",
    name: "StatusPage & ErrorBoundary",
    category: "Phản hồi",
    lead: "StatusPage là trang trạng thái cho lỗi HTTP (404, 500, 503…), mất mạng và bản mới; ErrorBoundary hiện nó khi phần con lỗi.",
    description:
      "`status` chọn tiêu đề, mô tả và mã có sẵn (theo `messages.statusPage`): 400, 401, 403, 404, 408, 410, 429, 500, 502, 503, 504, \"offline\", \"update\". Mã hiện lớn để nhận ra ngay, kèm dòng \"Error 404\" đọc được; tiêu đề là h1 (hoặc `headingAs=\"h2\"` trong một vùng). Không tự điều hướng: truyền nút / link của router vào `primaryAction`, `secondaryAction`; `children` cho gợi ý, ô tìm kiếm. `errorId` hiện mã lỗi chọn được kèm nút chép; `autoFocus` đưa focus vào tiêu đề khi chuyển trang phía client. ErrorBoundary bắt lỗi render của phần con: lỗi nạp file sau khi deploy (tab mở từ trước) hiện \"Đã có phiên bản mới\" + Tải lại, lỗi khác hiện 500 + Thử lại; `resetKeys` (vd. đường dẫn) bỏ lỗi khi đổi trang. Trang 404 của chính docs dùng component này.",
    importCode: `import { StatusPage, ErrorBoundary, isChunkLoadError, statusPageCopy, type StatusPageStatus } from "@/components/ui";`,
    hero: { title: "404", code: source("StatusHero"), render: () => <StatusHero /> },
    examples: [
      {
        title: "Các trạng thái",
        description: "Chuỗi có sẵn theo status; 500 kèm mã lỗi chép được.",
        code: source("StatusGallery"),
        render: () => <StatusGallery />,
      },
      {
        title: "ErrorBoundary",
        description: "Bấm để phần con lỗi khi render: trang 500 mặc định thay chỗ, Thử lại render lại phần con.",
        code: source("StatusBoundary"),
        render: () => <StatusBoundary />,
      },
    ],
    dos: [
      "Nói chuyện gì xảy ra và làm gì tiếp; luôn có ít nhất một lối ra (Thử lại, Về trang chủ, Tìm kiếm).",
      "Đặt ErrorBoundary quanh vùng nội dung theo route, với `resetKeys` là đường dẫn, để lỗi một trang không làm trắng cả app.",
      "Gửi lỗi lên dịch vụ theo dõi trong `onError` và hiện cùng mã đó qua `errorId`.",
    ],
    donts: [
      "Không hiện stack trace hay thông báo kỹ thuật cho người dùng.",
      "Không chỉ dùng mã số làm nội dung — luôn có tiêu đề bằng chữ.",
      "Không tự tải lại trang mà không nói trước.",
    ],
    props: [
      { name: "status", type: "400 | 401 | 403 | 404 | 408 | 410 | 429 | 500 | 502 | 503 | 504 | \"offline\" | \"update\"", description: "Chọn tiêu đề, mô tả và mã có sẵn." },
      { name: "code", type: "ReactNode | null", defaultValue: "mã của status", description: "Mã hiện lớn; null để ẩn." },
      { name: "title / description", type: "ReactNode", defaultValue: "theo status", description: "Ghi đè chữ có sẵn; description={null} để ẩn." },
      { name: "primaryAction / secondaryAction", type: "ReactNode", description: "Nút / link hành động (Button, Link của router)." },
      { name: "illustration", type: "ReactNode", description: "Hình minh hoạ thay cho mã / icon có sẵn." },
      { name: "errorId", type: "string", description: "Mã lỗi để gửi hỗ trợ: chữ chọn được + nút chép." },
      { name: "headingAs", type: `"h1" | "h2"`, defaultValue: `"h1"`, description: "Thẻ của tiêu đề." },
      { name: "autoFocus", type: "boolean", defaultValue: "false", description: "Focus vào tiêu đề khi hiện (chuyển trang phía client)." },
      { name: "fullscreen", type: "boolean", defaultValue: "false", description: "Cao tối thiểu bằng màn hình." },
      { name: "children", type: "ReactNode", description: "Nội dung thêm dưới mô tả: gợi ý trang, ô tìm kiếm." },
      { name: "ref", type: "Ref<HTMLDivElement>", description: "Trỏ tới khung ngoài." },
      { name: "ErrorBoundary.fallback", type: "ReactNode | ({ error, reset }) => ReactNode", description: "Thay trang mặc định (bản mới + Tải lại, hoặc 500 + Thử lại)." },
      { name: "ErrorBoundary.onError", type: "(error, info) => void", description: "Gọi khi bắt được lỗi." },
      { name: "ErrorBoundary.resetKeys", type: "unknown[]", description: "Đổi một giá trị thì bỏ lỗi và render lại." },
      { name: "ErrorBoundary.statusPageProps", type: "StatusPageProps", description: "Truyền cho trang mặc định (vd. fullscreen khi bọc cả app)." },
      { name: "isChunkLoadError(error)", type: "(error: unknown) => boolean", description: "Lỗi nạp file JS sau khi deploy — tải lại trang là đủ." },
      { name: "statusPageCopy(status, messages?)", type: "(status, messages?) => { title, description }", description: "Chữ có sẵn của một trạng thái, vd. cho <title>." },
    ],
  },
];
