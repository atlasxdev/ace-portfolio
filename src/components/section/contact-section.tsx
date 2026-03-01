import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { Calendar, Mail } from "lucide-react";
import Link from "next/link";

export default function ContactSection() {
  return (
    <div className="border rounded-xl p-10 relative">
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">Open to Work</span>
      </div>
      <div className="absolute inset-0 top-0 left-0 right-0 h-1/2 rounded-xl overflow-hidden">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Hire Me</h2>
        <p className="mx-auto max-w-lg text-muted-foreground text-balance">
          I am currently looking for new opportunities and would love to hear about your project or team. If you&apos;re
          looking for a developer who specializes in building robust systems and automating workflows, let&apos;s build
          something great together.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            variant="default"
            size="lg"
            className="rounded-full px-8 shadow-xl hover:scale-105 transition-transform duration-200">
            <Link href={DATA.contact.social.email.url}>
              <Mail className="mr-2 h-4 w-4" />
              Email Me
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 shadow-xl hover:scale-105 transition-transform duration-200">
            <Link target="_blank" href="https://calendly.com/aceguevarra-dev/30min">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule a Call
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
