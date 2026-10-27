import { describe, expect, it } from "vitest";
import en from "./content/en";
import vi from "./content/vi";
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
});
