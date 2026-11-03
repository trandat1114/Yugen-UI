import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, type AccordionProps } from "./Accordion";

function Demo(props: Partial<AccordionProps> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Accordion type="single" collapsible {...(props as object)}>
      <AccordionItem value="a">
        <AccordionHeader>Giao hàng</AccordionHeader>
        <AccordionPanel>Từ 2–3 ngày</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionHeader description="Trong 30 ngày">Đổi trả</AccordionHeader>
        <AccordionPanel>Miễn phí</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="c" disabled>
        <AccordionHeader icon={<svg data-testid="icon" />}>Bảo hành</AccordionHeader>
        <AccordionPanel>12 tháng</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const header = (name: string | RegExp) => screen.getByRole("button", { name });

describe("Accordion", () => {
  it("header là nút có aria-expanded; panel luôn mount, mở thì header nối với panel", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const giao = header("Giao hàng");
    expect(giao).toHaveAttribute("aria-expanded", "false");
    const panel = screen.getByText("Từ 2–3 ngày").closest("[data-state]")!;
    expect(panel).toHaveAttribute("data-state", "closed");
    expect(panel).toHaveClass("data-[state=closed]:invisible");
    await user.click(giao);
    expect(giao).toHaveAttribute("aria-controls", panel.id);
    expect(screen.getByRole("region", { name: "Giao hàng" })).toBe(panel);
    // Dòng mô tả nằm trong nút → thuộc tên truy cập (WCAG 2.5.3).
    expect(header(/^Đổi trả/)).toHaveTextContent("Đổi trảTrong 30 ngày");
    expect(screen.getByText("Trong 30 ngày")).toHaveClass("text-caption1");
    expect(header("Bảo hành")).toBeDisabled();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("single + collapsible: bấm mở, mở mục khác thì đóng mục cũ, bấm lại thì đóng", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await user.click(header("Giao hàng"));
    expect(header("Giao hàng")).toHaveAttribute("aria-expanded", "true");
    await user.click(header(/^Đổi trả/));
    expect(header("Giao hàng")).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    await user.click(header(/^Đổi trả/));
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("bàn phím: ↓/↑ đi giữa các header (bỏ qua disabled), Home/End, Space mở", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(header("Giao hàng")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(header(/^Đổi trả/)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(header("Giao hàng")).toHaveFocus();
    await user.keyboard("{End}");
    expect(header(/^Đổi trả/)).toHaveFocus();
    await user.keyboard(" ");
    expect(header(/^Đổi trả/)).toHaveAttribute("aria-expanded", "true");
  });

  it("multiple + defaultValue mở nhiều mục cùng lúc", () => {
    render(
      <Accordion type="multiple" defaultValue={["a", "b"]}>
        <AccordionItem value="a">
          <AccordionHeader>A</AccordionHeader>
          <AccordionPanel>1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionHeader>B</AccordionHeader>
          <AccordionPanel>2</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    expect(header("A")).toHaveAttribute("aria-expanded", "true");
    expect(header("B")).toHaveAttribute("aria-expanded", "true");
  });

  it("appearance / size / expandIconPosition; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Demo ref={ref} appearance="outline" size="small" expandIconPosition="end" className="w-96" />);
    expect(ref.current).toHaveAttribute("data-appearance", "outline");
    expect(ref.current).toHaveClass("rounded-xlarge", "divide-y", "w-96");
    const giao = header("Giao hàng");
    expect(giao).toHaveClass("min-h-8", "rounded-none");
    // Chevron ở cuối.
    expect(giao.lastElementChild?.tagName.toLowerCase()).toBe("svg");
  });

  it("separated: mỗi mục là một thẻ", () => {
    const { container } = render(<Demo appearance="separated" size="extra-large" />);
    expect(container.querySelector('[data-appearance="separated"]')?.firstElementChild).toHaveClass("rounded-xlarge", "shadow-2");
    expect(header("Giao hàng")).toHaveClass("text-subtitle1", "rounded-xlarge");
    expect(screen.getByText("Từ 2–3 ngày")).toHaveClass("px-4", "pb-4");
  });

  it("Accordion lồng: data-level tăng, kế thừa cỡ + vị trí chevron, có đường dẫn dọc", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible size="large" expandIconPosition="end" defaultValue="a">
        <AccordionItem value="a">
          <AccordionHeader>Cha</AccordionHeader>
          <AccordionPanel>
            <Accordion type="single" collapsible data-testid="child">
              <AccordionItem value="x">
                <AccordionHeader>Con</AccordionHeader>
                <AccordionPanel>Nội dung con</AccordionPanel>
              </AccordionItem>
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    const child = screen.getByTestId("child");
    expect(child).toHaveAttribute("data-level", "2");
    expect(child).toHaveClass("border-s", "ps-1");
    expect(header("Con")).toHaveClass("text-body2");
    expect(header("Con").lastElementChild?.tagName.toLowerCase()).toBe("svg");
    await user.click(header("Con"));
    expect(header("Con")).toHaveAttribute("aria-expanded", "true");
  });
});
