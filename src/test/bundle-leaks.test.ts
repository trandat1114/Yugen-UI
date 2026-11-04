// @vitest-environment node
/**
 * Bundle của app không mang phần chỉ một tùy chọn cần (#349, #350). Bundle mã nguồn bằng esbuild (bản mà size-limit
 * dùng) với metafile; chỉ react / react-dom là external, mọi dependency khác được tính.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const src = path.join(root, "src");
const ui = path.join(src, "components", "ui");

interface Output {
  entryPoint?: string;
  imports: { path: string; kind: string }[];
  inputs: Record<string, { bytesInOutput: number }>;
}
interface PluginBuild {
  onResolve(options: { filter: RegExp }, callback: (args: { path: string; kind: string }) => unknown): void;
  resolve(path: string, options: { kind: string; resolveDir: string }): Promise<unknown>;
}
interface Esbuild {
  build(options: Record<string, unknown>): Promise<{ metafile: { outputs: Record<string, Output> } }>;
}

// esbuild không là dependency trực tiếp của repo: dùng bản của @size-limit/esbuild (devDependency).
const require = createRequire(import.meta.url);
const esbuild = (await import(pathToFileURL(createRequire(require.resolve("@size-limit/esbuild")).resolve("esbuild")).href)) as Esbuild;

/** `@/…` như tsconfig. */
const alias = {
  name: "alias",
  setup(build: PluginBuild) {
    build.onResolve({ filter: /^@\// }, (args) => build.resolve(`./${args.path.slice(2)}`, { kind: args.kind, resolveDir: src }));
  },
};

const posix = (p: string) => p.split(path.sep).join("/");

/**
 * `entry`: mã của entry (import từ src/lib.ts như `import { … } from "yugen-ui"`) hoặc đường dẫn file (như subpath
 * `yugen-ui/<Thư mục>`). Trả về module có byte trong chunk đầu (entry + chunk nạp tĩnh) và trong chunk nạp lúc cần.
 */
async function bundle(entry: { contents: string } | { file: string }) {
  const { metafile } = await esbuild.build({
    ...("contents" in entry
      ? { stdin: { contents: entry.contents, resolveDir: root, sourcefile: "entry.ts", loader: "ts" } }
      : { entryPoints: [entry.file] }),
    absWorkingDir: root,
    bundle: true,
    format: "esm",
    splitting: "file" in entry,
    outdir: path.join(root, ".bundle-leaks"),
    write: false,
    jsx: "automatic",
    external: ["react", "react-dom", "react/jsx-runtime"],
    plugins: [alias],
    metafile: true,
    logLevel: "silent",
  });
  const outputs = metafile.outputs;
  const entryOut = Object.keys(outputs).find((k) => outputs[k].entryPoint !== undefined && k.endsWith(".js"))!;
  const initialChunks = new Set<string>();
  const visit = (key: string) => {
    if (initialChunks.has(key)) return;
    initialChunks.add(key);
    for (const imp of outputs[key].imports) if (imp.kind === "import-statement" && outputs[imp.path]) visit(imp.path);
  };
  visit(entryOut);
  const modulesOf = (keys: string[]) =>
    new Set(keys.flatMap((k) => Object.entries(outputs[k].inputs).filter(([, v]) => v.bytesInOutput > 0).map(([p]) => posix(p))));
  const js = Object.keys(outputs).filter((k) => k.endsWith(".js"));
  return { initial: modulesOf([...initialChunks]), lazy: modulesOf(js.filter((k) => !initialChunks.has(k))) };
}

const fromRoot = (names: string) => ({ contents: `import { ${names} } from "./src/lib";\nconsole.log(${names});\n` });
const file = (rel: string) => ({ file: path.join(ui, rel) });
const has = (modules: Set<string>, pattern: RegExp) => [...modules].some((m) => pattern.test(m));

/** Locale date-fns / react-day-picker trong bundle, trừ phần dùng chung (`_lib`). */
const locales = (modules: Set<string>) =>
  [...new Set([...modules].flatMap((m) => /\/locale\/([^/]+?)(?:\.js|\/)/.exec(m)?.[1] ?? []))].filter((l) => l !== "_lib").sort();

describe("Calendar không kéo locale tiếng Việt (#349)", () => {
  it("{ DatePicker }, { Calendar }: chỉ locale en-US có sẵn của react-day-picker", { timeout: 60_000 }, async () => {
    for (const names of ["DatePicker", "Calendar", "DateRangePicker, DateTimePicker"]) {
      const { initial } = await bundle(fromRoot(names));
      expect(initial, names).toContain("src/components/ui/Calendar/Calendar.tsx");
      expect(locales(initial), names).toEqual(["en-US"]);
    }
  });

  it("app tiếng Việt vẫn có locale vi qua calendarMessagesVi", { timeout: 60_000 }, async () => {
    const { initial } = await bundle(fromRoot("DatePicker, calendarMessagesVi"));
    expect(locales(initial)).toEqual(["en-US", "vi"]);
  });
});

describe("Phần chỉ một tùy chọn cần nạp lúc cần (#350)", () => {
  it("Nav không import Tooltip; Sidebar của AppShell mang Tooltip cho rail", { timeout: 60_000 }, async () => {
    const nav = await bundle(file("Nav/Nav.tsx"));
    expect(has(nav.initial, /\/Tooltip\/Tooltip\.tsx$/)).toBe(false);
    expect(has(nav.initial, /@radix-ui\/react-tooltip\//)).toBe(false);

    const sidebar = await bundle(file("AppShell/Sidebar.tsx"));
    expect(has(sidebar.initial, /\/AppShell\/NavRailTooltip\.tsx$/)).toBe(true);
    expect(has(sidebar.initial, /@radix-ui\/react-tooltip\//)).toBe(true);
  });

  it("Breadcrumb: Menu nằm trong chunk nạp lúc cần, không ở chunk đầu", { timeout: 60_000 }, async () => {
    const { initial, lazy } = await bundle(file("Breadcrumb/Breadcrumb.tsx"));
    expect(has(initial, /\/Breadcrumb\/Breadcrumb\.tsx$/)).toBe(true);
    expect(has(initial, /\/Menu\/Menu\.tsx$/)).toBe(false);
    expect(has(initial, /@radix-ui\/react-dropdown-menu\//)).toBe(false);
    expect(has(lazy, /\/Menu\/Menu\.tsx$/)).toBe(true);
    expect(has(lazy, /@radix-ui\/react-dropdown-menu\//)).toBe(true);
  });

  it("StreamingMarkdown: Citation và Popover nằm trong chunk nạp lúc cần", { timeout: 60_000 }, async () => {
    const { initial, lazy } = await bundle(file("AIKit/StreamingMarkdown.tsx"));
    expect(has(initial, /\/AIKit\/StreamingMarkdown\.tsx$/)).toBe(true);
    for (const pattern of [/\/AIKit\/Citation\.tsx$/, /\/Popover\/Popover\.tsx$/, /@radix-ui\/react-popover\//]) {
      expect(has(initial, pattern), String(pattern)).toBe(false);
      expect(has(lazy, pattern), String(pattern)).toBe(true);
    }
  });
});
