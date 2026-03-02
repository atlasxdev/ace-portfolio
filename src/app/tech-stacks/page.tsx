import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export default function TechStacksPage() {
  return (
    <main className="flex flex-col min-h-dvh space-y-10 py-12 md:py-24 lg:py-32">
      <section id="header">
        <div className="space-y-4 text-center">
          <BlurFadeText
            delay={BLUR_FADE_DELAY}
            className="text-3xl font-bold tracking-tighter sm:text-5xl"
            text="Tech Stacks & Tools"
          />
          <BlurFadeText
            className="mx-auto max-w-150 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            delay={BLUR_FADE_DELAY}
            text="A comprehensive list of technologies, frameworks, and tools I use to build and automate things."
          />
        </div>
      </section>

      <section id="skills" className="space-y-12">
        {Object.entries(DATA.skills).map(([category, items], categoryIndex) => (
          <div key={category} className="space-y-4">
            <BlurFade delay={BLUR_FADE_DELAY * 2 + categoryIndex * 0.05}>
              <h2 className="text-xl font-bold border-b pb-2">{category}</h2>
            </BlurFade>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((skill, id) => (
                <BlurFade key={skill.name} delay={BLUR_FADE_DELAY * 3 + categoryIndex * 0.1 + id * 0.02}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors">
                    {skill.icon && <skill.icon className="size-6 rounded overflow-hidden object-contain flex-none" />}
                    <span className="text-sm font-medium">{skill.name}</span>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
