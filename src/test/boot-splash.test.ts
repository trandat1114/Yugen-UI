// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { yugenBootSplash } from "../../vite.plugins";

/** Màn chờ của dev server (#236): src/docs/boot, chèn vào index.html bởi plugin yugenBootSplash. */
const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");

describe("màn chờ dev server", () => {
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

  it("chỉ chạy ở dev, chèn markup sau #root và style / script vào <head>", () => {
    const plugin = yugenBootSplash(root);
    expect(plugin.apply).toBe("serve");
    const transform = plugin.transformIndexHtml as (html: string) => { html: string; tags: { tag: string; injectTo: string }[] };
    const result = transform('<body><div id="root"></div></body>');
    expect(result.html).toMatch(/<div id="root"><\/div>\n<div id="yugen-boot"/);
    expect(result.tags.map((t) => `${t.tag}:${t.injectTo}`)).toEqual(["style:head", "script:head"]);
  });

  it("script là JavaScript thường, không cần biên dịch", () => {
    expect(() => new Function(read("src/docs/boot/splash.js"))).not.toThrow();
  });
});
