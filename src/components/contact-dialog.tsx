"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

import { ContactForm } from "@/components/contact-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { keepOpenForPet } from "@/lib/pet-store";
/**
 * One contact dialog for the whole site, opened from anywhere.
 *
 * It's opened from the sidebar, which on phones is a sheet that closes as
 * the row is tapped, so the open state sits in context at the layout rather
 * than in the trigger. A `#contact` link also opens it, so the form stays
 * reachable from a plain URL.
 *
 * Phones and tablets get it as a drawer from the bottom of the screen, which
 * leaves the page visible above it and can be swiped away; desktops keep the
 * centred dialog.
 */

const DESKTOP = "(min-width: 810px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const isDesktop = () => window.matchMedia(DESKTOP).matches;

const TITLE = "Tell me what you’re working on.";
const DESCRIPTION = "A role, a project, or just a question — it comes straight to my inbox.";

const ContactDialogContext = createContext<(() => void) | null>(null);

export function useContactDialog() {
  const open = useContext(ContactDialogContext);
  if (!open) throw new Error("useContactDialog must be used inside <ContactDialogProvider>");
  return open;
}

export function ContactDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const desktop = useSyncExternalStore(subscribeDesktop, isDesktop, () => true);

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
      {desktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onPointerDownOutside={keepOpenForPet} onInteractOutside={keepOpenForPet}>
            <DialogHeader>
              <p className="label">Send a message</p>
              <DialogTitle>{TITLE}</DialogTitle>
              <DialogDescription>{DESCRIPTION}</DialogDescription>
            </DialogHeader>
            <ContactForm />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent onPointerDownOutside={keepOpenForPet} onInteractOutside={keepOpenForPet}>
            <div className="overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <DrawerHeader>
                <p className="label">Send a message</p>
                <DrawerTitle>{TITLE}</DrawerTitle>
                <DrawerDescription>{DESCRIPTION}</DrawerDescription>
              </DrawerHeader>
              <div className="px-group">
                <ContactForm />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </ContactDialogContext.Provider>
  );
}
