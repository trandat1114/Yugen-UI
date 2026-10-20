import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Autocomplete, HighlightMatch, highlightRanges } from "./Autocomplete";
import { Quote } from "../Quote/Quote";

const FRUITS = ["Xoài", "Sầu riêng", "Măng cụt", "Chôm chôm"];

describe("highlightRanges", () => {
  it("khớp không dấu, trả chỉ số trong chuỗi gốc", () => {
    expect(highlightRanges("Xoài cát", "xoai")).toEqual([[0, 4]]);
    expect(highlightRanges("Chôm chôm", "CHOM")).toEqual([
      [0, 4],
      [5, 9],
    ]);
    expect(highlightRanges("Đà Lạt", "da")).toEqual([[0, 2]]);
    expect(highlightRanges("Măng cụt", "  ")).toEqual([]);
  });

  it("HighlightMatch bọc phần khớp trong <mark>", () => {
    const { container } = render(<HighlightMatch text="Sầu riêng" query="rieng" />);
    expect(container.querySelector("mark")?.textContent).toBe("riêng");
  });
});

describe("Autocomplete", () => {
  it("gõ để lọc, ↓ + Enter chọn gợi ý", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Autocomplete aria-label="Tìm" suggestions={FRUITS} onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "Tìm" });
    await user.type(input, "chom");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option").id);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith({ value: "Chôm chôm" });
    expect(input).toHaveValue("Chôm chôm");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("Enter không chọn gợi ý → onSubmit với nguyên từ khoá", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Autocomplete aria-label="Tìm" suggestions={FRUITS} onSubmit={onSubmit} />);
    await user.type(screen.getByRole("combobox"), "trái cây{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("trái cây");
  });

  it("Esc đóng danh sách trước, lần sau mới xoá ô", async () => {
    const user = userEvent.setup();
    render(<Autocomplete aria-label="Tìm" suggestions={FRUITS} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "x");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("x");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("bỏ qua gợi ý disabled khi di chuyển bằng phím", async () => {
    const user = userEvent.setup();
    render(
      <Autocomplete
        aria-label="Tìm"
        suggestions={[{ value: "Một", disabled: true }, { value: "Mười" }]}
      />,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "m");
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Mười" }).id);
  });

  it("hiện thông báo khi không có gợi ý", async () => {
    const user = userEvent.setup();
    render(<Autocomplete aria-label="Tìm" suggestions={FRUITS} emptyMessage="Không có" />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(await screen.findByText("Không có")).toBeInTheDocument();
  });
});

describe("Quote", () => {
  it("dùng figure › blockquote[cite] + figcaption › cite", () => {
    const { container } = render(
      <Quote author="An" source="Sách" cite="https://example.com">
        Nội dung
      </Quote>,
    );
    expect(container.querySelector("figure blockquote")?.getAttribute("cite")).toBe("https://example.com");
    expect(container.querySelector("figcaption cite a")?.getAttribute("href")).toBe("https://example.com");
    expect(container.querySelector("blockquote p")?.textContent).toBe("Nội dung");
  });
});
