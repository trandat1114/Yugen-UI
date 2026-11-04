import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Body1Strong, Caption2, Display, Text, Title1 } from "./Text";

describe("Text", () => {
  it("mặc định span inline body1 regular; ref + className", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Text ref={ref} className="text-brand-foreground-1">
        Xin chào
      </Text>,
    );
    const text = screen.getByText("Xin chào");
    expect(ref.current).toBe(text);
    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveClass("text-body1", "font-normal", "font-sans", "inline", "whitespace-normal", "text-brand-foreground-1");
    expect(text).not.toHaveClass("font-display");
  });

  it("as đổi phần tử; size ≥ 500 dùng font-display", () => {
    render(
      <Text as="h2" size={700} weight="bold">
        Tiêu đề
      </Text>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Tiêu đề" });
    expect(heading).toHaveClass("text-title2", "font-bold", "font-display");
  });

  it("font / align / italic / block / wrap / truncate", () => {
    render(
      <Text font="numeric" align="end" italic block wrap={false} truncate>
        1.234.567
      </Text>,
    );
    expect(screen.getByText("1.234.567")).toHaveClass(
      "tabular-nums",
      "text-end",
      "italic",
      "block",
      "whitespace-nowrap",
      "text-ellipsis",
    );
  });

  it("underline / strikethrough / cả hai", () => {
    render(
      <>
        <Text underline>gạch chân</Text>
        <Text strikethrough>gạch ngang</Text>
        <Text underline strikethrough>
          cả hai
        </Text>
        <Text font="monospace">mono</Text>
      </>,
    );
    expect(screen.getByText("gạch chân")).toHaveClass("underline");
    expect(screen.getByText("gạch ngang")).toHaveClass("line-through");
    expect(screen.getByText("cả hai")).toHaveClass("[text-decoration-line:underline_line-through]");
    expect(screen.getByText("mono")).toHaveClass("font-mono");
  });

  it("preset: cỡ + độ đậm cố định, có displayName, nhận ref", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <>
        <Display>Lớn nhất</Display>
        <Title1 as="h1" ref={ref}>
          Trang
        </Title1>
        <Body1Strong>Đậm</Body1Strong>
        <Caption2>Nhỏ</Caption2>
      </>,
    );
    expect(screen.getByText("Lớn nhất")).toHaveClass("text-display", "font-semibold");
    expect(ref.current).toBe(screen.getByRole("heading", { level: 1 }));
    expect(ref.current).toHaveClass("text-title1");
    expect(screen.getByText("Đậm")).toHaveClass("text-body1", "font-semibold");
    expect(screen.getByText("Nhỏ")).toHaveClass("text-caption2", "font-normal");
    expect(Title1.displayName).toBe("Title1");
  });
});
