"use client";

import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, AudioLines, Blocks, FileCode2, SearchCheck, Workflow } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { APPROACH } from "@/data/approach";
import { SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages as a stack of cards, like
 * passes in Apple Wallet. The current stage is the card in front; the next
 * ones sit behind it with their header strips showing above it, so the stack
 * says what comes next and the process reads at a glance.
 *
 * Flick the front card away (or Next, or →) and it tucks in at the back while
 * the next one comes forward; flick the other way (Back, ←) for the one
 * before. A peeking strip jumps straight to its stage. After the last stage
 * the stack carries on to the first, because review feeds the next
 * stakeholder call.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so stage five shares stage one's blue.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

/** The recorded call, the repo's rules, the architecture, the pipeline, the review. */
const ICONS = [AudioLines, FileCode2, Blocks, Workflow, SearchCheck] as const;
const N = APPROACH.length;
const mod = (n: number) => ((n % N) + N) % N;

/** Each card's header strip, which is what shows of the cards behind. */
const STRIP = 36;
/** How many cards behind the front one show their strip. */
const BEHIND = 3;

/** A throw this far, or this fast, sends the front card to the back. */
const THROW_PX = 90;
const THROW_V = 500;

/** A stage's icon as an Apple Settings tile: its hue, a white glyph. */
function StageIcon({ i }: { i: number }) {
  const Icon = ICONS[i];
  const h = hue(i);
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-[12px] shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]"
      // Deepened toward the bottom so the white glyph clears 3:1 even on the green.
      style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${h} 90%, #fff), color-mix(in srgb, ${h} 78%, #000))` }}>
      <Icon aria-hidden className="size-5 text-white" strokeWidth={2} />
    </span>
  );
}

function Card({
  i,
  depth,
  onThrow,
  onPick,
}: {
  i: number;
  /** 0 is the card in front; higher is further back. */
  depth: number;
  onThrow: (dir: 1 | -1) => void;
  onPick: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const s = APPROACH[i];
  const front = depth === 0;
  const shown = depth <= BEHIND;
  const d = Math.min(depth, BEHIND);

  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -THROW_PX || velocity.x < -THROW_V) onThrow(1);
    else if (offset.x > THROW_PX || velocity.x > THROW_V) onThrow(-1);
  };

  return (
    <motion.article
      aria-hidden={!front}
      inert={!front}
      initial={false}
      // Each card back sits one strip higher and a touch narrower, so its
      // header shows above the card in front of it.
      animate={{ y: -d * STRIP, scale: 1 - d * 0.04, opacity: shown ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : SNAPPY}
      drag={front && !reduced ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      style={{ zIndex: N - depth, "--step": hue(i) } as React.CSSProperties}
      className={cn(
        "absolute inset-0 flex origin-top flex-col overflow-hidden rounded-xl border",
        "border-[color-mix(in_srgb,var(--step)_30%,var(--rule))] bg-[color-mix(in_srgb,var(--step)_10%,var(--card))]",
        "shadow-[inset_0_1px_0_var(--glass-hi),0_-8px_24px_-12px_rgb(0_0_0/0.35),0_24px_48px_-24px_rgb(0_0_0/0.45)]",
        front ? "cursor-grab touch-pan-y active:cursor-grabbing" : "pointer-events-none",
      )}>
      {/* The header strip: all that shows of a card behind, like a pass in Wallet. */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-[color-mix(in_srgb,var(--step)_18%,transparent)] px-5 text-body-sm md:px-7"
        style={{ height: STRIP }}>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span> {s.stage}
        </span>
        <span aria-hidden className="size-2 rounded-full" style={{ background: hue(i) }} />
      </div>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-6 md:px-7 md:pt-6">
        <StageIcon i={i} />
        <h3 className="mt-4 font-display text-[22px] leading-[28px] font-semibold tracking-[-0.02em] text-balance md:text-[26px] md:leading-[32px]">
          {s.title}
        </h3>
        <p className="mt-2 max-w-[56ch] text-body-lg text-pretty text-muted-foreground">{s.body}</p>
      </div>

      {/* A card behind is picked by its strip. */}
      {!front && shown && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onPick}
          aria-label={`Go to step ${i + 1}: ${s.title}`}
          className="pointer-events-auto absolute inset-x-0 top-0 cursor-pointer"
          style={{ height: STRIP }}
        />
      )}
    </motion.article>
  );
}

export function ApproachSection() {
  /** Unbounded, so the stack keeps cycling the same way through the loop. */
  const [pos, setPos] = useState(0);
  const step = mod(pos);
  const go = (by: number) => setPos((p) => p + by);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
        else return;
        e.preventDefault();
      }}
      className="mx-auto w-full max-w-[640px]">
      {/* Room above the front card for the strips of the cards behind it. */}
      <div style={{ paddingTop: BEHIND * STRIP }} aria-live="polite">
        <div className="relative h-[310px] md:h-[252px]">
          {APPROACH.map((s, i) => (
            <Card key={s.title} i={i} depth={mod(i - pos)} onThrow={go} onPick={() => go(mod(i - pos))} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="group" aria-label="Steps">
          {APPROACH.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-current={i === step ? "step" : undefined}
              onClick={() => go(mod(i - pos))}
              // A 24px hit area around a 6px dot.
              className="group grid h-6 cursor-pointer place-items-center px-0.5 focus-visible:outline-2 focus-visible:outline-foreground">
              <motion.span
                aria-hidden
                initial={false}
                animate={{ width: i === step ? 20 : 6 }}
                transition={SNAPPY}
                className={cn(
                  "block h-1.5 rounded-full transition-colors",
                  i === step ? "bg-foreground" : "bg-foreground/20 group-hover:bg-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="pill-sm"
            onClick={() => go(-1)}
            className="rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden />
            Back
          </Button>
          <Button variant="pill" size="pill-sm" onClick={() => go(1)}>
            Next
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApproachSection;
