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
  AppShellHeader,
  AppShellMain,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useAppShell,
} from "@/components/ui/AppShell/AppShell";
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
    <Nav defaultSelectedValue="home" aria-label="Ứng dụng">
      <NavItem value="home" icon={<Home20Regular />}>
        Trang chủ
      </NavItem>
      <NavItem value="inbox" icon={<Mail20Regular />}>
        Hộp thư
      </NavItem>
      <NavItem value="calendar" icon={<CalendarLtr20Regular />}>
        Lịch
      </NavItem>
      <NavSectionHeader>Quản lý</NavSectionHeader>
      <NavItem value="people" icon={<People20Regular />}>
        Thành viên
      </NavItem>
      <NavItem value="settings" icon={<Settings20Regular />}>
        Cài đặt
      </NavItem>
    </Nav>
  );
}

const FRAME = "h-104 w-full overflow-hidden rounded-large border border-stroke-2";

function NewChatButton() {
  const { setDrawerOpen } = useAppShell();
  return (
    <Button icon={<Compose20Regular />} className="justify-start" onClick={() => setDrawerOpen(false)}>
      Đoạn chat mới
    </Button>
  );
}

const NAV_CODE = `      <SidebarContent>
        <Nav defaultSelectedValue="home" aria-label="Ứng dụng">
          <NavItem value="home" icon={<Home20Regular />}>Trang chủ</NavItem>
          <NavItem value="inbox" icon={<Mail20Regular />}>Hộp thư</NavItem>
          <NavItem value="calendar" icon={<CalendarLtr20Regular />}>Lịch</NavItem>
          <NavSectionHeader>Quản lý</NavSectionHeader>
          <NavItem value="people" icon={<People20Regular />}>Thành viên</NavItem>
          <NavItem value="settings" icon={<Settings20Regular />}>Cài đặt</NavItem>
        </Nav>
      </SidebarContent>`;

export const docs: ComponentDoc[] = [
  {
    slug: "appshell",
    name: "AppShell",
    category: "Bố cục",
    lead: "AppShell là khung của ứng dụng: sidebar thu về icon hoặc mở thành Drawer, thanh trên cùng và nội dung chính.",
    description:
      "AppShell xếp các phần vào lưới: Sidebar bên trái, AppShellHeader phía trên, AppShellMain ở giữa và AppShellAside bên phải; phần nào không dùng thì không chiếm chỗ. Từ `breakpoint` (container query, theo độ rộng khung chứ không theo màn hình) sidebar nằm trong bố cục và SidebarTrigger thu nó về rail chỉ còn icon, tên mục hiện trong Tooltip. Hẹp hơn, cùng nội dung mở trong Drawer: theo một link hoặc chọn một mục Nav là Drawer đóng, focus quay về nút đã mở. Ctrl+B (⌘B) làm việc giống SidebarTrigger, trừ khi đang gõ trong ô nhập hoặc bằng bộ gõ; trang có nhiều AppShell (như trang này) thì chỉ khung đang được focus hoặc vừa được bấm vào nhận phím. `persistKey` lưu trạng thái thu gọn (và độ rộng) vào cookie; Drawer không bao giờ được lưu. Render ở server: đọc cookie bằng `readAppShellCookie(cookieHeader, key)` rồi truyền `defaultCollapsed` để không nháy. Các demo dưới đây nằm trong trang docs nên AppShellMain dùng `asChild` với `div` (một trang chỉ có một `<main>`).",
    importCode: `import {
  AppShell, AppShellHeader, AppShellMain, AppShellAside,
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
      <span className="font-semibold">Trang chủ</span>
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
              <span className="font-semibold">Trang chủ</span>
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
      <span className="font-semibold">Trang chủ</span>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="p-4">Nội dung trang</div>
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
                <span className="font-semibold">Trang chủ</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Nội dung trang</div>
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
      <span className="font-semibold">Hộp thư</span>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="p-4">Danh sách thư</div>
    </AppShellMain>
    <AppShellAside className="w-56 p-4" aria-label="Chi tiết">
      <p className="font-semibold">Chi tiết</p>
      <p className="text-caption1 text-foreground-3">Người gửi, tệp đính kèm, nhãn.</p>
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
                <span className="font-semibold">Hộp thư</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Danh sách thư</div>
              </AppShellMain>
              <AppShellAside className="w-56 p-4" aria-label="Chi tiết">
                <p className="font-semibold">Chi tiết</p>
                <p className="text-caption1 text-foreground-3">Người gửi, tệp đính kèm, nhãn.</p>
              </AppShellAside>
            </AppShell>
          </div>
        ),
      },
      {
        title: "Chỉ thanh trên cùng",
        wide: true,
        description: "Không có Sidebar: cột của nó rộng 0, AppShellHeader trải hết chiều ngang.",
        code: `<div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
  <AppShell className="h-full" skipLink={false}>
    <AppShellHeader>
      <span className="me-auto font-semibold">Sakura</span>
      <Button appearance="subtle">Sản phẩm</Button>
      <Button appearance="subtle">Bảng giá</Button>
      <Button appearance="primary">Đăng nhập</Button>
    </AppShellHeader>
    <AppShellMain asChild>
      <div className="p-4">Nội dung trang</div>
    </AppShellMain>
  </AppShell>
</div>`,
        render: () => (
          <div className="h-72 w-full overflow-hidden rounded-large border border-stroke-2">
            <AppShell className="h-full" skipLink={false}>
              <AppShellHeader>
                <span className="me-auto font-semibold">Sakura</span>
                <Button appearance="subtle">Sản phẩm</Button>
                <Button appearance="subtle">Bảng giá</Button>
                <Button appearance="primary">Đăng nhập</Button>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Nội dung trang</div>
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
      Đoạn chat mới
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
            <span className="font-semibold">Trợ lý</span>
          </SidebarHeader>
          <SidebarContent>
            <Nav defaultSelectedValue="a" aria-label="Hội thoại">
              <NavItem value="a">Kế hoạch tuần</NavItem>
              <NavItem value="b">Tóm tắt báo cáo</NavItem>
              <NavItem value="c">Dịch email</NavItem>
            </Nav>
          </SidebarContent>
          <SidebarFooter>
            <NewChatButton />
          </SidebarFooter>
        </Sidebar>
        <AppShellHeader>
          <SidebarTrigger />
          <span className="font-semibold">Kế hoạch tuần</span>
        </AppShellHeader>
        <AppShellMain asChild>
          <div className="p-4">Tin nhắn</div>
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
                  <span className="font-semibold">Trợ lý</span>
                </SidebarHeader>
                <SidebarContent>
                  <Nav defaultSelectedValue="a" aria-label="Hội thoại">
                    <NavItem value="a">Kế hoạch tuần</NavItem>
                    <NavItem value="b">Tóm tắt báo cáo</NavItem>
                    <NavItem value="c">Dịch email</NavItem>
                  </Nav>
                </SidebarContent>
                <SidebarFooter>
                  <NewChatButton />
                </SidebarFooter>
              </Sidebar>
              <AppShellHeader>
                <SidebarTrigger />
                <span className="font-semibold">Kế hoạch tuần</span>
              </AppShellHeader>
              <AppShellMain asChild>
                <div className="p-4">Tin nhắn</div>
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
      { name: "breakpoint", type: `"lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"`, defaultValue: `"4xl"`, description: "Độ rộng khung (32 / 36 / 42 / 48 / 56 / 64rem) từ đó sidebar nằm trong bố cục; hẹp hơn là Drawer." },
      { name: "collapsed / defaultCollapsed", type: "boolean", defaultValue: "false", description: "Sidebar thu gọn trên màn rộng." },
      { name: "onCollapsedChange", type: "(collapsed: boolean) => void", description: "Gọi khi thu gọn / mở rộng." },
      { name: "persistKey", type: "string", description: "Tên cookie lưu trạng thái thu gọn và độ rộng; giá trị đã lưu thắng defaultCollapsed." },
      { name: "shortcut", type: "string | false", defaultValue: `"b"`, description: "Phím đi cùng Ctrl / ⌘; false để tắt. Nhiều AppShell trên một trang: chỉ khung đang được focus hoặc vừa được bấm vào nhận phím." },
      { name: "skipLink", type: "boolean", defaultValue: "true", description: "Link “Chuyển tới nội dung” hiện khi được focus." },
      { name: "Sidebar.collapsible", type: `"icon" | "offcanvas" | "none"`, defaultValue: `"icon"`, description: "Thu về rail chỉ icon, ẩn hẳn, hoặc luôn mở." },
      { name: "Sidebar.resizable", type: "boolean", defaultValue: "false", description: "SidebarRail thành thanh chia kéo đổi độ rộng (mũi tên, Home / End, Enter thu gọn)." },
      { name: "Sidebar.defaultWidth / minWidth / maxWidth", type: "number", defaultValue: "256 / 200 / 400", description: "Độ rộng khi mở, px." },
      { name: "Sidebar.label", type: "string", description: "Tên của Drawer trên màn hẹp." },
      { name: "SidebarGroup.label", type: "ReactNode", description: "Tên nhóm; trong rail chỉ còn cho trình đọc màn hình." },
      { name: "AppShellHeader / AppShellMain / AppShellAside.asChild", type: "boolean", description: "Đổi thẻ header / main / aside sang phần tử con." },
      { name: "useAppShell()", type: "AppShellState", description: "narrow, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggleSidebar, rail." },
      { name: "readAppShellCookie(cookie, persistKey)", type: "{ collapsed, width? } | undefined", description: "Đọc trạng thái đã lưu từ document.cookie hoặc header Cookie khi render ở server." },
    ],
  },
];
