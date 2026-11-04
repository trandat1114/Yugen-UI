import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button/Button";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { ButtonGroup, ButtonGroupSeparator } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("role group, mặc định ngang; ref tới phần tử; className gộp", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ButtonGroup ref={ref} aria-label="Căn lề" className="shadow-4">
        <Button>Trái</Button>
        <Button>Giữa</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Căn lề" });
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass("flex-row", "shadow-4", "inline-flex");
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("orientation=\"vertical\" xếp dọc", () => {
    render(<ButtonGroup orientation="vertical" aria-label="Dọc" />);
    const group = screen.getByRole("group", { name: "Dọc" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveClass("flex-col");
    expect(group).not.toHaveClass("flex-row");
  });

  it("đọc orientation mặc định từ YugenProvider defaults", () => {
    render(
      <YugenProvider defaults={{ ButtonGroup: { orientation: "vertical" } }}>
        <ButtonGroup aria-label="Nhóm" />
      </YugenProvider>,
    );
    expect(screen.getByRole("group", { name: "Nhóm" })).toHaveAttribute("data-orientation", "vertical");
  });
});

describe("ButtonGroupSeparator", () => {
  it("separator dọc mặc định; ngang và on-brand đổi lớp", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <>
        <ButtonGroupSeparator ref={ref} data-testid="v" />
        <ButtonGroupSeparator data-testid="h" orientation="horizontal" appearance="on-brand" className="mx-1" />
      </>,
    );
    const v = screen.getByTestId("v");
    expect(ref.current).toBe(v);
    expect(v).toHaveAttribute("role", "separator");
    expect(v).toHaveAttribute("aria-orientation", "vertical");
    expect(v).toHaveClass("w-px", "bg-stroke-2");
    const h = screen.getByTestId("h");
    expect(h).toHaveAttribute("aria-orientation", "horizontal");
    expect(h).toHaveClass("h-px", "bg-stroke-on-brand/40", "mx-1");
  });
});
