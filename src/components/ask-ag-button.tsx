"use client";

import { AgFace } from "@/components/ag-face";
import { OPEN_CHAT_EVENT } from "@/lib/chat-events";

/** Opens the chat on a blog post, where it starts on questions about that post. */
export function AskAgButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
      className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-foreground/12 pr-4 pl-2.5 text-body-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
      <AgFace />
      Ask Ag about this
    </button>
  );
}
