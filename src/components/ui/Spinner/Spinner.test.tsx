import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Spinner, spinnerMessagesVi } from "./Spinner";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("Spinner", () => {
  it("role progressbar; svg aria-hidden; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Spinner ref={ref} className="m-2" />);
    const spinner = screen.getByRole("progressbar", { name: "Đang tải" });
    expect(ref.current).toBe(spinner);
    expect(spinner).toHaveClass("m-2");
    expect(spinner.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(spinner.querySelector("svg")).toHaveClass("size-8", "animate-spin");
  });

  it("label hiển thị đặt tên qua aria-labelledby; labelPosition", () => {
    const { rerender } = render(<Spinner label="Đang đồng bộ" />);
    const spinner = screen.getByRole("progressbar", { name: "Đang đồng bộ" });
    expect(spinner).not.toHaveAttribute("aria-label");
    expect(spinner.lastElementChild).toHaveTextContent("Đang đồng bộ");
    rerender(<Spinner label="Đang đồng bộ" labelPosition="above" />);
    expect(screen.getByRole("progressbar")).toHaveClass("flex-col");
    expect(screen.getByRole("progressbar").firstElementChild).toHaveTextContent("Đang đồng bộ");
    rerender(<Spinner label="Đang đồng bộ" labelPosition="before" />);
    expect(screen.getByRole("progressbar")).not.toHaveClass("flex-col");
    expect(screen.getByRole("progressbar").firstElementChild).toHaveTextContent("Đang đồng bộ");
  });

  it("size / appearance inverted", () => {
    render(<Spinner size="huge" appearance="inverted" label="Chờ" />);
    const spinner = screen.getByRole("progressbar");
    expect(spinner.querySelector("svg")).toHaveClass("size-11");
    expect(spinner.querySelector("svg")).toHaveAttribute("viewBox", "0 0 44 44");
    expect(spinner.querySelectorAll("circle")[1]).toHaveClass("stroke-foreground-on-brand");
    expect(screen.getByText("Chờ")).toHaveClass("text-foreground-on-brand", "text-subtitle1");
  });

  it("nhãn mặc định: tiếng Anh, tiếng Việt qua spinnerMessagesVi", () => {
    const { unmount } = renderBare(<Spinner size="tiny" />);
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ spinner: spinnerMessagesVi }}>
        <Spinner />
      </YugenProvider>,
    );
    expect(screen.getByRole("progressbar", { name: "Đang tải" })).toBeInTheDocument();
  });
});
