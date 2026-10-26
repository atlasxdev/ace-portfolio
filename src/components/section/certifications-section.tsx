"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { SNAPPY } from "@/lib/motion";

import { DATA } from "@/data/resume";

/**
 * Certifications as a fanned stack: the selected card stands upright in the
 * middle, the rest tilt out behind it. Clicking a card (or using the arrow
 * keys) brings it forward. Each card carries its own details and Verify link —
 * a certification is a claim someone else can verify.
 *
 * Each card is laid out like the certificate it stands for, and no more:
 * landscape, one hairline inset frame, the issuer's mark at the head, the
 * course as the headline, and the issuer and date on a rule at the foot. The
 * plate is dark in both themes: most issuer marks are white-only wordmarks
 * (Codebility, freeCodeCamp, MongoDB) that vanish on a light ground.
 *
 * Offsets are percentages of the card's own width. Phones get a tighter fan so
 * the outer cards stay inside the gutter.
 */
const OFFSET_DESKTOP = [0, 36, 64];
const OFFSET_MOBILE = [0, 14, 26];
const ROTATE = 6;
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
        className="relative flex h-[250px] w-full items-center justify-center md:h-[380px]"
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
            <motion.div
              key={c.title}
              initial={false}
              animate={{
                x: `${sign * offset[dist]}%`,
                rotate: sign * dist * ROTATE,
                scale: 1 - dist * SCALE_STEP,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : SNAPPY
              }
              style={{ zIndex: 10 - dist }}
              className="absolute rounded-xl"
            >
              <div
                className={`relative h-[198px] w-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-xl transition-[filter] duration-300 md:h-[297px] md:w-[420px] dark:shadow-black ${
                  d === 0 ? "" : "brightness-75 hover:brightness-100"
                }`}
              >
                {/* One hairline inset frame: the only nod to the printed sheet. */}
                <div aria-hidden className="pointer-events-none absolute inset-2 rounded-lg border border-white/[0.07] md:inset-3" />

                <div className="relative flex h-full flex-col p-5 md:p-9">
                  <div className="flex items-start justify-between gap-4">
                    {c.logoUrl ? (
                      <div className="relative h-5 w-24 md:h-7 md:w-32">
                        <Image
                          src={c.logoUrl}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 128px, 96px"
                          className="object-contain object-left"
                        />
                      </div>
                    ) : (
                      <span className="font-display text-sm font-semibold text-white/70">{c.issuer}</span>
                    )}
                    <span className="text-[10px] text-white/40 md:text-[12px]">Certificate</span>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[10px] text-white/45 md:text-[12px]">Awarded to {DATA.name}</p>
                    <p className="mt-1 line-clamp-2 font-display text-[17px] leading-tight font-semibold tracking-[-0.02em] text-white md:mt-1.5 md:text-[26px]">
                      {c.title}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 md:mt-6 md:pt-4">
                    <p className="truncate text-[10px] text-white/55 md:text-[12.5px]">
                      {c.issuer}, {c.date}
                    </p>
                    {c.credentialUrl ? (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Verify ${c.title}`}
                        tabIndex={d === 0 ? 0 : -1}
                        className={`group/verify relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:px-3 md:text-[12px] ${
                          d === 0 ? "" : "pointer-events-none"
                        }`}
                      >
                        Verify
                        <ArrowUpRight
                          className="size-2.5 transition-transform group-hover/verify:-translate-y-px group-hover/verify:translate-x-px md:size-3"
                          aria-hidden
                        />
                      </a>
                    ) : (
                      <span className="shrink-0 text-[10px] text-white/40 md:text-[12px]">On request</span>
                    )}
                  </div>
                </div>

                {/* Selects the card. A sibling of the Verify link rather than a
                    wrapper, since a link can't sit inside a button. */}
                <button
                  type="button"
                  aria-label={`${c.title}, ${c.issuer}, ${c.date}`}
                  aria-pressed={d === 0}
                  tabIndex={d === 0 ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

export default CertificationsSection;
