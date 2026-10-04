import { petSounds } from "@/lib/pet-sounds";

/**
 * Whether Ag is out, and whether it's muted. Kept in localStorage so the pet
 * stays with a visitor across pages and reloads until they send it away.
 * Read through useSyncExternalStore; storage that throws (private mode,
 * blocked site data) falls back to memory for the session.
 */

const SHOWN = "ag-pet";
const MUTED = "ag-pet-muted";

const memory = new Map<string, boolean>();
const listeners = new Set<() => void>();

function read(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string, value: boolean) {
  memory.set(key, value);
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    // Memory still holds it for this session.
  }
  listeners.forEach((l) => l());
}

export function subscribePet(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const isPetShown = () => read(SHOWN);
export const isPetMuted = () => read(MUTED);
export const serverSnapshot = () => false;

export function setPetShown(shown: boolean) {
  if (shown === isPetShown()) return;
  if (!isPetMuted()) (shown ? petSounds.spawn : petSounds.despawn)();
  write(SHOWN, shown);
}

export const togglePet = () => setPetShown(!isPetShown());
export const setPetMuted = (muted: boolean) => write(MUTED, muted);
