import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { SearchBox, searchBoxMessagesVi } from "./SearchBox";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const box = () => screen.getByRole("searchbox");

describe("SearchBox", () => {
  it("role searchbox, type search; ref tới input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<SearchBox ref={ref} aria-label="Tìm tài liệu" />);
    expect(ref.current).toBe(box());
    expect(box()).toHaveAttribute("type", "search");
    expect(box()).toHaveAccessibleName("Tìm tài liệu");
    // Chưa có nội dung: không có nút xoá.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("placeholder + nhãn nút xoá: tiếng Anh mặc định, tiếng Việt qua searchBoxMessagesVi, prop riêng thắng", () => {
    const { unmount } = renderBare(<SearchBox defaultValue="a" />);
    expect(box()).toHaveAttribute("placeholder", "Search");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ searchBox: searchBoxMessagesVi }}>
        <SearchBox defaultValue="a" />
        <SearchBox defaultValue="b" placeholder="Lọc" dismissLabel="Bỏ lọc" />
      </YugenProvider>,
    );
    expect(screen.getAllByRole("searchbox")[0]).toHaveAttribute("placeholder", "Tìm kiếm");
    expect(screen.getByRole("button", { name: "Xoá nội dung tìm kiếm" })).toBeInTheDocument();
    expect(screen.getAllByRole("searchbox")[1]).toHaveAttribute("placeholder", "Lọc");
    expect(screen.getByRole("button", { name: "Bỏ lọc" })).toBeInTheDocument();
  });

  it("gõ báo onChange + onValueChange; nút X xoá, gọi onChange như khi gõ và giữ focus", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<SearchBox aria-label="Tìm" onChange={onChange} onValueChange={onValueChange} />);
    await user.type(box(), "táo");
    expect(onValueChange).toHaveBeenLastCalledWith("táo");
    await user.click(screen.getByRole("button", { name: "Xoá nội dung tìm kiếm" }));
    expect(box()).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(box()).toHaveFocus();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("Esc xoá nội dung; ô trống thì Esc để lọt ra ngoài", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(<SearchBox aria-label="Tìm" defaultValue="lê" onKeyDown={onKeyDown} />);
    box().focus();
    await user.keyboard("{Escape}");
    expect(box()).toHaveValue("");
    expect(onKeyDown.mock.calls[0][0].defaultPrevented).toBe(true);
    await user.keyboard("{Escape}");
    expect(onKeyDown.mock.calls[1][0].defaultPrevented).toBe(false);
  });

  it("controlled: hiển thị theo value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<SearchBox aria-label="Tìm" value="cam" onValueChange={onValueChange} />);
    await user.type(box(), "x");
    expect(onValueChange).toHaveBeenCalledWith("camx");
    expect(box()).toHaveValue("cam");
    rerender(<SearchBox aria-label="Tìm" value="" onValueChange={onValueChange} />);
    expect(box()).toHaveValue("");
  });

  it("readOnly / disabled: không có nút xoá, Esc không xoá; contentBefore / contentAfter riêng", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SearchBox aria-label="Tìm" defaultValue="cố định" readOnly contentAfter={<span>⌘K</span>} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    box().focus();
    await user.keyboard("{Escape}");
    expect(box()).toHaveValue("cố định");
    unmount();
    render(<SearchBox aria-label="Tìm" defaultValue="x" disabled size="small" contentBefore={<span>@</span>} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("@")).toBeInTheDocument();
    expect(box().parentElement).toHaveClass("h-6");
  });
});
