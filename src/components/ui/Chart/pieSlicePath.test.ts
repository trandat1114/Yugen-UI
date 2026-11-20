import { describe, expect, it } from "vitest";
import { pieSlicePath } from "./chartUtils";

describe("pieSlicePath", () => {
  it("closes a sector at the center", () => {
    const path = pieSlicePath(50, 50, 40, 0, Math.PI / 2);
    expect(path).toMatch(/^M50,50L/);
    expect(path).toMatch(/Z$/);
  });
});
