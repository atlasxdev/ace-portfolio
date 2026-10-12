"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { DATA } from "@/data/resume";

/**
 * Certifications as a fanned stack: the selected card stands upright in the
 * middle, the rest tilt out behind it. Clicking a card (or using the arrow
 * keys) brings it forward, and its details — with the credential link, since
 * a certification is a claim someone else can verify — show underneath.
 *
 * Card faces are the issuer's mark on a dark plate: most of them are white-only
 * wordmarks (Codebility, freeCodeCamp, MongoDB) that vanish on a light ground,
 * so the plate stays dark in both themes. Marks are contained in one box, so
 * square ones fill its height and wide wordmarks fill its width.
 *
 * Offsets are percentages of the card's own width, so the fan keeps its shape
 * at both card sizes and the outer cards stay inside a phone's gutter.
 */
const OFFSET = [0, 58, 100];
const ROTATE = 9;
const SCALE_STEP = 0.12;

export function CertificationsSection() {
  const certs = DATA.certifications;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const cert = certs[active];

  const step = (dir: 1 | -1) =>
    setActive((i) => (i + dir + certs.length) % certs.length);

  return (
    <div className="flex flex-col items-center">
      <div
        role="group"
        aria-label="Certifications"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
          else return;
          e.preventDefault();
        }}
        className="relative flex h-44 w-full items-center justify-center md:h-80"
      >
        {certs.map((c, i) => {
          // Wrap around so the fan stays balanced: with five cards, two always
          // sit on each side of the selected one.
          const n = certs.length;
          const half = Math.floor(n / 2);
          const d = ((i - active + n + half) % n) - half;
          const dist = Math.min(Math.abs(d), OFFSET.length - 1);
          const sign = Math.sign(d);
          return (
            <motion.button
              key={c.title}
              type="button"
              aria-label={`${c.title}, ${c.issuer}`}
              aria-pressed={d === 0}
              tabIndex={d === 0 ? 0 : -1}
              onClick={() => setActive(i)}
              initial={false}
              animate={{
                x: `${sign * OFFSET[dist]}%`,
                rotate: sign * dist * ROTATE,
                scale: 1 - dist * SCALE_STEP,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 28 }
              }
              style={{ zIndex: 10 - dist }}
              className="absolute rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <div
                className={`relative grid size-28 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-xl transition-[filter] duration-300 md:size-64 dark:shadow-black ${
                  d === 0 ? "" : "brightness-75 hover:brightness-100"
                }`}
              >
                {c.logoUrl ? (
                  <div className="relative h-1/5 w-3/5">
                    <Image
                      src={c.logoUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 154px, 68px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="font-display text-3xl font-semibold text-white/70">
                    {c.issuer.charAt(0)}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-8 min-h-24 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cert.title}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="text-base leading-snug font-semibold tracking-[-0.01em]">
              {cert.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {cert.issuer}, {cert.date}
            </p>
            {cert.credentialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label group mt-4 inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Verify
                <ArrowUpRight
                  className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  aria-hidden
                />
              </a>
            ) : (
              <p className="label mt-4 text-ink-faint">Credential on request</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CertificationsSection;
