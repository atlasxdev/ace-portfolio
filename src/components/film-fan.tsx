"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProjectVideo } from "@/components/project-video";

export type Film = {
  title: string;
  src: string;
  poster: string;
  blurb: string;
  link?: { type: string; href: string };
};

/*
 * Where each card sits, as a share of the stage's width. The front card plays;
 * the others are posters fanned behind it, alternating right then left.
 * `left` moves the card's centre; translate(-50%) keeps it centred on that.
 */
const FRONT = { left: 50, z: 30 };
const SIDE = (n: number) => {
  const dir = n % 2 ? 1 : -1; // 1st other card right, 2nd left, ...
  const ring = Math.ceil(n / 2);
  return { left: 50 + dir * 17 * ring, rotate: dir * 8 * ring, z: 20 - ring };
};

/** Sent by Ag's "Show me" (detail: a project title) to bring that film forward. */
export const SHOW_FILM = "ag:show-film";
/** How long a card takes to swing to the front, so Ag lands once it's there. */
export const SWING_MS = 500;

export function FilmFan({ films }: { films: Film[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const show = (e: Event) => {
      const i = films.findIndex((f) => f.title === (e as CustomEvent<string>).detail);
      if (i >= 0) setActive(i);
    };
    window.addEventListener(SHOW_FILM, show);
    return () => window.removeEventListener(SHOW_FILM, show);
  }, [films]);
  const film = films[active];
  const external = film.link?.href.startsWith("http");

  return (
    <div>
      {/* Stage: tall enough for the front card plus the tilt of the others. */}
      <div className="relative aspect-[100/46] w-full overflow-x-clip md:aspect-[100/28]">
        {films.map((f, i) => {
          const n = (i - active + films.length) % films.length; // 0 = front
          const side = SIDE(n);
          const front = n === 0;
          return (
            <div
              key={f.title}
              data-project={f.title}
              data-film
              className={cn(
                "absolute top-1/2 transition-[left,width,transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
                front ? "w-[64%] md:w-[38%]" : "w-[44%] md:w-[26%]",
              )}
              style={{
                left: `${front ? FRONT.left : side.left}%`,
                zIndex: front ? FRONT.z : side.z,
                transform: `translate(-50%, -50%) rotate(${front ? 0 : side.rotate}deg)`,
              }}
            >
              {front ? (
                <div className="shadow-2xl shadow-black/15 rounded-lg">
                  <ProjectVideo key={f.src} src={f.src} poster={f.poster} title={f.title} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show the ${f.title} film`}
                  className="group block w-full overflow-hidden rounded-lg border border-rule bg-muted shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a poster behind the front card; next/image adds nothing here */}
                  <img
                    src={f.poster}
                    alt=""
                    loading="lazy"
                    className="block aspect-video w-full object-cover mask-b-from-40% opacity-90 transition-opacity group-hover:opacity-100"
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* The front film's caption. */}
      <div className="mx-auto mt-group max-w-[60ch] text-center" aria-live="polite">
        <h3 className="text-h3 font-semibold tracking-[-0.01em]">{film.title}</h3>
        <p className="mt-2 text-body-sm leading-5 text-muted-foreground">{film.blurb}</p>
        {/* Same height with or without a link, so swapping films doesn't shift the page. */}
        {!film.link && <span className="label mt-4 inline-block invisible" aria-hidden>&nbsp;</span>}
        {film.link && (
          <Link
            href={film.link.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="label group mt-4 inline-flex items-center gap-1 text-ink-faint transition-colors hover:text-foreground"
          >
            {film.link.type}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              aria-hidden
            />
          </Link>
        )}
        {films.length > 1 && (
          <div className="mt-group flex justify-center gap-2">
            {films.map((f, i) => (
              <button
                key={f.title}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show the ${f.title} film`}
                aria-current={i === active}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  i === active ? "w-6 bg-foreground" : "w-1.5 bg-rule hover:bg-ink-faint",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
