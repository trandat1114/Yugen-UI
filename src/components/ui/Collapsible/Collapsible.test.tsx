import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

function Demo(props: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Chi tiết</CollapsibleTrigger>
      <CollapsibleContent className="p-2" data-testid="content">
        <a href="#x">Liên kết bên trong</a>
      </CollapsibleContent>
    </Collapsible>
  );
}

const trigger = () => screen.getByRole("button", { name: "Chi tiết" });

describe("Collapsible", () => {
  it("nội dung luôn mount; đóng thì invisible; mở thì trigger nối với nội dung qua aria-controls", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const content = screen.getByTestId("content");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("data-state", "closed");
    expect(content).toHaveClass("data-[state=closed]:invisible", "grid");
    // className áp cho khối bên trong.
    expect(screen.getByText("Liên kết bên trong").parentElement).toHaveClass("p-2");
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-controls", content.id);
  });

  it("bấm / Enter mở và đóng; onOpenChange báo trạng thái", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Enter}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("controlled open / defaultOpen; ref tới nội dung", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Chi tiết</CollapsibleTrigger>
        <CollapsibleContent ref={ref}>Nội dung</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toHaveAttribute("data-state", "closed");
    rerender(
      <Collapsible open>
        <CollapsibleTrigger>Chi tiết</CollapsibleTrigger>
        <CollapsibleContent ref={ref}>Nội dung</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toHaveAttribute("data-state", "open");
  });
});
