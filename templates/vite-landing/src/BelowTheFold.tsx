import * as React from "react";
import { Toaster } from "yugen-ui";
import { useLanding } from "./context";
import { Faq } from "./Faq";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { SignUpSection } from "./SignUpSection";
import { Testimonials } from "./Testimonials";

const SECTIONS = [Features, Pricing, Testimonials, Faq, SignUpSection];

/**
 * Everything under the first screen, in its own chunk: the hero shows without waiting for the Accordion, the form and the
 * pricing switch. Sections are added one per frame, so the browser styles and lays out one at a time instead of all of
 * them in a single long task.
 */
export default function BelowTheFold() {
  const { embedded } = useLanding();
  const [count, setCount] = React.useState(1);
  const done = count === SECTIONS.length;

  React.useEffect(() => {
    if (done) return;
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setCount((c) => c + 1));
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [count, done]);

  // A link such as /#pricing: the section did not exist yet when the browser looked for it.
  React.useEffect(() => {
    if (!done || embedded || !window.location.hash) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }, [done, embedded]);

  return (
    <>
      {SECTIONS.slice(0, count).map((Section, i) => (
        <Section key={i} />
      ))}
      {/* For the sign-up toast. The embedded preview uses the host page's Toaster. */}
      {!embedded && <Toaster position="bottom-end" />}
    </>
  );
}
