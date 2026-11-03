import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectDemoTexts, demoDictionaryOf, localizeDemo } from "../../../vite.plugins";
import { isUiText } from "../../test/demo-text";
import type { BlockModule } from "../pages/BlocksPage";
import type { ComponentDoc } from "../types";

/**
 * Demo tiếng Việt trên trang /vi/ (#300): mỗi file src/docs/registry/*.tsx và src/docs/block-library/*.tsx có từ điển
 * `vi/<file>.json` (tiếng Anh → tiếng Việt, khớp nguyên văn); plugin yugenDemoLang dựng `<file>.tsx?lang=vi` từ đó.
 */
const root = path.resolve(__dirname, "../../..");
const FILES = ["src/docs/registry", "src/docs/block-library"].flatMap((dir) =>
  fs
    .readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(".tsx"))
    .sort()
    .map((f) => `${dir}/${f}`),
);

/**
 * Chữ giao diện giữ nguyên trên trang tiếng Việt (không cần mục trong từ điển). Tên người dùng bảng tên tiếng Việt trong từ
 * điển; dữ liệu tiếng Việt cố ý (“Đà Nẵng”, “Xoài”) và demo RTL tiếng Ả Rập không phải chữ tiếng Anh nên không cần mục nào.
 */
const KEEP: (string | RegExp)[] = [
  // Thương hiệu, sản phẩm, công nghệ, tên component, gói dịch vụ.
  /^(© )?(Sakura|Fluent 2|Yugen Labs|Figma|React|TypeScript|Tailwind CSS|Radix UI|Vite|Vitest|Playwright|Theme Designer|Web|Wi-Fi|Pro)\b/,
  /^(Button|Combobox|DataGrid|DatePicker|Dialog|Drawer|Sheet|Tabs|Toast|TimePicker|Breadcrumb|Terminal)\b/,
  "Email",
  "Authorization",
  "Color", // tên trang Fluent 2 được trích dẫn
  "WCAG 2.2 — Contrast (Minimum)",
  "Design.md §4.3",
  // Địa danh, múi giờ, tên phòng ban giữ nguyên.
  /^(Tokyo|London|Paris|Singapore|Kyoto|Hokkaido|Ueno|Fuji|Nara|Nikko|Osaka|Nha Trang)$/,
  /UTC[+−-]\d/,
  /^(Marketing|Frontend|Backend)$/,
  // Phím tắt, đơn vị.
  /^(⌘|Ctrl\b|Esc\b|Tab\b)/,
  /^\d+ ?(GB|MB|KB|px)$/,
  /^Icon \d+px$/,
  // Tên biến thể = giá trị prop (appearance, size, shape, color, side, intent…) và cỡ chữ của type ramp.
  /^(Primary|Secondary|Outline|Subtle|Transparent|Rounded|Circular|Square|Filled( alt| darker| lighter)?|Underline|Tint|Ghost|Brand|Inverted|Neutral|Marigold|Danger|Warning|Success|Info|Error|Informative|Loading|Default|Disabled|Hero|Top|Right|Bottom|Left|Spread|Stack|Pie|Blur|Rotate|Menu)$/,
  /^(Extra )?(Small|Medium|Large)( semibold)?$/i,
  /^(Toolbar|Underline|Filled darker) (·\s)?(small|large)$/,
  /^(Large title|Title \d|Subtitle \d|Body \d( strong)?|Caption \d( strong)?|Aa Bb)$/,
  /^size \d+ · (regular|medium|semibold|bold)$/,
  // TimePicker đặt locale en-US cạnh vi-VN; tên prop trong demo.
  "Time (en-US)",
  /^[a-z]+( \/ [a-z]+[A-Za-z]*)+$/,
  /^title, description, toolbar/,
];

/** Demo định dạng ngày / số theo locale: file có "en-US" thì bản tiếng Việt dùng "vi-VN" — trừ demo cố ý đặt hai locale cạnh nhau. */
const EN_US_KEPT = ["src/docs/registry/phase3-inputs.tsx"];

const kept = (text: string) => KEEP.some((k) => (typeof k === "string" ? k === text : k.test(text)));
const dictionaryOf = (file: string): Record<string, string> => {
  const dict = demoDictionaryOf(path.join(root, file));
  return fs.existsSync(dict) ? JSON.parse(fs.readFileSync(dict, "utf8")) : {};
};

describe("từ điển demo tiếng Việt", () => {
  it.each(FILES)("%s: mọi chữ giao diện có bản tiếng Việt", (file) => {
    const dict = dictionaryOf(file);
    const missing = new Set<string>();
    const texts = collectDemoTexts(fs.readFileSync(path.join(root, file), "utf8"));
    const translated = texts.filter((t) => Object.hasOwn(dict, t.text));
    // Chuỗi nằm trong một template đã dịch nguyên câu (`${x || "…"}`) đi theo bản dịch của template đó.
    const open = texts.filter((t) => !translated.some((c) => c !== t && c.start <= t.start && t.end <= c.end));
    for (const t of open) if (!Object.hasOwn(dict, t.text) && isUiText(t) && !kept(t.text)) missing.add(t.text);
    if (!EN_US_KEPT.includes(file) && open.some((t) => t.text === "en-US")) expect(dict["en-US"], `${file}: "en-US"`).toBe("vi-VN");
    // Thêm vào vi/<file>.json (hoặc KEEP nếu cố ý giữ nguyên).
    expect([...missing]).toEqual([]);
  });

  it.each(FILES)("%s: không có mục thừa, bản dịch đặt được vào mã nguồn", (file) => {
    const dict = dictionaryOf(file);
    const { used } = localizeDemo(fs.readFileSync(path.join(root, file), "utf8"), dict);
    expect(Object.keys(dict).filter((key) => !used.has(key))).toEqual([]);
    for (const [en, vi] of Object.entries(dict)) {
      expect(vi, en).not.toBe(en);
      expect(vi.trim(), en).not.toBe("");
    }
  });

  it("mỗi file từ điển ứng với một file demo", () => {
    for (const dir of ["src/docs/registry/vi", "src/docs/block-library/vi"])
      for (const f of fs.readdirSync(path.join(root, dir)))
        expect(FILES, `${dir}/${f}`).toContain(`${path.dirname(dir)}/${f.replace(/\.json$/, ".tsx")}`);
  });
});

const registryEn = import.meta.glob<{ docs?: ComponentDoc[] }>("./*.tsx");
const registryVi = import.meta.glob<{ docs?: ComponentDoc[] }>("./*.tsx", { query: "?lang=vi" });
const blocksEn = import.meta.glob<BlockModule>("../block-library/*.tsx");
const blocksVi = import.meta.glob<BlockModule>("../block-library/*.tsx", { query: "?lang=vi" });

/** Phần trang (không phải demo) của một doc: phải giữ nguyên ở bản `?lang=vi`. */
const pageOf = (d: ComponentDoc) => ({
  slug: d.slug,
  name: d.name,
  category: d.category,
  lead: d.lead,
  description: d.description,
  importCode: d.importCode,
  hero: d.hero.title,
  examples: d.examples.map((e) => [e.title, e.description, e.lang, e.wide]),
  dos: d.dos,
  donts: d.donts,
  props: d.props,
});

// Nạp (transform) cả file gốc lẫn bản ?lang=vi của mọi file registry — chậm khi chạy song song với cả bộ test.
describe("module ?lang=vi", { timeout: 60_000 }, () => {
  it.each(Object.keys(registryEn))("registry %s: cùng doc, cùng số ví dụ, phần chữ trang giữ nguyên", async (file) => {
    const [en, vi] = await Promise.all([registryEn[file](), registryVi[file]()]);
    expect((vi.docs ?? []).map(pageOf)).toEqual((en.docs ?? []).map(pageOf));
  });

  it.each(Object.keys(blocksEn))("block %s: cùng meta, có component", async (file) => {
    const [en, vi] = await Promise.all([blocksEn[file](), blocksVi[file]()]);
    expect(vi.meta).toEqual(en.meta);
    expect(typeof vi.default).toBe("function");
  });
});
