import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./NavigationMenu";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

function Header(props: React.ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/analytics" description="Dashboards and reports">
              Analytics
            </NavigationMenuLink>
            <NavigationMenuLink href="/billing">Billing</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuLink href="/docs" active>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("thẻ nav có nhãn mặc định; link trang hiện tại có aria-current", () => {
    render(<Header />, { wrapper: english });
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Pricing" })).not.toHaveAttribute("aria-current");
  });

  it("bấm nút mở bảng, link trong bảng có mô tả; Esc đóng và trả focus về nút", async () => {
    render(<Header />, { wrapper: english });
    const trigger = screen.getByRole("button", { name: "Products" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const analytics = screen.getByRole("link", { name: /Analytics/ });
    expect(analytics).toHaveTextContent("Dashboards and reports");
    expect(analytics).toHaveAttribute("href", "/analytics");
    trigger.focus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("bàn phím: mũi tên chuyển mục, Enter mở, Tab vào bảng", async () => {
    render(<Header />, { wrapper: english });
    const trigger = screen.getByRole("button", { name: "Products" });
    trigger.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.tab();
    expect(screen.getByRole("link", { name: /Analytics/ })).toHaveFocus();
  });

  it("controlled: value / onValueChange", async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = React.useState("products");
      return (
        <Header
          value={value}
          onValueChange={(v) => {
            onValueChange(v);
            setValue(v);
          }}
        />
      );
    }
    render(<Controlled />, { wrapper: english });
    const trigger = screen.getByRole("button", { name: "Products" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("asChild dùng link của router; aria-label riêng; ref trỏ tới nav", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <NavigationMenu aria-label="Site" ref={ref}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <a href="/blog" data-router-link="">
                Blog
              </a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
      { wrapper: english },
    );
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("data-router-link");
    expect(ref.current).toBe(screen.getByRole("navigation", { name: "Site" }));
  });

  it("chuỗi tiếng Việt qua messagesVi", () => {
    render(<Header />);
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
  });
});
