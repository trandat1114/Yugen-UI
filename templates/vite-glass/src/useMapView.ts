import * as React from "react";
import { LAND_COARSE } from "./land";
import {
  clampView,
  fitView,
  flight,
  groupPins,
  MAP,
  pinchView,
  project,
  toMap,
  toScreen,
  zoomView,
  ZOOM,
  type Insets,
  type Point,
  type Size,
  type View,
} from "./map";
import type { Trip } from "./trips";

/** Pins closer than this (px) join into one that zooms in on them. */
const PIN_GAP = 44;
/** Space between the fitted pins and the bars (px), half a pin included. */
const PIN_ROOM = 28;
/** Duration of a flight: per unit of its length, within limits (ms). */
const FLIGHT = { perUnit: 320, min: 280, max: 900 };
/** After a drag: the speed (px/ms) from which the map keeps gliding, and how fast it slows down (ms). */
const GLIDE = { minSpeed: 0.15, decay: 325 };
/**
 * The land is drawn on a canvas this much bigger than the screen on each side (a fraction of it), then moved with a
 * transform, which the compositor does without drawing again. It is drawn anew when a move would show its edge, when the
 * scale has changed by more than RESCALE (sharp again), and when the map comes to rest.
 */
export const OVERSCAN = 0.2;
const RESCALE = 2;
/** How far ahead a flight draws the land when it has to draw it again (ms). */
const LOOKAHEAD = 150;

const easeInOut = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);

// Each parsed once: a canvas fills a Path2D in one pass, where an SVG this size is drawn again for every tile of the
// screen. The detailed land (60 kB gzip) is a separate chunk, fetched when the browser is idle or the map zooms in; the
// coarse land stands in until it arrives.
let coarse: Path2D | null = null;
let fine: Path2D | null = null;
let detail: Promise<void> | null = null;
const loadDetail = () =>
  (detail ??= import("./land-detail").then(({ LAND }) => {
    fine = new Path2D(LAND);
  }));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

interface Screen {
  size: Size;
  insets: Insets;
}

export interface PinGroup {
  /** Ids of the trips in the group. */
  key: string;
  trips: Trip[];
}

export interface MapViewOptions {
  /** "always": the wheel zooms (a full-screen map). "ctrl": only with Ctrl or a trackpad pinch, so the page scrolls. */
  wheel: "always" | "ctrl";
  /** A drag, a zoom or a flight starts (close what floats over the map). */
  onMoveStart?: () => void;
}

/**
 * The map of the Explore page. While it moves, every frame goes straight to the DOM: a transform on the land (drawn
 * again only now and then, see OVERSCAN) and on each pin. React renders again only when pins join or split, and at rest
 * (`view`, for the zoom buttons). The view fits `trips` when they change, and again on resize until the map is moved.
 */
export function useMapView(trips: Trip[], { wheel, onMoveStart }: MapViewOptions) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pinEls = React.useRef(new Map<string, HTMLElement>());

  const [screen, setScreen] = React.useState<Screen | null>(null);
  // Pin groups live outside React state: only <MapPins> renders again when pins join or split, not the page.
  const pins = React.useMemo(() => {
    let groups: PinGroup[] = [];
    const listeners = new Set<() => void>();
    return {
      get: () => groups,
      set(next: PinGroup[]) {
        groups = next;
        listeners.forEach((listener) => listener());
      },
      subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  }, []);
  const [view, setView] = React.useState<View | null>(null);

  const screenRef = React.useRef<Screen | null>(null);
  const tripsRef = React.useRef(trips);
  const live = React.useRef<View | null>(null);
  /** The view the land was last drawn for. */
  const drawn = React.useRef<View | null>(null);
  const placed = React.useRef<{ key: string; at: Point }[]>([]);
  const frame = React.useRef(0);
  const queued = React.useRef(0);
  const settleTimer = React.useRef(0);
  const moved = React.useRef(false);
  const fitted = React.useRef<string | null>(null);
  const onMoveStartRef = React.useRef(onMoveStart);
  onMoveStartRef.current = onMoveStart;

  const placePins = React.useCallback(() => {
    for (const { key, at } of placed.current) {
      const el = pinEls.current.get(key);
      if (el) el.style.transform = `translate(${at.x}px, ${at.y}px)`;
    }
  }, []);

  /**
   * Draw the land for `next` on the bigger-than-screen canvas, coarse or detailed, repeated east and west where it shows,
   * in the colors of the canvas's `color` (land) and `border-color` (coast), so they follow the theme.
   */
  const drawLand = React.useCallback((next: View) => {
    const current = screenRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!current || !canvas || !ctx) return;
    drawn.current = next;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = current.size.width * (1 + 2 * OVERSCAN);
    const height = current.size.height * (1 + 2 * OVERSCAN);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    canvas.style.transform = "";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Path units to canvas pixels; `left` and `top`: the map point at the corner of the canvas.
    const scale = (next.k * dpr) / MAP.pathScale;
    const left = (next.x - width / 2 / next.k) * MAP.pathScale;
    const top = (next.y - height / 2 / next.k) * MAP.pathScale;
    const span = (width / next.k) * MAP.pathScale;
    const world = MAP.width * MAP.pathScale;
    const wantsDetail = next.k >= MAP.coarseBelow;
    if (wantsDetail && !fine) void loadDetail().then(() => live.current && drawLand(live.current));
    const land = wantsDetail && fine ? fine : (coarse ??= new Path2D(LAND_COARSE));
    const style = getComputedStyle(canvas);
    ctx.fillStyle = style.color;
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = dpr / scale; // 1 CSS pixel at every zoom
    for (const offset of [-world, 0, world]) {
      if (left + span < offset || left > offset + world) continue;
      ctx.setTransform(scale, 0, 0, scale, (offset - left) * scale, -top * scale);
      ctx.fill(land, "evenodd");
      ctx.stroke(land);
    }
  }, []);

  /** Show `next` by moving the land drawn last; false when that land would not cover the screen or be too blurry. */
  const moveLand = React.useCallback((next: View) => {
    const current = screenRef.current;
    const base = drawn.current;
    if (!current || !base || !canvasRef.current) return false;
    const scale = next.k / base.k;
    const shift = { x: (base.x - next.x) * next.k, y: (base.y - next.y) * next.k };
    // How far the drawn land can move before its edge shows, on each axis.
    const room = (screen: number) => (screen / 2) * ((1 + 2 * OVERSCAN) * scale - 1);
    if (scale > RESCALE || Math.abs(shift.x) > room(current.size.width) || Math.abs(shift.y) > room(current.size.height)) return false;
    canvasRef.current.style.transform = `translate(${shift.x}px, ${shift.y}px) scale(${scale})`;
    return true;
  }, []);

  /**
   * One frame: move the land drawn last or draw it again, place the pins. A flight passes `ahead`, where it will be a
   * moment later: drawing for that view first lasts more frames before the next redraw.
   */
  const draw = React.useCallback(
    (next: View, ahead?: View) => {
      const current = screenRef.current;
      if (!current) return;
      live.current = next;
      if (!moveLand(next)) {
        drawLand(ahead ?? next);
        if (ahead && !moveLand(next)) drawLand(next);
      }

      const found = groupPins(
        tripsRef.current.map((trip) => ({ trip, at: toScreen(next, current.size, project(trip.coords)) })),
        PIN_GAP,
      ).map((group) => ({ key: group.pins.map((pin) => pin.trip.id).join(" "), at: group.at, trips: group.pins.map((pin) => pin.trip) }));
      const changed = found.length !== placed.current.length || found.some((group, i) => group.key !== placed.current[i].key);
      placed.current = found;
      if (changed) pins.set(found.map(({ key, trips: list }) => ({ key, trips: list })));
      placePins();
    },
    [placePins, drawLand, moveLand, pins],
  );


  const stop = () => {
    cancelAnimationFrame(frame.current);
    clearTimeout(settleTimer.current);
  };
  /** At rest: the land sharp for the final view, and the view for the buttons. */
  const settle = () => {
    if (!live.current) return;
    if (drawn.current !== live.current) drawLand(live.current);
    setView(live.current);
  };
  /** For events that come faster than frames (pointer, wheel): keep the newest view, draw once per frame. */
  const drawSoon = (next: View) => {
    live.current = next;
    if (queued.current) return;
    queued.current = requestAnimationFrame(() => {
      queued.current = 0;
      if (live.current) draw(live.current);
    });
  };

  const flyTo = (target: View, { instant = false, duration }: { instant?: boolean; duration?: number } = {}) => {
    stop();
    onMoveStartRef.current?.();
    const current = screenRef.current;
    const from = live.current;
    if (!current) return;
    if (instant || !from || reducedMotion()) {
      draw(target);
      settle();
      return;
    }
    const path = flight(from, target, current.size);
    const ms = duration ?? Math.min(FLIGHT.max, Math.max(FLIGHT.min, path.length * FLIGHT.perUnit));
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      draw(p < 1 ? path.at(easeInOut(p)) : target, p < 1 ? path.at(easeInOut(Math.min(1, p + LOOKAHEAD / ms))) : undefined);
      if (p < 1) frame.current = requestAnimationFrame(step);
      else settle();
    };
    frame.current = requestAnimationFrame(step);
  };

  /** Keep moving after a drag, slowing down like a sheet on a table. `velocity` in px per ms. */
  const glide = (velocity: Point) => {
    let { x: vx, y: vy } = velocity;
    let last = performance.now();
    const step = (now: number) => {
      const current = screenRef.current;
      const from = live.current;
      if (!current || !from) return;
      const dt = Math.min(64, now - last);
      last = now;
      const decay = Math.exp(-dt / GLIDE.decay);
      // Distance covered during dt while the speed decays exponentially.
      const dx = vx * GLIDE.decay * (1 - decay);
      const dy = vy * GLIDE.decay * (1 - decay);
      vx *= decay;
      vy *= decay;
      draw(clampView({ k: from.k, x: from.x - dx / from.k, y: from.y - dy / from.k }, current.size));
      if (Math.hypot(vx, vy) > 0.01) frame.current = requestAnimationFrame(step);
      else settle();
    };
    frame.current = requestAnimationFrame(step);
  };

  const zoomBy = (factor: number) => {
    const current = screenRef.current;
    if (!current || !live.current) return;
    moved.current = true;
    flyTo(zoomView(live.current, current.size, factor));
  };

  const fitTrips = (list: Trip[], options?: { instant?: boolean }) => {
    const current = screenRef.current;
    if (!current || !list.length) return;
    flyTo(fitView(list.map((trip) => project(trip.coords)), current.size, current.insets), options);
  };

  React.useEffect(() => {
    const parse = () => void loadDetail();
    if (typeof requestIdleCallback === "undefined") {
      const timer = setTimeout(parse, 300);
      return () => clearTimeout(timer);
    }
    const id = requestIdleCallback(parse, { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }, []);

  // A canvas does not follow CSS: draw again when the theme, brand or high contrast changes.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => live.current && drawLand(live.current));
    for (const el of new Set([document.documentElement, canvas.closest("[data-theme]")]))
      if (el) observer.observe(el, { attributes: true, attributeFilter: ["data-theme", "data-brand", "class", "style"] });
    return () => observer.disconnect();
  }, [drawLand]);

  // Measure the map and the bars over it (container queries move them); only store real changes.
  React.useLayoutEffect(() => {
    const map = mapRef.current;
    const bars = barsRef.current;
    if (!map || !bars) return;
    const measure = () => {
      const box = map.getBoundingClientRect();
      const top = bars.firstElementChild?.getBoundingClientRect();
      const bottom = bars.lastElementChild?.getBoundingClientRect();
      const style = getComputedStyle(bars);
      const next: Screen = {
        size: { width: box.width, height: box.height },
        insets: {
          top: (top ? top.bottom - box.top : 0) + PIN_ROOM,
          bottom: (bottom ? box.bottom - bottom.top : 0) + PIN_ROOM,
          left: parseFloat(style.paddingLeft) + PIN_ROOM,
          right: parseFloat(style.paddingRight) + PIN_ROOM,
        },
      };
      if (!next.size.width || !next.size.height) return;
      if (screenRef.current && JSON.stringify(screenRef.current) === JSON.stringify(next)) return;
      screenRef.current = next;
      drawn.current = null; // drawn for another size
      setScreen(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(map);
    observer.observe(bars);
    return () => observer.disconnect();
  }, []);

  React.useEffect(
    () => () => {
      stop();
      cancelAnimationFrame(queued.current);
    },
    [],
  );

  // Fit the trips when they change (a flight) or on resize (at once), unless the map was moved by hand since. Before
  // paint, so pins of the new filter never show at the old places.
  const key = trips.map((trip) => trip.id).join(" ");
  React.useLayoutEffect(() => {
    tripsRef.current = trips;
    if (!screen) return;
    const changed = fitted.current !== key;
    if (!trips.length || (!changed && moved.current)) {
      if (live.current) flyTo(clampView(live.current, screen.size), { instant: true });
      return;
    }
    fitted.current = key;
    moved.current = false;
    if (live.current) draw(live.current);
    fitTrips(trips, { instant: !live.current || !changed });
    // `trips` changes with `key`; flyTo and fitTrips only read refs.
  }, [key, screen]);

  // Wheel: zoom around the pointer. Needs a non-passive listener to keep the page from scrolling.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onWheel = (event: WheelEvent) => {
      const current = screenRef.current;
      if (!current || !live.current || (wheel === "ctrl" && !event.ctrlKey)) return;
      event.preventDefault();
      moved.current = true;
      const box = map.getBoundingClientRect();
      const at = { x: event.clientX - box.left, y: event.clientY - box.top };
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * box.height : event.deltaY;
      // A trackpad pinch sends Ctrl with small steps; a mouse wheel notch is about 100px, eased over a short flight.
      const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.003));
      if (!event.ctrlKey && Math.abs(delta) >= 50) {
        flyTo(zoomView(live.current, current.size, factor, at), { duration: 180 });
        return;
      }
      stop();
      onMoveStartRef.current?.();
      drawSoon(zoomView(live.current, current.size, factor, at));
      settleTimer.current = window.setTimeout(settle, 150);
    };
    map.addEventListener("wheel", onWheel, { passive: false });
    return () => map.removeEventListener("wheel", onWheel);
    // flyTo, drawSoon and settle only read refs.
  }, [wheel]);

  // Pointers: one drags (then glides), two pinch.
  const pointers = React.useRef(new Map<number, Point>());
  const pinch = React.useRef<{ k: number; point: Point; distance: number } | null>(null);
  const samples = React.useRef<{ t: number; x: number; y: number }[]>([]);
  const box = React.useRef<DOMRect | null>(null);
  const local = (event: React.PointerEvent | React.MouseEvent) => ({
    x: event.clientX - (box.current?.left ?? 0),
    y: event.clientY - (box.current?.top ?? 0),
  });
  const startPinch = () => {
    const current = screenRef.current;
    const [a, b] = [...pointers.current.values()];
    if (!current || !live.current || !a || !b) return;
    const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    pinch.current = { k: live.current.k, point: toMap(live.current, current.size, middle), distance: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  };

  const handlers = {
    onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if ((event.pointerType === "mouse" && event.button !== 0) || !live.current) return;
      stop();
      onMoveStartRef.current?.();
      box.current = event.currentTarget.getBoundingClientRect();
      event.currentTarget.setPointerCapture(event.pointerId);
      const at = local(event);
      pointers.current.set(event.pointerId, at);
      samples.current = [{ t: event.timeStamp, ...at }];
      if (pointers.current.size === 2) startPinch();
    },
    onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
      const before = pointers.current.get(event.pointerId);
      const current = screenRef.current;
      if (!before || !current || !live.current) return;
      const at = local(event);
      pointers.current.set(event.pointerId, at);
      moved.current = true;
      if (pointers.current.size >= 2 && pinch.current) {
        const [a, b] = [...pointers.current.values()];
        const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const scale = Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance;
        drawSoon(pinchView(current.size, pinch.current.point, middle, pinch.current.k * scale));
        return;
      }
      const { k, x, y } = live.current;
      drawSoon(clampView({ k, x: x - (at.x - before.x) / k, y: y - (at.y - before.y) / k }, current.size));
      samples.current.push({ t: event.timeStamp, ...at });
      if (samples.current.length > 8) samples.current.shift();
    },
    onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
      if (!pointers.current.delete(event.pointerId)) return;
      if (pointers.current.size === 1) {
        // From a pinch back to a drag with the finger left.
        pinch.current = null;
        const [rest] = [...pointers.current.values()];
        samples.current = [{ t: event.timeStamp, ...rest }];
        return;
      }
      if (pointers.current.size > 0) return;
      const wasPinch = pinch.current !== null;
      pinch.current = null;
      // Speed over the last 100ms of the drag; none if the pointer stopped before letting go.
      const recent = samples.current.filter((sample) => event.timeStamp - sample.t < 100);
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last && first ? last.t - first.t : 0;
      const velocity = dt > 0 ? { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt } : { x: 0, y: 0 };
      if (!wasPinch && !reducedMotion() && Math.hypot(velocity.x, velocity.y) > GLIDE.minSpeed) glide(velocity);
      else settle();
    },
    onPointerCancel(event: React.PointerEvent<HTMLDivElement>) {
      handlers.onPointerUp(event);
    },
    onDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
      const current = screenRef.current;
      if (!current || !live.current) return;
      box.current = event.currentTarget.getBoundingClientRect();
      moved.current = true;
      flyTo(zoomView(live.current, current.size, ZOOM.step, local(event)));
    },
  };

  const pinRef = (key: string) => (el: HTMLElement | null) => {
    if (el) pinEls.current.set(key, el);
    else pinEls.current.delete(key);
  };

  return { mapRef, barsRef, canvasRef, pins, pinRef, placePins, screen, view, zoomBy, fitTrips, handlers };
}

export type MapView = ReturnType<typeof useMapView>;

/** The pin groups of the map, rendered with `children`; new pins get their place before the browser paints them. */
export function MapPins({ map, children }: { map: MapView; children: (group: PinGroup) => React.ReactNode }) {
  const groups = React.useSyncExternalStore(map.pins.subscribe, map.pins.get, map.pins.get);
  React.useLayoutEffect(map.placePins);
  return groups.map(children);
}
