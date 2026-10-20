#!/usr/bin/env node
/**
 * Sinh starter template trong templates/ từ block có sẵn (src/docs/block-library), đổi import "@/components/ui" → "yugen-ui".
 * Template luôn khớp block trên docs; sửa block rồi chạy lại script này.
 *
 *   node scripts/sync-templates.mjs           # ghi lại templates/
 *   node scripts/sync-templates.mjs --check   # CI: báo lỗi nếu templates/ lệch so với block
 *
 * Dùng: npx degit trandat1114/Yugen-UI/templates/vite-dashboard my-app && cd my-app && npm install && npm run dev
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const check = process.argv.includes("--check");

const TEMPLATES = [
  { dir: "vite-dashboard", title: "Yugen UI · Dashboard", blocks: ["02-stats.tsx", "11-analytics.tsx", "06-transactions.tsx"] },
  { dir: "vite-ai-chat", title: "Yugen UI · AI chat", blocks: ["12-ai-assistant.tsx"] },
];

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const toYugen = (code) => code.replace(/(["'])@\/components\/ui(?:\/[^"']*)?\1/g, '"yugen-ui"').replace(/(["'])@\/lib\/cn\1/g, '"yugen-ui"');
const componentName = (file) => {
  const m = read(path.join(root, "src/docs/block-library", file)).match(/export default function (\w+)/);
  if (!m) throw new Error(`${file}: thiếu export default function`);
  return m[1];
};

function files(t) {
  const blockFiles = Object.fromEntries(
    t.blocks.map((b) => [`src/blocks/${b.replace(/^\d+-/, "")}`, toYugen(read(path.join(root, "src/docs/block-library", b)))]),
  );
  const imports = t.blocks.map((b) => `import ${componentName(b)} from "./blocks/${b.replace(/^\d+-/, "").replace(/\.tsx$/, "")}";`);
  const body = t.blocks.map((b) => `        <${componentName(b)} />`).join("\n");
  return {
    "package.json":
      JSON.stringify(
        {
          name: t.dir,
          private: true,
          type: "module",
          scripts: { dev: "vite", build: "tsc -b && vite build", preview: "vite preview" },
          dependencies: {
            "@fluentui/react-icons": pkg.dependencies["@fluentui/react-icons"],
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "yugen-ui": `^${pkg.version}`,
          },
          devDependencies: {
            "@tailwindcss/vite": "^4.0.0",
            "@types/react": "^18.3.18",
            "@types/react-dom": "^18.3.5",
            "@vitejs/plugin-react": "^4.3.4",
            tailwindcss: "^4.0.0",
            typescript: "^5.7.3",
            vite: "^6.0.0",
          },
        },
        null,
        2,
      ) + "\n",
    "index.html": `<!doctype html>
<html lang="vi" data-theme="light" data-brand="sakura" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.title}</title>
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
    "tsconfig.json":
      JSON.stringify(
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
      ) + "\n",
    "src/index.css": `@import "tailwindcss";\n@import "yugen-ui/theme.css";\n`,
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { YugenProvider } from "yugen-ui";
${imports.join("\n")}
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-XXL bg-shell p-XXL">
${body}
      </main>
    </YugenProvider>
  </StrictMode>,
);
`,
    "README.md": `# ${t.title}

Starter template của [Yugen UI](https://trandat1114.github.io/Yugen-UI/) — Vite + React + Tailwind CSS v4.

\`\`\`bash
npx degit trandat1114/Yugen-UI/templates/${t.dir} my-app
cd my-app
npm install
npm run dev
\`\`\`

File trong \`src/blocks/\` sinh từ \`src/docs/block-library\` bằng \`scripts/sync-templates.mjs\` — sửa thoải mái trong dự án của bạn.
`,
    ...blockFiles,
  };
}

let drift = 0;
for (const t of TEMPLATES) {
  const base = path.join(root, "templates", t.dir);
  for (const [rel, content] of Object.entries(files(t))) {
    const file = path.join(base, rel);
    const same = fs.existsSync(file) && read(file) === content;
    if (check) {
      if (!same) {
        drift++;
        console.error(`✗ templates/${t.dir}/${rel} lệch — chạy: node scripts/sync-templates.mjs`);
      }
      continue;
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
}
if (check && drift) process.exit(1);
console.log(check ? "sync-templates: OK" : `sync-templates: đã ghi ${TEMPLATES.map((t) => `templates/${t.dir}`).join(", ")}`);
