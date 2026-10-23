import { addJsImport } from "./css.js";
import type { Framework } from "./project.js";

/**
 * Bọc app trong YugenProvider ngay tại file gốc (codemod của `yugen init`):
 * - Vite / React: `<App />` trong `createRoot(…).render(…)` → `<YugenProvider applyToDocument withToaster><App /></YugenProvider>`.
 * - Next.js App Router (`app/layout.tsx`): `{children}` trong `<body>`; YugenProvider là client component nên dùng được
 *   trong layout server. `applyToDocument` không render attribute vào HTML nên server và client khớp nhau.
 * Không khớp mẫu nào (đã có YugenProvider, cấu trúc lạ) → trả `changed: false` để init in hướng dẫn thủ công.
 */
export function wrapWithProvider(code: string, framework: Framework, importFrom: string): { code: string; changed: boolean } {
  if (code.includes("YugenProvider")) return { code, changed: false };
  const open = "<YugenProvider applyToDocument withToaster>";
  let next: string | null = null;

  if (framework === "next") {
    const body = /(<body\b[^>]*>)([\s\S]*?)(<\/body>)/.exec(code);
    if (body && body[2].includes("{children}")) {
      const inner = body[2].replace("{children}", `${open}{children}</YugenProvider>`);
      next = code.slice(0, body.index) + body[1] + inner + body[3] + code.slice(body.index + body[0].length);
    }
  } else {
    const render = /\.render\(\s*/.exec(code);
    if (render) {
      const rest = code.slice(render.index);
      const app = /<App\s*\/>/.exec(rest);
      if (app) {
        const at = render.index + app.index;
        // <App /> đứng riêng một dòng → bọc nhiều dòng, giữ thụt lề; nằm giữa dòng → bọc trên cùng dòng.
        const indent = /\n([ \t]*)$/.exec(code.slice(0, at))?.[1];
        const eol = code.includes("\r\n") ? "\r\n" : "\n";
        const wrapped =
          indent === undefined ? `${open}<App /></YugenProvider>` : `${open}${eol}${indent}  <App />${eol}${indent}</YugenProvider>`;
        next = code.slice(0, at) + wrapped + code.slice(at + app[0].length);
      }
    }
  }
  if (next === null) return { code, changed: false };
  return { code: addJsImport(next, `import { YugenProvider } from "${importFrom}";`).code, changed: true };
}
