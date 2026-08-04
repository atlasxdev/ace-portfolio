"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";

import { DATA } from "@/data/resume";
import { CopyButton } from "@/components/copy-button";
import { Monogram } from "@/components/monogram";
import { ModeToggle } from "@/components/mode-toggle";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/tech-stacks", label: "Stacks" },
];

/**
 * Full-width navigation with a bottom divider rather than an elevated surface.
 * Four states, per the reference: desktop, tablet, phone-closed, phone-open.
 * The phone state expands in place instead of becoming a separate overlay.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Close on navigation — the route changes underneath the open menu.
  // Deferred so this isn't a synchronous setState inside an effect.
  useEffect(() => {
    const close = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(close);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="shell flex h-14 items-center justify-between gap-snug">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-body-sm font-semibold tracking-tight"
        >
          <Monogram className="size-5" />
          <span>{DATA.name}</span>
        </Link>

        {/* tablet + desktop */}
        <nav className="hidden items-center gap-entry md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "label transition-colors hover:text-foreground",
                isActive(item.href) && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-tight">
          <a
            href={`mailto:${DATA.contact.email}`}
            className="hidden text-body-sm text-muted-foreground transition-colors hover:text-foreground lg:block"
          >
            {DATA.contact.email}
          </a>
          <CopyButton value={DATA.contact.email} />

          <ModeToggle className="size-7 rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground" />

          {/* phone only */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-7 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground md:hidden"
          >
            {open ? (
              <X className="size-3.5" aria-hidden />
            ) : (
              <Menu className="size-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* phone — open. Expands in place; the extra bottom padding is the
          reference's treatment for the revealed state. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.2 } : SPRING}
            className="overflow-hidden border-t border-rule md:hidden"
          >
            <div className="shell flex flex-col gap-snug py-group pb-entry">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "label transition-colors hover:text-foreground",
                    isActive(item.href) && "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${DATA.contact.email}`}
                className="label text-muted-foreground transition-colors hover:text-foreground"
              >
                {DATA.contact.email}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
