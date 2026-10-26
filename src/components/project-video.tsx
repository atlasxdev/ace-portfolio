"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Maximize2, Play, Volume2, VolumeX } from "lucide-react";

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/*
 * Phones get a 540p copy (`<name>-540p.mp4`, made by the /video render
 * scripts): the 1080p master is full-range yuvj420p, which many phone decoders
 * hand to software, and it's far more pixels than the card shows. The
 * full-size player always plays the master.
 */
const PHONE = "(max-width: 767px)";
const mobileSrc = (src: string) => src.replace(/\.mp4$/, "-540p.mp4");

const CONTROL =
  "grid size-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * A project's launch film (built in /video with Remotion).
 *
 * Muted and looping, it plays only while it's on screen and loads nothing
 * until then (`preload="none"` behind the poster). With reduced motion it
 * never starts on its own: the poster shows with a play button instead.
 * Browsers block autoplay with sound, so audio is opt-in.
 *
 * Expand hands off to the full-size player (see FilmPlayer). The inline copy
 * pauses while that's open and picks up again on close.
 */
export function ProjectVideo({
  src,
  poster,
  title,
  onExpand,
  suspended = false,
}: {
  src: string;
  poster: string;
  title: string;
  onExpand: () => void;
  /** The full-size player is open: stay paused. */
  suspended?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const still = reduced && !started;

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    if (suspended) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced, suspended]);

  function start() {
    setStarted(true);
    ref.current?.play().catch(() => {});
  }

  function toggleSound() {
    const video = ref.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
    if (video.paused) start();
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-rule bg-muted">
      <video
        ref={ref}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        aria-label={`${title}: launch film`}
        className="block aspect-video w-full"
      >
        <source src={mobileSrc(src)} type="video/mp4" media={PHONE} />
        <source src={src} type="video/mp4" />
      </video>
      {still && (
        <button
          type="button"
          onClick={start}
          aria-label={`Play the ${title} film`}
          className="absolute inset-0 grid place-items-center bg-black/10 transition-colors hover:bg-black/20 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground"
        >
          <span className="grid size-14 place-items-center rounded-full bg-background/90 text-foreground shadow-sm">
            <Play className="size-5 translate-x-px" aria-hidden />
          </span>
        </button>
      )}

      <div className="absolute right-3 bottom-3 flex gap-2">
        {!still && (
          <button type="button" onClick={toggleSound} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted} className={CONTROL}>
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          </button>
        )}
        <button type="button" onClick={onExpand} aria-label={`Watch the ${title} film full size`} className={CONTROL}>
          <Maximize2 className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
