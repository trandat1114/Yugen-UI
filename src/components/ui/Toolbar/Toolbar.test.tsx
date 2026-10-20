import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Toolbar, ToolbarButton, ToolbarDivider, ToolbarGroup, ToolbarToggleButton, type ToolbarProps } from "./Toolbar";

function FormatToolbar(props: ToolbarProps) {
  return (
    <Toolbar aria-label="Định dạng" {...props}>
      <ToolbarGroup>
        <ToolbarToggleButton>Đậm</ToolbarToggleButton>
        <ToolbarToggleButton>Nghiêng</ToolbarToggleButton>
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarButton disabled>Hoàn tác</ToolbarButton>
      <ToolbarButton>Chèn ảnh</ToolbarButton>
      <ToolbarButton>Chia sẻ</ToolbarButton>
    </Toolbar>
  );
}

function setup(ui: ReactElement) {
  const user = userEvent.setup();
  render(
    <>
      <button type="button">trước</button>
      {ui}
      <button type="button">sau</button>
    </>,
  );
  const btn = (name: string) => screen.getByRole("button", { name });
  return { user, btn };
}

describe("Toolbar — roving tabindex", () => {
  it("role toolbar + aria-orientation; divider là separator dọc", () => {
    setup(<FormatToolbar />);
    const toolbar = screen.getByRole("toolbar", { name: "Định dạng" });
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("chỉ một tab stop: Tab vào mục đầu, Tab nữa ra khỏi toolbar", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    expect(btn("Đậm")).toHaveAttribute("tabindex", "0");
    expect(btn("Nghiêng")).toHaveAttribute("tabindex", "-1");
    expect(btn("Chia sẻ")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    await user.tab();
    expect(btn("Đậm")).toHaveFocus();
    await user.tab();
    expect(btn("sau")).toHaveFocus();
  });

  it("ArrowRight / ArrowLeft vòng quanh, bỏ qua mục disabled", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    btn("Đậm").focus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Nghiêng")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Chèn ảnh")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Chia sẻ")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Đậm")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(btn("Chia sẻ")).toHaveFocus();
    // ArrowDown không có tác dụng ở toolbar ngang.
    await user.keyboard("{ArrowDown}");
    expect(btn("Chia sẻ")).toHaveFocus();
  });

  it("Home / End", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    btn("Nghiêng").focus();
    await user.keyboard("{End}");
    expect(btn("Chia sẻ")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(btn("Đậm")).toHaveFocus();
  });

  it("tab stop nhớ mục vừa dùng khi quay lại", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    btn("Đậm").focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(btn("Chèn ảnh")).toHaveAttribute("tabindex", "0");
    expect(btn("Đậm")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(btn("sau")).toHaveFocus();
    await user.tab({ shift: true });
    expect(btn("Chèn ảnh")).toHaveFocus();
  });

  it("click một mục → mục đó thành tab stop", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    await user.click(btn("Chia sẻ"));
    expect(btn("Chia sẻ")).toHaveAttribute("tabindex", "0");
    expect(btn("Đậm")).toHaveAttribute("tabindex", "-1");
  });

  it("ToolbarToggleButton bật/tắt aria-pressed bằng Space / Enter", async () => {
    const { user, btn } = setup(<FormatToolbar />);
    btn("Đậm").focus();
    expect(btn("Đậm")).toHaveAttribute("aria-pressed", "false");
    await user.keyboard(" ");
    expect(btn("Đậm")).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Enter}");
    expect(btn("Đậm")).toHaveAttribute("aria-pressed", "false");
  });

  it("dọc: ArrowDown / ArrowUp; ArrowRight không có tác dụng", async () => {
    const { user, btn } = setup(<FormatToolbar orientation="vertical" />);
    expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical");
    btn("Đậm").focus();
    await user.keyboard("{ArrowDown}");
    expect(btn("Nghiêng")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Nghiêng")).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(btn("Chia sẻ")).toHaveFocus();
  });

  it("RTL: ArrowLeft đi tới, ArrowRight đi lùi", async () => {
    const { user, btn } = setup(
      <YugenProvider dir="rtl">
        <FormatToolbar />
      </YugenProvider>,
    );
    btn("Đậm").focus();
    await user.keyboard("{ArrowLeft}");
    expect(btn("Nghiêng")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Đậm")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(btn("Chia sẻ")).toHaveFocus();
  });

  it("phím trong ô nhập không bị toolbar bắt", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="Tìm">
        <ToolbarButton>A</ToolbarButton>
        <input aria-label="Từ khoá" data-toolbar-item="" defaultValue="abc" />
        <ToolbarButton>B</ToolbarButton>
      </Toolbar>,
    );
    const input = screen.getByRole("textbox", { name: "Từ khoá" });
    input.focus();
    await user.keyboard("{ArrowLeft}");
    expect(input).toHaveFocus();
  });
});
