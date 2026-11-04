import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ContextMenu";

interface DemoProps {
  onSelect?: (item: string) => void;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
}

function Demo({ onSelect = () => {}, onCheckedChange = () => {}, onValueChange = () => {} }: DemoProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger data-testid="area">Vùng bấm chuột phải</ContextMenuTrigger>
      <ContextMenuContent className="w-56" data-testid="content">
        <ContextMenuLabel>Thao tác</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem icon={<svg data-testid="icon" />} secondaryContent="Ctrl+C" onSelect={() => onSelect("copy")}>
            Sao chép
          </ContextMenuItem>
          <ContextMenuItem disabled onSelect={() => onSelect("paste")}>
            Dán
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator data-testid="sep" />
        <ContextMenuCheckboxItem checked secondaryContent="Ctrl+L" onCheckedChange={onCheckedChange}>
          Hiện thước
        </ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value="md" onValueChange={onValueChange}>
          <ContextMenuRadioItem value="sm">Nhỏ</ContextMenuRadioItem>
          <ContextMenuRadioItem value="md">Vừa</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<svg />}>Chia sẻ</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const openMenu = async () => {
  fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 20, clientY: 20 });
  return screen.findByRole("menu");
};
const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });

describe("ContextMenu", () => {
  it("chuột phải mở menu ở bề mặt Fluent; className gộp; focus vào menu", async () => {
    render(<Demo />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    const menu = await openMenu();
    expect(screen.getByTestId("content")).toBe(menu);
    expect(menu).toHaveClass("w-56", "shadow-16");
    expect(item(/^Sao chép/)).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Thao tác")).toHaveClass("font-semibold");
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "separator");
    await waitFor(() => expect(menu).toHaveFocus());
  });

  it("mũi tên đi qua các mục (bỏ qua disabled); Enter chọn và đóng menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    await openMenu();
    await user.keyboard("{ArrowDown}");
    expect(item(/^Sao chép/)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitemcheckbox", { name: /^Hiện thước/ })).toHaveFocus();
    await user.keyboard("{ArrowUp}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("copy");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("mục disabled không chọn được", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    await openMenu();
    expect(item("Dán")).toHaveAttribute("aria-disabled", "true");
    await user.click(item("Dán"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("checkbox / radio: aria-checked và callback", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(<Demo onCheckedChange={onCheckedChange} onValueChange={onValueChange} />);
    await openMenu();
    const ruler = screen.getByRole("menuitemcheckbox", { name: /^Hiện thước/ });
    expect(ruler).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Vừa" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Nhỏ" })).toHaveAttribute("aria-checked", "false");
    await user.click(ruler);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    await openMenu();
    await user.click(screen.getByRole("menuitemradio", { name: "Nhỏ" }));
    expect(onValueChange).toHaveBeenCalledWith("sm");
  });

  it("menu con: ArrowRight mở, ArrowLeft đóng; Escape đóng menu", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await openMenu();
    await user.keyboard("{End}");
    expect(item("Chia sẻ")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(item("Email")).toHaveFocus());
    expect(screen.getAllByRole("menu")).toHaveLength(2);
    expect(screen.getAllByRole("menu")[1]).toHaveClass("w-40");
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(1));
    expect(item("Chia sẻ")).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("menu portal nhận theme / dir của YugenProvider lồng", async () => {
    render(
      <YugenProvider theme="dark" dir="rtl">
        <Demo />
      </YugenProvider>,
    );
    const menu = await openMenu();
    expect(menu).toHaveAttribute("data-theme", "dark");
    expect(menu).toHaveAttribute("dir", "rtl");
  });
});
