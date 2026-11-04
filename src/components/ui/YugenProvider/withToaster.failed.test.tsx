import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { YugenProvider } from "./YugenProvider";

// Chunk của Toaster không tải được (mất mạng, tab mở từ trước một lần deploy): import() bị từ chối.
vi.mock("../Toast/Toast", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("YugenProvider withToaster: chunk của Toaster lỗi (#346)", () => {
  it("chỉ thiếu Toaster, cây con dưới provider vẫn render", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(
        <YugenProvider withToaster>
          <p>Nội dung</p>
        </YugenProvider>,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      expect(screen.getByText("Nội dung")).toBeInTheDocument();
      expect(screen.queryByRole("region")).toBeNull();
      expect(error).toHaveBeenCalledWith(expect.stringContaining("Toaster could not be loaded"), expect.any(Error));
    } finally {
      error.mockRestore();
    }
  });
});
