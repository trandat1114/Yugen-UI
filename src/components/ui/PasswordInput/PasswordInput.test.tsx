import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { PasswordInput, getPasswordStrength } from "./PasswordInput";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

describe("getPasswordStrength", () => {
  it("chấm điểm theo độ dài và số loại ký tự", () => {
    expect(getPasswordStrength("")).toBe(0);
    expect(getPasswordStrength("abc")).toBe(1);
    expect(getPasswordStrength("aaaaaaaaaaaaaaaa")).toBe(1);
    expect(getPasswordStrength("password")).toBe(1);
    expect(getPasswordStrength("Password1")).toBe(2);
    expect(getPasswordStrength("Password1!")).toBe(3);
    expect(getPasswordStrength("Tr0ub4dor&3xyz")).toBe(4);
  });
});

describe("PasswordInput", () => {
  it("nút hiện / ẩn đổi type và aria-pressed, focus ở lại ô nhập", async () => {
    const onVisibleChange = vi.fn();
    render(<PasswordInput aria-label="Password" onVisibleChange={onVisibleChange} />, { wrapper: english });
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(input);
    await userEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onVisibleChange).toHaveBeenLastCalledWith(true);
    expect(input).toHaveFocus();
  });

  it("nhắc Caps Lock khi gõ, ẩn khi rời ô", () => {
    render(<PasswordInput aria-label="Password" />, { wrapper: english });
    const input = screen.getByLabelText("Password");
    fireEvent.keyDown(input, { key: "A", modifierCapsLock: true });
    expect(screen.getByText("Caps Lock is on")).toBeInTheDocument();
    expect(input.getAttribute("aria-describedby")).toContain(screen.getByText("Caps Lock is on").parentElement!.id);
    fireEvent.keyUp(input, { key: "CapsLock", modifierCapsLock: false });
    expect(screen.queryByText("Caps Lock is on")).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "A", modifierCapsLock: true });
    fireEvent.blur(input);
    expect(screen.queryByText("Caps Lock is on")).not.toBeInTheDocument();
  });

  it("capsLockWarning={false} không nhắc", () => {
    render(<PasswordInput aria-label="Password" capsLockWarning={false} />, { wrapper: english });
    fireEvent.keyDown(screen.getByLabelText("Password"), { key: "A", modifierCapsLock: true });
    expect(screen.queryByText("Caps Lock is on")).not.toBeInTheDocument();
  });

  it("thước đo độ mạnh theo chữ gõ, hàm chấm điểm riêng", async () => {
    render(
      <>
        <PasswordInput aria-label="New password" strength />
        <PasswordInput aria-label="Custom" strength={() => 4} defaultValue="x" />
      </>,
      { wrapper: english },
    );
    const input = screen.getByLabelText("New password");
    await userEvent.type(input, "abc");
    expect(screen.getByText("Weak")).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "Tr0ub4dor&3xyz");
    expect(screen.getAllByText("Strong")).toHaveLength(2);
  });

  it("giữ hint / validationMessage trong aria-describedby", () => {
    render(<PasswordInput label="Password" hint="At least 8 characters" strength />, { wrapper: english });
    const input = screen.getByLabelText("Password");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(screen.getByText("At least 8 characters").id);
    expect(ids).toHaveLength(3);
  });

  it("chuỗi tiếng Việt qua messagesVi", () => {
    render(<PasswordInput aria-label="Mật khẩu" />);
    expect(screen.getByRole("button", { name: "Hiện mật khẩu" })).toBeInTheDocument();
  });

  it("ref trỏ tới ô nhập", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<PasswordInput aria-label="Password" ref={ref} />, { wrapper: english });
    expect(ref.current).toBe(screen.getByLabelText("Password"));
  });
});
