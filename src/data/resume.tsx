import { Icons } from "@/components/icons";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Typescript } from "@/components/ui/svgs/typescript";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Ace Guevarra",
  initials: "AG",
  url: "https://aceguevarra.dev",
  location: "Calamba City, Laguna",
  locationLink: "https://www.google.com/maps/place/Calamba,+Laguna",
  description:
    "Associate System Developer at VizServe Private Limited. I love building things and automating workflows.",
  summary:
    "Bachelor of Science in Information Technology graduate from Laguna University (2024). Currently an Associate System Developer at VizServe Private Limited, focusing on revamping admission systems and recruitment process automation. Experienced in full-stack development with React, Next.js, and Supabase, and workflow automation using n8n.",
  avatarUrl: "/me-light.jpg",
  skills: [
    { name: "React", icon: ReactLight },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "Typescript", icon: Typescript },
    { name: "Postgres", icon: Postgresql },
    { name: "Supabase", icon: Icons.supabase },
    { name: "MySQL", icon: Icons.mysql },
    { name: "WordPress", icon: Icons.wordpress },
    { name: "TailwindCSS", icon: Icons.tailwindcss },
    { name: "Framer Motion", icon: Icons.framermotion },
    { name: "Zustand", icon: Icons.zustand },
    { name: "TanStack Query", icon: Icons.tanstackquery },
    { name: "Zod", icon: Icons.zod },
    { name: "n8n", icon: Icons.n8n },
    { name: "Git", icon: Icons.github },
    { name: "Directus", icon: Icons.directus },
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "aceguevarra.dev@gmail.com",
    tel: "0907 925 1189",
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
      title: "Associate System Developer",
      logoUrl: "https://vizserve.com/wp-content/uploads/2025/09/cropped-vizserve-logo.png",
      start: "January 2025",
      end: "Present",
      description:
        "- Revamped online admission system with Supabase authentication, reducing unauthorized access risks by 100%.\n- Implemented enrollment data carry-over, cutting repeated data entry by 60%.\n- Developed document upload feature with Zod validation, handling 1,000+ submissions monthly.\n- Configured Manatal ATS workflows, accelerating candidate screening from 3 days to same-day.\n- Automated background checks via n8n workflows for 100+ candidates weekly.",
    },
    {
      company: "Lamina Studios",
      href: "https://laminastudios.com/",
      badges: [],
      location: "Remote",
      title: "Frontend Developer Intern",
      logoUrl:
        "https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/366680620_675706191268363_2149820249301358376_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeHg_Mg8KbBmuBx_w8FRftwiXZonxg9bosldmifGD1uiyS0nH6OU-VYpiXSIcK6YA45-UdHb7CRP5FIEyUDWey_U&_nc_ohc=yMVErE29MnMQ7kNvwFclNEC&_nc_oc=AdlsoS-T_GiCicDZ0Yd_IqkqfLtTYsIfFey-p9qePNKshjtJjj985jbO8-zCvknWVDk&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&_nc_gid=pYLecPPQIWfQBiBj1yJxQA&_nc_ss=8&oh=00_Afsq7z2-uMNSoOf66AevvU-AP65ErYpGzojnOVafPboQHQ&oe=69A9F0C1",
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
      logoUrl: "https://www.admin.lu.edu.ph/img/lu-logo.png",
      start: "2019",
      end: "2024",
    },
  ],
  projects: [
    {
      title: "Online Admission System Revamp",
      href: "https://enrol.hfse.edu.sg/",
      dates: "June 2025 - Present",
      active: true,
      description:
        "Architected a secure online admission system using Supabase Auth, eliminating unauthorized access risks. Developed enrollment data carry-over logic to cut repeated entry by 60% and implemented secure document uploads with Zod validation. Integrated Directus CMS for administrative tracking and utilized Directus Flows alongside Supabase Edge Functions to automate notifications for admission officers. Built a high-performance dashboard using React, ShadCN UI, and TanStack Query for optimal parent and admin UX.",
      technologies: [
        "React",
        "Next.js",
        "Supabase",
        "Supabase Edge Functions",
        "Directus",
        "Directus Flows",
        "TanStack Query",
        "Zod",
      ],
      links: [
        {
          type: "Website",
          href: "https://enrol.hfse.edu.sg/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/online-admission-login.png",
      video: "",
    },

    {
      title: "Recruitment Process Automation",
      href: "",
      dates: "September 2025 - Present",
      active: true,
      description:
        "Optimized recruitment workflows by tailoring Manatal ATS, reducing candidate screening time from 3 days to same-day for over 200 monthly applicants. Developed custom WordPress forms with direct API integration to Manatal, automating data entry and achieving an 80% reduction in manual processing. Leveraged n8n to architect automated background and reference check sequences for 100+ weekly candidates, successfully increasing candidate response rates by 25% while streamlining HR operations.",
      technologies: ["n8n", "WordPress", "Manatal ATS", "Elementor", "API Integration", "PHP", "MySQL", "JavaScript"],
      links: [],
      image: "/manatal process automation.png",
      video: "",
    },
    {
      title: "Diabetes Meal Assistant",
      href: "https://diabetes-meal-assistant.vercel.app/",
      dates: "2025",
      active: true,
      description:
        "An AI-powered web app that helps individuals managing Type 1, Type 2, and Gestational Diabetes make safer, balanced, and practical food choices. Uses Google Gemini AI to analyze meal descriptions and generate personalized feedback, portion guidance, and healthier food swap suggestions. Features feedback caching via Supabase to reduce repeated AI calls, a chat-like conversational interface, and cultural awareness for Filipino and international meals.",
      technologies: [
        "Next.js",
        "Typescript",
        "Supabase",
        "Google Gemini AI",
        "Zod",
        "ShadCN UI",
        "TailwindCSS",
        "TanStack Query",
      ],
      links: [
        {
          type: "Website",
          href: "https://diabetes-meal-assistant.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/atlasxdev/diabetes-meal-assistant",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/diabetes-meal-assistant.png",
      video: "",
    },
  ],
} as const;
