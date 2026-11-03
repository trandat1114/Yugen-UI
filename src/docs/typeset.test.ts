import { describe, expect, it } from "vitest";
import {
  DEFAULT_TYPESET,
  PRESET_VALUES,
  applyPreset,
  paramsToTypeset,
  typesetCss,
  typesetFontLink,
  typesetSnippet,
  typesetToParams,
  typesetVars,
} from "./typeset";

// Trang /typeset (#244): CSS xuất ra chỉ đặt biến --prose-*, link chia sẻ khôi phục đúng trạng thái.
describe("typeset", () => {
  it("mặc định: không đặt font, nhịp theo preset docs", () => {
    expect(typesetVars(DEFAULT_TYPESET)).toEqual({ "--prose-size": "0.875rem", "--prose-leading": "1.43", "--prose-flow": "1.15em" });
  });

  it("CSS là một class chỉ chứa biến, tên class được làm sạch", () => {
    const css = typesetCss({ ...applyPreset(DEFAULT_TYPESET, "article"), body: "lora", heading: "inter", mono: "jetbrains" }, "My Blog!");
    expect(css).toBe(
      [
        ".my-blog {",
        '  --prose-font-body: "Lora", Georgia, Cambria, "Times New Roman", serif;',
        '  --prose-font-heading: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;',
        '  --prose-font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace;',
        "  --prose-size: 1rem;",
        "  --prose-leading: 1.75;",
        "  --prose-flow: 1.25em;",
        "}",
        "",
      ].join("\n"),
    );
  });

  it("đoạn bọc dùng class và độ rộng dòng", () => {
    expect(typesetSnippet(applyPreset(DEFAULT_TYPESET, "article"))).toContain('<Prose className="my-prose max-w-[68ch]">');
  });

  it("link Google Fonts chỉ khi có font web, không trùng", () => {
    expect(typesetFontLink(DEFAULT_TYPESET)).toBeNull();
    const link = typesetFontLink({ ...DEFAULT_TYPESET, body: "inter", heading: "inter", mono: "jetbrains" })!;
    expect(link).toContain("css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap");
    expect(link.match(/family=Inter/g)).toHaveLength(1);
  });

  it("link chia sẻ: chỉ ghi giá trị khác preset, đọc lại đúng trạng thái", () => {
    const state = { ...applyPreset(DEFAULT_TYPESET, "chat"), body: "plex", leading: 1.6 };
    const params = typesetToParams(state);
    expect(params.toString()).toBe("ts-preset=chat&ts-body=plex&ts-leading=1.6");
    expect(paramsToTypeset(params)).toEqual(state);
    expect(typesetToParams(DEFAULT_TYPESET).toString()).toBe("");
  });

  it("query lạ hoặc ngoài giới hạn → mặc định / giới hạn", () => {
    const state = paramsToTypeset(new URLSearchParams("ts-preset=poster&ts-body=comic&ts-size=99&ts-flow=abc"));
    expect(state.preset).toBe("docs");
    expect(state.body).toBe("inherit");
    expect(state.size).toBe(22);
    expect(state.flow).toBe(PRESET_VALUES.docs.flow);
  });
});
