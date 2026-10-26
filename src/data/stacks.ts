/**
 * The tech shown on the homepage band and the /tech-stacks page.
 *
 * `logo` maps to a file stem in public/logos (see src/lib/logos.ts). Entries
 * with `logo: null` are concepts rather than products — they have no mark and
 * render as text only.
 */
export type Tech = { name: string; logo: string | null };

export const TECH_BAND: Tech[] = [
  { name: "TypeScript", logo: "typescript" },
  { name: "JavaScript", logo: "javascript" },
  { name: "React", logo: "react" },
  { name: "Next.js", logo: "nextjs" },
  { name: "Tailwind CSS", logo: "tailwindcss" },
  { name: "Supabase", logo: "supabase" },
  { name: "PostgreSQL", logo: "postgresql" },
  { name: "MySQL", logo: "mysql" },
  { name: "n8n", logo: "n8n" },
  { name: "Anthropic", logo: "anthropic" },
  { name: "MCP", logo: "mcp" },
  { name: "Vercel", logo: "vercel" },
  { name: "Azure", logo: "azure" },
  { name: "Git", logo: "git" },
  { name: "Vitest", logo: "vitest" },
  { name: "Cypress", logo: "cypress" },
  { name: "Postman", logo: "postman" },
  { name: "TanStack Query", logo: "tanstack-query" },
];

/**
 * The homepage shortlist as two folders, so it sits on one row: what the
 * product is built on, and what automates and checks it. Every TECH_BAND entry
 * appears exactly once, ordered so the first five (the ones fanned) are the
 * most telling.
 */
const band = (...names: string[]) => names.map((n) => {
  const t = TECH_BAND.find((x) => x.name === n);
  if (!t) throw new Error(`Not in TECH_BAND: ${n}`);
  return t;
});

export const TECH_FOLDERS: { group: string; items: Tech[] }[] = [
  {
    group: "Product engineering",
    items: band("React", "Next.js", "TypeScript", "Supabase", "PostgreSQL", "JavaScript", "Tailwind CSS", "TanStack Query", "MySQL", "Vercel", "Azure"),
  },
  {
    group: "AI, automation & testing",
    items: band("Anthropic", "MCP", "n8n", "Vitest", "Cypress", "Postman", "Git"),
  },
];

export const CAPABILITIES: string[][] = [
  [
    "Full-stack product development",
    "REST API design & integration",
    "Workflow & business process automation",
    "CRM and ATS configuration",
  ],
  [
    "E-commerce & inventory configuration",
    "MCP server development",
    "LLM application integration",
    "End-to-end delivery ownership",
    "Stakeholder requirements gathering",
  ],
];

export const STACK_GROUPS: { group: string; items: Tech[] }[] = [
  {
    group: "Languages",
    items: [
      { name: "TypeScript", logo: "typescript" },
      { name: "JavaScript", logo: "javascript" },
      { name: "SQL", logo: null },
      { name: "Shell", logo: null },
    ],
  },
  {
    group: "Frontend",
    items: [
      { name: "React", logo: "react" },
      { name: "Next.js", logo: "nextjs" },
      { name: "Vite", logo: "vite" },
      { name: "Tailwind CSS", logo: "tailwindcss" },
      { name: "shadcn/ui", logo: "shadcn-ui" },
      { name: "Zustand", logo: "zustand" },
      { name: "TanStack Query", logo: "tanstack-query" },
      { name: "React Hook Form", logo: "react-hook-form" },
      { name: "Zod", logo: "zod" },
      { name: "Framer Motion", logo: "framer-motion" },
    ],
  },
  {
    group: "Backend & Data",
    items: [
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "MySQL", logo: "mysql" },
      { name: "Supabase", logo: "supabase" },
      { name: "REST APIs", logo: null },
      { name: "Webhooks", logo: null },
      { name: "Authentication", logo: null },
    ],
  },
  {
    group: "AI Engineering",
    items: [
      { name: "Anthropic", logo: "anthropic" },
      { name: "Claude Code", logo: "anthropic" },
      { name: "MCP", logo: "mcp" },
      { name: "Google Gemini", logo: "gemini" },
    ],
  },
  {
    group: "Commerce & Payments",
    items: [
      { name: "HitPay", logo: "hitpay" },
      { name: "E-commerce configuration", logo: null },
      { name: "Inventory management", logo: null },
      { name: "Storefront design", logo: null },
    ],
  },
  {
    group: "Automation & Platforms",
    items: [
      { name: "n8n", logo: "n8n" },
      { name: "GoHighLevel", logo: "gohighlevel" },
      { name: "Manatal", logo: "manatal" },
      { name: "WordPress", logo: "wordpress" },
      { name: "Elementor", logo: "elementor" },
    ],
  },
  {
    group: "Cloud & DevOps",
    items: [
      { name: "Vercel", logo: "vercel" },
      { name: "Azure App Service", logo: "azure" },
      { name: "Git", logo: "git" },
      { name: "GitHub", logo: "github" },
      { name: "CI/CD", logo: null },
    ],
  },
  {
    group: "Testing",
    items: [
      { name: "Vitest", logo: "vitest" },
      { name: "Cypress", logo: "cypress" },
      { name: "Postman", logo: "postman" },
    ],
  },
  {
    group: "Integrations shipped to production",
    items: [
      { name: "Cloudinary", logo: "cloudinary" },
      { name: "Resend", logo: "resend" },
      { name: "Calendly", logo: "calendly" },
      { name: "Microsoft Outlook", logo: "outlook" },
      { name: "Discord", logo: "discord" },
      { name: "ClickUp", logo: "clickup" },
      { name: "Fathom AI", logo: "fathom" },
    ],
  },
];
