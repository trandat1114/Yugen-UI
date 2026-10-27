import {
  ArrowSync24Regular,
  CommentMultiple24Regular,
  DocumentCopy24Regular,
  History24Regular,
  PeopleTeam24Regular,
  Search24Regular,
} from "@fluentui/react-icons";
import type { ComponentType } from "react";
import type { FeatureIcon } from "./content/types";
import { useLanding } from "./context";

const ICONS: Record<FeatureIcon, ComponentType<{ className?: string }>> = {
  search: Search24Regular,
  spaces: PeopleTeam24Regular,
  comments: CommentMultiple24Regular,
  templates: DocumentCopy24Regular,
  offline: ArrowSync24Regular,
  history: History24Regular,
};

/** Feature grid: an icon, a title and one sentence each. */
export function Features() {
  const { t, embedded, sectionId } = useLanding();
  const H2 = embedded ? "h3" : "h2";
  const H3 = embedded ? "h4" : "h3";
  const titleId = `${sectionId("features")}-title`;

  return (
    <section id={sectionId("features")} aria-labelledby={titleId} className="scroll-mt-16 bg-background-2 px-4 py-16 @3xl/landing:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <H2 id={titleId} className="font-display text-title2 font-semibold text-foreground-1 @3xl/landing:text-title1">
            {t.features.title}
          </H2>
          <p className="mt-3 text-body2 text-foreground-2">{t.features.lead}</p>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-10 @xl/landing:grid-cols-2 @4xl/landing:grid-cols-3">
          {t.features.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.icon} className="flex flex-col gap-2">
                <span className="mb-1 flex size-11 items-center justify-center rounded-xlarge bg-brand-background-2 text-brand-foreground-1">
                  <Icon aria-hidden className="size-6" />
                </span>
                <H3 className="text-subtitle2 font-semibold text-foreground-1">{item.title}</H3>
                <p className="text-body1 text-foreground-2">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
