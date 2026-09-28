/**
 * The homepage's sections, in page order: one place for each `<SectionRow>`
 * heading, so a label reads the same everywhere it's used.
 */
export const SECTIONS = [
  { id: "projects", label: "Projects" },
  { id: "approach", label: "Approach" },
  { id: "experience", label: "Experience" },
  { id: "recognition", label: "Recognition" },
  { id: "capabilities", label: "Capabilities" },
  { id: "certifications", label: "Certifications" },
  { id: "education", label: "Education" },
  { id: "blog", label: "Blog" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Lookup so a `<SectionRow>` can take its label from the same list. */
export const section = (id: SectionId) => {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
};
