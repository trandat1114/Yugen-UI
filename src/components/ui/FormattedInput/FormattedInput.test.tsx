import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { FormattedInput, applyMask, getCardMask, getPhoneMask } from "./FormattedInput";

const english = ({ children }: { children: React.ReactNode }) => (
  <YugenProvider messages={messagesEn} locale="en-US">
    {children}
  </YugenProvider>
);

describe("helper", () => {
  it("applyMask chỉ chèn ký tự mask khi có chữ số phía sau", () => {
    expect(applyMask("", "(###) ###-####")).toBe("");
    expect(applyMask("555", "(###) ###-####")).toBe("(555");
    expect(applyMask("5551", "(###) ###-####")).toBe("(555) 1");
    expect(applyMask("5551234567", "(###) ###-####")).toBe("(555) 123-4567");
  });

  it("mask theo locale và loại thẻ", () => {
    expect(getPhoneMask("en-US")).toBe("(###) ###-####");
    expect(getPhoneMask("vi-VN")).toBe("#### ### ###");
    expect(getPhoneMask("xx")).toBe("### ### ### ###");
    expect(getCardMask("37")).toBe("#### ###### #####");
    expect(getCardMask("4111")).toBe("#### #### #### #### ###");
  });
});

describe("FormattedInput", () => {
  it("phone: định dạng khi gõ, báo giá trị thô", async () => {
    const onValueChange = vi.fn();
    render(<FormattedInput format="phone" aria-label="Phone" onValueChange={onValueChange} />, { wrapper: english });
    const input = screen.getByLabelText("Phone");
    await userEvent.type(input, "555123456789");
    expect(input).toHaveValue("(555) 123-4567");
    expect(onValueChange).toHaveBeenLastCalledWith("5551234567", { formatted: "(555) 123-4567" });
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("autocomplete", "tel");
  });

  it("bỏ ký tự không phải số, con trỏ đứng yên", async () => {
    render(<FormattedInput format="phone" aria-label="Phone" defaultValue="5551234567" />, { wrapper: english });
    const input = screen.getByLabelText<HTMLInputElement>("Phone");
    input.setSelectionRange(3, 3);
    await userEvent.type(input, "x", { initialSelectionStart: 3, initialSelectionEnd: 3 });
    expect(input).toHaveValue("(555) 123-4567");
    expect(input.selectionStart).toBe(3);
  });

  it("gõ giữa chừng giữ vị trí con trỏ", async () => {
    render(<FormattedInput format="card" aria-label="Card" defaultValue="4111111111" />, { wrapper: english });
    const input = screen.getByLabelText<HTMLInputElement>("Card");
    expect(input).toHaveValue("4111 1111 11");
    // Sau "4111 " (vị trí 5), gõ "22" → hai chữ số chen vào, con trỏ sau chúng.
    await userEvent.type(input, "22", { initialSelectionStart: 5, initialSelectionEnd: 5 });
    expect(input).toHaveValue("4111 2211 1111");
    expect(input.selectionStart).toBe(7);
  });

  it("Backspace ngay sau dấu phân cách xoá chữ số trước nó", async () => {
    render(<FormattedInput format="phone" aria-label="Phone" defaultValue="5551234567" />, { wrapper: english });
    const input = screen.getByLabelText<HTMLInputElement>("Phone");
    // "(555) |123-4567": Backspace xoá khoảng trắng → xoá luôn số 5 đứng trước.
    await userEvent.type(input, "{Backspace}", { initialSelectionStart: 6, initialSelectionEnd: 6 });
    expect(input).toHaveValue("(551) 234-567");
    expect(input.selectionStart).toBe(3);
  });

  it("card: American Express nhóm 4-6-5, tối đa 15 số", async () => {
    render(<FormattedInput format="card" aria-label="Card" />, { wrapper: english });
    const input = screen.getByLabelText("Card");
    await userEvent.type(input, "3782822463100059");
    expect(input).toHaveValue("3782 822463 10005");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("currency: theo locale, đủ chữ số thập phân khi rời ô", async () => {
    const onValueChange = vi.fn();
    render(<FormattedInput format="currency" currency="USD" aria-label="Amount" onValueChange={onValueChange} />, { wrapper: english });
    const input = screen.getByLabelText("Amount");
    await userEvent.type(input, "001234.567");
    expect(input).toHaveValue("$1,234.56");
    expect(onValueChange).toHaveBeenLastCalledWith("1234.56", { formatted: "$1,234.56" });
    await userEvent.clear(input);
    await userEvent.type(input, "12.5");
    fireEvent.blur(input);
    expect(input).toHaveValue("$12.50");
    expect(onValueChange).toHaveBeenLastCalledWith("12.50", { formatted: "$12.50" });
  });

  it("currency: VND không có phần thập phân, dấu nhóm của vi-VN", async () => {
    render(<FormattedInput format="currency" currency="VND" locale="vi-VN" aria-label="Số tiền" />, { wrapper: english });
    const input = screen.getByLabelText("Số tiền");
    await userEvent.type(input, "1234567,5");
    expect((input as HTMLInputElement).value.replace(/\s/g, " ")).toBe("12.345.675 ₫");
  });

  it("controlled: hiển thị theo value thô", () => {
    function Controlled() {
      const [value, setValue] = React.useState("4111111111111111");
      return (
        <>
          <FormattedInput format="card" aria-label="Card" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue("")}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />, { wrapper: english });
    expect(screen.getByLabelText("Card")).toHaveValue("4111 1111 1111 1111");
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByLabelText("Card")).toHaveValue("");
  });

  it("name: form gửi giá trị thô qua input ẩn", () => {
    const { container } = render(<FormattedInput format="phone" aria-label="Phone" name="phone" defaultValue="5551234567" />, { wrapper: english });
    expect(screen.getByLabelText("Phone")).not.toHaveAttribute("name");
    expect(container.querySelector('input[type="hidden"][name="phone"]')).toHaveValue("5551234567");
  });
});
