import type { ComponentCategory, ConceptGroup } from "../../types";

/**
 * English concept metadata keyed by slug. Every page has an English `title` (sidebar, palette); pages with a translated
 * body (`src/docs/concepts/en/<slug>.tsx`) also have `lead` and `toc` labels (keyed by section id).
 */
export const CONCEPTS_EN: Record<string, { title: string; lead?: string; toc?: Record<string, string> }> = {
  introduction: {
    title: "Introduction",
    lead: "Yugen UI is a design system for React and Tailwind CSS v4: Fluent 2 tokens and behavior, shadcn/ui-style copy-paste distribution, dressed in Sakura 桜 cherry-blossom colors.",
    toc: { what: "What is Yugen UI?", principles: "Principles", structure: "How the docs are organized", credit: "Credits" },
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
  cli: {
    title: "@yugen-ui/cli",
    lead: "A command-line tool to create an app from a template, set up Yugen UI in an existing project, copy component source and check the setup.",
    toc: {
      commands: "Commands",
      create: "Create an app",
      init: "Set up an existing project",
      add: "Add components",
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
  accessibility: { title: "Accessibility overview" },
  "browser-support": { title: "Browsers & platforms" },
  "component-labelling": { title: "Labelling components" },
  "focus-indicator": { title: "Focus indicator" },
  "migration-fluent": { title: "From Fluent UI React v9" },
  "migration-shadcn": { title: "From shadcn/ui" },
  notifications: { title: "Notifications & live regions" },
  positioning: { title: "Positioning" },
  rtl: { title: "Right-to-left (RTL)" },
  slots: { title: "Customizing with slots & composition" },
  ssr: { title: "Server-side rendering & Next.js" },
  styling: { title: "Styling" },
  theming: { title: "Theming" },
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
