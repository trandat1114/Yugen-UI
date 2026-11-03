// Plugin hiệu năng của site docs (#304–#308), chỉ dùng trong vite.config.ts (không áp cho thư viện).
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Plugin } from "vite";

const PACKAGE = "@fluentui/react-icons";
const IMPORT = /\b(import|export)\s*\{([^}]*)\}\s*from\s*(["'])@fluentui\/react-icons\3;?/g;

/**
 * Icon Fluent theo từng họ icon (#307). `import { Search20Regular } from "@fluentui/react-icons"` trỏ vào các file gộp
 * hàng trăm icon (lib/sizedIcons/chunk-N.js). Tree-shaking giữ mọi icon mà BẤT KỲ trang nào dùng trong file gộp đó, và
 * module không chia được giữa các chunk — nên chunk chính (thanh bên, thanh trên) mang theo cả icon của demo các trang
 * khác. Plugin đổi import sang file atom của từng họ (`@fluentui/react-icons/svg/search`): mỗi chunk chỉ mang họ icon nó dùng.
 * Chỉ áp cho bản build client của docs; thư viện (vite.lib.config.ts) và dev giữ nguyên.
 */
export function fluentIconAtoms(root: string): Plugin {
  let atoms: Map<string, string> | undefined;
  const atomOf = (name: string) => {
    if (!atoms) {
      atoms = new Map();
      const dir = path.join(path.dirname(createRequire(path.join(root, "package.json")).resolve(`${PACKAGE}/package.json`)), "lib", "atoms", "svg");
      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith(".js")) continue;
        const code = fs.readFileSync(path.join(dir, file), "utf8");
        for (const m of code.matchAll(/export const (\w+)\s*=/g)) atoms.set(m[1], file.slice(0, -3));
      }
    }
    return atoms.get(name);
  };

  return {
    name: "yugen-fluent-icon-atoms",
    apply: "build",
    transform(code, id, options) {
      if (options?.ssr || id.includes("node_modules") || !/\.[cm]?[jt]sx?$/.test(id) || !code.includes(PACKAGE)) return;
      const next = code.replace(IMPORT, (statement, keyword: string, list: string) => {
        const byAtom = new Map<string, string[]>();
        const rest: string[] = [];
        for (const spec of list.split(",").map((s) => s.trim()).filter(Boolean)) {
          const atom = atomOf(spec.split(/\s+as\s+/)[0]);
          if (atom) byAtom.set(atom, [...(byAtom.get(atom) ?? []), spec]);
          else rest.push(spec);
        }
        if (byAtom.size === 0) return statement;
        // Một dòng: số dòng không đổi, các vị trí sau đó vẫn khớp.
        return [
          ...[...byAtom].map(([atom, specs]) => `${keyword} { ${specs.join(", ")} } from "${PACKAGE}/svg/${atom}";`),
          ...(rest.length ? [`${keyword} { ${rest.join(", ")} } from "${PACKAGE}";`] : []),
        ].join(" ");
      });
      return next === code ? undefined : { code: next, map: null };
    },
  };
}
