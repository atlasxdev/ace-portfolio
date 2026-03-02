import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export default function JourneySection() {
  return (
    <section id="journey">
      <div className="flex min-h-0 flex-col gap-y-6">
        <h2 className="text-xl font-bold">My Journey</h2>
        <div className="relative w-full px-2">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          <div className="flex flex-col gap-10 relative">
            {DATA.journey.map((item, id) => (
              <BlurFade key={item.title} delay={BLUR_FADE_DELAY * 15 + id * 0.05}>
                <div className="flex items-start gap-6">
                  <div className="relative z-10 flex-none size-3 rounded-full bg-primary ring-4 ring-background mt-1.5 -ml-1.25" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider italic">
                        {item.dates}
                      </span>
                      <h3 className="text-base font-bold leading-tight">{item.title}</h3>
                      <span className="text-xs text-muted-foreground font-medium italic">{item.location}</span>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
