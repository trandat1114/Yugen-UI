import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagPicker } from "./TagPicker";

const OPTIONS = [
  { value: "tao", label: "Táo" },
  { value: "cam", label: "Cam" },
  { value: "le", label: "Lê" },
];

function Picker({ onValueChange, reorderable = true }: { onValueChange?: (v: string[]) => void; reorderable?: boolean }) {
  const [value, setValue] = useState(["tao", "cam", "le"]);
  return (
    <TagPicker
      aria-label="Trái cây"
      options={OPTIONS}
      value={value}
      reorderable={reorderable}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
    />
  );
}

const tags = () => Array.from(document.querySelectorAll("[data-tag]")).map((t) => t.textContent?.split(",")[0]);
const tag = (label: string) => screen.getAllByRole("button").find((b) => b.textContent?.startsWith(label))!;

describe("TagPicker reorderable", () => {
  it("Alt + mũi tên đổi thứ tự tag, focus ở lại tag; Delete vẫn gỡ tag", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Picker onValueChange={onValueChange} />);
    tag("Táo").focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "tao", "le"]);
    expect(tag("Táo")).toHaveFocus();
    expect(tags()).toEqual(["Cam", "Táo", "Lê"]);

    // Alt + → ở tag cuối: không nhảy vào ô nhập.
    await user.keyboard("{Alt>}{ArrowRight}{ArrowRight}{/Alt}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "le", "tao"]);
    expect(tag("Táo")).toHaveFocus();

    await user.keyboard("{Delete}");
    expect(onValueChange).toHaveBeenLastCalledWith(["cam", "le"]);
  });

  it("không reorderable: Alt + mũi tên chỉ di chuyển focus như thường", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Picker onValueChange={onValueChange} reorderable={false} />);
    tag("Táo").focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(tag("Cam")).toHaveFocus();
  });
});
