import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { List, ListItem } from "./List";

const FRUITS = ["Táo", "Cam", "Xoài", "Lê"];

describe("List", () => {
  it("roving tabindex: một mục nhận Tab, phím mũi tên / Home / End di chuyển", async () => {
    const user = userEvent.setup();
    render(
      <List navigationMode="items" aria-label="Trái cây">
        {FRUITS.map((f) => (
          <ListItem key={f} value={f}>
            {f}
          </ListItem>
        ))}
      </List>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((el) => el.tabIndex)).toEqual([0, -1, -1, -1]);

    await user.tab();
    expect(items[0]).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(items[2]).toHaveFocus();
    expect(items.map((el) => el.tabIndex)).toEqual([-1, -1, 0, -1]);
    await user.keyboard("{End}");
    expect(items[3]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(items[0]).toHaveFocus();
    expect(items.map((el) => el.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("chọn nhiều: aria-selected và onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <List selectionMode="multiselect" aria-label="Trái cây" onSelectionChange={onSelectionChange}>
        {FRUITS.map((f) => (
          <ListItem key={f} value={f}>
            {f}
          </ListItem>
        ))}
      </List>,
    );
    await user.click(screen.getByRole("option", { name: "Cam" }));
    await user.click(screen.getByRole("option", { name: "Lê" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["Cam", "Lê"]);
    expect(screen.getAllByRole("option").map((el) => el.getAttribute("aria-selected"))).toEqual(["false", "true", "false", "true"]);
  });

  it("di chuyển bằng phím chỉ render lại hai mục đổi tab stop", async () => {
    const user = userEvent.setup();
    const renders = new Set<string>();
    // Profiler báo mỗi lần cây con (ListItem) render lại.
    const Item = React.memo(function Item({ value }: { value: string }) {
      return (
        <React.Profiler id={value} onRender={(id) => renders.add(id)}>
          <ListItem value={value}>{value}</ListItem>
        </React.Profiler>
      );
    });
    render(
      <List navigationMode="items" aria-label="Trái cây">
        {FRUITS.map((f) => (
          <Item key={f} value={f} />
        ))}
      </List>,
    );
    await user.tab();
    renders.clear();
    await user.keyboard("{ArrowDown}");
    expect([...renders].sort()).toEqual(["Cam", "Táo"]);
  });
});
