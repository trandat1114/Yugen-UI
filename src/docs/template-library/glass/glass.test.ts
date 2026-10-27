import { describe, expect, it } from "vitest";
import en from "./content/en";
import vi from "./content/vi";
import { LAND, LAND_COARSE } from "./land";
import { clampView, fitView, flight, groupPins, MAP, pinchView, project, toMap, toScreen, ZOOM, zoomView } from "./map";
import { PHOTOS } from "./photos";
import { parsePath, pathOf } from "./router";
import { searchTrips } from "./SearchDialog";
import { TRIPS } from "./trips";

describe("glass template", () => {
  it("router: path ⇄ route, trailing slash, unknown paths", () => {
    for (const route of [{ name: "home" }, { name: "explore" }, { name: "settings" }, { name: "trip", id: "ridge" }] as const) {
      expect(parsePath(pathOf(route))).toEqual(route);
    }
    expect(parsePath("/explore/")).toEqual({ name: "explore" });
    expect(parsePath("/trips/ridge/photos")).toEqual({ name: "notFound" });
    expect(parsePath("/nowhere")).toEqual({ name: "notFound" });
  });

  it("every trip has text in both languages and existing photos", () => {
    for (const trip of TRIPS) {
      for (const t of [en, vi]) expect(t.trips[trip.id], `${t.lang} ${trip.id}`).toBeTruthy();
      for (const key of trip.photos) expect(PHOTOS[key], key).toBeTruthy();
    }
    expect(Object.keys(vi.trips).sort()).toEqual(Object.keys(en.trips).sort());
  });

  it("search: every word, ignoring case and Vietnamese accents", () => {
    expect(searchTrips(en, "SNOW ridge").map((t) => t.id)).toEqual(["ridge"]);
    expect(searchTrips(vi, "thac nuoc").map((t) => t.id)).toEqual(["ridge"]);
    expect(searchTrips(en, "coast").map((t) => t.id)).toEqual(["headland", "island"]);
    expect(searchTrips(en, "")).toHaveLength(TRIPS.length);
    expect(searchTrips(en, "zzz")).toHaveLength(0);
    expect(searchTrips(vi, "hoa anh dao").map((t) => t.id)).toEqual(["hirosaki", "fuji", "kyoto", "tokyo"]);
    expect(searchTrips(en, "cherry blossoms kyoto").map((t) => t.id)).toEqual(["kyoto"]);
  });

  it("photos: every one has a license and a source page", () => {
    for (const [key, photo] of Object.entries(PHOTOS)) {
      expect(photo.license, key).toMatch(/^(Unsplash License|CC BY [234]\.0|Public domain)$/);
      expect(photo.source, key).toMatch(/^https:\/\/(unsplash\.com\/photos|commons\.wikimedia\.org\/wiki\/File:)/);
    }
  });

  it("map: Web Mercator, north up, east to the right", () => {
    expect(project({ lat: 0, lng: -180 }).x).toBeCloseTo(0);
    expect(project({ lat: 0, lng: 180 }).x).toBeCloseTo(MAP.width);
    expect(project({ lat: 85, lng: 0 }).y).toBeCloseTo(0);
    expect(project({ lat: -60, lng: 0 }).y).toBeCloseTo(MAP.height);
    const at = (id: string) => project(TRIPS.find((trip) => trip.id === id)!.coords);
    // Tokyo is east of Kyoto, Hirosaki north of Tokyo; one degree of longitude is 1000 / 360 units.
    expect(at("tokyo").x - at("kyoto").x).toBeCloseTo(((139.7447 - 135.7808) * 1000) / 360);
    expect(at("hirosaki").y).toBeLessThan(at("tokyo").y);
    for (const trip of TRIPS) {
      const { x, y } = project(trip.coords);
      expect(x, trip.id).toBeGreaterThan(0);
      expect(x, trip.id).toBeLessThan(MAP.width);
      expect(y, trip.id).toBeGreaterThan(0);
      expect(y, trip.id).toBeLessThan(MAP.height);
    }
    // Land: absolute moveto then relative lines, every ring closed, inside the map (path units); the coarse one is lighter.
    for (const land of [LAND, LAND_COARSE]) {
      expect(land).toMatch(/^(M\d+ \d+l[-\d ]+z)+$/);
      for (const [, x, y] of land.matchAll(/M(\d+) (\d+)/g)) {
        expect(Number(x)).toBeLessThanOrEqual(MAP.width * MAP.pathScale);
        expect(Number(y)).toBeLessThanOrEqual(MAP.height * MAP.pathScale);
      }
    }
    expect(LAND_COARSE.length).toBeLessThan(LAND.length / 4);
  });

  it("map: the fitted view shows every pin inside the room left by the bars", () => {
    const size = { width: 1024, height: 700 };
    const insets = { top: 90, right: 40, bottom: 110, left: 300 };
    for (const ids of [TRIPS.map((trip) => trip.id), ["kyoto", "fuji", "tokyo", "hirosaki"], ["ridge"]]) {
      const points = ids.map((id) => project(TRIPS.find((trip) => trip.id === id)!.coords));
      const view = fitView(points, size, insets);
      expect(view.k, ids.join()).toBeLessThanOrEqual(ZOOM.fit);
      for (const point of points) {
        const { x, y } = toScreen(view, size, point);
        expect(x, ids.join()).toBeGreaterThanOrEqual(insets.left - 0.5);
        expect(x, ids.join()).toBeLessThanOrEqual(size.width - insets.right + 0.5);
        expect(y, ids.join()).toBeGreaterThanOrEqual(insets.top - 0.5);
        expect(y, ids.join()).toBeLessThanOrEqual(size.height - insets.bottom + 0.5);
      }
    }
  });

  it("map: zoom keeps the point under the pointer, within the limits", () => {
    const size = { width: 800, height: 600 };
    const view = { x: 500, y: 300, k: 4 };
    const anchor = { x: 200, y: 450 };
    const before = { x: view.x + (anchor.x - 400) / view.k, y: view.y + (anchor.y - 300) / view.k };
    const zoomed = zoomView(view, size, 2, anchor);
    expect(zoomed.k).toBe(8);
    expect(toScreen(zoomed, size, before).x).toBeCloseTo(anchor.x);
    expect(toScreen(zoomed, size, before).y).toBeCloseTo(anchor.y);
    expect(zoomView(view, size, 1000).k).toBe(ZOOM.max);
    // Never further out than the whole map with water around it; the middle of the screen stays over the map.
    expect(clampView({ x: -50, y: 9999, k: 0.01 }, size)).toEqual({
      k: 0.6 * Math.min(size.width / MAP.width, size.height / MAP.height),
      x: 0,
      y: MAP.height,
    });
  });

  it("map: pinch keeps the map point under the fingers; a flight starts and ends on the views", () => {
    const size = { width: 800, height: 600 };
    const view = { x: 500, y: 300, k: 2 };
    const point = toMap(view, size, { x: 100, y: 100 });
    const pinched = pinchView(size, point, { x: 300, y: 250 }, 6);
    expect(pinched.k).toBe(6);
    expect(toScreen(pinched, size, point).x).toBeCloseTo(300);
    expect(toScreen(pinched, size, point).y).toBeCloseTo(250);

    const to = { x: 880, y: 250, k: 26 };
    for (const target of [to, { ...view, k: 8 }]) {
      const path = flight(view, target, size);
      expect(path.length).toBeGreaterThan(0);
      for (const key of ["x", "y", "k"] as const) {
        expect(path.at(0)[key]).toBeCloseTo(view[key], 6);
        expect(path.at(1)[key]).toBeCloseTo(target[key], 6);
      }
    }
    // Far apart, the path zooms out on the way.
    const far = flight({ x: 100, y: 300, k: 20 }, { x: 900, y: 300, k: 20 }, size);
    expect(far.at(0.5).k).toBeLessThan(20);
  });

  it("map: pins closer than the gap join, the others stay apart", () => {
    const groups = groupPins(
      [
        { id: "a", at: { x: 100, y: 100 } },
        { id: "b", at: { x: 120, y: 110 } },
        { id: "c", at: { x: 300, y: 100 } },
      ],
      44,
    );
    expect(groups.map((g) => g.pins.map((p) => p.id))).toEqual([["a", "b"], ["c"]]);
    expect(groups[0].at).toEqual({ x: 110, y: 105 });
  });
});
