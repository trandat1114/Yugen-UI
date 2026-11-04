/**
 * dist/tokens.css (#353): the token files for apps without Tailwind, so only plain CSS may be left in it.
 *
 *   stripTheme(css)        removes every top-level `@theme … { … }` block (charts.css keeps its --animate-* tokens and
 *                          keyframes there: they only mean something to Tailwind).
 *   tailwindAtRules(css)   the Tailwind-only at-rules in `css`, outside comments and strings.
 *   tokensCss(texts)       the files stripped and joined; throws when a Tailwind-only at-rule is left.
 *
 * build-css.mjs writes dist/tokens.css with tokensCss(); src/test/css-floor.test.ts checks it on the real sources.
 */

const TAILWIND_ONLY = /@(?:theme|apply|utility|variant|custom-variant|source|plugin|config|reference|tailwind)(?![\w-])/g;

/** `css` with comments and strings blanked to spaces: same length, so offsets still point into the source. */
function mask(css) {
  return css.replace(/\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, (m) => " ".repeat(m.length));
}

export function stripTheme(css) {
  const code = mask(css);
  let out = "";
  let from = 0;
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") depth--;
    else if (depth === 0 && code.startsWith("@theme", i) && !/[\w-]/.test(code[i + 6] ?? "")) {
      const open = code.indexOf("{", i);
      const semicolon = code.indexOf(";", i);
      if (open < 0 || (semicolon >= 0 && semicolon < open)) throw new Error(`[css-tokens] @theme without a block at offset ${i}`);
      let end = open;
      for (let d = 0; end < code.length; end++) {
        if (code[end] === "{") d++;
        else if (code[end] === "}" && --d === 0) break;
      }
      if (end >= code.length) throw new Error(`[css-tokens] unclosed @theme block at offset ${i}`);
      out += css.slice(from, i).trimEnd();
      // One blank line where the block was (none at the start or end of the file).
      const rest = css.slice(end + 1).trimStart();
      if (out && rest) out += "\n\n";
      from = css.length - rest.length;
      i = from - 1;
    }
  }
  return out + css.slice(from);
}

export function tailwindAtRules(css) {
  return [...mask(css).matchAll(TAILWIND_ONLY)].map((m) => m[0]);
}

export function tokensCss(texts) {
  const css = texts.map(stripTheme).join("\n\n");
  const left = tailwindAtRules(css);
  if (left.length) throw new Error(`[css-tokens] Tailwind-only at-rules left for tokens.css: ${[...new Set(left)].join(", ")}`);
  return css;
}
