#!/usr/bin/env node
/**
 * Icon có sẵn của thư viện (#320): sinh src/components/ui/_internal/icons.tsx từ @fluentui/react-icons (devDependency).
 * `yugen-ui` không còn phụ thuộc gói icon đó (~180 MB, kèm runtime Griffel): mỗi icon là một component SVG nhỏ, cùng path,
 * kích thước và thuộc tính a11y như bản Fluent, nên giao diện giữ nguyên.
 *
 * Danh sách icon = mọi tên mà component trong src/components/ui import từ `../_internal/icons`. Thêm icon mới: import nó
 * từ đó (tên đúng như trong @fluentui/react-icons, vd. `Add20Regular`) rồi chạy lại script này.
 *
 *   node scripts/icons.mjs           # ghi lại file
 *   node scripts/icons.mjs --check   # CI: báo lỗi nếu file chưa khớp với các icon đang dùng
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as fluent from "@fluentui/react-icons";

const root = path.resolve(import.meta.dirname, "..");
const uiDir = path.join(root, "src", "components", "ui");
const outFile = path.join(uiDir, "_internal", "icons.tsx");
const check = process.argv.includes("--check");
const version = createRequire(import.meta.url)("@fluentui/react-icons/package.json").version;

/** Tên icon mà các file (không gồm test) trong components/ui import từ `_internal/icons`. */
function usedIcons() {
  const names = new Set();
  const IMPORT = /import\s*\{([^}]*)\}\s*from\s*["'](?:\.\.?\/)+(?:_internal\/)?icons["']/g;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) && p !== outFile) {
        for (const m of fs.readFileSync(p, "utf8").matchAll(IMPORT)) {
          for (const raw of m[1].split(",")) {
            const name = raw.trim().split(/\s+as\s+/)[0];
            if (name && !name.startsWith("type ")) names.add(name);
          }
        }
      }
    }
  })(uiDir);
  return [...names].sort();
}

/** Path và kích thước của một icon Fluent, đọc từ markup nó render ra. */
function iconData(name) {
  const Icon = fluent[name];
  if (!Icon) throw new Error(`icons: "${name}" không có trong @fluentui/react-icons ${version}.`);
  const html = renderToStaticMarkup(createElement(Icon));
  const svg = html.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/);
  const size = svg?.[1].match(/\swidth="([^"]+)"/)?.[1];
  const viewBox = svg?.[1].match(/\sviewBox="([^"]+)"/)?.[1];
  // Path của Fluent mang fill="currentColor"; bản ở đây kế thừa `fill` của <svg> (mặc định currentColor) — cùng màu.
  const PATH = /<path d="([^"]+)"(?: fill="currentColor")?><\/path>/g;
  const inner = svg?.[2] ?? "";
  const paths = [...inner.matchAll(PATH)].map((m) => m[1]);
  if (!svg || !size || viewBox !== `0 0 ${size} ${size}` || inner.replace(PATH, "") !== "")
    throw new Error(`icons: "${name}" không phải icon một màu chỉ gồm <path d> (cần xử lý riêng).`);
  return { size, paths };
}

const names = usedIcons();
const body = names.map((name) => {
  const { size, paths } = iconData(name);
  return `export const ${name} = /* @__PURE__ */ createIcon("${name}", "${size}", ${JSON.stringify(paths)});`;
});

const out = `// Sinh bởi scripts/icons.mjs từ @fluentui/react-icons ${version} — không sửa tay (\`node scripts/icons.mjs\`).
// Fluent System Icons © Microsoft Corporation, MIT License.
import * as React from "react";
import { cn } from "@/lib/cn";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Tên đọc cho trình đọc màn hình (aria-label, role="img"); không có thì icon là trang trí (aria-hidden). */
  title?: string;
  /** Màu tô, mặc định \`currentColor\` (giống @fluentui/react-icons). */
  primaryFill?: string;
}

/** Kiểu của một icon có sẵn (thay \`FluentIcon\` của @fluentui/react-icons). \`ref\` (tới \`<svg>\`) có sẵn trong IconProps. */
export type IconComponent = React.FunctionComponent<IconProps>;

// Như @fluentui/react-icons: hiển thị inline (thắng \`display: block\` của preflight), giữ màu hệ thống ở forced colors.
const BASE = "inline leading-0 forced-colors:forced-color-adjust-auto";

function createIcon(name: string, size: string, paths: string[]): IconComponent {
  function Icon({ title, primaryFill = "currentColor", className, ref, ...props }: IconProps) {
    const label = title ?? props["aria-label"];
    const named = Boolean(label || props["aria-labelledby"]);
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={\`0 0 \${size} \${size}\`}
        fill={primaryFill}
        aria-hidden={named ? undefined : true}
        role={named ? "img" : undefined}
        {...props}
        aria-label={label}
        className={className ? cn(BASE, className) : BASE}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  }
  // Tạo từ factory nên tên hàm luôn là "Icon": displayName cho DevTools.
  Icon.displayName = name;
  return Icon;
}

${body.join("\n")}
`;

const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8").replace(/\r\n/g, "\n") : "";
if (check) {
  if (current !== out) {
    console.error("icons: src/components/ui/_internal/icons.tsx chưa khớp với các icon đang dùng — chạy `node scripts/icons.mjs`.");
    process.exit(1);
  }
  console.log(`icons: OK — ${names.length} icon.`);
} else {
  fs.writeFileSync(outFile, out);
  console.log(`icons: ghi ${path.relative(root, outFile)} — ${names.length} icon từ @fluentui/react-icons ${version}.`);
}
