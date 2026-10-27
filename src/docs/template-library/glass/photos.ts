// Sample photos. Nature: Unsplash License (https://unsplash.com/license), picked from the Lorem Picsum list. Japan:
// Wikimedia Commons, CC BY or public domain (license next to each one). AVIF at 640 and 1280px wide, cropped to 16:10;
// every browser Yugen UI supports decodes AVIF. Replace them with your own and keep the credits in README.md.
import chidorigafuchi1280 from "./photos/chidorigafuchi-1280.avif";
import chidorigafuchi640 from "./photos/chidorigafuchi-640.avif";
import coastCliff1280 from "./photos/coast-cliff-1280.avif";
import coastCliff640 from "./photos/coast-cliff-640.avif";
import forestRiver1280 from "./photos/forest-river-1280.avif";
import forestRiver640 from "./photos/forest-river-640.avif";
import gionWeeping1280 from "./photos/gion-weeping-1280.avif";
import gionWeeping640 from "./photos/gion-weeping-640.avif";
import hirosakiBridge1280 from "./photos/hirosaki-bridge-1280.avif";
import hirosakiBridge640 from "./photos/hirosaki-bridge-640.avif";
import hirosakiNight1280 from "./photos/hirosaki-night-1280.avif";
import hirosakiNight640 from "./photos/hirosaki-night-640.avif";
import hirosakiPetals1280 from "./photos/hirosaki-petals-1280.avif";
import hirosakiPetals640 from "./photos/hirosaki-petals-640.avif";
import islandTown1280 from "./photos/island-town-1280.avif";
import islandTown640 from "./photos/island-town-640.avif";
import kawaguchikoFuji1280 from "./photos/kawaguchiko-fuji-1280.avif";
import kawaguchikoFuji640 from "./photos/kawaguchiko-fuji-640.avif";
import kiyomizuNight1280 from "./photos/kiyomizu-night-1280.avif";
import kiyomizuNight640 from "./photos/kiyomizu-night-640.avif";
import kyotoGate1280 from "./photos/kyoto-gate-1280.avif";
import kyotoGate640 from "./photos/kyoto-gate-640.avif";
import meguroRiver1280 from "./photos/meguro-river-1280.avif";
import meguroRiver640 from "./photos/meguro-river-640.avif";
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
import uruiRiver1280 from "./photos/urui-river-1280.avif";
import uruiRiver640 from "./photos/urui-river-640.avif";
import waterfall1280 from "./photos/waterfall-1280.avif";
import waterfall640 from "./photos/waterfall-640.avif";

export interface Photo {
  small: string;
  large: string;
  author: string;
  /** Page of the photo (Unsplash or Wikimedia Commons). */
  source: string;
  license: string;
}

export const PHOTOS = {
  // Japan, Wikimedia Commons.
  kyotoGate: { small: kyotoGate640, large: kyotoGate1280, author: "rumpleteaser", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:A_temple_gate_in_Kyoto_(2392178284).jpg" },
  gionWeeping: { small: gionWeeping640, large: gionWeeping1280, author: "Raita Futo", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Giant_Gion_weeping_sakura_(51472103367).jpg" },
  kiyomizuNight: { small: kiyomizuNight640, large: kiyomizuNight1280, author: "Raita Futo", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Kiyomizu-dera_sakura_light-up_(51472868756).jpg" },
  hirosakiBridge: { small: hirosakiBridge640, large: hirosakiBridge1280, author: "mko294", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Aomori-Hirosaki_Cherry_Blossom_Festival-xl.jpg" },
  hirosakiPetals: { small: hirosakiPetals640, large: hirosakiPetals1280, author: "mko294", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Aomori-Cherry_carpetHirosaki_Cherry_Blossom-xl.jpg" },
  hirosakiNight: { small: hirosakiNight640, large: hirosakiNight1280, author: "mko294", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Aomori-HirosakiParkCherry_Blossoms_Festival-xl.jpg" },
  kawaguchikoFuji: { small: kawaguchikoFuji640, large: kawaguchikoFuji1280, author: "Midori", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Lake_Kawaguchiko_Sakura_Mount_Fuji_1.JPG" },
  uruiRiver: { small: uruiRiver640, large: uruiRiver1280, author: "Mocchy", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Uruigawa_Sakura.jpg" },
  chidorigafuchi: { small: chidorigafuchi640, large: chidorigafuchi1280, author: "Guilhem Vellut", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Cherry_blossoms_@_Moat_@_Chidorigafuchi_@_Imperial_palace_(13621559605).jpg" },
  meguroRiver: { small: meguroRiver640, large: meguroRiver1280, author: "Guilhem Vellut", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Cherry_blossoms_@_Meguro_River_(13592693115).jpg" },
  // Nature, Unsplash.
  coastCliff: { small: coastCliff640, large: coastCliff1280, author: "Yoni Kaplan-Nadel", license: "Unsplash License", source: "https://unsplash.com/photos/iJnZwLBOB1I" },
  islandTown: { small: islandTown640, large: islandTown1280, author: "Margaret Barley", license: "Unsplash License", source: "https://unsplash.com/photos/Qo51KwK1dKg" },
  snowRidge: { small: snowRidge640, large: snowRidge1280, author: "Go Wild", license: "Unsplash License", source: "https://unsplash.com/photos/V0yAek6BgGk" },
  paintedHills: { small: paintedHills640, large: paintedHills1280, author: "Jeffrey Kam", license: "Unsplash License", source: "https://unsplash.com/photos/Nzw3HHsNHYU" },
  forestRiver: { small: forestRiver640, large: forestRiver1280, author: "Jerry Adney", license: "Unsplash License", source: "https://unsplash.com/photos/_WiFMBRT7Aw" },
  mistyValley: { small: mistyValley640, large: mistyValley1280, author: "Paul Jarvis", license: "Unsplash License", source: "https://unsplash.com/photos/Cm7oKel-X2Q" },
  pebbleBeach: { small: pebbleBeach640, large: pebbleBeach1280, author: "Paul Jarvis", license: "Unsplash License", source: "https://unsplash.com/photos/3MtiSMdnoCo" },
  waterfall: { small: waterfall640, large: waterfall1280, author: "Paul Jarvis", license: "Unsplash License", source: "https://unsplash.com/photos/NYDo21ssGao" },
  pineCoast: { small: pineCoast640, large: pineCoast1280, author: "Paul Jarvis", license: "Unsplash License", source: "https://unsplash.com/photos/6J--NXulQCs" },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
