import { DATA } from "@/data/resume";

export type ChatProject = {
  title: string;
  /** Where the card goes: the project's first link, else its own href. */
  href: string | null;
  /** That link's label ("Case study", "Website"…), shown as the card's tag. */
  tag: string | null;
  /** The description's first sentence. */
  summary: string;
};

/**
 * The projects the assistant can attach to a reply as cards. The model picks
 * them by title (constrained to this list), and the client looks the rest up
 * here, so a card never carries a URL the model made up.
 */
export const CHAT_PROJECTS: ChatProject[] = DATA.projects.map((p) => {
  const link = p.links?.[0];
  return {
    title: p.title,
    href: link?.href || p.href || null,
    tag: link?.type ?? null,
    summary: p.description.split(/(?<=\.)\s/)[0],
  };
});

export const findChatProject = (title: string) => CHAT_PROJECTS.find((p) => p.title === title);
