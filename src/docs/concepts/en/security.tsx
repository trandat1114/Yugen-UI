import type { ReactNode } from "react";
import { DocSection } from "../../blocks";
import { docsPath } from "../../router";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function List({ children }: { children: ReactNode }) {
  return <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body2 text-foreground-2">{children}</ul>;
}

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="text-link underline hover:text-link-hover" href={href}>
    {children}
  </a>
);

export default function Page() {
  return (
    <>
      <DocSection id="handled" title="What Yugen UI handles" description="Checked in a security review before 1.0 (#165).">
        <List>
          <li>
            <A href={docsPath("/components/markdown")}>Markdown</A> and <A href={docsPath("/components/streamingmarkdown")}>StreamingMarkdown</A>{" "}
            parse into React elements, without HTML and without <C>dangerouslySetInnerHTML</C>. HTML tags show as text.
          </li>
          <li>
            Links keep <C>http:</C>, <C>https:</C> and <C>mailto:</C>, plus relative links (<C>/path</C>, <C>#id</C>) in Markdown; StreamingMarkdown keeps them only with <C>relativeLinks</C>.{" "}
            <C>javascript:</C>, <C>data:</C>, <C>vbscript:</C> and protocol-relative URLs show as text, including mixed case and
            control characters. Citation uses the same check. Images (<C>![alt](src)</C>) render as links, so a message cannot load
            a remote image.
          </li>
          <li>
            Very long or deeply nested input can&apos;t stall the page: nesting is capped (blocks 32, inline 16), unclosed brackets and
            markers are scanned with a limit, and CI parses adversarial and random input with a time budget.
          </li>
          <li>
            <A href={docsPath("/components/codeblock")}>CodeBlock</A> renders tokens as text, and the highlighter stays linear on very
            long lines.
          </li>
          <li>
            FileUpload and PromptInput previews use object URLs and revoke them when the file is removed or the component unmounts.
            SVG files are shown in <C>&lt;img&gt;</C>, where scripts don&apos;t run.
          </li>
          <li>
            React 19 blocks <C>javascript:</C> URLs that you pass to <C>href</C> yourself (Link, Button <C>asChild</C>…).
          </li>
        </List>
      </DocSection>

      <DocSection id="app" title="What your app must do">
        <List>
          <li>
            <A href={docsPath("/components/prose")}>Prose</A> styles whatever HTML you put in it and does not sanitize it. Sanitize HTML
            from users or a CMS first (for example with DOMPurify), or render Markdown with the Markdown component instead.
          </li>
          <li>
            Check URLs from users before passing them to <C>href</C> or <C>src</C>: allow <C>https:</C> (and the schemes you need), not{" "}
            <C>data:</C> for links.
          </li>
          <li>Limit the size of user and model content on the server; the client limits keep the page responsive, not your storage.</li>
          <li>Validate uploaded files on the server; FileUpload&apos;s <C>accept</C> and size checks are for the user, not for security.</li>
        </List>
      </DocSection>

      <DocSection id="report" title="Reporting a vulnerability">
        <p className="max-w-3xl text-body2 text-foreground-2">
          Please report it privately, as described in{" "}
          <A href="https://github.com/trandat1114/Yugen-UI/blob/main/SECURITY.md">SECURITY.md</A>, not in a public issue.
        </p>
      </DocSection>
    </>
  );
}
