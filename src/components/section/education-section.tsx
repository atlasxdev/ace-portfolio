import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";
import { ItemList, ItemRow } from "@/components/section/section-row";
import { OrgLogo } from "@/components/org-logo";

export function EducationSection() {
  return (
    <Reveal>
      <ItemList>
        {DATA.education.map((school) => (
          <ItemRow
            key={school.school}
            title={school.school}
            meta={`${school.start} — ${school.end}`}
            href={school.href}
            external
            logo={<OrgLogo src={school.logoUrl} alt={school.school} />}
          >
            {school.degree}
          </ItemRow>
        ))}
      </ItemList>
    </Reveal>
  );
}

export default EducationSection;
