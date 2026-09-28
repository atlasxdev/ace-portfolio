/**
 * How Ace builds software.
 *
 * Every line here traces to something already stated elsewhere rather than to
 * invented philosophy: the SDLC brief behind resume/ANALYSIS.md, and the
 * write-up at content/sdlc-in-claude-code.mdx. Nothing claims a practice that
 * isn't already claimed on the resume or in the post.
 *
 * These are ordered stages of a real lifecycle, which is the only reason they
 * carry numbers — the sequence is information, not decoration. `stage` is the
 * one-word phase name shown beside the number.
 *
 * Bodies stay one sentence: each sits in a collapsible row beside the cycle
 * diagram, and the paragraph version of each is in the linked post.
 */
export const APPROACH = [
  {
    stage: "Discover",
    title: "Requirements from the call",
    body: "Stakeholder calls are recorded in Fathom and surfaced by a custom MCP server, so decisions reach the work without being re-typed.",
  },
  {
    stage: "Prepare",
    title: "Context before code",
    body: "Project rules, reusable skills, custom commands and architecture notes live in the repo, so output stays on the codebase's conventions.",
  },
  {
    stage: "Design",
    title: "Architecture before implementation",
    body: "Stack and phases are settled up front — saying the sequence out loud surfaces the dependency you'd otherwise hit halfway through.",
  },
  {
    stage: "Build",
    title: "Tests, pipelines, deploys",
    body: "The laborious, well-understood parts are the first cut under a deadline. Lowering their cost is what gets them done at all.",
  },
  {
    stage: "Review",
    title: "Review everything that lands",
    body: "AI gets to a reviewable draft faster; it doesn't decide what to build. Real data and the people affected do.",
  },
] as const;
