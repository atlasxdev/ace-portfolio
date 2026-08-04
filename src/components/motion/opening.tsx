"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { PRE_HANDOFF_MS } from "@/lib/motion";

/**
 * Gates the opening cascade on the preloader finishing.
 *
 * Without this the two run concurrently: the preloader covers the viewport for
 * two seconds while the hero's 0.1s–1.35s cascade plays underneath it. By the
 * time the panel lifts the animation has already finished, so the page appears
 * fully formed and nothing looks animated at all.
 */
const OpeningContext = createContext(false);

export const PRELOADER_DONE_EVENT = "ag:preloader-done";

export function useOpeningReady() {
  return useContext(OpeningContext);
}

export function OpeningProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    window.addEventListener(PRELOADER_DONE_EVENT, start);

    // Safety net: if the preloader never reports (disabled, errored, reduced
    // motion), start anyway rather than leaving the page invisible. Must sit
    // past the preloader's own handoff, or it fires the cascade underneath a
    // surface that hasn't lifted yet — the exact bug this provider exists for.
    const fallback = window.setTimeout(start, PRE_HANDOFF_MS + 400);

    return () => {
      window.removeEventListener(PRELOADER_DONE_EVENT, start);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <OpeningContext.Provider value={ready}>{children}</OpeningContext.Provider>
  );
}
