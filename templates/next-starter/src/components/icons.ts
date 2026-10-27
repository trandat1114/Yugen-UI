"use client";

// Fluent icons run style code when their module loads, so a Server Component can't import them from
// "@fluentui/react-icons" directly. Re-exported from a "use client" file, they render from Server Components too.
export { ArrowRight20Regular, Settings20Regular } from "@fluentui/react-icons";
