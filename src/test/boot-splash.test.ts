// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import type { ResolvedConfig } from "vite";
import { describe, expect, it } from "vitest";
import { yugenBootSplash } from "../../vite.plugins";
import { kanji } from "../docs/boot/kanji";

/** Màn chờ của docs (#236): src/docs/boot, chèn vào index.html bởi plugin yugenBootSplash. */
const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");

type Tags = { tag: string; children: string; injectTo: string }[];

function setup(command: "serve" | "build") {
  const plugin = yugenBootSplash(root);
  const config = { command, base: "/Yugen-UI/", build: { assetsDir: "assets", ssr: false } } as unknown as ResolvedConfig;
  (plugin.configResolved as (c: ResolvedConfig) => void)(config);
  const emitted: { fileName: string; source: string }[] = [];
  (plugin.buildStart as (this: unknown) => void).call({ emitFile: (file: { fileName: string; source: string }) => emitted.push(file) });
  const transform = plugin.transformIndexHtml as (html: string) => string | Tags | { html: string; tags: Tags };
  return { emitted, result: transform('<body><div id="root"></div></body>') };
}

describe("màn chờ docs", () => {
  it("vẽ đúng logo của YugenMark — sửa logo thì sửa cả src/docs/boot/splash.html", () => {
    const mark = read("src/docs/YugenMark.tsx");
    const splash = read("src/docs/boot/splash.html");
    const shapes = [
      mark.match(/const ENSO =\s*"([^"]+)"/)![1],
      mark.match(/export const PETAL =\s*"([^"]+)"/)![1],
      ...[...mark.match(/const KASURE = \[(.*?)\];/s)![1].matchAll(/"(M[^"]+)"/g)].map((m) => m[1]),
    ];
    for (const d of shapes) expect(splash).toContain(`d="${d}"`);
  });

  it("nét cọ ở giữa khớp với phòng thử Labs (src/docs/boot/ink.tsx)", () => {
    const ink = read("src/docs/boot/ink.tsx");
    const splash = read("src/docs/boot/splash.html");
    for (const name of ["STROKE_BODY", "STROKE_DRY", "STROKE_HAIRS"]) {
      const d = ink.match(new RegExp(`export const ${name} = "([^"]+)";`))![1];
      expect(splash, name).toContain(`d="${d}"`);
    }
    // Vệt mờ của cả nét (nằm trên tấm che) cũng là thân nét.
    const body = ink.match(/export const STROKE_BODY = "([^"]+)";/)![1];
    expect(splash.match(/<svg class="yb-stroke yb-track"[^>]*>\s*<path d="([^"]+)"/)![1]).toBe(body);
  });

  it("dev: chèn markup sau #root và style / script vào <head>", () => {
    const { emitted, result } = setup("serve");
    expect(emitted).toEqual([]);
    const { html, tags } = result as { html: string; tags: Tags };
    expect(html).toMatch(/<div id="root"><\/div>\n<div id="yugen-boot"/);
    expect(tags.map((t) => `${t.tag}:${t.injectTo}`)).toEqual(["style:head", "script:head"]);
  });

  it("build: chỉ thêm script nạp màn chờ khi trang không có prerender để hiện", () => {
    const { emitted, result } = setup("build");
    expect(emitted).toHaveLength(1);
    const [{ fileName, source }] = emitted;
    expect(fileName).toMatch(/^assets\/boot-[0-9a-f]{8}\.js$/);
    expect(() => new Function(source)).not.toThrow();
    expect(source).toContain("yugen-boot");
    const [tag] = result as Tags;
    expect(tag.injectTo).toBe("head");
    expect(tag.children).toContain(`"/Yugen-UI/${fileName}"`);
    expect(tag.children).toContain('hasAttribute("data-prerendered") && !r.hasAttribute("data-pending")');
  });

  it("script là JavaScript thường, không cần biên dịch", () => {
    expect(() => new Function(read("src/docs/boot/splash.js"))).not.toThrow();
  });

  it("số Hán của splash.js khớp kanji.ts", () => {
    const js = read("src/docs/boot/splash.js");
    const digits = js.match(/var DIGITS = "([^"]+)";/)![1];
    const body = js.match(/function kanji\(n\) \{\n([\s\S]*?)\n {2}\}/)![1];
    const fromSplash = new Function("DIGITS", `return function (n) {${body}};`)(digits) as (n: number) => string;
    for (let n = 0; n <= 100; n++) expect(fromSplash(n), String(n)).toBe(kanji(n));
    expect([0, 7, 10, 12, 40, 99, 100].map(kanji)).toEqual(["〇", "七", "十", "十二", "四十", "九十九", "百"]);
  });
});
