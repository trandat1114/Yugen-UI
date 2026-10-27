import type { Coords } from "./map";
import type { PhotoKey } from "./photos";

export type Category = "sakura" | "coast" | "mountains" | "desert" | "forest";

/** The language-independent part of a trip; titles and stories are in `content/<lang>.ts`, keyed by `id`. */
export interface Trip {
  id: string;
  category: Category;
  /** Cover photo, then the gallery. */
  photos: PhotoKey[];
  /** Start date (ISO) and length in days. */
  start: string;
  days: number;
  distanceKm: number;
  /** Where the pin goes on the Explore map, in degrees (north and east are positive). */
  coords: Coords;
}

export const TRIPS: Trip[] = [
  { id: "headland", category: "coast", photos: ["coastCliff", "pineCoast", "pebbleBeach"], start: "2026-06-12", days: 4, distanceKm: 46, coords: { lat: 37.5978, lng: -8.8164 } },
  { id: "island", category: "coast", photos: ["islandTown", "pebbleBeach", "coastCliff"], start: "2026-05-02", days: 6, distanceKm: 31, coords: { lat: 36.4167, lng: 25.4333 } },
  { id: "hirosaki", category: "sakura", photos: ["hirosakiBridge", "hirosakiPetals", "hirosakiNight"], start: "2026-04-24", days: 3, distanceKm: 9, coords: { lat: 40.6078, lng: 140.4639 } },
  { id: "fuji", category: "sakura", photos: ["kawaguchikoFuji", "uruiRiver"], start: "2026-04-12", days: 3, distanceKm: 26, coords: { lat: 35.524, lng: 138.7395 } },
  { id: "kyoto", category: "sakura", photos: ["kyotoGate", "gionWeeping", "kiyomizuNight"], start: "2026-04-03", days: 4, distanceKm: 22, coords: { lat: 35.0036, lng: 135.7808 } },
  { id: "tokyo", category: "sakura", photos: ["chidorigafuchi", "meguroRiver"], start: "2026-03-27", days: 2, distanceKm: 14, coords: { lat: 35.6906, lng: 139.7447 } },
  { id: "ridge", category: "mountains", photos: ["snowRidge", "mistyValley", "waterfall"], start: "2026-02-20", days: 5, distanceKm: 58, coords: { lat: 49.1953, lng: 20.2133 } },
  { id: "hills", category: "desert", photos: ["paintedHills", "coastCliff", "snowRidge"], start: "2025-10-08", days: 3, distanceKm: 72, coords: { lat: 36.4203, lng: -116.81 } },
  { id: "river", category: "forest", photos: ["forestRiver", "waterfall", "mistyValley"], start: "2025-08-15", days: 4, distanceKm: 38, coords: { lat: 47.953, lng: -123.835 } },
  { id: "valley", category: "forest", photos: ["mistyValley", "forestRiver", "pineCoast"], start: "2025-04-04", days: 2, distanceKm: 24, coords: { lat: 46.355, lng: 13.75 } },
];

export function findTrip(id: string) {
  return TRIPS.find((trip) => trip.id === id);
}
