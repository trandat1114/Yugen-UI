import type { Content } from "./types";

const en: Content = {
  lang: "en",
  appName: "My app",
  nav: { label: "Links", docs: "Docs", appearance: "Appearance", mode: "Mode", brand: "Brand" },
  themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" },
  hero: {
    title: "Your project is running.",
    body: [
      "Vite, React and Tailwind CSS v4 are set up with Yugen UI: saved theme, toast, keyboard and screen reader support. Edit ",
      { code: "src/Welcome.tsx" },
      " and save to see it change.",
    ],
    docs: "Open the docs",
    next: "Next steps",
  },
  steps: {
    title: "Next steps",
    items: [
      {
        title: "Replace this page",
        body: ["Render your app in ", { code: "src/App.tsx" }, " instead of ", { code: "<Welcome />" }, ". The provider, saved theme and toast stay."],
      },
      {
        title: "Add components",
        body: ["Import them from yugen-ui, for example ", { code: 'import { DataGrid } from "yugen-ui"' }, ". Every docs page has examples to copy."],
      },
      {
        title: "Change the brand colour",
        body: [
          "Switch between Sakura and Web in the menu at the top. For your own colour, create a palette in Theme Designer and paste the CSS into ",
          { code: "src/index.css" },
          ".",
        ],
      },
    ],
  },
  links: {
    title: "Explore",
    items: [
      { title: "Components", body: "Examples and props for every component.", path: "#/components/button" },
      { title: "Blocks", body: "Sign-in, settings, stats and more, ready to copy.", path: "#/blocks" },
      { title: "Templates", body: "SaaS, Markdown blog, dashboard and AI chat.", path: "#/templates" },
      { title: "Theme Designer", body: "A brand palette with contrast checks.", path: "#/theme-designer" },
    ],
  },
  footer: { yugen: "yūgen: quiet beauty in subtle things.", builtWith: "Built with" },
};

export default en;
