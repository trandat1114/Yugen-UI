import { Button, StatusPage, YugenProvider, statusPageCopy, statusPageMessagesEn } from "@/components/ui";
import type { Content } from "./content/types";

/** Title of the 404 page, from the Yugen built-in strings of the language in use. */
export const notFoundTitle = (t: Content) => statusPageCopy(404, { ...statusPageMessagesEn, ...t.messages?.statusPage }).title;

/**
 * 404.html: vite.config.ts renders this to static HTML at build time, without JavaScript; hosts serve it for unknown paths.
 * The theme comes from the no-flash script in index.html, like the rest of the site.
 */
export default function NotFoundPage({ t, home }: { t: Content; home: string }) {
  return (
    <YugenProvider applyToDocument messages={t.messages} locale={t.locale}>
      <StatusPage
        status={404}
        fullscreen
        primaryAction={
          <Button appearance="primary" asChild>
            <a href={home}>{t.notFound.home}</a>
          </Button>
        }
      />
    </YugenProvider>
  );
}
