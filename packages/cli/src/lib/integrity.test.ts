import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { registryFor } from "../commands/add.js";
import { FIXTURE_ITEMS, tmpDir, writeRegistry } from "../test/fixtures.js";
import { DEFAULT_REGISTRY } from "./constants.js";
import { CliError } from "./errors.js";
import { itemDigest, loadIntegrity, type RegistryIntegrity } from "./integrity.js";
import { Registry, resolveTree } from "./registry.js";

const read = (dir: string, name: string) => JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), "utf8")) as unknown;

function integrityOf(dir: string): RegistryIntegrity {
  const names = ["registry", ...FIXTURE_ITEMS.map((i) => i.name)];
  return { version: "1.0.0", items: Object.fromEntries(names.map((n) => [n, itemDigest(read(dir, n))])) };
}

describe("registry integrity (#381)", () => {
  it("digest ignores key order and whitespace", () => {
    expect(itemDigest({ a: 1, b: [{ c: 2, d: 3 }] })).toBe(itemDigest(JSON.parse('{ "b": [ { "d": 3, "c": 2 } ], "a": 1 }')));
    expect(itemDigest({ a: 1 })).not.toBe(itemDigest({ a: 2 }));
    expect(itemDigest({})).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/);
  });

  it("accepts items that match", async () => {
    const dir = writeRegistry();
    const registry = new Registry(dir, integrityOf(dir));
    const items = await resolveTree(registry, ["button"]);
    expect(items.map((i) => i.name)).toContain("button");
    await expect(registry.index()).resolves.toMatchObject({ name: "yugen" });
  });

  it("stops on a changed file", async () => {
    const dir = writeRegistry();
    const integrity = integrityOf(dir);
    const button = read(dir, "button") as { files: { content: string }[] };
    button.files[0].content += "\nfetch('https://example.com')";
    fs.writeFileSync(path.join(dir, "button.json"), JSON.stringify(button));
    await expect(new Registry(dir, integrity).item("button")).rejects.toSatisfy(
      (e) => e instanceof CliError && /does not match the checksum/.test(e.message),
    );
  });

  it("stops on a changed dependency list", async () => {
    const dir = writeRegistry();
    const integrity = integrityOf(dir);
    const button = read(dir, "button") as { dependencies?: string[] };
    button.dependencies = [...(button.dependencies ?? []), "evil-package@1.0.0"];
    fs.writeFileSync(path.join(dir, "button.json"), JSON.stringify(button));
    await expect(new Registry(dir, integrity).item("button")).rejects.toThrow(/does not match the checksum/);
  });

  it("rejects items the checksums don't list", async () => {
    const dir = writeRegistry();
    const { items, version } = integrityOf(dir);
    const { button: _b, ...rest } = items;
    await expect(new Registry(dir, { version, items: rest }).item("button")).rejects.toThrow(/not part of the yugen-ui 1.0.0 registry/);
    await expect(new Registry(dir, { version, items: rest }).item("__proto__")).rejects.toThrow(/not part of/);
  });

  it("registryFor: versioned default with checksums, custom registry without", () => {
    const integrity = { version: "1.0.0", items: {} };
    const verified = registryFor(tmpDir(), undefined, null, { integrity, notice: false });
    expect(verified.base).toBe(`${DEFAULT_REGISTRY}/1.0.0`);
    expect(verified.integrity).toBe(integrity);

    const custom = registryFor(tmpDir(), "https://example.com/r/", null, { integrity, notice: false });
    expect(custom.base).toBe("https://example.com/r");
    expect(custom.integrity).toBeNull();

    const dev = registryFor(tmpDir(), undefined, null, { integrity: null, notice: false });
    expect(dev.base).toBe(DEFAULT_REGISTRY);
  });

  it("loadIntegrity: null when the file is missing or malformed", () => {
    const dir = tmpDir();
    expect(loadIntegrity(path.join(dir, "missing.json"))).toBeNull();
    fs.writeFileSync(path.join(dir, "bad.json"), '{"items":1}');
    expect(loadIntegrity(path.join(dir, "bad.json"))).toBeNull();
    fs.writeFileSync(path.join(dir, "ok.json"), '{"version":"1.0.0","items":{}}');
    expect(loadIntegrity(path.join(dir, "ok.json"))).toEqual({ version: "1.0.0", items: {} });
  });
});
