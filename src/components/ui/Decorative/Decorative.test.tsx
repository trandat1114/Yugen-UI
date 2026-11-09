import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BloomArt, GradientText, WavyUnderline } from "./Decorative";

describe("Decorative", () => {
  it("GradientText: chữ vẫn đọc được, class gradient theo tên (mặc định sakura)", () => {
    render(
      <h1>
        <GradientText>Yugen</GradientText> <GradientText gradient="aurora" className="italic">UI</GradientText>
      </h1>,
    );
    expect(screen.getByRole("heading", { name: "Yugen UI" })).toBeInTheDocument();
    expect(screen.getByText("Yugen")).toHaveClass("text-gradient-sakura");
    expect(screen.getByText("UI")).toHaveClass("text-gradient-aurora", "italic");
  });

  it("WavyUnderline: svg aria-hidden, gradient dùng id riêng mỗi lần dùng; animated / thickness", () => {
    const { container } = render(
      <>
        <WavyUnderline />
        <WavyUnderline gradient="brand" animated={false} thickness={3} className="h-3" />
      </>,
    );
    const [first, second] = Array.from(container.querySelectorAll("svg"));
    expect(first).toHaveAttribute("aria-hidden", "true");
    const gradientId = (svg: SVGSVGElement) => svg.querySelector("linearGradient")!.id;
    expect(gradientId(first)).not.toBe(gradientId(second));
    expect(first.querySelector("path")).toHaveAttribute("stroke", `url(#${gradientId(first)})`);
    expect(first.querySelector("g")?.getAttribute("class")).toContain("animate-wave-flow");
    expect(second.querySelector("g")).not.toHaveAttribute("class");
    expect(second.querySelector("path")).toHaveAttribute("stroke-width", "3");
    expect(second).toHaveClass("h-3");
    expect(second.querySelector("stop")?.getAttribute("style")).toContain("var(--brand-50)");
  });

  it("BloomArt: minh hoạ aria-hidden, 8 cánh hoa, màu theo ramp brand", () => {
    const { container } = render(<BloomArt className="rounded-xlarge" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("rounded-xlarge");
    expect(svg.querySelectorAll("g[transform^='rotate']")).toHaveLength(8);
    expect(svg.innerHTML).toContain("var(--brand-60)");
  });
});
