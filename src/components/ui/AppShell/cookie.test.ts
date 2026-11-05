import { afterEach, describe, expect, it, vi } from "vitest";
import { resetDeprecationWarnings } from "@/lib/deprecate";
import { readAppShellCookie, writeAppShellCookie } from "./cookie";

/** vitest's jsdom environment exposes the JSDOM instance, which can move the document to another URL. */
const dom = (globalThis as unknown as { jsdom: { reconfigure(options: { url: string }): void } }).jsdom;
const startUrl = window.location.href;

function written(persistKey: string, state: Parameters<typeof writeAppShellCookie>[1]) {
  const set = vi.spyOn(document, "cookie", "set");
  set.mockClear();
  writeAppShellCookie(persistKey, state);
  return set.mock.calls.map(([value]) => value);
}

afterEach(() => {
  dom.reconfigure({ url: startUrl });
  document.cookie = "shell=; path=/; max-age=0";
  resetDeprecationWarnings();
});

describe("AppShell cookie", () => {
  it("stores only the sidebar state, with path, max-age and samesite", () => {
    expect(written("shell", { collapsed: true })).toEqual(["shell=collapsed; path=/; max-age=31536000; samesite=lax"]);
    expect(written("shell", { collapsed: false, width: 280.4 })).toEqual([
      "shell=expanded:280; path=/; max-age=31536000; samesite=lax",
    ]);
    expect(readAppShellCookie(document.cookie, "shell")).toEqual({ collapsed: false, width: 280 });
  });

  it("adds secure when the page is served over https", () => {
    dom.reconfigure({ url: "https://example.com/app" });
    expect(written("shell", { collapsed: true })).toEqual(["shell=collapsed; path=/; max-age=31536000; samesite=lax; secure"]);
    expect(readAppShellCookie(document.cookie, "shell")).toEqual({ collapsed: true, width: undefined });
  });

  it.each(["my shell", "shell;path=/admin", "shell=1", "ứng-dụng", "app:sidebar"])(
    "escapes the key %j, so it cannot add cookie attributes, and reads it back",
    (key) => {
      const [cookie] = written(key, { collapsed: true });
      expect(cookie).toBe(`${encodeURIComponent(key)}=collapsed; path=/; max-age=31536000; samesite=lax`);
      expect(readAppShellCookie(`a=1; ${encodeURIComponent(key)}=collapsed`, key)).toEqual({ collapsed: true, width: undefined });
    },
  );

  it("an empty key saves nothing", () => {
    expect(written("", { collapsed: true })).toEqual([]);
    expect(readAppShellCookie("=collapsed", "")).toBeUndefined();
  });
});
