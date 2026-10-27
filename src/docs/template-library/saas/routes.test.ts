import { describe, expect, it } from "vitest";
import { PAGES } from "./pages";
import { pageFromLegacyHash, pageFromPath, pathOf } from "./routes";

describe("SaaS routes", () => {
  it("mọi trang: đường dẫn ⇄ trang; Tổng quan ở /", () => {
    for (const { id } of PAGES) expect(pageFromPath(pathOf(id))).toBe(id);
    expect(pathOf("overview")).toBe("/");
    expect(pageFromPath("/billing/")).toBe("billing");
  });

  it("đường dẫn lạ và /overview không phải trang; link #/ kiểu cũ vẫn nhận ra", () => {
    expect(pageFromPath("/nope")).toBeUndefined();
    expect(pageFromPath("/overview")).toBeUndefined();
    expect(pageFromPath("/billing/2026")).toBeUndefined();
    expect(pageFromLegacyHash("#/billing")).toBe("billing");
    expect(pageFromLegacyHash("#top")).toBeUndefined();
  });
});
