"use client";

import { Calendar, Menu, MessageCircle, MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/components/chatbot";
import { ContactTrigger } from "@/components/contact-dialog";
import { CopyButton } from "@/components/copy-button";
import { ModeToggle } from "@/components/mode-toggle";
import { DATA } from "@/data/resume";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/journey", label: "Journey" },
  { href: "/tech-stacks", label: "Stacks" },
];

const SOCIALS = [
  { label: "LinkedIn", href: DATA.contact.social.LinkedIn.url },
  { label: "GitHub", href: DATA.contact.social.GitHub.url },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-body-sm font-semibold tracking-tight">
      {/* A real image, not the inline <Monogram>: it's the page's first image,
          so Google has the AG logo to pick as the result thumbnail. Same file
          as primaryImageOfPage in person-schema.tsx. */}
      <Image
        src="/ag-logo-1200.png"
        alt={`${DATA.name} logo`}
        width={28}
        height={28}
        unoptimized
        priority
        className="size-7 rounded-md"
      />
      <span>{DATA.name}</span>
    </Link>
  );
}

/** Everything the sidebar holds, shared by the desktop rail and the phone drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col gap-entry overflow-y-auto p-group">
      <div>
        <Logo />
        <p className="mt-snug text-body-sm text-muted-foreground">Full-stack &amp; automation engineer</p>
        <p className="label mt-tight text-ink-faint">{DATA.location} &middot; Open to remote</p>
        <p className="mt-tight flex items-center gap-2 text-body-sm font-medium text-available">
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          Open to full-time and contract work
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-control px-3 py-2 text-body-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground",
              isActive(item.href) && "bg-foreground/5 font-medium text-foreground",
            )}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-tight">
        <ContactTrigger className="glass glass-hover inline-flex items-center gap-2 rounded-full px-4 py-2 text-body-sm font-medium">
          <MessageSquare className="size-4 text-available" aria-hidden />
          Message me
        </ContactTrigger>
        <a
          href={DATA.contact.calendly}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-body-sm font-medium text-background transition-transform duration-300 hover:-translate-y-0.5">
          <Calendar className="size-4" aria-hidden />
          Schedule a call
        </a>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
          }}
          className="glass glass-hover inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-body-sm font-medium">
          <MessageCircle className="size-4" aria-hidden />
          Ask my AI assistant
        </button>
        <div className="flex items-center gap-tight pt-tight">
          <a
            href={`mailto:${DATA.contact.email}`}
            className="min-w-0 truncate text-body-sm text-muted-foreground transition-colors hover:text-foreground">
            {DATA.contact.email}
          </a>
          <CopyButton value={DATA.contact.email} />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-tight border-t border-rule pt-group">
        <div className="flex items-center gap-group">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">
              {s.label}
            </a>
          ))}
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}

/**
 * Site navigation and identity. A fixed, always-open rail on desktop; on
 * phones and tablets a slim top bar whose menu button opens the same content
 * as a drawer.
 */
export function SiteSidebar() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Close on navigation — the route changes underneath the open drawer.
  // Deferred so this isn't a synchronous setState inside an effect.
  useEffect(() => {
    const close = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(close);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:block">
        <SidebarContent />
      </aside>

      {/* phone + tablet */}
      <header className="sticky top-0 z-50 border-b border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="shell flex h-14 items-center justify-between gap-snug">
          <Logo />
          <div className="flex items-center gap-tight">
            <ModeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-sidebar"
              aria-label="Open menu"
              className="grid size-7 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              <Menu className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-60 bg-background/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              id="mobile-sidebar"
              aria-label="Menu"
              initial={reduced ? { opacity: 0 } : { x: "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "-100%" }}
              transition={reduced ? { duration: 0.2 } : SPRING}
              className="fixed inset-y-0 left-0 z-70 w-[min(20rem,85vw)] border-r border-rule bg-background lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute top-group right-group grid size-7 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                <X className="size-3.5" aria-hidden />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
