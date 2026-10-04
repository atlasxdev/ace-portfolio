"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowUp,
  ArrowUpRight,
  CircleCheck,
  Code,
  CornerDownLeft,
  FileText,
  Layers,
  Mail,
  Square,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ChatEvent } from "@/app/api/chat/route";
import { useContactDialog } from "@/components/contact-dialog";
import { Monogram } from "@/components/monogram";
import { PaletteSnake } from "@/components/palette-snake";
import { PaletteSource } from "@/components/palette-source";
import { findChatProject } from "@/lib/chat-projects";
import { keepOpenForPet, togglePet } from "@/lib/pet-store";
import { CARD_STATE, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Dispatched by the sidebar's "Ask my AI assistant" button. */
export const OPEN_CHAT_EVENT = "ag:open-chat";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  /** The reply is still arriving. */
  streaming?: boolean;
  /** The request failed or the stream broke before any text arrived. */
  failed?: boolean;
  /** The visitor stopped the reply. */
  stopped?: boolean;
  /** The model judged the visitor wants to reach Ace: offer the contact form. */
  showContact?: boolean;
  /** Titles of the projects the reply is about, shown as cards. */
  projects?: string[];
  /** Questions the visitor might ask next. */
  followUps?: string[];
};

type Starter = { icon: LucideIcon; text: string; contact?: boolean };

const STARTERS: Starter[] = [
  { icon: Layers, text: "What has Ace built recently?" },
  { icon: Code, text: "Which tools does Ace work with?" },
  { icon: FileText, text: "Walk me through the admissions portal" },
  { icon: CircleCheck, text: "Is Ace open to new work?" },
  { icon: Mail, text: "Send Ace a message", contact: true },
];

/** Hidden commands: typing "/" in the palette lists them instead of asking the assistant. */
const COMMANDS = [
  {
    cmd: "/pet",
    label: "Ag, the site pet",
    desc: "Summon it, or send it away",
  },
  { cmd: "/play", label: "Snake", desc: "A quick game, right here" },
  {
    cmd: "/source",
    label: "How this site is built",
    desc: "The stack behind it",
  },
];

/** What a command opens inside the palette, in place of the conversation. */
type Screen = "play" | "source";

const matchCommands = (text: string) => COMMANDS.filter((c) => c.cmd.startsWith(text.trim().toLowerCase()));

/** Reads the route's newline-delimited JSON events as they arrive. */
async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (event: ChatEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as ChatEvent);
    }
  }
}

/**
 * Lets streamed text out at a steady typing pace. The model sends it in
 * uneven bursts, often a whole sentence at once, which reads as a jump
 * rather than as writing. Long backlogs drain faster so it never lags far.
 */
function useTypedText(text: string, animate: boolean) {
  const reduced = useReducedMotion();
  // Decided once, at mount: a reply that arrived streaming keeps typing out
  // after the stream ends, rather than jumping to the end with the backlog.
  const [streamed] = useState(animate);
  const [shown, setShown] = useState(animate ? 0 : text.length);
  const smooth = streamed && !reduced;

  useEffect(() => {
    if (!smooth || shown >= text.length) return;
    const frame = requestAnimationFrame(() =>
      setShown((s) => Math.min(text.length, s + Math.max(2, Math.ceil((text.length - s) / 24)))),
    );
    return () => cancelAnimationFrame(frame);
  }, [smooth, shown, text.length]);

  return smooth ? text.slice(0, shown) : text;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState<Screen | null>(null);
  // Closing the palette, however it closes, leaves any command screen.
  if (!isOpen && screen) setScreen(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  /** The highlighted starter, moved with the arrow keys. */
  const [active, setActive] = useState(0);
  const openContact = useContactDialog();
  const reduced = useReducedMotion();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  // Set when the chat closes to hand off to the contact dialog, so Radix doesn't
  // pull focus back to the sidebar while the dialog is mounting.
  const handingOff = useRef(false);
  const isOpenRef = useRef(isOpen);
  useLayoutEffect(() => {
    isOpenRef.current = isOpen;
  });

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, open);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open);
  }, []);

  // ⌘K / Ctrl+K toggles the chat from anywhere; "/" opens it unless you're
  // already typing somewhere. Esc closing comes free from the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
        return;
      }
      if (e.key === "/" && !mod && !e.altKey && !isOpenRef.current) {
        const t = e.target as HTMLElement | null;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the newest text in view while it streams, unless the visitor has
  // scrolled up to reread something.
  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!isOpen || !scroller || !content) return;
    let pinned = true;
    const onScroll = () => {
      pinned = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 48;
    };
    const observer = new ResizeObserver(() => {
      if (pinned) scroller.scrollTop = scroller.scrollHeight;
    });
    scroller.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(content);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [isOpen, messages.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => abortRef.current?.abort();

  const runCommand = (cmd: string) => {
    setInput("");
    if (cmd === "/pet") {
      togglePet();
      setIsOpen(false);
    } else setScreen(cmd === "/play" ? "play" : "source");
    inputRef.current?.focus();
  };

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    if (question.startsWith("/")) {
      const [command] = matchCommands(question);
      if (command) runCommand(command.cmd);
      return;
    }
    setScreen(null);

    const user: Message = {
      id: nextId.current++,
      role: "user",
      content: question,
    };
    const reply: Message = {
      id: nextId.current++,
      role: "assistant",
      content: "",
      streaming: true,
    };
    const history = [...messages.filter((m) => m.content), user];
    setMessages((prev) => [...prev, user, reply]);
    setInput("");
    setBusy(true);
    inputRef.current?.focus();

    const patch = (fn: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === reply.id ? fn(m) : m)));

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(`Chat request failed (${response.status})`);
      await readEvents(response.body, (event) => {
        if (event.type === "delta") patch((m) => ({ ...m, content: m.content + event.text }));
        else if (event.type === "done")
          patch((m) => ({
            ...m,
            showContact: event.showContact,
            projects: event.projects,
            followUps: event.followUps,
          }));
        else patch((m) => ({ ...m, failed: !m.content }));
      });
    } catch (error) {
      if (controller.signal.aborted) patch((m) => ({ ...m, stopped: true }));
      else {
        console.error("Error sending message:", error);
        patch((m) => ({ ...m, failed: !m.content }));
      }
    } finally {
      patch((m) => ({ ...m, streaming: false }));
      abortRef.current = null;
      setBusy(false);
    }
  };

  const handOffToContact = () => {
    // Close the chat so the dialog isn't competing with it.
    handingOff.current = true;
    setIsOpen(false);
    openContact();
  };

  const pickStarter = (starter: Starter) => (starter.contact ? handOffToContact() : ask(starter.text));

  const newChat = () => {
    stop();
    setMessages([]);
    setActive(0);
    inputRef.current?.focus();
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (screen || messages.length > 0 || input) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + STARTERS.length) % STARTERS.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickStarter(STARTERS[active]);
    }
  };

  const empty = messages.length === 0;
  const commandMode = input.trimStart().startsWith("/");
  const last = messages[messages.length - 1];

  return (
    <>
      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <AnimatePresence>
          {isOpen && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[60] hidden bg-black/55 backdrop-blur-[2px] lg:block"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content
                asChild
                forceMount
                aria-describedby={undefined}
                onOpenAutoFocus={(e) => {
                  // Land on the question field, not on the close button.
                  e.preventDefault();
                  inputRef.current?.focus();
                }}
                onCloseAutoFocus={(e) => {
                  if (handingOff.current) {
                    handingOff.current = false;
                    e.preventDefault();
                  }
                }}
                onPointerDownOutside={keepOpenForPet}
                onInteractOutside={keepOpenForPet}
                onEscapeKeyDown={(e) => {
                  // Esc stops a reply in progress first, or leaves a command
                  // screen; otherwise it closes.
                  if (busy) {
                    e.preventDefault();
                    stop();
                  } else if (screen) {
                    e.preventDefault();
                    setScreen(null);
                  }
                }}>
                <motion.div
                  initial={{
                    opacity: 0,
                    y: reduced ? 0 : 12,
                    scale: reduced ? 1 : 0.985,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: reduced ? 0 : 8,
                    scale: reduced ? 1 : 0.985,
                  }}
                  transition={CARD_STATE}
                  className={cn(
                    // Phones and tablets: the whole screen.
                    "fixed inset-0 z-[60] flex h-dvh flex-col bg-card text-foreground",
                    // Desktop: a command palette.
                    "lg:inset-0 lg:m-auto lg:h-fit lg:max-h-[min(80vh,720px)] lg:w-[min(92vw,760px)] lg:overflow-hidden lg:rounded-2xl lg:border lg:border-foreground/12 lg:shadow-[inset_0_1px_0_var(--glass-hi),0_40px_90px_-24px_rgb(0_0_0/0.65)]",
                  )}>
                  <DialogPrimitive.Title className="sr-only">Ask about Ace</DialogPrimitive.Title>

                  {/* header: touch layouts only; the palette's field is its header */}
                  <div className="order-1 flex items-center justify-between gap-snug border-b border-rule py-2 pr-2 pl-4 lg:hidden">
                    <div className="flex items-center gap-2.5">
                      <Monogram className="size-5" />
                      <div className="leading-tight">
                        <p className="text-body font-semibold">Ask about Ace</p>
                        <p className="text-xs text-ink-faint">AI assistant</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {screen ? (
                        <button
                          type="button"
                          onClick={() => setScreen(null)}
                          className="h-11 cursor-pointer rounded-control px-3 text-body-sm text-muted-foreground hover:text-foreground">
                          Back
                        </button>
                      ) : (
                        !empty && (
                          <button
                            type="button"
                            onClick={newChat}
                            className="h-11 cursor-pointer rounded-control px-3 text-body-sm text-muted-foreground hover:text-foreground">
                            New chat
                          </button>
                        )
                      )}
                      <DialogPrimitive.Close
                        aria-label="Close chat"
                        className="grid size-11 cursor-pointer place-items-center rounded-control text-muted-foreground hover:text-foreground">
                        <X className="size-4.5" aria-hidden />
                      </DialogPrimitive.Close>
                    </div>
                  </div>

                  {/* question field: the palette's top bar on desktop, the composer at the bottom on touch */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      ask(input);
                    }}
                    className="order-3 border-t border-rule px-3 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:order-1 lg:border-t-0 lg:border-b lg:p-0">
                    <div className="flex items-center gap-2 rounded-full border border-foreground/12 bg-foreground/4 py-1 pr-1 pl-4 md:mx-auto md:max-w-2xl lg:mx-0 lg:h-15 lg:max-w-none lg:rounded-none lg:border-0 lg:bg-transparent lg:px-4">
                      <Monogram className="hidden size-5 shrink-0 lg:block" />
                      <label htmlFor="chat-question" className="sr-only">
                        {empty ? "Ask about Ace's work" : "Ask a follow-up"}
                      </label>
                      <input
                        id="chat-question"
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onInputKey}
                        placeholder={
                          screen
                            ? "Ask about Ace, or type / for commands"
                            : empty
                              ? "Ask about Ace's work"
                              : "Ask a follow-up"
                        }
                        autoComplete="off"
                        className="h-10 min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-ink-faint lg:text-[17px]"
                      />
                      {busy ? (
                        <button
                          type="button"
                          onClick={stop}
                          aria-label="Stop reply"
                          className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-foreground/12 px-3 text-body-sm text-foreground hover:bg-foreground/5 lg:rounded-control">
                          <Square className="size-2.5 fill-current" aria-hidden />
                          <span className="hidden lg:inline">Stop</span>
                        </button>
                      ) : (
                        <>
                          <kbd className="hidden rounded-[5px] border border-rule bg-foreground/4 px-1.5 font-sans text-[11px] leading-5 text-muted-foreground lg:inline">
                            Esc
                          </kbd>
                          <button
                            type="submit"
                            aria-label="Send message"
                            disabled={!input.trim()}
                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-foreground text-background disabled:opacity-30 lg:hidden">
                            <ArrowUp className="size-4.5" aria-hidden />
                          </button>
                        </>
                      )}
                    </div>
                  </form>

                  {/* transcript */}
                  <div
                    ref={scrollRef}
                    className={cn(
                      "order-2 min-h-0 flex-1 overflow-y-auto overscroll-contain",
                      (empty || commandMode || screen) && "lg:flex-none",
                    )}>
                    <div
                      ref={contentRef}
                      className={cn(
                        "flex min-h-full flex-col md:mx-auto md:max-w-2xl lg:max-w-none",
                        !empty && !commandMode && !screen && "gap-5 px-4 py-5 lg:px-6",
                      )}>
                      {commandMode ? (
                        <CommandList matches={matchCommands(input)} onRun={runCommand} />
                      ) : screen === "play" ? (
                        <PaletteSnake />
                      ) : screen === "source" ? (
                        <PaletteSource />
                      ) : empty ? (
                        <Welcome active={active} onHover={setActive} onPick={pickStarter} />
                      ) : (
                        <div role="log" aria-label="Conversation" className="flex flex-col gap-5">
                          {messages.map((m) =>
                            m.role === "user" ? (
                              <p
                                key={m.id}
                                className="max-w-[82%] self-end rounded-[18px] rounded-br-[4px] bg-foreground px-3.5 py-2 text-[15px] leading-[22px] text-background lg:max-w-none lg:self-start lg:rounded-none lg:bg-transparent lg:p-0 lg:text-[17px] lg:leading-6 lg:font-semibold lg:tracking-[-0.01em] lg:text-foreground">
                                {m.content}
                              </p>
                            ) : (
                              <AssistantMessage
                                key={m.id}
                                message={m}
                                isLast={m === last}
                                onAsk={ask}
                                onContact={handOffToContact}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* palette footer: status and keys */}
                  <div className="order-4 hidden items-center justify-between border-t border-rule px-4 py-2.5 text-xs text-ink-faint lg:flex">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-available" aria-hidden />
                      AI assistant
                      {!empty && (
                        <button
                          type="button"
                          onClick={newChat}
                          className="ml-2 cursor-pointer text-muted-foreground underline underline-offset-3 hover:text-foreground">
                          New chat
                        </button>
                      )}
                    </span>
                    {screen && !commandMode ? (
                      <span className="flex items-center gap-4">
                        {screen === "play" && (
                          <span className="flex items-center gap-1.5">
                            <Key>←↑↓→</Key>
                            to steer
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Key>Esc</Key>
                          to go back
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-4">
                        {empty && !commandMode && (
                          <span className="flex items-center gap-1.5">
                            <Key>↑</Key>
                            <Key>↓</Key>
                            to move
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Key>{busy ? "Esc" : "Enter"}</Key>
                          {busy ? "to stop" : commandMode ? "to run" : "to ask"}
                        </span>
                        {!commandMode && !busy && (
                          <span className="flex items-center gap-1.5">
                            <Key>/</Key>
                            for commands
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>

      {/* Phones and tablets have no sidebar rail on screen, so the chat gets
          its own way in at the bottom of the page. It's there from the first
          paint; it only animates when the chat opens and closes. */}
      <AnimatePresence initial={false}>
        {!isOpen && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-12 cursor-pointer items-center gap-2.5 rounded-full border border-foreground/12 bg-card/90 pr-5 pl-3.5 text-body text-foreground shadow-[0_16px_40px_-16px_rgb(0_0_0/0.6)] backdrop-blur-xl lg:hidden">
            <Monogram className="size-5" />
            Ask about Ace
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="min-w-5 rounded-[5px] border border-rule bg-foreground/4 px-1.5 text-center font-sans text-[11px] leading-5 text-muted-foreground">
      {children}
    </kbd>
  );
}

function CommandList({ matches, onRun }: { matches: typeof COMMANDS; onRun: (cmd: string) => void }) {
  return (
    <div className="mt-auto flex flex-col gap-1 px-4 py-5 lg:mt-0 lg:p-2">
      <p className="px-2.5 pt-2 pb-1.5 text-xs text-ink-faint">Hidden commands</p>
      {matches.length === 0 ? (
        <p className="px-2.5 pb-2 text-body-sm text-muted-foreground">No command by that name.</p>
      ) : (
        <ul>
          {matches.map((c, i) => (
            <li key={c.cmd}>
              <button
                type="button"
                onClick={() => onRun(c.cmd)}
                className={cn(
                  "flex h-12 w-full cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-left text-[15px] text-foreground hover:bg-foreground/4 lg:text-body",
                  i === 0 && "bg-foreground/7",
                )}>
                <span className="min-w-14 font-mono text-body-sm">{c.cmd}</span>
                <span>{c.label}</span>
                <span className="hidden text-body-sm text-muted-foreground sm:inline">{c.desc}</span>
                {i === 0 && (
                  <span className="ml-auto hidden lg:inline">
                    <Key>Enter</Key>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Welcome({
  active,
  onHover,
  onPick,
}: {
  active: number;
  onHover: (i: number) => void;
  onPick: (starter: Starter) => void;
}) {
  return (
    <div className="mt-auto flex flex-col gap-5 px-4 py-5 lg:mt-0 lg:gap-0 lg:p-2">
      <div className="lg:hidden">
        <h2 className="text-[26px] leading-[30px] font-semibold tracking-[-0.025em]">
          Hi, I can tell you about Ace&apos;s work.
        </h2>
        <p className="mt-2 text-[15px] leading-[22px] text-muted-foreground">
          Ask about projects, the tools Ace builds with, or how to get in touch.
        </p>
      </div>
      <p className="hidden px-2.5 pt-2 pb-1.5 text-xs text-ink-faint lg:block">Try asking</p>
      <ul className="overflow-hidden rounded-[14px] border border-rule lg:rounded-none lg:border-0">
        {STARTERS.map((starter, i) => {
          const Icon = starter.icon;
          const on = i === active;
          return (
            <li key={starter.text} className="border-t border-rule first:border-t-0 lg:border-0">
              <button
                type="button"
                onClick={() => onPick(starter)}
                onMouseEnter={() => onHover(i)}
                className={cn(
                  "group flex h-13 w-full cursor-pointer items-center gap-3 px-4 text-left text-[15px] text-foreground hover:bg-foreground/4 lg:h-11.5 lg:rounded-[10px] lg:px-2.5 lg:text-body lg:hover:bg-transparent",
                  on && "lg:bg-foreground/7",
                )}>
                <Icon
                  className={cn("size-4 shrink-0 text-ink-faint", on && "lg:text-foreground")}
                  strokeWidth={1.75}
                  aria-hidden
                />
                {starter.text}
                <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-ink-faint lg:hidden" aria-hidden />
                {on && (
                  <span className="ml-auto hidden lg:inline">
                    <Key>Enter</Key>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AssistantMessage({
  message,
  isLast,
  onAsk,
  onContact,
}: {
  message: Message;
  isLast: boolean;
  onAsk: (text: string) => void;
  onContact: () => void;
}) {
  const typed = useTypedText(message.content, !!message.streaming);
  const typing = typed.length < message.content.length;
  const settled = !message.streaming && !typing;
  const projects = (message.projects ?? []).map(findChatProject).filter((p) => p !== undefined);

  if (message.streaming && !message.content) {
    return (
      <div role="status" className="flex h-6 items-center gap-1.5 text-body-sm text-ink-faint">
        <span className="chat-dot" aria-hidden />
        <span className="chat-dot" aria-hidden />
        <span className="chat-dot" aria-hidden />
        <span className="ml-2">Looking through Ace&apos;s projects</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {message.failed ? (
        <p className="text-[15px] leading-6 text-muted-foreground lg:text-body-lg">
          The assistant couldn&apos;t be reached. Try again in a moment, or message Ace directly.
        </p>
      ) : message.stopped && !message.content ? (
        <p className="text-body-sm text-ink-faint">Stopped.</p>
      ) : (
        <p className="text-[15px] leading-6 whitespace-pre-wrap text-foreground lg:text-[14px] lg:leading-[23px]">
          {typed}
          {(message.streaming || typing) && <span className="chat-caret" aria-hidden />}
        </p>
      )}

      {settled && (projects.length > 0 || message.showContact || message.failed) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col gap-3">
          {projects.length > 0 && (
            <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
              {projects.map((p) => (
                <ProjectCard key={p.title} {...p} />
              ))}
            </div>
          )}
          {(message.showContact || message.failed) && (
            <button
              type="button"
              onClick={onContact}
              className="flex h-9 w-fit cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 text-body-sm font-medium text-background">
              <Mail className="size-3.5" aria-hidden />
              Message Ace
            </button>
          )}
        </motion.div>
      )}

      {settled && isLast && !!message.followUps?.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {message.followUps.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onAsk(q)}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-foreground/12 px-3.5 text-body-sm whitespace-nowrap text-foreground hover:bg-foreground/5">
              <CornerDownLeft className="hidden size-3.5 text-ink-faint lg:block" aria-hidden />
              {q}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ProjectCard({ title, href, tag, summary }: NonNullable<ReturnType<typeof findChatProject>>) {
  const external = !!href && /^https?:/.test(href);
  const body = (
    <>
      <span className="flex items-center gap-2">
        <span className="text-body font-semibold">{title}</span>
        {href && <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-ink-faint" aria-hidden />}
      </span>
      <span className="mt-1 line-clamp-2 text-body-sm text-muted-foreground">{summary}</span>
      {tag && (
        <span className="mt-2.5 w-fit rounded-full border border-rule px-2 text-[10.5px] leading-[18px] text-muted-foreground">
          {tag}
        </span>
      )}
    </>
  );
  const className =
    "flex w-[78%] shrink-0 snap-start flex-col rounded-xl border border-foreground/12 bg-foreground/4 px-3.5 py-3 md:w-auto";
  return href ? (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(className, "transition-colors hover:border-foreground/30")}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
