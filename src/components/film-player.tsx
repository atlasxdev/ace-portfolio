"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import type { Film } from "@/components/film-fan";
import { SNAPPY, SPRING } from "@/lib/motion";

const CONTROL =
  "grid size-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** A box in viewport coordinates, untouched by any transform on it. */
type Box = { cx: number; cy: number; w: number };
const boxOf = (r: DOMRect): Box => ({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width });

/**
 * The films full size, grown out of the card that was playing.
 *
 * Opening measures the front card and the player's frame, starts the frame
 * transformed to sit exactly over the card, and springs it to full size, like
 * an app opening on iOS. Closing does the reverse into whichever card is in
 * front by then, since moving between films here swings the fan behind it
 * too. Plays from the start with sound, as opening it is the visitor asking to
 * watch. Arrows, the arrow keys or a swipe on the caption move between films.
 */
export function FilmPlayer({
  films,
  index,
  onIndex,
  origin,
  onClosed,
}: {
  films: Film[];
  index: number;
  onIndex: (i: number) => void;
  /** The front card's box right now, to grow from and shrink back into. */
  origin: () => DOMRect | null;
  onClosed: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const fade = useMotionValue(0);
  const closing = useRef(false);
  const [dir, setDir] = useState(1);
  const film = films[index];
  const external = film.link?.href.startsWith("http");

  /** The transform that lays the frame over a box. */
  const over = (to: Box) => {
    const el = frame.current!;
    // offset* ignore transforms, so this is the frame's resting place.
    const self: Box = { cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2, w: el.offsetWidth };
    return { x: to.cx - self.cx, y: to.cy - self.cy, scale: to.w / self.w };
  };

  /*
   * The dialog portals in a beat after this component mounts, so the opening
   * runs when the frame itself attaches: still before the first paint, so it
   * never flashes at full size.
   */
  const opened = useRef(false);
  const attach = (el: HTMLDivElement | null) => {
    frame.current = el;
    if (!el || opened.current) return;
    opened.current = true;
    const from = origin();
    if (from && !reduced) {
      const t = over(boxOf(from));
      x.set(t.x);
      y.set(t.y);
      scale.set(t.scale);
      animate(x, 0, SPRING);
      animate(y, 0, SPRING);
      animate(scale, 1, SPRING);
    }
    animate(fade, 1, { duration: reduced ? 0 : 0.2 });
  };

  const close = async () => {
    if (closing.current) return;
    closing.current = true;
    const to = origin();
    const runs = [animate(fade, 0, { duration: reduced ? 0 : 0.22 })];
    if (to && !reduced) {
      const t = over(boxOf(to));
      runs.push(animate(x, t.x, SPRING), animate(y, t.y, SPRING), animate(scale, t.scale, SPRING));
    }
    await Promise.all(runs);
    onClosed();
  };

  const go = (to: number) => {
    if (to < 0 || to >= films.length || to === index) return;
    setDir(to > index ? 1 : -1);
    onIndex(to);
  };

  return (
    <DialogPrimitive.Root open onOpenChange={(next) => !next && close()}>
      <DialogPrimitive.Portal>
        <motion.div aria-hidden style={{ opacity: fade }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(index + 1);
            else if (e.key === "ArrowLeft") go(index - 1);
            else return;
            e.preventDefault();
          }}
          // The content fills the screen, so a click on its empty space is the
          // click outside.
          onClick={(e) => e.target === e.currentTarget && close()}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 outline-none md:p-10">
          <motion.button
            type="button"
            onClick={close}
            aria-label="Close"
            style={{ opacity: fade }}
            className={`absolute top-4 right-4 md:top-6 md:right-6 ${CONTROL}`}>
            <XIcon className="size-4" aria-hidden />
          </motion.button>

          {/* Width from the height left after the caption, so the film never
              overflows a short window. */}
          <div className="w-full" style={{ maxWidth: "min(1100px, calc((100dvh - 15rem) * 16 / 9))" }}>
            <motion.div
              ref={attach}
              style={{ x, y, scale }}
              className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.video
                  key={film.src}
                  src={film.src}
                  poster={film.poster}
                  autoPlay
                  controls
                  playsInline
                  aria-label={`${film.title}: launch film`}
                  custom={dir}
                  variants={{
                    in: (d: number) => ({ opacity: 0, x: reduced ? 0 : `${d * 8}%` }),
                    shown: { opacity: 1, x: 0 },
                    out: (d: number) => ({ opacity: 0, x: reduced ? 0 : `${d * -8}%` }),
                  }}
                  initial="in"
                  animate="shown"
                  exit="out"
                  transition={reduced ? { duration: 0 } : SNAPPY}
                  className="absolute inset-0 size-full"
                />
              </AnimatePresence>
            </motion.div>

            <motion.div
              style={{ opacity: fade }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              dragSnapToOrigin
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -400) go(index + 1);
                else if (offset.x > 50 || velocity.x > 400) go(index - 1);
              }}
              className="mt-5 flex touch-pan-y flex-col gap-4 text-white sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0" aria-live="polite">
                <DialogPrimitive.Title className="text-h3 font-semibold tracking-[-0.01em]">{film.title}</DialogPrimitive.Title>
                <p className="mt-1.5 max-w-[62ch] text-body-sm text-white/65">{film.blurb}</p>
                {film.link && (
                  <Link
                    href={film.link.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group mt-3 inline-flex items-center gap-1 text-body-sm text-white/80 transition-colors hover:text-white">
                    {film.link.type}
                    <ArrowUpRight
                      className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                      aria-hidden
                    />
                  </Link>
                )}
              </div>
              {films.length > 1 && (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="mr-1 text-body-sm text-white/50 tabular-nums">
                    {index + 1} / {films.length}
                  </span>
                  <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous film" className={CONTROL}>
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    disabled={index === films.length - 1}
                    aria-label="Next film"
                    className={CONTROL}>
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
