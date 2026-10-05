import { petSounds } from "@/lib/pet-sounds";

/**
 * Whether Ag is out, and whether it's muted. Ag is out by default; sending it
 * away is kept in localStorage so it stays gone across pages and reloads
 * until it's summoned again.
 * Read through useSyncExternalStore; storage that throws (private mode,
 * blocked site data) falls back to memory for the session.
 */

const SHOWN = "ag-pet";
const MUTED = "ag-pet-muted";

const memory = new Map<string, boolean>();
const listeners = new Set<() => void>();

function read(key: string, fallback = false) {
  if (memory.has(key)) return memory.get(key)!;
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

function write(key: string, value: boolean) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Memory still holds it for this session.
  }
  listeners.forEach((l) => l());
}

export function subscribePet(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const isPetShown = () => read(SHOWN, true);
export const isPetMuted = () => read(MUTED);
export const serverSnapshot = () => false;

export function setPetShown(shown: boolean) {
  if (shown === isPetShown()) return;
  if (!isPetMuted()) (shown ? petSounds.spawn : petSounds.despawn)();
  write(SHOWN, shown);
}

export const togglePet = () => setPetShown(!isPetShown());
export const setPetMuted = (muted: boolean) => write(MUTED, muted);

/** Fired by the contact form when a message goes through, so Ag can cheer. */
export const CONTACT_SENT_EVENT = "ag:contact-sent";

/**
 * For a dialog's onPointerDownOutside / onInteractOutside: clicking Ag while
 * a dialog is open shouldn't dismiss the dialog (and lose what was typed).
 */
export function keepOpenForPet(e: {
  target: EventTarget | null;
  detail?: { originalEvent?: Event };
  preventDefault(): void;
}) {
  const target = (e.detail?.originalEvent?.target ??
    e.target) as Element | null;
  if (target?.closest?.("[data-ag-pet]")) e.preventDefault();
}
