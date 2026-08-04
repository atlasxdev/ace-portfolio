"use client";

import { DATA } from "@/data/resume";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Monogram } from "@/components/monogram";
import { CARD_STATE, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
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
  const reduced = useReducedMotion();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
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
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.content,
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
    <div className="fixed right-group bottom-group z-50 flex flex-col items-end gap-snug">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={reduced ? { duration: 0.2 } : CARD_STATE}
            style={{ transformOrigin: "bottom right" }}
            className="glass w-[min(92vw,380px)] overflow-hidden bg-background/80 backdrop-blur-xl backdrop-saturate-150">
            {/* header — label-led, divider instead of an inverted bar */}
            <div className="flex items-center justify-between gap-snug border-b border-rule px-group py-snug">
              <div className="flex items-center gap-2.5">
                <Monogram className="size-5" />
                <div className="leading-tight">
                  <p className="text-body-sm font-semibold">Ask about {DATA.name.split(" ")[0]}</p>
                  <p className="label text-ink-faint">AI assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleChat}
                aria-label="Close chat"
                className="grid size-7 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                <X className="size-3.5" aria-hidden />
              </button>
            </div>

            {/* transcript */}
            <div className="flex h-90 flex-col gap-snug overflow-y-auto px-group py-group">
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

            {/* composer */}
            <form onSubmit={handleSubmit} className="flex items-center gap-snug border-t border-rule px-group py-snug">
              <input
                autoFocus
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-body-sm outline-none placeholder:text-ink-faint"
                value={inputValue}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!inputValue.trim() || isLoading}
                className="grid size-7 shrink-0 place-items-center rounded-control border border-rule text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40">
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-3.5" aria-hidden />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Chat with Ace's AI assistant"}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        transition={SPRING}
        className="glass grid size-12 cursor-pointer place-items-center rounded-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "chat"}
            initial={{ opacity: 0, rotate: isOpen ? -90 : 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: isOpen ? 90 : -90 }}
            transition={reduced ? { duration: 0.15 } : SPRING}
            className="grid place-items-center">
            {isOpen ? (
              <X className="size-5 text-foreground" aria-hidden />
            ) : (
              <MessageCircle className="size-5 text-foreground" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
