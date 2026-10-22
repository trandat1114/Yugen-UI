#!/usr/bin/env node
// `npm create yugen-ui@latest [dir] -- [options]` ≡ `yugen create [dir] [options]` (gói @yugen-ui/cli, packages/cli).
import { run } from "@yugen-ui/cli";

process.exitCode = await run(["create", ...process.argv.slice(2)]);
