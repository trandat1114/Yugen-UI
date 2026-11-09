import { spawn } from "node:child_process";

const bin = (name) => process.platform === "win32" ? name + ".cmd" : name;
const css = spawn(bin("yugen"), ["css", "--watch"], { stdio: "inherit" });
const next = spawn(bin("next"), ["dev"], { stdio: "inherit" });
const stop = (code = 0) => {
  css.kill();
  next.kill();
  process.exit(code);
};
css.on("exit", (code) => { if (code && !next.killed) stop(code); });
next.on("exit", (code, signal) => stop(signal ? 0 : code ?? 0));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
