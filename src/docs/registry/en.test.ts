import { describe, expect, it } from "vitest";
import type { ComponentDocEn } from "../types";
import { COMPONENT_META_BY_SLUG, loadComponentDoc, loadComponentDocEn, readComponentDoc, translateComponentDoc } from "./index";
import { COMPONENTS_TRANSLATED } from "./translated";

// Bản tiếng Anh của trang component (#69): en/<file>.ts cùng tên với file registry chứa component.
const enFiles = import.meta.glob<{ en: Record<string, ComponentDocEn> }>("./en/*.ts", { eager: true });
const VIETNAMESE = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

describe("bản tiếng Anh của trang component", () => {
  it("COMPONENTS_TRANSLATED khớp đúng các mục trong en/, mỗi mục nằm cùng tên file với registry", () => {
    const found: string[] = [];
    for (const [file, mod] of Object.entries(enFiles)) {
      for (const slug of Object.keys(mod.en)) {
        expect(COMPONENT_META_BY_SLUG[slug]?.file.replace(/\.tsx$/, ".ts"), slug).toBe(file.replace("./en/", ""));
        found.push(slug);
      }
    }
    expect(found.sort()).toEqual([...COMPONENTS_TRANSLATED].sort());
  });

  it.each([...COMPONENTS_TRANSLATED])("%s: đủ mục, không sót tiếng Việt", async (slug) => {
    const doc = await loadComponentDoc(slug);
    const en = (await loadComponentDocEn(slug))!;
    expect(en.description.trim()).not.toBe("");
    expect(en.examples).toHaveLength(doc.examples.length);
    expect(en.dos).toHaveLength(doc.dos.length);
    expect(en.donts).toHaveLength(doc.donts.length);
    expect(Object.keys(en.props).sort()).toEqual(doc.props.map((p) => p.name).sort());
    for (const name of Object.keys(en.defaults ?? {})) expect(doc.props.map((p) => p.name), name).toContain(name);
    // Giá trị mặc định viết bằng chữ tiếng Việt phải có bản dịch trong `defaults`.
    for (const p of doc.props) if (p.defaultValue && VIETNAMESE.test(p.defaultValue)) expect(en.defaults?.[p.name], p.name).toBeTruthy();
    const text = [
      en.description,
      ...en.examples.flatMap((e) => [e.title, e.description ?? ""]),
      ...en.dos,
      ...en.donts,
      ...Object.values(en.props),
      ...Object.values(en.defaults ?? {}),
    ];
    // Nhãn mặc định component còn tiếng Việt được phép khi trích nguyên văn trong dấu ngoặc kép (“…”).
    for (const t of text) expect(t.replace(/“[^”]*”/g, ""), t).not.toMatch(VIETNAMESE);
  });

  it("trang tiếng Anh dùng bản dịch, giữ demo và code", async () => {
    const slug = [...COMPONENTS_TRANSLATED][0];
    if (!slug) return;
    const doc = await loadComponentDoc(slug);
    const en = translateComponentDoc(doc, (await loadComponentDocEn(slug))!);
    expect(en.examples.map((e) => e.code)).toEqual(doc.examples.map((e) => e.code));
    expect(en.props.map((p) => [p.name, p.type])).toEqual(doc.props.map((p) => [p.name, p.type]));
    expect(en.description).not.toBe(doc.description);
    // readComponentDoc theo ngôn ngữ: cache riêng cho vi / en.
    await expect(
      new Promise<void>((resolve) => {
        const read = () => {
          try {
            expect(readComponentDoc(slug, "en").doc?.description).toBe(en.description);
            expect(readComponentDoc(slug, "vi").doc?.description).toBe(doc.description);
            resolve();
          } catch (pending) {
            void (pending as Promise<void>).then(read);
          }
        };
        read();
      }),
    ).resolves.toBeUndefined();
  });
});
