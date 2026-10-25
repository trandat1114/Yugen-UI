#!/usr/bin/env node
/**
 * Thử gói đúng như người dùng nhận từ npm, không publish gì:
 * npm pack yugen + create-yugen-ui → cài hai file .tgz vào thư mục tạm → `create-yugen-ui` cho mọi template + vài lệnh yugen.
 *
 *   npm run smoke                 # trong packages/cli (npm pack chạy build qua prepack)
 *   node scripts/smoke.mjs --keep # giữ thư mục tạm để mở ra xem
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const createDir = path.resolve(cli, "../create-yugen-ui");
const keep = process.argv.includes("--keep");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const { name, version } = readJson(path.join(cli, "package.json"));
const createVersion = readJson(path.join(createDir, "package.json")).version;
/** npm pack: "@yugen-ui/cli" → yugen-ui-cli-<version>.tgz */
const tarball = (pkgName, v) => `${pkgName.replace(/^@/, "").replace("/", "-")}-${v}.tgz`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-smoke-"));
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CI: "1" } });
const q = (p) => `"${p}"`;
let failed = 0;
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};

try {
  sh(`npm pack --pack-destination ${q(tmp)}`, cli);
  sh(`npm pack --pack-destination ${q(tmp)}`, createDir);
  const tarballs = [tarball(name, version), tarball("create-yugen-ui", createVersion)].map((f) => path.join(tmp, f));
  check(tarballs.every((f) => fs.existsSync(f)), `npm pack → ${tarballs.map((f) => path.basename(f)).join(", ")}`);

  const app = path.join(tmp, "consumer");
  fs.mkdirSync(app);
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "consumer", private: true }));
  sh(`npm install --no-audit --no-fund ${tarballs.map(q).join(" ")}`, app);
  const installed = path.join(app, "node_modules", name);
  const yugen = `node ${q(path.join(installed, "dist/index.js"))}`;
  const createBin = `node ${q(path.join(app, "node_modules/create-yugen-ui/index.js"))}`;

  check(sh(`${yugen} --version`, app).trim() === version, `yugen --version = ${version}`);
  check(sh(`${yugen} --help`, app).includes("Commands:"), "yugen --help");
  // `npx @yugen-ui/cli` chạy bin duy nhất của gói — bin phải được link với tên "yugen".
  check(fs.readdirSync(path.join(app, "node_modules/.bin")).some((f) => /^yugen(\.cmd)?$/.test(f)), "bin yugen linked");

  const templates = readJson(path.join(installed, "templates/templates.json"));
  for (const t of templates) {
    const dir = `app-${t.name}`;
    sh(`${createBin} ${dir} -t ${t.name} --no-install --no-git -y`, app);
    const target = path.join(app, dir);
    const pkg = readJson(path.join(target, "package.json"));
    check(
      pkg.name === dir && !!pkg.dependencies?.["yugen-ui"] && fs.existsSync(path.join(target, ".gitignore")) && !fs.existsSync(path.join(target, "_gitignore")),
      `create-yugen-ui -t ${t.name} (yugen-ui ${pkg.dependencies?.["yugen-ui"]})`,
    );
  }

  // --lang: starter bằng tiếng Việt chỉ còn file vi, <html lang="vi">.
  sh(`${createBin} app-vi -t starter --lang vi --no-install --no-git -y`, app);
  const vi = path.join(app, "app-vi");
  check(
    fs.readFileSync(path.join(vi, "src/content/index.ts"), "utf8").includes('"./vi"') &&
      !fs.existsSync(path.join(vi, "src/content/en.ts")) &&
      fs.readFileSync(path.join(vi, "index.html"), "utf8").includes('<html lang="vi"'),
    "create-yugen-ui -t starter --lang vi",
  );
  // Blog: bài viết theo ngôn ngữ trong src/content/<lang>/posts — thư mục của ngôn ngữ kia bị xoá.
  sh(`${createBin} blog-vi -t blog --lang vi --no-install --no-git -y`, app);
  const blogVi = path.join(app, "blog-vi");
  check(
    fs.existsSync(path.join(blogVi, "src/content/vi/posts")) &&
      !fs.existsSync(path.join(blogVi, "src/content/en")) &&
      !fs.existsSync(path.join(blogVi, "src/content/en.ts")),
    "create-yugen-ui -t blog --lang vi",
  );

  let unknownFails = false;
  try {
    sh(`${createBin} x -t nope -y --no-install --no-git`, app);
  } catch {
    unknownFails = true;
  }
  check(unknownFails, "unknown template exits with an error");
} catch (e) {
  failed++;
  console.error(`✗ ${e.message}\n${e.stdout ?? ""}${e.stderr ?? ""}`);
} finally {
  if (keep) console.log(`\nkept: ${tmp}`);
  else fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(failed ? `\nsmoke: ${failed} failed` : "\nsmoke: OK");
process.exit(failed ? 1 : 0);
