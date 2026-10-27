import { messagesEn } from "@/components/ui";
import type { Content } from "./types";

const en: Content = {
  lang: "en",
  messages: messagesEn,
  locale: "en-US",
  currency: "USD",
  product: {
    name: "Sakura Notes",
    title: "Sakura Notes · Team notes you can find again",
    description:
      "Meeting notes, specs and decisions in one place your whole team can search. Free for up to 5 people.",
  },
  nav: { label: "Main", features: "Features", pricing: "Pricing", faq: "FAQ", signUp: "Start free", footer: "Footer" },
  appearance: { label: "Theme", themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" } },
  hero: {
    badge: "New: shared templates",
    title: "Team notes you can find again",
    lead: "Sakura Notes keeps meeting notes, specs and decisions in one place. Search finds them in a second, comments keep the discussion next to the text.",
    primary: "Start free",
    secondary: "See pricing",
    note: "Free for up to 5 people. No credit card.",
    shot: {
      label: "Sakura Notes with the Product space open on a meeting note",
      spaces: ["Product", "Design", "Engineering"],
      notes: ["Weekly product sync", "Q4 roadmap", "Onboarding checklist"],
      title: "Weekly product sync",
      meta: "Edited by Mai · 2 min ago",
      body: "Release 2.4 moves to Thursday so the import fix can ship with it.",
      tasks: ["Share the beta with support", "Update the changelog"],
      comment: { author: "Leo", text: "Thursday works for the docs team." },
    },
  },
  logos: { title: "Teams at these companies write in Sakura Notes" },
  features: {
    title: "Everything a team writes, in one place",
    lead: "Fewer tabs and fewer “where did we write that down?” messages.",
    items: [
      { icon: "search", title: "Search that finds it", body: "Titles, text, tags and comments, across every space you can open." },
      { icon: "spaces", title: "Spaces per team", body: "One space for each team or project, with members and simple roles." },
      { icon: "comments", title: "Comments and mentions", body: "Discuss a paragraph where it is written; mention someone to bring them in." },
      { icon: "templates", title: "Shared templates", body: "Meeting notes, specs and retros start from the same page every time." },
      { icon: "offline", title: "Works offline", body: "Write on the train; changes sync when you are back online." },
      { icon: "history", title: "Version history", body: "See who changed what and restore any earlier version of a note." },
    ],
  },
  pricing: {
    title: "Simple pricing",
    lead: "Start free. Pay per person when your team grows.",
    period: { label: "Billing period", monthly: "Monthly", yearly: "Yearly", save: "Save 20%" },
    perPerson: "per person / month",
    billedMonthly: "Billed monthly",
    billedYearly: (total) => `${total} per person, billed yearly`,
    freeForever: "Free for as long as you like",
    featured: "Most popular",
    plans: [
      {
        id: "free",
        name: "Free",
        description: "For small teams trying it out.",
        price: { monthly: 0, yearly: 0 },
        features: ["Up to 5 people", "3 spaces", "30 days of version history"],
        cta: "Start free",
      },
      {
        id: "team",
        name: "Team",
        description: "For teams that write every day.",
        price: { monthly: 8, yearly: 6.4 },
        features: ["Unlimited people and spaces", "Shared templates", "Full version history", "Guests with read access"],
        cta: "Try Team free for 14 days",
        featured: true,
      },
      {
        id: "business",
        name: "Business",
        description: "For companies with many teams.",
        price: { monthly: 15, yearly: 12 },
        features: ["Everything in Team", "Single sign-on (SAML)", "Audit log", "Priority support"],
        cta: "Try Business free for 14 days",
      },
    ],
  },
  testimonials: {
    title: "What teams say",
    items: [
      {
        quote: "Our meeting notes used to live in five different apps. Now new people find last year's decisions on their first day.",
        name: "Hana Sato",
        role: "Engineering manager, Kumo",
      },
      {
        quote: "The templates did more for our specs than any process document. Every spec now answers the same questions.",
        name: "Daniel Okafor",
        role: "Head of product, Riverline",
      },
      {
        quote: "We tried it with one team for a month. Three months later the whole company writes there.",
        name: "Linh Nguyen",
        role: "Operations lead, Tidepool",
      },
    ],
  },
  faq: {
    title: "Questions",
    lead: "Something else on your mind?",
    contact: "Write to us",
    email: "hello@example.com",
    items: [
      {
        question: "Is the Free plan really free?",
        answer: "Yes. Up to 5 people and 3 spaces, for as long as you like. You only pay when you move to Team or Business.",
      },
      {
        question: "Can I import my notes?",
        answer: "Markdown files, Notion exports and Google Docs import in a few clicks. Links between pages are kept.",
      },
      {
        question: "Who can see my notes?",
        answer: "Only the members of a space. Guests see the spaces you share with them, and nothing can be edited without access.",
      },
      {
        question: "Can I change plans later?",
        answer: "Any time. Upgrades apply right away; when you downgrade, the change starts with your next billing period.",
      },
      {
        question: "Do you offer discounts for non-profits and schools?",
        answer: "Yes, Team is half price for registered non-profits and schools. Write to us with a link to your organization.",
      },
    ],
  },
  signUp: {
    title: "Start writing together today",
    lead: "Create a space for your team in a minute. Invite people when you are ready.",
    points: ["Free for up to 5 people", "Import from Markdown, Notion or Google Docs", "Cancel any time"],
    form: {
      label: "Sign up",
      name: "Your name",
      email: "Work email",
      emailHint: "We send one email to confirm the address.",
      teamSize: "Team size",
      teamSizePlaceholder: "Choose a size",
      teamSizes: ["Just me", "2–10 people", "11–50 people", "51–200 people", "More than 200"],
      consent: "I agree to the terms of service and the privacy policy",
      submit: "Create team space",
      submitting: "Creating…",
    },
    errors: {
      name: "Enter your name.",
      emailRequired: "Enter your work email.",
      email: "Enter an email address like name@company.com.",
      teamSize: "Choose the size of your team.",
      consent: "Accept the terms to continue.",
    },
    success: { title: "Check your inbox", body: (email) => `We sent a confirmation link to ${email}.` },
  },
  footer: {
    tagline: "Team notes you can find again.",
    madeWith: "Made with Yugen UI",
    sample: "A sample product. Names and quotes are made up.",
  },
};

export default en;
