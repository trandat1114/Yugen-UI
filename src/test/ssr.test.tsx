// @vitest-environment jsdom
/**
 * SSR → hydration: HTML render ở "server" phải khớp lần render đầu trên client dù môi trường đã đổi.
 *
 * - Server: `renderToString` trong lúc ẩn `window` / `document` / `localStorage` (giống Node của Next.js),
 *   media query đều không khớp, `Date` cố định ở T.
 * - Client: media query `prefers-reduced-motion` / `forced-colors` / `min-width`… đều khớp, đồng hồ đã chạy thêm 5 giây,
 *   localStorage có giá trị đã lưu → `hydrateRoot` không được báo lỗi khôi phục (recoverable error) hay cảnh báo
 *   "did not match" / "server rendered HTML".
 *
 * Hai lớp kiểm tra:
 * 1. `hydrateRoot` thật: lệch nội dung chữ / cấu trúc → recoverable error.
 * 2. So HTML: `renderToString` lặp lại trong môi trường client phải ra đúng HTML của server. Lần render này dùng
 *    getServerSnapshot, không chạy effect — y như lượt render hydration — nên bắt được cả lệch thuộc tính
 *    (React 18 chỉ cảnh báo "Prop … did not match" một lần cho cả tiến trình, các lần sau im lặng).
 *
 * Bắt được: đọc thời gian, media query, localStorage, kích thước đo được hoặc id ngẫu nhiên ngay trong render.
 * Cảnh báo phía server (useLayoutEffect…) được kiểm tra ở ssr.server.test.tsx (môi trường Node thật).
 */
import * as React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PackageManagerTabs } from "@/components/ui";
import { captureConsole, summarizeWarning } from "./consoleCapture";
import { withoutBrowserGlobals } from "./serverRender";
import { setMediaQueries } from "./matchMedia";
import { SSR_CASES, SSR_NOW } from "./ssrCases";

const HYDRATION_MESSAGE =
  /hydrat|did not match|server rendered|server-rendered|Expected server HTML|Extra attributes from the server|initial UI does not match/i;

/** Đoạn khác nhau đầu tiên giữa hai chuỗi HTML (để báo lỗi dễ đọc). */
function firstDifference(a: string, b: string): string | null {
  if (a === b) return null;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 80);
  return `server: …${a.slice(from, i + 80)}…
client: …${b.slice(from, i + 80)}…`;
}

interface HydrationResult {
  html: string;
  /** HTML render lại trong môi trường client; null nếu không render được bằng renderToString (portal). */
  clientHtml: string | null;
  clientRenderError: string | null;
  /** Lỗi React tự khôi phục (render lại phía client) — luôn là lệch hydration. */
  recoverable: string[];
  /** console.error trong lúc hydrate (đã rút gọn). */
  errors: string[];
  root: Root;
  container: HTMLDivElement;
}

async function renderServerThenHydrate(render: () => React.ReactElement): Promise<HydrationResult> {
  // ---------- Server ----------
  setMediaQueries(() => false);
  const serverCapture = captureConsole();
  let html: string;
  try {
    html = withoutBrowserGlobals(() => renderToString(render()));
  } finally {
    serverCapture.restore();
  }

  // ---------- Client: môi trường khác server ----------
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  setMediaQueries({
    "prefers-reduced-motion": true,
    "forced-colors": true,
    "min-width": true,
    "prefers-color-scheme: dark": true,
    "pointer: coarse": true,
  });
  vi.setSystemTime(SSR_NOW + 5_000);
  window.localStorage.setItem("yugen-ui-package-manager", "pnpm");
  window.localStorage.setItem("react-resizable-panels:ssr-layout", JSON.stringify({ a: 25, b: 75 }));

  // Lượt render đầu của client (như hydration) bằng renderToString — so được từng thuộc tính.
  let clientHtml: string | null = null;
  let clientRenderError: string | null = null;
  const replayCapture = captureConsole();
  try {
    clientHtml = renderToString(render());
  } catch (error) {
    clientRenderError = error instanceof Error ? error.message : String(error);
  } finally {
    replayCapture.restore();
  }

  const recoverable: string[] = [];
  const clientCapture = captureConsole();
  let root!: Root;
  try {
    await act(async () => {
      root = hydrateRoot(container, render(), {
        onRecoverableError: (error) => recoverable.push(error instanceof Error ? error.message : String(error)),
      });
    });
    // Cho effect sau hydration (đọc media query, đồng hồ, localStorage…) chạy xong.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  } finally {
    clientCapture.restore();
  }
  return { html, clientHtml, clientRenderError, recoverable, errors: clientCapture.errors.map(summarizeWarning), root, container };
}

describe("SSR → hydration không lệch", () => {
  let mounted: HydrationResult | undefined;

  beforeEach(() => {
    // Chỉ giả lập Date (setTimeout/setInterval vẫn thật để effect chạy bình thường).
    vi.useFakeTimers({ now: SSR_NOW, toFake: ["Date"] });
  });

  afterEach(() => {
    if (mounted) {
      const { root, container } = mounted;
      act(() => root.unmount());
      container.remove();
    }
    mounted = undefined;
  });

  it("ẩn global trình duyệt khi render server hoạt động đúng", () => {
    const seen = withoutBrowserGlobals(() => [typeof window, typeof document, typeof localStorage]);
    expect(seen).toEqual(["undefined", "undefined", "undefined"]);
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });

  it.each(SSR_CASES.map((c) => [c.name, c] as const))("%s", async (_name, ssrCase) => {
    mounted = await renderServerThenHydrate(ssrCase.render);
    expect(mounted.html.length).toBeGreaterThan(0);
    // renderToString không hỗ trợ portal (PageProgress fixed, Toaster…) — khi đó chỉ còn lớp kiểm tra hydrateRoot.
    if (mounted.clientRenderError) expect(mounted.clientRenderError).toMatch(/Portals are not currently supported/);
    else expect(firstDifference(mounted.html, mounted.clientHtml ?? "")).toBeNull();
    expect(mounted.recoverable).toEqual([]);
    expect(mounted.errors.filter((m) => HYDRATION_MESSAGE.test(m))).toEqual([]);
    expect(mounted.errors).toEqual([]);
  });

  it("sau hydration, client chuyển sang giá trị thật (PackageManagerTabs đọc localStorage)", async () => {
    mounted = await renderServerThenHydrate(() => <PackageManagerTabs packages="yugen-ui" />);
    // Server: "npm" (getServerSnapshot) — client: lựa chọn đã lưu, không lệch hydration.
    const server = document.createElement("div");
    server.innerHTML = mounted.html;
    expect(server.querySelector('[role="tabpanel"][data-state="active"]')).toHaveTextContent("npm install yugen-ui");
    expect(mounted.clientHtml).toBe(mounted.html);
    expect(mounted.recoverable).toEqual([]);
    expect(mounted.container.querySelector('[role="tab"][aria-selected="true"]')).toHaveTextContent("pnpm");
    expect(mounted.container.querySelector('[role="tabpanel"][data-state="active"]')).toHaveTextContent("pnpm add yugen-ui");
  });

  /* ---------- Đối chứng: harness phải bắt được các lỗi kinh điển ---------- */
  describe("đối chứng — các mẫu gây lệch đều bị phát hiện", () => {
    function expectMismatch(result: HydrationResult) {
      expect(result.clientHtml).not.toBeNull();
      expect(firstDifference(result.html, result.clientHtml ?? "")).not.toBeNull();
    }

    it("đọc Date.now() trong render", async () => {
      function Clock() {
        return <span>{Math.floor(Date.now() / 1000)}</span>;
      }
      mounted = await renderServerThenHydrate(() => <Clock />);
      expectMismatch(mounted);
    });

    it("đọc matchMedia trong useState initializer", async () => {
      function Motion() {
        const [reduce] = React.useState(
          () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
        return <div data-reduce={reduce ? "yes" : "no"}>x</div>;
      }
      mounted = await renderServerThenHydrate(() => <Motion />);
      expectMismatch(mounted);
    });

    it("đọc localStorage trong render", async () => {
      function Stored() {
        const pm = typeof window !== "undefined" ? window.localStorage.getItem("yugen-ui-package-manager") : null;
        return <code>{pm ?? "npm"}</code>;
      }
      mounted = await renderServerThenHydrate(() => <Stored />);
      expectMismatch(mounted);
    });

    it("id ngẫu nhiên (không dùng useId)", async () => {
      function RandomId() {
        const id = React.useMemo(() => `f-${Math.random().toString(36).slice(2)}`, []);
        return <label htmlFor={id}>Tên</label>;
      }
      mounted = await renderServerThenHydrate(() => <RandomId />);
      expectMismatch(mounted);
    });
  });
});
