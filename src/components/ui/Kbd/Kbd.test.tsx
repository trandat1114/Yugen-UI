import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "./Kbd";

describe("Kbd", () => {
  it("thẻ kbd; ref + className; size small", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <>
        <Kbd ref={ref} className="ms-1">
          Esc
        </Kbd>
        <Kbd size="small">K</Kbd>
      </>,
    );
    const esc = screen.getByText("Esc");
    expect(esc.tagName).toBe("KBD");
    expect(ref.current).toBe(esc);
    expect(esc).toHaveClass("h-5", "font-mono", "ms-1");
    expect(screen.getByText("K")).toHaveClass("h-4", "text-caption2");
  });

  it("KbdGroup: kbd lồng chứa tổ hợp phím", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <KbdGroup ref={ref} data-testid="group">
        <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
      </KbdGroup>,
    );
    const group = screen.getByTestId("group");
    expect(ref.current).toBe(group);
    expect(group.tagName).toBe("KBD");
    expect(group).toHaveTextContent("Ctrl+K");
    expect(group.querySelectorAll("kbd")).toHaveLength(2);
  });
});
