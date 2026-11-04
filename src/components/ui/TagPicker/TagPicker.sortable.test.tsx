import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagPicker } from "./TagPicker";

// Chunk của Sortable chỉ về khi test cho phép: giữ khoảng giữa lúc mount và lúc nhóm tag được thay.
const chunk = vi.hoisted(() => {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => (release = resolve));
  return { ready, release };
});
vi.mock("@/components/ui/Sortable/Sortable", async (importOriginal) => {
  await chunk.ready;
  return importOriginal<typeof import("@/components/ui/Sortable/Sortable")>();
});

const OPTIONS = [
  { value: "tao", label: "Táo" },
  { value: "cam", label: "Cam" },
  { value: "le", label: "Lê" },
];

const tags = () => Array.from(document.querySelectorAll("[data-tag]")).map((t) => t.textContent?.split(",")[0]);
const tag = (label: string) => screen.getAllByRole("button").find((b) => b.textContent?.startsWith(label))!;
const sortableReady = () => waitFor(() => expect(document.querySelector("[data-sortable-list]")).not.toBeNull());

describe("TagPicker reorderable: focus khi Sortable được thay vào", () => {
  it("tag đang focus giữ focus (cùng value), thứ tự và ô nhập không đổi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagPicker aria-label="Trái cây" options={OPTIONS} defaultValue={["tao", "cam", "le"]} reorderable onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Trái cây" });
    const toolbar = screen.getByRole("toolbar");
    const toolbarClass = toolbar.className;

    // Bàn phím: Tab vào ô nhập, ← tới tag cuối, ← nữa tới tag giữa.
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    const before = tag("Cam");
    expect(before).toHaveFocus();
    const beforeClasses = before.className.split(" ");
    expect(document.querySelector("[data-sortable-list]")).toBeNull();

    await act(async () => chunk.release());
    await sortableReady();

    // Nhóm tag được tạo lại trong Sortable (phần tử cũ đã rời DOM), focus nằm trên tag mới cùng value.
    expect(before.isConnected).toBe(false);
    const after = tag("Cam");
    expect(document.activeElement).toBe(after);
    expect(after).toHaveAttribute("data-sortable-item");
    expect(after.className.split(" ")).toEqual(expect.arrayContaining(beforeClasses));
    expect(screen.getByRole("toolbar").className).toBe(toolbarClass);
    expect(tags()).toEqual(["Táo", "Cam", "Lê"]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Trái cây" })).toBe(input);
    expect(input).toHaveValue("");

    // Alt + → đổi thứ tự ngay trên tag vừa nhận lại focus.
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onValueChange).toHaveBeenLastCalledWith(["tao", "le", "cam"]);
    expect(tag("Cam")).toHaveFocus();
  });

  it("tắt reorderable khi đang focus tag: focus ở lại tag đó; focus ở ô nhập thì không bị kéo đi", async () => {
    const user = userEvent.setup();
    const props = { "aria-label": "Trái cây", options: OPTIONS, defaultValue: ["tao", "cam", "le"] };
    chunk.release();
    const { rerender } = render(<TagPicker {...props} reorderable />);
    await sortableReady();
    tag("Táo").focus();
    rerender(<TagPicker {...props} reorderable={false} />);
    expect(document.querySelector("[data-sortable-list]")).toBeNull();
    expect(tag("Táo")).toHaveFocus();

    const input = screen.getByRole("combobox", { name: "Trái cây" });
    await user.click(input);
    rerender(<TagPicker {...props} reorderable />);
    expect(document.querySelector("[data-sortable-list]")).not.toBeNull();
    expect(input).toHaveFocus();
  });
});
