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

  it("sends JSON with the collector content type", async () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("https://github.com/trandat1114/Yugen-UI?tab=readme");
    const env = envWith();
    expect(send(view, env)).toBe(true);
    const [url, body] = (env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://collect.example.com/c");
    expect(body).toBeInstanceOf(Blob);
    expect((body as Blob).type).toBe("application/json");
    expect(JSON.parse(await (body as Blob).text())).toEqual({
      ...view,
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
      referrer: "github.com",
      screen: expect.stringMatching(/^[sml]$/),
    });
  });

  it("normalizes route paths for the collector contract", async () => {
    const env = envWith();

    expect(send({ ...view, path: "" }, env)).toBe(true);
    expect(send({ ...view, path: "vi/support" }, env)).toBe(true);
    expect(send({ ...view, path: "#/components/button?tab=code" }, env)).toBe(true);

    const calls = (env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls;
    expect(JSON.parse(await (calls[0][1] as Blob).text()).path).toBe("/");
    expect(JSON.parse(await (calls[1][1] as Blob).text()).path).toBe("/vi/support");
    expect(JSON.parse(await (calls[2][1] as Blob).text()).path).toBe("/components/button");
  });

  it("counts clicks on [data-analytics] and stops after cleanup", async () => {
    const env = envWith();
    const stop = trackClicks(() => ({ path: "", lang: "en", version: "1.0.0" }), env);
    document.body.innerHTML = '<a data-analytics="stackblitz-template" href="#"><span>Open</span></a><button>Other</button>';
    document.querySelector("span")!.click();
    document.querySelector("button")!.click();
    expect(env.nav.sendBeacon).toHaveBeenCalledTimes(1);
    const body = (env.nav.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0][1] as Blob;
    expect(body.type).toBe("application/json");
    expect(JSON.parse(await body.text())).toMatchObject({ type: "stackblitz-template" });
    expect(JSON.parse(await body.text())).not.toHaveProperty("event");
    stop();
    document.querySelector("span")!.click();
    expect(env.nav.sendBeacon).toHaveBeenCalledTimes(1);
  });
});
