import { describe, expect, it } from "vitest";
import { generateBrandRamp } from "@/lib/brandRamp";
import {
  DEFAULT_AXES,
  axesToCss,
  axesToParams,
  GLASS,
  glassChecks,
  neutralChecks,
  paramsToAxes,
  sanitizeFontName,
  sharedVars,
  smallestTarget,
  themeVars,
  type ThemeAxes,
} from "./themeAxes";

const SAKURA = "#C2347A";
const axes = (patch: Partial<ThemeAxes>): ThemeAxes => ({ ...DEFAULT_AXES, ...patch });

describe("Theme Designer — các trục ngoài màu brand", () => {
  it("mặc định không sinh biến nào", () => {
    expect(sharedVars(DEFAULT_AXES)).toEqual({});
    expect(themeVars(DEFAULT_AXES, "light", SAKURA)).toEqual({});
    expect(themeVars(DEFAULT_AXES, "dark", SAKURA)).toEqual({});
  });

  it("bo góc: cả ramp nhân cùng hệ số, circular giữ nguyên", () => {
    const large = sharedVars(axes({ radius: "large" }));
    expect(large["--borderRadiusMedium"]).toBe("6px");
    expect(large["--borderRadiusXLarge"]).toBe("12px");
    expect(large["--borderRadiusCircular"]).toBeUndefined();
    expect(sharedVars(axes({ radius: "none" }))["--borderRadius4XLarge"]).toBe("0px");
  });

  it("mật độ: một hệ số cho --spacing và token spacing; báo target nhỏ nhất", () => {
    const comfy = sharedVars(axes({ density: "comfortable" }));
    expect(comfy["--spacing"]).toBe("0.2813rem");
    expect(comfy["--spacingM"]).toBe("13.5px");
    expect(smallestTarget("compact")).toBe(22.5);
    expect(smallestTarget("default")).toBe(24);
  });

  it("cỡ chữ gốc 16: cả ramp theo tỉ lệ, line height làm tròn số chẵn", () => {
    const vars = sharedVars(axes({ baseSize: 16 }));
    expect(vars["--fontSizeBase300"]).toBe("16px");
    expect(vars["--fontSizeBase200"]).toBe("13.5px");
    expect(vars["--lineHeightBase300"]).toBe("22px");
    expect(Number.parseFloat(vars["--lineHeightHero1000"]) % 2).toBe(0);
  });

  it("font: stack luôn có fallback hệ thống; tên tự nhập không thoát được khỏi khai báo", () => {
    expect(sharedVars(axes({ font: "inter" }))["--fontFamilyBase"]).toMatch(/^"Inter", system-ui/);
    expect(sanitizeFontName('Evil"; } body { color: red')).toBe("Evil  body  color red");
    expect(sharedVars(axes({ font: "custom", customFont: "" }))["--fontFamilyBase"]).toBeUndefined();
  });

  it("chuyển động: nhân hệ số, không vượt 500ms", () => {
    const vars = sharedVars(axes({ motion: "expressive" }));
    expect(vars["--durationNormal"]).toBe("250ms");
    expect(vars["--durationUltraSlow"]).toBe("500ms");
    expect(sharedVars(axes({ motion: "reduced" }))["--durationGentle"]).toBe("188ms");
  });

  it("độ nổi flat: bỏ bóng 2–8, giữ một nửa cho 16–64; dark dùng giá trị của dark", () => {
    const light = themeVars(axes({ elevation: "flat" }), "light", SAKURA);
    expect(light["--shadow4"]).toBe("none");
    expect(light["--shadow16"]).toBe("0 0 2px rgb(0 0 0 / 0.06), 0 8px 16px rgb(0 0 0 / 0.07)");
    expect(themeVars(axes({ elevation: "flat" }), "dark", SAKURA)["--shadow16"]).toBe("0 0 2px rgb(0 0 0 / 0.12), 0 8px 16px rgb(0 0 0 / 0.14)");
  });

  it("màu trung tính pha sắc vẫn đạt 4.5:1 cho các cặp chữ / nền chính ở light và dark", () => {
    for (const neutrals of ["warm", "cool", "brand"] as const) {
      const checks = neutralChecks(axes({ neutrals }), SAKURA);
      expect(checks.length).toBeGreaterThanOrEqual(8);
      for (const check of checks) expect(check.ratio, `${neutrals} ${check.theme} ${check.pair}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(themeVars(axes({ neutrals: "warm" }), "light", SAKURA)["--grey-14"]).not.toBe("#242424");
  });

  it("CSS xuất: khối chung + light + dark, không đụng high contrast", () => {
    const css = axesToCss('[data-brand="acme"]', axes({ radius: "large", neutrals: "cool", font: "inter" }), SAKURA, { "--brand-80": "#c2347a" });
    expect(css).toContain('[data-brand="acme"] {\n  --brand-80: #c2347a;\n  --borderRadiusSmall: 3px;');
    expect(css).toContain('[data-brand="acme"][data-theme="light"]');
    expect(css).toContain('[data-brand="acme"][data-theme="dark"]');
    expect(css).not.toContain("high-contrast");
    expect(css).toMatch(/^\/\* Font "Inter"/);
  });

  it("URL: chỉ ghi trục khác mặc định, đọc lại đúng, bỏ qua giá trị lạ", () => {
    const value = axes({ radius: "full", baseSize: 16, font: "custom", customFont: "Atkinson Hyperlegible" });
    const params = axesToParams(value);
    expect([...params.keys()]).toEqual(["td-radius", "td-font", "td-font-name", "td-size"]);
    expect(paramsToAxes(params)).toEqual(value);
    expect(paramsToAxes(new URLSearchParams("td-radius=huge&td-size=99&td-font=comic"))).toEqual(DEFAULT_AXES);
  });

  it("glass: mỗi bậc giữ fg1 / fg2 ≥ 4.5:1 trên nền đen và trắng; pha brand qua biến ramp; mặc định không sinh biến", () => {
    const ramp = generateBrandRamp(SAKURA);
    for (const glass of Object.keys(GLASS) as (keyof typeof GLASS)[]) {
      const checks = glassChecks(axes({ glass }), SAKURA, ramp);
      expect(checks).toHaveLength(8);
      for (const check of checks) expect(check.ratio, `${glass} ${check.theme} ${check.pair}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(sharedVars(axes({ glass: "frosted" }))).toMatchObject({ "--glassBlur": "36px", "--glassSaturation": "150%" });
    expect(themeVars(axes({ glass: "airy" }), "dark", SAKURA)["--colorGlassBackground"]).toBe("rgb(41 41 41 / 0.78)");
    expect(themeVars(axes({ glassTint: "brand" }), "light", SAKURA)["--colorGlassBackground"]).toBe("rgb(from var(--brand-160) r g b / 0.8)");
    expect(themeVars(DEFAULT_AXES, "light", SAKURA)["--colorGlassBackground"]).toBeUndefined();
    expect(paramsToAxes(axesToParams(axes({ glass: "airy", glassTint: "brand" })))).toEqual(axes({ glass: "airy", glassTint: "brand" }));
  });
});
