import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { startGlassRefraction, supportsGlassRefraction } from "@/components/ui/GlassRefraction/GlassRefraction";
import { bezelWidth, lensMap, maxShift, refractionProfile } from "@/components/ui/GlassRefraction/lens";

/*
 * Khúc xạ ở mép glass (Yugen Labs): bản đồ dịch chuyển tính trong lens.ts, CSS tắt nó cùng blur. Phần vẽ thật
 * (backdrop-filter với SVG filter, chỉ Chromium) do E2E kiểm (e2e/glass.spec.ts).
 */
const root = path.resolve(__dirname, "../..");
const indexCss = fs.readFileSync(path.join(root, "src/index.css"), "utf8").replace(/\r\n/g, "\n");
const tokensCss = fs.readFileSync(path.join(root, "src/styles/tokens.css"), "utf8").replace(/\r\n/g, "\n");

/** Véc-tơ dịch (−1…1) tại điểm (x, y) của bản đồ. */
function vectorAt(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const i = (y * width + x) * 4;
  return { x: (data[i] - 128) / 127, y: (data[i + 1] - 128) / 127 };
}

describe("lens", () => {
  it("độ lệch lớn nhất ở mép, giảm dần vào trong", () => {
    const profile = refractionProfile(32);
    expect(Math.max(...profile)).toBeCloseTo(1);
    expect(profile[0]).toBe(Math.max(...profile));
    for (let i = 1; i < profile.length; i++) expect(profile[i]).toBeLessThanOrEqual(profile[i - 1]);
    expect(profile[profile.length - 1]).toBeLessThan(0.05);
  });

  it("vành: 6–24px theo cạnh ngắn; dịch tối đa bằng nửa vành (mẫu luôn nằm trong bề mặt)", () => {
    expect(bezelWidth({ width: 120, height: 32, radius: 16 })).toBe(10);
    expect(bezelWidth({ width: 240, height: 800, radius: 24 })).toBe(24);
    expect(bezelWidth({ width: 20, height: 12, radius: 6 })).toBe(6);
    expect(maxShift(24)).toBe(12);
  });

  it("bản đồ: giữa đứng yên, mép dịch vào trong, ngoài góc bo đứng yên", () => {
    const width = 200;
    const height = 80;
    const data = lensMap({ width, height, radius: 40 });
    expect(data).toHaveLength(width * height * 4);
    expect(vectorAt(data, width, 100, 40)).toEqual({ x: 0, y: 0 });
    // Mép trái giữa chiều cao: dịch sang phải (vào trong); mép phải: sang trái; mép trên: xuống.
    expect(vectorAt(data, width, 0, 40).x).toBeGreaterThan(0.8);
    expect(vectorAt(data, width, width - 1, 40).x).toBeLessThan(-0.8);
    expect(vectorAt(data, width, 100, 0).y).toBeGreaterThan(0.8);
    expect(vectorAt(data, width, 100, height - 1).y).toBeLessThan(-0.8);
    // Góc ngoài hình bo tròn.
    expect(vectorAt(data, width, 0, 0)).toEqual({ x: 0, y: 0 });
    // Alpha luôn đặc, kênh B trung tính.
    for (let i = 0; i < data.length; i += 4) {
      expect(data[i + 2]).toBe(128);
      expect(data[i + 3]).toBe(255);
    }
  });

  it("đối xứng qua tâm", () => {
    const width = 64;
    const height = 48;
    const data = lensMap({ width, height, radius: 12 });
    for (const [x, y] of [
      [3, 10],
      [10, 3],
      [5, 5],
    ]) {
      const a = vectorAt(data, width, x, y);
      const b = vectorAt(data, width, width - 1 - x, height - 1 - y);
      expect(a.x).toBeCloseTo(-b.x, 1);
      expect(a.y).toBeCloseTo(-b.y, 1);
    }
  });
});

describe("GlassRefraction", () => {
  it("ngoài Chromium (jsdom): không hỗ trợ, không làm gì", () => {
    expect(supportsGlassRefraction()).toBe(false);
    const stop = startGlassRefraction();
    expect(document.querySelector("filter")).toBeNull();
    expect(() => stop()).not.toThrow();
  });

  it("CSS: [data-glass-lens] dùng --glassLensFilter + --glass-lens; mọi chỗ tắt blur cũng tắt khúc xạ", () => {
    expect(indexCss.match(/&\[data-glass-lens\] \{\n {4}backdrop-filter: var\(--glassLensFilter\) var\(--glass-lens\);/g)).toHaveLength(3);
    const off = (css: string) => [(css.match(/--glassFilter: none;/g) ?? []).length, (css.match(/--glassLensFilter: none;/g) ?? []).length];
    const [blur, lens] = off(indexCss);
    expect(blur).toBeGreaterThan(0);
    expect(lens).toBe(blur);
    const [hcBlur, hcLens] = off(tokensCss);
    expect(hcLens).toBe(hcBlur);
  });
});
