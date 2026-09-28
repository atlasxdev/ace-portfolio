"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { ChevronDown, FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { useOpeningReady } from "@/components/motion/opening";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { APPROACH } from "@/data/approach";
import { EASE, inViewOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages as a lifecycle, drawn as a
 * ring, beside a collapsible list that carries the words.
 *
 * A ring rather than a row because the stages loop — review feeds the next
 * stakeholder call — and a line that ends at step five says the opposite. The
 * 5 → 1 arc is dashed to mark it as the return, not another step.
 *
 * The ring is a diagram, not a second copy of the list: no numbers and no
 * titles on it. The arrows give the order and the list gives the numbers.
 * Clicking a node opens its row, and the open row lights its node, so the two
 * read as one control.
 *
 * The list is an accordion with one row open at a time. Five sentences side by
 * side with the ring made the section tall, and on a phone it ran to a full
 * screen of text; one open row keeps it to the ring plus five titles.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so step five shares step one's blue — fitting for the step
 * that hands back to the start.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;

/** The ring's own coordinate space. It scales as a whole with the dial. */
const SIZE = 340;
const C = SIZE / 2;
const R = 124;
/** Node radius in the same space, plus clearance, sets where each arc stops. */
const NODE = 24;
const ARC_GAP = ((NODE + 7) / R) * (180 / Math.PI);

const rad = (d: number) => (d * Math.PI) / 180;
/** Rounded: Node and the browser disagree in the last float digit of the trig,
 *  and an unrounded coordinate fails hydration. */
const round = (n: number) => Math.round(n * 100) / 100;
const at = (r: number, deg: number) =>
  [round(C + r * Math.cos(rad(deg))), round(C + r * Math.sin(rad(deg)))] as const;
/** Step i's angle: step one at twelve o'clock, clockwise from there. */
const angle = (i: number) => -90 + (360 / APPROACH.length) * i;
const pct = (v: number) => `${(v / SIZE) * 100}%`;

const ARCS = APPROACH.map((_, i) => {
  const a1 = angle(i) + ARC_GAP;
  const a2 = angle(i + 1) - ARC_GAP;
  const [x1, y1] = at(R, a1);
  const [x2, y2] = at(R, a2);
  // Chevron at the arc's end, opening back along the tangent.
  const [ax, ay] = [x2, y2];
  const t = a2 + 90;
  const k = 5;
  const back = [round(-Math.cos(rad(t)) * k), round(-Math.sin(rad(t)) * k)];
  const side = [round(Math.cos(rad(a2)) * k * 0.8), round(Math.sin(rad(a2)) * k * 0.8)];
  return {
    d: `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`,
    head: `M${ax + back[0] + side[0]} ${ay + back[1] + side[1]} L${ax} ${ay} L${ax + back[0] - side[0]} ${ay + back[1] - side[1]}`,
    loop: i === APPROACH.length - 1,
  };
});

/** Tick marks on an outer scale, a longer one every fifth. */
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const long = i % 12 === 0;
  const [x1, y1] = at(R + 16, i * 6 - 90);
  const [x2, y2] = at(R + 16 + (long ? 7 : 3), i * 6 - 90);
  return { x1, y1, x2, y2, long };
});

const LOOP_NOTE = at(R + 34, -126);

function Dial({ open, onSelect, play }: { open: string; onSelect: (v: string) => void; play: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const on = play || reduced;

  return (
    <div className="relative mx-auto aspect-square w-[230px] md:w-[300px] lg:w-[340px]">
      {/* Drafting grid, reaching past the ring and fading out beyond it. */}
      <div
        aria-hidden
        className="absolute -inset-[30%] rounded-full [background-image:linear-gradient(color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-position:center] [background-size:3.125%_3.125%] [mask-image:radial-gradient(circle,#000_38%,transparent_70%)]"
      />

      <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full overflow-visible" fill="none">
        <circle cx={C} cy={C} r={R} className="stroke-rule" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {TICKS.map(({ long, ...line }, i) => (
          <line
            key={i}
            {...line}
            className={long ? "stroke-foreground/30" : "stroke-foreground/14"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {ARCS.map((arc, i) => {
          const delay = i * 0.18;
          const active = open === String(i) || open === String((i + 1) % APPROACH.length);
          return (
            <g key={i} stroke={hue(i)} strokeLinecap="round" strokeLinejoin="round">
              {/* Solid arcs draw on; the dashed return can't (pathLength and a
                  dash pattern both drive stroke-dasharray), so it fades in. */}
              {arc.loop ? (
                <motion.path
                  d={arc.d}
                  strokeWidth={1.5}
                  strokeDasharray="3 4"
                  initial={{ opacity: reduced ? 0.7 : 0 }}
                  animate={{ opacity: on ? 0.7 : 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay }}
                />
              ) : (
                <motion.path
                  d={arc.d}
                  strokeWidth={active ? 2 : 1.5}
                  initial={{ pathLength: reduced ? 1 : 0, opacity: 0.85 }}
                  animate={{ pathLength: on ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay }}
                />
              )}
              <motion.path
                d={arc.head}
                strokeWidth={1.5}
                initial={{ opacity: reduced ? 1 : 0 }}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: delay + 0.45 }}
              />
            </g>
          );
        })}
      </svg>

      {/* overflow-hidden: .glass's top-sheen ::before is a rounded rect, and
          on a circle its corners poke out past the rim. */}
      <div className="glass absolute top-1/2 left-1/2 grid size-[39%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full text-center">
        <div>
          <span className="label text-[9.5px] text-ink-faint">Lifecycle</span>
          <p className="mt-1 font-display text-[12.5px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[15px] lg:text-[17px]">
            Ship, learn,
            <br />
            repeat
          </p>
        </div>
      </div>

      {APPROACH.map((step, i) => {
        const Icon = ICONS[i];
        const [x, y] = at(R, angle(i));
        return (
          <button
            key={step.title}
            type="button"
            aria-label={`Step ${i + 1}: ${step.title}`}
            aria-pressed={open === String(i)}
            data-active={open === String(i) || undefined}
            onClick={() => onSelect(String(i))}
            className="step-badge absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--step) lg:size-12"
            style={{ left: pct(x), top: pct(y), "--step": hue(i) } as React.CSSProperties}>
            <Icon className="size-4 lg:size-[18px]" strokeWidth={1.75} />
          </button>
        );
      })}

      <span
        aria-hidden
        className="label absolute hidden -translate-x-[70%] -translate-y-full text-[9.5px] whitespace-nowrap text-ink-faint md:block"
        style={{ left: pct(LOOP_NOTE[0]), top: pct(LOOP_NOTE[1]) }}>
        ↺ Next iteration
      </span>
    </div>
  );
}

export function ApproachSection() {
  const openingReady = useOpeningReady();
  const band = useRef<HTMLDivElement>(null);
  const inView = useInView(band, inViewOnce);
  const [open, setOpen] = useState("0");

  return (
    <div
      ref={band}
      className="flex flex-col items-center gap-group lg:grid lg:grid-cols-[340px_minmax(0,560px)] lg:justify-center lg:gap-14">
      <Reveal kind="fade">
        <Dial open={open} onSelect={setOpen} play={openingReady && inView} />
      </Reveal>

      <Reveal delay={0.1} className="w-full">
        <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="glass w-full overflow-hidden">
          {APPROACH.map((step, i) => (
            <AccordionItem
              key={step.title}
              value={String(i)}
              style={{ "--step": hue(i) } as React.CSSProperties}
              className="border-b-0 transition-colors not-first:border-t not-first:border-foreground/9 data-[state=open]:bg-[color-mix(in_srgb,var(--step)_5%,transparent)]">
              <AccordionTrigger className="cursor-pointer gap-3 px-4 py-3.5 hover:no-underline md:px-5">
                <span className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-4">
                  <span className="label w-[92px] shrink-0 text-[10px] text-ink-faint">
                    <span className="text-foreground">{String(i + 1).padStart(2, "0")}</span> {step.stage}
                  </span>
                  <span className="text-[14px] leading-snug font-semibold tracking-[-0.01em]">{step.title}</span>
                </span>
                <ChevronDown aria-hidden className="size-3.5 shrink-0 text-ink-faint transition-transform duration-300" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-body-sm leading-[1.6] text-muted-foreground md:pr-5 md:pl-[calc(20px+92px+16px)]">
                {step.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  );
}

export default ApproachSection;
