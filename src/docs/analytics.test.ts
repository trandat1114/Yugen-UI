import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsEnabled, send, trackClicks, type AnalyticsEnv } from "./analytics";

const envWith = (over: Partial<AnalyticsEnv["nav"]> = {}, url: string | undefined = "https://collect.example.com/c"): AnalyticsEnv => ({
  url,
  nav: { sendBeacon: vi.fn(() => true), ...over },
});
const view = { type: "page_view" as const, path: "/components/button", lang: "en", version: "1.0.0" };

afterEach(() => vi.restoreAllMocks());

describe("docs analytics (#190)", () => {
  it("is off without an https collector URL (tests, local builds)", () => {
    expect(import.meta.env.VITE_ANALYTICS_URL).toBeFalsy();
    expect(analyticsEnabled()).toBe(false);
    expect(analyticsEnabled({ ...envWith(), url: undefined })).toBe(false);
    expect(analyticsEnabled(envWith({}, "http://collect.example.com"))).toBe(false);
    expect(send(view)).toBe(false);
  });

  it("respects Do Not Track and Global Privacy Control", () => {
    expect(analyticsEnabled(envWith({ doNotTrack: "1" }))).toBe(false);
    expect(analyticsEnabled(envWith({ globalPrivacyControl: true }))).toBe(false);
    expect(analyticsEnabled(envWith())).toBe(true);
  });

  it("sends path, lang, version, referrer host and screen class only", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("https://github.com/trandat1114/Yugen-UI?tab=readme");
    const env = envWith();
    expect(send(view, env)).toBe(true);
    const [url, body] = (env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://collect.example.com/c");
    expect(JSON.parse(body as string)).toEqual({
      ...view,
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
      referrer: "github.com",
      screen: expect.stringMatching(/^[sml]$/),
    });
  });

  it("counts clicks on [data-analytics] and stops after cleanup", () => {
    const env = envWith();
    const stop = trackClicks(() => ({ path: "", lang: "en", version: "1.0.0" }), env);
    document.body.innerHTML = '<a data-analytics="stackblitz-template" href="#"><span>Open</span></a><button>Other</button>';
    document.querySelector("span")!.click();
    document.querySelector("button")!.click();
    expect(env.nav.sendBeacon).toHaveBeenCalledTimes(1);
    expect(JSON.parse((env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0][1] as string)).toMatchObject({ type: "stackblitz-template" });
    expect(JSON.parse((env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0][1] as string)).not.toHaveProperty("event");
    stop();
    document.querySelector("span")!.click();
    expect(env.nav.sendBeacon).toHaveBeenCalledTimes(1);
  });
});
