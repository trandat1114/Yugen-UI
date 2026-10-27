/*
 * The Explore map in Web Mercator, the projection of land.ts. Map units: x from 0 (180°W) to 1000 (180°E), y from 0
 * (85°N) down to MAP.height (60°S). A view is the map point at the centre of the screen and its scale in px per unit.
 */

export interface Coords {
  lat: number;
  lng: number;
}
export interface Point {
  x: number;
  y: number;
}
export interface View extends Point {
  /** Pixels per map unit. */
  k: number;
}
export interface Size {
  width: number;
  height: number;
}
/** Room taken by the floating bars at each edge (px): fitted pins stay out of it. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const mercatorY = (lat: number) => (0.5 - mercator(lat) / (2 * Math.PI)) * 1000;
const TOP = mercatorY(85);

export const MAP = {
  width: 1000,
  height: mercatorY(-60) - TOP,
  /** Path units per map unit in LAND. */
  pathScale: 20,
  /** Below this scale (px per unit) the coarse land is drawn: the difference stays under a pixel. */
  coarseBelow: 2,
};

/** Closest zoom (px per unit, about 130px per degree), the closest a fit goes, and the factor of the zoom buttons. */
export const ZOOM = { max: 48, fit: 28, step: 2 };

export function project({ lat, lng }: Coords): Point {
  return { x: ((lng + 180) / 360) * MAP.width, y: mercatorY(lat) - TOP };
}

/** Where a map point is on the screen. */
export function toScreen(view: View, size: Size, point: Point): Point {
  return { x: (point.x - view.x) * view.k + size.width / 2, y: (point.y - view.y) * view.k + size.height / 2 };
}

/** The map point under a screen point. */
export function toMap(view: View, size: Size, point: Point): Point {
  return { x: view.x + (point.x - size.width / 2) / view.k, y: view.y + (point.y - size.height / 2) / view.k };
}

/** Farthest zoom: the whole map with water around it, so trips far apart still fit beside the bars. */
export const minScale = (size: Size) => 0.6 * Math.min(size.width / MAP.width, size.height / MAP.height);

/**
 * Scale within the limits, and the middle of the screen over the map. Past the edges there is water (and, east and west,
 * the land again), so the map does not have to cover the screen.
 */
export function clampView(view: View, size: Size): View {
  const k = Math.min(ZOOM.max, Math.max(minScale(size), view.k));
  return { k, x: Math.min(MAP.width, Math.max(0, view.x)), y: Math.min(MAP.height, Math.max(0, view.y)) };
}

/** The view that shows every point inside the room the bars leave free. */
export function fitView(points: Point[], size: Size, insets: Insets): View {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const box = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
  const room = {
    width: Math.max(1, size.width - insets.left - insets.right),
    height: Math.max(1, size.height - insets.top - insets.bottom),
  };
  const k = Math.min(ZOOM.fit, room.width / (box.right - box.left || 1e-6), room.height / (box.bottom - box.top || 1e-6));
  // The middle of the points goes to the middle of the free room, not of the screen.
  const shift = { x: insets.left + room.width / 2 - size.width / 2, y: insets.top + room.height / 2 - size.height / 2 };
  return clampView(
    { k, x: (box.left + box.right) / 2 - shift.x / k, y: (box.top + box.bottom) / 2 - shift.y / k },
    size,
  );
}

/** Zoom by `factor`, keeping the map point under `anchor` (screen px, the centre by default) in place. */
export function zoomView(view: View, size: Size, factor: number, anchor?: Point): View {
  const a = anchor ?? { x: size.width / 2, y: size.height / 2 };
  return pinchView(size, toMap(view, size, a), a, view.k * factor);
}

/** The view at scale `k` where the map point `point` sits under the screen point `at` (pinch and wheel zoom). */
export function pinchView(size: Size, point: Point, at: Point, k: number): View {
  const scale = Math.min(ZOOM.max, Math.max(minScale(size), k));
  return clampView({ k: scale, x: point.x - (at.x - size.width / 2) / scale, y: point.y - (at.y - size.height / 2) / scale }, size);
}

/**
 * The path between two views that feels shortest (van Wijk and Nuij, "Smooth and efficient zooming and panning", as in
 * d3-interpolate's interpolateZoom): far apart, it zooms out on the way and back in. `at(t)` for t from 0 to 1; `length`
 * grows with the distance and the change of scale, to set the duration.
 */
export function flight(from: View, to: View, size: Size): { at: (t: number) => View; length: number } {
  const rho = Math.SQRT2;
  const screen = Math.max(size.width, size.height);
  const w0 = screen / from.k;
  const w1 = screen / to.k;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d2 = dx * dx + dy * dy;
  const view = (x: number, y: number, w: number): View => ({ x, y, k: screen / w });
  if (d2 < 1e-12) {
    const length = Math.log(w1 / w0) / rho;
    return { length: Math.abs(length), at: (t) => view(from.x + t * dx, from.y + t * dy, w0 * Math.exp(rho * t * length)) };
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho ** 4 * d2) / (2 * w0 * rho ** 2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho ** 4 * d2) / (2 * w1 * rho ** 2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const length = (r1 - r0) / rho;
  return {
    length,
    at(t) {
      const s = t * length;
      const u = (w0 / (rho ** 2 * d1)) * (Math.cosh(r0) * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return view(from.x + u * dx, from.y + u * dy, (w0 * Math.cosh(r0)) / Math.cosh(rho * s + r0));
    },
  };
}

/**
 * Pins closer than `distance` px on the screen join into one group, placed at their average, so they never cover each
 * other. Greedy, in the order given.
 */
export function groupPins<T extends { at: Point }>(pins: T[], distance: number): { at: Point; pins: T[] }[] {
  const groups: { at: Point; pins: T[] }[] = [];
  for (const pin of pins) {
    const group = groups.find((g) => Math.hypot(g.at.x - pin.at.x, g.at.y - pin.at.y) < distance);
    if (!group) {
      groups.push({ at: pin.at, pins: [pin] });
      continue;
    }
    group.pins.push(pin);
    const n = group.pins.length;
    group.at = { x: group.at.x + (pin.at.x - group.at.x) / n, y: group.at.y + (pin.at.y - group.at.y) / n };
  }
  return groups;
}
