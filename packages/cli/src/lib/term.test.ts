import { PassThrough, Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { CancelledError } from "./errors.js";
import { confirmPrompt, fit, multiselectPrompt, p, selectPrompt, spinner, textPrompt, type IO } from "./term.js";

/** Bàn phím và màn hình giả: `keys()` gõ lần lượt (mỗi phím một lượt event loop), `screen()` là chữ đã bỏ mã ANSI. */
function fakeTerminal() {
  const input = Object.assign(new PassThrough(), { isTTY: true, setRawMode: vi.fn() });
  let written = "";
  const output = Object.assign(
    new Writable({
      write(chunk, _encoding, done) {
        written += chunk.toString();
        done();
      },
    }),
    { isTTY: false, columns: 80, rows: 24 },
  );
  const io = { input, output } as unknown as IO;
  const keys = async (...sequence: string[]) => {
    for (const key of sequence) {
      await new Promise((resolve) => setImmediate(resolve));
      input.write(key);
    }
  };
  // eslint-disable-next-line no-control-regex
  const screen = () => written.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
  return { io, input, keys, screen };
}

const DOWN = "\x1b[B";
const UP = "\x1b[A";
const ENTER = "\r";
const SPACE = " ";
const CTRL_C = "\x03";
const options = [
  { value: "starter", label: "Starter" },
  { value: "saas", label: "SaaS", hint: "pricing, auth" },
  { value: "blog", label: "Blog" },
];

describe("select", () => {
  it("moves with the arrow keys, wraps, and returns the value under the cursor", async () => {
    const t = fakeTerminal();
    const answer = selectPrompt("Template", options, "saas", t.io);
    // saas → ↑ starter → ↑ blog (vòng lên cuối) → ↓ starter (vòng về đầu)
    await t.keys(UP, UP, DOWN, ENTER);
    await expect(answer).resolves.toBe("starter");
    expect(t.input.setRawMode).toHaveBeenNthCalledWith(1, true);
    expect(t.input.setRawMode).toHaveBeenLastCalledWith(false);
    expect(t.screen()).toContain("SaaS (pricing, auth)");
    expect(t.screen()).toMatch(/Template\n.*Starter\n$/);
  });

  it("Ctrl+C cancels", async () => {
    const t = fakeTerminal();
    const answer = selectPrompt("Template", options, "starter", t.io);
    await t.keys(CTRL_C);
    await expect(answer).rejects.toBeInstanceOf(CancelledError);
    expect(t.screen()).toContain("Cancelled.");
  });
});

describe("multiselect", () => {
  it("toggles with Space, asks for at least one, returns in list order", async () => {
    const t = fakeTerminal();
    const answer = multiselectPrompt("Components", options, t.io);
    await t.keys(ENTER);
    await t.keys(DOWN, DOWN, SPACE, UP, UP, SPACE, DOWN, SPACE, SPACE, ENTER);
    await expect(answer).resolves.toEqual(["starter", "blog"]);
    expect(t.screen()).toContain("Select at least one item with Space.");
  });

  it("scrolls long lists inside a window", async () => {
    const t = fakeTerminal();
    const many = Array.from({ length: 40 }, (_, i) => ({ value: `item-${i}` }));
    const answer = multiselectPrompt("Components", many, t.io);
    await t.keys(...Array(25).fill(DOWN), SPACE, ENTER);
    await expect(answer).resolves.toEqual(["item-25"]);
    const lastFrame = t.screen().split("Components").at(-2) ?? "";
    expect(lastFrame).not.toContain("item-0\n");
    expect(lastFrame).toContain("…");
  });
});

describe("text and confirm", () => {
  it("text: empty answer keeps the default; invalid answers are asked again", async () => {
    const t = fakeTerminal();
    const first = textPrompt("Directory", "yugen-app", undefined, t.io);
    await t.keys("\n");
    await expect(first).resolves.toBe("yugen-app");

    const u = fakeTerminal();
    const second = textPrompt("Directory", "", (v) => (v.trim() ? undefined : "Enter a directory name."), u.io);
    await u.keys("\n", "my-app\n");
    await expect(second).resolves.toBe("my-app");
    expect(u.screen()).toContain("Enter a directory name.");
  });

  it("confirm: y / n / empty, anything else is asked again", async () => {
    const t = fakeTerminal();
    const yes = confirmPrompt("Continue?", false, t.io);
    await t.keys("maybe\n", "YES\n");
    await expect(yes).resolves.toBe(true);
    expect(t.screen()).toContain("(y/N)");
    expect(t.screen()).toContain("Type y or n.");

    const u = fakeTerminal();
    const fallback = confirmPrompt("Continue?", true, u.io);
    await u.keys("\n");
    await expect(fallback).resolves.toBe(true);
  });

  it("closing the input cancels", async () => {
    const t = fakeTerminal();
    const answer = textPrompt("Directory", "x", undefined, t.io);
    await new Promise((resolve) => setImmediate(resolve));
    t.input.end();
    await expect(answer).rejects.toBeInstanceOf(CancelledError);
  });
});

describe("output", () => {
  it("fit cuts to the width with an ellipsis", () => {
    expect(fit("abcdef", 10)).toBe("abcdef");
    expect(fit("abcdef", 4)).toBe("abc…");
  });

  it("log and note indent follow-up lines; a spinner without a TTY prints one line per state", () => {
    let text = "";
    const output = Object.assign(new Writable({ write: (c, _e, done) => ((text += c.toString()), done()) }), { isTTY: false });
    p.log.warn("First line\nsecond line", output);
    p.note("a\nb", "Next steps", output);
    const spin = spinner(output);
    spin.start("Resolving");
    spin.stop("Resolved 3 items");
    expect(text).toMatch(/First line\n\S+ {2}second line\n/);
    expect(text).toMatch(/Next steps\n\S+ {2}a\n\S+ {2}b\n/);
    expect(text).toMatch(/Resolving\n.*Resolved 3 items\n/);
  });
});
