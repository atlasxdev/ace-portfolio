"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import type { Film } from "@/components/film-fan";
import { SPRING } from "@/lib/motion";

/*
 * Phones get the 540p copy (`<name>-540p.mp4`, made by the /video render
 * scripts): the 1080p master is full-range yuvj420p, which many phone decoders
 * hand to software, and the frame on a phone is far smaller than 1080p anyway.
 */
const PHONE = "(max-width: 767px)";
const phoneSrc = (src: string) => src.replace(/.mp4$/, "-540p.mp4");

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
  /** The film only mounts once the frame has finished growing, so decoding
   *  never competes with the opening animation for the same frames. */
  const [ready, setReady] = useState(false);
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
      animate(scale, 1, SPRING).then(() => setReady(true));
    } else {
      setReady(true);
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
    onIndex(to);
  };

  return (
    <DialogPrimitive.Root open onOpenChange={(next) => !next && close()}>
      <DialogPrimitive.Portal>
        {/* Solid, not blurred: a backdrop blur over the whole page, fading in,
            is re-rendered every frame and was what made opening stutter. */}
        <motion.div aria-hidden style={{ opacity: fade }} className="fixed inset-0 z-[60] bg-black/90" />
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
              {/* While growing it is just the poster, already loaded from the
                  card; between films a quick cross-fade, one film at a time. */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={film.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.15 }}
                  className="absolute inset-0">
                  {ready ? (
                    <video
                      poster={film.poster}
                      autoPlay
                      controls
                      playsInline
                      preload="auto"
                      aria-label={`${film.title}: launch film`}
                      className="size-full">
                      <source src={phoneSrc(film.src)} type="video/mp4" media={PHONE} />
                      <source src={film.src} type="video/mp4" />
                    </video>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- the card's own poster, already cached
                    <img src={film.poster} alt="" className="size-full object-cover" />
                  )}
                </motion.div>
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
