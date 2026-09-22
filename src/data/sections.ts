/**
 * The homepage's sections, in page order: one place for each `<SectionRow>`
 * heading, so a label reads the same everywhere it's used.
 */
export const SECTIONS = [
  { id: "blog", label: "Blog" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "education", label: "Education" },
  { id: "capabilities", label: "Capabilities" },
  { id: "approach", label: "Approach" },
  { id: "recognition", label: "Recognition" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Lookup so a `<SectionRow>` can take its label from the same list. */
export const section = (id: SectionId) => {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
};
