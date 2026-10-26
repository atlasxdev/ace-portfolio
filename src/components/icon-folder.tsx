"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";

import { BrandLogo } from "@/components/brand-logo";
import type { Tech } from "@/data/stacks";
import { LOGOS } from "@/lib/logos";
import { cn } from "@/lib/utils";

/**
 * A glass folder with a stack group's logos fanned out of it. Hover, tap or
 * Enter spreads the fan; hovering a logo lifts it and names it. The folder's
 * tabbed outline is drawn to the card's real size, so it holds at any width.
 *
 * The front of the folder lists every tool in the group by name, so concepts
 * without a mark (SQL, Webhooks) are still there, and the fan is only a
 * picture of the group rather than the list itself. At most five logos fan
 * out; more than that and they stop reading as a hand of cards.
 *
 * Colours are the site's theme tokens, so light and dark come for free, and
 * the motion uses the site's spring curves (--ease-spring, --ease-snappy).
 */

const MAX_FAN = 5;
const TILE = 84;
const SPREAD = 62;
/** Space above the front pocket where the fan stands. */
const FAN_ROOM = 104;

/* Folder outlines: the front pocket has its tab on the left, the back plate on the right. */
const pathL = (w: number, h: number, r: number, d: number, tw: number, s: number) =>
  `M0 ${r}A${r} ${r} 0 0 1 ${r} 0L${tw} 0C${tw + s * 0.55} 0 ${tw + s * 0.45} ${d} ${tw + s} ${d}L${w - r} ${d}A${r} ${r} 0 0 1 ${w} ${d + r}L${w} ${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}L${r} ${h}A${r} ${r} 0 0 1 0 ${h - r}Z`;
const pathR = (w: number, h: number, r: number, d: number, tw: number, s: number) => {
  const x = w - tw;
  return `M0 ${d + r}A${r} ${r} 0 0 1 ${r} ${d}L${x - s} ${d}C${x - s * 0.45} ${d} ${x - s * 0.55} 0 ${x} 0L${w - r} 0A${r} ${r} 0 0 1 ${w} ${r}L${w} ${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}L${r} ${h}A${r} ${r} 0 0 1 0 ${h - r}Z`;
};

function useShape(ref: RefObject<HTMLDivElement | null>, make: (w: number, h: number) => string) {
  const [d, setD] = useState("");
  const makeRef = useRef(make);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setD(makeRef.current(el.offsetWidth, el.offsetHeight)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return d;
}

export function IconFolder({ title, items }: { title: string; items: Tech[] }) {
  // One tile per mark: Anthropic and Claude Code share a logo.
  const icons = items
    .filter((t): t is Tech & { logo: string } => !!t.logo)
    .filter((t, i, all) => all.findIndex((o) => o.logo === t.logo) === i)
    .slice(0, MAX_FAN);

  const gid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [hi, setHi] = useState<number | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frontD = useShape(frontRef, (w, h) => {
    setWidth(w);
    return pathL(w, h, 20, 22, Math.round(w * 0.42), 42);
  });
  const backD = useShape(backRef, (w, h) => pathR(w, h, 20, 22, Math.round(w * 0.4), 42));

  const n = icons.length;
  // Narrow cards (phones) tighten the fan so the spread stays inside the folder.
  const spread = n > 1 && width ? Math.min(SPREAD, (width - TILE - 16) / ((n - 1) * 1.15)) : SPREAD;
  const tilt = n > 1 ? 22 / (n - 1) : 0; // degrees per step out from the middle
  const wide = open || hover;
  const toggle = () => setOpen((o) => !o);

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${title}: ${items.map((t) => t.name).join(", ")}`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setHi(null);
      }}
      data-shown={shown || undefined}
      data-wide={wide || undefined}
      className="folder group/folder relative isolate flex w-full cursor-pointer flex-col outline-none select-none [-webkit-tap-highlight-color:transparent] focus-visible:rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40"
      style={{ paddingTop: FAN_ROOM }}>
      {/* Back plate */}
      <div
        ref={backRef}
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_5%,transparent),color-mix(in_srgb,var(--foreground)_1.5%,transparent)_60%)]"
        style={{ clipPath: backD ? `path('${backD}')` : undefined }}>
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <path d={backD} fill="none" className="stroke-foreground/9" strokeWidth="2" />
        </svg>
      </div>

      {/* The fan */}
      <div className="pointer-events-none absolute inset-x-0 top-0" aria-hidden style={{ height: FAN_ROOM + TILE }}>
        {icons.map((tech, i) => {
          const k = i - (n - 1) / 2;
          const gap = wide ? spread * 1.15 : spread;
          const y = k * k * 7 - (wide ? 6 : 0);
          const rot = k * tilt * (wide ? 1.2 : 1);
          const art = LOGOS[tech.logo];
          return (
            <div
              key={tech.logo}
              className="folder-tile absolute left-1/2 [backface-visibility:hidden]"
              style={{
                top: 26,
                width: TILE,
                height: TILE,
                marginLeft: -TILE / 2,
                zIndex: hi === i ? 5 : undefined,
                opacity: shown ? 1 : 0,
                transform: shown
                  ? `translate3d(${k * gap}px, ${y}px, 0) rotate(${rot}deg)`
                  : `translate3d(${k * spread * 0.5}px, 64px, 0)`,
                transitionDelay: wide ? `${i * 0.03}s` : shown ? `${0.15 + i * 0.05}s` : "0s",
              }}>
              <div
                className="folder-lift pointer-events-auto relative size-full"
                onPointerEnter={(e) => e.pointerType === "mouse" && setHi(i)}
                onPointerLeave={() => setHi((h) => (h === i ? null : h))}
                style={{
                  transform:
                    hi === i ? `translateY(-20px) rotate(${-rot}deg) scale(1.08)` : hi !== null ? "scale(.96)" : "none",
                  opacity: hi !== null && hi !== i ? 0.7 : 1,
                }}>
                <div className="grid size-full place-items-center rounded-[22px] border border-foreground/10 bg-card shadow-[inset_0_1px_0_var(--glass-hi),0_14px_30px_-12px_rgb(0_0_0/0.45)]">
                  <BrandLogo
                    name={tech.logo}
                    className={art?.wide ? "h-auto w-[46px] max-w-none [&>svg]:h-auto [&>svg]:w-full" : "size-9 text-[13px]"}
                  />
                </div>
                <span
                  className={cn(
                    "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-foreground/10 bg-card/90 px-2.5 py-1 text-[11px] leading-4 font-medium whitespace-nowrap text-foreground backdrop-blur-md transition-[opacity,translate] duration-300 ease-(--ease-snappy)",
                    hi === i ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
                  )}>
                  {tech.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glass front pocket */}
      <div
        ref={frontRef}
        className="folder-front relative min-h-[132px] overflow-hidden bg-[linear-gradient(160deg,color-mix(in_srgb,var(--foreground)_7%,transparent),transparent_55%),var(--glass-bg)] px-5 pt-9 pb-5 backdrop-blur-[18px] backdrop-saturate-150"
        style={{ clipPath: frontD ? `path('${frontD}')` : undefined }}>
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`edge-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--foreground)" stopOpacity=".32" />
              <stop offset=".35" stopColor="var(--foreground)" stopOpacity=".1" />
              <stop offset="1" stopColor="var(--foreground)" stopOpacity=".04" />
            </linearGradient>
          </defs>
          <path d={frontD} fill="none" stroke={`url(#edge-${gid})`} strokeWidth="2" />
        </svg>

        <h2 className="relative font-display text-[19px] leading-6 font-semibold tracking-[-0.02em]">{title}</h2>
        <ul className="relative mt-3 flex flex-wrap gap-1.5">
          {items.map((tech) => {
            const lit = hi !== null && icons[hi]?.logo === tech.logo;
            return (
              <li
                key={tech.name}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[12px] leading-5 whitespace-nowrap transition-colors duration-300",
                  lit
                    ? "border-foreground/35 bg-foreground/8 text-foreground"
                    : "border-foreground/10 bg-foreground/4 text-muted-foreground",
                )}>
                {tech.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
