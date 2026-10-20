import { describe, expect, it } from "vitest";
import { generateBrandRamp, RAMP_STEPS } from "./brandRamp";
import { BRAND_ALIAS_STEPS, rampToDesignTokens, rampToTokensStudio } from "./tokenExport";

const ramp = generateBrandRamp("#c2347a");

describe("rampToDesignTokens", () => {
  it("xuất đủ 16 bậc theo DTCG", () => {
    const tokens = rampToDesignTokens("sakura", ramp);
    const steps = Object.keys(tokens.brand.sakura);
    expect(steps).toEqual(RAMP_STEPS.map(String));
    expect(tokens.brand.sakura["80"]).toEqual({ $type: "color", $value: ramp[7].toLowerCase() });
  });

  it("alias light/dark tham chiếu đúng bậc ramp", () => {
    const tokens = rampToDesignTokens("sakura", ramp);
    expect(tokens.light.colorBrandBackground.$value).toBe("{brand.sakura.80}");
    expect(tokens.dark.colorBrandBackground.$value).toBe("{brand.sakura.70}");
    expect(Object.keys(tokens.light)).toEqual(Object.keys(BRAND_ALIAS_STEPS));
  });

  it("từ chối ramp sai số bậc", () => {
    expect(() => rampToDesignTokens("x", ramp.slice(0, 10))).toThrow();
  });
});

describe("rampToTokensStudio", () => {
  it("dùng value/type và thứ tự bộ token", () => {
    const tokens = rampToTokensStudio("sakura", ramp);
    expect(tokens.global.brand.sakura["160"]).toEqual({ value: ramp[15].toLowerCase(), type: "color" });
    expect(tokens.dark.colorBrandBackground2.value).toBe("{brand.sakura.20}");
    expect(tokens.$metadata.tokenSetOrder).toEqual(["global", "light", "dark"]);
  });
});
