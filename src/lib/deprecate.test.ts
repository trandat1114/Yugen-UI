import { afterEach, describe, expect, it, vi } from "vitest";
import { resetDeprecationWarnings, warnDeprecated } from "./deprecate";

describe("warnDeprecated", () => {
  afterEach(() => {
    resetDeprecationWarnings();
    vi.restoreAllMocks();
  });

  it("warns once per id, in English, with the removal version and the versioning page", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnDeprecated("Button.appearance.transparent", 'use appearance="subtle"', "1.0.0");
    warnDeprecated("Button.appearance.transparent", 'use appearance="subtle"', "1.0.0");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toBe(
      '[yugen-ui] "Button.appearance.transparent" is deprecated and will be removed in v1.0.0: use appearance="subtle". ' +
        "See https://trandat1114.github.io/Yugen-UI/concepts/versioning",
    );
  });

  it("names the next major version when no version is given", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnDeprecated("Old.prop", "use New.prop");
    expect(warn.mock.calls[0][0]).toBe(
      '[yugen-ui] "Old.prop" is deprecated and will be removed in the next major version: use New.prop. ' +
        "See https://trandat1114.github.io/Yugen-UI/concepts/versioning",
    );
  });

  it("stays silent in production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    warnDeprecated("Old.prop", "use New.prop");
    vi.unstubAllEnvs();
    expect(warn).not.toHaveBeenCalled();
  });
});
