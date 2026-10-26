// Sample photos: Unsplash License (https://unsplash.com/license), picked from the Lorem Picsum list. AVIF at 640 and
// 1280px wide; every browser Yugen UI supports decodes AVIF. Replace them with your own and keep the credits in README.md.
import coastCliff1280 from "./photos/coast-cliff-1280.avif";
import coastCliff640 from "./photos/coast-cliff-640.avif";
import forestRiver1280 from "./photos/forest-river-1280.avif";
import forestRiver640 from "./photos/forest-river-640.avif";
import islandTown1280 from "./photos/island-town-1280.avif";
import islandTown640 from "./photos/island-town-640.avif";
import mistyValley1280 from "./photos/misty-valley-1280.avif";
import mistyValley640 from "./photos/misty-valley-640.avif";
import paintedHills1280 from "./photos/painted-hills-1280.avif";
import paintedHills640 from "./photos/painted-hills-640.avif";
import pebbleBeach1280 from "./photos/pebble-beach-1280.avif";
import pebbleBeach640 from "./photos/pebble-beach-640.avif";
import pineCoast1280 from "./photos/pine-coast-1280.avif";
import pineCoast640 from "./photos/pine-coast-640.avif";
import snowRidge1280 from "./photos/snow-ridge-1280.avif";
import snowRidge640 from "./photos/snow-ridge-640.avif";
import waterfall1280 from "./photos/waterfall-1280.avif";
import waterfall640 from "./photos/waterfall-640.avif";

export interface Photo {
  small: string;
  large: string;
  author: string;
  /** Page of the photo on Unsplash. */
  source: string;
}

export const PHOTOS = {
  coastCliff: { small: coastCliff640, large: coastCliff1280, author: "Yoni Kaplan-Nadel", source: "https://unsplash.com/photos/iJnZwLBOB1I" },
  islandTown: { small: islandTown640, large: islandTown1280, author: "Margaret Barley", source: "https://unsplash.com/photos/Qo51KwK1dKg" },
  snowRidge: { small: snowRidge640, large: snowRidge1280, author: "Go Wild", source: "https://unsplash.com/photos/V0yAek6BgGk" },
  paintedHills: { small: paintedHills640, large: paintedHills1280, author: "Jeffrey Kam", source: "https://unsplash.com/photos/Nzw3HHsNHYU" },
  forestRiver: { small: forestRiver640, large: forestRiver1280, author: "Jerry Adney", source: "https://unsplash.com/photos/_WiFMBRT7Aw" },
  mistyValley: { small: mistyValley640, large: mistyValley1280, author: "Paul Jarvis", source: "https://unsplash.com/photos/Cm7oKel-X2Q" },
  pebbleBeach: { small: pebbleBeach640, large: pebbleBeach1280, author: "Paul Jarvis", source: "https://unsplash.com/photos/3MtiSMdnoCo" },
  waterfall: { small: waterfall640, large: waterfall1280, author: "Paul Jarvis", source: "https://unsplash.com/photos/NYDo21ssGao" },
  pineCoast: { small: pineCoast640, large: pineCoast1280, author: "Paul Jarvis", source: "https://unsplash.com/photos/6J--NXulQCs" },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
