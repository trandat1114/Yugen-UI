/** Text with inline code: `["Edit ", { code: "src/App.tsx" }, " to start."]`. */
export type Rich = (string | { code: string })[];

/** Every string on the welcome page. One file per language; `content/index.ts` picks the one the app uses. */
export interface Content {
  lang: "en" | "vi";
  appName: string;
  nav: { label: string; docs: string; appearance: string; mode: string; brand: string };
  themes: { light: string; dark: string; "high-contrast": string };
  hero: { title: string; body: Rich; docs: string; next: string };
  steps: { title: string; items: { title: string; body: Rich }[] };
  links: { title: string; items: { title: string; body: string; path: string }[] };
  footer: { yugen: string; builtWith: string };
}
