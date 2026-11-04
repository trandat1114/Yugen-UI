import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuItem } from "../Menu/Menu";
import { MenuButton } from "./MenuButton";

const menu = (
  <>
    <MenuItem>Mới nhất</MenuItem>
    <MenuItem>Cũ nhất</MenuItem>
  </>
);

describe("MenuButton", () => {
  it("nút mở menu: aria-haspopup / aria-expanded; chevron aria-hidden; ref + className", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <MenuButton ref={ref} menu={menu} className="w-40">
        Sắp xếp
      </MenuButton>,
    );
    const button = screen.getByRole("button", { name: "Sắp xếp" });
    expect(ref.current).toBe(button);
    expect(button).toHaveClass("w-40", "group/menubutton");
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
    await user.click(button);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("data-state", "open");
  });

  it("Enter mở và focus mục đầu; Escape đóng và trả focus", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <MenuButton menu={menu} onOpenChange={onOpenChange}>
        Sắp xếp
      </MenuButton>,
    );
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Mới nhất" })).toHaveFocus());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Sắp xếp" })).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("controlled open / defaultOpen", async () => {
    const { rerender } = render(<MenuButton menu={menu} open={false}>Sắp xếp</MenuButton>);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    rerender(
      <MenuButton menu={menu} open>
        Sắp xếp
      </MenuButton>,
    );
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("chỉ có icon: bỏ nhãn, padding gọn; menuIcon thay chevron", () => {
    render(<MenuButton menu={menu} icon={<svg />} aria-label="Thêm" size="small" menuIcon={<span data-testid="caret" />} />);
    const button = screen.getByRole("button", { name: "Thêm" });
    expect(button).toHaveClass("min-w-0", "px-1");
    expect(screen.getByTestId("caret")).toBeInTheDocument();
  });

  it("disabled không mở menu", async () => {
    const user = userEvent.setup();
    render(
      <MenuButton menu={menu} disabled appearance="primary">
        Sắp xếp
      </MenuButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
