"use client";

import { DATA } from "@/data/resume";
import { Loader2, Mail, Maximize2, Minimize2, Send, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useContactDialog } from "@/components/contact-dialog";
import { Monogram } from "@/components/monogram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverClose, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CARD_STATE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Dispatched by the sidebar's "Ask my AI assistant" button. */
export const OPEN_CHAT_EVENT = "ag:open-chat";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  /** The model judged the visitor wants to reach Ace: offer the contact form. */
  showContact?: boolean;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const openContact = useContactDialog();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi there! Thanks for stopping by my website 😊 Feel free to ask me anything about web development or programming. I’m happy to help—just let me know!",
    },
  ]);
  const [inputValue, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set when the panel closes to hand off to the contact dialog, so Radix doesn't
  // pull focus back to the sidebar while the dialog is mounting.
  const handingOff = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, open);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Closing resets the size: reopening into a panel that covers half the page
  // because of something you did five minutes ago is a surprise, not a memory.
  // The transcript itself survives: it lives above the popover.
  const handleOpenChange = (open: boolean) => {
    if (!open) setExpanded(false);
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.content,
            showContact: data.showContact === true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <PopoverContent
            forceMount
            asChild
            side="top"
            align="end"
            sideOffset={12}
            collisionPadding={16}
            onOpenAutoFocus={(e) => {
              // Land on the composer, not on the panel wrapper.
              e.preventDefault();
              inputRef.current?.focus();
            }}
            onCloseAutoFocus={(e) => {
              if (handingOff.current) {
                handingOff.current = false;
                e.preventDefault();
              }
            }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={reduced ? { duration: 0.2 } : CARD_STATE}
              style={{ transformOrigin: "bottom right" }}
              className={cn(
                "glass overflow-hidden bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-500 ease-out",
                expanded ? "w-[min(94vw,640px)]" : "w-[min(92vw,380px)]",
              )}>
              {/* header — label-led, divider instead of an inverted bar */}
              <div className="flex items-center justify-between gap-snug border-b border-rule px-group py-snug">
                <div className="flex items-center gap-2.5">
                  <Monogram className="size-5" />
                  <div className="leading-tight">
                    <p className="text-body-sm font-semibold">Ask about {DATA.name.split(" ")[0]}</p>
                    <p className="label text-ink-faint">AI assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="control"
                    size="control"
                    onClick={() => setExpanded((v) => !v)}
                    aria-label={expanded ? "Shrink chat" : "Expand chat"}
                    aria-pressed={expanded}>
                    {expanded ? (
                      <Minimize2 className="size-3.5" aria-hidden />
                    ) : (
                      <Maximize2 className="size-3.5" aria-hidden />
                    )}
                  </Button>
                  <PopoverClose asChild>
                    <Button type="button" variant="control" size="control" aria-label="Close chat">
                      <X className="size-3.5" aria-hidden />
                    </Button>
                  </PopoverClose>
                </div>
              </div>

              {/* transcript */}
              <ScrollArea
                viewportClassName="px-group py-group"
                className={cn("transition-[height] duration-500 ease-out", expanded ? "h-[min(70vh,560px)]" : "h-90")}>
                <div className="flex flex-col gap-snug">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.role === "assistant" ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-control px-3 py-2 text-body-sm leading-5",
                          message.role === "assistant"
                            ? "border border-rule bg-foreground/4 whitespace-pre-wrap text-muted-foreground"
                            : "bg-foreground text-background",
                        )}>
                        {message.content}
                        {message.showContact && (
                          <Button
                            type="button"
                            variant="pill"
                            size="pill-sm"
                            onClick={() => {
                              // Close the chat so the dialog isn't competing with it.
                              handingOff.current = true;
                              handleOpenChange(false);
                              openContact();
                            }}
                            className="mt-2.5 w-fit text-body-sm">
                            <Mail className="size-3.5" aria-hidden />
                            Message Ace
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-control border border-rule bg-foreground/4 px-3 py-2 text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        <span className="sr-only">Thinking</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* composer */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-snug border-t border-rule px-group py-snug">
                <Input
                  ref={inputRef}
                  variant="ghost"
                  placeholder="Type a message…"
                  className="flex-1"
                  value={inputValue}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="control"
                  size="control"
                  aria-label="Send message"
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0">
                  {isLoading ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Send className="size-3.5" aria-hidden />
                  )}
                </Button>
              </form>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>

      {/* No trigger of its own: the sidebar opens it. This pins the panel to
          the bottom-right corner, where the bubble used to sit. */}
      <PopoverAnchor asChild>
        <span aria-hidden className="pointer-events-none fixed right-group bottom-group size-0" />
      </PopoverAnchor>
    </Popover>
  );
}
