// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractDocsMeta, type DocMeta } from "../../vite.plugins";
import { COMPONENT_TAGS, foldSearch, isComponentTag, matchesComponent, tagLabel, tagTerms } from "./tags";

const dir = path.resolve(__dirname, "registry");
const META: DocMeta[] = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".tsx"))
  .flatMap((f) => extractDocsMeta(path.join(dir, f), fs.readFileSync(path.join(dir, f), "utf8")));

const search = (query: string) => META.filter((m) => matchesComponent(m, query)).map((m) => m.slug);

describe("component tags (#445)", () => {
  it("uses only canonical tag ids, without duplicates", () => {
    for (const meta of META) {
      for (const tag of meta.tags ?? []) expect(isComponentTag(tag), `${meta.slug}: "${tag}"`).toBe(true);
      expect(new Set(meta.tags ?? []).size, meta.slug).toBe((meta.tags ?? []).length);
    }
  });

  it("finds the AI voice family by tag even when the name doesn't say it", () => {
    expect(search("ai")).toEqual(expect.arrayContaining(["transcript", "voicewave", "callsurface", "voiceassistant", "streamingmarkdown"]));
    expect(search("voice")).toEqual(expect.arrayContaining(["transcript", "callsurface", "voiceassistant", "voicewave"]));
    expect(search("calling")).toEqual(expect.arrayContaining(["callsurface", "voiceassistant"]));
    expect(search("transcript")).toEqual(expect.arrayContaining(["transcript", "voiceassistant"]));
  });

  it("finds the content family through markdown and article", () => {
    expect(search("markdown")).toEqual(expect.arrayContaining(["markdown", "streamingmarkdown", "article"]));
    expect(search("article")).toEqual(expect.arrayContaining(["article", "markdown", "prose", "blog"]));
    expect(search("blog")).toEqual(expect.arrayContaining(["blog"]));
    expect(search("posts")).toContain("blog");
  });

  it("matches aliases and Vietnamese labels without accents", () => {
    expect(search("speech")).toContain("voicewave");
    expect(search("giong noi")).toContain("transcript");
    expect(search("cuộc gọi")).toContain("callsurface");
    expect(search("bai viet")).toContain("article");
  });

  it("returns every component for an empty query, nothing for nonsense, and no duplicates", () => {
    expect(search("   ")).toHaveLength(META.length);
    expect(search("zzqqxx")).toEqual([]);
    const hits = search("ai");
    expect(new Set(hits).size).toBe(hits.length);
  });

  it("needs every word of the query", () => {
    expect(matchesComponent({ slug: "voicewave", name: "VoiceWave", tags: ["ai", "voice"] }, "voice ai")).toBe(true);
    expect(matchesComponent({ slug: "voicewave", name: "VoiceWave", tags: ["ai", "voice"] }, "voice blog")).toBe(false);
    expect(matchesComponent({ slug: "button", name: "Button", lead: "Nút bấm" }, "nut bam")).toBe(true);
  });

  it("has labels in both languages and keeps unknown tags searchable", () => {
    for (const [id, tag] of Object.entries(COMPONENT_TAGS)) {
      expect(tag.vi.trim(), id).not.toBe("");
      expect(tag.en.trim(), id).not.toBe("");
    }
    expect(tagLabel("voice", "vi")).toBe("Giọng nói");
    expect(tagLabel("voice", "en")).toBe("Voice");
    expect(tagLabel("custom", "en")).toBe("custom");
    expect(tagTerms(["custom"])).toEqual(["custom"]);
    expect(tagTerms(undefined)).toEqual([]);
    expect(foldSearch("Đường")).toBe("duong");
  });
});
