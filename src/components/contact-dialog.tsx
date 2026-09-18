"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { ContactForm } from "@/components/contact-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
/**
 * One contact dialog for the whole site, opened from anywhere.
 *
 * The triggers live in unrelated trees — the hero, the section dock, the
 * footer — so the open state sits in context at the layout rather than in
 * each trigger. A `#contact` link also opens it, so the form stays reachable
 * from a plain URL (and from anything still linking to the old footer anchor).
 */

const ContactDialogContext = createContext<(() => void) | null>(null);

export function useContactDialog() {
  const open = useContext(ContactDialogContext);
  if (!open) throw new Error("useContactDialog must be used inside <ContactDialogProvider>");
  return open;
}

export function ContactDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash !== "#contact") return;
      setOpen(true);
      // Drop the hash so closing the dialog doesn't leave a dead anchor that
      // reopens it on refresh.
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  return (
    <ContactDialogContext.Provider value={show}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="label">Send a message</p>
            <DialogTitle>Tell me what you&rsquo;re working on.</DialogTitle>
            <DialogDescription>
              A role, a project, or just a question — it comes straight to my inbox.
            </DialogDescription>
          </DialogHeader>
          <ContactForm />
        </DialogContent>
      </Dialog>
    </ContactDialogContext.Provider>
  );
}

/** A button that opens the contact dialog. Styling is the caller's. */
export function ContactTrigger(props: Omit<React.ComponentProps<"button">, "onClick" | "type">) {
  const open = useContactDialog();
  return <button type="button" onClick={open} {...props} />;
}
