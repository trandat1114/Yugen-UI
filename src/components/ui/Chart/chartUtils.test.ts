import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  CHART_PALETTE_SIZE,
  barPath,
  chartUid,
  clamp,
  donutSlicePath,
  fitText,
  linePath,
  linearScale,
  makeAxisFormatter,
  makeDateFormatter,
  makeNumberFormatter,
  measureText,
  niceTicks,
  patternId,
  ringPath,
  slotDash,
  slotFill,
  slotOf,
  slotVar,
  toNumber,
  useSeriesToggle,
  type Point,
} from "./chartUtils";

describe("màu phân loại — không bao giờ xoay vòng", () => {
  it("8 chuỗi đầu nhận ô 1…8 theo thứ tự", () => {
    expect(CHART_PALETTE_SIZE).toBe(8);
    expect(Array.from({ length: 8 }, (_, i) => slotOf(undefined, i))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("chuỗi thứ 9 trở đi gộp vào 'other', không quay lại ô 1", () => {
    for (let i = 8; i < 40; i++) expect(slotOf(undefined, i)).toBe("other");
  });

  it("màu cố định của chuỗi được giữ, bất kể vị trí", () => {
    expect(slotOf(3, 0)).toBe(3);
    expect(slotOf(8, 25)).toBe(8);
  });

  it("slotVar trỏ tới token biểu đồ", () => {
    expect(slotVar(1)).toBe("var(--colorChartCategorical1)");
    expect(slotVar(8)).toBe("var(--colorChartCategorical8)");
    expect(slotVar("other")).toBe("var(--colorChartOther)");
    expect(slotVar("neg")).toBe("var(--colorChartDivergingNeg)");
    expect(slotVar("pos")).toBe("var(--colorChartDivergingPos)");
  });

  it("nét đứt / hoa văn chỉ khi bật texture; ô 1 và 'other' luôn tô đặc", () => {
    expect(slotDash(2, false)).toBeUndefined();
    expect(slotDash(2, true)).toBe("8 4");
    expect(slotDash(1, true)).toBeUndefined();
    expect(slotDash("other", true)).toBe("1 3");
    // Mỗi ô 2…8 có nét đứt khác nhau.
    const dashes = ([2, 3, 4, 5, 6, 7, 8] as const).map((s) => slotDash(s, true));
    expect(new Set(dashes).size).toBe(7);

    expect(patternId("c1", 1)).toBeUndefined();
    expect(patternId("c1", "other")).toBeUndefined();
    expect(patternId("c1", 4)).toBe("c1-tx-4");
    expect(slotFill(4, true, "c1")).toBe("url(#c1-tx-4)");
    expect(slotFill(4, false, "c1")).toBe("var(--colorChartCategorical4)");
    expect(slotFill(1, true, "c1")).toBe("var(--colorChartCategorical1)");
  });
});

describe("định dạng số / ngày", () => {
  it("makeNumberFormatter theo locale, mặc định tối đa 2 chữ số thập phân", () => {
    expect(makeNumberFormatter("en-US")(1234.5678)).toBe("1,234.57");
    expect(makeNumberFormatter("vi-VN")(1234.5)).toBe("1.234,5");
    expect(makeNumberFormatter("en-US", { style: "percent" })(0.25)).toBe("25%");
    const custom = (v: number) => `${v} đ`;
    expect(makeNumberFormatter("vi-VN", custom)).toBe(custom);
  });

  it("makeAxisFormatter rút gọn từ 1.000, đủ chữ số theo bước vạch chia", () => {
    const k = makeAxisFormatter("en-US", undefined, 2000, 250);
    expect(k(1000)).toBe("1K");
    expect(k(1250)).toBe("1.25K");
    expect(k(0)).toBe("0");
    const m = makeAxisFormatter("en-US", undefined, 3_000_000, 500_000);
    expect(m(2_500_000)).toBe("2.5M");
  });

  it("makeAxisFormatter: không rút gọn dưới 1.000 và với percent", () => {
    expect(makeAxisFormatter("en-US", undefined, 900, 100)(800)).toBe("800");
    expect(makeAxisFormatter("en-US", undefined, 1, 0.25)(0.75)).toBe("0.75");
    const pct = makeAxisFormatter("en-US", { style: "percent" }, 1, 0.25);
    expect(pct(0.5)).toBe("50%");
    expect(makeAxisFormatter("en-US", { style: "percent" }, 5000, 1000)(0.5)).toBe("50%");
  });

  it("makeAxisFormatter giữ currency của định dạng giá trị", () => {
    const usd = makeAxisFormatter("en-US", { style: "currency", currency: "USD" }, 5000, 1000);
    expect(usd(3000)).toBe("$3K");
  });

  it("makeDateFormatter", () => {
    const date = new Date(Date.UTC(2026, 0, 15, 12));
    const f = makeDateFormatter("en-US", undefined, { month: "short", day: "numeric", timeZone: "UTC" });
    expect(f(date)).toBe("Jan 15");
    const g = makeDateFormatter("en-US", { year: "numeric", timeZone: "UTC" }, { month: "short" });
    expect(g(date)).toBe("2026");
    const fn = (d: Date) => String(d.getUTCFullYear());
    expect(makeDateFormatter("en-US", fn, {})).toBe(fn);
  });

  it("toNumber chỉ nhận số hữu hạn", () => {
    expect(toNumber(3)).toBe(3);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-2.5)).toBe(-2.5);
    for (const v of [Number.NaN, Number.POSITIVE_INFINITY, "3", null, undefined, new Date()]) expect(toNumber(v)).toBeNull();
  });
});

describe("niceTicks", () => {
  /** Vạch phủ trọn [min, max], cách đều, tăng dần. */
  function expectNice(ticks: number[], min: number, max: number) {
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks[0]).toBeLessThanOrEqual(min);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
    const step = ticks[1] - ticks[0];
    expect(step).toBeGreaterThan(0);
    ticks.forEach((t, i) => i > 0 && expect(t - ticks[i - 1]).toBeCloseTo(step, 9));
    // Bước "tròn": 1, 2, 2.5 hoặc 5 × 10^n.
    const mantissa = step / 10 ** Math.floor(Math.log10(step));
    expect([1, 2, 2.5, 5].some((m) => Math.abs(mantissa - m) < 1e-9)).toBe(true);
  }

  it("0…100 → 0, 20, …, 100", () => {
    expect(niceTicks(0, 100)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("khoảng âm/dương", () => {
    const ticks = niceTicks(-37, 82);
    expect(ticks).toEqual([-50, -25, 0, 25, 50, 75, 100]);
  });

  it("không có sai số dấu phẩy động (0.30000000000000004)", () => {
    expect(niceTicks(0, 0.3)).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it.each([
    [0, 1],
    [3, 97],
    [-1000, -10],
    [0.001, 0.0042],
    [12345, 987654],
    [-5, 5],
  ])("phủ trọn [%d, %d] với bước tròn", (min, max) => {
    expectNice(niceTicks(min, max), min, max);
  });

  it("tôn trọng số vạch gợi ý", () => {
    expect(niceTicks(0, 100, 2)).toEqual([0, 50, 100]);
    expect(niceTicks(0, 100, 10)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it("min = max: 0 → [0, 1]; khác 0 → nới ±10%", () => {
    expect(niceTicks(0, 0)).toEqual([0, 1]);
    const ticks = niceTicks(50, 50);
    expectNice(ticks, 45, 55);
  });

  it("giá trị không hữu hạn → [0, 1]", () => {
    expect(niceTicks(Number.NaN, 10)).toEqual([0, 1]);
    expect(niceTicks(0, Number.POSITIVE_INFINITY)).toEqual([0, 1]);
  });
});

describe("linearScale / clamp", () => {
  it("ánh xạ tuyến tính, kể cả đảo chiều (trục Y SVG)", () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(100)).toBe(0);
    expect(y(25)).toBe(150);
  });

  it("miền suy biến → luôn r0", () => {
    expect(linearScale([5, 5], [10, 20])(123)).toBe(10);
  });

  it("clamp", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("measureText / fitText (canvas giả lập: 0.5 × cỡ chữ mỗi ký tự)", () => {
  it("measureText dùng canvas 2D", () => {
    expect(measureText("abcd")).toBe(24);
    expect(measureText("abcd", 20, 600)).toBe(40);
    expect(measureText("")).toBe(0);
  });

  it("fitText giữ nguyên chữ vừa khung", () => {
    expect(fitText("Hà Nội", 1000)).toBe("Hà Nội");
    expect(fitText("abcde", 30)).toBe("abcde");
  });

  it("fitText cắt + thêm … sao cho vừa max", () => {
    const out = fitText("Hello world", 30);
    expect(out).toBe("Hell…");
    expect(measureText(out)).toBeLessThanOrEqual(30);
    // Thêm một ký tự nữa là tràn.
    expect(measureText("Hello…")).toBeGreaterThan(30);
  });

  it("fitText trả về chuỗi rỗng khi không đủ chỗ cho cả một ký tự + …", () => {
    expect(fitText("Hello", 5)).toBe("");
  });
});

/* ---------- Đường & hình ---------- */

/** Tách path SVG thành số. */
const numbers = (d: string) => (d.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? []).map(Number);

describe("barPath", () => {
  it("kích thước ≤ 0 → path rỗng", () => {
    expect(barPath(0, 0, 0, 10, 4, "top")).toBe("");
    expect(barPath(0, 0, 10, -1, 4, "top")).toBe("");
  });

  it("end=none hoặc r=0 → hình chữ nhật thường", () => {
    expect(barPath(1, 2, 10, 20, 4, "none")).toBe("M1,2h10v20h-10Z");
    expect(barPath(1, 2, 10, 20, 0, "top")).toBe("M1,2h10v20h-10Z");
  });

  it("bo góc ở đầu dữ liệu, bán kính không vượt nửa bề rộng / chiều cao", () => {
    for (const end of ["top", "bottom", "left", "right"] as const) {
      const d = barPath(0, 0, 10, 40, 4, end);
      expect(d.startsWith("M")).toBe(true);
      expect(d.endsWith("Z")).toBe(true);
      expect(d.match(/A/g)).toHaveLength(2);
    }
    // Cột rất hẹp: r bị kẹp về w/2.
    expect(barPath(0, 0, 4, 40, 8, "top")).toContain("A2,2");
    // Cột rất thấp: r bị kẹp về h.
    expect(barPath(0, 0, 40, 1, 8, "top")).toContain("A1,1");
  });
});

describe("linePath", () => {
  it("0, 1, 2 điểm", () => {
    expect(linePath([])).toBe("");
    expect(linePath([[1, 2]])).toBe("M1,2");
    expect(
      linePath([
        [0, 0],
        [10, 5],
      ]),
    ).toBe("M0,0L10,5");
  });

  it("linear nối thẳng", () => {
    const pts: Point[] = [
      [0, 0],
      [10, 5],
      [20, 0],
    ];
    expect(linePath(pts, "linear")).toBe("M0,0L10,5L20,0");
  });

  it("monotone không vượt đỉnh dữ liệu (control point nằm trong khoảng y của đoạn)", () => {
    const pts: Point[] = [
      [0, 100],
      [10, 0],
      [20, 0],
      [30, 80],
      [40, 79],
      [50, 100],
    ];
    const d = linePath(pts);
    const segments = d.split("C").slice(1);
    expect(segments).toHaveLength(pts.length - 1);
    segments.forEach((seg, i) => {
      const [, c1y, , c2y, x1, y1] = numbers(seg);
      const lo = Math.min(pts[i][1], pts[i + 1][1]);
      const hi = Math.max(pts[i][1], pts[i + 1][1]);
      expect(c1y).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(c1y).toBeLessThanOrEqual(hi + 1e-9);
      expect(c2y).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(c2y).toBeLessThanOrEqual(hi + 1e-9);
      expect([x1, y1]).toEqual(pts[i + 1]);
    });
  });
});

describe("donutSlicePath / ringPath", () => {
  it("lát hợp lệ: 2 cung + đóng path", () => {
    const d = donutSlicePath(50, 50, 30, 45, 0, Math.PI / 2, 2);
    expect(d.startsWith("M")).toBe(true);
    expect(d.match(/A/g)).toHaveLength(2);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("lát lớn hơn nửa vòng dùng large-arc = 1", () => {
    const d = donutSlicePath(50, 50, 30, 45, 0, Math.PI * 1.5, 0);
    expect(d).toContain("0 1 1");
  });

  it("lát quá nhỏ so với khe → path rỗng", () => {
    expect(donutSlicePath(50, 50, 30, 45, 0, 0.01, 4)).toBe("");
  });

  it("ringPath là hai vòng tròn (ngoài + lỗ)", () => {
    const d = ringPath(50, 50, 30, 45);
    expect(d.match(/M/g)).toHaveLength(2);
    expect(d.match(/A/g)).toHaveLength(4);
  });
});

describe("chartUid", () => {
  it("bỏ ký tự không hợp lệ trong url(#…) của useId (React 18 và 19)", () => {
    expect(chartUid(":r1f:")).toBe("r1f");
    expect(chartUid("«r2»")).toBe("r2");
    expect(chartUid("a_b-c")).toBe("a_b-c");
  });
});

describe("useSeriesToggle", () => {
  it("ẩn / hiện chuỗi, luôn giữ ít nhất một chuỗi", () => {
    const keys = ["a", "b"];
    const { result } = renderHook(() => useSeriesToggle(keys));
    expect(result.current[0].size).toBe(0);

    act(() => result.current[1]("a"));
    expect([...result.current[0]]).toEqual(["a"]);

    // Ẩn nốt chuỗi cuối cùng → bị từ chối.
    act(() => result.current[1]("b"));
    expect([...result.current[0]]).toEqual(["a"]);

    act(() => result.current[1]("a"));
    expect(result.current[0].size).toBe(0);
  });
});
