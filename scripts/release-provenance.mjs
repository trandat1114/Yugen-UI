#!/usr/bin/env node
/**
 * Release assets for a package this workflow just published to npm (release.yml, release-cli.yml): the tarball and the
 * SLSA provenance npm recorded at publish time, so the GitHub Release carries both (OpenSSF Scorecard, Signed-Releases).
 *
 *   node scripts/release-provenance.mjs <dir> <name@version>=<file.tgz> [<name@version>=<file.tgz> …]
 *
 * For each package:
 * - waits until the registry lists the version (it can lag a few minutes behind `npm publish`);
 * - checks that the registry's sha512 equals the local tarball's. A version published earlier from another tarball
 *   (create-yugen-ui not bumped with a CLI patch) is skipped with a notice;
 * - takes the provenance (Sigstore bundle, predicate https://slsa.dev/provenance/v1), checks that its subject is this
 *   package with the same sha512 and writes it to <file.tgz>.intoto.jsonl.
 *
 * Prints the files to upload (tarball, provenance), one per line. Any other failure exits with code 1.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REGISTRY = "https://registry.npmjs.org";
export const SLSA_PROVENANCE = "https://slsa.dev/provenance/v1";

export function parseSpec(arg) {
  const eq = arg.indexOf("=");
  const spec = eq === -1 ? "" : arg.slice(0, eq);
  const at = spec.lastIndexOf("@");
  if (at <= 0 || eq === arg.length - 1) throw new Error(`Expected <name@version>=<file.tgz>, got "${arg}"`);
  return { name: spec.slice(0, at), version: spec.slice(at + 1), file: arg.slice(eq + 1) };
}

export const sha512Hex = (buf) => crypto.createHash("sha512").update(buf).digest("hex");

/** "sha512-<base64>" (possibly among other hashes) → hex, or null. */
export function integrityToHex(integrity) {
  const token = String(integrity ?? "")
    .split(/\s+/)
    .find((t) => t.startsWith("sha512-"));
  return token ? Buffer.from(token.slice("sha512-".length), "base64").toString("hex") : null;
}

/** In-toto statement of a Sigstore bundle with a DSSE envelope. */
export function statementOf(bundle) {
  const payload = bundle?.dsseEnvelope?.payload;
  if (!payload) throw new Error("Provenance bundle has no DSSE envelope");
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
}

/** purl of an npm package: the scope's "@" is percent-encoded (pkg:npm/%40scope/name@1.0.0). */
export const npmPurl = (name, version) => `pkg:npm/${name.replace(/^@/, "%40")}@${version}`;

export function provenanceMatches(bundle, name, version, sha512) {
  const statement = statementOf(bundle);
  return (
    statement.predicateType === SLSA_PROVENANCE &&
    Array.isArray(statement.subject) &&
    statement.subject.some((s) => s?.name === npmPurl(name, version) && s?.digest?.sha512 === sha512)
  );
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function waitForJson(url, { tries = 40, delayMs = 15_000 } = {}) {
  for (let i = 1; ; i++) {
    const json = await getJson(url);
    if (json) return json;
    if (i >= tries) throw new Error(`${url}: still 404 after ${tries} tries`);
    console.error(`Waiting for ${url} (${i}/${tries})…`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

export async function releaseAssets(dir, args) {
  const files = [];
  for (const arg of args) {
    const { name, version, file } = parseSpec(arg);
    const spec = `${name}@${version}`;
    const tarball = path.join(dir, file);
    const local = sha512Hex(fs.readFileSync(tarball));

    const meta = await waitForJson(`${REGISTRY}/${name.replace("/", "%2f")}/${version}`);
    if (integrityToHex(meta.dist?.integrity) !== local) {
      console.error(`::notice::${spec} on npm was not published from ${file} — not attached.`);
      continue;
    }

    const url = meta.dist?.attestations?.url;
    if (!url) throw new Error(`${spec} has no provenance on npm`);
    const { attestations = [] } = await waitForJson(url);
    const slsa = attestations.find((a) => a.predicateType === SLSA_PROVENANCE);
    if (!slsa) throw new Error(`${spec}: no ${SLSA_PROVENANCE} attestation`);
    if (!provenanceMatches(slsa.bundle, name, version, local)) throw new Error(`${spec}: provenance subject does not match ${file}`);

    const out = `${tarball}.intoto.jsonl`;
    fs.writeFileSync(out, JSON.stringify(slsa.bundle) + "\n");
    console.error(`${spec}: ${file} + ${path.basename(out)}`);
    files.push(tarball, out);
  }
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [dir, ...args] = process.argv.slice(2);
  if (!dir || args.length === 0) {
    console.error("Usage: node scripts/release-provenance.mjs <dir> <name@version>=<file.tgz> […]");
    process.exit(1);
  }
  releaseAssets(dir, args).then(
    (files) => files.forEach((f) => console.log(f)),
    (err) => {
      console.error(`::error::${err.message}`);
      process.exit(1);
    },
  );
}
