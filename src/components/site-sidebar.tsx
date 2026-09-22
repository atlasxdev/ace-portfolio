"use client";

import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Copy,
  FolderGit2,
  Home,
  Layers,
  Menu,
  MessageSquare,
  Route,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/components/chatbot";
import { useContactDialog } from "@/components/contact-dialog";
import { Icons } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/tech-stacks", label: "Stacks", icon: Layers },
];

const SOCIALS = [
  { label: "LinkedIn", href: DATA.contact.social.LinkedIn.url, icon: Icons.linkedin },
  { label: "GitHub", href: DATA.contact.social.GitHub.url, icon: Icons.github },
];

/** Every row in the sidebar — nav, contact, socials — shares this one shape. */
const ROW =
  "group flex h-9 w-full cursor-pointer items-center gap-3 rounded-control px-2.5 text-body-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground";
const ROW_ICON = "size-4 shrink-0";
const TRAIL = "ml-auto size-3.5 shrink-0 text-ink-faint transition-colors group-hover:text-foreground";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="label mb-1.5 px-2.5 text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function Profile() {
  return (
    <div className="flex flex-col gap-snug px-2.5">
      {/* Name only: the logo lives in the hero, where it has room. */}
      <Link href="/" className="leading-tight">
        <span className="block text-body font-semibold tracking-tight text-foreground">{DATA.name}</span>
        <span className="block text-body-sm text-muted-foreground">Full-stack &amp; automation engineer</span>
      </Link>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rule px-2.5 py-1 text-xs font-medium text-available">
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
        Open to full-time &amp; contract
      </span>
    </div>
  );
}

function EmailInvite() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DATA.contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — the mailto link still works
    }
  };

  return (
    <div className="rounded-lg border border-rule bg-foreground/3 p-3">
      <p className="text-xs text-muted-foreground">For work, collabs &amp; everything else, reach me at</p>
      <div className="mt-2 flex items-center gap-1">
        <a
          href={`mailto:${DATA.contact.email}`}
          className="min-w-0 truncate text-body-sm font-medium text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground">
          {DATA.contact.email}
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Email copied" : "Copy email"}
          className="ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-ink-faint transition-colors hover:bg-foreground/5 hover:text-foreground">
          {copied ? <Check className="size-3.5 text-available" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

/** Everything the sidebar holds, shared by the desktop rail and the phone sheet. */
function SidebarContent({
  onNavigate,
  onOpenChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT)),
}: {
  onNavigate?: () => void;
  onOpenChat?: () => void;
}) {
  const pathname = usePathname();
  const openContact = useContactDialog();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-entry overflow-y-auto px-3 pt-group pb-group">
        <Profile />

        <Group label="Menu">
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(ROW, active && "bg-foreground/5 font-medium text-foreground")}>
                  <Icon className={ROW_ICON} aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
        </Group>

        <Group label="Contact">
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              openContact();
            }}
            className={ROW}>
            <MessageSquare className={ROW_ICON} aria-hidden />
            Message me
          </button>
          <a href={DATA.contact.calendly} target="_blank" rel="noopener noreferrer" className={ROW}>
            <Calendar className={ROW_ICON} aria-hidden />
            Schedule a call
            <ArrowUpRight className={TRAIL} aria-hidden />
          </a>
          <button
            type="button"
            onClick={onOpenChat}
            className={ROW}>
            <Sparkles className={ROW_ICON} aria-hidden />
            Ask my AI assistant
          </button>
        </Group>

        <Group label="Elsewhere">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={ROW}>
              <Icon className={ROW_ICON} aria-hidden />
              {label}
              <ArrowUpRight className={TRAIL} aria-hidden />
            </a>
          ))}
        </Group>

        {/* Pushed to the bottom of the rail, just above the footer; on short
            screens it scrolls with everything else. */}
        <div className="mt-auto flex items-center justify-between gap-tight px-2.5">
          <span className="label text-ink-faint">Theme</span>
          <ModeToggle />
        </div>
      </div>

      {/* Footer: the standing invite. */}
      <div className="border-t border-rule p-3">
        <EmailInvite />
      </div>
    </div>
  );
}

/**
 * Site navigation and identity. A fixed, always-open rail on desktop; below
 * lg, a slim top bar whose menu button opens the same content in a sheet.
 */
export function SiteSidebar() {
  const [open, setOpen] = useState(false);
  // The chat opens only after the sheet has closed: the sheet hands focus
  // back to its trigger on close, and that focus move would dismiss the chat.
  const chatPending = useRef(false);

  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:block">
        <SidebarContent />
      </aside>

      {/* phone + tablet */}
      <header className="sticky top-0 z-50 border-b border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="shell flex h-14 items-center justify-between gap-snug">
          <Link href="/" className="text-body-sm font-semibold tracking-tight">
            {DATA.name}
          </Link>

          <div className="flex items-center gap-tight">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="grid size-8 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                  <Menu className="size-4" aria-hidden />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(20rem,85vw)] bg-background p-0"
                onCloseAutoFocus={(e) => {
                  if (!chatPending.current) return;
                  chatPending.current = false;
                  e.preventDefault();
                  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
                }}>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation and contact</SheetDescription>
                <SidebarContent
                    onNavigate={() => setOpen(false)}
                  onOpenChat={() => {
                    chatPending.current = true;
                    setOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
