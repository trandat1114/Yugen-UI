#!/usr/bin/env node
import { run } from "./api.js";

process.exitCode = await run(process.argv.slice(2));
