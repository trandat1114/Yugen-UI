// @vitest-environment node
/**
 * YugenProvider không kéo Toaster vào chunk đầu (#346). size-limit bundle không tách chunk (esbuild gộp `import()` vào
 * cùng file) nên không thấy được điều này; ở đây build bằng Vite / Rolldown có tách chunk, như bundler của app.
 */
import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "vite";

const root = path.resolve(import.meta.dirname, "../..");
const ui = path.join(root, "src", "components", "ui");

interface Chunk {
  type: "chunk";
  fileName: string;
  name: string;
  isEntry: boolean;
  imports: string[];
  dynamicImports: string[];
  moduleIds: string[];
}

async function bundle(entries: Record<string, string>) {
  const result = await build({
    configFile: false,
    root,
    logLevel: "silent",
    publicDir: false,
    resolve: { alias: { "@": path.join(root, "src") } },
    build: {
      write: false,
      emptyOutDir: false,
      minify: false,
      lib: { entry: entries, formats: ["es"] },
      rolldownOptions: {
        // Như vite.lib.config.ts: npm là external, chỉ mã của thư viện được bundle.
        external: (id: string) => !id.startsWith(".") && !id.startsWith("@/") && !id.startsWith("\0") && !path.isAbsolute(id),
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]) as unknown as { output: (Chunk | { type: "asset" })[] }[];
  const chunks = new Map<string, Chunk>();
  for (const out of outputs) for (const item of out.output) if (item.type === "chunk") chunks.set(item.fileName, item);
  /** Module và package npm mà chunk `start` nạp tĩnh (bắc cầu qua chunk dùng chung). */
  const closure = (start: Chunk) => {
    const modules = new Set<string>();
    const packages = new Set<string>();
    const stack = [start.fileName];
    const seen = new Set<string>();
    while (stack.length) {
      const file = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const chunk = chunks.get(file);
      if (!chunk) {
        packages.add(file);
        continue;
      }
      for (const id of chunk.moduleIds) modules.add(path.relative(ui, id).split(path.sep).join("/"));
      stack.push(...chunk.imports);
    }
    return { modules, packages };
  };
  const entry = (name: string) => [...chunks.values()].find((c) => c.isEntry && c.name === name)!;
  return { chunks, closure, entry };
}

describe("YugenProvider nạp Toaster lúc cần (#346)", () => {
  it("chunk đầu của YugenProvider và Loading không có Toaster / @radix-ui/react-toast", { timeout: 60_000 }, async () => {
    const { chunks, closure, entry } = await bundle({
      provider: path.join(ui, "YugenProvider", "YugenProvider.tsx"),
      loading: path.join(ui, "Loading", "Loading.tsx"),
    });

    const provider = closure(entry("provider"));
    expect(provider.modules).toContain("YugenProvider/YugenProvider.tsx");
    expect(provider.modules).not.toContain("Toast/Toast.tsx");
    expect(provider.packages).not.toContain("@radix-ui/react-toast");

    // Toaster nằm trong chunk nạp động của YugenProvider.
    const lazy = entry("provider").dynamicImports.map((file) => closure(chunks.get(file)!));
    expect(lazy.some((c) => c.modules.has("Toast/Toast.tsx") && c.packages.has("@radix-ui/react-toast"))).toBe(true);

    // Loading chỉ cần toast(): store, không có UI.
    const loading = closure(entry("loading"));
    expect(loading.modules).toContain("Toast/toastStore.ts");
    expect(loading.modules).not.toContain("Toast/Toast.tsx");
    expect(loading.packages).not.toContain("@radix-ui/react-toast");
  });
});
