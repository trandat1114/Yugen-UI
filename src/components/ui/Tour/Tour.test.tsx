import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tour, useTour, type TourStep } from "./Tour";

const STEPS: TourStep[] = [
  { target: "#t-search", title: "Tìm kiếm", content: "Gõ để tìm mọi thứ." },
  { target: "#t-new", title: "Tạo mới", content: "Tạo tài liệu mới.", placement: "end" },
  { title: "Xong rồi", content: "Bạn đã sẵn sàng." },
];

function App({ onFinish, onOpenChange }: { onFinish?: () => void; onOpenChange?: (open: boolean) => void }) {
  return (
    <Tour steps={STEPS} onFinish={onFinish} onOpenChange={onOpenChange}>
      <Starter />
      <input id="t-search" aria-label="Tìm" />
      <button id="t-new" type="button">
        Mới
      </button>
    </Tour>
  );
}

function Starter() {
  const tour = useTour();
  return (
    <button type="button" onClick={() => tour.start()}>
      Bắt đầu hướng dẫn
    </button>
  );
}

describe("Tour", () => {
  it("điều hướng Tiếp / Quay lại với bộ đếm, Hoàn tất gọi onFinish và trả focus", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<App onFinish={onFinish} />);
    const start = screen.getByRole("button", { name: "Bắt đầu hướng dẫn" });
    await user.click(start);

    const dialog = await screen.findByRole("dialog", { name: "Tìm kiếm" });
    expect(dialog).toHaveTextContent("1 / 3");
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(screen.queryByRole("button", { name: "Quay lại" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Tiếp" }));
    expect(await screen.findByRole("dialog", { name: "Tạo mới" })).toHaveTextContent("2 / 3");
    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(await screen.findByRole("dialog", { name: "Tìm kiếm" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tiếp" }));
    await user.click(screen.getByRole("button", { name: "Tiếp" }));
    expect(screen.queryByRole("button", { name: "Bỏ qua" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Hoàn tất" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(start).toHaveFocus();
  });

  it("Esc đóng tour (không gọi onFinish) và trả focus về nút đã mở", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    render(<App onFinish={onFinish} onOpenChange={onOpenChange} />);
    const start = screen.getByRole("button", { name: "Bắt đầu hướng dẫn" });
    await user.click(start);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(document.querySelector("[data-yugen-tour-overlay]")).not.toBeNull();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onFinish).not.toHaveBeenCalled();
    expect(document.querySelector("[data-yugen-tour-overlay]")).toBeNull();
    expect(start).toHaveFocus();
  });

  it("Bỏ qua đóng tour", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Bắt đầu hướng dẫn" }));
    await user.click(await screen.findByRole("button", { name: "Bỏ qua" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
