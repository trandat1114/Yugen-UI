import { messagesEn } from "@/components/ui";
import type { Content } from "./types";

const en: Content = {
  lang: "en",
  messages: messagesEn,
  locale: "en-US",
  appName: "My app",
  description: "A Next.js App Router project with Yugen UI.",
  nav: { label: "Main", home: "Home", settings: "Settings", skip: "Skip to content" },
  home: {
    title: "Next.js with Yugen UI",
    lead: "App Router, Server Components and a theme the server already knows. Edit src/app/page.tsx to start.",
    settings: "Change the theme",
    docs: "Read the docs",
    serverTitle: "Server Component",
    renderedAt: (time) => `This page was rendered on the server at ${time}. It has no "use client": Yugen components are client components, and a Server Component can render them as long as their props can be serialized (text, numbers, elements, no functions).`,
    features: [
      { title: "Theme in a cookie", body: "src/app/layout.tsx reads the cookie and writes data-theme on <html>, so the first HTML is already in the right theme." },
      { title: "One client provider", body: "src/app/providers.tsx is the only \"use client\" file at the root. It wraps YugenProvider and saves changes." },
      { title: "Metadata per page", body: "Each page exports metadata; the root layout sets a title template and the description." },
      { title: "next/font", body: "Noto Sans is self-hosted at build time and becomes Yugen's base font, with Vietnamese glyphs." },
    ],
  },
  settings: {
    title: "Settings",
    description: "Theme and brand, saved in a cookie.",
    lead: "This page is a Server Component; the form below is a Client Component because it handles clicks.",
    theme: "Theme",
    themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" },
    brand: "Brand",
    saved: "Saved. Reload the page: the server renders it in this theme.",
    clientNote: "src/components/AppearanceForm.tsx starts with \"use client\" because it uses state and event handlers.",
  },
  notFound: { title: "Page not found", body: "This page doesn't exist or has moved.", action: "Back home" },
};

export default en;
