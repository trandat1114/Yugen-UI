import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Menu,
  MenuDivider,
  MenuItem,
  MenuItemCheckbox,
  MenuPopover,
  MenuSub,
  MenuSubPopover,
  MenuSubTrigger,
  MenuTrigger,
} from "./Menu";

function Demo({ onSelect = () => {} }: { onSelect?: (item: string) => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button>Tệp</Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuItem onSelect={() => onSelect("new")}>Tạo mới</MenuItem>
        <MenuItem onSelect={() => onSelect("open")}>Mở…</MenuItem>
        <MenuItem disabled onSelect={() => onSelect("save")}>
          Lưu
        </MenuItem>
        <MenuDivider />
        <MenuItemCheckbox checked onCheckedChange={() => onSelect("toggle")}>
          Tự động lưu
        </MenuItemCheckbox>
        <MenuSub>
          <MenuSubTrigger>Xuất</MenuSubTrigger>
          <MenuSubPopover>
            <MenuItem onSelect={() => onSelect("pdf")}>PDF</MenuItem>
            <MenuItem onSelect={() => onSelect("png")}>PNG</MenuItem>
          </MenuSubPopover>
        </MenuSub>
      </MenuPopover>
    </Menu>
  );
}

const trigger = () => screen.getByRole("button", { name: "Tệp" });
const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });

describe("Menu", () => {
  it("trigger có aria-haspopup / aria-expanded", () => {
    render(<Demo />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Enter mở menu và focus mục đầu tiên", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const button = trigger();
    button.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
    // Menu modal: phần còn lại của trang bị ẩn khỏi cây trợ năng.
    expect(screen.queryByRole("button", { name: "Tệp" })).not.toBeInTheDocument();
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());
  });

  it("ArrowDown mở menu; mũi tên đi qua các mục (bỏ qua disabled), vòng không lặp", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("menu");
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(item("Mở…")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitemcheckbox", { name: "Tự động lưu" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("Xuất")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("Tạo mới")).toHaveFocus();
    await user.keyboard("{End}");
    expect(item("Xuất")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitemcheckbox", { name: "Tự động lưu" })).toHaveAttribute("aria-checked", "true");
  });

  it("gõ chữ cái đầu (typeahead) nhảy tới mục khớp", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());
    await user.keyboard("x");
    expect(item("Xuất")).toHaveFocus();
  });

  it("Escape đóng menu và trả focus về trigger", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    trigger().focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("Enter trên mục → onSelect, đóng menu, focus về trigger", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("open");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("mục disabled không chọn được", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    await user.click(trigger());
    const save = await screen.findByRole("menuitem", { name: "Lưu" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    await user.click(save);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("menu con: ArrowRight mở, ArrowLeft đóng và trở lại mục cha", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());
    await user.keyboard("{End}{ArrowRight}");
    await waitFor(() => expect(item("PDF")).toHaveFocus());
    expect(screen.getAllByRole("menu")).toHaveLength(2);
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(1));
    expect(item("Xuất")).toHaveFocus();
  });

  it("RTL: menu con mở bằng ArrowLeft", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider dir="rtl">
        <Demo />
      </YugenProvider>,
    );
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(item("Tạo mới")).toHaveFocus());
    await user.keyboard("{End}{ArrowLeft}");
    await waitFor(() => expect(item("PDF")).toHaveFocus());
    // Menu portal nhận dir của provider lồng.
    expect(screen.getAllByRole("menu")[0]).toHaveAttribute("dir", "rtl");
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(item("Xuất")).toHaveFocus());
  });
});
