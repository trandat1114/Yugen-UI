#!/usr/bin/env node
/**
 * Versioned registry snapshots for `@yugen-ui/cli` (#381).
 *
 * The CLI ships the sha256 of every registry item of the yugen-ui version it targets and fetches the items from
 * <docs>/r/<version>/. Both sides build that snapshot here, from the release tag, so a later docs deploy (or a `next`
 * deploy) never changes what a released CLI installs:
 *   - pages.yml writes every snapshot into dist-docs/r/<version>/ (`--all`);
 *   - packages/cli/scripts/registry-integrity.mjs hashes the snapshot of the version its templates pin.
 *
 * A snapshot runs the `scripts/build-registry.mjs` of the ref itself on `git archive` of that ref, with REGISTRY_URL set to
 * the versioned path, so item URLs point inside the snapshot.
 *
 *   node scripts/registry-snapshot.mjs --version 1.0.0 --out <dir>    # tag v1.0.0; HEAD (with a warning) when the tag is missing
 *   node scripts/registry-snapshot.mjs --version 1.0.0 --out <dir> --require-tag
 *   node scripts/registry-snapshot.mjs --all --out dist-docs/r          # each tag from FIRST_VERSION on (canaries too), plus the current version
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** First yugen-ui version a verifying CLI can target. Older tags keep serving from /r/ only. */
export const FIRST_VERSION = "0.16.0";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (args, opts = {}) => execFileSync("git", args, { cwd: root, encoding: "utf8", ...opts });

const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const parse = (v) => v.split("-")[0].split(".").map(Number);
/** Semver order; a prerelease sorts before its release. */
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || Number(!a.includes("-")) - Number(!b.includes("-")) || a.localeCompare(b);
};

/** <homepage>/r/<version>, e.g. https://trandat1114.github.io/Yugen-UI/r/1.0.0 */
export function snapshotUrl(homepage, version) {
  return new URL(`r/${version}`, homepage.endsWith("/") ? homepage : `${homepage}/`).href;
}

export function hasTag(version) {
  try {
    git(["rev-parse", "--verify", "--quiet", `refs/tags/v${version}`], { stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

/** Builds the registry of `ref` into `out` (replaced). Returns the number of item files. */
export function buildSnapshot({ ref, version, out }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-registry-"));
  try {
    const tar = path.join(tmp, "src.tar");
    git(["archive", "--format=tar", "-o", tar, ref, "package.json", "scripts", "src"]);
    const dir = path.join(tmp, "tree");
    fs.mkdirSync(dir);
    // Relative paths: GNU tar reads "C:\…" as host:path.
    execFileSync("tar", ["-xf", "src.tar", "-C", "tree"], { cwd: tmp });
    const { homepage } = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    execFileSync(process.execPath, [path.join(dir, "scripts", "build-registry.mjs")], {
      cwd: dir,
      stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, REGISTRY_URL: snapshotUrl(homepage, version) },
    });
    fs.rmSync(out, { recursive: true, force: true });
    fs.cpSync(path.join(dir, "public", "r"), out, { recursive: true });
    return fs.readdirSync(out).filter((f) => f.endsWith(".json")).length;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** Ref of a version: its tag, else HEAD when HEAD carries that version (release commit before the tag exists). */
export function refFor(version, { requireTag = false } = {}) {
  if (hasTag(version)) return `v${version}`;
  if (requireTag) throw new Error(`registry-snapshot: tag v${version} not found (fetch tags, or release yugen-ui ${version} first).`);
  const head = JSON.parse(git(["show", "HEAD:package.json"])).version;
  if (head !== version) throw new Error(`registry-snapshot: no tag v${version} and HEAD is ${head}.`);
  console.warn(`registry-snapshot: tag v${version} not found, using HEAD.`);
  return "HEAD";
}

function main(argv) {
  const arg = (name) => {
    const i = argv.indexOf(name);
    return i === -1 ? undefined : argv[i + 1];
  };
  const out = arg("--out");
  if (!out) throw new Error("registry-snapshot: --out <dir> is required.");

  if (argv.includes("--all")) {
    const versions = git(["tag", "-l", "v*"])
      .split(/\r?\n/)
      .map((t) => t.slice(1))
      .filter((v) => VERSION.test(v) && compare(v, FIRST_VERSION) >= 0);
    const current = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    if (VERSION.test(current) && compare(current, FIRST_VERSION) >= 0 && !versions.includes(current)) versions.push(current);
    for (const version of versions.sort(compare)) {
      const count = buildSnapshot({ ref: refFor(version), version, out: path.join(out, version) });
      console.log(`registry-snapshot: ${version} → ${path.join(out, version)} (${count} files)`);
    }
    return;
  }

  const version = arg("--version");
  if (!version) throw new Error("registry-snapshot: --version <x.y.z> or --all is required.");
  const count = buildSnapshot({ ref: refFor(version, { requireTag: argv.includes("--require-tag") }), version, out: path.resolve(out) });
  console.log(`registry-snapshot: ${version} → ${out} (${count} files)`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
