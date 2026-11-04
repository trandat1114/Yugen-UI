import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuItem } from "../Menu/Menu";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { SplitButton, splitButtonMessagesVi } from "./SplitButton";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Demo(props: Partial<React.ComponentProps<typeof SplitButton>>) {
  return (
    <SplitButton menu={<MenuItem onSelect={props.onSelect as () => void}>Gửi sau</MenuItem>} {...props}>
      Gửi
    </SplitButton>
  );
}

describe("SplitButton", () => {
  it("nút chính + nút mở menu; ref tới nút chính; className lên khung", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    const { container } = render(<Demo ref={ref} className="ms-2" onClick={onClick} />);
    const primary = screen.getByRole("button", { name: "Gửi" });
    expect(ref.current).toBe(primary);
    expect(primary).toHaveClass("rounded-e-none");
    expect(container.firstElementChild).toHaveClass("ms-2", "inline-flex");
    await user.click(primary);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("nút mũi tên mở menu, chọn mục gọi onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    const toggle = screen.getByRole("button", { name: "Thêm tuỳ chọn" });
    expect(toggle).toHaveAttribute("aria-haspopup", "menu");
    await user.click(toggle);
    await user.click(await screen.findByRole("menuitem", { name: "Gửi sau" }));
    expect(onSelect).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("nhãn nút menu: tiếng Anh mặc định, tiếng Việt qua splitButtonMessagesVi, menuLabel thắng", () => {
    const { unmount } = renderBare(<Demo />);
    expect(screen.getByRole("button", { name: "More options" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ splitButton: splitButtonMessagesVi }}>
        <Demo />
        <SplitButton menu={null} menuLabel="Lịch gửi">
          Lên lịch
        </SplitButton>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Thêm tuỳ chọn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lịch gửi" })).toBeInTheDocument();
  });

  it("disabled tắt cả hai nút; vạch chia + bề rộng nút menu theo appearance / size", () => {
    render(
      <>
        <Demo disabled />
        <SplitButton appearance="primary" size="small" menu={null} menuLabel="p">
          P
        </SplitButton>
        <SplitButton appearance="subtle" size="large" menu={null} menuLabel="s">
          S
        </SplitButton>
      </>,
    );
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Thêm tuỳ chọn" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Thêm tuỳ chọn" })).toHaveClass("w-8", "-ms-px");
    expect(screen.getByRole("button", { name: "p" })).toHaveClass("w-6", "border-s-stroke-on-brand/40");
    expect(screen.getByRole("button", { name: "s" })).toHaveClass("w-11", "border-s-stroke-2");
  });
});
