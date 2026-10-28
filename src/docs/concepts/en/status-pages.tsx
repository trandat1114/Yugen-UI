import type { ReactNode } from "react";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { STATUS_COPY, STATUSES } from "../../status/catalog";
import { StatusLab } from "../../status/StatusLab";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: wide tables scroll horizontally with the keyboard (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold whitespace-nowrap text-foreground-1" : "px-4 py-3 text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RECOVERY = `// 429 / 503: take the wait from the header, don't guess
const wait = Number(response.headers.get("Retry-After")) || 30;

// Offline: retry when the browser reports a connection
window.addEventListener("online", retry, { once: true });

// New version: the route's JS file is gone after a deploy
const Settings = lazy(() => import("./pages/Settings").catch(() => ({ default: NewVersionPage })));`;

const COPY = STATUS_COPY.en;

export default function StatusPagesPage() {
  return (
    <div className="flex flex-col">
      <DocSection id="when" title="When a page of its own">
        <P>
          A status page replaces the whole main content, so use it only when the whole route can't render: nothing at this URL, no
          permission, a server error, offline when the page opens. When only part of a page fails, report it in that part and keep
          the rest usable.
        </P>
        <SimpleTable
          head={["Case", "Use"]}
          rows={[
            ["The whole route can't render", "Status page"],
            ["One region fails to load (table, chart)", <><C>ErrorState</C> in that region, with retry</>],
            ["A form fails to submit", "Errors on each field or a MessageBar; keep what was typed"],
            ["A brief error that clears itself", "Toast or MessageBar"],
          ]}
        />
      </DocSection>

      <DocSection
        id="lab"
        title="Lab"
        description="Eleven states in the same layout as the boot loading screen. Switch numerals (Kanji / Latin), replay, or go full screen and step through states with previous / next."
      >
        <StatusLab />
      </DocSection>

      <DocSection id="catalog" title="Status catalog">
        <SimpleTable
          head={["Code", "Title", "When", "Main action"]}
          rows={STATUSES.map((s) => [s.code ?? COPY[s.id].eyebrow, COPY[s.id].title, COPY[s.id].when, COPY[s.id].primary])}
        />
      </DocSection>

      <DocSection id="copy" title="Writing the copy">
        <P>
          The title says what happened in plain words (“Page not found”); the description says why, when known, and what people can
          do next. The code sits in the small line above the title for anyone reporting the problem, and is never the only text on
          the page.
        </P>
        <P>
          Don't blame the user, don't joke when they just lost what they were doing, don't print a stack trace. An error ID (
          <C>7f3a-91c2</C>) is plain text people can select and copy.
        </P>
        <P>Each page has exactly one main action; the secondary action is a safe way out, such as Home or Switch account.</P>
      </DocSection>

      <DocSection id="art" title="Mark & vertical code">
        <P>
          The mark in the corner changes with the state: one petal missing when the page isn't found, all fallen when it was removed,
          still a bud when you need to sign in or ask for access, the ink broken on a server error, faded on a timeout, only a trace
          when offline. On 429 and 503 the brush stroke fills with the wait; when time is up the blossom opens as Retry turns on.
        </P>
        <P>
          Kanji style: the code runs down the edge like the loading screen, read digit by digit (四〇四); states without a code use
          words: 圏外 (out of range) when offline, 新版 for a new version. Latin style, for products that don't use kanji: the code sits
          horizontally in a light weight in the top corner; states without a code leave that corner empty.
        </P>
      </DocSection>

      <DocSection id="recovery" title="Recovering on its own">
        <P>
          Temporary states should clear themselves: count down from <C>Retry-After</C> and then enable the button, listen for the{" "}
          <C>online</C> event to retry, and offer a reload when a JS file fails to load after a deploy. After sign-in (401), take people
          back to the page they were opening.
        </P>
        <CodeBlock code={RECOVERY} />
        <P>
          A 404 page should return a real 404 status and <C>noindex</C>, so search engines don't index a page that looks normal. Static
          hosts (GitHub Pages) can only serve <C>404.html</C>; there, 500 and 503 come from the app itself.
        </P>
      </DocSection>

      <DocSection id="a11y" title="Accessibility">
        <P>
          The title is an <C>h1</C> naming the state; on client-side navigation, move focus to the <C>h1</C> and update{" "}
          <C>document.title</C>. The vertical code is decorative (<C>aria-hidden</C>); the readable code is in the line above the title.
        </P>
        <P>
          Announce countdowns through a <C>polite</C> live region at intervals (10 seconds), not every second. Never reload on your own
          without saying so first. With reduced motion, the brush stroke is already drawn and the petals already lie on the ground.
        </P>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Say what happened in plain words, with the code in a secondary line.",
            "One main action and one safe way out.",
            "Count down from Retry-After; retry when back online.",
            "Return a real HTTP status and noindex on 404 pages.",
          ]}
          donts={[
            "Send unknown URLs to the home page as if nothing happened.",
            "Show only “404” or “Error” without an explanation.",
            "Print stack traces or technical messages to users.",
            "Reload in a loop while the server is still failing.",
          ]}
        />
      </DocSection>
    </div>
  );
}
