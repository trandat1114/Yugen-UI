import { describe, expect, it } from "vitest";
import { findImports } from "./imports.js";

const fromYugen = (code: string, file?: string) =>
  findImports(code, file)
    .filter((i) => i.from.startsWith("yugen-ui"))
    .map((i) => (i.all ? `${i.kind} ${i.from}` : `${i.from}: ${i.names.join(", ")}`));

describe("findImports", () => {
  it("reads import declarations, re-exports, import() and require()", () => {
    const code = `import Default, { Button, Card as YCard, type ButtonProps, "Odd name" as odd } from "yugen-ui";
import * as Yugen from "yugen-ui/Dialog";
import "yugen-ui/theme.css";
export { Menu, type MenuProps, default as Def } from "yugen-ui";
export * from "yugen-ui/hooks";
export * as ns from "yugen-ui/Nav";
const Grid = lazy(() => import("yugen-ui/DataGrid"));
const legacy = require("yugen-ui");
import X = require("yugen-ui/Tabs");
`;
    expect(fromYugen(code)).toEqual([
      "yugen-ui: default, Button, Card, Odd name",
      "namespace yugen-ui/Dialog",
      "yugen-ui/theme.css: ",
      "yugen-ui: Menu, default",
      "star yugen-ui/hooks",
      "star yugen-ui/Nav",
      "dynamic yugen-ui/DataGrid",
      "require yugen-ui",
      "require yugen-ui/Tabs",
    ]);
  });

  it("skips type-only imports and types that look like import()", () => {
    const code = `import type { ButtonProps } from "yugen-ui";
import type * as Types from "yugen-ui";
import type Def from "yugen-ui";
export type { MenuProps } from "yugen-ui";
export type * from "yugen-ui";
import { type DialogProps, type TabsProps } from "yugen-ui";
type Mod = typeof import("yugen-ui");
let props: import("yugen-ui").ButtonProps;
import type from "yugen-ui/Avatar";
import { type } from "yugen-ui/Badge";
`;
    expect(fromYugen(code)).toEqual(["yugen-ui: ", "yugen-ui/Avatar: default", "yugen-ui/Badge: type"]);
  });

  it("ignores imports written inside comments, strings, template literals, regexes and JSX text", () => {
    const code = `// import { Dialog } from "yugen-ui";
/* import { Menu } from "yugen-ui"; */
import { Button } from "yugen-ui";
const a = 'import { Tabs } from "yugen-ui"';
const b = "import { Card } from 'yugen-ui'";
const c = \`import { Badge } from "yugen-ui";
\${\`nested \${'import { Nav } from "yugen-ui"'}\`}
export * from "yugen-ui";\`;
const d = /import { Toast } from "yugen-ui"/g;
const e = x / 2 / 3; import { Avatar } from "yugen-ui";
export function Page() {
  return (
    <div title="import { Link } from 'yugen-ui'">
      Don't copy this: import {"{ Select }"} from "yugen-ui" // not a comment
      <code>{\`import { Switch } from "yugen-ui"\`}</code>
      https://example.com/* not a comment either
      {/* import { Slider } from "yugen-ui" */}
    </div>
  );
}
import { Spinner } from "yugen-ui";
`;
    expect(fromYugen(code)).toEqual(["yugen-ui: Button", "yugen-ui: Avatar", "yugen-ui: Spinner"]);
  });

  it("tells JSX from generics, comparisons and type assertions", () => {
    const tsx = `const id = <T,>(x: T) => x;
const keep = <T extends object>(x: T) => x;
type Fn = <T>(x: T) => T;
const less = a < b && c > d;
const el = cond ? <Item<string> value="1" /> : <></>;
import { Button } from "yugen-ui";
`;
    expect(fromYugen(tsx, "a.tsx")).toEqual(["yugen-ui: Button"]);
    // .ts: no JSX, `<T>x` is a type assertion.
    const ts = `const n = <number>value;\nconst s = "</div>";\nimport { Card } from "yugen-ui";\n`;
    expect(fromYugen(ts, "a.ts")).toEqual(["yugen-ui: Card"]);
  });

  it("MDX: reads only the import / export blocks", () => {
    const mdx = `import { Button } from "yugen-ui";

# Don't import { Dialog } from "yugen-ui"

\`\`\`tsx
import { Menu } from "yugen-ui";
\`\`\`

export { Card } from "yugen-ui";
`;
    expect(fromYugen(mdx, "page.mdx")).toEqual(["yugen-ui: Button", "yugen-ui: Card"]);
  });

  it("MDX: a blank line inside a code fence does not end it", () => {
    const mdx = `import { Button } from "yugen-ui";

\`\`\`tsx
"use client";

import { Dialog } from "yugen-ui";
import * as Yugen from "yugen-ui";
\`\`\`

~~~~js
const a = 1;

export * from "yugen-ui";
~~~
still inside: the fence needs four tildes to close

import { Tabs } from "yugen-ui";
~~~~

Some text \`\`\` with inline code \`\`\`
import { Menu } from "yugen-ui";

export { Card } from "yugen-ui";
`;
    expect(fromYugen(mdx, "page.mdx")).toEqual(["yugen-ui: Button", "yugen-ui: Card"]);
  });
});
