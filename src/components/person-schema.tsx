import { DATA } from "@/data/resume";

/**
 * schema.org Person for the homepage.
 *
 * This is what turns a name search from "a page that mentions Ace Guevarra"
 * into a result Google can label with a job title, an employer and the right
 * profile links. Blog posts already emit their own Article schema; the site's
 * root had none.
 *
 * Everything below is drawn from DATA rather than restated, so it can't drift
 * from what the page actually says.
 */
export function PersonSchema() {
  const current = DATA.work[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: DATA.name,
    url: DATA.url,
    email: `mailto:${DATA.contact.email}`,
    image: `${DATA.url}${DATA.avatarUrl}`,
    jobTitle: current.title,
    description: DATA.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: DATA.location,
    },
    worksFor: {
      "@type": "Organization",
      name: current.company,
      url: current.href,
    },
    alumniOf: DATA.education.map((school) => ({
      "@type": "CollegeOrUniversity",
      name: school.school,
      url: school.href,
    })),
    // `sameAs` is the signal that ties these profiles to the same person.
    sameAs: Object.values(DATA.contact.social)
      .map((s) => s.url)
      .filter((url) => !url.startsWith("mailto:")),
    knowsAbout: [
      "Full-stack development",
      "TypeScript",
      "React",
      "Next.js",
      "PostgreSQL",
      "REST API design",
      "Workflow automation",
      "Model Context Protocol",
      "AI-augmented development",
    ],
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
