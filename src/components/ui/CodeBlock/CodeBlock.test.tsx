import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CodeBlock,
  packageManagerCommand,
  parseLineRanges,
  tokenizeCode,
  type CodeLanguage,
  type CodeTokenType,
} from "./CodeBlock";
import { codeBlockMessagesEn, copyCodeButtonMessagesEn } from "./messages.en";
import { YugenProvider } from "../YugenProvider/YugenProvider";

/** Token có nghĩa (bỏ plain) dạng [type, text]. */
function marks(code: string, language: CodeLanguage) {
  return tokenizeCode(code, language)
    .filter((t) => t.type !== "plain")
    .map((t) => [t.type, t.text] as [CodeTokenType, string]);
}

function textsOf(code: string, language: CodeLanguage, type: CodeTokenType) {
  return tokenizeCode(code, language)
    .filter((t) => t.type === type)
    .map((t) => t.text);
}

const SAMPLES: Record<CodeLanguage, string> = {
  tsx: `import { Button } from "@/components/ui";
// Nút chính
export function Save({ busy }: { busy: boolean }) {
  const label = busy ? 'Đang lưu…' : \`Lưu \${count}\`;
  return <Button appearance="primary" disabled={busy} onClick={() => save(1)}>{label} https://yugen.dev</Button>;
}`,
  ts: `const n: number = 0x1f + 2.5e3; /* khối */ type A = Record<string, unknown>;`,
  jsx: `const el = <><a href="https://yugen.dev">Docs</a></>;`,
  js: `if (a < b && c > d) { return useState(0); }`,
  css: `@media (min-width: 640px) {
  .card:hover > a::after { color: var(--brand-80); background: url(https://yugen.dev/a.png); margin: -4px 0 !important; }
}
/* chú thích */`,
  html: `<!DOCTYPE html><!-- note --><a class="x" href="https://yugen.dev">A &amp; B</a>`,
  bash: `$ npm install yugen-ui --save-dev # cài
curl -fsSL https://yugen.dev/install.sh | sudo bash
echo "$HOME" '\${x}' && export N=10`,
  json: `{ "name": "yugen-ui", "homepage": "https://yugen.dev", "n": -1.5e2, "ok": true, "x": null }`,
  md: "# Tiêu đề\n> trích dẫn\n- **đậm** và *nghiêng* và `code` [link](https://yugen.dev)\n```ts\nconst a = 1;\n```",
  text: "// không phải comment",
};

describe("tokenizeCode — chung", () => {
  it.each(Object.keys(SAMPLES) as CodeLanguage[])("%s: ghép token lại đúng bằng mã gốc (không mất ký tự)", (language) => {
    const code = SAMPLES[language];
    expect(
      tokenizeCode(code, language)
        .map((t) => t.text)
        .join(""),
    ).toBe(code);
  });

  it("không có token rỗng và không có hai token plain liền nhau", () => {
    for (const [language, code] of Object.entries(SAMPLES) as [CodeLanguage, string][]) {
      const tokens = tokenizeCode(code, language);
      tokens.forEach((t, i) => {
        expect(t.text.length).toBeGreaterThan(0);
        if (i > 0) expect(t.type === "plain" && tokens[i - 1].type === "plain").toBe(false);
      });
    }
  });

  it("text → một token plain duy nhất", () => {
    expect(tokenizeCode("// a 'b' 1", "text")).toEqual([{ type: "plain", text: "// a 'b' 1" }]);
  });

  it("mặc định là tsx; chuỗi rỗng → không token", () => {
    expect(tokenizeCode("const a = 1;")).toEqual(tokenizeCode("const a = 1;", "tsx"));
    expect(tokenizeCode("", "tsx")).toEqual([]);
  });
});

describe("tokenizeCode — https:// không bị coi là comment", () => {
  it.each<[CodeLanguage, string]>([
    ["tsx", `const url = "https://yugen.dev/docs";`],
    ["tsx", `<a href="https://yugen.dev">Xem https://yugen.dev</a>`],
    ["tsx", "const u = `https://${host}/api`;"],
    ["ts", `fetch('https://yugen.dev')`],
    ["css", `.hero { background: url(https://yugen.dev/a.png); }`],
    ["css", `@import url("https://fonts.googleapis.com/css2");`],
    ["bash", `curl https://yugen.dev/install.sh`],
    ["bash", `open https://yugen.dev/#cai-dat`],
    ["json", `{ "homepage": "https://yugen.dev" }`],
    ["html", `<a href="https://yugen.dev">https://yugen.dev</a>`],
    ["md", `Xem https://yugen.dev hoặc [docs](https://yugen.dev)`],
  ])("%s: %s", (language, code) => {
    expect(textsOf(code, language, "comment")).toEqual([]);
  });

  it("nhưng // thật sau mã vẫn là comment", () => {
    expect(textsOf(`const a = "https://x.dev"; // https://y.dev`, "tsx", "comment")).toEqual(["// https://y.dev"]);
  });
});

describe("tokenizeCode — TS / TSX", () => {
  it("comment dòng và comment khối (kể cả chưa đóng)", () => {
    expect(textsOf("a(); // cuối dòng\nb();", "ts", "comment")).toEqual(["// cuối dòng"]);
    expect(textsOf("/* a\n b */ x", "ts", "comment")).toEqual(["/* a\n b */"]);
    expect(textsOf("x /* chưa đóng", "ts", "comment")).toEqual(["/* chưa đóng"]);
  });

  it("chuỗi nháy đơn / kép / template, có escape", () => {
    expect(textsOf(`a("x\\"y", 'z', \`t\${1}\`)`, "ts", "string")).toEqual([`"x\\"y"`, `'z'`, "`t${1}`"]);
  });

  it("từ khoá, số, hàm, kiểu", () => {
    const code = "export const n = 42; function f() { return Math.max(1_000, 0x1F, 2.5e-3); }";
    expect(textsOf(code, "ts", "keyword")).toEqual(["export", "const", "function", "return"]);
    expect(textsOf(code, "ts", "number")).toEqual(["42", "1_000", "0x1F", "2.5e-3"]);
    expect(textsOf(code, "ts", "function")).toEqual(["f", "max"]);
    expect(textsOf(code, "ts", "type")).toEqual(["Math"]);
  });

  it("từ khoá phải trọn từ (importer, constant không phải keyword)", () => {
    expect(textsOf("importer.constant", "ts", "keyword")).toEqual([]);
  });

  it("JSX: thẻ, thuộc tính, chuỗi, biểu thức lồng", () => {
    const code = `return <Button appearance="primary" onClick={() => go({ a: 1 })}>Lưu {n}</Button>;`;
    expect(textsOf(code, "tsx", "tag")).toEqual(["<Button", ">", "</Button", ">"]);
    expect(textsOf(code, "tsx", "attr")).toEqual(["appearance", "onClick"]);
    expect(textsOf(code, "tsx", "string")).toEqual([`"primary"`]);
    expect(textsOf(code, "tsx", "function")).toContain("go");
    // Chữ trong children giữ nguyên là plain.
    expect(tokenizeCode(code, "tsx").some((t) => t.type === "plain" && t.text.includes("Lưu"))).toBe(true);
  });

  it("JSX tự đóng và fragment", () => {
    expect(textsOf(`const a = <Icon size={20} />;`, "tsx", "tag")).toEqual(["<Icon", "/>"]);
    expect(textsOf(`const b = <><b>x</b></>;`, "tsx", "tag")).toEqual(["<>", "<b", ">", "</b", ">", "</>"]);
  });

  it("so sánh a < b và generic useState<T> không mở thẻ JSX", () => {
    expect(textsOf("if (a < b) x = 1;", "tsx", "tag")).toEqual([]);
    expect(textsOf("const [v] = useState<string>('');", "tsx", "tag")).toEqual([]);
  });

  it("ts (không JSX) không bao giờ sinh tag", () => {
    expect(textsOf("const a = <div>x</div>;", "ts", "tag")).toEqual([]);
  });
});

describe("tokenizeCode — CSS", () => {
  const css = SAMPLES.css;

  it("at-rule, selector, pseudo, thuộc tính, biến, hàm, số, !important, comment", () => {
    expect(textsOf(css, "css", "keyword")).toEqual(expect.arrayContaining(["@media", ":hover", "::after", "!important"]));
    expect(textsOf(css, "css", "type")).toContain(".card");
    expect(textsOf("a::after, li > p { margin: 0 }", "css", "tag")).toEqual(["a", "li", "p"]);
    expect(textsOf(css, "css", "property")).toEqual(expect.arrayContaining(["min-width", "color", "background", "margin"]));
    expect(textsOf(css, "css", "variable")).toEqual(["--brand-80"]);
    expect(textsOf(css, "css", "function")).toEqual(["var", "url"]);
    expect(textsOf(css, "css", "number")).toEqual(expect.arrayContaining(["640px", "-4px", "0"]));
    expect(textsOf(css, "css", "comment")).toEqual(["/* chú thích */"]);
  });

  it("mã HEX trong khối là number, không phải selector #id", () => {
    expect(textsOf(".a { color: #C2347A; }", "css", "number")).toEqual(["#C2347A"]);
    expect(textsOf("#main { color: red; }", "css", "type")).toEqual(["#main"]);
  });

  it("selector lồng (&) trong khối", () => {
    const tokens = marks(".a { &:hover { color: red; } }", "css");
    expect(tokens).toContainEqual(["keyword", ":hover"]);
    expect(tokens).toContainEqual(["property", "color"]);
  });
});

describe("tokenizeCode — Bash", () => {
  it("comment chỉ khi # đứng đầu hoặc sau khoảng trắng", () => {
    expect(textsOf("# đầu dòng\nnpm i # sau lệnh", "bash", "comment")).toEqual(["# đầu dòng", "# sau lệnh"]);
    expect(textsOf("echo a#b", "bash", "comment")).toEqual([]);
  });

  it("lệnh ở đầu dòng, sau $, |, &&, ;, sudo là function", () => {
    expect(textsOf(SAMPLES.bash, "bash", "function")).toEqual(["npm", "curl", "sudo", "bash", "echo", "export"]);
    expect(textsOf("$ ls -la", "bash", "punct")).toContain("$");
  });

  it("cờ, biến, chuỗi, số", () => {
    const code = SAMPLES.bash;
    expect(textsOf(code, "bash", "attr")).toEqual(["--save-dev", "-fsSL"]);
    expect(textsOf(code, "bash", "variable")).toEqual([]);
    expect(textsOf(code, "bash", "string")).toEqual([`"$HOME"`, `'\${x}'`]);
    expect(textsOf("echo $HOME ${PATH} $1", "bash", "variable")).toEqual(["$HOME", "${PATH}", "$1"]);
    expect(textsOf("sleep 10", "bash", "number")).toEqual(["10"]);
  });
});

describe("tokenizeCode — JSON / HTML / Markdown", () => {
  it("JSON: khoá là property, giá trị là string/number/keyword", () => {
    const code = SAMPLES.json;
    expect(textsOf(code, "json", "property")).toEqual([`"name"`, `"homepage"`, `"n"`, `"ok"`, `"x"`]);
    expect(textsOf(code, "json", "string")).toEqual([`"yugen-ui"`, `"https://yugen.dev"`]);
    expect(textsOf(code, "json", "number")).toEqual(["-1.5e2"]);
    expect(textsOf(code, "json", "keyword")).toEqual(["true", "null"]);
  });

  it("JSON có comment (jsonc)", () => {
    expect(textsOf(`{\n  // ghi chú\n  "a": 1\n}`, "json", "comment")).toEqual(["// ghi chú"]);
  });

  it("HTML: doctype, comment, thẻ, thuộc tính, entity", () => {
    const code = SAMPLES.html;
    expect(textsOf(code, "html", "keyword")).toEqual(["<!DOCTYPE html>"]);
    expect(textsOf(code, "html", "comment")).toEqual(["<!-- note -->"]);
    expect(textsOf(code, "html", "tag")).toEqual(["<a", ">", "</a", ">"]);
    expect(textsOf(code, "html", "attr")).toEqual(["class", "href"]);
    expect(textsOf(code, "html", "number")).toEqual(["&amp;"]);
  });

  it("Markdown: heading, quote, list, đậm, nghiêng, code, link, fence", () => {
    const code = SAMPLES.md;
    expect(textsOf(code, "md", "heading")).toEqual(["# Tiêu đề"]);
    expect(textsOf(code, "md", "comment")).toEqual(["> trích dẫn"]);
    expect(textsOf(code, "md", "keyword")).toEqual(["-"]);
    expect(textsOf(code, "md", "strong")).toEqual(["**đậm**"]);
    expect(textsOf(code, "md", "emphasis")).toEqual(["*nghiêng*"]);
    expect(textsOf(code, "md", "link")).toEqual(["[link](https://yugen.dev)"]);
    expect(textsOf(code, "md", "string")).toEqual(["`code`", "```ts\nconst a = 1;\n```"]);
  });

  it("Markdown: gạch dưới giữa từ (snake_case) không phải nghiêng", () => {
    expect(textsOf("dùng my_var_name ở đây", "md", "emphasis")).toEqual([]);
    expect(textsOf("_nghiêng_ thật", "md", "emphasis")).toEqual(["_nghiêng_"]);
  });
});

describe("parseLineRanges", () => {
  const sorted = (spec?: string | number[]) => [...parseLineRanges(spec)].sort((a, b) => a - b);

  it("danh sách + khoảng", () => {
    expect(sorted("1,3-5")).toEqual([1, 3, 4, 5]);
    expect(sorted("2,4-6")).toEqual([2, 4, 5, 6]);
  });

  it("khoảng ngược, khoảng trắng, trùng lặp", () => {
    expect(sorted(" 5 - 3 , 4 ,1")).toEqual([1, 3, 4, 5]);
    expect(sorted("7-7")).toEqual([7]);
  });

  it("bỏ qua phần rỗng / không phải số", () => {
    expect(sorted("1,,x,3")).toEqual([1, 3]);
    expect(sorted("")).toEqual([]);
    expect(sorted(undefined)).toEqual([]);
  });

  it("nhận mảng số", () => {
    expect(sorted([4, 2, 2])).toEqual([2, 4]);
    expect(sorted([])).toEqual([]);
  });
});

describe("packageManagerCommand", () => {
  it("install cho từng trình quản lý", () => {
    expect(packageManagerCommand("npm", "yugen-ui")).toBe("npm install yugen-ui");
    expect(packageManagerCommand("pnpm", "yugen-ui")).toBe("pnpm add yugen-ui");
    expect(packageManagerCommand("yarn", "yugen-ui")).toBe("yarn add yugen-ui");
    expect(packageManagerCommand("bun", "yugen-ui")).toBe("bun add yugen-ui");
  });

  it("devDependency: -D (bun dùng -d)", () => {
    expect(packageManagerCommand("npm", "vitest", { dev: true })).toBe("npm install -D vitest");
    expect(packageManagerCommand("pnpm", "vitest", { dev: true })).toBe("pnpm add -D vitest");
    expect(packageManagerCommand("yarn", "vitest", { dev: true })).toBe("yarn add -D vitest");
    expect(packageManagerCommand("bun", "vitest", { dev: true })).toBe("bun add -d vitest");
  });

  it("nhiều gói", () => {
    expect(packageManagerCommand("pnpm", ["react", "react-dom"])).toBe("pnpm add react react-dom");
  });

  it("dlx", () => {
    const cmd = "shadcn@latest add button";
    expect(packageManagerCommand("npm", cmd, { command: "dlx" })).toBe(`npx ${cmd}`);
    expect(packageManagerCommand("pnpm", cmd, { command: "dlx" })).toBe(`pnpm dlx ${cmd}`);
    expect(packageManagerCommand("yarn", cmd, { command: "dlx" })).toBe(`yarn dlx ${cmd}`);
    expect(packageManagerCommand("bun", cmd, { command: "dlx" })).toBe(`bunx ${cmd}`);
    // dlx bỏ qua dev.
    expect(packageManagerCommand("npm", "x", { command: "dlx", dev: true })).toBe("npx x");
  });
});

describe("CodeBlock (render)", () => {
  it("luôn dir=ltr, dòng nhấn mạnh, số dòng, tô màu token", () => {
    const { container } = render(
      <CodeBlock code={"const a = 1;\nconst b = 2;\nconst c = 3;\n"} language="ts" showLineNumbers highlightLines="2" />,
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveAttribute("dir", "ltr");
    const lines = container.querySelectorAll("code > span");
    // Dấu xuống dòng cuối không tạo dòng trống.
    expect(lines).toHaveLength(3);
    expect(lines[1].className).toContain("bg-brand-background-2");
    expect(lines[0].className).not.toContain("bg-brand-background-2");
    expect(lines[2].textContent).toBe("3const c = 3;");
    expect(container.querySelector(".text-lavender-fg")?.textContent).toBe("const");
  });

  it("diff: đánh dấu +/-, đọc được bằng trình đọc màn hình", () => {
    render(<CodeBlock diff language="ts" code={"-const a = 1;\n+const a = 2;\n const b = 3;"} />);
    expect(screen.getByText("Xoá:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Thêm:", { exact: false })).toBeInTheDocument();
  });

  it("có tiêu đề → phần đầu có nhãn ngôn ngữ, nút sao chép và nút xuống dòng", () => {
    render(<CodeBlock filename="Button.tsx" code="<Button />" />);
    expect(screen.getByText("Button.tsx")).toBeInTheDocument();
    expect(screen.getByText("TSX")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sao chép" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xuống dòng" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("CodeBlock messages", () => {
  it("messages tiếng Anh", () => {
    render(
      <YugenProvider messages={{ codeBlock: codeBlockMessagesEn, copyCodeButton: copyCodeButtonMessagesEn }}>
        <CodeBlock code="const a = 1;" title="Example" />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Word wrap" })).toHaveAttribute("title", "Turn on word wrap");
  });
});
