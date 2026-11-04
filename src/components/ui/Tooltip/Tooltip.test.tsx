import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { SimpleTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

/** Radix Tooltip cần Provider; delay 0 để mở ngay khi hover. */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}

describe("Tooltip", () => {
  it("focus bàn phím mở tooltip, trigger được mô tả bởi tooltip; Escape đóng", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>Lưu</TooltipTrigger>
        <TooltipContent className="max-w-40">Lưu thay đổi (Ctrl+S)</TooltipContent>
      </Tooltip>,
      { wrapper: Wrapper },
    );
    await user.tab();
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Lưu thay đổi (Ctrl+S)");
    expect(screen.getByRole("button", { name: "Lưu" })).toHaveAccessibleDescription("Lưu thay đổi (Ctrl+S)");
    // Bề mặt hiển thị (không phải bản ẩn cho trình đọc màn hình) nhận class.
    const surface = screen.getAllByText("Lưu thay đổi (Ctrl+S)").find((el) => el.className.includes("max-w-40"));
    expect(surface).toHaveClass("rounded-medium", "bg-background-1");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("SimpleTooltip: hover trigger mở tooltip", async () => {
    const user = userEvent.setup();
    render(<SimpleTooltip content="Xoá mục">{<button>Xoá</button>}</SimpleTooltip>, { wrapper: Wrapper });
    await user.hover(screen.getByRole("button", { name: "Xoá" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Xoá mục");
  });

  it("appearance inverted / material glass / không mũi tên", async () => {
    const { rerender } = render(
      <Tooltip open>
        <TooltipTrigger>i</TooltipTrigger>
        <TooltipContent appearance="inverted" data-testid="tip">
          Đảo màu
        </TooltipContent>
      </Tooltip>,
      { wrapper: Wrapper },
    );
    expect(await screen.findByTestId("tip")).toHaveClass("bg-background-inverted");
    expect(screen.getByTestId("tip").querySelector("svg")).toHaveClass("fill-background-inverted");
    rerender(
      <Tooltip open>
        <TooltipTrigger>i</TooltipTrigger>
        <TooltipContent material="glass" data-testid="tip">
          Kính
        </TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByTestId("tip")).toHaveClass("glass");
    expect(screen.getByTestId("tip").querySelector("svg")).toHaveClass("fill-(--glass-tint)");
    rerender(
      <Tooltip open>
        <TooltipTrigger>i</TooltipTrigger>
        <TooltipContent withArrow={false} data-testid="tip">
          Không mũi tên
        </TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByTestId("tip").querySelector("svg")).toBeNull();
  });

  it("ref tới bề mặt; dir + theme của provider lồng (YugenProvider có sẵn TooltipProvider)", async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <YugenProvider dir="rtl" theme="dark">
        <Tooltip open>
          <TooltipTrigger>i</TooltipTrigger>
          <TooltipContent ref={ref} data-testid="tip">
            Mẹo
          </TooltipContent>
        </Tooltip>
      </YugenProvider>,
    );
    const tip = await screen.findByTestId("tip");
    expect(ref.current).toBe(tip);
    expect(tip).toHaveAttribute("dir", "rtl");
    expect(tip).toHaveAttribute("data-theme", "dark");
  });
});
