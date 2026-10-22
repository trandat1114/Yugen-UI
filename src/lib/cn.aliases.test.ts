// lint:classes ignore-file — file này cố ý dùng alias spacing viết hoa (deprecated, #42) để kiểm tra cn() vẫn gộp đúng.
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn — alias spacing viết hoa (deprecated, bỏ ở 1.0)", () => {
  it("hai alias cùng utility → cái sau thắng", () => {
    expect(cn("p-M", "p-L")).toBe("p-L");
    expect(cn("gap-SNudge", "gap-MNudge")).toBe("gap-MNudge");
    expect(cn("px-M", "py-S")).toBe("px-M py-S");
  });

  it("alias và thang số đè nhau như cùng một scale", () => {
    expect(cn("p-M", "p-4")).toBe("p-4");
    expect(cn("px-3", "px-XL")).toBe("px-XL");
    expect(cn("px-M", "p-4")).toBe("p-4");
  });
});
