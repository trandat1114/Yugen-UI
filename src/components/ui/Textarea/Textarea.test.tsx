import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../Field/Field";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("textbox nhiều dòng; ref tới textarea; className lên khung, textareaClassName lên textarea", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="Ghi chú" className="w-80" textareaClassName="font-mono" />);
    const textarea = screen.getByRole("textbox", { name: "Ghi chú" });
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveClass("font-mono", "resize-none", "min-h-13");
    expect(textarea.parentElement).toHaveClass("w-80");
  });

  it("gõ: uncontrolled + onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Ghi chú" defaultValue="Dòng 1" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "{Enter}Dòng 2");
    expect(screen.getByRole("textbox")).toHaveValue("Dòng 1\nDòng 2");
    expect(onChange).toHaveBeenCalled();
  });

  it("size / resize / appearance; disabled + aria-invalid gắn data-* lên khung", () => {
    render(<Textarea aria-label="x" size="large" resize="vertical" appearance="filled-darker" disabled aria-invalid />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("resize-y", "min-h-16");
    expect(textarea).toBeDisabled();
    const root = textarea.parentElement!;
    expect(root).toHaveClass("bg-background-3");
    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
  });

  it("trong Field nhận nhãn và thông báo lỗi", () => {
    render(
      <Field label="Mô tả" validationState="error" validationMessage="Quá ngắn">
        <Textarea />
      </Field>,
    );
    const textarea = screen.getByRole("textbox", { name: "Mô tả" });
    expect(textarea).toHaveAccessibleDescription("Quá ngắn");
    expect(textarea.parentElement).toHaveAttribute("data-invalid", "true");
  });
});
