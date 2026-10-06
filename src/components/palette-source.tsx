import { ArrowUpRight } from "lucide-react";

/** "/source" in the chat palette: what the site is built with. */

const STACK: [string, string][] = [
  ["Framework", "Next.js 16 and React 19, statically rendered where it can be"],
  ["Styling", "Tailwind CSS v4 on a small set of design tokens"],
  ["Motion", "Motion for the chat panel, Ag and this palette"],
  ["Writing", "The blog is MDX, compiled with Content Collections"],
  ["This assistant", "Gemini 2.5 Flash, its structured reply streamed to the page as it's written"],
  ["Contact form", "Resend"],
  ["Hosting", "Vercel, with Analytics and Speed Insights"],
];

export function PaletteSource() {
  return (
    <div className="flex flex-col px-4 py-5 lg:px-6">
      <h2 className="mb-2 text-[17px] leading-6 font-semibold tracking-[-0.01em]">How this site is built</h2>
      <dl>
        {STACK.map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col gap-0.5 border-t border-rule py-2.5 first:border-t-0 sm:flex-row sm:gap-4">
            <dt className="shrink-0 text-body-sm text-ink-faint sm:w-36">{k}</dt>
            <dd className="text-body text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <a
        href="https://github.com/atlasxdev/ace-portfolio"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground underline underline-offset-3 hover:text-foreground">
        View the source on GitHub
        <ArrowUpRight className="size-3.5" aria-hidden />
      </a>
    </div>
  );
}
