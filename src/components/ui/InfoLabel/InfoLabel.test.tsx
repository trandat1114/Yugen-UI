import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { InfoLabel, infoLabelMessagesVi } from "./InfoLabel";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("InfoLabel", () => {
  it("label gắn với control; nút (i) có tên = nhãn nút + nhãn trường; ref + className", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(
      <>
        <InfoLabel ref={ref} htmlFor="email" info="Dùng email công ty" className="font-mono" rootClassName="mb-1">
          Email
        </InfoLabel>
        <input id="email" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    expect(ref.current).toHaveClass("font-mono", "text-body1");
    expect(ref.current?.parentElement).toHaveClass("mb-1");
    expect(screen.getByRole("button", { name: "Thông tin Email" })).toHaveAttribute("aria-expanded", "false");
  });

  it("bấm (i) mở popover giải thích; Escape đóng và trả focus", async () => {
    const user = userEvent.setup();
    render(<InfoLabel info="Dùng email công ty">Email</InfoLabel>);
    const button = screen.getByRole("button", { name: /Email/ });
    await user.click(button);
    expect(await screen.findByRole("dialog")).toHaveTextContent("Dùng email công ty");
    expect(button).toHaveAttribute("data-state", "open");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(button).toHaveFocus();
  });

  it("required (* aria-hidden), disabled, weight / size, id riêng", () => {
    render(
      <InfoLabel id="lbl" info="?" required disabled weight="semibold" size="large">
        Mật khẩu
      </InfoLabel>,
    );
    const label = screen.getByText("Mật khẩu");
    expect(label).toHaveAttribute("id", "lbl");
    expect(label).toHaveClass("text-body2", "font-semibold", "text-foreground-disabled");
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Thông tin Mật khẩu" })).toHaveClass("size-6");
  });

  it("nhãn nút: tiếng Anh mặc định, tiếng Việt qua infoLabelMessagesVi, infoButtonLabel thắng", () => {
    const { unmount } = renderBare(<InfoLabel info="?">Email</InfoLabel>);
    expect(screen.getByRole("button", { name: "Information Email" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ infoLabel: infoLabelMessagesVi }}>
        <InfoLabel info="?">Email</InfoLabel>
        <InfoLabel info="?" infoButtonLabel="Giải thích" size="small">
          Tên
        </InfoLabel>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Thông tin Email" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Giải thích Tên" })).toHaveClass("size-4");
  });
});
