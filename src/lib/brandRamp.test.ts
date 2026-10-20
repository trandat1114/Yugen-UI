import { describe, expect, it } from "vitest";
import {
  RAMP_STEPS,
  adjustKeyForContrast,
  contrastRatio,
  generateBrandRamp,
  hexToOklch,
  hueDistance,
  isHexColor,
  oklchToHex,
  rampToCss,
  rampToStyle,
  relativeLuminance,
} from "./brandRamp";

const SAKURA = "#C2347A";
const COMMUNICATION_BLUE = "#0f6cbd";

/** Khoảng cách lớn nhất giữa từng kênh RGB (0–255) của hai màu HEX. */
function channelDelta(a: string, b: string) {
  const ch = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [x, y] = [ch(a), ch(b)];
  return Math.max(...x.map((v, i) => Math.abs(v - y[i])));
}

describe("isHexColor", () => {
  it("chỉ nhận #RRGGBB (không phân biệt hoa thường)", () => {
    expect(isHexColor("#c2347a")).toBe(true);
    expect(isHexColor("#C2347A")).toBe(true);
    expect(isHexColor("#000000")).toBe(true);
  });

  it("từ chối dạng rút gọn, thiếu #, có alpha, ký tự lạ", () => {
    for (const value of ["#fff", "c2347a", "#c2347aff", "#c2347g", "", " #c2347a", "#c2347a ", "rgb(0,0,0)"]) {
      expect(isHexColor(value)).toBe(false);
    }
  });
});

describe("hexToOklch / oklchToHex", () => {
  it("trắng và đen nằm ở hai đầu lightness, chroma ~ 0", () => {
    const [lw, cw] = hexToOklch("#ffffff");
    const [lb, cb] = hexToOklch("#000000");
    expect(lw).toBeCloseTo(1, 3);
    expect(cw).toBeLessThan(1e-3);
    expect(lb).toBeCloseTo(0, 6);
    expect(cb).toBeLessThan(1e-6);
  });

  it("hue luôn trong [0, 360)", () => {
    for (const hex of ["#ff0000", "#00ff00", "#0000ff", SAKURA, "#7f7f7f"]) {
      const [, , h] = hexToOklch(hex);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it("round trip giữ nguyên màu (sai số làm tròn ≤ 1/255 mỗi kênh)", () => {
    for (const hex of ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", SAKURA, COMMUNICATION_BLUE, "#5b5fc7", "#123456"]) {
      const back = oklchToHex(hexToOklch(hex));
      expect(isHexColor(back)).toBe(true);
      expect(channelDelta(back, hex.toLowerCase())).toBeLessThanOrEqual(1);
    }
  });

  it("màu ngoài gamut sRGB được kéo chroma về trong gamut", () => {
    const hex = oklchToHex([0.7, 0.5, 145]);
    expect(isHexColor(hex)).toBe(true);
    // Đã giảm chroma: chroma kết quả nhỏ hơn yêu cầu.
    expect(hexToOklch(hex)[1]).toBeLessThan(0.5);
  });
});

describe("relativeLuminance / contrastRatio", () => {
  it("luminance của trắng = 1, đen = 0", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 10);
    expect(relativeLuminance("#000000")).toBe(0);
  });

  it("trắng / đen = 21:1 và không phụ thuộc thứ tự", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 10);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 10);
  });

  it("cùng một màu = 1:1", () => {
    expect(contrastRatio(SAKURA, SAKURA)).toBeCloseTo(1, 10);
  });

  it("Sakura Brand80 đạt ≥ 4.5:1 với chữ trắng (như Design.md ghi 5.16:1)", () => {
    const ratio = contrastRatio(SAKURA, "#ffffff");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeCloseTo(5.16, 1);
  });
});

describe("generateBrandRamp", () => {
  it("sinh 16 bậc HEX hợp lệ, key ở bậc 80", () => {
    const ramp = generateBrandRamp(SAKURA);
    expect(ramp).toHaveLength(16);
    expect(ramp).toHaveLength(RAMP_STEPS.length);
    ramp.forEach((hex) => expect(isHexColor(hex)).toBe(true));
    expect(ramp[RAMP_STEPS.indexOf(80)]).toBe(SAKURA.toLowerCase());
  });

  it("lightness tăng dần từ brand10 tới brand160", () => {
    const lightness = generateBrandRamp(SAKURA).map((hex) => hexToOklch(hex)[0]);
    for (let i = 1; i < lightness.length; i++) expect(lightness[i]).toBeGreaterThan(lightness[i - 1]);
  });

  it("giữ hue của key (sai lệch nhỏ khi không xoắn hue)", () => {
    const ramp = generateBrandRamp(COMMUNICATION_BLUE);
    // Bậc quá tối / quá nhạt có chroma thấp nên hue kém ổn định — kiểm tra vùng giữa.
    for (const hex of ramp.slice(4, 13)) expect(hueDistance(hex, COMMUNICATION_BLUE)).toBeLessThan(6);
  });

  it("key = Communication Blue → giữ đúng đường cong lightness của ramp tham chiếu Fluent", () => {
    const ramp = generateBrandRamp(COMMUNICATION_BLUE);
    const reference = { 0: "#061724", 3: "#0c3b5e", 11: "#77b7f7", 15: "#ebf3fc" } as const;
    for (const [index, hex] of Object.entries(reference)) {
      expect(hexToOklch(ramp[Number(index)])[0]).toBeCloseTo(hexToOklch(hex)[0], 2);
    }
  });

  it("vibrancy ≠ 1 thì cả bậc 80 cũng được tính lại, chroma tỉ lệ theo vibrancy", () => {
    const dull = generateBrandRamp(SAKURA, { vibrancy: 0.5 });
    expect(dull[7]).not.toBe(SAKURA.toLowerCase());
    expect(hexToOklch(dull[7])[1]).toBeLessThan(hexToOklch(SAKURA)[1]);
    const grey = generateBrandRamp(SAKURA, { vibrancy: 0 });
    grey.forEach((hex) => expect(hexToOklch(hex)[1]).toBeLessThan(0.01));
  });

  it("hueTorsion xoay hue hai đầu ramp theo hai phía ngược nhau", () => {
    const base = generateBrandRamp(COMMUNICATION_BLUE);
    const twisted = generateBrandRamp(COMMUNICATION_BLUE, { hueTorsion: 30 });
    expect(twisted[7]).toBe(base[7]);
    const dh = (a: string, b: string) => ((hexToOklch(a)[2] - hexToOklch(b)[2] + 540) % 360) - 180;
    expect(dh(twisted[3], base[3])).toBeLessThan(0);
    expect(dh(twisted[12], base[12])).toBeGreaterThan(0);
  });
});

describe("adjustKeyForContrast", () => {
  it("giữ nguyên màu đã đạt chuẩn", () => {
    expect(adjustKeyForContrast(SAKURA)).toBe(SAKURA);
  });

  it("làm tối màu sáng cho tới khi chữ trắng đạt ≥ 4.5:1, giữ hue", () => {
    for (const key of ["#ff8fc0", "#ffd700", "#3fbf7f", "#40c4ff"]) {
      expect(contrastRatio(key, "#ffffff")).toBeLessThan(4.5);
      const adjusted = adjustKeyForContrast(key);
      expect(contrastRatio(adjusted, "#ffffff")).toBeGreaterThanOrEqual(4.5);
      expect(hueDistance(adjusted, key)).toBeLessThan(15);
      expect(hexToOklch(adjusted)[0]).toBeLessThan(hexToOklch(key)[0]);
    }
  });

  it("nhận target tuỳ chỉnh (7:1 — AAA)", () => {
    const adjusted = adjustKeyForContrast(SAKURA, 7);
    expect(contrastRatio(adjusted, "#ffffff")).toBeGreaterThanOrEqual(7);
  });
});

describe("hueDistance", () => {
  it("đối xứng và nằm trong [0, 180]", () => {
    const pairs: [string, string][] = [
      ["#ff0000", "#00ff00"],
      ["#ff0000", "#0000ff"],
      [SAKURA, "#c50f1f"],
      ["#ff00ff", "#ff0000"],
    ];
    for (const [a, b] of pairs) {
      const d = hueDistance(a, b);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(180);
      expect(hueDistance(b, a)).toBeCloseTo(d, 10);
    }
  });

  it("cùng màu = 0; đi đường ngắn qua 0°/360°", () => {
    expect(hueDistance(SAKURA, SAKURA)).toBe(0);
    // Đỏ (~29°) và hồng tím (~328°): khoảng cách ngắn là ~61°, không phải ~299°.
    expect(hueDistance("#ff0000", "#ff00ff")).toBeLessThan(90);
  });

  it("Sakura lệch ≥ 25° so với đỏ danger (không nhầm nút xoá)", () => {
    expect(hueDistance(SAKURA, "#c50f1f")).toBeGreaterThanOrEqual(25);
  });
});

describe("rampToCss / rampToStyle", () => {
  const ramp = generateBrandRamp(SAKURA);

  it("rampToCss sinh block [data-brand] với 16 biến --brand-*", () => {
    const css = rampToCss("hoa", ramp);
    expect(css.startsWith('[data-brand="hoa"] {\n')).toBe(true);
    expect(css.endsWith("\n}")).toBe(true);
    const lines = css.split("\n").slice(1, -1);
    expect(lines).toHaveLength(16);
    expect(lines[0]).toBe(`  --brand-10: ${ramp[0]};`);
    expect(lines[7]).toBe(`  --brand-80: ${SAKURA.toLowerCase()};`);
    expect(lines[15]).toBe(`  --brand-160: ${ramp[15]};`);
  });

  it("rampToStyle trả về object biến CSS", () => {
    const style = rampToStyle(ramp);
    expect(Object.keys(style)).toEqual(RAMP_STEPS.map((step) => `--brand-${step}`));
    expect(style["--brand-80"]).toBe(SAKURA.toLowerCase());
  });
});
