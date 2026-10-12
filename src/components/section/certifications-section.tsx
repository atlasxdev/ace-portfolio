"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { DATA } from "@/data/resume";

/**
 * Certifications as a fanned stack: the selected card stands upright in the
 * middle, the rest tilt out behind it. Clicking a card (or using the arrow
 * keys) brings it forward. Each card carries its own details; the credential
 * link sits under the fan, since a link can't live inside the card's button —
 * and a certification is a claim someone else can verify.
 *
 * Cards are a dark plate in both themes: most issuer marks are white-only
 * wordmarks (Codebility, freeCodeCamp, MongoDB) that vanish on a light ground.
 * Marks are contained in one box, so square ones fill its height and wide
 * wordmarks fill its width.
 *
 * Offsets are percentages of the card's own width. Phones get a tighter fan so
 * the outer cards stay inside the gutter.
 */
const OFFSET_DESKTOP = [0, 58, 100];
const OFFSET_MOBILE = [0, 40, 70];
const ROTATE = 9;
const SCALE_STEP = 0.12;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function CertificationsSection() {
  const certs = DATA.certifications;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const offset = useIsDesktop() ? OFFSET_DESKTOP : OFFSET_MOBILE;
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
        className="relative flex h-56 w-full items-center justify-center md:h-96"
      >
        {certs.map((c, i) => {
          // Wrap around so the fan stays balanced: with five cards, two always
          // sit on each side of the selected one.
          const n = certs.length;
          const half = Math.floor(n / 2);
          const d = ((i - active + n + half) % n) - half;
          const dist = Math.min(Math.abs(d), offset.length - 1);
          const sign = Math.sign(d);
          return (
            <motion.button
              key={c.title}
              type="button"
              aria-label={`${c.title}, ${c.issuer}, ${c.date}`}
              aria-pressed={d === 0}
              tabIndex={d === 0 ? 0 : -1}
              onClick={() => setActive(i)}
              initial={false}
              animate={{
                x: `${sign * offset[dist]}%`,
                rotate: sign * dist * ROTATE,
                scale: 1 - dist * SCALE_STEP,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 28 }
              }
              style={{ zIndex: 10 - dist }}
              className="absolute rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <div
                className={`flex h-48 w-36 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-xl transition-[filter] duration-300 md:h-80 md:w-64 dark:shadow-black ${
                  d === 0 ? "" : "brightness-75 hover:brightness-100"
                }`}
              >
                <div className="grid flex-1 place-items-center">
                  {c.logoUrl ? (
                    <div className="relative h-9 w-3/5 md:h-14">
                      <Image
                        src={c.logoUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 154px, 86px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="font-display text-3xl font-semibold text-white/70">
                      {c.issuer.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="border-t border-white/10 px-3 py-2.5 md:px-5 md:py-4">
                  <p className="line-clamp-2 text-[11px] leading-snug font-semibold tracking-[-0.01em] text-white md:text-[15px]">
                    {c.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-white/55 md:mt-1 md:text-[13px]">
                    {c.issuer}, {c.date}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 min-h-10">
        {cert.credentialUrl ? (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Verify ${cert.title}`}
            className="label group inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Verify credential
            <ArrowUpRight
              className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              aria-hidden
            />
          </a>
        ) : (
          <p className="label text-ink-faint">Credential on request</p>
        )}
      </div>
    </div>
  );
}

export default CertificationsSection;
