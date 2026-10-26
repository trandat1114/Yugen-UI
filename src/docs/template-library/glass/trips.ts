import type { PhotoKey } from "./photos";

export type Category = "coast" | "mountains" | "desert" | "forest";

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
  /** Position of the pin on the Explore picture, in percent. */
  pin: { x: number; y: number };
}

export const TRIPS: Trip[] = [
  { id: "headland", category: "coast", photos: ["coastCliff", "pineCoast", "pebbleBeach"], start: "2026-06-12", days: 4, distanceKm: 46, pin: { x: 16, y: 58 } },
  { id: "island", category: "coast", photos: ["islandTown", "pebbleBeach", "coastCliff"], start: "2026-05-02", days: 6, distanceKm: 31, pin: { x: 32, y: 40 } },
  { id: "ridge", category: "mountains", photos: ["snowRidge", "mistyValley", "waterfall"], start: "2026-02-20", days: 5, distanceKm: 58, pin: { x: 54, y: 26 } },
  { id: "hills", category: "desert", photos: ["paintedHills", "coastCliff", "snowRidge"], start: "2025-10-08", days: 3, distanceKm: 72, pin: { x: 70, y: 52 } },
  { id: "river", category: "forest", photos: ["forestRiver", "waterfall", "mistyValley"], start: "2025-08-15", days: 4, distanceKm: 38, pin: { x: 44, y: 68 } },
  { id: "valley", category: "forest", photos: ["mistyValley", "forestRiver", "pineCoast"], start: "2025-04-04", days: 2, distanceKm: 24, pin: { x: 82, y: 34 } },
];

export function findTrip(id: string) {
  return TRIPS.find((trip) => trip.id === id);
}
