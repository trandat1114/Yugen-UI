import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityPage } from "./pages/CommunityPage";
import { SupportPage } from "./pages/SupportPage";
import { resetTurnstileLoader, TURNSTILE_SCRIPT, type TurnstileApi } from "./turnstile";

const API = "https://api.example.test/supporters";
const SITE_KEY = "1x00000000000000000000AA";

type Params = Record<string, unknown> & { callback: (token: string) => void };

function turnstileMock() {
  const widgets: Params[] = [];
  const api = {
    render: vi.fn((_el: HTMLElement, params: Params) => {
      widgets.push(params);
      return "w-1";
    }),
    execute: vi.fn(() => {
      const params = widgets.at(-1)!;
      queueMicrotask(() => params.callback(`token-${api.execute.mock.calls.length}`));
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  return { api, widgets };
}

const scripts = () => [...document.head.querySelectorAll<HTMLScriptElement>("script")].filter((s) => s.src.startsWith("https://challenges.cloudflare.com/"));

function stubFetch(reply: () => Response = () => new Response(JSON.stringify({ data: { status: "pending" } }), { status: 201 })) {
  const posts: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== "POST") return new Response(JSON.stringify({ data: [] }), { status: 200 });
      posts.push(JSON.parse(String(init.body)) as Record<string, unknown>);
      return reply();
    }),
  );
  return posts;
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText(/Ngày ủng hộ/), { target: { value: "2026-11-27" } });
  const consent = screen.getByRole("checkbox");
  if (!(consent as HTMLInputElement).checked) await user.click(consent);
}

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: "Gửi thông tin ghi nhận" }));

beforeEach(() => {
  resetTurnstileLoader();
  delete window.turnstile;
  delete window.yugenTurnstileReady;
});

afterEach(() => {
  for (const script of scripts()) script.remove();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Turnstile on the support form (yugen-analytics-api #14)", () => {
  it("loads only after the first focus in the form and sends a fresh token with each submission", async () => {
    const posts = stubFetch();
    const { api } = turnstileMock();
    const user = userEvent.setup();
    render(<SupportPage supportApiUrl={API} turnstileSiteKey={SITE_KEY} />);
    expect(scripts()).toHaveLength(0);
    expect(screen.getByText(/Khi gửi, form chạy bước kiểm tra Cloudflare Turnstile/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cách form xử lý dữ liệu" }).getAttribute("href")).toMatch(/\/community#privacy$/);

    await fill(user);
    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].src).toBe(`${TURNSTILE_SCRIPT}&onload=yugenTurnstileReady`);
    window.turnstile = api as unknown as TurnstileApi;
    window.yugenTurnstileReady!();
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));
    expect(api.render.mock.calls[0][1]).toMatchObject({
      sitekey: SITE_KEY,
      action: "support-acknowledgement",
      execution: "execute",
      appearance: "interaction-only",
      language: "vi",
      "response-field": false,
    });

    await submit(user);
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].turnstileToken).toBe("token-1");
    expect(api.reset).not.toHaveBeenCalled();
    expect(await screen.findByText("Cảm ơn bạn. Thông tin đang chờ đối soát.")).toBeInTheDocument();

    // Tokens are single-use: the next submission resets the widget and runs the check again.
    await fill(user);
    await submit(user);
    await waitFor(() => expect(posts).toHaveLength(2));
    expect(api.reset).toHaveBeenCalledWith("w-1");
    expect(posts[1].turnstileToken).toBe("token-2");
    expect(scripts()).toHaveLength(1);
    expect(api.render).toHaveBeenCalledTimes(1);
  });

  it("sends without a token when the script is blocked and shows why the API refused", async () => {
    const posts = stubFetch(() => new Response(JSON.stringify({ error: "challenge_failed" }), { status: 403 }));
    const user = userEvent.setup();
    render(<SupportPage supportApiUrl={API} turnstileSiteKey={SITE_KEY} />);
    await fill(user);
    await submit(user);
    scripts()[0].dispatchEvent(new Event("error"));
    expect(await screen.findAllByText("Bước kiểm tra bảo mật chưa đạt. Vui lòng thử lại.")).not.toHaveLength(0);
    expect(posts).toHaveLength(1);
    expect(posts[0]).not.toHaveProperty("turnstileToken");
  });

  it("stays off without a site key and asks to retry later when the queue is full", async () => {
    const posts = stubFetch(() => new Response(JSON.stringify({ error: "queue_full" }), { status: 429 }));
    const user = userEvent.setup();
    render(<SupportPage supportApiUrl={API} />);
    await fill(user);
    await submit(user);
    expect(await screen.findAllByText("Hiện có quá nhiều lượt gửi. Vui lòng thử lại sau.")).not.toHaveLength(0);
    expect(scripts()).toHaveLength(0);
    expect(posts[0]).not.toHaveProperty("turnstileToken");
    expect(screen.queryByText(/Cloudflare Turnstile/)).toBeNull();
  });

  it("describes the form in Community › Privacy, with the check only when it is on", () => {
    vi.stubEnv("VITE_SUPPORT_API_URL", API);
    const { unmount } = render(<CommunityPage />);
    const privacy = () => document.getElementById("privacy")!;
    expect(privacy()).toHaveTextContent("giá trị băm có khóa của địa chỉ mạng, không lưu IP");
    expect(privacy()).not.toHaveTextContent("Cloudflare Turnstile");
    unmount();
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", SITE_KEY);
    render(<CommunityPage />);
    expect(privacy()).toHaveTextContent("Cloudflare Turnstile");
  });
});
