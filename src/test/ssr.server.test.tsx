// @vitest-environment node
/**
 * Render phía server thật (Node, không có window / document — như Next.js App Router):
 * component không được ném lỗi khi đọc API trình duyệt trong render, và React không được cảnh báo
 * (vd. "useLayoutEffect does nothing on the server" của React 18).
 */
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { captureConsole, summarizeWarning } from "./consoleCapture";
import { SSR_CASES } from "./ssrCases";

describe("SSR trên Node (không có DOM)", () => {
  let capture: ReturnType<typeof captureConsole> | undefined;
  afterEach(() => capture?.restore());

  it("môi trường thật sự không có window / document", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it.each(SSR_CASES.map((c) => [c.name, c] as const))("%s", (_name, ssrCase) => {
    capture = captureConsole();
    const html = renderToString(ssrCase.render());
    capture.restore();
    expect(html.length).toBeGreaterThan(0);
    const known = ssrCase.knownServerWarnings ?? [];
    const unexpected = capture.errors.filter((message) => !known.some(({ pattern }) => pattern.test(message)));
    expect(unexpected.map(summarizeWarning)).toEqual([]);
    expect(capture.warnings.map(summarizeWarning)).toEqual([]);
  });
});
