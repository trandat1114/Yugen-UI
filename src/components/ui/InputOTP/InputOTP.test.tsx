import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@radix-ui/react-direction";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { InputOTP, inputOTPMessagesVi } from "./InputOTP";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const slots = () => screen.getAllByRole("textbox") as HTMLInputElement[];
const valueOf = () => slots().map((input) => input.value).join("");

describe("InputOTP", () => {
  it("group với N ô; ô đầu có id + autocomplete one-time-code; ref tới phần tử group", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<InputOTP ref={ref} length={4} id="otp" className="my-otp" aria-label="Mã xác minh" />);
    const group = screen.getByRole("group", { name: "Mã xác minh" });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass("my-otp", "inline-flex");
    expect(slots()).toHaveLength(4);
    expect(slots()[0]).toHaveAttribute("id", "otp");
    expect(slots()[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(slots()[1]).toHaveAttribute("autocomplete", "off");
    expect(slots()[0]).toHaveAttribute("inputmode", "numeric");
  });

  it("nhãn ô: tiếng Anh mặc định, tiếng Việt qua inputOTPMessagesVi", () => {
    const { unmount } = renderBare(<InputOTP length={4} />);
    expect(screen.getByRole("textbox", { name: "Character 1 of 4" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ inputOTP: inputOTPMessagesVi }}>
        <InputOTP length={4} />
      </YugenProvider>,
    );
    expect(screen.getByRole("textbox", { name: "Ký tự 2 trên 4" })).toBeInTheDocument();
  });

  it("gõ tự nhảy ô, bỏ ký tự không hợp lệ, gọi onComplete khi đủ", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    render(<InputOTP length={4} onValueChange={onValueChange} onComplete={onComplete} />);
    await user.click(slots()[0]);
    await user.keyboard("1");
    await waitFor(() => expect(slots()[1]).toHaveFocus());
    await user.keyboard("a");
    expect(valueOf()).toBe("1");
    await user.keyboard("2");
    await waitFor(() => expect(slots()[2]).toHaveFocus());
    await user.keyboard("3");
    await waitFor(() => expect(slots()[3]).toHaveFocus());
    await user.keyboard("4");
    expect(valueOf()).toBe("1234");
    expect(onValueChange).toHaveBeenLastCalledWith("1234");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("1234");
  });

  it("không cho focus vượt quá ô trống đầu tiên", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} defaultValue="1" />);
    await user.click(slots()[3]);
    await waitFor(() => expect(slots()[1]).toHaveFocus());
  });

  it("Backspace xoá ô hiện tại, ô trống thì lùi về ô trước; Delete xoá và kéo các ký tự sau lên", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} defaultValue="123" />);
    slots()[2].focus();
    await user.keyboard("{Backspace}");
    expect(valueOf()).toBe("12");
    await user.keyboard("{Backspace}");
    expect(valueOf()).toBe("1");
    await waitFor(() => expect(slots()[1]).toHaveFocus());
    slots()[0].focus();
    await user.keyboard("{Delete}");
    expect(valueOf()).toBe("");
  });

  it("←/→/Home/End di chuyển giữa các ô đã điền", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} defaultValue="12" />);
    slots()[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(slots()[1]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(slots()[2]).toHaveFocus();
    // Không đi quá ô trống đầu tiên.
    await user.keyboard("{ArrowRight}");
    expect(slots()[2]).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(slots()[1]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(slots()[0]).toHaveFocus();
    await user.keyboard("{End}");
    expect(slots()[2]).toHaveFocus();
  });

  it("RTL: ← tiến tới ô sau, → lùi về ô trước", async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <InputOTP length={4} defaultValue="12" />
      </DirectionProvider>,
    );
    slots()[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(slots()[1]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(slots()[0]).toHaveFocus();
  });

  it("dán điền nhiều ô (lọc ký tự không hợp lệ), đủ thì gọi onComplete", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<InputOTP length={6} onComplete={onComplete} />);
    slots()[0].focus();
    await user.paste("12-3");
    expect(valueOf()).toBe("123");
    await waitFor(() => expect(slots()[3]).toHaveFocus());
    await user.paste("456789");
    expect(valueOf()).toBe("456789");
    expect(onComplete).toHaveBeenCalledWith("456789");
  });

  it("controlled: hiển thị theo value, chỉ báo qua onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<InputOTP length={4} value="12" onValueChange={onValueChange} />);
    slots()[2].focus();
    await user.keyboard("3");
    expect(onValueChange).toHaveBeenCalledWith("123");
    expect(valueOf()).toBe("12");
    rerender(<InputOTP length={4} value="9876" onValueChange={onValueChange} />);
    expect(valueOf()).toBe("9876");
  });

  it("pattern alphanumeric / RegExp; defaultValue được lọc và cắt theo length", () => {
    const { unmount } = render(<InputOTP length={3} pattern="alphanumeric" defaultValue="a-B9z" />);
    expect(valueOf()).toBe("aB9");
    expect(slots()[0]).toHaveAttribute("inputmode", "text");
    unmount();
    render(<InputOTP length={3} pattern={/^[A-F]$/} defaultValue="AXFb" />);
    expect(valueOf()).toBe("AF");
  });

  it("groups chia nhóm với vạch ngăn mặc định hoặc separator tuỳ chọn; tổng sai thì bỏ qua", () => {
    const { container, unmount } = render(<InputOTP length={6} groups={[3, 3]} />);
    expect(container.querySelectorAll("span[aria-hidden]")).toHaveLength(1);
    unmount();
    const second = render(<InputOTP length={6} groups={[2, 2, 2]} separator={<span data-testid="sep">·</span>} />);
    expect(screen.getAllByTestId("sep")).toHaveLength(2);
    second.unmount();
    const third = render(<InputOTP length={6} groups={[2, 2]} />);
    expect(third.container.querySelectorAll("span[aria-hidden]")).toHaveLength(0);
  });

  it("name gửi giá trị gộp qua input ẩn; disabled / required / aria-invalid", () => {
    const { container } = render(<InputOTP length={4} defaultValue="12" name="otp" disabled required aria-invalid />);
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"][name="otp"]')?.value).toBe("12");
    for (const input of slots()) {
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("aria-invalid", "true");
    }
    expect(slots()[0]).toBeRequired();
    expect(slots()[1]).not.toBeRequired();
    expect(slots()[0].parentElement).toHaveAttribute("data-invalid", "true");
    expect(slots()[0].parentElement).toHaveAttribute("data-disabled", "true");
  });
});
