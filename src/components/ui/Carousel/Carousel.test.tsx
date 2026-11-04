import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { watchDeprecations } from "@/test/deprecation";
import { Carousel, CarouselCard, CarouselNavContainer, CarouselViewport, type CarouselProps } from "./Carousel";

const SLIDES = ["Một", "Hai", "Ba"];

function Demo({ navProps, ...props }: CarouselProps & { navProps?: ComponentProps<typeof CarouselNavContainer> }) {
  return (
    <Carousel aria-label="Ảnh" {...props}>
      <CarouselViewport data-testid="viewport">
        {SLIDES.map((s) => (
          <CarouselCard key={s}>{s}</CarouselCard>
        ))}
      </CarouselViewport>
      <CarouselNavContainer {...navProps} />
    </Carousel>
  );
}

const selected = () => screen.getAllByRole("tab").findIndex((tab) => tab.getAttribute("aria-selected") === "true");
const previous = () => screen.getByRole("button", { name: "Slide trước" });
const next = () => screen.getByRole("button", { name: "Slide tiếp theo" });

describe("Carousel gap", () => {
  it("tên đầy đủ; mặc định small", () => {
    const { rerender } = render(<Demo />);
    expect(screen.getByTestId("viewport")).toHaveClass("gap-2");
    rerender(<Demo gap="medium" />);
    expect(screen.getByTestId("viewport")).toHaveClass("gap-3");
  });

  it("tên ngắn cũ vẫn chạy và cảnh báo một lần cho mỗi giá trị", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo gap="M" />);
    rerender(<Demo gap="M" />);
    expect(screen.getByTestId("viewport")).toHaveClass("gap-3");
    expect(warnings('Carousel.gap="M"')).toBe(1);
    rerender(<Demo gap="XL" />);
    expect(screen.getByTestId("viewport")).toHaveClass("gap-5");
    expect(warnings('Carousel.gap="XL"')).toBe(1);
  });
});

describe("Carousel loop", () => {
  it("loop: nút trước không bị khoá ở slide đầu", () => {
    render(<Demo loop />);
    expect(previous()).toBeEnabled();
  });

  it("circular (tên cũ) vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo circular />);
    rerender(<Demo circular />);
    expect(previous()).toBeEnabled();
    expect(warnings("Carousel.circular")).toBe(1);
  });

  it("loop thắng khi truyền cả hai", () => {
    watchDeprecations();
    render(<Demo loop={false} circular />);
    expect(previous()).toBeDisabled();
  });
});

describe("CarouselNavContainer previousLabel", () => {
  it("đặt aria-label nút trước", () => {
    render(<Demo navProps={{ previousLabel: "Lùi" }} />);
    expect(screen.getByRole("button", { name: "Lùi" })).toBeInTheDocument();
  });

  it("prevLabel (tên cũ) vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo navProps={{ prevLabel: "Lùi" }} />);
    rerender(<Demo navProps={{ prevLabel: "Lùi" }} />);
    expect(screen.getByRole("button", { name: "Lùi" })).toBeInTheDocument();
    expect(warnings("CarouselNavContainer.prevLabel")).toBe(1);
  });

  it("previousLabel thắng khi truyền cả hai", () => {
    watchDeprecations();
    render(<Demo navProps={{ previousLabel: "Mới", prevLabel: "Cũ" }} />);
    expect(screen.getByRole("button", { name: "Mới" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cũ" })).not.toBeInTheDocument();
  });
});

describe("CarouselNavContainer showAutoplayToggle", () => {
  const toggle = () => screen.queryByRole("button", { name: "Tự động chạy" });

  it("showAutoplayToggle hiện nút bật / tắt tự chạy", () => {
    const { rerender } = render(<Demo />);
    expect(toggle()).toBeNull();
    rerender(<Demo navProps={{ showAutoplayToggle: true }} />);
    expect(toggle()).toBeInTheDocument();
  });

  it("autoplay (tên cũ) vẫn chạy và cảnh báo một lần; tên mới thắng", () => {
    const warnings = watchDeprecations();
    const { rerender } = render(<Demo navProps={{ autoplay: true }} />);
    rerender(<Demo navProps={{ autoplay: true }} />);
    expect(toggle()).toBeInTheDocument();
    expect(warnings("CarouselNavContainer.autoplay")).toBe(1);
    rerender(<Demo navProps={{ autoplay: true, showAutoplayToggle: false }} />);
    expect(toggle()).toBeNull();
  });
});

describe("Carousel activeIndex", () => {
  it("defaultActiveIndex: bắt đầu ở slide đó, tự giữ state khi bấm", async () => {
    const user = userEvent.setup();
    const onActiveIndexChange = vi.fn();
    render(<Demo defaultActiveIndex={2} onActiveIndexChange={onActiveIndexChange} />);
    expect(selected()).toBe(2);
    expect(onActiveIndexChange).not.toHaveBeenCalled();
    await user.click(previous());
    expect(selected()).toBe(1);
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("controlled: hiển thị theo activeIndex, bấm chỉ gọi onActiveIndexChange", async () => {
    const user = userEvent.setup();
    const onActiveIndexChange = vi.fn();
    const { rerender } = render(<Demo activeIndex={1} onActiveIndexChange={onActiveIndexChange} />);
    expect(selected()).toBe(1);
    await user.click(next());
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    rerender(<Demo activeIndex={2} onActiveIndexChange={onActiveIndexChange} />);
    expect(selected()).toBe(2);
    expect(next()).toBeDisabled();
    // Đổi từ bên ngoài: không báo ngược lại.
    rerender(<Demo activeIndex={0} onActiveIndexChange={onActiveIndexChange} />);
    expect(selected()).toBe(0);
    expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
  });
});
