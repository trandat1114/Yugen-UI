import fs from "node:fs";
import path from "node:path";
import { parseArgs, type ParseArgsConfig } from "node:util";
import { add } from "./commands/add.js";
import { create } from "./commands/create.js";
import { doctor } from "./commands/doctor.js";
import { init } from "./commands/init.js";
import { list } from "./commands/list.js";
import { DOCS_URL } from "./lib/constants.js";
import { CancelledError, CliError } from "./lib/errors.js";
import { makeCtx, p, pc } from "./lib/ui.js";

export { CliError } from "./lib/errors.js";
export type { YugenConfig } from "./lib/config.js";

const { version } = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };

type Options = NonNullable<ParseArgsConfig["options"]>;

const COMMON = {
  help: { type: "boolean", short: "h" },
  yes: { type: "boolean", short: "y" },
  cwd: { type: "string" },
} satisfies Options;

interface Command {
  usage: string;
  summary: string;
  options: Options;
  /** Dòng mô tả từng option trong --help. */
  help: string[];
}

const COMMANDS: Record<string, Command> = {
  create: {
    usage: "yugen create [dir] [options]",
    summary: "Create a new app from a template",
    options: {
      ...COMMON,
      template: { type: "string", short: "t" },
      pm: { type: "string" },
      force: { type: "boolean" },
      "no-install": { type: "boolean" },
      "no-git": { type: "boolean" },
    },
    help: [
      "-t, --template <name>   starter | saas | blog | dashboard | ai-chat",
      "    --pm <name>         npm | pnpm | yarn | bun (default: the one running the CLI)",
      "    --force             Write into a non-empty directory",
      "    --no-install        Skip installing dependencies",
      "    --no-git            Skip git init",
    ],
  },
  init: {
    usage: "yugen init [options]",
    summary: "Set up Yugen UI in the current project",
    options: {
      ...COMMON,
      mode: { type: "string" },
      css: { type: "string" },
      registry: { type: "string" },
      overwrite: { type: "boolean" },
      "no-install": { type: "boolean" },
    },
    help: [
      "    --mode <mode>       package (npm install yugen-ui) | source (copy the source into your project)",
      '    --css <file>        Main CSS file (the one with @import "tailwindcss")',
      "    --registry <url>    Registry URL or local directory (source mode)",
      "    --overwrite         Replace theme / component files that differ from the registry",
      "    --no-install        Print the install command instead of running it",
    ],
  },
  add: {
    usage: "yugen add <components...> [options]",
    summary: "Copy component source into your project",
    options: {
      ...COMMON,
      all: { type: "boolean" },
      overwrite: { type: "boolean" },
      "dry-run": { type: "boolean" },
      registry: { type: "string" },
      "no-install": { type: "boolean" },
    },
    help: [
      "    --all               Add every component",
      "    --overwrite         Replace files that differ from the registry",
      "    --dry-run           Show what would change without writing",
      "    --registry <url>    Registry URL or local directory",
      "    --no-install        Print the install command instead of running it",
    ],
  },
  list: {
    usage: "yugen list [query] [options]",
    summary: "List the components in the registry",
    options: { ...COMMON, json: { type: "boolean" }, registry: { type: "string" } },
    help: ["    --json              Print JSON", "    --registry <url>    Registry URL or local directory"],
  },
  doctor: {
    usage: "yugen doctor [options]",
    summary: "Check the project setup",
    options: { ...COMMON },
    help: [],
  },
};

const COMMON_HELP = [
  "    --cwd <dir>         Run in another directory",
  "-y, --yes               Accept the defaults, never prompt",
  "-h, --help              Show this help",
];

function mainHelp() {
  const width = Math.max(...Object.keys(COMMANDS).map((c) => c.length));
  return [
    `${pc.bold("yugen")} ${pc.dim(`v${version}`)} — the Yugen UI CLI`,
    "",
    "Usage: yugen <command> [options]",
    "",
    "Commands:",
    ...Object.entries(COMMANDS).map(([name, c]) => `  ${name.padEnd(width)}   ${c.summary}`),
    "",
    "Run `yugen <command> --help` for its options.",
    `Docs: ${DOCS_URL}`,
  ].join("\n");
}

const commandHelp = (c: Command) =>
  [`Usage: ${c.usage}`, "", c.summary, "", "Options:", ...[...c.help, ...COMMON_HELP].map((l) => `  ${l}`)].join("\n");

const banner = () => p.intro(`${pc.bgMagenta(pc.black(" yugen "))} ${pc.dim(`v${version}`)}`);

/** Chạy CLI với argv (không gồm node và tên script); trả về exit code. */
export async function run(argv: string[]): Promise<number> {
  const [name, ...rest] = argv;
  if (!name || name === "-h" || name === "--help" || name === "help") {
    console.log(mainHelp());
    return 0;
  }
  if (name === "-v" || name === "--version") {
    console.log(version);
    return 0;
  }
  const command = COMMANDS[name];
  if (!command) {
    console.error(`Unknown command "${name}".\n\n${mainHelp()}`);
    return 1;
  }

  let values: Record<string, string | boolean | undefined>;
  let positionals: string[];
  try {
    ({ values, positionals } = parseArgs({ args: rest, options: command.options, allowPositionals: true, strict: true }) as {
      values: Record<string, string | boolean | undefined>;
      positionals: string[];
    });
  } catch (e) {
    console.error(`${(e as Error).message}\n\n${commandHelp(command)}`);
    return 1;
  }
  if (values.help) {
    console.log(commandHelp(command));
    return 0;
  }

  const str = (k: string) => values[k] as string | undefined;
  const bool = (k: string) => values[k] === true;
  const cwd = path.resolve(str("cwd") ?? process.cwd());
  const ctx = makeCtx(bool("yes"));

  try {
    switch (name) {
      case "create":
        banner();
        await create(
          {
            cwd,
            dir: positionals[0],
            template: str("template"),
            pm: str("pm"),
            force: bool("force"),
            install: !bool("no-install"),
            git: !bool("no-git"),
          },
          ctx,
        );
        return 0;
      case "init":
        banner();
        await init(
          { cwd, mode: str("mode"), css: str("css"), registry: str("registry"), overwrite: bool("overwrite"), install: !bool("no-install") },
          ctx,
        );
        p.outro(`Yugen UI is ready. Next: ${pc.cyan("yugen add button")}`);
        return 0;
      case "add":
        banner();
        await add(
          {
            cwd,
            names: positionals,
            all: bool("all"),
            overwrite: bool("overwrite"),
            dryRun: bool("dry-run"),
            registry: str("registry"),
            install: !bool("no-install"),
          },
          ctx,
        );
        p.outro("Done");
        return 0;
      case "list":
        await list({ cwd, query: positionals[0], json: bool("json"), registry: str("registry") });
        return 0;
      case "doctor":
        banner();
        return await doctor({ cwd });
    }
    return 1;
  } catch (e) {
    if (e instanceof CancelledError) return 130;
    if (e instanceof CliError) {
      p.log.error(e.hint ? `${e.message}\n${pc.dim(e.hint)}` : e.message);
      return 1;
    }
    throw e;
  }
}
