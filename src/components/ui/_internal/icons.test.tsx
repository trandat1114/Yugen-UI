import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as fluent from "@fluentui/react-icons";
import * as icons from "./icons";

/** width / viewBox / danh sách path của một <svg> đã render. */
function shape(html: string) {
  return {
    width: html.match(/<svg[^>]*\swidth="([^"]+)"/)?.[1],
    height: html.match(/<svg[^>]*\sheight="([^"]+)"/)?.[1],
    viewBox: html.match(/<svg[^>]*\sviewBox="([^"]+)"/)?.[1],
    paths: [...html.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]),
  };
}

const names = Object.keys(icons).filter((name) => /^[A-Z]/.test(name));

// Icon có sẵn sinh từ @fluentui/react-icons (scripts/icons.mjs, #320): phải vẽ y hệt bản gốc.
describe("icon có sẵn", () => {
  it.each(names)("%s: cùng kích thước và path với @fluentui/react-icons", (name) => {
    const ours = icons[name as keyof typeof icons] as React.ElementType;
    const original = (fluent as unknown as Record<string, React.ElementType>)[name];
    expect(original, name).toBeDefined();
    expect(shape(renderToStaticMarkup(React.createElement(ours)))).toEqual(shape(renderToStaticMarkup(React.createElement(original))));
  });

  it("trang trí mặc định (aria-hidden); có title thì là ảnh có tên", () => {
    const decorative = renderToStaticMarkup(<icons.Dismiss20Regular />);
    expect(decorative).toContain('aria-hidden="true"');
    expect(decorative).not.toContain("role=");
    const named = renderToStaticMarkup(<icons.Dismiss20Regular title="Close" />);
    expect(named).toContain('aria-label="Close"');
    expect(named).toContain('role="img"');
    expect(named).not.toContain("aria-hidden");
  });

  it("class của người dùng thắng class gốc (hidden thay inline), màu theo currentColor", () => {
    const html = renderToStaticMarkup(<icons.Dismiss20Regular className="hidden size-4" />);
    const cls = html.match(/class="([^"]*)"/)?.[1].split(" ") ?? [];
    expect(cls).toContain("hidden");
    expect(cls).not.toContain("inline");
    expect(html).toContain('fill="currentColor"');
  });
});
