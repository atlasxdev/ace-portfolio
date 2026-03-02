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
  skills: {
    Frontend: [
      { name: "React", icon: ReactLight },
      { name: "Next.js", icon: NextjsIconDark },
      { name: "Typescript", icon: Typescript },
      { name: "TailwindCSS", icon: Icons.tailwindcss },
      { name: "Framer Motion", icon: Icons.framermotion },
      { name: "Zustand", icon: Icons.zustand },
      { name: "TanStack Query", icon: Icons.tanstackquery },
      { name: "Vite", icon: Icons.vite },
    ],
    Backend: [
      { name: "Postgres", icon: Postgresql },
      { name: "Supabase", icon: Icons.supabase },
      { name: "MySQL", icon: Icons.mysql },
      { name: "Express.js", icon: Icons.express },
      { name: "MongoDB", icon: Icons.mongodb },
      { name: "JWT", icon: Icons.jwt },
      { name: "REST API", icon: Icons.globe },
    ],
    CMS: [
      { name: "WordPress", icon: Icons.wordpress },
      { name: "Directus", icon: Icons.directus },
    ],
    "Developer Tools": [
      { name: "n8n", icon: Icons.n8n },
      { name: "Git", icon: Icons.git },
      { name: "GitHub", icon: Icons.github },
      { name: "Zod", icon: Icons.zod },
      { name: "Postman", icon: Icons.postman },
      { name: "VS Code", icon: Icons.vscode },
      { name: "Prettier", icon: Icons.prettier },
      { name: "ESLint", icon: Icons.eslint },
    ],
    Collaboration: [
      { name: "ClickUp", icon: Icons.clickup },
      { name: "Slack", icon: Icons.slack },
      { name: "Teams", icon: Icons.teams },
      { name: "Discord", icon: Icons.discord },
    ],
  },
  majorSkills: [
    { name: "Next.js", icon: NextjsIconDark },
    { name: "React", icon: ReactLight },
    { name: "Typescript", icon: Typescript },
    { name: "Postgres", icon: Postgresql },
    { name: "Supabase", icon: Icons.supabase },
    { name: "n8n", icon: Icons.n8n },
    { name: "Directus", icon: Icons.directus },
    { name: "WordPress", icon: Icons.wordpress },
    { name: "TailwindCSS", icon: Icons.tailwindcss },
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
    {
      title: "Shop Quickie",
      href: "https://shop-quickie.vercel.app/",
      dates: "December 2024",
      active: true,
      description:
        "A high-performance, modern e-commerce web application engineered for speed and reliability. Features a fully responsive interface with optimized page loads, product browsing by category, cart management, multi-step checkout with delivery address and payment details, order tracking, and user profile management. Built with a focus on efficiency and a streamlined shopping experience for contemporary online retail needs.",
      technologies: [
        "Next.js",
        "ShadCN UI",
        "Zustand",
        "TanStack Query",
        "React Hook Form",
        "Zod",
        "Axios",
        "Orama Search",
      ],
      links: [
        {
          type: "Website",
          href: "https://shop-quickie.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/atlasxdev/shop-quickie",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/shop-quickie.png",
      video: "",
    },
  ],
  certifications: [
    {
      title: "Certificate of Completion - Frontend Developer",
      issuer: "Codebility",
      issuerUrl: "https://www.codebility.tech/",
      date: "December 2024",
      logoUrl:
        "https://media.licdn.com/dms/image/v2/D560BAQH099gqRo76cw/company-logo_200_200/company-logo_200_200/0/1714364703710?e=1773878400&v=beta&t=W1zNdfCrO-Ha6pvgVJ55i6RwYZNxxwUxpj4sOT5PFpY",
      credentialUrl:
        "https://media.licdn.com/dms/image/sync/v2/D5627AQH2hebLTOWyzQ/articleshare-shrink_800/articleshare-shrink_800/0/1733743380409?e=1773021600&v=beta&t=lBcR_1dTwsV1TiEU7s28YjCjz-eKXwnfVADr7DrGEn0",
    },
    {
      title: "Responsive Web Design",
      issuer: "freeCodeCamp",
      issuerUrl: "https://www.freecodecamp.org/",
      date: "August 2024",
      logoUrl:
        "https://media.licdn.com/dms/image/v2/C4E0BAQGLKj3JHcof0w/company-logo_200_200/company-logo_200_200/0/1630639684997/free_code_camp_logo?e=1773878400&v=beta&t=9ATnoJap4A07Po06UcpkgpRqYRUcpbuGVoL-uTs-f_c",
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
      title: "Hired at VizServe",
      dates: "January 2025",
      location: "VizServe Private Limited",
      description:
        "Shortly after graduating, I was hired at VizServe Private Limited as an Associate System Developer. Since then, I've been building and revamping real-world systems — from online admission platforms and recruitment automation to WordPress sites serving thousands of users monthly.",
      image: "",
      links: [],
    },
  ],
};
