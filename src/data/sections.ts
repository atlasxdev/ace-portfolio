/**
 * The homepage's sections, in page order.
 *
 * One list feeds two things: the `<SectionRow>` headings themselves and the
 * jump nav. The nav used to scrape the DOM for `section[id]` and read each
 * label out of its `<h2>`, which meant a renamed heading silently desynced the
 * nav, and reading the page during an effect to set state is exactly the
 * cascading-render pattern React's lint rules exist to catch.
 *
 * Reorder here and both the page and its nav move together.
 */
export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "capabilities", label: "Capabilities" },
  { id: "approach", label: "Approach" },
  { id: "projects", label: "Selected Work" },
  { id: "writing", label: "Writing" },
  { id: "journey", label: "Journey" },
  { id: "certifications", label: "Certifications" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Lookup so a `<SectionRow>` can take its label from the same list. */
export const section = (id: SectionId) => {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
};
