import { afterEach, describe, expect, it, vi } from "vitest";
import { resetDeprecationWarnings, warnDeprecated } from "./deprecate";

describe("warnDeprecated", () => {
  afterEach(() => {
    resetDeprecationWarnings();
    vi.restoreAllMocks();
  });

  it("cảnh báo một lần cho mỗi id, kèm phiên bản xoá", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnDeprecated("Button.appearance.transparent", 'dùng appearance="subtle"', "1.0.0");
    warnDeprecated("Button.appearance.transparent", 'dùng appearance="subtle"', "1.0.0");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("v1.0.0");
    expect(warn.mock.calls[0][0]).toContain('dùng appearance="subtle"');
  });

  it("im lặng ở production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    warnDeprecated("Old.prop", "dùng New.prop");
    vi.unstubAllEnvs();
    expect(warn).not.toHaveBeenCalled();
  });
});
