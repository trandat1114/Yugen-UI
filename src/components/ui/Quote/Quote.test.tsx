import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Quote } from "./Quote";

describe("Quote", () => {
  it("figure › blockquote + figcaption; chuỗi được bọc trong <p>; ref + className", () => {
    const ref = { current: null as HTMLElement | null };
    const { container } = render(
      <Quote ref={ref} author="Trịnh Công Sơn" authorTitle="Nhạc sĩ" className="my-4">
        Sống trong đời sống cần có một tấm lòng
      </Quote>,
    );
    const figure = screen.getByRole("figure");
    expect(ref.current).toBe(figure);
    expect(figure).toHaveClass("my-4", "border-s-3", "border-brand-stroke");
    const blockquote = container.querySelector("blockquote")!;
    expect(blockquote.firstElementChild?.tagName).toBe("P");
    expect(blockquote).toHaveTextContent("Sống trong đời sống cần có một tấm lòng");
    const caption = container.querySelector("figcaption")!;
    expect(caption).toHaveTextContent("— Trịnh Công Sơn");
    expect(caption).toHaveTextContent("Nhạc sĩ");
    // Gạch đầu dòng chỉ để nhìn.
    expect(screen.getByText("—", { exact: false })).toHaveAttribute("aria-hidden", "true");
  });

  it("source + cite: cite trên blockquote, nguồn thành link trong <cite>", () => {
    const { container } = render(
      <Quote author="An" authorTitle="Kỹ sư" source="Phỏng vấn 2025" cite="https://example.com/pv">
        <p>Đoạn 1</p>
        <p>Đoạn 2</p>
      </Quote>,
    );
    expect(container.querySelector("blockquote")).toHaveAttribute("cite", "https://example.com/pv");
    expect(container.querySelectorAll("blockquote p")).toHaveLength(2);
    const link = screen.getByRole("link", { name: "Phỏng vấn 2025" });
    expect(link).toHaveAttribute("href", "https://example.com/pv");
    expect(link.closest("cite")).not.toBeNull();
    expect(container.querySelector("figcaption")).toHaveTextContent("Kỹ sư · Phỏng vấn 2025");
  });

  it("không có tác giả / nguồn: không có figcaption; source không có cite thì không thành link", () => {
    const { container, rerender } = render(<Quote>Chỉ trích dẫn</Quote>);
    expect(container.querySelector("figcaption")).toBeNull();
    rerender(<Quote source="Sách">Có nguồn</Quote>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("cite")).toHaveTextContent("Sách");
  });

  it("avatar thay gạch đầu dòng; appearance subtle / emphasis; size", () => {
    const { container, rerender } = render(
      <Quote author="An" avatar={<span data-testid="avatar" />} appearance="subtle" size="small">
        Nhẹ
      </Quote>,
    );
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(container.querySelector("figcaption")).not.toHaveTextContent("—");
    expect(screen.getByRole("figure")).toHaveClass("border-stroke-1");
    expect(container.querySelector("blockquote")).toHaveClass("text-body1", "text-foreground-2");
    rerender(
      <Quote appearance="emphasis" size="large">
        Nổi bật
      </Quote>,
    );
    expect(screen.getByRole("figure")).toHaveClass("bg-background-2", "rounded-xlarge");
    expect(screen.getByRole("figure")).not.toHaveClass("border-s-3");
    expect(container.querySelector("blockquote")).toHaveClass("text-title2", "font-semibold");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
