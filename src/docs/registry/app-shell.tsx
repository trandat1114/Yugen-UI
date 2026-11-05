import {
  CalendarLtr20Regular,
  Chat20Regular,
  Compose20Regular,
  Home20Regular,
  Mail20Regular,
  People20Regular,
  Settings20Regular,
} from "@fluentui/react-icons";
import {
  AppShell,
  AppShellAside,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  useAppShell,
} from "@/components/ui/AppShell/AppShell";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger } from "@/components/ui/AppShell/Sidebar";
import { Button } from "@/components/ui/Button/Button";
import { Nav, NavItem, NavSectionHeader } from "@/components/ui/Nav/Nav";
import type { ComponentDoc } from "../types";

/** Ô vuông chữ 桜 làm logo trong các demo. */
function Logo() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background font-semibold text-foreground-on-brand"
    >
      桜
    </span>
  );
}

function Placeholder() {
  return <div className="m-4 h-40 rounded-large border border-stroke-2 bg-background-1" />;
}

function AppNav() {
  return (
    <Nav defaultSelectedValue="home" aria-label="App">
      <NavItem value="home" icon={<Home20Regular />}>
        Home
      </NavItem>
      <NavItem value="inbox" icon={<Mail20Regular />}>
        Inbox
      </NavItem>
      <NavItem value="calendar" icon={<CalendarLtr20Regular />}>
        Calendar
      </NavItem>
      <NavSectionHeader>Manage</NavSectionHeader>
      <NavItem value="people" icon={<People20Regular />}>
        Members
      </NavItem>
      <NavItem value="settings" icon={<Settings20Regular />}>
        Settings
      </NavItem>
    </Nav>
  );
}

const FRAME = "h-104 w-full overflow-hidden rounded-large border border-stroke-2";

function NewChatButton() {
  const { setDrawerOpen } = useAppShell();
  return (
    <Button icon={<Compose20Regular />} className="justify-start" onClick={() => setDrawerOpen(false)}>
      New chat
    </Button>
  );
}

/** Dòng trạng thái cho demo đổi breakpoint: sidebar đang ở dạng nào. */
function BreakpointStatus() {
  const { narrow } = useAppShell();
  return <p>{narrow ? "Narrower than 42rem: the sidebar opens in a Drawer." : "42rem or wider: the sidebar is part of the layout."}</p>;
}

const NAV_CODE = `      <SidebarContent>
        <Nav defaultSelectedValue="home" aria-label="App">
          <NavItem value="home" icon={<Home20Regular />}>Home</NavItem>
          <NavItem value="inbox" icon={<Mail20Regular />}>Inbox</NavItem>
          <NavItem value="calendar" icon={<CalendarLtr20Regular />}>Calendar</NavItem>
          <NavSectionHeader>Manage</NavSectionHeader>
          <NavItem value="people" icon={<People20Regular />}>Members</NavItem>
          <NavItem value="settings" icon={<Settings20Regular />}>Settings</NavItem>
        </Nav>
      </SidebarContent>`;

export const docs: ComponentDoc[] = [
  {
    slug: "appshell",
    name: "AppShell",
    category: "Bố cục",
    lead: "AppShell là khung của ứng dụng: sidebar thu về icon hoặc mở thành Drawer, thanh trên cùng và nội dung chính.",
    description:
      "AppShell xếp các phần vào lưới: Sidebar bên trái, AppShellHeader phía trên, AppShellMain ở giữa và AppShellAside bên phải; phần nào không dùng thì không chiếm chỗ. Từ `breakpoint` (container query, theo độ rộng khung chứ không theo màn hình) sidebar nằm trong bố cục và SidebarTrigger thu nó về rail chỉ còn icon, tên mục hiện trong Tooltip. Hẹp hơn, cùng nội dung mở trong Drawer: theo một link hoặc chọn một mục Nav là Drawer đóng, focus quay về nút đã mở. Ctrl+B (⌘B) làm việc giống SidebarTrigger, trừ khi đang gõ trong ô nhập hoặc bằng bộ gõ; trang có nhiều AppShell (như trang này) thì chỉ khung đang được focus hoặc vừa được bấm vào nhận phím. `persistKey` lưu trạng thái thu gọn (và độ rộng) vào cookie; Drawer không bao giờ được lưu. Render ở server: đọc cookie bằng `readAppShellCookie(cookieHeader, key)` rồi truyền `defaultCollapsed` để không nháy. AppShell là container tên `app-shell`: phần nào cần theo độ rộng khung thì dùng `@3xl/app-shell:…`. Chiều cao thanh trên cùng đổi qua biến `--app-shell-header` (mặc định 3.5rem), SidebarHeader và các phần dính theo cùng biến. Nút SidebarTrigger có Tooltip mang nhãn và phím tắt. Các demo dưới đây nằm trong trang docs nên AppShellMain dùng `asChild` với `div` (một trang chỉ có một `<main>`).",
    importCode: `import {
  AppShell, AppShellHeader, AppShellMain, AppShellAside, AppShellFooter,
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarTrigger, SidebarRail,
  useAppShell, readAppShellCookie,
} from "@/components/ui";`,
    hero: {
      title: "Sidebar",
      code: `<div className="h-104 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell breakpoint="lg" className="h-full" skipLink={false}>
    <Sidebar resizable>
      <SidebarHeader>
        <Logo />
        <span className="truncate font-semibold in-data-rail:hidden">Sakura</span>
      </SidebarHeader>
${NAV_CODE}
      <SidebarRail />
    </Sidebar>
    <AppShellHeader>
      <SidebarTrigger />
      <span className="font-semibold">Home</span>
    </AppShellHeader>
    <AppShellMain asChild>
      <div>
        <Placeholder />
      </div>
    </AppShellMain>
  </AppShell>
</div>`,
      setup: `function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background font-semibold text-foreground-on-brand">
      桜
    </span>
  );
}

function Placeholder() {
  return <div className="m-4 h-40 rounded-large border border-stroke-2 bg-background-1" />;
}`,
      render: () => (
        <div className={FRAME}>
          <AppShell breakpoint="lg" className="h-full" skipLink={false}>
            <Sidebar resizable>
              <SidebarHeader>
                <Logo />
                <span className="truncate font-semibold in-data-rail:hidden">Sakura</span>
              </SidebarHeader>
              <SidebarContent>
                <AppNav />
              </SidebarContent>
              <SidebarRail />
            </Sidebar>
            <AppShellHeader>
              <SidebarTrigger />
              <span className="font-semibold">Home</span>
            </AppShellHeader>
            <AppShellMain asChild>
              <div>
                <Placeholder />
              </div>
            </AppShellMain>
          </AppShell>
        </div>
      ),
    },
    examples: [
      {
        title: "Khung hẹp",
        description: "Hẹp hơn breakpoint, SidebarTrigger mở sidebar trong Drawer. Chọn một mục là Drawer đóng.",
        code: `<div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell className="h-full" skipLink={false}>
    <Sidebar>
${NAV_CODE}
    </Sidebar>
    <AppShellHeader>
      <SidebarTrigger />
      <span className="font-semibold">Home</span>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="p-4">Page content</div>
    </AppShellMain>
  </AppShell>
</div>`,
        render: () => (
          <div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
            <AppShell className="h-full" skipLink={false}>
              <Sidebar>
                <SidebarContent>
                  <AppNav />
                </SidebarContent>
              </Sidebar>
              <AppShellHeader>
                <SidebarTrigger />
                <span className="font-semibold">Home</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Page content</div>
              </AppShellMain>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Đổi breakpoint",
        wide: true,
        description:
          "breakpoint=\"2xl\" (42rem). Mốc đo theo độ rộng của AppShell chứ không theo màn hình: kéo góc dưới của khung để thử. Qua mốc khi Drawer đang mở thì Drawer đóng, focus về SidebarTrigger, nút bị ẩn thì về nội dung; trạng thái thu gọn giữ nguyên. Phần tự làm cần đổi cùng lúc thì dùng `@2xl/app-shell:…`, hoặc `useAppShell().narrow` cho hành vi (luôn là false khi render ở server). `md:` và useMediaQuery theo màn hình nên sẽ lệch mốc.",
        code: `function BreakpointStatus() {
  const { narrow } = useAppShell();
  return <p>{narrow ? "Narrower than 42rem: the sidebar opens in a Drawer." : "42rem or wider: the sidebar is part of the layout."}</p>;
}

function ResizableShell() {
  return (
    <div className="h-72 w-full min-w-64 max-w-full resize-x overflow-hidden rounded-large border border-stroke-2">
      <AppShell breakpoint="2xl" className="h-full" skipLink={false}>
        <Sidebar>
${NAV_CODE.replace(/^/gm, "    ")}
        </Sidebar>
        <AppShellHeader>
          <SidebarTrigger />
          <span className="font-semibold">Home</span>
        </AppShellHeader>
        <AppShellMain asChild>
          <div className="space-y-3 p-4">
            <BreakpointStatus />
            <div className="grid gap-3 @2xl/app-shell:grid-cols-2">
              <div className="h-20 rounded-large border border-stroke-2 bg-background-1" />
              <div className="h-20 rounded-large border border-stroke-2 bg-background-1" />
            </div>
          </div>
        </AppShellMain>
      </AppShell>
    </div>
  );
}`,
        render: () => (
          <div className="h-72 w-full min-w-64 max-w-full resize-x overflow-hidden rounded-large border border-stroke-2">
            <AppShell breakpoint="2xl" className="h-full" skipLink={false}>
              <Sidebar>
                <SidebarContent>
                  <AppNav />
                </SidebarContent>
              </Sidebar>
              <AppShellHeader>
                <SidebarTrigger />
                <span className="font-semibold">Home</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="space-y-3 p-4">
                  <BreakpointStatus />
                  <div className="grid gap-3 @2xl/app-shell:grid-cols-2">
                    <div className="h-20 rounded-large border border-stroke-2 bg-background-1" />
                    <div className="h-20 rounded-large border border-stroke-2 bg-background-1" />
                  </div>
                </div>
              </AppShellMain>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Sidebar + cột phụ",
        wide: true,
        description:
          "AppShellAside nằm bên phải nội dung, chỉ hiện từ breakpoint. Trên màn hẹp, đưa nội dung của nó vào Sheet hoặc một trang riêng.",
        code: `<div className="h-104 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell breakpoint="lg" defaultCollapsed className="h-full" skipLink={false}>
    <Sidebar>
${NAV_CODE}
    </Sidebar>
    <AppShellHeader>
      <SidebarTrigger />
      <span className="font-semibold">Inbox</span>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="p-4">Message list</div>
    </AppShellMain>
    <AppShellAside className="w-56 p-4" aria-label="Details">
      <p className="font-semibold">Details</p>
      <p className="text-caption1 text-foreground-3">Sender, attachments, labels.</p>
    </AppShellAside>
  </AppShell>
</div>`,
        render: () => (
          <div className={FRAME}>
            <AppShell breakpoint="lg" defaultCollapsed className="h-full" skipLink={false}>
              <Sidebar>
                <SidebarContent>
                  <AppNav />
                </SidebarContent>
              </Sidebar>
              <AppShellHeader>
                <SidebarTrigger />
                <span className="font-semibold">Inbox</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Message list</div>
              </AppShellMain>
              <AppShellAside className="w-56 p-4" aria-label="Details">
                <p className="font-semibold">Details</p>
                <p className="text-caption1 text-foreground-3">Sender, attachments, labels.</p>
              </AppShellAside>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Trang nội dung: cả trang cuộn",
        wide: true,
        description:
          "Không có Sidebar, cột của nó rộng 0. scroll=\"page\" cho site nội dung (blog, cửa hàng, landing): cả trang cuộn, thanh trên cùng dính lại, AppShellFooter ở cuối trang. Trong một vùng tự cuộn như khung này, vùng đó thay cho cửa sổ.",
        code: `<div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell scroll="page" className="h-full min-h-0 overflow-y-auto" skipLink={false}>
    <AppShellHeader>
      <span className="me-auto font-semibold">Sakura</span>
      <Button appearance="subtle">Products</Button>
      <Button appearance="primary">Sign in</Button>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="flex flex-col gap-3 p-4">
        <div className="h-40 rounded-large border border-stroke-2 bg-background-1" />
        <div className="h-40 rounded-large border border-stroke-2 bg-background-1" />
      </div>
    </AppShellMain>
    <AppShellFooter asChild>
      <div className="p-4 text-caption1 text-foreground-3">© Sakura</div>
    </AppShellFooter>
  </AppShell>
</div>`,
        render: () => (
          <div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
            <AppShell scroll="page" className="h-full min-h-0 overflow-y-auto" skipLink={false}>
              <AppShellHeader>
                <span className="me-auto font-semibold">Sakura</span>
                <Button appearance="subtle">Products</Button>
                <Button appearance="primary">Sign in</Button>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-40 rounded-large border border-stroke-2 bg-background-1" />
                  <div className="h-40 rounded-large border border-stroke-2 bg-background-1" />
                </div>
              </AppShellMain>
              <AppShellFooter asChild>
                <div className="p-4 text-caption1 text-foreground-3">© Sakura</div>
              </AppShellFooter>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Thanh trên cùng trải ngang",
        wide: true,
        description: "layout=\"header\": thanh trên cùng (logo, tìm kiếm, tài khoản) trải hết chiều ngang, sidebar nằm bên dưới. Hợp với trang quản trị.",
        code: `<div className="h-104 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell layout="header" breakpoint="lg" className="h-full" skipLink={false}>
    <AppShellHeader>
      <SidebarTrigger />
      <Logo />
      <span className="font-semibold">Sakura Admin</span>
    </AppShellHeader>
    <Sidebar defaultWidth={224}>
${NAV_CODE}
    </Sidebar>
    <AppShellMain asChild>
      <div className="p-4">Customer list</div>
    </AppShellMain>
  </AppShell>
</div>`,
        setup: `function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-medium bg-brand-background font-semibold text-foreground-on-brand">
      桜
    </span>
  );
}`,
        render: () => (
          <div className={FRAME}>
            <AppShell layout="header" breakpoint="lg" className="h-full" skipLink={false}>
              <AppShellHeader>
                <SidebarTrigger />
                <Logo />
                <span className="font-semibold">Sakura Admin</span>
              </AppShellHeader>
              <Sidebar defaultWidth={224}>
                <SidebarContent>
                  <AppNav />
                </SidebarContent>
              </Sidebar>
              <AppShellMain asChild>
                <div className="p-4">Customer list</div>
              </AppShellMain>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Ẩn hẳn sidebar & useAppShell",
        wide: true,
        description:
          "collapsible=\"offcanvas\" cho danh sách không có icon (hội thoại, tệp): thu gọn là ẩn hẳn. Nút trong sidebar không phải link thì tự đóng Drawer bằng useAppShell().",
        code: `function NewChatButton() {
  const { setDrawerOpen } = useAppShell();
  return (
    <Button icon={<Compose20Regular />} className="justify-start" onClick={() => setDrawerOpen(false)}>
      New chat
    </Button>
  );
}

function ChatShell() {
  return (
    <div className="h-104 w-full overflow-hidden rounded-large border border-stroke-2">
      <AppShell breakpoint="lg" className="h-full" skipLink={false}>
        <Sidebar collapsible="offcanvas" defaultWidth={240}>
          <SidebarHeader>
            <Chat20Regular />
            <span className="font-semibold">Assistant</span>
          </SidebarHeader>
          <SidebarContent>
            <Nav defaultSelectedValue="a" aria-label="Conversations">
              <NavItem value="a">Weekly plan</NavItem>
              <NavItem value="b">Report summary</NavItem>
              <NavItem value="c">Translate email</NavItem>
            </Nav>
          </SidebarContent>
          <SidebarFooter>
            <NewChatButton />
          </SidebarFooter>
        </Sidebar>
        <AppShellHeader>
          <SidebarTrigger />
          <span className="font-semibold">Weekly plan</span>
        </AppShellHeader>
        <AppShellMain asChild>
          <div className="p-4">Messages</div>
        </AppShellMain>
      </AppShell>
    </div>
  );
}`,
        render: () => (
          <div className={FRAME}>
            <AppShell breakpoint="lg" className="h-full" skipLink={false}>
              <Sidebar collapsible="offcanvas" defaultWidth={240}>
                <SidebarHeader>
                  <Chat20Regular />
                  <span className="font-semibold">Assistant</span>
                </SidebarHeader>
                <SidebarContent>
                  <Nav defaultSelectedValue="a" aria-label="Conversations">
                    <NavItem value="a">Weekly plan</NavItem>
                    <NavItem value="b">Report summary</NavItem>
                    <NavItem value="c">Translate email</NavItem>
                  </Nav>
                </SidebarContent>
                <SidebarFooter>
                  <NewChatButton />
                </SidebarFooter>
              </Sidebar>
              <AppShellHeader>
                <SidebarTrigger />
                <span className="font-semibold">Weekly plan</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Messages</div>
              </AppShellMain>
            </AppShell>
          </div>
        ),
      },
    ],
    dos: [
      "Đặt AppShell ở gốc ứng dụng, cao bằng màn hình; nội dung cuộn trong AppShellMain.",
      "Mỗi NavItem trong sidebar có icon khi dùng collapsible=\"icon\", để rail vẫn dùng được.",
      "Dùng persistKey để người dùng mở lại ứng dụng vẫn thấy sidebar như lần trước.",
    ],
    donts: [
      "Không đặt phần tử khác ngoài các phần của AppShell trực tiếp trong AppShell: lưới sẽ xếp nó vào ô trống.",
      "Không lồng AppShellMain (thẻ <main>) trong một trang đã có <main>; dùng asChild với div.",
      "Không đổi Ctrl+B sang phím trùng phím tắt của trình duyệt hay của ô soạn thảo.",
    ],
    props: [
      { name: "breakpoint", type: `"lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"`, defaultValue: `"4xl"`, description: "Độ rộng của AppShell (không phải màn hình) từ đó sidebar nằm trong bố cục và AppShellAside hiện: 32 / 36 / 42 / 48 / 56 / 64rem, trùng mốc container query `@lg` … `@5xl`. Hẹp hơn là Drawer." },
      { name: "layout", type: `"sidebar" | "header"`, defaultValue: `"sidebar"`, description: "sidebar: sidebar cao hết khung, thanh trên cùng bên cạnh. header: thanh trên cùng trải ngang, sidebar bên dưới." },
      { name: "scroll", type: `"main" | "page"`, defaultValue: `"main"`, description: "main: khung cao bằng màn hình, AppShellMain tự cuộn (ứng dụng). page: cả trang cuộn, thanh trên cùng và sidebar dính lại (site nội dung)." },
      { name: "collapsed / defaultCollapsed", type: "boolean", defaultValue: "false", description: "Sidebar thu gọn trên màn rộng." },
      { name: "onCollapsedChange", type: "(collapsed: boolean) => void", description: "Gọi khi thu gọn / mở rộng." },
      { name: "persistKey", type: "string", description: "Tên cookie lưu trạng thái thu gọn và độ rộng; giá trị đã lưu thắng defaultCollapsed, cookie thiếu hoặc hỏng thì dùng defaultCollapsed. Chỉ gồm chữ, số, _ và -: tên khác thì không lưu gì (có cảnh báo khi phát triển). Cookie chỉ chứa collapsed hoặc expanded, kèm độ rộng (px) khi Sidebar resizable đã được kéo. Cookie đặt ở path=/ với samesite=lax, thêm secure trên https, nên mỗi ứng dụng cùng domain cần một tên riêng." },
      { name: "shortcut", type: "string | false", defaultValue: `"b"`, description: "Phím đi cùng Ctrl / ⌘; false để tắt. Nhiều AppShell trên một trang: chỉ khung đang được focus hoặc vừa được bấm vào nhận phím." },
      { name: "skipLink", type: "boolean", defaultValue: "true", description: "Link “Chuyển tới nội dung” hiện khi được focus." },
      { name: "Sidebar.collapsible", type: `"icon" | "offcanvas" | "none"`, defaultValue: `"icon"`, description: "Thu về rail chỉ icon, ẩn hẳn, hoặc luôn mở." },
      { name: "Sidebar.resizable", type: "boolean", defaultValue: "false", description: "SidebarRail thành thanh chia kéo đổi độ rộng (mũi tên, Home / End, Enter thu gọn)." },
      { name: "Sidebar.defaultWidth / minWidth / maxWidth", type: "number", defaultValue: "256 / 200 / 400", description: "Độ rộng khi mở, px." },
      { name: "Sidebar.label", type: "string", description: "Tên của Drawer trên màn hẹp." },
      { name: "SidebarGroup.label", type: "ReactNode", description: "Tên nhóm; trong rail chỉ còn cho trình đọc màn hình." },
      { name: "AppShellHeader / AppShellMain / AppShellAside / AppShellFooter.asChild", type: "boolean", description: "Đổi thẻ header / main / aside / footer sang phần tử con." },
      { name: "useAppShell()", type: "AppShellState", description: "narrow, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggleSidebar, rail." },
      { name: "readAppShellCookie(cookie, persistKey)", type: "{ collapsed, width? } | undefined", description: "Đọc trạng thái đã lưu từ document.cookie hoặc header Cookie khi render ở server. Gọi được trong Server Component khi import từ yugen-ui (gốc gói)." },
    ],
  },
];
