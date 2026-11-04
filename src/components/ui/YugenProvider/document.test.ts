import { afterEach, describe, expect, it } from "vitest";
import { setMediaQueries } from "@/test/matchMedia";
import { yugenHtmlAttributes, yugenThemeScript, type YugenThemeScriptOptions } from "./document";

const html = document.documentElement;
const ATTRS = ["data-theme", "data-brand", "dir"];

/** Chạy script như trình duyệt chạy thẻ <script> trong <head>, trả về attribute của <html>. */
function runScript(stored: string | null, options?: YugenThemeScriptOptions) {
  for (const name of ATTRS) html.removeAttribute(name);
  html.setAttribute("data-brand", "sakura");
  html.setAttribute("dir", "ltr");
  const key = options?.storageKey ?? "yugen-ui-theme";
  if (stored === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, stored);
  new Function(yugenThemeScript(options))();
  return Object.fromEntries(ATTRS.map((name) => [name, html.getAttribute(name)]));
}

describe("yugenHtmlAttributes (#348)", () => {
  it("cùng mặc định với YugenProvider; density / scrollLock chỉ khi truyền", () => {
    expect(yugenHtmlAttributes()).toEqual({ "data-theme": "light", "data-brand": "sakura", dir: "ltr" });
    expect(yugenHtmlAttributes({ theme: "dark", brand: "web", dir: "rtl", density: "compact", scrollLock: "keep-scrollbar" })).toEqual({
      "data-theme": "dark",
      "data-brand": "web",
      dir: "rtl",
      "data-density": "compact",
      "data-yugen-scroll-lock": "keep-scrollbar",
    });
  });
});

describe("yugenThemeScript (#348)", () => {
  afterEach(() => {
    for (const name of ATTRS) html.removeAttribute(name);
  });

  it("lựa chọn đã lưu thắng cài đặt hệ điều hành", () => {
    setMediaQueries({ "prefers-color-scheme: dark": true });
    expect(runScript("light")).toEqual({ "data-theme": "light", "data-brand": "sakura", dir: "ltr" });
    expect(runScript("high-contrast")["data-theme"]).toBe("high-contrast");
  });

  it("JSON đã lưu: theme, brand, dir", () => {
    expect(runScript('{"theme":"dark","brand":"web","dir":"rtl"}')).toEqual({ "data-theme": "dark", "data-brand": "web", dir: "rtl" });
    // dir lạ bị bỏ qua, JSON hỏng thì theo hệ điều hành.
    expect(runScript('{"theme":"dark","dir":"up"}')).toEqual({ "data-theme": "dark", "data-brand": "sakura", dir: "ltr" });
    expect(runScript("{oops")["data-theme"]).toBe("light");
  });

  it("chưa lưu gì: theo prefers-contrast rồi prefers-color-scheme", () => {
    expect(runScript(null)["data-theme"]).toBe("light");
    expect(runScript("purple")["data-theme"]).toBe("light");
    setMediaQueries({ "prefers-color-scheme: dark": true });
    expect(runScript(null)["data-theme"]).toBe("dark");
    setMediaQueries({ "prefers-color-scheme: dark": true, "prefers-contrast: more": true });
    expect(runScript(null)["data-theme"]).toBe("high-contrast");
    expect(runScript(null, { highContrast: false })["data-theme"]).toBe("dark");
    expect(runScript(null, { defaultTheme: "light" })["data-theme"]).toBe("light");
  });

  it("storageKey riêng; không đóng được thẻ <script>", () => {
    expect(runScript("dark", { storageKey: "my-app" })["data-theme"]).toBe("dark");
    const script = yugenThemeScript({ storageKey: "</script><script>alert(1)//" });
    expect(script).not.toContain("</");
    expect(() => new Function(script)()).not.toThrow();
  });

  it("localStorage bị chặn: vẫn chọn theo hệ điều hành, không ném lỗi", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage")!;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    try {
      setMediaQueries({ "prefers-color-scheme: dark": true });
      for (const name of ATTRS) html.removeAttribute(name);
      new Function(yugenThemeScript())();
      expect(html.getAttribute("data-theme")).toBe("dark");
    } finally {
      Object.defineProperty(window, "localStorage", descriptor);
    }
  });
});
