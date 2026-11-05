#!/usr/bin/env node
/**
 * Dependency policy for a published package (#383), configured in `deps-policy.json` next to its package.json.
 *
 * Packs the package (`npm pack`), installs the tarball in an empty temp project the way an app does, without install
 * scripts and without peer dependencies, walks the installed tree (nested node_modules and scoped packages too), and
 * fails when:
 *   - more packages are installed than `maxPackages` (the package itself is not counted);
 *   - a package has a preinstall / install / postinstall script, or a binding.gyp (npm builds it on install);
 *   - a package's last publish on the registry is more than 5 years old (rule "unmaintained");
 *   - the installed version of a direct dependency has no provenance attestation (rule "provenance");
 *   - the installed version was published by another npm account than the version before it (rule "publisher", what
 *     Socket reports as "unstable ownership").
 * The last three can be accepted in `allow`: { "name", "reason", "review": "YYYY-MM-DD", "rules": [<rule>, …] }.
 * An entry that no longer matches anything, or whose review date has passed, is a warning.
 *
 *   node scripts/check-deps.mjs                  # the root package (yugen-ui), policy in ./deps-policy.json
 *   node scripts/check-deps.mjs packages/cli     # another package, policy in packages/cli/deps-policy.json
 *   node scripts/check-deps.mjs --policy file    # another policy file
 *   node scripts/check-deps.mjs --json           # the result as JSON on stdout
 *   node scripts/check-deps.mjs --write          # set maxPackages to the current count (after removing a dependency)
 *
 * The install resolves the version ranges against the registry (not package-lock.json), as an app's install does.
 * Needs network access to the npm registry. Node built-ins only.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const RULES = ["unmaintained", "provenance", "publisher"];
const MAX_AGE_YEARS = 5;
const INSTALL_SCRIPTS = ["preinstall", "install", "postinstall"];
const REGISTRY = (process.env.npm_config_registry || "https://registry.npmjs.org/").replace(/\/?$/, "/");
const DAY = 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const positional = args.filter((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--policy");
const asJson = args.includes("--json");
const write = args.includes("--write");
const pkgDir = path.resolve(positional[0] ?? ".");
const policyFile = path.resolve(option("--policy") ?? path.join(pkgDir, "deps-policy.json"));
const log = (line = "") => {
  if (!asJson) console.log(line);
};

function fail(message) {
  console.error(`check-deps: ${message}`);
  process.exit(1);
}

// ---------- policy ----------

function readPolicy() {
  let policy;
  try {
    policy = JSON.parse(fs.readFileSync(policyFile, "utf8"));
  } catch (e) {
    fail(`cannot read ${policyFile}: ${e.message}`);
  }
  const errors = [];
  if (!Number.isInteger(policy.maxPackages) || policy.maxPackages < 0) errors.push("`maxPackages` must be a whole number.");
  if (!Array.isArray(policy.allow ?? [])) errors.push("`allow` must be an array.");
  for (const [i, entry] of (policy.allow ?? []).entries()) {
    const where = `allow[${i}]${entry?.name ? ` (${entry.name})` : ""}`;
    if (typeof entry?.name !== "string" || !entry.name) errors.push(`${where}: \`name\` is missing.`);
    if (typeof entry?.reason !== "string" || !entry.reason.trim()) errors.push(`${where}: \`reason\` is missing.`);
    if (typeof entry?.review !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.review) || Number.isNaN(Date.parse(entry.review)))
      errors.push(`${where}: \`review\` must be a date (YYYY-MM-DD).`);
    if (!Array.isArray(entry?.rules) || !entry.rules.length || entry.rules.some((rule) => !RULES.includes(rule)))
      errors.push(`${where}: \`rules\` must list one or more of ${RULES.map((r) => `"${r}"`).join(", ")}.`);
  }
  if (errors.length) fail(`${path.relative(process.cwd(), policyFile)}:\n  ${errors.join("\n  ")}`);
  return { maxPackages: policy.maxPackages, allow: policy.allow ?? [], raw: policy };
}

// ---------- npm ----------

/** npm's own CLI script run with this Node (no shell, so paths with spaces are safe); `npm` on the PATH otherwise. */
function npmCommand() {
  const bin = path.dirname(process.execPath);
  const cli = [
    process.env.npm_execpath,
    path.join(bin, "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(bin, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ].find((file) => file && /npm-cli\.js$/.test(file) && fs.existsSync(file));
  return cli ? { command: process.execPath, prefix: [cli], shell: false } : { command: "npm", prefix: [], shell: process.platform === "win32" };
}

/**
 * No options of an npm command that started this script (`npm publish --dry-run`, `--tag`, `--global`…) reach the
 * pack and install below; registry, proxy, certificate and config file settings do.
 */
const KEEP_NPM_CONFIG = /^npm_config_(registry|@[^:]+:registry|userconfig|globalconfig|cache|proxy|https_proxy|noproxy|cafile|strict_ssl)$/i;
const npmEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^npm_config_/i.test(key) || KEEP_NPM_CONFIG.test(key)));

function npm(cwd, npmArgs) {
  const { command, prefix, shell } = npmCommand();
  const run = spawnSync(command, [...prefix, ...npmArgs], { cwd, env: npmEnv, encoding: "utf8", shell, maxBuffer: 64 * 1024 * 1024 });
  if (run.error) throw run.error;
  if (run.status !== 0) throw new Error(`npm ${npmArgs.join(" ")} failed with exit code ${run.status}:\n${run.stderr || run.stdout}`);
  return run.stdout;
}

// ---------- installed tree ----------

/** Every package under `nodeModules`, nested node_modules and scoped packages included. */
function walk(base, nodeModules, out = []) {
  if (!fs.existsSync(nodeModules)) return out;
  const visit = (dir) => {
    const file = path.join(dir, "package.json");
    if (!fs.existsSync(file)) return;
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    const scripts = INSTALL_SCRIPTS.filter((name) => manifest.scripts?.[name]);
    // npm runs `node-gyp rebuild` for a binding.gyp when the package has no install / preinstall script of its own.
    if (!manifest.scripts?.install && !manifest.scripts?.preinstall && fs.existsSync(path.join(dir, "binding.gyp"))) scripts.push("install (binding.gyp)");
    out.push({
      name: manifest.name,
      version: manifest.version,
      location: path.relative(base, dir).split(path.sep).join("/"),
      dependencies: { ...manifest.optionalDependencies, ...manifest.dependencies },
      installScripts: scripts,
    });
    walk(base, path.join(dir, "node_modules"), out);
  };
  for (const entry of fs.readdirSync(nodeModules)) {
    if (entry.startsWith(".")) continue;
    const dir = path.join(nodeModules, entry);
    if (entry.startsWith("@")) for (const scoped of fs.readdirSync(dir)) visit(path.join(dir, scoped));
    else visit(dir);
  }
  return out;
}

// ---------- registry ----------

async function packument(name) {
  const url = REGISTRY + name.replace("/", "%2f");
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/** Runs `task` for every item, `limit` at a time. */
async function pool(items, limit, task) {
  const results = new Map();
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) {
        const item = queue.shift();
        results.set(item, await task(item));
      }
    }),
  );
  return results;
}

/** Date of the newest version still on the registry. */
function lastPublish(doc) {
  const times = Object.keys(doc.versions ?? {})
    .map((version) => Date.parse(doc.time?.[version]))
    .filter((time) => !Number.isNaN(time));
  return times.length ? new Date(Math.max(...times)) : doc.time?.modified ? new Date(doc.time.modified) : undefined;
}

/** The npm accounts that published `version` and the version before it, when they differ. */
function publisherChange(doc, version) {
  const ordered = Object.keys(doc.versions ?? {})
    .filter((v) => doc.time?.[v])
    .sort((a, b) => Date.parse(doc.time[a]) - Date.parse(doc.time[b]));
  const previous = ordered[ordered.indexOf(version) - 1];
  const user = (v) => doc.versions[v]?._npmUser?.name;
  if (!previous || !user(version) || !user(previous) || user(version) === user(previous)) return undefined;
  return { previous, from: user(previous), to: user(version) };
}

// ---------- check ----------

async function main() {
  const policy = readPolicy();
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "check-deps-"));
  try {
    log(`check-deps: ${pkg.name}@${pkg.version} (${path.relative(process.cwd(), pkgDir) || "."}), policy ${path.relative(process.cwd(), policyFile)}`);
    const packed = JSON.parse(npm(pkgDir, ["pack", "--json", "--ignore-scripts", "--pack-destination", temp]));
    const tarball = path.join(temp, packed[0].filename);
    const project = path.join(temp, "app");
    fs.mkdirSync(project);
    fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ name: "check-deps-app", version: "0.0.0", private: true }));
    npm(project, ["install", tarball, "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund", "--no-package-lock", "--loglevel=error"]);

    const tree = walk(project, path.join(project, "node_modules"));
    const self = tree.find((p) => p.location === `node_modules/${pkg.name}`);
    if (!self) throw new Error(`${pkg.name} is not in the installed tree`);
    const packages = tree.filter((p) => p !== self).sort((a, b) => a.name.localeCompare(b.name) || a.location.localeCompare(b.location));
    // The installed copy of each direct dependency: nested under the package when npm could not hoist it.
    const direct = new Set(
      Object.keys(self.dependencies)
        .map(
          (name) =>
            packages.find((p) => p.location === `${self.location}/node_modules/${name}`) ?? packages.find((p) => p.location === `node_modules/${name}`),
        )
        .filter(Boolean),
    );

    const docs = await pool([...new Set(packages.map((p) => p.name))], 8, packument);
    const now = Date.now();
    const used = new Set();
    const allowed = (name, rule) => {
      const entry = policy.allow.find((e) => e.name === name && e.rules.includes(rule));
      if (entry) used.add(`${entry.name}\u0000${rule}`);
      return Boolean(entry);
    };

    const problems = [];
    const rows = packages.map((p) => {
      const doc = docs.get(p.name);
      const published = lastPublish(doc);
      const provenance = Boolean(doc.versions?.[p.version]?.dist?.attestations);
      const row = {
        name: p.name,
        version: p.version,
        location: p.location,
        direct: direct.has(p),
        lastPublish: published?.toISOString().slice(0, 10) ?? null,
        provenance,
        installScripts: p.installScripts,
        allowed: [],
        problems: [],
      };
      const flag = (rule, message) => {
        if (allowed(p.name, rule)) row.allowed.push(rule);
        else row.problems.push(message);
      };
      if (p.installScripts.length) row.problems.push(`has an install script (${p.installScripts.join(", ")})`);
      if (!published) row.problems.push("no publish date on the registry");
      else if (now - published.getTime() > MAX_AGE_YEARS * 365.25 * DAY)
        flag("unmaintained", `last published ${row.lastPublish}, more than ${MAX_AGE_YEARS} years ago`);
      if (row.direct && !provenance) flag("provenance", `direct dependency without provenance (${p.version})`);
      const change = publisherChange(doc, p.version);
      if (change) flag("publisher", `published by npm user "${change.to}"; ${change.previous} was published by "${change.from}"`);
      for (const message of row.problems) problems.push(`${p.name}@${p.version}: ${message}`);
      return row;
    });

    const count = packages.length;
    if (count > policy.maxPackages)
      problems.unshift(
        `${count} packages are installed with ${pkg.name}; the budget (maxPackages) is ${policy.maxPackages}. ` +
          "Drop the new dependency, or raise maxPackages in the policy and give the reason in the PR.",
      );

    const warnings = [];
    if (count < policy.maxPackages && !write) warnings.push(`${count} packages, below the budget of ${policy.maxPackages}: lower maxPackages (run with --write).`);
    const today = new Date(now).toISOString().slice(0, 10);
    for (const entry of policy.allow) {
      const idle = entry.rules.filter((rule) => !used.has(`${entry.name}\u0000${rule}`));
      if (idle.length) warnings.push(`allow "${entry.name}" (${idle.join(", ")}) no longer matches a package: remove it.`);
      if (entry.review < today) warnings.push(`allow "${entry.name}": review date ${entry.review} has passed.`);
    }

    if (write && count !== policy.maxPackages) {
      fs.writeFileSync(policyFile, `${JSON.stringify({ ...policy.raw, maxPackages: count }, null, 2)}\n`);
      log(`maxPackages: ${policy.maxPackages} -> ${count} (${path.relative(process.cwd(), policyFile)})`);
    }

    if (asJson) {
      console.log(JSON.stringify({ package: `${pkg.name}@${pkg.version}`, installed: count, maxPackages: policy.maxPackages, packages: rows, problems, warnings, ok: !problems.length }, null, 2));
    } else {
      const table = [
        ["Package", "Version", "Direct", "Last publish", "Provenance", "Result"],
        ...rows.map((r) => [
          r.location.split("/node_modules/").length > 2 ? `${r.name} (nested)` : r.name,
          r.version,
          r.direct ? "yes" : "",
          r.lastPublish ?? "?",
          r.provenance ? "yes" : "no",
          r.problems.length ? "FAIL" : r.allowed.length ? `allowed: ${r.allowed.join(", ")}` : "ok",
        ]),
      ];
      const widths = table[0].map((_, i) => Math.max(...table.map((cells) => cells[i].length)));
      const line = (cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd();
      log();
      log(line(table[0]));
      log(line(widths.map((w) => "-".repeat(w))));
      for (const cells of table.slice(1)) log(line(cells));
      log();
      log(`${count} packages installed with ${pkg.name} (budget ${policy.maxPackages}), ${direct.size} direct, ${rows.filter((r) => !r.provenance).length} without provenance.`);
      for (const warning of warnings) console.warn(`warning: ${warning}`);
      if (problems.length) console.error(`\n${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
      else log("Dependency policy: OK.");
    }
    if (problems.length) process.exitCode = 1;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

main().catch((e) => fail(e.stack ?? String(e)));
