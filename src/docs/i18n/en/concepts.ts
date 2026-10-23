import type { ComponentCategory, ConceptGroup } from "../../types";

/**
 * English concept metadata keyed by slug. Every page has an English `title` (sidebar, palette); pages with a translated
 * body (`src/docs/concepts/en/<slug>.tsx`) also have `lead` and `toc` labels (keyed by section id).
 */
export const CONCEPTS_EN: Record<string, { title: string; lead?: string; toc?: Record<string, string> }> = {
  introduction: {
    title: "Introduction",
    lead: "React components for Tailwind CSS v4, with light, dark and high-contrast themes and RTL support. Use the npm package or copy the source into your project.",
    toc: { what: "What is Yugen UI?", ways: "Choose how to use it", principles: "Principles", status: "Versions and license", credit: "Credits" },
  },
  "quick-start": {
    title: "Quick start",
    lead: "One command gives you a running app from a template. For an existing project run npx @yugen-ui/cli@latest init, or do the three steps yourself (install yugen-ui, add one CSS line, wrap in YugenProvider).",
    toc: {
      template: "Fastest: one command",
      existing: "Add to an existing project",
      shadcn: "Customize the source",
      "first-component": "Your first component",
      "persist-theme": "Remember the theme, no flash",
      requirements: "Requirements",
    },
  },
  seo: {
    title: "SEO with Yugen UI",
    lead: "Yugen components render plain HTML on the server, so search engines can read the content. What is left is per-page metadata, heading structure, real links and alt text for images.",
    toc: {
      server: "What is in the HTML",
      metadata: "Title and description",
      headings: "Heading structure",
      links: "Links crawlers can follow",
      images: "Images and avatars",
      checklist: "Before you ship",
    },
  },
  cli: {
    title: "@yugen-ui/cli",
    lead: "A command-line tool to create an app from a template, set up Yugen UI in an existing project, copy component source and check the setup.",
    toc: {
      commands: "Commands",
      create: "Create an app",
      init: "Set up an existing project",
      add: "Add components",
      update: "Update and remove",
      theme: "Brand color",
      doctor: "Check the setup",
      config: "yugen.json and the registry",
      options: "Common options",
    },
  },
  "shadcn-registry": {
    title: "Install with the shadcn CLI",
    lead: "Copy component source into your project with the shadcn CLI. Two commands: init once (adds the theme, cn(), YugenProvider, components.json and the CSS @import), then add the components you need.",
    toc: {
      choose: "npm or copy the source",
      init: "Initialize once",
      add: "Add components",
      namespace: "The @yugen registry namespace",
      existing: "Projects already on shadcn/ui",
      update: "Updating",
      notes: "Notes",
    },
  },
  versioning: {
    title: "Versioning & change policy",
    lead: "Yugen UI follows Semantic Versioning. Breaking changes are always announced ahead with deprecation warnings and recorded in the CHANGELOG and on What's new — so upgrades are planned, never surprises.",
    toc: {
      semver: "Semantic Versioning",
      breaking: "What counts as breaking",
      deprecation: "Deprecation process",
      support: "Support matrix",
      upgrade: "Upgrading safely",
    },
  },
  accessibility: {
    title: "Accessibility overview",
    lead: "Yugen UI is built to be accessible by default: ARIA semantics from Radix, full keyboard navigation, visible focus and contrast that meets WCAG 2.1 AA.",
    toc: {
      principles: "Principles",
      keyboard: "Keyboard",
      semantics: "Semantics for screen readers",
      checklist: "Checklist",
      tools: "Tools & related pages",
    },
  },
  "browser-support": {
    title: "Browsers & platforms",
    lead: "Yugen UI targets evergreen browsers and React 18 or later. The modern CSS features Tailwind CSS v4 relies on need no polyfills.",
    toc: {
      browsers: "Browsers",
      css: "CSS features",
      stack: "React, TypeScript, Tailwind",
      input: "Mouse, touch, keyboard",
      engines: "Testing on each engine",
    },
  },
  "component-labelling": { title: "Labelling components" },
  "focus-indicator": { title: "Focus indicator" },
  "migration-fluent": { title: "From Fluent UI React v9" },
  "migration-shadcn": { title: "From shadcn/ui" },
  notifications: { title: "Notifications & live regions" },
  positioning: { title: "Positioning" },
  rtl: {
    title: "Right-to-left (RTL)",
    lead: "Yugen UI supports right-to-left languages (Arabic, Hebrew, Persian…) with one dir prop and a rule to use only logical utilities.",
    toc: {
      enable: "Enable RTL",
      demo: "Live example",
      logical: "Logical utilities",
      icons: "Flipping icons & transforms",
      keyboard: "Arrow keys",
      testing: "Testing",
    },
  },
  slots: { title: "Customizing with slots & composition" },
  ssr: {
    title: "Server-side rendering & Next.js",
    lead: "Yugen components are client components. They work in the Next.js App Router, Remix or any other SSR framework after a few setup steps.",
    toc: {
      "client-components": "Client components",
      setup: "Setting up Next.js",
      "theme-flash": "Root layout & no flash",
      rsc: "Use in Server Components",
      hydration: "Portals, Toast & hydration",
      "docs-only": "Only for the docs site",
    },
  },
  styling: {
    title: "Styling",
    lead: "Every component accepts className and merges it with cn(). Customize with utilities mapped from tokens, never with hard-coded values.",
    toc: {
      classname: "className & cn()",
      tokens: "Token utilities only",
      variants: "Overrides & variants",
      state: "Data attributes & important",
      shared: "Shared classes",
      "media-object": "The media object pattern",
    },
  },
  theming: {
    title: "Theming",
    lead: "Theme, brand and text direction are attributes on the DOM. YugenProvider sets them for the whole app or for one part of the UI.",
    toc: {
      attributes: "data-theme & data-brand",
      provider: "YugenProvider",
      "use-yugen": "The useYugen() hook",
      nested: "Nested themes",
      layers: "Three token layers",
      "custom-brand": "Create your own brand",
    },
  },
  truncation: { title: "Text truncation" },
  "adaptive-overlays": { title: "Adaptive overlays for desktop & mobile" },
  "agent-trace": { title: "Process transparency with Trace" },
  "chat-ux": { title: "Chat & AI interfaces" },
  "data-visualization": { title: "Data visualization" },
  "wait-ux": { title: "Wait UX" },
};

export const CATEGORIES_EN: Record<ComponentCategory, string> = {
  "Hành động": "Actions",
  "Nhập liệu": "Inputs",
  "Điều hướng": "Navigation",
  "Hiển thị dữ liệu": "Data display",
  "Phản hồi": "Feedback",
  "Bề mặt & overlay": "Surfaces & overlays",
  "Bố cục": "Layout",
  "Chuyển động": "Motion",
  "Tiện ích": "Utilities",
  "Yugen Labs": "Yugen Labs",
};

export const CONCEPT_GROUPS_EN: Record<ConceptGroup, string> = {
  "Bắt đầu": "Get started",
  "Nhà phát triển": "Developers",
  "Khả năng tiếp cận": "Accessibility",
  "Yugen Labs": "Yugen Labs",
  "Chuyển đổi": "Migration",
};

export const FOUNDATIONS_EN: Record<string, string> = {
  color: "Color",
  typography: "Typography",
  spacing: "Spacing",
  radius: "Corner radius",
  elevation: "Elevation",
  motion: "Motion",
};
