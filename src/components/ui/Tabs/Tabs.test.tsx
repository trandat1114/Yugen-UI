import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

function Demo({ onValueChange, activationMode }: { onValueChange?: (v: string) => void; activationMode?: "automatic" | "manual" }) {
  return (
    <Tabs defaultValue="overview" onValueChange={onValueChange} activationMode={activationMode}>
      <TabsList aria-label="Dự án">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Lưu trữ
        </TabsTrigger>
        <TabsTrigger value="settings">Cài đặt</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Nội dung tổng quan</TabsContent>
      <TabsContent value="activity">Nội dung hoạt động</TabsContent>
      <TabsContent value="archived">Nội dung lưu trữ</TabsContent>
      <TabsContent value="settings">Nội dung cài đặt</TabsContent>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  it("tablist / tab / tabpanel, tab đang chọn có aria-selected và nối với panel", () => {
    render(<Demo />);
    expect(screen.getByRole("tablist", { name: "Dự án" })).toBeInTheDocument();
    expect(tab("Tổng quan")).toHaveAttribute("aria-selected", "true");
    expect(tab("Hoạt động")).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Nội dung tổng quan");
    expect(tab("Tổng quan")).toHaveAttribute("aria-controls", panel.id);
    expect(tab("Lưu trữ")).toBeDisabled();
  });

  it("tên truy cập không bị lặp dù có lớp chữ đậm giữ chỗ (aria-hidden)", () => {
    render(<Demo />);
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Tổng quan Tổng quan" })).not.toBeInTheDocument();
  });

  it("ArrowRight / ArrowLeft chuyển và kích hoạt tab, bỏ qua tab disabled, vòng quanh", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await user.tab();
    expect(tab("Tổng quan")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tab("Hoạt động")).toHaveFocus();
    expect(tab("Hoạt động")).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("activity");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Nội dung hoạt động");

    await user.keyboard("{ArrowRight}");
    expect(tab("Cài đặt")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(tab("Tổng quan")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tab("Cài đặt")).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalledWith("archived");
  });

  it("Home / End", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    await user.keyboard("{End}");
    expect(tab("Cài đặt")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tab("Tổng quan")).toHaveFocus();
  });

  it("một tab stop: Tab từ tab đang chọn đi vào panel", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(tab("Tổng quan")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("activationMode manual: mũi tên chỉ di chuyển focus, Enter mới kích hoạt", async () => {
    const user = userEvent.setup();
    render(<Demo activationMode="manual" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Hoạt động")).toHaveFocus();
    expect(tab("Hoạt động")).toHaveAttribute("aria-selected", "false");
    await user.keyboard("{Enter}");
    expect(tab("Hoạt động")).toHaveAttribute("aria-selected", "true");
  });

  it("click chọn tab", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(tab("Cài đặt"));
    expect(tab("Cài đặt")).toHaveAttribute("aria-selected", "true");
    await user.click(tab("Lưu trữ"));
    expect(tab("Cài đặt")).toHaveAttribute("aria-selected", "true");
  });

  it("RTL (YugenProvider dir=rtl): ArrowLeft đi tới, ArrowRight đi lùi", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider dir="rtl">
        <Demo />
      </YugenProvider>,
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(tab("Hoạt động")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(tab("Tổng quan")).toHaveFocus();
  });
});
