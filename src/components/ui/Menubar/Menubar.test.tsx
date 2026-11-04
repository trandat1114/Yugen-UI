import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./Menubar";

interface DemoProps {
  onSelect?: (item: string) => void;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
}

function Demo({ onSelect = () => {}, onCheckedChange = () => {}, onValueChange = () => {} }: DemoProps) {
  return (
    <Menubar aria-label="Ứng dụng" className="w-full">
      <MenubarMenu>
        <MenubarTrigger>Tệp</MenubarTrigger>
        <MenubarContent data-testid="file">
          <MenubarLabel>Tài liệu</MenubarLabel>
          <MenubarGroup>
            <MenubarItem icon={<svg />} secondaryContent="Ctrl+N" onSelect={() => onSelect("new")}>
              Tạo mới
            </MenubarItem>
            <MenubarItem disabled>Lưu</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger icon={<svg />}>Xuất</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Xem</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked secondaryContent="Ctrl+R" onCheckedChange={onCheckedChange}>
            Thước kẻ
          </MenubarCheckboxItem>
          <MenubarRadioGroup value="100" onValueChange={onValueChange}>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="200">200%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const trigger = (name: string) => screen.getByRole("menuitem", { name });

describe("Menubar", () => {
  it("role menubar, trigger là menuitem có aria-haspopup; className gộp", () => {
    render(<Demo />);
    const bar = screen.getByRole("menubar", { name: "Ứng dụng" });
    expect(bar).toHaveClass("w-full", "rounded-medium");
    expect(trigger("Tệp")).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger("Tệp")).toHaveAttribute("aria-expanded", "false");
  });

  it("ref của Menubar / MenubarTrigger tới phần tử DOM", () => {
    const barRef = { current: null as HTMLDivElement | null };
    const triggerRef = { current: null as HTMLButtonElement | null };
    render(
      <Menubar ref={barRef}>
        <MenubarMenu>
          <MenubarTrigger ref={triggerRef}>Tệp</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    );
    expect(barRef.current).toBe(screen.getByRole("menubar"));
    expect(triggerRef.current).toBe(trigger("Tệp"));
  });

  it("←/→ đi giữa các trigger; ↓ mở menu và focus mục đầu", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    trigger("Tệp").focus();
    await user.keyboard("{ArrowRight}");
    expect(trigger("Xem")).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowDown}");
    const menu = await screen.findByRole("menu");
    expect(menu).toBe(screen.getByTestId("file"));
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /^Tạo mới/ })).toHaveFocus());
    expect(trigger("Tệp")).toHaveAttribute("aria-expanded", "true");
  });

  it("Enter trên mục → onSelect, đóng menu và trả focus về trigger", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    trigger("Tệp").focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /^Tạo mới/ })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("new");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger("Tệp")).toHaveFocus();
  });

  it("menu con mở bằng ArrowRight; Escape đóng", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    trigger("Tệp").focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /^Tạo mới/ })).toHaveFocus());
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Xuất" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "PDF" })).toHaveFocus());
    expect(screen.getAllByRole("menu")).toHaveLength(2);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("checkbox / radio trong menu: aria-checked và callback", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(<Demo onCheckedChange={onCheckedChange} onValueChange={onValueChange} />);
    await user.click(trigger("Xem"));
    const ruler = await screen.findByRole("menuitemcheckbox", { name: /^Thước kẻ/ });
    expect(ruler).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "100%" })).toHaveAttribute("aria-checked", "true");
    await user.click(ruler);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    await user.click(trigger("Xem"));
    await user.click(await screen.findByRole("menuitemradio", { name: "200%" }));
    expect(onValueChange).toHaveBeenCalledWith("200");
  });

  it("menu portal nhận theme của YugenProvider lồng", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider theme="dark">
        <Demo />
      </YugenProvider>,
    );
    await user.click(trigger("Tệp"));
    expect(await screen.findByRole("menu")).toHaveAttribute("data-theme", "dark");
  });
});
