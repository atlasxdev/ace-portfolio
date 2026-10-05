"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/lib/chat-events";
import { togglePet } from "@/lib/pet-store";

const Chatbot = dynamic(() => import("@/components/chatbot"), { ssr: false });
const AgPet = dynamic(() => import("@/components/ag-pet").then((m) => m.AgPet), { ssr: false });
const PageWipe = dynamic(() => import("@/components/motion/page-wipe").then((m) => m.PageWipe), { ssr: false });

/**
 * The chat, the pet and the page wipe, loaded once the page is up instead of
 * with it, so they don't hold back the first paint on slow phones. Asking for
 * one early (the sidebar button, ⌘K, "/", ⌘.) loads it straight away and the
 * request is replayed once it's mounted.
 *
 * The wipe and Ag are desktop-only: on touch screens the wipe only delays
 * each tap, and a pet roaming a phone-sized page just gets in the way.
 */
export function DeferredExtras() {
  const [ready, setReady] = useState(false);
  const [pendingChat, setPendingChat] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (ready) return;

    const load = () => {
      setDesktop(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
      setReady(true);
    };
    const openChat = () => {
      setPendingChat(true);
      load();
    };
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === ".") {
        e.preventDefault();
        togglePet();
        load();
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((mod && e.key.toLowerCase() === "k") || (e.key === "/" && !mod && !e.altKey && !typing)) {
        e.preventDefault();
        openChat();
      }
    };

    // After the load event, then whenever the main thread is free.
    // Safari has no requestIdleCallback.
    const hasIdle = typeof window.requestIdleCallback === "function";
    let idle = 0;
    const schedule = () => {
      idle = hasIdle ? window.requestIdleCallback(load, { timeout: 3000 }) : window.setTimeout(load, 1500);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    window.addEventListener(OPEN_CHAT_EVENT, openChat);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("load", schedule);
      window.removeEventListener(OPEN_CHAT_EVENT, openChat);
      window.removeEventListener("keydown", onKey);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [ready]);

  if (!ready) return null;
  return (
    <>
      {desktop && <PageWipe />}
      <Chatbot openOnMount={pendingChat} />
      {desktop && <AgPet />}
    </>
  );
}
