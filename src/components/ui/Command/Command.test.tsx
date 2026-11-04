import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  commandMessagesVi,
} from "./Command";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Palette({ onSelect = () => {} }: { onSelect?: (value: string) => void }) {
  return (
    <>
      <CommandInput placeholder="Gõ lệnh…" wrapperClassName="px-4" />
      <CommandList>
        <CommandEmpty>Không có kết quả</CommandEmpty>
        <CommandGroup heading="Tệp">
          <CommandItem icon={<svg data-testid="icon" />} onSelect={onSelect}>
            Tạo tệp
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onSelect}>Mở tệp</CommandItem>
          <CommandItem disabled onSelect={onSelect}>
            Xoá tệp
          </CommandItem>
        </CommandGroup>
        <CommandSeparator data-testid="sep" />
        <CommandGroup heading="Cài đặt">
          <CommandItem onSelect={onSelect}>Giao diện</CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

const option = (name: string | RegExp) => screen.getByRole("option", { name });

describe("Command", () => {
  it("ô tìm (combobox) + listbox có nhóm; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Command ref={ref} label="Bảng lệnh" className="max-w-96">
        <Palette />
      </Command>,
    );
    expect(ref.current).toHaveClass("max-w-96", "rounded-xlarge");
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Gõ lệnh…");
    expect(screen.getByRole("combobox").parentElement).toHaveClass("px-4");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(option(/^Tạo tệp/)).toHaveTextContent("Ctrl+N");
    expect(screen.getByText("Ctrl+N")).toHaveClass("ms-auto");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    // Vạch chia trang trí: không có role separator trong listbox.
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "none");
  });

  it("gõ lọc mục; không còn mục nào thì hiện CommandEmpty; vạch chia ẩn khi đang tìm", async () => {
    const user = userEvent.setup();
    render(
      <Command label="Bảng lệnh">
        <Palette />
      </Command>,
    );
    await user.type(screen.getByRole("combobox"), "giao");
    await waitFor(() => expect(screen.queryByRole("option", { name: /^Tạo tệp/ })).not.toBeInTheDocument());
    expect(option("Giao diện")).toBeInTheDocument();
    expect(screen.queryByTestId("sep")).not.toBeInTheDocument();
    await user.type(screen.getByRole("combobox"), "xyz");
    expect(await screen.findByText("Không có kết quả")).toHaveClass("text-center");
  });

  it("↓/↑ đổi mục đang chọn (bỏ qua disabled), Enter gọi onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command label="Bảng lệnh">
        <Palette onSelect={onSelect} />
      </Command>,
    );
    screen.getByRole("combobox").focus();
    expect(option(/^Tạo tệp/)).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(option("Mở tệp")).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(option("Giao diện")).toHaveAttribute("aria-selected", "true");
    expect(option("Xoá tệp")).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Giao diện");
  });

  it("CommandSeparator alwaysRender vẫn hiện khi đang tìm", async () => {
    const user = userEvent.setup();
    render(
      <Command label="Bảng lệnh">
        <CommandInput />
        <CommandList>
          <CommandItem>Một</CommandItem>
          <CommandSeparator alwaysRender data-testid="sep" />
          <CommandItem>Hai</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.type(screen.getByRole("combobox"), "m");
    expect(screen.getByTestId("sep")).toBeInTheDocument();
  });

  it("cmdk cuộn mục đầu vào tầm nhìn lúc mount: vị trí cuộn của cửa sổ được trả lại", async () => {
    let y = 0;
    const saved = Object.getOwnPropertyDescriptor(window, "scrollY");
    Object.defineProperty(window, "scrollY", { configurable: true, get: () => y });
    vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {
      y = 400;
    });
    const scrollTo = vi.spyOn(window, "scrollTo");
    try {
      render(
        <Command label="Bảng lệnh">
          <Palette />
        </Command>,
      );
      await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
    } finally {
      if (saved) Object.defineProperty(window, "scrollY", saved);
    }
  });
});

describe("CommandDialog", () => {
  it("Command trong Dialog với tiêu đề ẩn: tiếng Anh mặc định, tiếng Việt qua commandMessagesVi, title thắng", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { unmount } = renderBare(
      <CommandDialog open onOpenChange={onOpenChange}>
        <Palette />
      </CommandDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    unmount();

    const second = renderBare(
      <YugenProvider messages={{ command: commandMessagesVi }}>
        <CommandDialog open>
          <Palette />
        </CommandDialog>
      </YugenProvider>,
    );
    expect(screen.getByRole("dialog", { name: "Bảng lệnh" })).toBeInTheDocument();
    second.unmount();

    render(
      <CommandDialog defaultOpen title="Tìm nhanh">
        <Palette />
      </CommandDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Tìm nhanh" })).toHaveClass("p-0");
  });
});
