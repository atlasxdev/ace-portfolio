import { DATA } from "@/data/resume";

/**
 * schema.org ProfilePage (with its Person) for the homepage.
 *
 * This is what turns a name search from "a page that mentions Ace Guevarra"
 * into a result Google can label with a job title, an employer and the right
 * profile links. Blog posts already emit their own Article schema; the site's
 * root had none.
 *
 * `primaryImageOfPage` points Google's result thumbnail at the AG monogram.
 * Without it Google picked an on-page image of its own (the VizServe logo in
 * the work section). It's a large PNG because Google passes over small images
 * for thumbnails; robots.ts also keeps the company logos out of its reach.
 *
 * Everything below is drawn from DATA rather than restated, so it can't drift
 * from what the page actually says.
 */
export function PersonSchema() {
  const current = DATA.work[0];

  const person = {
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
    // Name only, no url: linking vizserve.com tied the page to VizServe's
    // entity, and Google borrowed its logo as the result thumbnail.
    worksFor: {
      "@type": "Organization",
      name: current.company,
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: DATA.url,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${DATA.url}/ag-logo-1200.png`,
      width: 1200,
      height: 1200,
    },
    mainEntity: person,
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
