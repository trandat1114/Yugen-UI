import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavRailTooltip } from "../AppShell/NavRailTooltip";
import { TooltipProvider } from "../Tooltip/Tooltip";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { NavHostContext, type NavHostValue } from "./context";
import {
  Nav,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
  navMessagesVi,
  type NavProps,
} from "./Nav";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Demo(props: Partial<NavProps> & { ref?: React.Ref<HTMLElement> }) {
  return (
    <Nav aria-label="Ứng dụng" {...props}>
      <NavSectionHeader>Chung</NavSectionHeader>
      <NavItem value="home" icon={<svg data-testid="home-icon" />}>
        Trang chủ
      </NavItem>
      <NavItem value="docs" href="/docs">
        Tài liệu
      </NavItem>
      <NavDivider />
      <NavCategory value="reports">
        <NavCategoryItem icon={<svg />}>Báo cáo</NavCategoryItem>
        <NavSubItemGroup>
          <NavSubItem value="sales">Doanh thu</NavSubItem>
          <NavSubItem value="users" href="/users">
            Người dùng
          </NavSubItem>
        </NavSubItemGroup>
      </NavCategory>
      <NavCategory value="settings">
        <NavCategoryItem>Cài đặt</NavCategoryItem>
        <NavSubItemGroup>
          <NavSubItem value="profile">Hồ sơ</NavSubItem>
        </NavSubItemGroup>
      </NavCategory>
    </Nav>
  );
}

const row = (name: string) => screen.getByRole("button", { name });

describe("Nav", () => {
  it("landmark navigation; mục là nút (hoặc link khi có href); ref + className", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Demo ref={ref} className="w-64" />);
    const nav = screen.getByRole("navigation", { name: "Ứng dụng" });
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass("w-64");
    expect(row("Trang chủ")).toHaveAttribute("type", "button");
    expect(screen.getByRole("link", { name: "Tài liệu" })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("heading", { level: 3, name: "Chung" })).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("nhãn landmark: tiếng Anh mặc định, tiếng Việt qua navMessagesVi", () => {
    const { unmount } = renderBare(
      <Nav>
        <NavItem value="a">A</NavItem>
      </Nav>,
    );
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ nav: navMessagesVi }}>
        <Nav>
          <NavItem value="a">A</NavItem>
        </Nav>
      </YugenProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
  });

  it("chọn mục: aria-current=page, onNavItemSelect báo categoryValue; onClick preventDefault chặn chọn", async () => {
    const user = userEvent.setup();
    const onNavItemSelect = vi.fn();
    render(<Demo defaultSelectedValue="home" defaultOpenCategories={["reports"]} onNavItemSelect={onNavItemSelect} />);
    expect(row("Trang chủ")).toHaveAttribute("aria-current", "page");
    await user.click(row("Doanh thu"));
    expect(row("Doanh thu")).toHaveAttribute("aria-current", "page");
    expect(row("Trang chủ")).not.toHaveAttribute("aria-current");
    expect(onNavItemSelect).toHaveBeenLastCalledWith("sales", { categoryValue: "reports" });
    await user.click(row("Trang chủ"));
    expect(onNavItemSelect).toHaveBeenLastCalledWith("home", { categoryValue: undefined });
  });

  it("onClick gọi preventDefault thì không chọn", async () => {
    const user = userEvent.setup();
    const onNavItemSelect = vi.fn();
    render(
      <Nav onNavItemSelect={onNavItemSelect}>
        <NavItem value="a" onClick={(e) => e.preventDefault()}>
          A
        </NavItem>
      </Nav>,
    );
    await user.click(row("A"));
    expect(onNavItemSelect).not.toHaveBeenCalled();
    expect(row("A")).not.toHaveAttribute("aria-current");
  });

  it("category: aria-expanded / aria-controls, nhóm con ẩn khi đóng; nhiều nhóm mở cùng lúc", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Demo onNavCategoryItemToggle={onToggle} />);
    const reports = row("Báo cáo");
    expect(reports).toHaveAttribute("aria-expanded", "false");
    const group = document.getElementById(reports.getAttribute("aria-controls")!)!;
    expect(group).toHaveAttribute("hidden");
    await user.click(reports);
    expect(reports).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Báo cáo" })).toBe(group);
    expect(onToggle).toHaveBeenLastCalledWith("reports", true);
    await user.click(row("Cài đặt"));
    expect(reports).toHaveAttribute("aria-expanded", "true");
    await user.click(reports);
    expect(onToggle).toHaveBeenLastCalledWith("reports", false);
  });

  it("multiple=false: mở nhóm này đóng nhóm kia", async () => {
    const user = userEvent.setup();
    render(<Demo multiple={false} />);
    await user.click(row("Báo cáo"));
    await user.click(row("Cài đặt"));
    expect(row("Báo cáo")).toHaveAttribute("aria-expanded", "false");
    expect(row("Cài đặt")).toHaveAttribute("aria-expanded", "true");
  });

  it("nhóm đang đóng mà chứa mục được chọn: category mang chỉ báo chọn", async () => {
    const user = userEvent.setup();
    render(<Demo selectedValue="sales" />);
    expect(row("Báo cáo")).toHaveClass("bg-brand-background-2-hover");
    await user.click(row("Báo cáo"));
    expect(row("Báo cáo")).not.toHaveClass("bg-brand-background-2-hover");
  });

  it("controlled openCategories / selectedValue", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<Demo openCategories={[]} selectedValue="home" onNavCategoryItemToggle={onToggle} />);
    await user.click(row("Báo cáo"));
    expect(onToggle).toHaveBeenCalledWith("reports", true);
    expect(row("Báo cáo")).toHaveAttribute("aria-expanded", "false");
    rerender(<Demo openCategories={["reports"]} selectedValue="users" onNavCategoryItemToggle={onToggle} />);
    expect(row("Báo cáo")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Người dùng" })).toHaveAttribute("aria-current", "page");
  });

  it("density small + material glass; asChild bọc link router", () => {
    render(
      <Nav density="small" material="glass">
        <NavSectionHeader>Nhóm</NavSectionHeader>
        <NavItem value="a" asChild>
          <a href="/a">Router A</a>
        </NavItem>
        <NavCategory value="c">
          <NavCategoryItem>C</NavCategoryItem>
          <NavSubItemGroup>
            <NavSubItem value="c1" asChild>
              <a href="/c1">C1</a>
            </NavSubItem>
          </NavSubItemGroup>
        </NavCategory>
      </Nav>,
    );
    expect(screen.getByRole("navigation")).toHaveClass("glass", "rounded-3xlarge");
    expect(screen.getByRole("link", { name: "Router A" })).toHaveClass("min-h-8", "px-2");
    expect(screen.getByRole("heading", { name: "Nhóm" })).toHaveClass("px-2");
  });
});

describe("Nav trong Sidebar của AppShell (rail)", () => {
  function Host({ rail, expand = () => {}, onSelect, RowTooltip = NavRailTooltip }: Partial<NavHostValue>) {
    return (
      <TooltipProvider delayDuration={0}>
        <NavHostContext.Provider value={{ rail: !!rail, expand, onSelect, RowTooltip }}>
          <Demo />
        </NavHostContext.Provider>
      </TooltipProvider>
    );
  }

  it("rail: hàng chỉ còn icon, nhãn sr-only; nhóm con ẩn; tiêu đề nhóm thành vạch ngăn", () => {
    render(<Host rail />);
    expect(row("Trang chủ")).toHaveClass("size-10");
    expect(screen.getByText("Trang chủ")).toHaveClass("sr-only");
    expect(row("Báo cáo")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("heading", { name: "Chung" })).toHaveClass("h-px");
  });

  it("rail: bấm category mở rộng sidebar và mở nhóm; chọn mục gọi onSelect của host", async () => {
    const user = userEvent.setup();
    const expand = vi.fn();
    const onSelect = vi.fn();
    const { rerender } = render(<Host rail expand={expand} onSelect={onSelect} />);
    await user.click(row("Báo cáo"));
    expect(expand).toHaveBeenCalled();
    rerender(<Host expand={expand} onSelect={onSelect} />);
    expect(row("Báo cáo")).toHaveAttribute("aria-expanded", "true");
    await user.click(row("Doanh thu"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("rail: focus mục mở Tooltip mang nhãn của mục", async () => {
    const user = userEvent.setup();
    render(<Host rail />);
    await user.tab();
    expect(row("Trang chủ")).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Trang chủ");
  });

  it("Tooltip do host truyền vào (#350): host không có RowTooltip thì hàng không được bọc", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <NavHostContext.Provider value={{ rail: true, expand: () => {} }}>
          <Demo />
        </NavHostContext.Provider>
      </TooltipProvider>,
    );
    expect(row("Trang chủ")).not.toHaveAttribute("data-state");
    await user.tab();
    expect(row("Trang chủ")).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
