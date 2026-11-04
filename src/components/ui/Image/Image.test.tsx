import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio, Image, imageVariants } from "./Image";

describe("Image", () => {
  it("img có alt; ref + className; mặc định inline-block, góc vuông", () => {
    const ref = { current: null as HTMLImageElement | null };
    render(<Image ref={ref} src="/a.png" alt="Phong cảnh" className="max-w-60" />);
    const img = screen.getByRole("img", { name: "Phong cảnh" });
    expect(ref.current).toBe(img);
    expect(img).toHaveAttribute("src", "/a.png");
    expect(img).toHaveClass("inline-block", "rounded-none", "max-w-60");
    expect(img).not.toHaveClass("border");
  });

  it("fit / shape / bordered / shadow / block", () => {
    render(<Image src="/a.png" alt="" fit="cover" shape="circular" bordered shadow block data-testid="img" />);
    expect(screen.getByTestId("img")).toHaveClass("object-cover", "rounded-circular", "border", "shadow-4", "block", "w-full");
  });

  it("fit none neo theo hướng chữ", () => {
    expect(imageVariants({ fit: "none" })).toContain("rtl:object-top-right");
  });
});

describe("AspectRatio", () => {
  it("đặt aspect-ratio (mặc định 1), gộp style và className; ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { rerender } = render(<AspectRatio ref={ref} data-testid="box" />);
    expect(ref.current).toBe(screen.getByTestId("box"));
    expect(Number.parseFloat(screen.getByTestId("box").style.aspectRatio)).toBe(1);
    rerender(<AspectRatio ratio={16 / 9} style={{ maxWidth: 320 }} className="rounded-large" data-testid="box" />);
    const box = screen.getByTestId("box");
    expect(Number.parseFloat(box.style.aspectRatio)).toBeCloseTo(16 / 9);
    expect(box.style.maxWidth).toBe("320px");
    expect(box).toHaveClass("rounded-large", "overflow-hidden");
  });
});
