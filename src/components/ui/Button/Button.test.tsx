import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Save20Regular } from "@fluentui/react-icons";
import { Button } from "./Button";

describe("Button", () => {
  it("mặc định type=button (không submit form ngoài ý muốn)", () => {
    render(<Button>Lưu</Button>);
    expect(screen.getByRole("button", { name: "Lưu" })).toHaveAttribute("type", "button");
  });

  it("className người dùng thắng biến thể mặc định (cn ở cuối)", () => {
    render(<Button className="rounded-circular px-4">Lưu</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("rounded-circular");
    expect(button.className).not.toContain("rounded-medium");
    expect(button.className).toContain("px-4");
    expect(button.className).not.toMatch(/(^|\s)px-3(\s|$)/);
  });

  it("icon-only có aria-label và lớp vuông", () => {
    render(<Button icon={<Save20Regular />} aria-label="Lưu" />);
    expect(screen.getByRole("button", { name: "Lưu" }).className).toContain("w-8");
  });

  it("asChild render phần tử con với class của Button", () => {
    render(
      <Button asChild appearance="primary">
        <a href="#luu">Lưu</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Lưu" });
    expect(link.className).toContain("bg-brand-background");
  });
});

describe("Button loading", () => {
  it("aria-busy + aria-disabled, vẫn focus được, không gọi onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Lưu
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Lưu" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    // Không dùng disabled: vẫn nằm trong thứ tự Tab.
    expect(button).not.toBeDisabled();
    await user.tab();
    expect(button).toHaveFocus();
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    expect(button.className).toContain("cursor-progress");
  });

  it("loading=false: không có aria-busy, onClick chạy bình thường", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading={false} onClick={onClick}>
        Lưu
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Lưu" });
    expect(button).not.toHaveAttribute("aria-busy");
    expect(button).not.toHaveAttribute("aria-disabled");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("chỉ có nhãn: nhãn trong suốt (giữ độ rộng + tên), Spinner chồng lên giữa", () => {
    const { container, rerender } = render(<Button loading={false}>Lưu thay đổi</Button>);
    const label = screen.getByText("Lưu thay đổi");
    expect(label.className).not.toContain("opacity-0");
    expect(container.querySelector('[role="progressbar"]')).toBeNull();

    rerender(<Button loading>Lưu thay đổi</Button>);
    expect(screen.getByText("Lưu thay đổi").className).toContain("opacity-0");
    const spinner = container.querySelector('[role="progressbar"]');
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    // Nhãn và Spinner nằm cùng một ô lưới → độ rộng nút = độ rộng nhãn.
    expect(spinner?.parentElement).toBe(screen.getByText("Lưu thay đổi").parentElement);
    expect(spinner?.parentElement?.className).toContain("grid");
  });

  it("có icon: Spinner thay chỗ icon, nhãn giữ nguyên", () => {
    const { container, rerender } = render(
      <Button loading={false} icon={<Save20Regular data-testid="icon" />}>
        Lưu
      </Button>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    rerender(
      <Button loading icon={<Save20Regular data-testid="icon" />}>
        Lưu
      </Button>,
    );
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu" })).toBeInTheDocument();
  });

  it("loadingText: hai lớp chồng nhau, lớp không dùng bị invisible → độ rộng = nhãn dài hơn", () => {
    const { container, rerender } = render(
      <Button loading={false} loadingText="Đang lưu thay đổi…">
        Lưu
      </Button>,
    );
    const idle = screen.getByText("Lưu");
    const busy = screen.getByText("Đang lưu thay đổi…");
    // Cả hai lớp luôn có trong DOM (giữ chỗ), cùng một ô lưới.
    expect(idle.closest(".grid")).toBe(busy.closest(".grid"));
    expect(idle.className).not.toContain("invisible");
    expect(busy.className).toContain("invisible");
    // Chưa loading: ô giữ chỗ thay cho Spinner, không có progressbar.
    expect(container.querySelector('[role="progressbar"]')).toBeNull();

    rerender(
      <Button loading loadingText="Đang lưu thay đổi…">
        Lưu
      </Button>,
    );
    expect(screen.getByText("Lưu").className).toContain("invisible");
    expect(screen.getByText("Đang lưu thay đổi…").className).not.toContain("invisible");
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("primary đang loading → Spinner inverted; khi disabled → Spinner primary", () => {
    const { container, rerender } = render(
      <Button appearance="primary" loading>
        Lưu
      </Button>,
    );
    const arcClass = () => container.querySelectorAll('[role="progressbar"] circle')[1]?.getAttribute("class") ?? "";
    const inverted = arcClass();
    rerender(
      <Button appearance="primary" loading disabled>
        Lưu
      </Button>,
    );
    expect(arcClass()).not.toBe(inverted);
  });

  it("asChild + loading: chặn click, gắn aria-busy lên phần tử con", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild loading onClick={onClick}>
        <a href="#luu">Lưu</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Lưu" });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
    expect(window.location.hash).not.toBe("#luu");
  });
});
