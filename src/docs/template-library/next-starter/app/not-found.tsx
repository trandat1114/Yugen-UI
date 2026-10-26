import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import content from "../content";

export const metadata: Metadata = { title: content.notFound.title, robots: { index: false } };

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-display text-title2 font-semibold">{content.notFound.title}</h1>
      <p className="text-body1 text-foreground-2">{content.notFound.body}</p>
      <Button asChild appearance="primary">
        <Link href="/">{content.notFound.action}</Link>
      </Button>
    </div>
  );
}
