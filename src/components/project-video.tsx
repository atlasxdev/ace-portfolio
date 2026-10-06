"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Maximize2, Play, Volume2, VolumeX, XIcon } from "lucide-react";

import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

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
 * full-size dialog always plays the master.
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
 * Expand opens the film in a dialog over a blurred page, from the start and
 * with sound, since opening it is the visitor asking to watch. The inline copy
 * pauses meanwhile and picks up again on close.
 */
export function ProjectVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const resumeInline = useRef(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const still = reduced && !started;

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced || open) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced, open]);

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

  function onOpenChange(next: boolean) {
    const video = ref.current;
    if (next && video) {
      resumeInline.current = !video.paused;
      video.pause();
    }
    if (!next && video && resumeInline.current) video.play().catch(() => {});
    setOpen(next);
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
        <button type="button" onClick={() => onOpenChange(true)} aria-label={`Watch the ${title} film full size`} className={CONTROL}>
          <Maximize2 className="size-4" aria-hidden />
        </button>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="bg-black/55 backdrop-blur-md" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-[60] w-[min(92vw,calc(82dvh*16/9))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-black shadow-2xl duration-200 focus:outline-none"
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <video src={src} poster={poster} autoPlay controls playsInline className="block aspect-video w-full" />
            <DialogPrimitive.Close aria-label="Close" className={`absolute top-3 right-3 ${CONTROL}`}>
              <XIcon className="size-4" aria-hidden />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
