import typeNames from "virtual:yugen-type-exports";
import { exportNames } from "./install";
import { SAMPLE_ASSET_NAMES } from "./sample-assets";
import sampleAssetsSource from "./sample-assets.ts?raw";

/**
 * Biến `code` của một ví dụ docs thành dự án Vite + React + Tailwind v4 + yugen-ui chạy được trên StackBlitz.
 * Ba dạng code trong registry:
 *   1. JSX thuần                       → bọc trong `export default function App()`
 *   2. câu lệnh (const/hook…) + JSX    → câu lệnh vào thân hàm, JSX vào `return`
 *   3. một hay nhiều `function Xxx()`  → giữ nguyên, `export default` hàm viết hoa cuối cùng
 * Import (yugen-ui, icon Fluent, hook React) được suy ra từ định danh xuất hiện trong code.
 */

const REACT_VALUES = new Set([
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useId",
  "useReducer",
  "useTransition",
  "useDeferredValue",
  "useContext",
  "useSyncExternalStore",
  "useImperativeHandle",
  "Fragment",
  "Suspense",
  "lazy",
  "memo",
  "forwardRef",
  "createContext",
  "startTransition",
]);
const REACT_TYPES = new Set([
  "ReactNode",
  "ReactElement",
  "ComponentType",
  "ComponentProps",
  "ComponentPropsWithoutRef",
  "LazyExoticComponent",
  "FormEvent",
  "ChangeEvent",
  "CSSProperties",
  "Dispatch",
  "SetStateAction",
  "RefObject",
  "PropsWithChildren",
]);
const YUGEN_TYPES = new Set(typeNames);
const ASSETS = new Set(SAMPLE_ASSET_NAMES);
const ICON_RE = /^[A-Z][A-Za-z0-9]*\d{2}(?:Regular|Filled|Color)$/;

function declaredNames(code: string) {
  const names = new Set<string>();
  for (const m of code.matchAll(/\b(?:function|const|let|var|class|type|interface)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of code.matchAll(/\b(?:const|let|var)\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
    names.add(m[2]);
  }
  for (const m of code.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}/g))
    m[1].split(",").forEach((s) => s.trim() && names.add(s.trim().split(/\s+as\s+/).pop()!.replace(/^type\s+/, "")));
  return names;
}

/** Bỏ chuỗi và chú thích để không bắt nhầm định danh trong văn bản. */
function stripLiterals(code: string) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""');
}

/** Tên từ gói khác (không phải yugen-ui) hay gặp trong ví dụ. */
const EXTERNAL: Record<string, string> = { DirectionProvider: "@radix-ui/react-direction" };
/** Phiên bản thêm vào package.json của StackBlitz khi App.tsx import các gói này. */
const EXTRA_DEPS: Record<string, string> = {
  "@radix-ui/react-direction": "^1.1.0",
  "react-hook-form": "^7.54.0",
  zod: "^3.24.0",
  "@hookform/resolvers": "^3.10.0",
};

const toYugen = (s: string) => s.replace(/(["'])@\/components\/ui(?:\/[^"']*)?\1/g, '"yugen-ui"').trim();

export function exampleToApp(code: string, setup = ""): string {
  const source = toYugen(code);
  const shared = toYugen(setup);
  const importRe = /^import[\s\S]*?;\s*$/gm;
  const importLines = [...(shared.match(importRe) ?? []), ...(source.match(importRe) ?? [])];
  const strip = (s: string) => (s.match(importRe) ?? []).reduce((acc, line) => acc.replace(line, ""), s).trim();
  const body = strip(source);
  const sharedBody = strip(shared);

  let module: string;
  // Chỉ tìm hàm chính trong `code` — `setup` có thể chứa component phụ.
  const functions = [...body.matchAll(/^(?:export\s+)?(?:default\s+)?function\s+([A-Z][\w$]*)/gm)].map((m) => m[1]);
  if (functions.length > 0) {
    const main = functions[functions.length - 1];
    module = /export\s+default/.test(body) ? body : `${body}\n\nexport default ${main};`;
  } else {
    const lines = body.split("\n");
    const jsxStart = lines.findIndex((l) => /^</.test(l));
    const statements = jsxStart > 0 ? lines.slice(0, jsxStart).join("\n").trim() : "";
    const jsx = (jsxStart >= 0 ? lines.slice(jsxStart) : lines).join("\n").trim();
    const indent = (s: string, n: number) => s.replace(/^(?=.)/gm, " ".repeat(n));
    module = [
      "export default function App() {",
      statements && indent(statements, 2) + "\n",
      "  return (",
      "    <>",
      indent(jsx, 6),
      "    </>",
      "  );",
      "}",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (sharedBody) module = `${sharedBody}\n\n${module}`;

  const declared = declaredNames(`${shared}\n${source}`);
  const used = new Set(stripLiterals(module).match(/\b[A-Za-z_$][\w$]*\b/g) ?? []);
  const yugen = new Set(exportNames());
  const pick = (test: (name: string) => boolean) => [...used].filter((n) => !declared.has(n) && test(n)).sort();

  const imports = [...importLines];
  const reactNames = [...pick((n) => REACT_VALUES.has(n)), ...pick((n) => REACT_TYPES.has(n)).map((n) => `type ${n}`)];
  if (/\bReact\./.test(module) && !declared.has("React")) imports.unshift('import * as React from "react";');
  if (reactNames.length) imports.unshift(`import { ${reactNames.join(", ")} } from "react";`);
  const yugenNames = [...pick((n) => yugen.has(n)), ...pick((n) => !yugen.has(n) && YUGEN_TYPES.has(n)).map((n) => `type ${n}`)];
  if (yugenNames.length) imports.push(`import { ${yugenNames.join(", ")} } from "yugen-ui";`);
  const icons = pick((n) => ICON_RE.test(n));
  if (icons.length) imports.push(`import { ${icons.join(", ")} } from "@fluentui/react-icons";`);
  const assets = pick((n) => ASSETS.has(n));
  if (assets.length) imports.push(`import { ${assets.join(", ")} } from "./sample-assets";`);
  for (const name of pick((n) => Object.hasOwn(EXTERNAL, n))) imports.push(`import { ${name} } from "${EXTERNAL[name]}";`);

  return `${imports.join("\n")}\n\n${module}\n`;
}

/** Ví dụ có dùng ảnh mẫu không — khi có, dự án cần kèm `src/sample-assets.ts`. */
export const usesSampleAssets = (app: string) => app.includes('from "./sample-assets"');
export { sampleAssetsSource };

export interface StackBlitzOptions {
  title: string;
  theme: "light" | "dark" | "high-contrast";
  brand: string;
  dir: "ltr" | "rtl";
  version: string;
  /** `Example.setup` — dữ liệu / hàm mẫu dùng chung. */
  setup?: string;
}

export function stackBlitzFiles(code: string, o: StackBlitzOptions): Record<string, string> {
  const app = exampleToApp(code, o.setup);
  const extra = Object.fromEntries(Object.entries(EXTRA_DEPS).filter(([pkgName]) => app.includes(`from "${pkgName}`)));
  const pkg = {
    name: "yugen-ui-example",
    private: true,
    type: "module",
    scripts: { dev: "vite", build: "vite build" },
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1", "yugen-ui": `^${o.version}`, "@fluentui/react-icons": "^2.0.264", ...extra },
    devDependencies: {
      vite: "^6.0.0",
      "@vitejs/plugin-react": "^4.3.4",
      tailwindcss: "^4.0.0",
      "@tailwindcss/vite": "^4.0.0",
      typescript: "^5.7.3",
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
    },
  };
  return {
    "package.json": JSON.stringify(pkg, null, 2),
    ".stackblitzrc": JSON.stringify({ installDependencies: true, startCommand: "npm run dev" }, null, 2),
    "index.html": `<!doctype html>
<html lang="vi" dir="${o.dir}" data-theme="${o.theme}" data-brand="${o.brand}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${o.title.replace(/</g, "&lt;")} · Yugen UI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [react(), tailwindcss()] });
`,
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2,
    ),
    "src/index.css": `@import "tailwindcss";\n@import "yugen-ui/theme.css";\n`,
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster theme="${o.theme}" brand="${o.brand}" dir="${o.dir}">
      <main className="flex min-h-dvh flex-wrap content-center items-center justify-center gap-M bg-background-1 p-XXL">
        <App />
      </main>
    </YugenProvider>
  </StrictMode>,
);
`,
    "src/App.tsx": app,
    ...(usesSampleAssets(app) ? { "src/sample-assets.ts": sampleAssetsSource } : {}),
  };
}

/** Mở ví dụ trên StackBlitz (POST form tới https://stackblitz.com/run, tab mới). */
export function openInStackBlitz(code: string, o: StackBlitzOptions) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://stackblitz.com/run?file=src/App.tsx";
  form.target = "_blank";
  const field = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };
  field("project[title]", `${o.title} · Yugen UI`);
  field("project[description]", "Ví dụ Yugen UI — https://trandat1114.github.io/Yugen-UI/");
  field("project[template]", "node");
  for (const [path, content] of Object.entries(stackBlitzFiles(code, o))) field(`project[files][${path}]`, content);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
