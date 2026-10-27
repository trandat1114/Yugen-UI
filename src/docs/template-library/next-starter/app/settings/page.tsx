import type { Metadata } from "next";
import { AppearanceForm } from "../../components/AppearanceForm";
import content from "../../content";

export const metadata: Metadata = { title: content.settings.title, description: content.settings.description };

/** Server Component page; the form is a Client Component because it handles clicks. */
export default function SettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-display text-title2 font-semibold">{content.settings.title}</h1>
      <p className="text-body1 text-foreground-2">{content.settings.lead}</p>
      <AppearanceForm />
      <p className="text-caption1 text-foreground-3">{content.settings.clientNote}</p>
    </div>
  );
}
