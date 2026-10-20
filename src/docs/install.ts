import * as UI from "@/components/ui";
import * as Ramp from "@/lib/brandRamp";
import * as Tokens from "@/lib/tokenExport";
import { homepage } from "../../package.json";

/** Mọi tên runtime mà `import { … } from "yugen-ui"` cung cấp (barrel + cn + brand ramp + token export). */
export const exportNames = () => [...Object.keys(UI), ...Object.keys(Ramp), ...Object.keys(Tokens), "cn"];

/**
 * Suy ra lệnh cài cho từng trang component từ `importCode` của docs:
 *   - npm:        import { … } from "yugen-ui"
 *   - shadcn CLI: npx shadcn@latest add <registry>/r/<item>.json + import theo từng thư mục component
 * Bản đồ tên export → thư mục lấy từ chính các module component (cùng module trang docs đã nạp, không tốn thêm).
 */
const modules = import.meta.glob<Record<string, unknown>>(["../components/ui/*/*.{ts,tsx}", "!**/*.test.*"], { eager: true });

const FOLDER_OF: Record<string, string> = {};
for (const [file, mod] of Object.entries(modules)) {
  const folder = file.split("/")[3];
  for (const name of Object.keys(mod)) FOLDER_OF[name] ??= folder;
}

export const REGISTRY_URL = `${homepage.replace(/\/$/, "")}/r`;

/** Cùng quy tắc với scripts/build-registry.mjs: "MessageScroller" → "message-scroller". */
export const registryItemName = (folder: string) =>
  folder.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();

const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*["']@\/components\/ui["'];?/g;

function parseNames(list: string) {
  return list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const isType = raw.startsWith("type ");
      const name = raw.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      return { raw, name, isType };
    });
}

export interface InstallSnippets {
  npm: string;
  shadcn: string;
  /** Thư mục component cần cài qua shadcn (rỗng nếu không suy ra được). */
  items: string[];
}

export function installSnippets(importCode: string): InstallSnippets {
  const npm = `// npm install yugen-ui\n${importCode.replace(/(["'])@\/components\/ui\1/g, '"yugen-ui"').trim()}`;

  const byFolder = new Map<string, string[]>();
  const rest = importCode.replace(IMPORT_RE, (_m, list: string) => {
    for (const { raw, name } of parseNames(list)) {
      const folder = FOLDER_OF[name];
      if (!folder) continue;
      byFolder.set(folder, [...(byFolder.get(folder) ?? []), raw]);
    }
    return "";
  });

  const items = [...byFolder.keys()];
  if (items.length === 0) return { npm, shadcn: "", items };

  const add = `// npx shadcn@latest add ${items.map((f) => `${REGISTRY_URL}/${registryItemName(f)}.json`).join(" \\\n//   ")}`;
  const imports = [...byFolder].map(
    ([folder, names]) => `import { ${names.join(", ")} } from "@/components/ui/${folder}/${folder}";`,
  );
  const shadcn = [add, ...imports, rest.trim()].filter(Boolean).join("\n");
  return { npm, shadcn, items };
}
