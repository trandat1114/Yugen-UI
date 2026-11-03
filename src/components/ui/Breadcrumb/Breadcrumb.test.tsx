import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  breadcrumbMessagesVi,
  type BreadcrumbItemData,
} from "./Breadcrumb";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const items = (onClick?: (label: string) => void): BreadcrumbItemData[] =>
  ["Trang chủ", "Sản phẩm", "Điện thoại", "Hãng", "Mẫu"].map((label, i) => ({
    key: label,
    label,
    href: i === 1 ? "/san-pham" : undefined,
    onClick: onClick && (() => onClick(label)),
  }));

describe("Breadcrumb", () => {
  it("nav > ol; mục cuối là trang hiện tại (aria-current, không bấm được); divider aria-hidden", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Breadcrumb ref={ref} aria-label="Vị trí" items={items()} className="mb-2" />);
    const nav = screen.getByRole("navigation", { name: "Vị trí" });
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass("mb-2");
    expect(within(nav).getAllByRole("listitem")).toHaveLength(5);
    const current = screen.getByText("Mẫu");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).toBe("SPAN");
    expect(screen.getByRole("link", { name: "Sản phẩm" })).toHaveAttribute("href", "/san-pham");
    expect(screen.getByRole("button", { name: "Trang chủ" })).toHaveAttribute("type", "button");
    expect(nav.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(4);
  });

  it("mục bấm được gọi onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={items(onClick)} />);
    await user.click(screen.getByRole("button", { name: "Trang chủ" }));
    expect(onClick).toHaveBeenCalledWith("Trang chủ");
  });

  it("maxDisplayedItems: phần giữa gom vào menu …, chọn mục trong menu gọi onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={items(onClick)} maxDisplayedItems={3} />);
    expect(screen.queryByText("Điện thoại")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang chủ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hãng" })).toBeInTheDocument();
    const more = screen.getByRole("button", { name: "Hiện thêm mục" });
    await user.click(more);
    expect(screen.getAllByRole("menuitem").map((el) => el.textContent)).toEqual(["Sản phẩm", "Điện thoại"]);
    await user.click(screen.getByRole("menuitem", { name: "Điện thoại" }));
    expect(onClick).toHaveBeenCalledWith("Điện thoại");
  });

  it("overflowIndex giữ thêm mục đầu; overflowLabel đặt tên nút …", () => {
    render(<Breadcrumb items={items()} maxDisplayedItems={4} overflowIndex={2} overflowLabel="Mục ẩn" />);
    expect(screen.getByRole("link", { name: "Sản phẩm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mục ẩn" })).toBeInTheDocument();
    expect(screen.queryByText("Điện thoại")).not.toBeInTheDocument();
  });

  it("tự viết children: BreadcrumbButton disabled / asChild / icon; size small", () => {
    render(
      <Breadcrumb size="small">
        <BreadcrumbItem>
          <BreadcrumbButton href="/a" disabled icon={<svg data-testid="icon" />}>
            Tắt
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton asChild>
            <a href="/router">Router</a>
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    // disabled + href: thành nút disabled, không còn link.
    expect(screen.getByRole("button", { name: "Tắt" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tắt" })).toHaveClass("h-6");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Router" })).toHaveClass("cursor-pointer");
  });

  it("nhãn nav + nút …: tiếng Anh mặc định, tiếng Việt qua breadcrumbMessagesVi", () => {
    const { unmount } = renderBare(<Breadcrumb items={items()} maxDisplayedItems={2} size="large" />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More items" })).toHaveClass("w-10");
    unmount();
    renderBare(
      <YugenProvider messages={{ breadcrumb: breadcrumbMessagesVi }}>
        <Breadcrumb items={items()} />
      </YugenProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Đường dẫn điều hướng" })).toBeInTheDocument();
  });
});
