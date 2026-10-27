"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Client Component: it needs usePathname() to mark the current page. */
export function NavLinks({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="ms-auto">
      <ul className="flex items-center gap-1">
        {links.map((link) => {
          const current = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-medium px-3 py-1.5 text-body1 text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1",
                  current && "font-semibold text-foreground-1",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
