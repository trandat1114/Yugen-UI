#!/usr/bin/env node
/**
 * dist/registry-integrity.json (#381): sha256 of every registry item of the yugen-ui version the bundled templates pin
 * (the root package.json version). `yugen add` / `init` / `update` / `diff` fetch those items from <docs>/r/<version>/
 * and stop when one doesn't match.
 *
 * The snapshot comes from tag v<version> (scripts/registry-snapshot.mjs at the repository root), the same way pages.yml
 * builds <docs>/r/<version>/. Without the tag (a development build) it uses HEAD with a warning; REGISTRY_REQUIRE_TAG=1
 * (release-cli.yml) makes a missing tag an error.
 *
 *   node scripts/registry-integrity.mjs     # runs in `npm run build`, after tsc
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(cli, "../..");
const { buildSnapshot, refFor } = await import(pathToFileURL(path.join(root, "scripts/registry-snapshot.mjs")).href);
const { itemDigest } = await import(pathToFileURL(path.join(cli, "dist/lib/integrity.js")).href);

const { version } = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const out = path.join(cli, "dist", "registry-integrity.json");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-integrity-"));
try {
  const ref = refFor(version, { requireTag: process.env.REGISTRY_REQUIRE_TAG === "1" });
  buildSnapshot({ ref, version, out: tmp });
  const items = Object.fromEntries(
    fs
      .readdirSync(tmp)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => [f.slice(0, -".json".length), itemDigest(JSON.parse(fs.readFileSync(path.join(tmp, f), "utf8")))]),
  );
  fs.writeFileSync(out, `${JSON.stringify({ version, ref, items }, null, 2)}\n`);
  console.log(`registry-integrity: ${Object.keys(items).length} items of yugen-ui ${version} (${ref}) → dist/registry-integrity.json`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
