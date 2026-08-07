/**
 * How Ace builds software.
 *
 * Every line here traces to something already stated elsewhere rather than to
 * invented philosophy: the SDLC brief behind resume/ANALYSIS.md, and the
 * write-up at content/sdlc-in-claude-code.mdx. Nothing claims a practice that
 * isn't already claimed on the resume or in the post.
 *
 * These are ordered stages of a real lifecycle, which is the only reason they
 * carry numbers — the sequence is information, not decoration.
 *
 * Bodies are deliberately one sentence. The section renders them as a weaving
 * step flow with the cards alternating above and below the path, and blocks
 * that alternate can only be wider than their own column if they're short
 * enough not to collide with the one two slots along. The full paragraph
 * version of each is in the linked post.
 */
export const APPROACH = [
  {
    title: "Requirements from the call",
    body: "Stakeholder calls are recorded in Fathom and surfaced by a custom MCP server, so decisions reach the work without being re-typed.",
  },
  {
    title: "Context before code",
    body: "Project rules, reusable skills, custom commands and architecture notes live in the repo, so output stays on the codebase's conventions.",
  },
  {
    title: "Architecture before implementation",
    body: "Stack and phases are settled up front — saying the sequence out loud surfaces the dependency you'd otherwise hit halfway through.",
  },
  {
    title: "Tests, pipelines, deploys",
    body: "The laborious, well-understood parts are the first cut under a deadline. Lowering their cost is what gets them done at all.",
  },
  {
    title: "Review everything that lands",
    body: "AI gets to a reviewable draft faster; it doesn't decide what to build. Real data and the people affected do.",
  },
] as const;
