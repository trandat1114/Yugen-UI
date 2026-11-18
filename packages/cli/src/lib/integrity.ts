import { createHash } from "node:crypto";
import fs from "node:fs";

/**
 * Checksums of the registry the CLI targets (#381), written at build time by scripts/registry-integrity.mjs into
 * dist/registry-integrity.json: one sha256 per item of the yugen-ui `version` that the bundled templates pin. The items
 * themselves come from <docs>/r/<version>/ (scripts/registry-snapshot.mjs at the repository root).
 */
export interface RegistryIntegrity {
  version: string;
  items: Record<string, string>;
}

const stable = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(obj)
        .sort()
        .map((k) => [k, stable(obj[k])]),
    );
  }
  return value;
};

/** "sha256-<base64>" of the item with sorted keys, so whitespace and key order of the JSON file don't matter. */
export const itemDigest = (item: unknown) => `sha256-${createHash("sha256").update(JSON.stringify(stable(item))).digest("base64")}`;

/** Bundled checksums, or null in a development build without them. */
export function loadIntegrity(file: URL | string = new URL("../registry-integrity.json", import.meta.url)): RegistryIntegrity | null {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as RegistryIntegrity;
    return typeof data.version === "string" && data.items && typeof data.items === "object" ? data : null;
  } catch {
    return null;
  }
}
