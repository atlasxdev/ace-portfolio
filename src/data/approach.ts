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
 */
export const APPROACH = [
  {
    title: "Requirements from the call",
    body: "Projects start with a stakeholder conversation, recorded in Fathom. A custom MCP server exposes those notes and action items straight to the tools I build with, so decisions move from the call into the work without being re-typed or half-remembered.",
  },
  {
    title: "Context before code",
    body: "Project rules, reusable skills, custom commands and architecture notes live in the repo. Setting them up once is what keeps output on the codebase's conventions — drift from those conventions is where AI-assisted work quietly costs you the time it saved.",
  },
  {
    title: "Architecture before implementation",
    body: "The stack and the phases get settled before anything is built. Not because the plan survives contact, but because forcing the sequence out loud surfaces the dependency you'd otherwise hit halfway through.",
  },
  {
    title: "Tests, pipelines, deploys",
    body: "Test setup, CI, deployment and monitoring are the first things cut when a deadline arrives, and they're well-understood enough that the cost is effort rather than judgement. Lowering that cost is what makes them actually get done.",
  },
  {
    title: "Review everything that lands",
    body: "AI gets to a reviewable draft faster; it doesn't decide what to build. Every consequential call on these projects — re-enrolment as its own flow, the Pending Actions dashboard, mapping the hiring pipeline before automating it — came from real data and the people affected.",
  },
] as const;
