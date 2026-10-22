#!/usr/bin/env node
// `npm create yugen-ui@latest [dir] -- [options]` ≡ `yugen create [dir] [options]` (gói yugen, packages/cli).
import { run } from "yugen";

process.exitCode = await run(["create", ...process.argv.slice(2)]);
