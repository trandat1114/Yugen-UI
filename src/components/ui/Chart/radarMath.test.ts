import { describe, expect, it } from "vitest";
import { radarPath, radarPoint, radarValue } from "./radarMath";

describe("radarMath", () => {
  it("places the first axis at 12 o'clock and closes complete polygons", () => {
    const first = radarPoint(0, 4, 10, 20, 20);
    expect(first.x).toBeCloseTo(20);
    expect(first.y).toBeCloseTo(10);
    expect(
      radarPath([
        first,
        radarPoint(1, 4, 10, 20, 20),
        radarPoint(2, 4, 10, 20, 20),
        radarPoint(3, 4, 10, 20, 20),
      ]),
    ).toContain("Z");
  });

  it("clamps values and preserves missing values", () => {
    expect(radarValue(-1, 0, 10)).toBe(0);
    expect(radarValue(12, 0, 10)).toBe(1);
    expect(radarValue(null, 0, 10)).toBeNull();
    expect(radarPath([{ x: 0, y: 0 }, null, { x: 1, y: 1 }])).toBe("M0,0M1,1");
  });
});
