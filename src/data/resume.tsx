import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Ace Guevarra",
  initials: "AG",
  url: "https://ace-guevarra.vercel.app",
  location: "Calamba City, Laguna",
  locationLink: "https://www.google.com/maps/place/Calamba,+Laguna",
  description:
    "System Engineer I at VizServe Private Limited. I build production systems end-to-end — full-stack, automation, and AI-augmented delivery.",
  summary:
    "I'm a **full-stack engineer** at VizServe Private Limited — hired as an Associate System Developer in 2025 and **promoted to System Engineer I** a year later. I take systems from stakeholder requirements through to production: architecture, build, test, deploy, maintain.\n\nThat's meant replacing a legacy admissions portal that now handles **1,539 applications**, automating a recruitment pipeline that **cut manual data entry 80%**, and consolidating a school's spreadsheet operations into a single platform.\n\nI work across the whole lifecycle rather than one layer: **REST APIs and Postgres** on one side, **React and Next.js** on the other, and n8n, CRM and ATS configuration where software meets business process. I use **Claude Code** throughout my development lifecycle, and built a **custom MCP server for Fathom AI** before an official one existed.",
  avatarUrl: "/me-light.jpg",
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "aceguevarra.dev@gmail.com",
    tel: "0907 925 1189",
    // Booking link — used by the hero CTA and the footer.
    calendly: "https://calendly.com/aceguevarra-dev/15min",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/atlasxdev",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/ace-guevarra",
        icon: Icons.linkedin,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:aceguevarra.dev@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "VizServe Private Limited",
      href: "https://vizserve.com",
      badges: [],
      location: "Remote/Hybrid",
      title: "System Engineer I",
      previousTitle: "Associate System Developer (Jan 2025 – Jan 2026)",
      logoUrl: "/orgs/vizserve.png",
      start: "January 2025",
      end: "Present",
      description:
        "- Replaced a legacy admissions portal with a self-service parent portal: 1,539 applications across 3 academic years, 888 parents served in AY2025, 11,368 documents digitized.\n- Configured Manatal ATS and built a WordPress careers portal wired to its REST API, cutting screening from 3 days to same-day for 200+ monthly applicants and manual data entry by 80%.\n- Automated background and reference checks in n8n for 100+ candidates weekly, lifting response rates 25%.\n- Consolidated spreadsheet-based school operations into one platform, collapsing a multi-day per-term report card process to minutes.\n- Configured a HitPay online store and inventory for the group's uniform and supplies shop across 7 product categories, and designed the storefront.",
    },
    {
      company: "Lamina Studios",
      href: "https://laminastudios.com/",
      badges: [],
      location: "Remote",
      title: "Frontend Developer Intern",
      logoUrl: "/orgs/lamina-studios.png",
      start: "January 2024",
      end: "May 2024",
      description:
        "Developed and implemented a user registration system for truck drivers/helpers using Laravel and BladewindUI. Built multi-step forms with draft functionality and validation to improve user experience.",
    },
  ],
  education: [
    {
      school: "Laguna University",
      href: "https://lu.edu.ph",
      degree: "Bachelor of Science in Information Technology",
      logoUrl: "/orgs/laguna-university.png",
      start: "2019",
      end: "2024",
    },
    {
      school: "Codebility",
      href: "https://www.codebility.tech/",
      // A training programme, not a job — the wording says so on purpose.
      degree: "Frontend Developer Training Program",
      logoUrl: "/certs/codebility.svg",
      start: "Jul 2024",
      end: "Dec 2024",
    },
  ],
  projects: [
    {
      title: "HAPI Online Store",
      href: "https://hapistore.hfse.edu.sg/",
      dates: "2026 — Present",
      active: true,
      description:
        "Configured a HitPay storefront and inventory for HFSE Global Education Group's uniform and supplies shop — seven product categories across official, PE, Youngstarters and casual uniforms, plus school supplies, books and merchandise, with cart, search and checkout. Also designed the store page itself.",
      technologies: ["HitPay", "E-commerce", "Inventory", "Payments"],
      image: "",
      links: [{ type: "Store", href: "https://hapistore.hfse.edu.sg/" }],
    },
    {
      title: "Online Admission System",
      href: "https://enrol.hfse.edu.sg/",
      dates: "2025 — Present",
      active: true,
      description:
        "Self-service enrollment portal replacing a legacy admissions system for HFSE International School. Auto-saved drafts and prior-year carry-over turn re-enrollment into a review-and-confirm step; uploads are validated and multi-page documents merged server-side. A Pending Actions dashboard shows parents and staff exactly what is outstanding, which removed the chase-up email entirely.",
      technologies: [
        "Next.js",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "TanStack Query",
        "React Hook Form",
        "Zod",
        "Tailwind CSS",
      ],
      image: "/online-admission-login.png",
      links: [
        { type: "Case study", href: "/blog/admissions-portal-rebuild" },
        { type: "Website", href: "https://enrol.hfse.edu.sg/" },
      ],
    },
    {
      title: "Student Information System",
      href: "",
      dates: "2026 — Present",
      active: true,
      description:
        "Consolidated a school's spreadsheet-based operations into one platform — admissions, student records, grades, attendance and parent access all working off a single student record. Teachers enter raw scores and the system computes grades and renders the printable report card, collapsing a multi-day per-term process to minutes.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Zod"],
      image: "",
      links: [],
    },
    {
      title: "HFSE Web Properties",
      href: "https://careers.hfse.edu.sg/",
      dates: "2025 — Present",
      active: true,
      description:
        "Redesigned the school's main website and built the GEG careers portal, whose Elementor application form posts candidates directly into Manatal over its REST API — removing the hand-keying step between applying and being screened. Maintain both sites: content, new pages and ongoing changes.",
      technologies: ["WordPress", "Elementor", "Manatal", "REST API"],
      image: "",
      links: [{ type: "Website", href: "https://careers.hfse.edu.sg/" }],
    },
    {
      title: "Fathom AI MCP Server",
      href: "/blog/fathom-mcp-server",
      dates: "2025",
      active: true,
      description:
        "A local Model Context Protocol server exposing Fathom AI meeting notes and action items to Claude Desktop and Claude Code — built before an official integration existed. Requirements captured in client calls flow straight into implementation and code review instead of being re-typed from notes.",
      technologies: ["MCP", "TypeScript", "Anthropic", "Fathom AI"],
      image: "",
      links: [{ type: "Write-up", href: "/blog/fathom-mcp-server" }],
    },
    {
      title: "Recruitment Process Automation",
      href: "/blog/recruitment-automation",
      dates: "2025 — 2026",
      active: true,
      description:
        "Manatal ATS configured around the real hiring process, plus n8n workflows that dispatch background and reference checks automatically. Screening dropped from three days to same-day for 200+ monthly applicants and manual data entry fell 80%.",
      technologies: ["n8n", "Manatal", "REST API", "Webhooks", "WordPress"],
      image: "/manatal-process-automation.png",
      links: [{ type: "Case study", href: "/blog/recruitment-automation" }],
    },
    {
      title: "Diabetes Meal Assistant",
      href: "https://diabetes-meal-assistant.vercel.app/",
      dates: "2025",
      active: true,
      description:
        "An LLM app that analyzes free-text meal descriptions and returns portion guidance and healthier swaps, with Supabase-backed caching to cut repeat model calls. Handles Filipino and international meals.",
      technologies: ["Next.js", "TypeScript", "Google Gemini", "Supabase", "Zod", "TanStack Query"],
      image: "/diabetes-meal-assistant.png",
      links: [
        { type: "Website", href: "https://diabetes-meal-assistant.vercel.app/" },
        { type: "Source", href: "https://github.com/atlasxdev/diabetes-meal-assistant" },
      ],
    },
    // {
    //   title: "Shop Quickie",
    //   href: "https://shop-quickie.vercel.app/",
    //   dates: "2024",
    //   active: true,
    //   description:
    //     "A fast, responsive e-commerce front end — category browsing, cart management, multi-step checkout with delivery and payment details, order tracking and profile management.",
    //   technologies: ["Next.js", "Zustand", "TanStack Query", "React Hook Form", "Zod", "shadcn/ui"],
    //   image: "/shop-quickie.png",
    //   links: [
    //     { type: "Website", href: "https://shop-quickie.vercel.app/" },
    //     { type: "Source", href: "https://github.com/atlasxdev/shop-quickie" },
    //   ],
    // },
  ],
  /**
   * Awards, kept separate from `certifications` on purpose. A certification
   * says a course was completed; an award says someone chose you over the
   * alternatives. Merged into one list the second claim reads as the first,
   * so they render as their own section.
   *
   * `citation` is the certificate's own wording, trimmed. Using the issuer's
   * sentence rather than a paraphrase means the PDF a reader opens says what
   * the page said.
   */
  awards: [
    {
      // The certificate reads "FOUNDERS' CHOICE AWARD" — plural possessive.
      // Kept exactly as printed so the page and the PDF agree.
      title: "Founders' Choice Award",
      issuer: "VizServe Private Limited",
      issuerUrl: "https://vizserve.com",
      date: "June 2026",
      logoUrl: "/orgs/vizserve.png",
      citation:
        "For exceptional dedication and delivery of high-impact solutions that embody the vision and values of our founders.",
      credentialUrl: "/certs/founders-choice-award.pdf",
    },
    {
      title: "The Code Builder Award",
      issuer: "VizServe Private Limited",
      issuerUrl: "https://vizserve.com",
      date: "June 2026",
      logoUrl: "/orgs/vizserve.png",
      citation:
        "For technical excellence and dedication to developing reliable, efficient, and high-quality systems that support the organization's success.",
      credentialUrl: "/certs/code-builder-award.pdf",
    },
  ],
  certifications: [
    {
      title: "Frontend Developer Training Program",
      issuer: "Codebility",
      issuerUrl: "https://www.codebility.tech/",
      date: "Jul – Dec 2024",
      // Local copies — the old LinkedIn URLs were signed links that expired in
      // March 2026. Both are white wordmarks, so they render on a dark chip.
      logoUrl: "/certs/codebility.svg",
      // The certificate itself, served locally. Replaces the old LinkedIn
      // media link, which was a signed URL that expired in March 2026.
      credentialUrl: "/certs/codebility-cert.jpg",
    },
    {
      title: "Responsive Web Design",
      issuer: "freeCodeCamp",
      issuerUrl: "https://www.freecodecamp.org/",
      date: "August 2024",
      logoUrl: "/certs/freecodecamp.svg",
      credentialUrl:
        "https://www.freecodecamp.org/certification/fcc605edcd8-ef96-4788-9703-10f2cef1b54c/responsive-web-design",
      credentialId: "fcc605edcd8-ef96-4788-9703-10f2cef1b54c-rwd",
    },
  ],
  journey: [
    {
      title: "Hello, World!",
      dates: "Early Beginnings",
      location: "Calamba City, Laguna",
      description:
        "Every developer has a beginning — mine was a simple `Hello, World!` printed on a screen. That one line of output was enough to ignite a passion for coding that I've carried ever since throughout my studies and career.",
      image: "",
      links: [],
    },
    {
      title: "Frontend Competition — 4th Place",
      dates: "2022",
      location: "Laguna University",
      description:
        "While studying at Laguna University, I joined a school frontend development competition and placed 4th. It was my first taste of competitive programming and pushed me to take web development more seriously, sharpening both my skills and my drive to improve.",
      image: "",
      links: [],
    },
    {
      title: "Capstone Project — IGotYou: Multimedia Booking System",
      dates: "2023 - 2024",
      location: "Laguna University",
      description:
        "For our capstone project, I took on the role of sole developer for our entire group — handling everything from system design to implementation. Building IGotYou end-to-end on my own was a defining milestone — it proved I could take a project from concept to completion independently.",
      image: "",
      links: [],
    },
    {
      title: "Graduation",
      dates: "July 2024",
      location: "Laguna University",
      description:
        "After five years at Laguna University (Aug 2019 – July 2024), I earned my Bachelor of Science in Information Technology. Graduating as the sole developer behind our capstone project was a proud moment that marked the end of one chapter and the start of the next.",
      image: "",
      links: [],
    },

    {
      title: "Frontend Developer Training — Codebility",
      dates: "July – December 2024",
      location: "Codebility",
      description:
        "Straight out of university I completed Codebility's Frontend Developer Training Program (29 July – 2 December 2024) — modern web frameworks, Next.js, version control with Git, and building responsive, accessible interfaces. I shipped two projects on the programme: a responsive Deadpool and Wolverine site and an e-commerce storefront. It was the bridge between graduating and being hired.",
      image: "",
      links: [{ type: "Certificate", href: "/certs/codebility-cert.jpg" }],
    },
    {
      title: "Hired at VizServe",
      dates: "January 2025",
      location: "VizServe Private Limited",
      description:
        "Shortly after graduating, I was hired at VizServe Private Limited as an Associate System Developer. Since then I've been building and revamping real-world systems — online admission platforms, recruitment automation, a student information system, and WordPress sites serving thousands of users monthly.",
      image: "",
      links: [],
    },
    {
      title: "Promoted to System Engineer I",
      dates: "January 2026",
      location: "VizServe Private Limited",
      description:
        "Twelve months after joining, I moved up from Associate System Developer to System Engineer I — by then owning the admissions portal, the recruitment automation and the student information system end-to-end.",
      image: "",
      links: [],
    },
  ],
};
