import type { CodeLanguage } from "../CodeBlock/CodeBlock";

const LANGUAGE_ALIAS: Record<string, CodeLanguage> = {
  tsx: "tsx",
  ts: "ts",
  typescript: "ts",
  jsx: "jsx",
  js: "js",
  javascript: "js",
  mjs: "js",
  cjs: "js",
  css: "css",
  scss: "css",
  less: "css",
  html: "html",
  xml: "html",
  svg: "html",
  vue: "html",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  powershell: "bash",
  ps1: "bash",
  json: "json",
  jsonc: "json",
  json5: "json",
  md: "md",
  markdown: "md",
};

/** Ngôn ngữ của fence → bộ tô màu của CodeBlock ("text" nếu chưa hỗ trợ). */
export function codeLanguageOf(lang: string): CodeLanguage {
  return LANGUAGE_ALIAS[lang.toLowerCase()] ?? "text";
}
