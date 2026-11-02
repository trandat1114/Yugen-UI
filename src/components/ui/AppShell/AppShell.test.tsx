import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Nav, NavCategory, NavCategoryItem, NavItem, NavSubItem, NavSubItemGroup } from "../Nav/Nav";
import {
  AppShell,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  readAppShellCookie,
  type AppShellProps,
} from "./AppShell";
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, SidebarTrigger, type SidebarProps } from "./Sidebar";
import { appShellMessagesEn } from "./messages";

const KEY = "test-shell";

/** ResizeObserver điều khiển được: jsdom không có layout, test tự báo độ rộng khung. */
const observers = new Set<FakeResizeObserver>();
class FakeResizeObserver {
  constructor(readonly callback: ResizeObserverCallback) {}
  observe() {
    observers.add(this);
  }
  unobserve() {}
  disconnect() {
    observers.delete(this);
  }
}

/** Khung rộng 1200px (≥ 56rem) hoặc hẹp 600px. */
function resizeTo(width: number) {
  act(() => {
    for (const o of [...observers]) o.callback([{ contentRect: { width } } as ResizeObserverEntry], o as unknown as ResizeObserver);
  });
}

const Icon = () => <svg aria-hidden />;

function Layout({ collapsible, resizable, ...props }: Partial<AppShellProps> & Pick<SidebarProps, "collapsible" | "resizable">) {
  return (
    <AppShell {...props}>
      <Sidebar collapsible={collapsible} resizable={resizable}>
        <SidebarHeader>Logo</SidebarHeader>
        <SidebarContent>
          <Nav aria-label="Ứng dụng" defaultSelectedValue="home">
            <NavItem value="home" icon={<Icon />}>
              Trang chủ
            </NavItem>
            <NavItem value="mail" href="#mail" icon={<Icon />}>
              Thư
            </NavItem>
            <NavItem value="reports" asChild>
              <a href="#reports">
                <Icon />
                <span>Báo cáo</span>
              </a>
            </NavItem>
            <NavCategory value="projects">
              <NavCategoryItem icon={<Icon />}>Dự án</NavCategoryItem>
              <NavSubItemGroup>
                <NavSubItem value="active">Đang chạy</NavSubItem>
              </NavSubItemGroup>
            </NavCategory>
          </Nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <AppShellHeader>
        <SidebarTrigger />
        <input aria-label="Tìm kiếm" />
        <div contentEditable suppressContentEditableWarning aria-label="Soạn thảo" tabIndex={0} />
      </AppShellHeader>
      <AppShellMain>Nội dung</AppShellMain>
    </AppShell>
  );
}

const trigger = () => screen.getByRole("button", { name: /thanh bên/ });
const ctrlB = (target: Element | Window = window, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(target, { key: "b", code: "KeyB", ctrlKey: true, ...init });

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  observers.clear();
  document.cookie = `${KEY}=; path=/; max-age=0`;
});

describe("AppShell on a wide frame", () => {
  it("collapses to an icon rail with tooltips and saves only that state", () => {
    const { container, unmount } = render(<Layout persistKey={KEY} />);
    resizeTo(1200);
    expect(trigger()).toHaveAccessibleName("Thu gọn thanh bên");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger());
    expect(trigger()).toHaveAccessibleName("Mở rộng thanh bên");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("[data-rail]")).not.toBeNull();
    expect(screen.getByText("Trang chủ")).toHaveClass("sr-only");
    expect(document.cookie).toContain(`${KEY}=collapsed`);

    // Tooltip mang nhãn; mục asChild đọc chữ của link.
    act(() => screen.getByRole("button", { name: "Trang chủ" }).focus());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Trang chủ");
    act(() => screen.getByRole("link", { name: "Báo cáo" }).focus());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Báo cáo");

    unmount();
    render(<Layout persistKey={KEY} />);
    resizeTo(1200);
    expect(trigger()).toHaveAccessibleName("Mở rộng thanh bên");
  });

  it("expands from the rail when a category is chosen and opens its group", () => {
    render(<Layout defaultCollapsed />);
    resizeTo(1200);
    const category = screen.getByRole("button", { name: "Dự án" });
    const group = document.getElementById(category.getAttribute("aria-controls") ?? "");
    expect(group).not.toBeVisible();
    fireEvent.click(category);
    expect(trigger()).toHaveAccessibleName("Thu gọn thanh bên");
    expect(group).toBeVisible();
    expect(category).toHaveAttribute("aria-expanded", "true");
  });

  it("resizes from the keyboard, collapses on Enter and keeps the width with the state", () => {
    render(<Layout persistKey={KEY} resizable />);
    resizeTo(1200);
    const separator = screen.getByRole("separator", { name: "Đổi độ rộng thanh bên" });
    expect(separator).toHaveAttribute("aria-valuenow", "256");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "272");
    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", "400");
    expect(document.cookie).toContain(`${KEY}=expanded:400`);

    fireEvent.keyDown(separator, { key: "Enter" });
    expect(trigger()).toHaveAccessibleName("Mở rộng thanh bên");
    expect(readAppShellCookie(document.cookie, KEY)).toEqual({ collapsed: true, width: 400 });
  });

  it("toggles with Ctrl+B, except while typing or composing with an IME", () => {
    render(<Layout />);
    resizeTo(1200);
    ctrlB();
    expect(trigger()).toHaveAccessibleName("Mở rộng thanh bên");

    ctrlB(screen.getByRole("textbox", { name: "Tìm kiếm" }));
    ctrlB(screen.getByLabelText("Soạn thảo"));
    ctrlB(window, { isComposing: true });
    ctrlB(window, { keyCode: 229 });
    expect(trigger()).toHaveAccessibleName("Mở rộng thanh bên");

    ctrlB(document.body, { metaKey: true, ctrlKey: false });
    expect(trigger()).toHaveAccessibleName("Thu gọn thanh bên");
  });

  it("with several shells on a page, only the focused or last clicked one takes the shortcut", () => {
    render(
      <>
        <div data-testid="a">
          <Layout />
        </div>
        <div data-testid="b">
          <Layout />
        </div>
      </>,
    );
    resizeTo(1200);
    const a = within(screen.getByTestId("a"));
    const b = within(screen.getByTestId("b"));
    const name = (scope: typeof a) => scope.getByRole("button", { name: /thanh bên/ });

    // Không khung nào được chọn: không đổi khung nào.
    ctrlB(document.body);
    expect(name(a)).toHaveAccessibleName("Thu gọn thanh bên");
    expect(name(b)).toHaveAccessibleName("Thu gọn thanh bên");

    // Focus trong khung B.
    ctrlB(b.getByRole("main"));
    expect(name(a)).toHaveAccessibleName("Thu gọn thanh bên");
    expect(name(b)).toHaveAccessibleName("Mở rộng thanh bên");

    // Bấm vào khung A (vùng không nhận focus), rồi phím tắt với focus ở body.
    fireEvent.pointerDown(a.getByText("Logo"));
    ctrlB(document.body);
    expect(name(a)).toHaveAccessibleName("Mở rộng thanh bên");
    expect(name(b)).toHaveAccessibleName("Mở rộng thanh bên");
  });

  it("shows the label and the shortcut in the trigger's tooltip", () => {
    render(<Layout />);
    resizeTo(1200);
    act(() => trigger().focus());
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Thu gọn thanh bên");
    expect(within(tooltip).getByText("Ctrl")).toBeInTheDocument();
    expect(within(tooltip).getByText("B")).toBeInTheDocument();
  });

  it("can turn the shortcut off", () => {
    render(<Layout shortcut={false} />);
    resizeTo(1200);
    ctrlB();
    expect(trigger()).toHaveAccessibleName("Thu gọn thanh bên");
    expect(trigger()).not.toHaveAttribute("aria-keyshortcuts");
    act(() => trigger().focus());
    expect(screen.getByRole("tooltip")).not.toHaveTextContent("Ctrl");
  });

  it("moves focus out of the sidebar when the frame becomes narrow", () => {
    render(<Layout />);
    resizeTo(1200);
    act(() => screen.getByRole("button", { name: "Trang chủ" }).focus());
    resizeTo(600);
    expect(trigger()).toHaveFocus();
  });
});

describe("AppShell on a narrow frame", () => {
  it("opens the sidebar in a Drawer that closes after following a link and is never saved", async () => {
    render(<Layout persistKey={KEY} />);
    resizeTo(600);
    expect(trigger()).toHaveAccessibleName("Mở thanh bên");

    fireEvent.click(trigger());
    const drawer = screen.getByRole("dialog", { name: "Thanh bên" });
    // Ngoài Drawer bị aria-hidden khi Drawer mở.
    expect(screen.getByRole("button", { name: "Mở thanh bên", hidden: true })).toHaveAttribute("aria-expanded", "true");
    expect(document.cookie).not.toContain(KEY);
    // Drawer luôn hiện đầy đủ: không có rail, không có thanh chia.
    expect(within(drawer).getByText("Trang chủ")).not.toHaveClass("sr-only");
    expect(within(drawer).queryByRole("button", { name: /Thu gọn|Mở rộng/ })).toBeNull();

    fireEvent.click(within(drawer).getByRole("link", { name: "Thư" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("closes after choosing a Nav item that is a button", () => {
    render(<Layout />);
    resizeTo(600);
    fireEvent.click(trigger());
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Trang chủ" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens with Ctrl+B and closes with Escape, focus back where it was", async () => {
    render(<Layout />);
    resizeTo(600);
    const search = screen.getByRole("textbox", { name: "Tìm kiếm" });
    act(() => search.focus());
    // Ctrl+B trong ô nhập bị bỏ qua; ngoài ô nhập thì mở.
    ctrlB(search);
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => screen.getByRole("main").focus());
    ctrlB(screen.getByRole("main"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
  });

  it("closes the Drawer when the frame widens and focuses the trigger", async () => {
    render(<Layout />);
    resizeTo(600);
    fireEvent.click(trigger());
    resizeTo(1200);
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("focuses the main region when the trigger is hidden after widening", async () => {
    render(<Layout collapsible="none" />);
    resizeTo(600);
    const button = trigger();
    fireEvent.click(button);
    button.checkVisibility = () => false;
    resizeTo(1200);
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
  });
});

describe("AppShell layout and scroll", () => {
  it("layout=\"header\" spans the header across and puts the sidebar below it", () => {
    render(<Layout layout="header" />);
    expect(screen.getByRole("banner")).toHaveClass("col-span-full");
    expect(document.querySelector("[data-collapsible]")).toHaveClass("row-[2/-1]");
  });

  it("scroll=\"page\" lets the page scroll: sticky header and sidebar, main without its own scroll, footer last", () => {
    render(
      <AppShell scroll="page">
        <Sidebar>
          <SidebarContent>Nav</SidebarContent>
        </Sidebar>
        <AppShellHeader>Header</AppShellHeader>
        <AppShellMain>Nội dung</AppShellMain>
        <AppShellFooter>Footer</AppShellFooter>
      </AppShell>,
    );
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-0");
    expect(document.querySelector("[data-collapsible]")).toHaveClass("sticky", "self-start");
    expect(screen.getByRole("main")).not.toHaveClass("overflow-y-auto");
    expect(screen.getByRole("contentinfo")).toHaveClass("row-start-3");
    expect(document.querySelector("[data-app-shell]")).toHaveClass("min-h-dvh");
  });

  it("without a Sidebar, Ctrl+B is left to the browser", () => {
    render(
      <AppShell>
        <AppShellHeader>Header</AppShellHeader>
        <AppShellMain>Nội dung</AppShellMain>
      </AppShell>,
    );
    resizeTo(1200);
    // fireEvent trả false khi sự kiện bị preventDefault.
    expect(ctrlB()).toBe(true);
  });

  it("inside its own scroll area, sticky parts follow the height of that area", () => {
    const height = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(480);
    render(
      <AppShell scroll="page" style={{ overflowY: "auto" }} className="h-full min-h-0">
        <AppShellMain>Nội dung</AppShellMain>
      </AppShell>,
    );
    resizeTo(900);
    const root = document.querySelector<HTMLElement>("[data-app-shell]")!;
    expect(root.style.getPropertyValue("--app-shell-viewport")).toBe("480px");
    expect(root).not.toHaveClass("min-h-dvh");
    height.mockRestore();
  });
});

describe("AppShell", () => {
  it("skip link moves focus to the main region", () => {
    render(<Layout />);
    fireEvent.click(screen.getByRole("link", { name: "Chuyển tới nội dung" }));
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("reads strings from YugenProvider", () => {
    render(
      <YugenProvider messages={{ appShell: appShellMessagesEn }}>
        <Layout />
      </YugenProvider>,
    );
    resizeTo(1200);
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument();
  });

  it("reads the saved state from a Cookie header", () => {
    expect(readAppShellCookie("theme=dark; test-shell=collapsed", KEY)).toEqual({ collapsed: true, width: undefined });
    expect(readAppShellCookie("test-shell=expanded:288", KEY)).toEqual({ collapsed: false, width: 288 });
    expect(readAppShellCookie("test-shell=open", KEY)).toBeUndefined();
    expect(readAppShellCookie(undefined, KEY)).toBeUndefined();
  });
});
