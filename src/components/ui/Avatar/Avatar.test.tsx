import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("role img với tên đầy đủ; chữ viết tắt aria-hidden", async () => {
    render(<Avatar name="Nguyễn Văn An" />);
    const avatar = screen.getByRole("img", { name: "Nguyễn Văn An" });
    // Fallback của Radix hiện sau một nhịp setTimeout.
    const initials = await screen.findByText("NA");
    expect(avatar).toContainElement(initials);
    expect(initials).toHaveAttribute("aria-hidden", "true");
  });

  it("chữ viết tắt: một từ lấy 2 ký tự đầu; tên rỗng không có chữ", async () => {
    const { rerender } = render(<Avatar name="linh" />);
    expect(await screen.findByText("LI")).toBeInTheDocument();
    rerender(<Avatar name="   " />);
    expect(screen.getByRole("img").textContent).toBe("");
  });

  it("size / shape / color; className lên khung tròn", () => {
    const { container } = render(<Avatar name="An" size={64} shape="square" color="brand" className="ring-2" />);
    const root = container.querySelector(".ring-2");
    expect(root).toHaveClass("size-16", "rounded-medium", "bg-brand-background");
  });

  it("color colorful: màu ổn định theo tên", () => {
    const { container, rerender } = render(<Avatar name="Trần Bình" color="colorful" />);
    const first = container.querySelector('[role="img"] > span')!.className;
    rerender(<Avatar name="Trần Bình" color="colorful" />);
    expect(container.querySelector('[role="img"] > span')!.className).toBe(first);
    expect(first).toMatch(/bg-(cranberry|marigold|teal|lavender|forest|steel)-bg/);
  });

  it("presence: chấm trạng thái theo màu, nhỏ hơn với avatar cỡ 20/24", () => {
    const { container, rerender } = render(<Avatar name="An" presence="available" />);
    const dot = () => container.querySelector('[role="img"] > span:last-child')!;
    expect(dot()).toHaveClass("bg-success-background-3", "size-3");
    rerender(<Avatar name="An" presence="busy" size={24} />);
    expect(dot()).toHaveClass("bg-danger-background-3", "size-2");
    rerender(<Avatar name="An" presence="offline" />);
    expect(dot()).toHaveClass("ring-foreground-3");
  });
});
