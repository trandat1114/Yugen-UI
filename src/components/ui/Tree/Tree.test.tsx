import * as React from "react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Tree, TreeItem, TreeItemLayout, type TreeProps } from "./Tree";

function FileTree(props: TreeProps) {
  return (
    <Tree aria-label="Tệp dự án" defaultOpenItems={["src"]} {...props}>
      <TreeItem itemType="branch" value="src">
        <TreeItemLayout>src</TreeItemLayout>
        <Tree>
          <TreeItem itemType="branch" value="components">
            <TreeItemLayout>components</TreeItemLayout>
            <Tree>
              <TreeItem itemType="leaf" value="button">
                <TreeItemLayout>Button.tsx</TreeItemLayout>
              </TreeItem>
            </Tree>
          </TreeItem>
          <TreeItem itemType="leaf" value="main">
            <TreeItemLayout>main.tsx</TreeItemLayout>
          </TreeItem>
        </Tree>
      </TreeItem>
      <TreeItem itemType="leaf" value="package">
        <TreeItemLayout>package.json</TreeItemLayout>
      </TreeItem>
    </Tree>
  );
}

function setup(ui: ReactElement) {
  const user = userEvent.setup();
  const utils = render(
    <>
      <button type="button">trước</button>
      {ui}
      <button type="button">sau</button>
    </>,
  );
  const item = (value: string) => {
    const el = utils.container.querySelector<HTMLElement>(`[role="treeitem"][data-value="${value}"]`);
    if (!el) throw new Error(`Không thấy treeitem ${value}`);
    return el;
  };
  return { user, item, ...utils };
}

describe("Tree — cấu trúc ARIA", () => {
  it("role tree / treeitem / group, aria-level, aria-expanded chỉ trên nhánh", () => {
    const { getByRole, item } = setup(<FileTree />);
    expect(getByRole("tree", { name: "Tệp dự án" })).toBeInTheDocument();
    expect(item("src")).toHaveAttribute("aria-level", "1");
    expect(item("src")).toHaveAttribute("aria-expanded", "true");
    expect(item("components")).toHaveAttribute("aria-level", "2");
    expect(item("components")).toHaveAttribute("aria-expanded", "false");
    expect(item("main")).not.toHaveAttribute("aria-expanded");
    expect(item("src").querySelector('[role="group"]')).toBeInTheDocument();
    // Nhánh đóng không render subtree.
    expect(() => item("button")).toThrow();
  });

  it("đúng một tab stop (mục đầu tiên)", async () => {
    const { user, item } = setup(<FileTree />);
    expect(item("src")).toHaveAttribute("tabindex", "0");
    expect(item("components")).toHaveAttribute("tabindex", "-1");
    expect(item("package")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    await user.tab();
    expect(item("src")).toHaveFocus();
    await user.tab();
    expect(document.activeElement).toHaveTextContent("sau");
  });
});

describe("Tree — bàn phím", () => {
  it("ArrowDown / ArrowUp đi theo thứ tự hiển thị, dừng ở hai đầu; Home / End", async () => {
    const { user, item } = setup(<FileTree />);
    item("src").focus();
    await user.keyboard("{ArrowDown}");
    expect(item("components")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("main")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("package")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("package")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(item("main")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("src")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(item("src")).toHaveFocus();
    await user.keyboard("{End}");
    expect(item("package")).toHaveFocus();
  });

  it("roving tabindex đi theo focus", async () => {
    const { user, item } = setup(<FileTree />);
    item("src").focus();
    await user.keyboard("{End}");
    expect(item("package")).toHaveAttribute("tabindex", "0");
    expect(item("src")).toHaveAttribute("tabindex", "-1");
    // Tab ra rồi Shift+Tab vào lại → về đúng mục vừa rời.
    await user.tab();
    await user.tab({ shift: true });
    expect(item("package")).toHaveFocus();
  });

  it("ArrowRight: nhánh đóng → mở; nhánh mở → vào con đầu tiên; lá → không làm gì", async () => {
    const onOpenChange = vi.fn();
    const { user, item } = setup(<FileTree onOpenChange={onOpenChange} />);
    item("components").focus();
    await user.keyboard("{ArrowRight}");
    expect(item("components")).toHaveAttribute("aria-expanded", "true");
    expect(item("components")).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(["src", "components"], { value: "components", open: true });

    await user.keyboard("{ArrowRight}");
    expect(item("button")).toHaveFocus();
    expect(item("button")).toHaveAttribute("aria-level", "3");

    await user.keyboard("{ArrowRight}");
    expect(item("button")).toHaveFocus();
  });

  it("ArrowLeft: lá / nhánh đóng → lên cha; nhánh mở → đóng", async () => {
    const { user, item } = setup(<FileTree defaultOpenItems={["src", "components"]} />);
    item("button").focus();
    await user.keyboard("{ArrowLeft}");
    expect(item("components")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("components")).toHaveAttribute("aria-expanded", "false");
    expect(item("components")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("src")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("src")).toHaveAttribute("aria-expanded", "false");
    // Mục gốc đã đóng: ArrowLeft không đi đâu.
    await user.keyboard("{ArrowLeft}");
    expect(item("src")).toHaveFocus();
  });

  it("Enter / Space: chọn mục (selectionMode single) và bật/tắt nhánh", async () => {
    const onSelectedChange = vi.fn();
    const { user, item } = setup(<FileTree selectionMode="single" onSelectedChange={onSelectedChange} />);
    expect(item("main")).toHaveAttribute("aria-selected", "false");
    item("main").focus();
    await user.keyboard("{Enter}");
    expect(onSelectedChange).toHaveBeenLastCalledWith("main");
    expect(item("main")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    await user.keyboard(" ");
    expect(item("components")).toHaveAttribute("aria-expanded", "true");
    expect(item("components")).toHaveAttribute("aria-selected", "true");
    expect(item("main")).toHaveAttribute("aria-selected", "false");
  });

  it("mục đang chọn là tab stop khi vào cây", async () => {
    const { user, item } = setup(<FileTree selectionMode="single" defaultSelectedValue="main" />);
    expect(item("main")).toHaveAttribute("tabindex", "0");
    expect(item("src")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    await user.tab();
    expect(item("main")).toHaveFocus();
  });

  it("selectionMode none: không có aria-selected, click chỉ mở/đóng", async () => {
    const { user, item } = setup(<FileTree />);
    expect(item("main")).not.toHaveAttribute("aria-selected");
    await user.click(item("components").querySelector("[data-tree-layout]") as HTMLElement);
    expect(item("components")).toHaveAttribute("aria-expanded", "true");
    // Click vào mục con không làm nhánh cha đóng.
    await user.click(item("button").querySelector("[data-tree-layout]") as HTMLElement);
    expect(item("components")).toHaveAttribute("aria-expanded", "true");
  });

  it("controlled openItems", async () => {
    const onOpenChange = vi.fn();
    const { user, item } = setup(<FileTree openItems={["src"]} onOpenChange={onOpenChange} />);
    item("components").focus();
    await user.keyboard("{ArrowRight}");
    expect(onOpenChange).toHaveBeenCalledWith(["src", "components"], { value: "components", open: true });
    // Cha không cập nhật → vẫn đóng.
    expect(item("components")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Tree — RTL", () => {
  it("ArrowLeft mở / vào con, ArrowRight đóng / lên cha", async () => {
    const { user, item } = setup(
      <YugenProvider dir="rtl">
        <FileTree />
      </YugenProvider>,
    );
    item("components").focus();
    await user.keyboard("{ArrowLeft}");
    expect(item("components")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowLeft}");
    expect(item("button")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("components")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("components")).toHaveAttribute("aria-expanded", "false");
    // Lên/xuống không đổi trong RTL.
    await user.keyboard("{ArrowDown}");
    expect(item("main")).toHaveFocus();
  });
});

describe("Tree — hiệu năng", () => {
  it("di chuyển bằng phím chỉ render lại hai mục đổi tab stop", async () => {
    const user = userEvent.setup();
    const renders = new Set<string>();
    const Leaf = React.memo(function Leaf({ value }: { value: string }) {
      return (
        <React.Profiler id={value} onRender={(id) => renders.add(id)}>
          <TreeItem itemType="leaf" value={value}>
            <TreeItemLayout>{value}</TreeItemLayout>
          </TreeItem>
        </React.Profiler>
      );
    });
    render(
      <Tree aria-label="Tệp">
        {["a", "b", "c", "d"].map((v) => (
          <Leaf key={v} value={v} />
        ))}
      </Tree>,
    );
    await user.tab();
    renders.clear();
    await user.keyboard("{ArrowDown}");
    expect([...renders].sort()).toEqual(["a", "b"]);
  });
});
