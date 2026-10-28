import * as React from "react";
import { bezelWidth, lensMap, maxShift, refractionProfile, type LensGeometry } from "./lens";

const SVG_NS = "http://www.w3.org/2000/svg";
const SELECTOR = ".glass, .glass-clear, .glass-tinted";
/** Bề mặt lớn hơn (px²) giữ glass thường: bộ lọc SVG tính lại mỗi khi nền phía sau đổi. */
const MAX_AREA = 400_000;
/** Chờ kích thước ổn định (thanh đang co giãn) trước khi tính bản đồ mới. */
const SETTLE_MS = 120;

/**
 * Chromium là engine duy nhất áp được SVG filter trong backdrop-filter; Safari và Firefox nhận cú pháp nhưng không vẽ,
 * nên kiểm bằng `navigator.userAgentData` (chỉ Chromium có).
 */
export function supportsGlassRefraction() {
  if (typeof window === "undefined" || typeof CSS === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  return !!brands?.some((b) => b.brand === "Chromium") && CSS.supports("backdrop-filter", "url(#a)");
}

/** Người dùng muốn bớt hiệu ứng: CSS đã tắt blur và khúc xạ, không cần tính bản đồ. */
function prefersPlainGlass() {
  return window.matchMedia("(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)").matches;
}

function mapUrl(geometry: LensGeometry, profile: Float32Array) {
  const canvas = document.createElement("canvas");
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.putImageData(new ImageData(lensMap(geometry, profile) as Uint8ClampedArray<ArrayBuffer>, geometry.width, geometry.height), 0, 0);
  return canvas.toDataURL("image/png");
}

/** Phần tử SVG kèm thuộc tính. */
function svgNode<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

/** Ma trận giữ màu và đặt alpha = 1: màu sau blur được chuẩn hoá ở mép vùng lọc (feColorMatrix làm việc trên màu chưa nhân alpha). */
const OPAQUE = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1";

/**
 * Một bề mặt: giữa mờ (blur như glass thường), vành sắc nét và cong theo bản đồ khúc xạ. Vùng lọc đúng bằng bề mặt (px):
 * vùng mặc định (-10%…120% của hộp bao) không khớp với backdrop của phần tử.
 */
function buildFilter(id: string, { width, height, radius }: LensGeometry, blur: number, map: string) {
  const bezel = bezelWidth({ width, height, radius });
  const box = { x: 0, y: 0, width, height };
  // Vành sắc: nét viền trắng dày ~1.2 vành nằm trên mép (nửa trong còn lại), mờ dần vào giữa.
  const rim =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    `<filter id='s'><feGaussianBlur stdDeviation='${(bezel * 0.25).toFixed(1)}'/></filter>` +
    `<rect width='${width}' height='${height}' rx='${radius}' fill='none' stroke='white' stroke-width='${(bezel * 1.2).toFixed(1)}' filter='url(%23s)'/></svg>`;
  const filter = svgNode("filter", { id, ...box, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" });
  filter.append(
    svgNode("feGaussianBlur", { in: "SourceGraphic", stdDeviation: blur, result: "blurred" }),
    svgNode("feColorMatrix", { in: "blurred", type: "matrix", values: OPAQUE, result: "frost" }),
    svgNode("feImage", { href: map, ...box, preserveAspectRatio: "none", result: "lens" }),
    svgNode("feDisplacementMap", {
      in: "SourceGraphic",
      in2: "lens",
      scale: 2 * maxShift(bezel),
      xChannelSelector: "R",
      yChannelSelector: "G",
      result: "bent",
    }),
    svgNode("feImage", { href: `data:image/svg+xml,${rim.replace(/</g, "%3C").replace(/>/g, "%3E")}`, ...box, result: "rim" }),
    svgNode("feComposite", { in: "bent", in2: "rim", operator: "in", result: "edge" }),
    svgNode("feComposite", { in: "edge", in2: "frost", operator: "over" }),
  );
  return filter;
}

let users = 0;
let stop: (() => void) | undefined;

/**
 * Theo dõi mọi phần tử .glass / .glass-clear / .glass-tinted trong trang (cả portal): mỗi kích thước + bo góc có một
 * <filter> dùng chung, gắn vào phần tử qua `--glass-lens` (utility glass đọc biến này trong backdrop-filter). Gọi nhiều
 * lần thì dùng chung một bộ theo dõi. Trả về hàm dừng.
 */
export function startGlassRefraction(): () => void {
  if (!supportsGlassRefraction() || prefersPlainGlass()) return () => {};
  users++;
  if (users === 1) stop = run();
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    users--;
    if (users === 0) {
      stop?.();
      stop = undefined;
    }
  };
}

function run() {
  const profile = refractionProfile();
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:fixed;width:0;height:0;pointer-events:none";
  document.body.appendChild(svg);

  const filters = new Map<string, { node: SVGFilterElement; count: number }>();
  const assigned = new Map<HTMLElement, string>();
  const timers = new Map<HTMLElement, number>();
  let next = 0;

  const acquire = (key: string, geometry: LensGeometry, blur: number) => {
    let entry = filters.get(key);
    if (!entry) {
      const href = mapUrl(geometry, profile);
      if (!href) return null;
      const node = buildFilter(`yugen-lens-${++next}`, geometry, blur, href);
      svg.appendChild(node);
      entry = { node, count: 0 };
      filters.set(key, entry);
    }
    entry.count++;
    return entry.node.id;
  };

  const release = (el: HTMLElement) => {
    const key = assigned.get(el);
    if (key === undefined) return;
    assigned.delete(el);
    el.style.removeProperty("--glass-lens");
    el.removeAttribute("data-glass-lens");
    const entry = filters.get(key);
    if (entry && --entry.count === 0) {
      entry.node.remove();
      filters.delete(key);
    }
  };

  const update = (el: HTMLElement) => {
    timers.delete(el);
    const width = Math.round(el.offsetWidth);
    const height = Math.round(el.offsetHeight);
    // Glass lồng trong glass không blur (index.css), nên cũng không khúc xạ.
    if (!el.isConnected || !el.matches(SELECTOR) || el.parentElement?.closest(SELECTOR) || !width || !height || width * height > MAX_AREA) {
      release(el);
      return;
    }
    const style = getComputedStyle(el);
    const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2);
    const blur = parseFloat(style.getPropertyValue("--glassBlur")) || 0;
    const key = `${width}x${height}r${Math.round(radius)}b${blur}`;
    if (assigned.get(el) === key) return;
    release(el);
    const id = acquire(key, { width, height, radius }, blur);
    if (!id) return;
    assigned.set(el, key);
    el.style.setProperty("--glass-lens", `url(#${id})`);
    el.setAttribute("data-glass-lens", "");
  };

  const schedule = (el: HTMLElement, delay = SETTLE_MS) => {
    window.clearTimeout(timers.get(el));
    timers.set(el, window.setTimeout(() => update(el), delay));
  };

  const resize = new ResizeObserver((entries) => {
    for (const entry of entries) schedule(entry.target as HTMLElement);
  });
  const watched = new Set<HTMLElement>();
  const watch = (el: HTMLElement) => {
    if (watched.has(el)) return schedule(el, 0);
    watched.add(el);
    resize.observe(el);
  };
  const unwatch = (el: HTMLElement) => {
    if (!watched.delete(el)) return;
    resize.unobserve(el);
    window.clearTimeout(timers.get(el));
    timers.delete(el);
    release(el);
  };
  const glassIn = (node: Element) => [...(node.matches(SELECTOR) ? [node] : []), ...node.querySelectorAll(SELECTOR)] as HTMLElement[];

  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        const el = record.target as HTMLElement;
        if (el.matches(SELECTOR)) watch(el);
        else unwatch(el);
        continue;
      }
      for (const node of record.removedNodes) if (node instanceof Element) for (const el of glassIn(node)) if (!el.isConnected) unwatch(el);
      for (const node of record.addedNodes) if (node instanceof Element) glassIn(node).forEach(watch);
    }
  });
  mutations.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  glassIn(document.body).forEach(watch);

  return () => {
    mutations.disconnect();
    resize.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    for (const el of [...assigned.keys()]) release(el);
    svg.remove();
  };
}

/**
 * Yugen Labs — khúc xạ ở mép mọi bề mặt glass trong trang: nền phía sau cong theo vành kính, rõ nhất trên ảnh. Đặt một
 * lần ở gốc app. Chỉ Chromium vẽ được (SVG filter trong backdrop-filter); trình duyệt khác giữ glass như cũ. Không chạy
 * khi người dùng giảm trong suốt, tăng tương phản hoặc dùng màu cưỡng bức.
 */
export function GlassRefraction() {
  React.useEffect(() => startGlassRefraction(), []);
  return null;
}
