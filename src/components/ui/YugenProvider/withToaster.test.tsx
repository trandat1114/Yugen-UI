import { afterEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { YugenProvider } from "./YugenProvider";
import { dismissAllToasts, toast } from "../Toast/toastStore";

// File riêng: Toaster lười của YugenProvider chỉ "chưa nạp" ở lần render đầu tiên trong một module graph.
describe("YugenProvider withToaster (#346)", () => {
  afterEach(() => {
    act(() => dismissAllToasts());
  });

  it("Toaster nạp lúc cần; toast() gọi trước và trong lúc nạp vẫn hiện khi Toaster mount", async () => {
    toast({ toastId: "before", title: "Gọi trước khi render" });
    render(
      <YugenProvider withToaster>
        <p>Nội dung</p>
      </YugenProvider>,
    );
    // Chunk của Toaster chưa nạp xong: chưa có vùng thông báo, nội dung vẫn render.
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
    expect(screen.queryByRole("region")).toBeNull();
    act(() => {
      toast({ toastId: "during", intent: "success", title: "Gọi khi đang nạp" });
    });
    expect(await screen.findByText("Gọi trước khi render")).toBeInTheDocument();
    expect(screen.getByText("Gọi khi đang nạp")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /F8/ })).toBeInTheDocument();
  });

  it("không bật withToaster thì không có Toaster", async () => {
    render(<YugenProvider />);
    act(() => {
      toast({ toastId: "nowhere", title: "Không có nơi hiện" });
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(screen.queryByText("Không có nơi hiện")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });
});
