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
 * Each card is drawn as the certificate itself: landscape, a gold double rule
 * for a frame, the issuer's mark at the head, the recipient and course in the
 * middle, and the date and issuer signed off on lines either side of a foil
 * seal. The paper is dark in both themes: most issuer marks are white-only
 * wordmarks (Codebility, freeCodeCamp, MongoDB) that vanish on a light sheet.
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

/** A foil seal: a scalloped rosette with a check, in the frame's gold. */
function Seal() {
  const points = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 21 : 24;
    // Rounded so the server and browser agree to the last digit.
    return `${Math.round((24 + r * Math.cos(a)) * 100) / 100},${Math.round((24 + r * Math.sin(a)) * 100) / 100}`;
  }).join(" ");
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-7 shrink-0 drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)] md:size-12">
      <defs>
        <linearGradient id="cert-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d79a" />
          <stop offset=".5" stopColor="#c69a4c" />
          <stop offset="1" stopColor="#8f6a2c" />
        </linearGradient>
      </defs>
      <polygon points={points} fill="url(#cert-foil)" />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#7a5822" strokeOpacity=".55" strokeWidth=".8" />
      <path d="M17.5 24.5l4.5 4.5 8.5-9.5" fill="none" stroke="#5b3f12" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
              className="absolute rounded-[6px]"
            >
              <div
                className={`cert relative h-[198px] w-[280px] overflow-hidden rounded-[6px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.7)] transition-[filter] duration-300 md:h-[297px] md:w-[420px] ${
                  d === 0 ? "" : "brightness-[0.6] hover:brightness-90"
                }`}
              >
                {/* The double rule every certificate is framed by. */}
                <div aria-hidden className="cert-frame pointer-events-none absolute inset-[6px] rounded-[3px] md:inset-[10px]" />
                <div aria-hidden className="cert-frame-inner pointer-events-none absolute inset-[9px] rounded-[2px] md:inset-[15px]" />

                <div className="relative flex h-full flex-col items-center px-5 pt-4 pb-3 text-center md:px-10 md:pt-8 md:pb-6">
                  {c.logoUrl ? (
                    <div className="relative h-4 w-20 md:h-7 md:w-32">
                      <Image src={c.logoUrl} alt="" fill sizes="(min-width: 768px) 128px, 80px" className="object-contain" />
                    </div>
                  ) : (
                    <span className="font-display text-sm font-semibold text-white/70">{c.issuer}</span>
                  )}

                  <p className="cert-gold mt-2 text-[7px] font-medium tracking-[0.28em] uppercase md:mt-4 md:text-[10px]">
                    Certificate of completion
                  </p>
                  <p className="mt-2.5 hidden text-[11px] text-white/45 italic md:block">This certifies that</p>
                  <p className="mt-1.5 font-display text-[16px] leading-tight font-semibold tracking-[-0.02em] text-white md:mt-1 md:text-[26px]">
                    {DATA.name}
                  </p>
                  <p className="mt-1.5 hidden text-[11px] text-white/45 italic md:block">has completed</p>
                  <p className="mt-0.5 line-clamp-2 max-w-[30ch] text-[9px] leading-snug font-semibold text-white/90 md:mt-1 md:text-[15px]">
                    {c.title}
                  </p>

                  <div className="mt-auto flex w-full items-end justify-between gap-2">
                    {/* Signed off on lines either side of the seal, as a certificate is. */}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[7px] text-white/80 md:text-[11px]">{c.date}</p>
                      <p className="cert-rule mt-0.5 border-t pt-0.5 text-[6px] tracking-[0.18em] text-white/40 uppercase md:mt-1 md:pt-1 md:text-[8.5px]">
                        Date
                      </p>
                    </div>
                    <Seal />
                    <div className="min-w-0 flex-1 text-right">
                      {c.credentialUrl ? (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Verify ${c.title}`}
                          tabIndex={d === 0 ? 0 : -1}
                          className={`group/verify relative z-10 inline-flex items-center gap-0.5 text-[7px] text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:gap-1 md:text-[11px] ${
                            d === 0 ? "" : "pointer-events-none"
                          }`}
                        >
                          Verify
                          <ArrowUpRight
                            className="size-2 transition-transform group-hover/verify:-translate-y-px group-hover/verify:translate-x-px md:size-3"
                            aria-hidden
                          />
                        </a>
                      ) : (
                        <p className="text-[7px] text-white/50 md:text-[11px]">On request</p>
                      )}
                      <p className="cert-rule mt-0.5 truncate border-t pt-0.5 text-[6px] tracking-[0.18em] text-white/40 uppercase md:mt-1 md:pt-1 md:text-[8.5px]">
                        {c.issuer}
                      </p>
                    </div>
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
                  className="absolute inset-0 rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
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
